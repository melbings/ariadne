import _ from 'lodash';
import Animation from '../Components/Maze/Animation';
import Avatar from '../Components/Maze/Overlays/Avatar';
import DirectionHelper from '../Classes/DirectionHelper';

export default class AriadneRuntimeLibrary {

    constructor(blocklyComponent, mazeController) {
        this._blocklyComponent = blocklyComponent;
        this._mazeController = mazeController;
    }

    getStatementPrefixCode() {
        return '__internal_blockStarting(%1);\n'
    }

    initializeInterpreter(enhancedInterpreter, jsInterpreter, scope) {
        this._enhancedInterpreter = enhancedInterpreter;
        this._blocklyComponent.addReservedWordsToBlockly(
            [
                '__internal_blockStarting',
                '__multi_foundFinish',
                '__multi_getAvatars',
                '__multi_getInitialAvatar',
                '__multi_getNumberOfUnvisitedPaths',
                '__multi_getThreadLength',
                '__multi_giveUp',
                '__multi_layOutThread',
                '__multi_markVisitedCells',
                '__multi_say',
                '__multi_splitUp',
                '__multi_stepOntoUnvisitedCell',
                '__single_backtrace',
                '__single_followPath',
                '__single_foundFinish',
                '__single_getNumberOfUnvisitedPaths',
                '__single_getThreadLength',
                '__single_layOutThread',
                '__single_markVisitedCells',
                '__single_say'
            ].join(',')
        );

        jsInterpreter.setProperty(scope, '__internal_blockStarting', jsInterpreter.createNativeFunction(
            (id) => jsInterpreter.createPrimitive(this.internal_blockStarting(id.data))
        ));

        jsInterpreter.setProperty(scope, '__multi_foundFinish', jsInterpreter.createNativeFunction(
            (avatar) => jsInterpreter.createPrimitive(this.multi_foundFinish(avatar.data))
        ));

        jsInterpreter.setProperty(scope, '__multi_getAvatars', jsInterpreter.createNativeFunction(() => {
            let i = 0;
            let avatars = jsInterpreter.createObject(jsInterpreter.ARRAY);
            for (let avatar of this.multi_getAvatars()) {
                jsInterpreter.setProperty(avatars, i++, jsInterpreter.createPrimitive(avatar));
            }
            return avatars;
        }));

        jsInterpreter.setProperty(scope, '__multi_getInitialAvatar', jsInterpreter.createNativeFunction(
            () => jsInterpreter.createPrimitive(this.multi_getInitialAvatar())
        ));

        jsInterpreter.setProperty(scope, '__multi_getNumberOfUnvisitedPaths', jsInterpreter.createNativeFunction(
            (avatar) => jsInterpreter.createPrimitive(this.multi_getNumberOfUnvisitedPaths(avatar.data))
        ));

        jsInterpreter.setProperty(scope, '__multi_getThreadLength', jsInterpreter.createNativeFunction(
            (avatar) => jsInterpreter.createPrimitive(this.multi_getThreadLength(avatar.data))
        ));

        jsInterpreter.setProperty(scope, '__multi_giveUp', jsInterpreter.createNativeFunction(
            (avatar) => this.multi_giveUp(avatar.data)
        ));

        jsInterpreter.setProperty(scope, '__multi_layOutThread', jsInterpreter.createNativeFunction(
            (avatar) => this.multi_layOutThread(avatar.data)
        ));

        jsInterpreter.setProperty(scope, '__multi_markVisitedCells', jsInterpreter.createNativeFunction(
            (avatar) => this.multi_markVisitedCells(avatar.data)
        ));

        jsInterpreter.setProperty(scope, '__multi_say', jsInterpreter.createNativeFunction(
            (avatar, message) => this.multi_say(avatar.data, message.data)
        ));

        jsInterpreter.setProperty(scope, '__multi_splitUp', jsInterpreter.createNativeFunction(
            (avatar, count) => this.multi_splitUp(avatar.data, count.data)
        ));

        jsInterpreter.setProperty(scope, '__multi_stepOntoUnvisitedCell', jsInterpreter.createNativeFunction(
            (avatar) => this.multi_stepOntoUnvisitedCell(avatar.data)
        ));

        jsInterpreter.setProperty(scope, '__single_backtrace', jsInterpreter.createNativeFunction(
            () => this.single_backtrace()
        ));

        jsInterpreter.setProperty(scope, '__single_followPath', jsInterpreter.createNativeFunction(
            (from, condition) => this.single_followPath(from.data, condition.data)
        ));

        jsInterpreter.setProperty(scope, '__single_foundFinish', jsInterpreter.createNativeFunction(
            () => jsInterpreter.createPrimitive(this.single_foundFinish())
        ));

        jsInterpreter.setProperty(scope, '__single_getNumberOfUnvisitedPaths', jsInterpreter.createNativeFunction(
            () => jsInterpreter.createPrimitive(this.single_getNumberOfUnvisitedPaths())
        ));

        jsInterpreter.setProperty(scope, '__single_getThreadLength', jsInterpreter.createNativeFunction(
            () => jsInterpreter.createPrimitive(this.single_getThreadLength())
        ));

        jsInterpreter.setProperty(scope, '__single_layOutThread', jsInterpreter.createNativeFunction(
            () => this.single_layOutThread()
        ));

        jsInterpreter.setProperty(scope, '__single_markVisitedCells', jsInterpreter.createNativeFunction(
            () => this.single_markVisitedCells()
        ));

        jsInterpreter.setProperty(scope, '__single_say', jsInterpreter.createNativeFunction(
            (message) => this.single_say(message.data)
        ));
    }

    internal_blockStarting(id) {
        id = id ? id.toString() : '';
        this._enhancedInterpreter.notifyBlockStarting();
        this._blocklyComponent.highlightBlock(id);
    }

    multi_foundFinish(avatar) {
        return this._mazeController.locateOverlayCell(avatar) == this._mazeController.getFinishCell();
    }

    multi_getAvatars() {
        return this._mazeController.getActiveAvatars();
    }

    multi_getInitialAvatar() {
        return this._mazeController.getInitialAvatar();
    }

    multi_getNumberOfUnvisitedPaths(avatar) {
        let cell = this._mazeController.locateOverlayCell(avatar);
        let linkedNeighbours = cell.getLinkedNeighbours();
        let result = 0;

        for (let linkedNeighbour of linkedNeighbours) {
            if (!_.includes(this._mazeController.getVisitedCells(), linkedNeighbour)) {
                result++;
            }
        }

        return result;
    }

    multi_getThreadLength(avatar) {
        return Math.max(0, avatar.getThread().length - 1);
    }

    multi_giveUp(avatar) {
        this._mazeController.animateAvatar([[new Animation(avatar, 'GIVE_UP')]]);
    }

    multi_layOutThread(avatar) {
        if (!avatar.isActive()) return;

        if (!avatar.laysOutThread()) {
            avatar.layOutThread();

            let cell = this._mazeController.locateOverlayCell(avatar);
            avatar.pushThreadCell(cell);
            this._mazeController.increaseThreadCount(cell);
        }
    }

    multi_markVisitedCells(avatar) {
        if (!avatar.isActive()) return;

        if (!avatar.marksVisitedCells()) {
            avatar.markVisitedCells();

            let cell = this._mazeController.locateOverlayCell(avatar);
            this._mazeController.markCellVisited(cell);
        }
    }

    multi_say(avatar, message) {
        if (!avatar.isActive()) return;

        this._mazeController.showSpeechBubble(avatar, message, 3000);
    }

    multi_splitUp(avatar, count) {
        if (!avatar.isActive()) return;

        if (count <= 0) {
            // Give up.
            this.multi_giveUp(avatar);
        } else if (count == 1) {
            // Do nothing.
        } else {
            // Clone.
            let animationSteps = [];
            for (let i = 0; i < count - 1; i++) {
                animationSteps.push([new Animation(avatar, 'CLONE')]);
            }
            this._mazeController.animateAvatar(animationSteps);
        }
    }

    multi_stepOntoUnvisitedCell(avatar) {
        if (!avatar.isActive()) return;

        let cell = this._mazeController.locateOverlayCell(avatar);
        if (cell == this._mazeController.getFinishCell()) return;

        let candidates = _.difference(cell.getLinkedNeighbours(), this._mazeController.getVisitedCells());

        if (candidates.length > 0) {
            // Note: This will not usually happen, because the way backwards is "visited". It is still necessary in case the avatar is not marking cells.
            // If there is more than one possibility, disregard the way "backwards", if it exists. Any exception is made if there has not been any movement yet.
            if (this._mazeController.movementHasHappened() && candidates.length > 1) {
                let backwardCell = cell.getLinkedNeighbourInDirection(DirectionHelper.constrain(avatar.getDirection() + 180));
                if (backwardCell) _.pull(candidates, backwardCell);
            }

            let nextCell = _.sample(candidates);
            let steps = this._generateAnimationSteps(avatar, [cell, nextCell]);
            this._mazeController.animateAvatar(steps);
        }
    }

    single_backtrace() {
        let avatar = this._mazeController.getInitialAvatar();
        if (!avatar.isActive() || !avatar.layOutThread) {
            return;
        }

        // Only 1 thread cell? Leave it there.
        if (avatar.getThread().length == 1) return;

        let cell = this._mazeController.locateOverlayCell(avatar);
        let path = [cell];
        let avatarTempThread = _.clone(avatar.getThread());

        avatarTempThread.pop();

        while (true) {
            let nextCell = _.last(avatarTempThread);
            path.push(nextCell);

            if (nextCell.getLinkedNeighbours().length != 2 || avatarTempThread.length == 1) {
                break;
            }

            avatarTempThread.pop();
        }

        if (path.length > 1) this._mazeController.animateAvatar(this._generateAnimationSteps(avatar, path));
    }

    single_followPath(from, condition) {
        let avatar = this._mazeController.getInitialAvatar();
        if (!avatar.isActive()) return;

        let cell = this._mazeController.locateOverlayCell(avatar);
        let threadCopy = _.clone(avatar.getThread());

        let path = [cell];

        let firstIteration = true;
        let previousCell = null;
        let nextCell;

        do {
            if (cell == this._mazeController.getFinishCell()) break;

            nextCell = null;
            let candidates = _.without(cell.getLinkedNeighbours(), previousCell);

            switch (condition) {
                case 'NONE':
                    break;

                case 'AVOID_THREAD':
                    if (threadCopy.length > 1) {
                        let oldThread = _.take(threadCopy, threadCopy.length - 2);
                        candidates = _.difference(candidates, oldThread);
                    }
                    break;

                case 'AVOID_VISITED':
                    candidates = _.difference(candidates, this._mazeController.getVisitedCells());
                    break;
            }

            if (firstIteration) {
                firstIteration = false;

                switch (from) {
                    case 'RANDOM':
                        // If there is more than one possibility, disregard the way "backwards", if it exists. An exception is made if the avatar has not moved at all before - in that case, all paths are eligible, even the way "backwards".
                        if (this._mazeController.movementHasHappened() && candidates.length > 1) {
                            let backwardCell = cell.getLinkedNeighbourInDirection(DirectionHelper.constrain(avatar.getDirection() + 180));
                            if (backwardCell) _.pull(candidates, backwardCell);
                        }

                        nextCell = _.sample(candidates);
                        break;

                    case 'LEFT':
                    case 'RIGHT':
                        // If we're not at a junction, that means that we're still in the very beginning and the avatar has never
                        // moved before. (Because if he had moved, he'd be standing at a junction.) In that case, prefer the path
                        // straight ahead; that feels more natural.
                        let lookDirections;
                        if (cell.getLinkedNeighbours().length == 2) {
                            lookDirections = from == 'LEFT' ? [0, 270, 180, 90] : [0, 90, 180, 270];
                        } else {
                            lookDirections = from == 'LEFT' ? [270, 0, 90, 180] : [90, 0, 270, 180];
                        }

                        for (let lookDirection of lookDirections) {
                            let linkedNeighbour = cell.getLinkedNeighbourInDirection(DirectionHelper.constrain(avatar.getDirection() + lookDirection));

                            if (linkedNeighbour && _.includes(candidates, linkedNeighbour)) {
                                nextCell = linkedNeighbour;
                                break;
                            }
                        }
                        break;
                }
            } else {
                // If there is only one candidate, keep following the path. Otherwise, we're at a junction, in a dead end or there is old thread ahead.
                if (candidates.length == 1) {
                    nextCell = _.first(candidates);
                }
            }

            if (nextCell) {
                path.push(nextCell);

                if (avatar.laysOutThread()) {
                    if (threadCopy.length > 1 && threadCopy[threadCopy.length - 2] == nextCell) {
                        threadCopy.pop();
                    } else {
                        threadCopy.push(nextCell);
                    }
                }

                previousCell = cell;
                cell = nextCell;
            }
        } while (nextCell);

        if (path.length > 1) {
            let steps = this._generateAnimationSteps(avatar, path);
            this._mazeController.animateAvatar(steps);
        }
    }

    single_foundFinish() {
        return this.multi_foundFinish(this._mazeController.getInitialAvatar());
    }

    single_getNumberOfUnvisitedPaths() {
        return this.multi_getNumberOfUnvisitedPaths(this._mazeController.getInitialAvatar());
    }

    single_getThreadLength() {
        return this.multi_getThreadLength(this._mazeController.getInitialAvatar());
    }

    single_layOutThread() {
        return this.multi_layOutThread(this._mazeController.getInitialAvatar());
    }

    single_markVisitedCells() {
        return this.multi_markVisitedCells(this._mazeController.getInitialAvatar());
    }

    single_say(message) {
        this.multi_say(this._mazeController.getInitialAvatar(), message);
    }

    _generateAnimationSteps(avatar, path) {
        let animationSteps = [];
        let direction = avatar.getDirection();

        for (let i = 0; i < path.length - 1; i++) {
            let from = path[i];
            let to = path[i + 1];
            let newDirection = from.getDirectionTo(to);

            switch (newDirection - direction) {
                case -270:
                case 90:
                    animationSteps.push([new Animation(avatar, 'R')]);
                    break;

                case -180:
                case 180:
                    if (Math.floor(Math.random() * 2) == 0) {
                        animationSteps.push([new Animation(avatar, 'RR')]);
                    } else {
                        animationSteps.push([new Animation(avatar, 'LL')]);
                    }
                    break;

                case -90:
                case 270:
                    animationSteps.push([new Animation(avatar, 'L')]);
                    break;
            }

            direction = newDirection;
            animationSteps.push([new Animation(avatar, from.getOrientationTo(to))]);
        }

        return animationSteps;
    }

}