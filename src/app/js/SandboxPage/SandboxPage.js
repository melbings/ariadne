import AriadneBlocks from '../CustomBlocks/AriadneBlocks';
import AriadneRuntimeLibrary from '../CustomBlocks/AriadneRuntimeLibrary';
import Avatar from '../Components/Maze/Overlays/Avatar';
import BlocklyComponent from '../Components/BlocklyComponent';
import ControlsComponent from '../Components/ControlsComponent';
import EnhancedInterpreter from '../Classes/EnhancedInterpreter';
import Finish from '../Components/Maze/Overlays/Finish';
import Grid from '../Components/Maze/Grid';
import MazeComponent from '../Components/Maze/MazeComponent';
import MazeController from '../Components/Maze/MazeController';
import NavigationBarComponent from '../Components/NavigationBarComponent';
import React from 'react';
import SandboxDialogs from './SandboxDialogs';

const _SPEED_LEVELS = [
    {statementDelay: 500, animationFrameTime: 1000},
    {statementDelay: 400, animationFrameTime: 800},
    {statementDelay: 300, animationFrameTime: 600},
    {statementDelay: 200, animationFrameTime: 400},
    {statementDelay: 100, animationFrameTime: 200},
    {statementDelay: 25, animationFrameTime: 50},
    {statementDelay: 0, animationFrameTime: 0}
];

const _TOOLBOX = `
    <xml>
        <category name="Single avatar">
            <block type="single_found_finish"></block>
            <block type="single_get_number_of_unvisited_paths"></block>
            <block type="single_get_thread_length"></block>
            <block type="single_lay_out_thread"></block>
            <block type="single_mark_visited_cells"></block>
            <block type="single_follow_path"></block>
            <block type="single_backtrace"></block>
            <block type="single_say"></block>
        </category>
        <category name="Multiple avatars">
            <block type="multi_get_initial_avatar"></block>
            <block type="multi_get_avatars"></block>
            <block type="multi_found_finish"></block>
            <block type="multi_get_number_of_unvisited_paths"></block>
            <block type="multi_get_thread_length"></block>
            <block type="multi_lay_out_thread"></block>
            <block type="multi_mark_visited_cells"></block>
            <block type="multi_step_onto_unvisited_cell"></block>
            <block type="multi_split_up"></block>
            <block type="multi_give_up"></block>
            <block type="multi_say"></block>
        </category>
        <sep></sep>
        <category name="Logic">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_negate"></block>
            <block type="logic_boolean"></block>
        </category>
        <category name="Loops">
            <block type="controls_whileUntil"></block>
            <block type="controls_for">
                <value name="FROM">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="TO">
                    <block type="math_number">
                        <field name="NUM">10</field>
                    </block>
                </value>
                <value name="BY">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
            </block>
            <block type="controls_forEach"></block>
            <block type="controls_flow_statements"></block>
        </category>
        <category name="Math">
            <block type="math_number"></block>
            <block type="math_arithmetic"></block>
            <block type="math_change">
                <value name="DELTA">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
            </block>
        </category>
        <category name="Text">
            <block type="text"></block>
            <block type="text_join"></block>
        </category>
        <category name="Lists">
            <block type="lists_subtract"></block>
            <block type="lists_create_empty"></block>
            <block type="lists_create_with"></block>
            <block type="lists_length"></block>
            <block type="lists_isEmpty"></block>
            <block type="lists_getIndex">
                <value name="VALUE">
                    <block type="variables_get">
                        <field name="VAR" class="listVar">...</field>
                    </block>
                </value>
            </block>
            <block type="lists_setIndex">
                <value name="LIST">
                    <block type="variables_get">
                        <field name="VAR" class="listVar">...</field>
                    </block>
                </value>
            </block>
            <block type="lists_split">
                <value name="DELIM">
                    <block type="text">
                        <field name="TEXT">,</field>
                    </block>
                </value>
            </block>
        </category>
        <sep></sep>
        <category name="Variables" custom="VARIABLE"></category>
    </xml>
`;

export default React.createClass({
    _ariadneBlocks: null,
    _ariadneRuntimeLibrary: null,
    _blocklyComponent: null,
    _enhancedInterpreter: null,
    _lastCycles: null,
    _lastLongPassages: null,
    _lastSize: null,
    _mazeController: null,
    _speedLevel: 4,

    clearAlgorithm: function () {
        this._blocklyComponent.clear();
    },

    enhancedInterpreterCallback: function (event) {
        this.setState({interpreterState: event});
        if (event == 'FINISHED') this._blocklyComponent.highlightBlock(null);
    },

    generateMaze: function (algorithm, cols, rows, braid, options) {
        let grid;

        if (algorithm !== null) {
            grid = Grid.generate(algorithm, cols, rows, braid, options);
        } else {
            grid = Grid.generate(); // Rely on default settings.
        }

        this._loadGrid(grid);
    },

    mazeControllerCallback: function (event) {
        switch (event) {
            case 'AVATAR_STEPPED':
                this.setState({steps: this.state.steps + 1});
                break;

            case 'PARALLEL_OPERATION_STARTED':
                this.setState({animationInProgress: true});
                this._enhancedInterpreter.parallelOperationStarted();
                break;

            case 'PARALLEL_OPERATION_FINISHED':
                this.setState({animationInProgress: false});
                this._enhancedInterpreter.parallelOperationFinished();
                break;
        }
    },

    showLoadAlgorithmDialog: function () {
        this._sandboxDialogs.showLoadAlgorithmDialog((algorithm) => {
            try {
                this.loadAlgorithm(algorithm);
                return true;
            } catch (e) {
                return false;
            }
        });
    },

    showLoadMazeDialog: function () {
        this._sandboxDialogs.showLoadMazeDialog((mazeJSON) => {
            try {
                this._mazeController.loadMaze(JSON.parse(mazeJSON));
                return true;
            } catch (e) {
                return false;
            }
        });
    },

    showNewMazeDialog: function () {
        this._sandboxDialogs.showNewMazeDialog(this._lastSize, this._lastLongPassages, this._lastCycles, (size, longPassages, cycles) => {
            this._lastCycles = cycles;
            this._lastLongPassages = longPassages;
            this._lastSize = size;

            let grid = Grid.generate('GT', size, size, cycles, {mode: longPassages ? 'LAST' : 'MIX'});
            this._loadGrid(grid);
        });
    },

    loadAlgorithm: function (algorithm) {
        this._blocklyComponent.loadXmlText(algorithm);
    },

    showSaveAlgorithmDialog: function () {
        this._sandboxDialogs.showSaveAlgorithmDialog(this._blocklyComponent.getXmlText());
    },

    showSaveMazeDialog: function () {
        this._sandboxDialogs.showSaveMazeDialog(this._mazeController.toJSON());
    },

    pause: function () {
        this._enhancedInterpreter.pause();
    },

    reset: function () {
        this._enhancedInterpreter.stop();
        this.setState({executionInProgress: false, steps: null});
        this._blocklyComponent.highlightBlock(null);
        this._blocklyComponent.setReadOnly(false);
        this._mazeController.reset(false);
        this._mazeController.draw();
    },

    run: function () {
        this.setState({executionInProgress: true});
        this._blocklyComponent.setReadOnly(true);
        this._run(true);
    },

    setSpeed: function (speed) {
        this._speedLevel = speed;
        this._enhancedInterpreter.setStatementDelay(_SPEED_LEVELS[speed - 1].statementDelay);
        this._mazeController.setAnimationFrameTime(_SPEED_LEVELS[speed - 1].animationFrameTime);
    },

    showAboutDialog: function () {
        this._sandboxDialogs.showAboutDialog();
    },

    showHelpDialog: function () {
        this._sandboxDialogs.showHelpDialog();
    },

    step: function () {
        this.setState({executionInProgress: true});
        this._blocklyComponent.setReadOnly(true);
        this._run(false);
    },

    stop: function () {
        this._enhancedInterpreter.stop();
        this.setState({executionInProgress: false, steps: null});
        this._blocklyComponent.highlightBlock(null);
        this._blocklyComponent.setReadOnly(false);
        this._mazeController.reset(false);
        this._mazeController.draw();
    },

    showSolutions: function (show) {
        this._mazeController.showSolutions(show);
        this._mazeController.draw();
    },

    _loadGrid: function (grid) {
        this._enhancedInterpreter.stop();

        let startX = Math.floor(Math.random() * grid.getColumnCount());
        let startY = Math.floor(Math.random() * grid.getRowCount());
        let direction = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        let avatar = new Avatar(startX, startY, direction);

        let finishX, finishY;
        do {
            finishX = Math.floor(Math.random() * grid.getColumnCount());
            finishY = Math.floor(Math.random() * grid.getRowCount());
        } while (finishX == startX && finishY == startY);
        let finish = new Finish(finishX, finishY);

        this._mazeController.setMaze(grid, avatar, finish);
        this._mazeController.draw();
        this.setState({steps: null, gridLoaded: true});
    },

    _run: function (continuous) {
        if (this.state.interpreterState == 'READY') {
            this.setState({steps: 0});
            this._enhancedInterpreter.loadProgram(this._blocklyComponent.getCode(this._ariadneRuntimeLibrary.getStatementPrefixCode()));
            this._mazeController.storeOverlays();
        }

        if (continuous) {
            this._enhancedInterpreter.run();
        } else {
            this._enhancedInterpreter.step();
        }
    },

    // REACT CODE BELOW

    componentWillMount: function () {
        this._ariadneBlocks = new AriadneBlocks();
    },

    getInitialState: function () {
        return {
            animationInProgress: false,
            executionInProgress: false,
            interpreterState: null,
            gridLoaded: false,
            speed: 4,
            steps: null
        }
    },

    render: function () {
        let hint = null;
        if (this.state.gridLoaded && (this.state.interpreterState == 'INITIALIZED' || this.state.interpreterState == 'READY')) {
            hint = (
                <div className="hint">
                    <b>Hint:</b> You can still drag and drop the avatar and the finish marker before executing your
                    algorithm. Click on the avatar to change its direction.
                </div>
            );
        }

        let steps = null;
        if (this.state.steps !== null) {
            steps = (
                <div className="steps">
                    <b>{this.state.steps}</b> steps
                </div>
            );
        }

        return (
            <div className="page">
                <div className="sandbox">
                    <NavigationBarComponent
                        executionInProgress={this.state.executionInProgress}
                        gridLoaded={this.state.gridLoaded}
                        onAboutClick={this.showAboutDialog}
                        onClearAlgorithmClick={this.clearAlgorithm}
                        onHelpClick={this.showHelpDialog}
                        onLoadAlgorithmClick={this.showLoadAlgorithmDialog}
                        onLoadMazeClick={this.showLoadMazeDialog}
                        onLoadPredefinedAlgorithmClick={this.loadAlgorithm}
                        onNewMazeClick={this.showNewMazeDialog}
                        onSaveAlgorithmClick={this.showSaveAlgorithmDialog}
                        onSaveMazeClick={this.showSaveMazeDialog}
                        onShowSolutionsChange={this.showSolutions}
                    />
                    <div className="content clearfix">
                        <div className="left">
                            <MazeComponent
                                ref="mazeComponent"
                                width={450}
                                height={450}
                                draggingEnabled={(this.state.interpreterState == 'INITIALIZED' || this.state.interpreterState == 'READY') && !this.state.animationInProgress}
                                onStartupClick={this.generateMaze.bind(this, null)}
                            /><br/>
                            {hint}
                            {steps}
                        </div>
                        <div className="right">
                            <ControlsComponent
                                initialSpeed={this._speedLevel}
                                interpreterState={this.state.interpreterState}
                                onPauseClick={this.pause}
                                onResetClick={this.reset}
                                onRunClick={this.run}
                                onSpeedChange={this.setSpeed}
                                onStepClick={this.step}
                                onStopClick={this.stop}
                            />
                            <div className="blockly-component-wrapper">
                                <BlocklyComponent
                                    ref="blocklyComponent"
                                    toolbox={_TOOLBOX}
                                    customBlocks={this._ariadneBlocks}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <SandboxDialogs ref="sandboxDialogs"/>
            </div>
        );
    },

    componentDidMount: function () {
        this._blocklyComponent = this.refs['blocklyComponent'];
        this._mazeController = new MazeController(this.refs['mazeComponent'], _SPEED_LEVELS[this._speedLevel].animationFrameTime, this.mazeControllerCallback);
        this._ariadneRuntimeLibrary = new AriadneRuntimeLibrary(this._blocklyComponent, this._mazeController);
        this._enhancedInterpreter = new EnhancedInterpreter(this._ariadneRuntimeLibrary, this.enhancedInterpreterCallback, _SPEED_LEVELS[this._speedLevel].statementDelay);
        this._sandboxDialogs = this.refs['sandboxDialogs'];
    }

});