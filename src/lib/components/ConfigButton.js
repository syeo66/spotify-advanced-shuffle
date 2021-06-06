import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo } from 'react';

const ConfigButton = ({ active, onClick }) => {
  return (
    <a href="#" className={classNames('btn btn-light', { active })} onClick={onClick}>
      <i className="fas fa-cog" />
    </a>
  );
};

ConfigButton.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
};

export default memo(ConfigButton);
