import $ from 'jquery';
import React from 'react';

export default React.createClass({

    addReservedWordsToBlockly(words) {
        Blockly.JavaScript.RESERVED_WORDS_ = this._originalReservedWords;
        Blockly.JavaScript.addReservedWords(words);
    },

    clear() {
        this._workspace.clear();
    },

    getCode: function (statementPrefix) {
        Blockly.JavaScript.STATEMENT_PREFIX = statementPrefix;
        return Blockly.JavaScript.workspaceToCode(this._workspace);
    },

    getXmlText: function () {
        return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this._workspace));
    },

    highlightBlock: function (id) {
        this._workspace.traceOn(true);
        this._workspace.highlightBlock(id);
    },

    loadXmlText: function (xmlText) {
        this._workspace.clear();
        Blockly.Xml.domToWorkspace(this._workspace, Blockly.Xml.textToDom(xmlText));
    },

    setReadOnly: function (readOnly) {
        this._workspace.options.readOnly = readOnly;
        if (readOnly) {
            $('.blocklyToolboxDiv').hide();
        } else {
            $('.blocklyToolboxDiv').show();
        }
    },

    // REACT CODE BELOW

    propTypes: {
        toolbox: React.PropTypes.string.isRequired,
        customBlocks: React.PropTypes.object
    },

    componentDidMount: function () {
        this._blocklyDiv = React.findDOMNode(this);
        this._blocklyArea = this._blocklyDiv.parentElement;

        $(() => {
            if (this.props.customBlocks) this.props.customBlocks.loadBlocksIntoBlockly(Blockly);

            this._workspace = Blockly.inject(this._blocklyDiv,
                {
                    grid: {
                        spacing: 25,
                        length: 3,
                        colour: '#ccc',
                        snap: false
                    },
                    scrollbars: true,
                    media: './blockly/blockly-media/',
                    toolbox: this.props.toolbox,
                    trashcan: true,
                    zoom: {
                        enabled: true
                    }
                });
            this._originalReservedWords = Blockly.JavaScript.RESERVED_WORDS_;

            window.addEventListener('resize', this._onWindowResize, false);
            this._onWindowResize();
        });
    },

    // Re-rendering Blockly is not supported because initialization of toolbox and workspace happen only once.
    shouldComponentUpdate: function (nextProps, nextState) {
        return false;
    },

    render: function () {
        return (
            <div className="blockly-component">
                {this.props.children}
            </div>
        );
    },

    componentWillUnmount: function () {
        window.removeEventListener('resize', this._onWindowResize, false);
    },

    _onWindowResize: function (event) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        let element = this._blocklyArea;
        let x = 0;
        let y = 0;

        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);

        // Position blocklyDiv over blocklyArea.
        this._blocklyDiv.style.left = x + 'px';
        this._blocklyDiv.style.top = y + 'px';
        this._blocklyDiv.style.width = this._blocklyArea.offsetWidth + 'px';
        this._blocklyDiv.style.height = this._blocklyArea.offsetHeight + 'px';
    }

});
