import $ from 'jquery';
import React from 'react';

export default React.createClass({

    showAboutDialog: function () {
        this._showDialog({dialog: 'ABOUT', initialFocus: 'modal-about-ok'});
    },

    showHelpDialog: function () {
        this._showDialog({dialog: 'HELP', initialFocus: 'modal-help-ok'});
    },

    showLoadAlgorithmDialog: function (loadAlgorithmCallback) {
        this._showDialog({dialog: 'LOAD_ALGORITHM', details: {loadAlgorithmCallback: loadAlgorithmCallback}, initialFocus: 'modal-load_algorithm-algorithm'});
    },

    showLoadMazeDialog: function (loadMazeCallback) {
        this._showDialog({dialog: 'LOAD_MAZE', details: {loadMazeCallback: loadMazeCallback}, initialFocus: 'modal-load_maze-maze'});
    },

    showSaveAlgorithmDialog: function (algorithm) {
        this._showDialog({dialog: 'SAVE_ALGORITHM', details: {algorithm: algorithm}, initialFocus: 'modal-save_algorithm-algorithm'});
    },

    showNewMazeDialog: function (lastSize, lastLongPassages, lastCycles, newMazeCallback) {
        this._showDialog({dialog: 'NEW_MAZE', details: {lastSize: lastSize, lastLongPassages: lastLongPassages, lastCycles: lastCycles, newMazeCallback: newMazeCallback}, initialFocus: 'modal-new_maze-ok'});
    },

    showSaveMazeDialog: function (maze) {
        this._showDialog({dialog: 'SAVE_MAZE', details: {maze: maze}, initialFocus: 'modal-save_maze-maze'});
    },

    _handleGreyoutClick: function (event) {
        if (event.target == event.currentTarget) {
            this._hideDialog();
        }
    },

    _handleLoadAlgorithm: function () {
        if (this.state.details.loadAlgorithmCallback(this.refs.algorithm.getDOMNode().value)) {
            this._hideDialog();
        } else {
            this._showDialog({error: 'The provided algorithm description is invalid.'})
        }
    },

    _handleLoadMaze: function () {
        if (this.state.details.loadMazeCallback(this.refs.maze.getDOMNode().value)) {
            this._hideDialog();
        } else {
            this._showDialog({error: 'The provided maze description is invalid.'})
        }
    },

    _handleNewMaze: function () {
        this.state.details.newMazeCallback(
            this.refs['size'].getDOMNode().value,
            this.refs['longPassages'].getDOMNode().value == '1',
            this.refs['cycles'].getDOMNode().value == '1'
        );
        this._hideDialog();
    },

    _hideDialog: function () {
        $(document).off('keydown');
        this.setState(this.getInitialState());
    },

    _showDialog: function (state) {
        this.setState(state);

        $(document).keydown((e) => {
            if (e.keyCode == 27) {
                this._hideDialog();
            }
        });
    },

    // React code below

    getInitialState: function () {
        return {
            details: null,
            dialog: null,
            error: null,
            initialFocus: null
        }
    },

    render: function () {
        let content;

        switch (this.state.dialog) {
            case 'ABOUT':
                content = (
                    <div className="modal-content">
                        <h1>About</h1>
                        <div className="about">
                            Ariadne v##VERSION## <i className="fa fa-copyright"/> 2015 <a href="mailto:stefan.melbinger@gmail.com">Stefan Melbinger</a><br/>
                            <br/>
                            Ariadne was created for Vienna University of Technology's <a href="http://www.informatik.tuwien.ac.at/studium/studierende/prolog">PROLOG lectures</a> about algorithms, held by Ao.Univ.Prof. Dipl.-Ing. Dr.techn. Gerald Futschek, Univ. Doz.<br/>
                            <br/>
                            Ariadne makes use of the following external resources:<br/>
                            <ul>
                                <li>The <a href="https://developers.google.com/blockly/">Blockly</a> visual programming editor library, <i className="fa fa-copyright"/> Google, released under the <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache 2.0 License</a></li>
                                <li><a href="https://blockly-games.appspot.com/">Blockly Games</a>, <i className="fa fa-copyright"/> Google, released as free and open source</li>
                                <li>The <a href="https://facebook.github.io/react/">React</a> JavaScript library, released under the <a href="https://github.com/facebook/react/blob/master/LICENSE">BSD license</a></li>
                                <li>The <a href="https://jquery.org/">jQuery</a> and <a href="https://lodash.com/">lodash</a> JavaScript libraries, released under the <a href="https://opensource.org/licenses/MIT">MIT license</a></li>
                                <li>The <a href="https://necolas.github.io/normalize.css/">normalize.css</a> CSS reset script released under the <a href="https://opensource.org/licenses/MIT">MIT license</a></li>
                                <li>Several <a href="http://fontawesome.io">Font Awesome</a> icons</li>
                                <li>The &quot;luck&quot; icon designed by <a href="http://www.freepik.com/">Freepik</a>, released under <a href="http://creativecommons.org/licenses/by/3.0/">Creative Commons BY 3.0</a></li>
                                <li>The &quot;speedometer&quot; icon designed by Ionicons and provided by <a href="http://www.uxrepo.com/">UX Repo</a></li>
                            </ul>
                        </div>
                        <div className="button-separator"/>
                        <div className="buttons">
                            <button id="modal-about-ok" onClick={this._hideDialog}>OK</button>
                        </div>
                    </div>
                );
                break;

            case 'HELP':
                content = (
                    <div className="modal-content">
                        <h1>Help</h1>
                        <div className="help">
                            First, <b>generate a maze</b> by selecting <em>Maze</em> &gt; <em>New</em>.<br/>
                            <br/>
                            Then, you can <b>build an algorithm</b> by either:<br/>
                            <ul>
                                <li>using blocks taken from the various block categories<br/></li>
                                &ndash; or &ndash;<br/>
                                <li>loading a predefined algorithm by selecting one from the <em>Algorithm</em> menu.</li>
                            </ul>
                            Finally, <b>run your algorithm</b> by pressing the Play button (<i className="fa fa-play" />).
                        </div>
                        <div className="button-separator"/>
                        <div className="buttons">
                            <button id="modal-help-ok" onClick={this._hideDialog}>OK</button>
                        </div>
                    </div>
                );
                break;

            case 'LOAD_ALGORITHM':
                content = (
                    <div className="modal-content">
                        <h1>Load algorithm</h1>
                        <div className="save-algorithm">
                            Please paste the algorithm XML:<br/>
                            <br/>
                            <textarea id="modal-load_algorithm-algorithm" className="algorithm" ref="algorithm"/>
                        </div>
                        {this.state.error ? <div className="error">{this.state.error}</div> : null}
                        <div className="button-separator"/>
                        <div className="buttons">
                            <button onClick={this._hideDialog}>Cancel</button>
                            <button onClick={this._handleLoadAlgorithm}>OK</button>
                        </div>
                    </div>
                );
                break;

            case 'LOAD_MAZE':
                content = (
                    <div className="modal-content">
                        <h1>Load maze</h1>
                        <div className="save-algorithm">
                            Please paste the maze JSON:<br/>
                            <br/>
                            <textarea id="modal-load_maze-maze" className="maze" ref="maze"/>
                        </div>
                        {this.state.error ? <div className="error">{this.state.error}</div> : null}
                        <div className="button-separator"/>
                        <div className="buttons">
                            <button onClick={this._hideDialog}>Cancel</button>
                            <button onClick={this._handleLoadMaze}>OK</button>
                        </div>
                    </div>
                );
                break;

            case 'NEW_MAZE':
                let size = this.state.details.lastSize != null ? this.state.details.lastSize : 12;
                let longPassages = this.state.details.lastLongPassages != null ? this.state.details.lastLongPassages : false;
                let cycles = this.state.details.lastCycles != null ? this.state.details.lastCycles : true;

                content = (
                    <div className="modal-content">
                        <h1>New maze</h1>
                        <div className="save-algorithm">
                            What should the new maze look like?<br/>
                            <br/>
                            Size:
                            <select ref="size" defaultValue={size}>
                                <option value="6">X-Small (6x6)</option>
                                <option value="9">Small (9x9)</option>
                                <option value="12">Medium (12x12)</option>
                                <option value="15">Large (15x15)</option>
                                <option value="21">X-Large (21x21)</option>
                            </select><br/>
                            <br/>
                            Passages:
                            <select ref="longPassages" defaultValue={longPassages ? 1 : 0}>
                                <option value="0">Normal passages</option>
                                <option value="1">Long passages</option>
                            </select><br/>
                            <br/>
                            Cycles:
                            <select ref="cycles" defaultValue={cycles ? 1 : 0}>
                                <option value="1">Cycles</option>
                                <option value="0">No cycles</option>
                            </select>
                        </div>
                        <div className="button-separator"/>
                        <div className="buttons">
                            <button onClick={this._hideDialog}>Cancel</button>
                            <button id="modal-new_maze-ok" onClick={this._handleNewMaze}>OK</button>
                        </div>
                    </div>
                );
                break;

            case 'SAVE_ALGORITHM':
                content = (
                    <div className="modal-content">
                        <h1>Save algorithm</h1>
                        <div className="save-algorithm">
                            Copy the following XML to your clipboard and save it to a local file:<br/>
                            <br/>
                            <textarea id="modal-save_algorithm-algorithm" defaultValue={this.state.details.algorithm}/>
                        </div>
                        <div className="button-separator"/>
                        <div className="buttons">
                            <button onClick={this._hideDialog}>OK</button>
                        </div>
                    </div>
                );
                break;

            case 'SAVE_MAZE':
                content = (
                    <div className="modal-content">
                        <h1>Save maze</h1>
                        <div className="save-maze">
                            Copy the following JSON to your clipboard and save it to a local file:<br/>
                            <br/>
                            <textarea id="modal-save_maze-maze" defaultValue={this.state.details.maze}/>
                        </div>
                        <div className="button-separator"/>
                        <div className="buttons">
                            <button onClick={this._hideDialog}>OK</button>
                        </div>
                    </div>
                );
                break;

            default:
                return null;
        }

        return (
            <div className="greyout" onClick={this._handleGreyoutClick}>
                <div className="modal-container">
                    {content}
                </div>
            </div>
        );
    },

    componentDidUpdate: function (prevProps, prevState) {
        $('.modal-content textarea').focus(function() {
            $(this).select();
        });

        if (this.state.initialFocus !== null) {
            $('#' + this.state.initialFocus).focus();
        }
    }

});
