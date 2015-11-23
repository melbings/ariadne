import React from 'react';

export default React.createClass({

    _handleMinusClick: function () {
        let newSpeed = Math.max(1, this.state.speed - 1);
        this.setState({speed: newSpeed});
        this.props.onSpeedChange(newSpeed);
    },

    _handlePlusClick: function () {
        let newSpeed = Math.min(7, this.state.speed + 1);
        this.setState({speed: newSpeed});
        this.props.onSpeedChange(newSpeed);
    },

    propTypes: {
        initialSpeed: React.PropTypes.number.isRequired,
        interpreterState: React.PropTypes.string,
        onPauseClick: React.PropTypes.func.isRequired,
        onResetClick: React.PropTypes.func.isRequired,
        onRunClick: React.PropTypes.func.isRequired,
        onSpeedChange: React.PropTypes.func.isRequired,
        onStepClick: React.PropTypes.func.isRequired,
        onStopClick: React.PropTypes.func.isRequired
    },

    getInitialState: function () {
        return {
            speed: this.props.initialSpeed
        };
    },

    render: function () {
        let control1, control2, control3;

        switch (this.props.interpreterState) {
            case 'READY':
                control1 = <button className="executioncontrol" disabled><i className="fa fa-stop"/></button>;
                control2 = <button className="executioncontrol-center" onClick={this.props.onRunClick}><i className="fa fa-play"/></button>;
                control3 = <button className="executioncontrol" onClick={this.props.onStepClick}><i className="fa fa-step-forward"/></button>;
                break;

            case 'RUNNING':
                control1 = <button className="executioncontrol" onClick={this.props.onStopClick}><i className="fa fa-stop"/></button>;
                control2 = <button className="executioncontrol-center" disabled><i className="fa fa-play"/></button>;
                control3 = <button className="executioncontrol" onClick={this.props.onPauseClick}><i className="fa fa-pause"/></button>;
                break;

            case 'STEPPING':
                control1 = <button className="executioncontrol" onClick={this.props.onStopClick}><i className="fa fa-stop"/></button>;
                control2 = <button className="executioncontrol-center" disabled><i className="fa fa-play"/></button>;
                control3 = <button className="executioncontrol" disabled><i className="fa fa-step-forward"/></button>;
                break;

            case 'PAUSED':
                control1 = <button className="executioncontrol" onClick={this.props.onStopClick}><i className="fa fa-stop"/></button>;
                control2 = <button className="executioncontrol-center" onClick={this.props.onRunClick}><i className="fa fa-play"/></button>;
                control3 = <button className="executioncontrol" onClick={this.props.onStepClick}><i className="fa fa-step-forward"/></button>;
                break;

            case 'FINISHED':
                control1 = <button className="executioncontrol" disabled><i className="fa fa-stop"/></button>;
                control2 = <button className="executioncontrol-center" onClick={this.props.onResetClick}><i className="fa fa-repeat"/></button>;
                control3 = <button className="executioncontrol" disabled><i className="fa fa-step-forward"/></button>;
                break;
        }

        return (
            <div className="controls-component">
                <div className="speedcontrol-container">
                    <button className="speedcontrol" onClick={this._handleMinusClick} disabled={this.state.speed == 1}><i className="fa fa-minus"/></button>
                    <img className="speedometer" src={"res/controls/speedometer" + this.state.speed + ".png"}/>
                    <button className="speedcontrol" onClick={this._handlePlusClick} disabled={this.state.speed == 7}><i className="fa fa-plus"/></button>
                </div>
                <div className="executioncontrol-container">
                    {control1}
                    {control2}
                    {control3}
                </div>
            </div>
        );
    }
});