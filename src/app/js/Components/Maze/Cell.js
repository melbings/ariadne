import _ from 'lodash';

export default class Cell {

    /**
     * Instantiates a new Cell.
     *
     * @param {number} x
     * @param {number} y
     * @param {boolean} empty
     */
    constructor(x, y, empty) {
        this._x = x;
        this._y = y;
        this._empty = empty;

        this._north = null;
        this._east = null;
        this._south = null;
        this._west = null;

        this._links = [];
    }

    /**
     * Returns the direction to a neighbouring cell.
     *
     * @param {Cell} cell
     * @returns {number} The direction in degrees.
     */
    getDirectionTo(cell) {
        if (cell == this._north) return 0;
        if (cell == this._east) return 90;
        if (cell == this._south) return 180;
        if (cell == this._west) return 270;
    }

    /**
     * Returns the neighbouring cell in the specified direction, or null if there is no neighbour there.
     *
     * @param {number} direction The direction in degrees.
     * @returns {Cell|null}
     */
    getLinkedNeighbourInDirection(direction) {
        switch (direction) {
            case 0:
                if (this._north && this.isLinkedTo(this._north)) return this._north;
                break;

            case 90:
                if (this._east && this.isLinkedTo(this._east)) return this._east;
                break;

            case 180:
                if (this._south && this.isLinkedTo(this._south)) return this._south;
                break;

            case 270:
                if (this._west && this.isLinkedTo(this._west)) return this._west;
                break;
        }

        return null;
    }

    /**
     * Returns all linked neighbours.
     *
     * @returns {Cell[]}
     */
    getLinkedNeighbours() {
        let linkedNeighbours = [];
        if (this._north && this.isLinkedTo(this._north)) linkedNeighbours.push(this._north);
        if (this._east && this.isLinkedTo(this._east)) linkedNeighbours.push(this._east);
        if (this._south && this.isLinkedTo(this._south)) linkedNeighbours.push(this._south);
        if (this._west && this.isLinkedTo(this._west)) linkedNeighbours.push(this._west);
        return linkedNeighbours;
    }

    /**
     * Returns all neighbours.
     *
     * @returns {Cell[]}
     */
    getNeighbours() {
        let neighbours = [];
        if (this._north) neighbours.push(this._north);
        if (this._east) neighbours.push(this._east);
        if (this._south) neighbours.push(this._south);
        if (this._west) neighbours.push(this._west);
        return neighbours;
    }

    /**
     * Returns the orientation towards a neighbouring cell.
     *
     * @param {Cell} cell
     * @returns {string}
     */
    getOrientationTo(cell) {
        if (cell == this._north) return 'N';
        if (cell == this._east) return 'E';
        if (cell == this._south) return 'S';
        if (cell == this._west) return 'W';
    }

    /**
     * Encodes the cell's passages to its neighbour cells.
     *
     * @returns {string}
     */
    getTileIndex() {
        if (this._empty) {
            return 'null0';
        } else {
            return (
                (this._north && this.isLinkedTo(this._north) ? '1' : '0') +
                (this._east && this.isLinkedTo(this._east) ? '1' : '0') +
                (this._south && this.isLinkedTo(this._south) ? '1' : '0') +
                (this._west && this.isLinkedTo(this._west) ? '1' : '0')
            );
        }
    }

    /**
     * Returns all neighbours that are not linked to this cell.
     *
     * @returns {Cell[]}
     */
    getUnlinkedNeighbours() {
        let unlinkedNeighbours = [];
        if (this._north && !this.isLinkedTo(this._north)) unlinkedNeighbours.push(this._north);
        if (this._east && !this.isLinkedTo(this._east)) unlinkedNeighbours.push(this._east);
        if (this._south && !this.isLinkedTo(this._south)) unlinkedNeighbours.push(this._south);
        if (this._west && !this.isLinkedTo(this._west)) unlinkedNeighbours.push(this._west);
        return unlinkedNeighbours;
    }

    /**
     * Returns the x coordinate within the grid.
     *
     * @returns {number}
     */
    getX() {
        return this._x;
    }

    /**
     * Returns the y coordinate within the grid.
     *
     * @returns {number}
     */
    getY() {
        return this._y;
    }

    /**
     * Returns true if the cell has only one linked neighbour.
     *
     * @returns {boolean}
     */
    isDeadend() {
        return this._links.length == 1;
    }

    /**
     * Returns true if the cell has any linked neighbours.
     *
     * @returns {boolean}
     */
    isLinked() {
        return this._links.length > 0;
    }

    /**
     * Returns true if the cell is linked to the specified other cell.
     *
     * @param {Cell} cell
     * @returns {boolean}
     */
    isLinkedTo(cell) {
        return _.contains(this._links, cell);
    }

    /**
     * Links this cell to the specified other cell and vice versa.
     *
     * @param {Cell} cell
     */
    linkTo(cell) {
        if (!_.contains(this._links, cell)) this._links.push(cell);
        if (!_.contains(cell._links, this)) cell._links.push(this);
    }

    /**
     * Links this cell to the neighbour in the specified orientation.
     *
     * @param {string} orientation
     */
    linkTowards(orientation) {
        switch (orientation) {
            case 'N':
                if (this._north) this.linkTo(this._north);
                break;

            case 'E':
                if (this._east) this.linkTo(this._east);
                break;

            case 'S':
                if (this._south) this.linkTo(this._south);
                break;

            case 'W':
                if (this._west) this.linkTo(this._west);
                break;
        }
    }

    /**
     * Informs this cell about its neighbour in the specified orientation.
     *
     * @param {string} orientation
     * @param {Cell} cell
     */
    setNeighbour(orientation, cell) {
        switch (orientation) {
            case 'N':
                this._north = cell;
                break;

            case 'E':
                this._east = cell;
                break;

            case 'S':
                this._south = cell;
                break;

            case 'W':
                this._west = cell;
                break;
        }
    }

    /**
     * Encodes this cell into its short object notation.
     *
     * @returns {{northLink: boolean, eastLink: boolean, southLink: boolean, westLink: boolean}}
     */
    toShortObject() {
        return {
            northLink: this._north && this.isLinkedTo(this._north) ? true : false,
            eastLink: this._east && this.isLinkedTo(this._east) ? true : false,
            southLink: this._south && this.isLinkedTo(this._south) ? true : false,
            westLink: this._west && this.isLinkedTo(this._west) ? true : false
        };
    }

    /**
     * Returns a string representation.
     *
     * @returns {string}
     */
    toString() {
        return '[object Cell: x=' + this._x + ', y=' + this._y + ']';
    }

}