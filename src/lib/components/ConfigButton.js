import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback } from 'react';

const ConfigButton = ({ active, onClick }) => {
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.currentTarget.blur();
      onClick();
    },
    [onClick]
  );

  return (
    <a href="#" className={classNames('btn btn-light', { active })} onClick={handleClick}>
      <i className="fas fa-cog" />
    </a>
  );
};

ConfigButton.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
};

export default memo(ConfigButton);
