import _ from 'lodash';
import Cell from './Cell';

export default class Grid {

    /**
     * Generates a maze.
     *
     * @param {string} algorithm
     * @param {number} cols
     * @param {number} rows
     * @param {boolean} braid
     * @param {Object} options
     * @returns {Grid}
     */
    static generate(algorithm = 'GT', cols = 12, rows = 12, braid = true, options = {mode: 'MIX'}) {
        let grid;

        switch (algorithm) {
            case 'GT':
                grid = Grid._generateGrowingTree(cols, rows, options.mode);
                break;

            default:
                throw 'Unknown algorithm specified: ' + algorithm;
                break;
        }

        if (braid) grid.braid(0.8);
        return grid;
    }

    /**
     * Instantiates a Grid from a short object notation.
     *
     * @param {Grid} grid
     * @returns {Grid}
     */
    static loadFromShortObject(grid) {
        if (!(grid.cols && grid.rows && grid.cells)) throw 'Could not parse grid.';
        let newGrid = new Grid(grid.cols, grid.rows, false);
        for (let i = 0; i < grid.cells.length; i++) {
            if (grid.cells[i].northLink) newGrid._cells[i].linkTowards('N');
            if (grid.cells[i].eastLink) newGrid._cells[i].linkTowards('E');
            if (grid.cells[i].southLink) newGrid._cells[i].linkTowards('S');
            if (grid.cells[i].westLink) newGrid._cells[i].linkTowards('W');
        }
        return newGrid;
    }

    /**
     * Uses the Growing Tree algorithm to generate a maze.
     *
     * @param {number} cols
     * @param {number} rows
     * @param {boolean} mode
     * @returns {Grid}
     * @private
     */
    static _generateGrowingTree(cols, rows, mode) {
        let grid = new Grid(cols, rows, false);

        let active = [grid.getRandomCell()];

        while (active.length > 0) {
            let cell;
            switch (mode) {
                case 'RANDOM':
                    cell = _.sample(active);
                    break;

                case 'FIRST':
                    cell = _.first(active);
                    break;

                case 'LAST':
                    cell = _.last(active);
                    break;

                case 'MIX':
                    cell = Math.floor(Math.random() * 2) == 0 ? _.sample(active) : _.last(active);
                    break;

                default:
                    throw 'Unknown Growing Tree mode specified: ' + mode;
                    break;
            }

            let unvisitedNeighbours = _.filter(cell.getNeighbours(), (neighbourCell) => !neighbourCell.isLinked());

            if (unvisitedNeighbours.length > 0) {
                let randomUnvisitedNeighbour = _.sample(unvisitedNeighbours);
                cell.linkTo(randomUnvisitedNeighbour);
                active.push(randomUnvisitedNeighbour);
            } else {
                _.pull(active, cell);
            }
        }

        return grid;
    }

    /**
     * Instantiates a new Grid.
     *
     * @param {number} cols
     * @param {number} rows
     * @param {boolean} markCellsEmpty
     */
    constructor(cols, rows, markCellsEmpty) {
        this._cols = cols;
        this._rows = rows;
        this.clear(markCellsEmpty);
    }

    /**
     * Perform dead-end culling on a grid.
     *
     * @param {number} p The braiding intensity between 0.0 and 1.0.
     * @returns {Grid}
     */
    braid(p = 1.0) {
        let deadendCells = _.shuffle(_.filter(this._cells, (cell) => cell.isDeadend()));

        for (let cell of deadendCells) {
            // Might have been linked in a previous iteration.
            if (!cell.isDeadend()) continue;

            // Allows to specify the braiding intensity.
            if (Math.random() > p) continue;

            // Select all cells we're not already linked to.
            let unlinkedNeighbourCells = cell.getUnlinkedNeighbours();

            // Prefer to link 2 deadend cells together.
            let candidates = _.filter(unlinkedNeighbourCells, (cell) => cell.isDeadend());

            // If that didn't work, fall back to all possible neighbour cells again.
            if (candidates.length == 0) candidates = unlinkedNeighbourCells;

            // Randomly choose one of the potential neighbours to link to.
            cell.linkTo(_.sample(candidates));
        }

        return this;
    }

    /**
     * Clears a grid by setting up a new array of unlinked cells.
     *
     * @param {boolean} markCellsEmpty
     */
    clear(markCellsEmpty) {
        this._cells = [];

        let x, y;
        for (y = 0; y < this._rows; y++) {
            for (x = 0; x < this._cols; x++) {
                this._cells.push(new Cell(x, y, markCellsEmpty));
            }
        }

        for (y = 0; y < this._rows; y++) {
            for (x = 0; x < this._cols; x++) {
                let cell = this.getCell(x, y);
                if (y > 0)              cell.setNeighbour('N', this.getCell(x, y - 1));
                if (x < this._cols - 1) cell.setNeighbour('E', this.getCell(x + 1, y));
                if (y < this._rows - 1) cell.setNeighbour('S', this.getCell(x, y + 1));
                if (x > 0)              cell.setNeighbour('W', this.getCell(x - 1, y));
            }
        }
    }

    /**
     * Finds all shortest path from a starting point to a finish point.
     *
     * @param {Cell} start
     * @param {Cell} finish
     * @returns {[[Cell]]} an array of paths
     */
    findShortestPaths(start, finish) {
        if (!start || !finish) return [];

        let distance = 0;
        let distances = _.fill(new Array(this._cells.length), null);
        let visitedCells = [start];
        let frontier = [start];

        // Keep "flooding" the maze, starting from one point and increasing the radius one by one, until there are no more unvisited cells to examine. The result is an array with each cell's distance to the starting point.
        while (frontier.length > 0) {
            let newFrontier = [];

            for (let cell of frontier) {
                distances[this.getCellIndex(cell)] = distance;

                let neighbourCells = cell.getLinkedNeighbours();
                for (let unvisitedNeighbourCell of _.difference(neighbourCells, visitedCells)) {
                    visitedCells.push(unvisitedNeighbourCell);
                    newFrontier.push(unvisitedNeighbourCell);
                }
            }

            distance++;
            frontier = newFrontier;
        }

        let paths = [[finish]];
        let pathsGrew;

        // Start at the finish and walk backwards onto cells of lower distance towards the starting point. At junctions, clone the current path and follow each path individually.
        do {
            let newPaths = [];

            pathsGrew = false;
            for (let path of paths) {
                let cell = _.last(path);
                let neighbourCells = cell.getLinkedNeighbours();

                let lowerNeighboursCells = [];
                for (let neighbourCell of neighbourCells) {
                    if (distances[this.getCellIndex(neighbourCell)] < distances[this.getCellIndex(cell)]) {
                        lowerNeighboursCells.push(neighbourCell);
                    }
                }

                if (lowerNeighboursCells.length > 0) {
                    pathsGrew = true;

                    // Take the first one.
                    let firstLowerNeighbourCell = lowerNeighboursCells.shift();

                    // Make new paths for the other lower neighbours cells, if there are any.
                    for (let lowerNeighbourCell of lowerNeighboursCells) {
                        let newPath = _.clone(path);
                        newPath.push(lowerNeighbourCell);
                        newPaths.push(newPath);
                    }

                    // Append the first lower neighbour cell to the current path array.
                    path.push(firstLowerNeighbourCell);
                }
            }

            for (let newPath of newPaths) {
                paths.push(newPath);
            }
        } while (pathsGrew);

        return paths;
    }

    /**
     * Returns the cell on the given location.
     *
     * @param {number} x
     * @param {number} y
     * @returns {Cell}
     */
    getCell(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);

        return this._cells[y * this._cols + x];
    }

    /**
     * Returns a cell's array index.
     *
     * @param {Cell} cell
     * @returns {number}
     */
    getCellIndex(cell) {
        return cell.getY() * this._cols + cell.getX();
    }

    /**
     * Returns all cells.
     *
     * @returns {Cell[]}
     */
    getCells() {
        return this._cells;
    }

    /**
     * Returns the width of the grid.
     *
     * @returns {number}
     */
    getColumnCount() {
        return this._cols;
    }

    /**
     * Returns the height of the grid.
     *
     * @returns {number}
     */
    getRowCount() {
        return this._rows;
    }

    /**
     * Returns a random cell out of the grid.
     *
     * @returns {Grid}
     */
    getRandomCell() {
        return _.sample(this._cells);
    }

    /**
     * Encodes the grid into its short object notation.
     *
     * @returns {{cols: (number), rows: (number), cells: Cell[]}}
     */
    toShortObject() {
        return {cols: this._cols, rows: this._rows, cells: _.map(this._cells, (cell) => cell.toShortObject())};
    }

    /**
     * Returns a string representation.
     *
     * @returns {string}
     */
    toString() {
        let top, bottom, j, i, cell;
        let output = '+' + new Array(this._cols + 1).join('---+') + "\n";

        for (j = 0; j < this._rows; j++) {
            top = '|';
            bottom = '+';

            for (i = 0; i < this._cols; i++) {
                cell = this.getCell(i, j);

                top += '   ' + (cell.getLinkedNeighbourInDirection(90) ? ' ' : '|');
                bottom += (cell.getLinkedNeighbourInDirection(180) ? '   ' : '---') + '+';
            }

            output += top + "\n";
            output += bottom + (j < this._rows - 1 ? "\n" : '');
        }

        return output;
    }

}
