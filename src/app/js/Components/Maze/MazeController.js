import _ from 'lodash';
import Animation from './Animation';
import Avatar from './Overlays/Avatar';
import Finish from './Overlays/Finish';
import Grid from './Grid';
import Start from './Overlays/Start';

export default class MazeController {

    constructor(mazeComponent, animationFrameTime, stateListenerCallback) {
        this._animationFrameTime = animationFrameTime;
        this._animationLastRenderTime = null;
        this._avatarAnimationSteps = [];
        this._avatars = [];
        this._draggedOverlay = null;
        this._finish = null;
        this._mazeLoaded = false;
        this._lastShortestPathFinish = null;
        this._lastShortestPathStart = null;
        this._grid = null;
        this._mazeComponent = mazeComponent;
        this._movementHasHappened = false;
        this._solutionPaths = [];
        this._start = null;
        this._stateListenerCallback = stateListenerCallback;
        this._storedAvatars = [];
        this._threadCounts = [];
        this._visitedCells = [];

        this._mazeComponent.setOnClickHandler(this.onMazeComponentClick.bind(this));
        this._mazeComponent.setOnDragStartedHandler(this.onMazeComponentDragStarted.bind(this));
        this._mazeComponent.setOnDragMoveHandler(this.onMazeComponentDragMove.bind(this));
        this._mazeComponent.setOnDragFinishedHandler(this.onMazeComponentDragFinished.bind(this));
    }

    addAvatar(avatar) {
        this._avatars.push(avatar);
    }

    animateAvatar(steps) {
        this._avatarAnimationSteps = steps;
        this._stateListenerCallback('PARALLEL_OPERATION_STARTED');
        window.requestAnimationFrame(this._animateFrame.bind(this));
    }

    decreaseThreadCount(cell) {
        let threadCountElement = _.find(this._threadCounts, {cell: cell});
        threadCountElement.count = Math.max(0, threadCountElement.count - 1);
    }

    draw() {
        if (this._mazeLoaded) {
            let startCell = this._start !== null ? this.locateAlignedOverlayCell(this._start) : this.locateAlignedOverlayCell(this.getInitialAvatar());
            let finishCell = this.locateAlignedOverlayCell(this._finish);

            if (startCell != this._lastShortestPathStart || finishCell != this._lastShortestPathFinish) {
                this._lastShortestPathStart = startCell;
                this._lastShortestPathFinish = finishCell;

                this._solutionPaths = this._grid.findShortestPaths(startCell, finishCell);
            }

            this._mazeComponent.draw(this._visitedCells, this._avatars, this._start, this._finish, this._showSolutions ? this._solutionPaths : []);
        }
    }

    /**
     * Returns all active avatars.
     * @returns {Array}
     */
    getActiveAvatars() {
        return _.filter(this._avatars, (avatar) => avatar.isActive());
    }

    getFinishCell() {
        return this.locateOverlayCell(this._finish);
    }

    getInitialAvatar() {
        return _.first(this._avatars);
    }

    getVisitedCells() {
        return this._visitedCells;
    }

    increaseThreadCount(cell) {
        _.find(this._threadCounts, {cell: cell}).count++;
    }

    loadMaze(maze) {
        let errorMessage = 'Could not parse maze.';
        if (!(maze.grid && maze.initialAvatar && maze.finish)) throw errorMessage;

        let grid = Grid.loadFromShortObject(maze.grid);
        this.setMaze(grid, new Avatar(maze.initialAvatar.x, maze.initialAvatar.y, maze.initialAvatar.direction), new Finish(maze.finish.x, maze.finish.y));
        this.draw();
    }

    locateAlignedOverlayCell(overlay) {
        return this._grid.getCell(this._mazeComponent.getAlignedX(overlay), this._mazeComponent.getAlignedY(overlay));
    }

    locateOverlayCell(overlay) {
        return this._grid.getCell(overlay.getX(), overlay.getY());
    }

    markCellVisited(cell) {
        if (!_.includes(this._visitedCells, cell)) this._visitedCells.push(cell);
    }

    movementHasHappened() {
        return this._movementHasHappened;
    }

    onMazeComponentClick(cellX, cellY) {
        cellX = Math.floor(cellX);
        cellY = Math.floor(cellY);

        for (let avatar of this.getActiveAvatars()) {
            if (avatar.getX() == cellX && avatar.getY() == cellY) {
                this.animateAvatar([[new Animation(avatar, 'R')]]);
                break;
            }
        }
    }

    onMazeComponentDragStarted(cellX, cellY) {
        let overlays = _(this.getActiveAvatars()).concat(this._finish).value();

        for (let overlay of overlays) {
            if (overlay.getX() == Math.floor(cellX) && overlay.getY() == Math.floor(cellY)) {
                this._draggedOverlay = overlay;
                this._dragHoldX = cellX - overlay.getX();
                this._dragHoldY = cellY - overlay.getY();
                overlay.setIsBeingDragged(true);
                overlay.setIsBeingDraggedRight(true);
                this.draw();
                return true;
            }
        }

        return false;
    }

    onMazeComponentDragMove(cellX, cellY) {
        this._moveDraggedOverlayToMouse(cellX, cellY);
        this.draw();
    }

    onMazeComponentDragFinished(cellX, cellY) {
        this._moveDraggedOverlayToMouse(cellX, cellY);
        this._mazeComponent.alignOverlay(this._draggedOverlay);
        this._draggedOverlay.setIsBeingDragged(false);
        this._draggedOverlay = null;

        this.draw();
    }

    reset(deleteOverlays) {
        this._animationLastRenderTime = null;
        this._avatarAnimationSteps = [];
        this._avatars = [];
        this._draggedOverlay = null;
        this._lastShortestPathFinish = null;
        this._lastShortestPathStart = null;
        this._movementHasHappened = false;
        this._solutionPaths = [];
        for (let threadCountElement of this._threadCounts) {
            threadCountElement.count = 0;
        }
        this._visitedCells = [];

        if (deleteOverlays) {
            this._finish = null;
            this._start = null;
            this._storedAvatars = [];
        } else {
            this.restoreOverlays();
        }
    }

    restoreOverlays() {
        this._avatars = [];
        this._start = null;

        for (let storedAvatar of this._storedAvatars) {
            let copy = Avatar.createAndCopyPosition(storedAvatar);
            this._avatars.push(copy);
        }
    }

    setAnimationFrameTime(animationFrameTime) {
        this._animationFrameTime = animationFrameTime;
    }

    setMaze(grid, avatar, finish) {
        this.reset(true);
        this._avatars = [avatar];
        this._finish = finish;
        this._grid = grid;
        this._mazeLoaded = true;
        this._threadCounts = [];
        for (let cell of grid.getCells()) this._threadCounts.push({cell: cell, count: 0});
        this._mazeComponent.setGrid(grid);
    }

    showSolutions(show) {
        this._showSolutions = show;
    }

    showSpeechBubble(avatar, message, duration) {
        if (this._stateListenerCallback) this._stateListenerCallback('PARALLEL_OPERATION_STARTED');
        avatar.setSpeechBubbleText(message);
        this.draw();

        _.delay(() => {
            avatar.clearSpeechBubbleText();
            this.draw();
            if (this._stateListenerCallback) this._stateListenerCallback('PARALLEL_OPERATION_FINISHED');
        }, duration);
    }

    storeOverlays() {
        this._storedAvatars = [];
        for (let avatar of this.getActiveAvatars()) {
            let copy = Avatar.createAndCopyPosition(avatar);
            this._storedAvatars.push(copy);
        }

        this._start = new Start(this.getInitialAvatar().getX(), this.getInitialAvatar().getY());
    }

    toJSON() {
        return JSON.stringify({
            grid: this._grid.toShortObject(),
            initialAvatar: this.getInitialAvatar().toShortObject(),
            finish: this._finish.toShortObject()
        });
    }

    _animateFrame(timestamp) {
        if (this._avatarAnimationSteps.length > 0) {
            if (!this._animationLastRenderTime) this._animationLastRenderTime = timestamp;
            let dt = timestamp - this._animationLastRenderTime;
            this._animationLastRenderTime = timestamp;

            let animationStep = _.first(this._avatarAnimationSteps);

            for (let animation of animationStep) {
                let avatarCell = this.locateOverlayCell(animation.getAvatar());

                if (!animation.hasStarted()) {
                    if (animation.getAvatar().laysOutThread() && _.includes(['N', 'E', 'S', 'W'], animation.getAction())) {
                        let to;

                        switch (animation.getAction()) {
                            case 'N':
                                to = avatarCell.getLinkedNeighbourInDirection(0);
                                break;

                            case 'E':
                                to = avatarCell.getLinkedNeighbourInDirection(90);
                                break;

                            case 'S':
                                to = avatarCell.getLinkedNeighbourInDirection(180);
                                break;

                            case 'W':
                                to = avatarCell.getLinkedNeighbourInDirection(270);
                                break;
                        }

                        // If we are about to move to the latest thread cell, that means we are rolling up thread.
                        if (animation.getAvatar().getPreviousThreadCell() == to) {
                            this.decreaseThreadCount(avatarCell);
                            animation.getAvatar().removeCurrentThreadCell();
                        }
                    } else if (animation.getAction() == 'CLONE') {
                        let clone = Avatar.clone(animation.getAvatar());
                        this.addAvatar(clone);
                        animation.setAvatar(clone);
                    }
                }

                animation.perform(this._animationFrameTime, dt);

                // Possibly updated position.
                avatarCell = this.locateOverlayCell(animation.getAvatar());

                // Done moving?
                if (animation.hasFinished()) {
                    switch (animation.getAction()) {
                        case 'N':
                        case 'E':
                        case 'S':
                        case 'W':
                            // Increase step count.
                            this._stateListenerCallback('AVATAR_STEPPED');

                            // Lay out thread (if we haven't just backtraced).
                            if (animation.getAvatar().laysOutThread()) {
                                if (animation.getAvatar().getCurrentThreadCell() != avatarCell) {
                                    this.increaseThreadCount(avatarCell);
                                    animation.getAvatar().pushThreadCell(avatarCell);
                                }
                            }

                            // Mark the new cell as visited.
                            if (animation.getAvatar().marksVisitedCells()) {
                                this.markCellVisited(avatarCell);
                            }

                            this._movementHasHappened = true;
                            break;

                        case 'GIVE_UP':
                            animation.getAvatar().setInactive();
                            break;
                    }
                }
            }

            // Only keep unfinished animations.
            _.remove(animationStep, (animation) => animation.hasFinished());

            if (animationStep.length == 0) {
                this._avatarAnimationSteps.shift();
            }

            this.draw();
        }

        if (this._avatarAnimationSteps.length == 0) {
            this._animationLastRenderTime = null;
            if (this._stateListenerCallback) this._stateListenerCallback('PARALLEL_OPERATION_FINISHED');
        } else {
            window.requestAnimationFrame(this._animateFrame.bind(this));
        }
    }

    _moveDraggedOverlayToMouse(cellX, cellY) {
        let newCanvasX = cellX - this._dragHoldX;
        let newCanvasY = cellY - this._dragHoldY;

        if (newCanvasX != this._draggedOverlay.getX()) this._draggedOverlay.setIsBeingDraggedRight(newCanvasX >= this._draggedOverlay.getX());

        if (newCanvasX < 0) newCanvasX = 0;
        if (newCanvasY < 0) newCanvasY = 0;
        if (newCanvasX > this._grid.getColumnCount() - 1) newCanvasX = this._grid.getColumnCount() - 1;
        if (newCanvasY > this._grid.getRowCount() - 1) newCanvasY = this._grid.getRowCount() - 1;

        this._draggedOverlay.setPosition(newCanvasX, newCanvasY);
    }

}