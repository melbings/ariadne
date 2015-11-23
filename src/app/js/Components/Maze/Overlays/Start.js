import Overlay from './Overlay';

export default class Start extends Overlay {

    constructor(x, y) {
        super(x, y, 12, 20);
    }

    toString() {
        return '[object Start: x=' + this._x + ', y=' + this._y + ']]';
    }

}