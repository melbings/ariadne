export default class Overlay {

    constructor(x, y, shapeWidth, shapeHeight) {
        this._x = x;
        this._y = y;
        this._alpha = 1.0;
        this._isBeingDragged = false;
        this._isBeingDraggedRight = false;
        this._shapeWidth = shapeWidth;
        this._shapeHeight = shapeHeight;
    }

    changeAlphaBy(delta) {
        this._alpha += delta;
    }

    getAlpha() {
        return this._alpha;
    }

    getShapeHeight() {
        return this._shapeHeight;
    }

    getShapeWidth() {
        return this._shapeWidth;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    isBeingDragged() {
        return this._isBeingDragged;
    }

    isBeingDraggedRight() {
        return this._isBeingDraggedRight;
    }

    setAlpha(alpha) {
        this._alpha = alpha;
    }

    setIsBeingDragged(isBeingDragged) {
        this._isBeingDragged = isBeingDragged;
    }

    setIsBeingDraggedRight(isBeingDraggedRight) {
        this._isBeingDraggedRight = isBeingDraggedRight;
    }

    setPosition(x, y) {
        this._x = x;
        this._y = y;
    }

    setX(x) {
        this._x = x;
    }

    setY(y) {
        this._y = y;
    }

}