import _ from 'lodash';

export default class EnhancedInterpreter {

    constructor(runtimeLibrary, stateListenerCallback, statementDelay) {
        this._blockStarting = null;
        this._code = null;
        this._continuous = null;
        this._interpreter = null; // Initialized by loadProgram()
        this._statementDelay = statementDelay;
        this._parallelOperationInProgress = false;
        this._pendingState = null;
        this._runtimeLibrary = runtimeLibrary;
        this._stateListenerCallback = stateListenerCallback;
        this._setState('READY');
    }

    loadProgram(code) {
        this._blockStarting = null;
        this._code = code;
        this._interpreter = new Interpreter(code, (interpreter, scope) => {
            if (this._runtimeLibrary) this._runtimeLibrary.initializeInterpreter(this, interpreter, scope);
        });
        this._parallelOperationInProgress = false;
        this._pendingState = null;
        this._setState('READY');
    }

    notifyBlockStarting() {
        this._blockStarting = true;
    }

    pause() {
        if (this._state != 'RUNNING') {
            throw new Error('EnhancedInterpreter::pause(): Expected state RUNNING, got ' + this._state);
        }

        this._setState('PAUSED');
    }

    parallelOperationStarted() {
        this._parallelOperationInProgress = true;
    }

    parallelOperationFinished() {
        this._parallelOperationInProgress = false;

        if (this._pendingState != null) {
            this._setState(this._pendingState);
            this._pendingState = null;
        }

        if (this._state == 'RUNNING' || this._state == 'STEPPING') {
            this._interpret();
        }
    }

    run() {
        if (this._state != 'READY' && this._state != 'PAUSED') {
            throw new Error('EnhancedInterpreter::run(): Expected state READY or PAUSED, got ' + this._state);
        }

        if (this._code == null) {
            this._setState('READY');
        } else {
            this._continuous = true;
            this._setState('RUNNING');
            this._interpret();
        }
    }

    setStatementDelay(statementDelay) {
        this._statementDelay = statementDelay;
    }

    step() {
        if (this._state != 'READY' && this._state != 'PAUSED') {
            throw new Error('EnhancedInterpreter::step(): Expected state READY or PAUSED, got ' + this._state);
        }

        if (this._code == null) {
            this._setState('READY');
        } else {
            this._continuous = false;
            this._setState('STEPPING');
            this._interpret();
        }
    }

    stop() {
        // Reload the current program. This will set state READY.
        this.loadProgram(this._code);
    }

    _interpret() {
        let moreMicroSteps = this._interpreter.stateStack.length > 0;

        while (moreMicroSteps && (this._state == 'RUNNING' || this._state == 'STEPPING') && !this._parallelOperationInProgress) {
            try {
                moreMicroSteps = this._interpreter.step();
            } catch (e) {
                // Ignore errors and keep trying to run the code.
            }

            // When a new block is starting, this means that there are no more microsteps to perform for the previous statement.
            if (this._blockStarting) {
                this._blockStarting = null;

                if (this._continuous) {
                    _.delay(() => this._interpret(), this._statementDelay);
                } else {
                    this._setState('PAUSED');
                }

                break;
            }
        }

        if (!moreMicroSteps) {
            this._setState('FINISHED');
        }
    }

    _setState(state) {
        if (this._parallelOperationInProgress) {
            this._pendingState = state;
        } else {
            this._state = state;
            this._stateListenerCallback(state);
        }
    }

}