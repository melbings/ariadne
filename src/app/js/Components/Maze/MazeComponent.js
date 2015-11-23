import _ from 'lodash';
import React from 'react';

const _MAP_SHAPE_SIZE = 50;

const _MAP_SHAPES = {
    // NESW: opening to the north/the east/the south/the west
    '0010': {x: 4, y: 0},  // Dead ends
    '0001': {x: 3, y: 3},
    '1000': {x: 0, y: 1},
    '0100': {x: 0, y: 2},
    '1010': {x: 4, y: 1},  // Vertical
    '0101': {x: 3, y: 2},  // Horizontal
    '0110': {x: 0, y: 0},  // Elbows
    '0011': {x: 2, y: 0},
    '1001': {x: 4, y: 2},
    '1100': {x: 2, y: 3},
    '1110': {x: 1, y: 1},  // Junctions
    '0111': {x: 1, y: 0},
    '1011': {x: 2, y: 1},
    '1101': {x: 1, y: 2},
    '1111': {x: 2, y: 2},  // Cross
    'null0': {x: 4, y: 3},  // Empty
    'null1': {x: 3, y: 0},
    'null2': {x: 3, y: 1},
    'null3': {x: 0, y: 3},
    'null4': {x: 1, y: 3}
};

// Rotation shapes: index = degrees / 22.5
const _AVATAR_SHAPES = {
    west_color: 16,
    west_grey: 17,
    east_color: 18,
    east_grey: 19,
    still: 20
};

export default React.createClass({

    _avatarImg: null,
    _clickCanvas: null,
    _dragging: false,
    _finishImg: null,
    _grid: null,
    _gridHeight: null,
    _gridImg: null,
    _gridVisible: false,
    _gridWidth: null,
    _dragStartX: null,
    _dragStartY: null,
    _gridCtx: null,
    _onClickHandler: null,
    _onDragStartedHandler: null,
    _onDragMoveHandler: null,
    _onDragFinishedHandler: null,
    _overlayCanvas: null,
    _overlayCtx: null,
    _scale: null,
    _speechCtx: null,
    _startImg: null,
    _visitedGridImg: null,

    propTypes: {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        draggingEnabled: React.PropTypes.bool,
        grid: React.PropTypes.object,
        onStartupClick: React.PropTypes.func
    },

    alignOverlay(overlay) {
        overlay.setPosition(Math.floor((overlay.getX()) + overlay.getShapeWidth() / 2 / _MAP_SHAPE_SIZE), Math.floor((overlay.getY()) + overlay.getShapeHeight() / 2 / _MAP_SHAPE_SIZE));
    },

    getAlignedX(overlay) {
        return Math.floor((overlay.getX()) + overlay.getShapeWidth() / 2 / _MAP_SHAPE_SIZE);
    },

    getAlignedY(overlay) {
        return Math.floor((overlay.getY()) + overlay.getShapeHeight() / 2 / _MAP_SHAPE_SIZE);
    },

    draw: function (visitedCells, avatars, start, finish, solutionPaths) {
        if (this._gridVisible) {
            this._clearSpeech();
            this._clearOverlay();
            this._clearGrid();
        }

        if (this._grid) {
            this._drawGrid(visitedCells);
            this._drawOverlays(avatars, start, finish, solutionPaths);
            this._drawSpeech(avatars);

            this._gridVisible = true;
        } else {
            this._gridVisible = false;
        }
    },

    setGrid: function (grid) {
        if (this._gridVisible) {
            this._clearSpeech();
            this._clearOverlay();
            this._clearGrid();
        }

        this._grid = grid;
        this._gridWidth = this._grid.getColumnCount() * _MAP_SHAPE_SIZE;
        this._gridHeight = this._grid.getRowCount() * _MAP_SHAPE_SIZE;

        let width_scale = this.props.width / this._gridWidth;
        let height_scale = this.props.height / this._gridHeight;
        this._scale = Math.min(width_scale, height_scale);

        this._gridCtx.setTransform(this._scale, 0, 0, this._scale, 0, 0);
        this._overlayCtx.setTransform(this._scale, 0, 0, this._scale, 0, 0);

    },

    setOnClickHandler: function (onClickHandler) {
        this._onClickHandler = onClickHandler;
    },

    setOnDragStartedHandler: function (onDragStartedHandler) {
        this._onDragStartedHandler = onDragStartedHandler;
    },

    setOnDragMoveHandler: function (onDragMoveHandler) {
        this._onDragMoveHandler = onDragMoveHandler;
    },

    setOnDragFinishedHandler: function (onDragFinishedHandler) {
        this._onDragFinishedHandler = onDragFinishedHandler;
    },

    _clearGrid: function () {
        this._gridCtx.clearRect(0, 0, this._gridWidth, this._gridHeight);
    },

    _clearOverlay: function () {
        this._overlayCtx.clearRect(0, 0, this._gridWidth, this._gridHeight);
    },

    _clearSpeech: function () {
        this._speechCtx.clearRect(0, 0, this._gridWidth * this._scale, this._gridHeight * this._scale);
    },

    // Wrapper for ctx.drawImage() including an alpha setting
    _drawImage: function (ctx, img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh, alpha) {
        let oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = alpha;
        ctx.drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
        ctx.globalAlpha = oldAlpha;
    },

    _drawGrid: function (visitedCells) {
        this._gridCtx.fillStyle = 'rgba(241, 238, 231, 1.0)';
        this._gridCtx.strokeStyle = 'rgba(204, 204, 187, 1.0)';

        // Outside box.
        this._gridCtx.fillRect(0, 0, this._gridWidth, this._gridHeight);

        let grid_offset = 0; // _MAP_SHAPE_SIZE / 2;
        let i, j;

        // Vertical grid.
        for (i = 0; i <= this._grid.getColumnCount(); i++) {
            this._gridCtx.beginPath();
            this._gridCtx.moveTo(i * _MAP_SHAPE_SIZE + grid_offset, 0);
            this._gridCtx.lineTo(i * _MAP_SHAPE_SIZE + grid_offset, this._gridHeight);
            this._gridCtx.stroke();
        }

        // Horizontal grid.
        for (j = 0; j <= this._grid.getRowCount(); j++) {
            this._gridCtx.beginPath();
            this._gridCtx.moveTo(0, j * _MAP_SHAPE_SIZE + grid_offset);
            this._gridCtx.lineTo(this._gridWidth, j * _MAP_SHAPE_SIZE + grid_offset);
            this._gridCtx.stroke();
        }

        // Cells.
        for (let cell of this._grid.getCells()) {
            let tileIndex = cell.getTileIndex();

            if (_.includes(visitedCells, cell)) {
                this._drawImage(
                    this._gridCtx,
                    this._visitedGridImg,                         // Sprite image
                    _MAP_SHAPES[tileIndex].x * _MAP_SHAPE_SIZE,  // Sprite x offset
                    _MAP_SHAPES[tileIndex].y * _MAP_SHAPE_SIZE,  // Sprite y offset
                    _MAP_SHAPE_SIZE,                             // Sprite width
                    _MAP_SHAPE_SIZE,                             // Sprite height
                    cell.getX() * _MAP_SHAPE_SIZE,               // Destination x offset
                    cell.getY() * _MAP_SHAPE_SIZE,               // Destination y offset
                    _MAP_SHAPE_SIZE,                             // Destination width
                    _MAP_SHAPE_SIZE,                             // Destination height
                    1
                );
            } else {
                this._drawImage(
                    this._gridCtx,
                    this._gridImg,                                // Sprite image
                    _MAP_SHAPES[tileIndex].x * _MAP_SHAPE_SIZE,  // Sprite x offset
                    _MAP_SHAPES[tileIndex].y * _MAP_SHAPE_SIZE,  // Sprite y offset
                    _MAP_SHAPE_SIZE,                             // Sprite width
                    _MAP_SHAPE_SIZE,                             // Sprite height
                    cell.getX() * _MAP_SHAPE_SIZE,               // Destination x offset
                    cell.getY() * _MAP_SHAPE_SIZE,               // Destination y offset
                    _MAP_SHAPE_SIZE,                             // Destination width
                    _MAP_SHAPE_SIZE,                             // Destination height
                    1
                );
            }
        }
    },

    _drawOverlays: function (avatars, start, finish, solutionPaths) {
        // Draw solution paths.
        for (let solutionPath of solutionPaths) {
            this._drawThread(solutionPath, 'rgba(0, 255, 0, 1)', 1, 1);
        }

        // Draw threads.
        for (let avatar of avatars) {
            this._drawThread(avatar.getThread(), 'rgba(255, 0, 0, 0.5)', 2, avatar.getAlpha());
        }

        if (start) {
            // Draw start.
            this._drawImage(
                this._overlayCtx,
                this._startImg,                    // Sprite image
                0,                                 // Sprite x offset
                0,                                 // Sprite y offset
                start.getShapeWidth(),             // Sprite width
                start.getShapeHeight(),            // Sprite height
                start.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2 - start.getShapeWidth() / 2,  // Destination x offset
                start.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2 - start.getShapeHeight() / 2, // Destination y offset
                start.getShapeWidth(),             // Destination width
                start.getShapeHeight(),            // Destination height,
                1
            );
        }

        // Draw finish.
        this._drawImage(
            this._overlayCtx,
            this._finishImg,                   // Sprite image
            0,                                 // Sprite x offset
            0,                                 // Sprite y offset
            finish.getShapeWidth(),            // Sprite width
            finish.getShapeHeight(),           // Sprite height
            finish.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2 - finish.getShapeWidth() / 2,  // Destination x offset
            finish.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2 - finish.getShapeHeight() / 2, // Destination y offset
            finish.getShapeWidth(),            // Destination width
            finish.getShapeHeight(),           // Destination height
            1
        );

        // Draw avatars.
        for (let avatar of avatars) {
            let spriteXOffset;

            if (avatar.isBeingDragged()) {
                spriteXOffset = (avatar.isBeingDraggedRight() ? _AVATAR_SHAPES.east_color : _AVATAR_SHAPES.west_color) * avatar.getShapeWidth();
            } else {
                spriteXOffset = Math.floor(avatar.getDirection() / 22.5) * avatar.getShapeWidth();
            }

            this._drawImage(
                this._overlayCtx,
                this._avatarImg,                       // Sprite image
                spriteXOffset,                         // Sprite x offset
                0,                                     // Sprite y offset
                avatar.getShapeWidth(),                // Sprite width
                avatar.getShapeHeight(),               // Sprite height
                avatar.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2 - avatar.getShapeWidth() * avatar.getScale() / 2, // Destination x offset
                avatar.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2 - avatar.getShapeHeight() * avatar.getScale() / 2, // Destination y offset
                avatar.getShapeWidth() * avatar.getScale(),  // Destination width
                avatar.getShapeHeight() * avatar.getScale(), // Destination height
                avatar.getAlpha()
            );
        }
    },

    _drawSpeech: function (avatars) {
        for (let avatar of avatars) {
            if (avatar.hasSpeechBubbleText()) {
                let measure = this._speechCtx.measureText(avatar.getSpeechBubbleText());

                let w = Math.ceil(Math.max(measure.width + 10, 26 * this._scale));
                let h = Math.ceil(20 * this._scale);

                let leftBoxOffset = Math.ceil(10 * this._scale);
                let topBoxOffset = Math.ceil(10 * this._scale);
                let cornerRadius = Math.ceil(4 * this._scale);

                this._speechCtx.beginPath();
                this._speechCtx.strokeStyle = 'black';
                this._speechCtx.lineWidth = 1;
                this._speechCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';

                let sourceX = (avatar.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2) * this._scale;
                let sourceY = (avatar.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 8) * this._scale;

                let topY = Math.max(0, Math.min(sourceY - topBoxOffset - h, Math.floor(this._gridHeight * this._scale - h)));
                let belowTopY = topY + cornerRadius;
                let bottomY = topY + h;
                let aboveBottomY = bottomY - cornerRadius;

                let leftX = Math.max(0, Math.min(sourceX - leftBoxOffset, Math.floor(this._gridWidth * this._scale - w)));
                let besideLeftX = leftX + cornerRadius;
                let rightX = leftX + w;
                let besideRightX = rightX - cornerRadius;

                let leftArrowTargetX = sourceX;
                let rightArrowTargetX = leftArrowTargetX + 6;

                this._speechCtx.moveTo(leftArrowTargetX, bottomY);
                if (sourceY > bottomY) {
                    this._speechCtx.lineTo(sourceX, sourceY);
                    this._speechCtx.lineTo(rightArrowTargetX, bottomY);
                } else {
                    this._speechCtx.lineTo(rightArrowTargetX, bottomY);
                }
                this._speechCtx.lineTo(besideRightX, bottomY);
                this._speechCtx.quadraticCurveTo(rightX, bottomY, rightX, aboveBottomY);
                this._speechCtx.lineTo(rightX, belowTopY);
                this._speechCtx.quadraticCurveTo(rightX, topY, besideRightX, topY);
                this._speechCtx.lineTo(besideLeftX, topY);
                this._speechCtx.quadraticCurveTo(leftX, topY, leftX, belowTopY);
                this._speechCtx.lineTo(leftX, aboveBottomY);
                this._speechCtx.quadraticCurveTo(leftX, bottomY, besideLeftX, bottomY);
                this._speechCtx.lineTo(leftArrowTargetX, bottomY);

                this._speechCtx.fill();
                this._speechCtx.stroke();
                this._speechCtx.closePath();

                this._speechCtx.textAlign = 'center';
                this._speechCtx.textBaseline = 'middle';
                this._speechCtx.fillStyle = 'rgba(12, 12, 12, 1.0)';
                this._speechCtx.fillText(avatar.getSpeechBubbleText(), (leftX + rightX) / 2, (topY + bottomY) / 2);
            }
        }
    },

    _drawThread: function (thread, strokeStyle, width, alpha) {
        if (thread.length < 2) return;

        for (let i = 0; i < thread.length; i++) {
            let threadCell = thread[i];

            let inFrom = (i > 0) ? threadCell.getOrientationTo(thread[i - 1]) : null;
            let outTo = (i < thread.length - 1) ? threadCell.getOrientationTo(thread[i + 1]) : null;
            let oldAlpha = this._overlayCtx.globalAlpha;

            this._overlayCtx.beginPath();
            this._overlayCtx.strokeStyle = strokeStyle;
            this._overlayCtx.lineWidth = width;
            this._overlayCtx.globalAlpha = alpha;

            if ((inFrom == 'N' && outTo == 'S') || (inFrom == 'S' && outTo == 'N')) {
                // line top to bottom
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE);
                this._overlayCtx.lineTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE);
            } else if ((inFrom == 'W' && outTo == 'E') || (inFrom == 'E' && outTo == 'W')) {
                // line left to right
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
                this._overlayCtx.lineTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'N' && outTo == 'E') || (inFrom == 'E' && outTo == 'N')) {
                // top to right
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE);
                this._overlayCtx.quadraticCurveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'E' && outTo == 'S') || (inFrom == 'S' && outTo == 'E')) {
                // bottom to right
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE);
                this._overlayCtx.quadraticCurveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'S' && outTo == 'W') || (inFrom == 'W' && outTo == 'S')) {
                // bottom to left
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE);
                this._overlayCtx.quadraticCurveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getX() * _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'W' && outTo == 'N') || (inFrom == 'N' && outTo == 'W')) {
                // top to left
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE);
                this._overlayCtx.quadraticCurveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getX() * _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'N' && outTo == null) || (inFrom == null && outTo == 'N')) {
                // top to center
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE);
                this._overlayCtx.lineTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'E' && outTo == null) || (inFrom == null && outTo == 'E')) {
                // right to center
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
                this._overlayCtx.lineTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'S' && outTo == null) || (inFrom == null && outTo == 'S')) {
                // bottom to center
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE);
                this._overlayCtx.lineTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            } else if ((inFrom == 'W' && outTo == null) || (inFrom == null && outTo == 'W')) {
                // left to center
                this._overlayCtx.moveTo(threadCell.getX() * _MAP_SHAPE_SIZE, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
                this._overlayCtx.lineTo(threadCell.getX() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2, threadCell.getY() * _MAP_SHAPE_SIZE + _MAP_SHAPE_SIZE / 2);
            }

            this._overlayCtx.stroke();
            this._overlayCtx.closePath();

            this._overlayCtx.globalAlpha = oldAlpha;
        }
    },

    _onMouseDown: function (e) {
        if (!this.props.draggingEnabled || !this._gridVisible) return;

        this._clickCanvas.removeEventListener('mousedown', this._onMouseDown, false);

        let boundingRect = this._clickCanvas.getBoundingClientRect();
        let pixelX = (e.clientX - boundingRect.left) * (this._clickCanvas.width / boundingRect.width);
        let pixelY = (e.clientY - boundingRect.top) * (this._clickCanvas.height / boundingRect.height);

        this._dragStartX = pixelX;
        this._dragStartY = pixelY;

        window.addEventListener('mousemove', this._onMouseMove, false);
        window.addEventListener('mouseup', this._onMouseUp, false);

        // http://rectangleworld.com/blog/archives/15
        // Code below prevents the mouse down from having an effect on the main browser window.
        if (e.preventDefault) {     // Standard
            e.preventDefault();
        } else if (e.returnValue) { // Older IE
            e.returnValue = false;
        } else {
            return false;
        }
    },

    _onMouseMove: function (e) {
        let boundingRect = this._clickCanvas.getBoundingClientRect();
        let pixelX = (e.clientX - boundingRect.left) * (this._clickCanvas.width / boundingRect.width);
        let pixelY = (e.clientY - boundingRect.top) * (this._clickCanvas.height / boundingRect.height);

        if (this._dragging) {
            let scaledX = Math.round(pixelX / this._scale);
            let scaledY = Math.round(pixelY / this._scale);
            let cellX = scaledX / _MAP_SHAPE_SIZE;
            let cellY = scaledY / _MAP_SHAPE_SIZE;

            this._onDragMoveHandler(cellX, cellY);
        } else {
            if (pixelX != this._dragStartX || pixelY != this._dragStartY) {
                if (this._onDragStartedHandler) {
                    let scaledX = Math.round(this._dragStartX / this._scale);
                    let scaledY = Math.round(this._dragStartY / this._scale);
                    let cellX = scaledX / _MAP_SHAPE_SIZE;
                    let cellY = scaledY / _MAP_SHAPE_SIZE;

                    // Give the drag handler a chance to cancel the dragging before it really started.
                    this._dragging = this._onDragStartedHandler(cellX, cellY);
                }

                if (!this._dragging) {
                    // Noone's interested. Let's not listen to any drag events and also mouse up is not interesting anymore.
                    window.removeEventListener('mousemove', this._onMouseMove, false);
                    window.removeEventListener('mouseup', this._onMouseUp, false);
                    this._clickCanvas.addEventListener('mousedown', this._onMouseDown, false);
                }
            }
        }
    },

    _onMouseUp: function (e) {
        window.removeEventListener('mousemove', this._onMouseMove, false);
        window.removeEventListener('mouseup', this._onMouseUp, false);

        let boundingRect = this._clickCanvas.getBoundingClientRect();
        let pixelX = (e.clientX - boundingRect.left) * (this._clickCanvas.width / boundingRect.width);
        let pixelY = (e.clientY - boundingRect.top) * (this._clickCanvas.height / boundingRect.height);

        let scaledX = Math.round(pixelX / this._scale);
        let scaledY = Math.round(pixelY / this._scale);
        let cellX = scaledX / _MAP_SHAPE_SIZE;
        let cellY = scaledY / _MAP_SHAPE_SIZE;

        if (this._dragging) {
            this._dragging = false;
            this._onDragFinishedHandler(cellX, cellY);
        } else {
            if (this._onClickHandler) this._onClickHandler(cellX, cellY);
        }

        this._clickCanvas.addEventListener('mousedown', this._onMouseDown, false);
    },

    // REACT CODE BELOW

    // INITIALIZATION: Step 1/5
    getDefaultProps: function () {
        return {
            draggingEnabled: false,
            grid: null
        }
    },

    // INITIALIZATION: Step 2/5
    getInitialState: function () {
        return {};
    },

    // INITIALIZATION: Step 3/5
    componentWillMount: function () {
    },

    // PROPS CHANGE: Step 1/5 (not on initial render!) - place to manipulate the state
    componentWillReceiveProps: function (nextProps) {
    },

    // STATE CHANGE: Step 1/4
    // PROPS CHANGE: Step 2/5
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },

    // STATE CHANGE: Step 2/4
    // PROPS CHANGE: Step 3/5
    componentWillUpdate: function (nextProps, nextState) {
    },

    // INITIALIZATION: Step 4/5
    // STATE CHANGE: Step 3/4
    // PROPS CHANGE: Step 4/5
    render: function () {
        let startup = '';
        if (!this._gridVisible) {
            startup =
                <div className="startup-container">
                    <div className="startup">
                        <div>Start here:</div>
                        <div className="button" onClick={this.props.onStartupClick}><img src="res/controls/luck.png"/> &nbsp;Generate a maze</div>
                    </div>
                </div>;
        }

        return (
            <div className="maze-component">
                <img className="tiles" src="res/maze/avatar.png" ref="avatarImg"/>
                <img className="tiles" src="res/maze/grid.png" ref="gridImg"/>
                <img className="tiles" src="res/maze/visited_grid.png" ref="visitedGridImg"/>
                <img className="tiles" src="res/maze/finish.png" ref="finishImg"/>
                <img className="tiles" src="res/maze/start.png" ref="startImg"/>
                <canvas className="grid" ref="gridCanvas"/>
                <canvas className="overlay" ref="overlayCanvas"/>
                <canvas className="speech" ref="speechCanvas"/>
                <canvas className="click" ref="clickCanvas" onMouseDown={this._onMouseDown}/>
                {startup}
            </div>
        );
    },

    // INITIALIZATION: Step 5/5 - DOM manipulations
    componentDidMount: function () {
        let gridCanvas = React.findDOMNode(this.refs['gridCanvas']);
        gridCanvas.width = this.props.width;
        gridCanvas.height = this.props.height;
        this._gridCtx = gridCanvas.getContext('2d');

        this._overlayCanvas = React.findDOMNode(this.refs['overlayCanvas']);
        this._overlayCanvas.width = this.props.width;
        this._overlayCanvas.height = this.props.height;
        this._overlayCtx = this._overlayCanvas.getContext('2d');

        let speechCanvas = React.findDOMNode(this.refs['speechCanvas']);
        speechCanvas.width = this.props.width;
        speechCanvas.height = this.props.height;
        this._speechCtx = speechCanvas.getContext('2d');

        this._clickCanvas = React.findDOMNode(this.refs['clickCanvas']);
        this._clickCanvas.width = this.props.width;
        this._clickCanvas.height = this.props.height;

        this._avatarImg = React.findDOMNode(this.refs['avatarImg']);
        this._gridImg = React.findDOMNode(this.refs['gridImg']);
        this._visitedGridImg = React.findDOMNode(this.refs['visitedGridImg']);
        this._finishImg = React.findDOMNode(this.refs['finishImg']);
        this._startImg = React.findDOMNode(this.refs['startImg']);
    },

    // STATE CHANGE: Step 4/4 - DOM manipulations
    // PROPS CHANGE: Step 5/5
    componentDidUpdate: function (prevProps, prevState) {
    },

    // UNMOUNT: Step 1/1
    componentWillUnmount: function () {
    }

});
