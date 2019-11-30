import PropTypes from 'prop-types';
import React from 'react';
import styles from 'components/selectedRelease/selectedRelease.module.css';

const PLine = ({ pLine }) => {
  if (!pLine) return null;

  return (
    <div className={`${styles.copyright} red`}>
      &#8471; {pLine.year} {pLine.owner}
    </div>
  );
};

PLine.propTypes = {
  pLine: PropTypes.string
};

export default PLine;
