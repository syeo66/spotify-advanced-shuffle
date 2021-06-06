import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { memo } from 'react';

import { toggleConfig } from '../actions';

const ConfigButton = (props) => {
  const startConfiguration = (event) => {
    props.toggleConfig();
    event.currentTarget.blur();
    event.preventDefault();
  };

  return (
    <a
      href="#"
      className={classNames('btn btn-light', {
        active: props.showConfig,
      })}
      onClick={startConfiguration}
    >
      <i className="fas fa-cog" />
    </a>
  );
};

ConfigButton.propTypes = {
  toggleConfig: PropTypes.func.isRequired,
  showConfig: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ data }) => ({
  showConfig: data.showConfig,
});

export default connect(mapStateToProps, { toggleConfig })(memo(ConfigButton));
