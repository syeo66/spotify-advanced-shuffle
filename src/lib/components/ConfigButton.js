import React from 'react';
import { connect } from 'react-redux';
import { toggleConfig } from '../actions';

const ConfigButton = props => {
  const classe = props.showConfig ? "btn btn-light active" : "btn btn-light";

  const startConfiguration = event => {
    props.toggleConfig();
    event.currentTarget.blur();
    event.preventDefault();
  }

  return (
    <a href="#" className={classe} onClick={startConfiguration}>
      <i className="fas fa-cog" />
    </a>
  );
}

function mapStateToProps(state) {
    return state.data;
}

export default connect(mapStateToProps, { toggleConfig })(ConfigButton);
