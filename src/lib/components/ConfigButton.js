import React, { memo } from 'react';
import { connect } from 'react-redux';
import { toggleConfig } from '../actions';

const ConfigButton = props => {
  const classes = props.showConfig ? "btn btn-light active" : "btn btn-light";

  const startConfiguration = event => {
    props.toggleConfig();
    event.currentTarget.blur();
    event.preventDefault();
  }

  return (
    <a href="#" className={classes} onClick={startConfiguration}>
      <i className="fas fa-cog" />
    </a>
  );
}

const mapStateToProps = ({ data }) => ({
  showConfig: data.showConfig,
});

export default connect(mapStateToProps, { toggleConfig })(memo(ConfigButton));
