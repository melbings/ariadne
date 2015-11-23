import _ from 'lodash';
import DirectionHelper from '../../../Classes/DirectionHelper';
import Overlay from './Overlay';

export default class Avatar extends Overlay {

    static createAndCopyPosition(avatar) {
        return new Avatar(avatar.getX(), avatar.getY(), avatar.getDirection());
    }

    static clone(avatar) {
        let clone = new Avatar(avatar.getX(), avatar.getY(), avatar.getDirection());
        clone._layOutThread = avatar._layOutThread;
        clone._markVisitedCells = avatar._markVisitedCells;
        clone._thread = _.clone(avatar._thread);
        return clone;
    }

    constructor(x, y, direction) {
        super(x, y, 49, 50);
        this._active = true;
        this._direction = direction;
        this._layOutThread = false;
        this._markVisitedCells = false;
        this._scale = 1;
        this._speechBubbleText = null;
        this._thread = [];
    }

    changeDirectionBy(delta) {
        this._direction = DirectionHelper.constrain(this._direction + delta);
    }

    changePositionBy(deltaX, deltaY) {
        this._x += deltaX;
        this._y += deltaY;
    }

    clearSpeechBubbleText() {
        this._speechBubbleText = null;
    }

    changeScaleBy(delta) {
        this._scale += delta;
    }

    getDirection() {
        return this._direction;
    }

    getCurrentThreadCell() {
        return _.last(this._thread);
    }

    getPreviousThreadCell() {
        return (this._thread.length > 1 ? this._thread[this._thread.length - 2] : null);
    }

    getScale() {
        return this._scale;
    }

    getSpeechBubbleText() {
        return this._speechBubbleText;
    }

    getThread() {
        return this._thread;
    }

    hasSpeechBubbleText() {
        return this._speechBubbleText != null;
    }

    isActive() {
        return this._active;
    }

    layOutThread() {
        this._layOutThread = true;
    }

    laysOutThread() {
        return this._layOutThread;
    }

    marksVisitedCells() {
        return this._markVisitedCells;
    }

    markVisitedCells() {
        this._markVisitedCells = true;
    }

    pushThreadCell(cell) {
        this._thread.push(cell);
    }

    removeCurrentThreadCell() {
        this._thread.pop();
    }

    setScale(scale) {
        this._scale = scale;
    }

    setDirection(direction) {
        this._direction = direction;
    }

    setInactive() {
        this._active = false;
    }

    setSpeechBubbleText(speechBubbleText) {
        this._speechBubbleText = speechBubbleText;
    }

    toShortObject() {
        return {x: this._x, y: this._y, direction: this._direction};
    }

    toString() {
        return '[object Avatar: x=' + this._x + ', y=' + this._y + ', direction=' + this._direction + ', layOutThread=' + this._layOutThread + ', markVisitedCells=' + this._markVisitedCells + ', scale=' + this._scale + ', speechBubbleText=' + this._speechBubbleText + ', thread=' + this._thread + ']';
    }

}