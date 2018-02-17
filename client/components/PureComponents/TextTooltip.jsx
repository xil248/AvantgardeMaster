import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  text: PropTypes.string.isRequired,

  position: PropTypes.string,

  style: PropTypes.object,
};

const defaultProps = {
  position: 'top',
  style: {},
};

/**
 * Pure text tooltip component. Note: make sure surrounding
 * div is positioned relatively and with overflow not hidden
 *
 * @param text: string containing text to display
 * @param position: currently 'top' or 'bottom'
 * @param style: custom style to add. Note that tooltips are
 *        absolutely positioned and positioning style will
 *        interfere with tooltip positioning
 */
export default function TextTooltip({ text, position, style }) {
  const positionClass = `ag-tooltip--position-${position}`;

  return (
    <div
      className={`ag-tooltip ${positionClass}`}
      style={style}
    >
      <div style={{ position: 'relative' }}>
        {text}
      </div>
    </div>
  );
}

TextTooltip.propTypes = propTypes;
TextTooltip.defaultProps = defaultProps;
