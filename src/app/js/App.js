require("babel-polyfill"); // See http://babeljs.io/docs/usage/polyfill/

import $ from 'jquery';
import React from 'react';
import SandboxPage from './SandboxPage/SandboxPage';

let App = React.createClass({

    render: function () {
        return (
            <div className="app">
                <SandboxPage ref="sandboxPage"/>
            </div>
        );
    }

});

$(function() {
    let app = React.render(
        <App />,
        document.getElementById('react')
    );
});
