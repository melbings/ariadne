import Overlay from './Overlay';

export default class Finish extends Overlay {

    static createAndCopyPosition(finish) {
        return new Finish(finish.getX(), finish.getY());
    }

    constructor(x, y) {
        super(x, y, 20, 34);
    }

    toShortObject() {
        return {x: this._x, y: this._y};
    }

    toString() {
        return '[object Finish: x=' + this._x + ', y=' + this._y + ']]';
    }

}