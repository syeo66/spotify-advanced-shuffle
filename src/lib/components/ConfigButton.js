import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleConfig } from '../actions';

class ConfigButton extends Component {
    componentDidMount() {
        this.startConfiguration = this.startConfiguration.bind(this);
    }

    startConfiguration(event) {
        this.props.toggleConfig();
        event.currentTarget.blur();
        event.preventDefault();
    }

    render() {
        const classe = this.props.showConfig ? "btn btn-light active" : "btn btn-light";

        return (
            <a href="#" className={classe} onClick={this.startConfiguration}>
                <i className="fas fa-cog" />
            </a>
        );
    }
} 

function mapStateToProps(state) {
    return state.data;
}

export default connect(mapStateToProps, { toggleConfig })(ConfigButton);
