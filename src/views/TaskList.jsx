const React = require('react');

const TaskList = React.createClass({
    getInitialState: function () {
        this.app = this.props.app;
        this.app.on('update:tasks', (event, tasks) => {
            this.setState({ tasks: tasks });
        });
        return { tasks: this.app.getTasks() };
    },
    render() {
        return (
            <div>
                <div>友情链接：<a href="https://crontab.guru/" target="_blank">crontab.guru</a></div>
                <table className="table table-condensed dashboard">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>TIME</th>
                            <th>TYPE</th>
                            <th>URL</th>
                            <th>REMARK</th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.tasks.map((task, idx) => {
                            const id = task.id;
                            return (
                                <tr key={id}>
                                    <td>{idx+1}</td>
                                    <td>{task.cronTime}</td>
                                    <td>{task.type}</td>
                                    <td>{task.url}</td>
                                    <td>{task.remark}</td>
                                    <td>
                                        <a href="#" onClick={() => this.app.execTaskById(id)}>立刻执行</a>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = TaskList;