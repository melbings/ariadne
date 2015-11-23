import $ from 'jquery';
import React from 'react';

const _RANDOM_WALK = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="single_lay_out_thread" x="255" y="105"><next><block type="single_mark_visited_cells"><next><block type="controls_whileUntil"><field name="MODE">WHILE</field><value name="BOOL"><block type="logic_negate"><value name="BOOL"><block type="single_found_finish"></block></value></block></value><statement name="DO"><block type="single_follow_path"><field name="FROM">RANDOM</field><field name="CONDITION">NONE</field></block></statement><next><block type="single_say"><value name="MESSAGE"><block type="text_join"><mutation items="2"></mutation><value name="ADD0"><block type="text"><field name="TEXT">Found it! Thread length: </field></block></value><value name="ADD1"><block type="single_get_thread_length"></block></value></block></value></block></next></block></next></block></next></block></xml>';
const _LEFT_WALL = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="single_lay_out_thread" x="255" y="105"><next><block type="single_mark_visited_cells"><next><block type="controls_whileUntil"><field name="MODE">WHILE</field><value name="BOOL"><block type="logic_negate"><value name="BOOL"><block type="single_found_finish"></block></value></block></value><statement name="DO"><block type="single_follow_path"><field name="FROM">LEFT</field><field name="CONDITION">NONE</field></block></statement><next><block type="single_say"><value name="MESSAGE"><block type="text_join"><mutation items="2"></mutation><value name="ADD0"><block type="text"><field name="TEXT">Found it! Thread length: </field></block></value><value name="ADD1"><block type="single_get_thread_length"></block></value></block></value></block></next></block></next></block></next></block></xml>';
const _ARIADNE = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="single_lay_out_thread" x="255" y="105"><next><block type="single_mark_visited_cells"><next><block type="controls_whileUntil"><field name="MODE">WHILE</field><value name="BOOL"><block type="logic_negate"><value name="BOOL"><block type="single_found_finish"></block></value></block></value><statement name="DO"><block type="single_follow_path"><field name="FROM">LEFT</field><field name="CONDITION">AVOID_THREAD</field></block></statement><next><block type="single_say"><value name="MESSAGE"><block type="text_join"><mutation items="2"></mutation><value name="ADD0"><block type="text"><field name="TEXT">Found it! Thread length: </field></block></value><value name="ADD1"><block type="single_get_thread_length"></block></value></block></value></block></next></block></next></block></next></block></xml>';
const _OPTIMISED_ARIADNE = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="single_lay_out_thread" x="255" y="105"><next><block type="single_mark_visited_cells"><next><block type="controls_whileUntil"><field name="MODE">WHILE</field><value name="BOOL"><block type="logic_negate"><value name="BOOL"><block type="single_found_finish"></block></value></block></value><statement name="DO"><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="logic_compare"><field name="OP">GT</field><value name="A"><block type="single_get_number_of_unvisited_paths"></block></value><value name="B"><block type="math_number"><field name="NUM">0</field></block></value></block></value><statement name="DO0"><block type="single_follow_path"><field name="FROM">LEFT</field><field name="CONDITION">AVOID_VISITED</field></block></statement><statement name="ELSE"><block type="single_backtrace"></block></statement></block></statement><next><block type="single_say"><value name="MESSAGE"><block type="text_join"><mutation items="2"></mutation><value name="ADD0"><block type="text"><field name="TEXT">Found it! Thread length: </field></block></value><value name="ADD1"><block type="single_get_thread_length"></block></value></block></value></block></next></block></next></block></next></block></xml>';
const _BFS = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="multi_lay_out_thread" x="127" y="95"><value name="AVATAR"><block type="multi_get_initial_avatar"></block></value><next><block type="multi_mark_visited_cells"><value name="AVATAR"><block type="multi_get_initial_avatar"></block></value><next><block type="variables_set"><field name="VAR">finished</field><value name="VALUE"><block type="logic_boolean"><field name="BOOL">FALSE</field></block></value><next><block type="controls_whileUntil"><field name="MODE">UNTIL</field><value name="BOOL"><block type="variables_get"><field name="VAR">finished</field></block></value><statement name="DO"><block type="controls_forEach"><field name="VAR">avatar</field><value name="LIST"><block type="multi_get_avatars"></block></value><statement name="DO"><block type="variables_set"><field name="VAR">numberOfUnvisitedPaths</field><value name="VALUE"><block type="multi_get_number_of_unvisited_paths"><value name="AVATAR"><block type="variables_get"><field name="VAR">avatar</field></block></value></block></value><next><block type="multi_split_up"><value name="COUNT"><block type="variables_get"><field name="VAR">numberOfUnvisitedPaths</field></block></value><value name="AVATAR"><block type="variables_get"><field name="VAR">avatar</field></block></value></block></next></block></statement><next><block type="controls_forEach"><field name="VAR">avatar</field><value name="LIST"><block type="multi_get_avatars"></block></value><statement name="DO"><block type="multi_step_onto_unvisited_cell"><value name="AVATAR"><block type="variables_get"><field name="VAR">avatar</field></block></value><next><block type="controls_if"><value name="IF0"><block type="multi_found_finish"><value name="AVATAR"><block type="variables_get"><field name="VAR">avatar</field></block></value></block></value><statement name="DO0"><block type="variables_set"><field name="VAR">unfinishedAvatars</field><value name="VALUE"><block type="multi_get_avatars"></block></value><next><block type="lists_subtract"><field name="LIST">unfinishedAvatars</field><value name="VALUE"><block type="variables_get"><field name="VAR">avatar</field></block></value><next><block type="controls_forEach"><field name="VAR">unfinishedAvatar</field><value name="LIST"><block type="variables_get"><field name="VAR">unfinishedAvatars</field></block></value><statement name="DO"><block type="multi_give_up"><value name="AVATAR"><block type="variables_get"><field name="VAR">unfinishedAvatar</field></block></value></block></statement><next><block type="multi_say"><value name="AVATAR"><block type="variables_get"><field name="VAR">avatar</field></block></value><value name="MESSAGE"><block type="text_join"><mutation items="2"></mutation><value name="ADD0"><block type="text"><field name="TEXT">Found it! Thread length: </field></block></value><value name="ADD1"><block type="multi_get_thread_length"><value name="AVATAR"><block type="variables_get"><field name="VAR">avatar</field></block></value></block></value></block></value><next><block type="variables_set"><field name="VAR">finished</field><value name="VALUE"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value><next><block type="controls_flow_statements"><field name="FLOW">BREAK</field></block></next></block></next></block></next></block></next></block></next></block></statement></block></next></block></statement></block></next></block></statement></block></next></block></next></block></next></block></xml>';

export default React.createClass({

    propTypes: {
        executionInProgress: React.PropTypes.bool.isRequired,
        gridLoaded: React.PropTypes.bool.isRequired,
        onAboutClick: React.PropTypes.func.isRequired,
        onClearAlgorithmClick: React.PropTypes.func.isRequired,
        onHelpClick: React.PropTypes.func.isRequired,
        onLoadAlgorithmClick: React.PropTypes.func.isRequired,
        onLoadPredefinedAlgorithmClick: React.PropTypes.func.isRequired,
        onNewMazeClick: React.PropTypes.func.isRequired,
        onSaveAlgorithmClick: React.PropTypes.func.isRequired,
        onSaveMazeClick: React.PropTypes.func.isRequired,
        onShowSolutionsChange: React.PropTypes.func.isRequired
    },

    _handleSolutionToggleClick: function () {
        let showSolutions = !this.state.showSolutions;
        this.setState({showSolutions: showSolutions});
        this.props.onShowSolutionsChange(showSolutions);
    },

    componentDidMount: function () {
        $('.mainmenu-entry')
            .mouseenter(function () {
                $('.submenu', this).addClass('active');
            })
            .mouseleave(function () {
                $('.submenu', this).removeClass('active');
            });

        $('.submenu-entry').click(function () {
            if ($(this).hasClass('disabled')) return;
            $(this).parent('.submenu').removeClass('active');
        })
    },

    getInitialState: function () {
        return {
            showSolutions: false
        }
    },

    render: function () {
        return (
            <div className="navigationbar-component">
                <div className="logo"><span>Ariadne</span></div>
                <nav className="navigation">
                    <ul className="mainmenu">
                        <li className="mainmenu-entry">
                            <span className="mainmenu-title">Maze <i className="fa fa-caret-down"/></span>
                            <ul className="submenu">
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onNewMazeClick)}><img src="res/controls/luck.png" style={{width: '20px', height: '20px', verticalAlign: 'middle', 'marginTop': '-4px'}}/> &nbsp;New</li>
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onLoadMazeClick)}><i className="fa fa-folder-open-o fa-fw"/> &nbsp;Load</li>
                                <li className={'submenu-entry' + (this.props.gridLoaded ? '' : ' disabled')} onClick={(this.props.gridLoaded ? this.props.onSaveMazeClick : null)}><i className="fa fa-floppy-o fa-fw"/> &nbsp;Save</li>
                                <li className="submenu-separator"/>
                                <li className="submenu-entry" onClick={this._handleSolutionToggleClick}><i className={'fa fa-' + (this.state.showSolutions ? 'check-' : '') + 'square-o fa-fw'}/> &nbsp;Show solutions</li>
                            </ul>
                        </li>
                        <li className="mainmenu-entry">
                            <span className="mainmenu-title">Algorithm <i className="fa fa-caret-down"/></span>
                            <ul className="submenu">
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onClearAlgorithmClick)}><i className="fa fa-trash-o fa-fw"/> &nbsp;Clear</li>
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onLoadAlgorithmClick)}><i className="fa fa-folder-open-o fa-fw"/> &nbsp;Load</li>
                                <li className="submenu-entry" onClick={this.props.onSaveAlgorithmClick}><i className="fa fa-floppy-o fa-fw"/> &nbsp;Save</li>
                                <li className="submenu-separator"/>
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onLoadPredefinedAlgorithmClick.bind(null, _RANDOM_WALK))}><i className="fa fa-fw"/> &nbsp;Load Random Walk Algorithm</li>
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onLoadPredefinedAlgorithmClick.bind(null, _LEFT_WALL))}><i className="fa fa-fw"/> &nbsp;Load Left Wall Algorithm</li>
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onLoadPredefinedAlgorithmClick.bind(null, _ARIADNE))}><i className="fa fa-fw"/> &nbsp;Load Simple Ariadne Thread Algorithm</li>
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onLoadPredefinedAlgorithmClick.bind(null, _OPTIMISED_ARIADNE))}><i className="fa fa-fw"/> &nbsp;Load Optimised Ariadne Thread Algorithm</li>
                                <li className={'submenu-entry' + (this.props.executionInProgress ? ' disabled' : '')} onClick={(this.props.executionInProgress ? null : this.props.onLoadPredefinedAlgorithmClick.bind(null, _BFS))}><i className="fa fa-fw"/> &nbsp;Load Breadth-First Algorithm</li>
                            </ul>
                        </li>
                        <li className="mainmenu-entry">
                            <span className="mainmenu-title">Help <i className="fa fa-caret-down"/></span>
                            <ul className="submenu">
                                <li className="submenu-entry" onClick={this.props.onHelpClick}><i className="fa fa-question fa-fw"/> &nbsp;Help</li>
                                <li className="submenu-separator"/>
                                <li className="submenu-entry" onClick={this.props.onAboutClick}><i className="fa fa-info fa-fw"/> &nbsp;About</li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }
});