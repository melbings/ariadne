export default class AriadneBlocks {

    /**
     * Loads custom blocks into a Blockly instance.
     *
     * @param {Blockly} blockly
     */
    loadBlocksIntoBlockly(blockly) {

        // ------------------------------------------------------------
        // LISTS > SUBTRACT
        // ------------------------------------------------------------

        blockly.Blocks['lists_subtract'] = {
            init: function() {
                this.appendValueInput("VALUE")
                    .setCheck(null)
                    .appendField("remove");
                this.appendDummyInput()
                    .appendField("from list")
                    .appendField(new blockly.FieldVariable("item"), "LIST");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(260);
                this.setTooltip('Filters the specified item out of the list.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['lists_subtract'] = function(block) {
            let value_value = blockly.JavaScript.valueToCode(block, 'VALUE', blockly.JavaScript.ORDER_ATOMIC);
            let variable_list = blockly.JavaScript.variableDB_.getName(block.getFieldValue('LIST'), blockly.Variables.NAME_TYPE);

            let i = Blockly.JavaScript.variableDB_.getDistinctName('__index', Blockly.Variables.NAME_TYPE);
            let result = Blockly.JavaScript.variableDB_.getDistinctName('__result', Blockly.Variables.NAME_TYPE);

            return `var ${result} = [];\nfor (var ${i} = 0; ${i} < ${variable_list}.length; ${i}++) {\nif (${variable_list}[${i}] !== ${value_value}) ${result}.push(${variable_list}[${i}]);\n}\n${variable_list} = ${result};\n`;
        };

        // ------------------------------------------------------------
        // MULTI > FOUND FINISH
        // ------------------------------------------------------------

        blockly.Blocks['multi_found_finish'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.appendDummyInput()
                    .appendField("found finish?");
                this.setInputsInline(true);
                this.setOutput(true, "Boolean");
                this.setColour(20);
                this.setTooltip('Returns true if the specified avatar is standing on the finish cell.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_found_finish'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return ['__multi_foundFinish(' + value_avatar + ')', blockly.JavaScript.ORDER_NONE];
        };

        // ------------------------------------------------------------
        // MULTI > GET AVATARS
        // ------------------------------------------------------------

        blockly.Blocks['multi_get_avatars'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("all avatars");
                this.setOutput(true, "Array");
                this.setColour(20);
                this.setTooltip('Returns a list containing all active avatars (i.e. avatars which have not given up their search).');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_get_avatars'] = function(block) {
            return ['__multi_getAvatars()', blockly.JavaScript.ORDER_NONE];
        };


        // ------------------------------------------------------------
        // MULTI > GET INITIAL AVATAR
        // ------------------------------------------------------------

        blockly.Blocks['multi_get_initial_avatar'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("initial avatar");
                this.setOutput(true, "TYPE_AVATAR");
                this.setColour(20);
                this.setTooltip('Returns the initial avatar instance, i.e. the avatar that has been placed into the maze already before algorithm execution.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_get_initial_avatar'] = function(block) {
            return ['__multi_getInitialAvatar()', blockly.JavaScript.ORDER_NONE];
        };

        // ------------------------------------------------------------
        // MULTI > GET NUMBER OF UNVISITED PATHS
        // ------------------------------------------------------------

        blockly.Blocks['multi_get_number_of_unvisited_paths'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("number of unvisited paths seen by avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.setInputsInline(true);
                this.setOutput(true, "Number");
                this.setColour(20);
                this.setTooltip('Returns the number of paths leading away from the specified avatar\'s current position that have not been marked as visited yet.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_get_number_of_unvisited_paths'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return ['__multi_getNumberOfUnvisitedPaths(' + value_avatar + ')', blockly.JavaScript.ORDER_NONE];
        };

        // ------------------------------------------------------------
        // MULTI > GET THREAD LENGTH
        // ------------------------------------------------------------

        blockly.Blocks['multi_get_thread_length'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.appendDummyInput()
                    .appendField("'s thread length");
                this.setInputsInline(true);
                this.setOutput(true, "Number");
                this.setColour(20);
                this.setTooltip('Returns the length of the thread that the specified avatar has laid out. Having walked from the first cell to a neighbouring cell, for example, 1 would be returned.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_get_thread_length'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return ['__multi_getThreadLength(' + value_avatar + ')', blockly.JavaScript.ORDER_NONE];
        };

        // ------------------------------------------------------------
        // MULTI > GIVE UP
        // ------------------------------------------------------------

        blockly.Blocks['multi_give_up'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("tell avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.appendDummyInput()
                    .appendField("to give up");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(290);
                this.setTooltip('Tells the specified avatar to give up its search for the finish and become inactive. Afterwards, the avatar will not react to commands anymore and will not be included in the list returned by the "all avatars" block.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_give_up'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return '__multi_giveUp(' + value_avatar + ');\n';
        };

        // ------------------------------------------------------------
        // MULTI > LAY OUT THREAD
        // ------------------------------------------------------------

        blockly.Blocks['multi_lay_out_thread'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("tell avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.appendDummyInput()
                    .appendField("to start laying out thread");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(290);
                this.setTooltip('Tells the specified avatar to start laying out thread. One can imagine the avatar ramming a plug into the floor, attaching an infinitely long thread to it and subsequently laying out the thread along the chosen paths.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_lay_out_thread'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return '__multi_layOutThread(' + value_avatar + ');\n';
        };

        // ------------------------------------------------------------
        // MULTI > MARK VISITED CELLS
        // ------------------------------------------------------------

        blockly.Blocks['multi_mark_visited_cells'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("tell avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.appendDummyInput()
                    .appendField("to start marking visited cells");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(290);
                this.setTooltip('Tells the specified avatar to mark cells as visited once it walks onto them. One can imagine the avatar painting a sign onto the floor of the cells it is visiting.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_mark_visited_cells'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return '__multi_markVisitedCells(' + value_avatar + ');\n';
        };

        // ------------------------------------------------------------
        // MULTI > SAY
        // ------------------------------------------------------------

        blockly.Blocks['multi_say'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("tell avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.appendDummyInput()
                    .appendField("to say");
                this.appendValueInput("MESSAGE")
                    .setCheck(null);
                this.setInputsInline(true);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(290);
                this.setTooltip('Tells the specified avatar to print a message to the screen.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_say'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            let value_message = blockly.JavaScript.valueToCode(block, 'MESSAGE', blockly.JavaScript.ORDER_ATOMIC);
            return '__multi_say(' + value_avatar + ', ' + value_message + ');\n';
        };

        // ------------------------------------------------------------
        // MULTI > SPLIT UP
        // ------------------------------------------------------------

        blockly.Blocks['multi_split_up'] = {
            init: function() {
                this.appendValueInput("COUNT")
                    .setCheck("Number")
                    .setAlign(blockly.ALIGN_RIGHT)
                    .appendField("make");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR")
                    .setAlign(blockly.ALIGN_RIGHT)
                    .appendField("avatars out of avatar");
                this.setInputsInline(true);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(290);
                this.setTooltip('Clones the specified avatar into the given number of avatars, as long as it is 2 or higher. Each new avatar inherits all of the original avatar\'s properties. If the given number is 1, nothing happens. If it is 0, the avatar gives up its search for the finish and becomes inactive.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_split_up'] = function(block) {
            let value_count = blockly.JavaScript.valueToCode(block, 'COUNT', blockly.JavaScript.ORDER_ATOMIC);
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return '__multi_splitUp(' + value_avatar + ', ' + value_count + ');\n';
        };

        // ------------------------------------------------------------
        // MULTI > STEP ONTO UNVISITED CELL
        // ------------------------------------------------------------

        blockly.Blocks['multi_step_onto_unvisited_cell'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("tell avatar");
                this.appendValueInput("AVATAR")
                    .setCheck("TYPE_AVATAR");
                this.appendDummyInput()
                    .appendField("to step onto a random unvisited cell");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(290);
                this.setTooltip('This block tells the specified avatar to step onto a neighbouring cell that has not been visited yet. Note that the avatar does not follow the path for a number of steps but takes exactly one single step. If there is no unvisited cell next to the avatar, nothing happens.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['multi_step_onto_unvisited_cell'] = function(block) {
            let value_avatar = blockly.JavaScript.valueToCode(block, 'AVATAR', blockly.JavaScript.ORDER_ATOMIC);
            return '__multi_stepOntoUnvisitedCell(' + value_avatar + ');\n';
        };

        // ------------------------------------------------------------
        // SINGLE > BACKTRACE
        // ------------------------------------------------------------

        blockly.Blocks['single_backtrace'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("backtrace");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(290);
                this.setTooltip('Tells the avatar to roll up thread until A) the finish is reached or B) a junction is reached or C) there is no more thread to roll up.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_backtrace'] = function(block) {
            return '__single_backtrace();\n';
        };

        // ------------------------------------------------------------
        // SINGLE > FOLLOW PATH
        // ------------------------------------------------------------

        blockly.Blocks['single_follow_path'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("follow")
                    .appendField(new blockly.FieldDropdown([["random path", "RANDOM"], ["1st path from left", "LEFT"], ["1st path from right", "RIGHT"]]), "FROM");
                this.appendDummyInput()
                    .appendField(new blockly.FieldDropdown([["without any condition", "NONE"], ["without crossing previously laid out thread", "AVOID_THREAD"], ["without walking onto previously visited cells", "AVOID_VISITED"]]), "CONDITION");
                this.setInputsInline(false);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(290);
                this.setTooltip('Tells the avatar to follow either a random path, the first path from the left or the first path from the right out of a set of eligible paths. The second drop-down constrains which paths are seen as eligible. The chosen path is followed until the finish or a junction is reached. If walking along the chosen path means that the avatar is walking backwards along the most recently laid out thread, the avatar rolls up the thread while walking.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_follow_path'] = function(block) {
            let dropdown_from = block.getFieldValue('FROM');
            let dropdown_condition = block.getFieldValue('CONDITION');
            return '__single_followPath(\'' + dropdown_from + '\', \'' + dropdown_condition + '\');\n';
        };

        // ------------------------------------------------------------
        // SINGLE > FOUND FINISH
        // ------------------------------------------------------------

        blockly.Blocks['single_found_finish'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("found finish?");
                this.setInputsInline(true);
                this.setOutput(true, "Boolean");
                this.setColour(20);
                this.setTooltip('Returns true if the avatar is standing on the finish cell.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_found_finish'] = function(block) {
            return ['__single_foundFinish()', blockly.JavaScript.ORDER_NONE];
        };

        // ------------------------------------------------------------
        // SINGLE > GET NUMBER OF UNVISITED PATHS
        // ------------------------------------------------------------

        blockly.Blocks['single_get_number_of_unvisited_paths'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("number of unvisited paths");
                this.setInputsInline(true);
                this.setOutput(true, "Number");
                this.setColour(20);
                this.setTooltip('Returns the number of paths leading away from the avatar\'s current position that have not been marked as visited yet.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_get_number_of_unvisited_paths'] = function(block) {
            return ['__single_getNumberOfUnvisitedPaths()', blockly.JavaScript.ORDER_NONE];
        };

        // ------------------------------------------------------------
        // SINGLE > GET THREAD LENGTH
        // ------------------------------------------------------------

        blockly.Blocks['single_get_thread_length'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("thread length");
                this.setInputsInline(true);
                this.setOutput(true, "Number");
                this.setColour(20);
                this.setTooltip('Returns the length of the thread that the avatar has laid out. Having walked from the first cell to a neighbouring cell, for example, 1 would be returned.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_get_thread_length'] = function(block) {
            return ['__single_getThreadLength()', blockly.JavaScript.ORDER_NONE];
        };

        // ------------------------------------------------------------
        // SINGLE > LAY OUT THREAD
        // ------------------------------------------------------------

        blockly.Blocks['single_lay_out_thread'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("start laying out thread");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(290);
                this.setTooltip('Tells the avatar to start laying out thread. One can imagine the avatar ramming a plug into the floor, attaching an infinitely long thread to it and subsequently laying out the thread along the chosen paths.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_lay_out_thread'] = function(block) {
            return '__single_layOutThread();\n';
        };

        // ------------------------------------------------------------
        // SINGLE > MARK VISITED CELLS
        // ------------------------------------------------------------

        blockly.Blocks['single_mark_visited_cells'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("start marking visited cells");
                this.setInputsInline(true);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(290);
                this.setTooltip('Tells the avatar to mark cells as visited once it walks onto them. One can imagine the avatar painting a sign onto the floor of the cells it is visiting.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_mark_visited_cells'] = function(block) {
            return '__single_markVisitedCells();\n';
        };

        // ------------------------------------------------------------
        // SINGLE > SAY
        // ------------------------------------------------------------

        blockly.Blocks['single_say'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("say");
                this.appendValueInput("MESSAGE")
                    .setCheck(null);
                this.setInputsInline(true);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(290);
                this.setTooltip('Tells the avatar to print a message to the screen.');
                this.setHelpUrl(null);
            }
        };

        blockly.JavaScript['single_say'] = function(block) {
            let value_message = blockly.JavaScript.valueToCode(block, 'MESSAGE', blockly.JavaScript.ORDER_ATOMIC);
            return '__single_say(' + value_message + ');\n';
        };

    }
}