const React = require('react');

const MAX_BUF_NUM = 32;
const OutputPanel = React.createClass({
    getInitialState: function () {
        this.app = this.props.app;
        this.app.on('output', line => {
            const buf = this.state.outputBuf;
            buf.push(line);
            let len = buf.length;
            if (len > MAX_BUF_NUM) {
                buf.splice(0, len - MAX_BUF_NUM);
            }
            this.setState({ outputBuf: buf });
        });
        return { outputBuf: [] };
    },
    render: function () {
        return <pre className="output-content">{this.state.outputBuf.slice(0).reverse().join('\n')}</pre>;
    }
});

module.exports = OutputPanel;
