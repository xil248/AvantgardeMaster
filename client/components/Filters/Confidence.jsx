import React from 'react';
import PropTypes from 'prop-types';

import DataUtils from '../../utils/dataUtils';
import TextTooltip from '../PureComponents/TextTooltip';

const propTypes = {
  feature: PropTypes.string.isRequired,

  /**
   * Denotes the position that the tooltip should be in
   */
  position: PropTypes.string,
};

const defaultProps = {
  position: 'right',
};

/**
 * Confidence component. Should handle all confidence information
 * after being given the feature to find confidence of
 */
export default class Confidence extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showTooltip: false,
    };

    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleMouseOver() {
    this.setState({ showTooltip: true });
  }

  handleMouseLeave() {
    this.setState({ showTooltip: false });
  }

  render() {
    const validDataLength = DataUtils.getValidDataLength(this.props.feature);
    const dataLength = DataUtils.getLength();
    const confidence = validDataLength / dataLength;

    // TODO: use colorbrewer and add legend
    let color = '#252525';

    // Signify broken
    if (isNaN(confidence)) color = 'red';

    const percent = Math.round(confidence * 100);

    let style = {};
    switch (this.props.position) {
      case 'top': {
        style = { top: '-50px' };
        break;
      }
      case 'right': {
        style = { left: '22px', top: '-12px' };
        break;
      }
      default: {
        style = { left: '22px', top: '-12px' };
      }
    }

    return (
      <div
        className="ag-filter--confidence-wrapper"
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        style={{
          position: 'relative',
        }}
      >
        <div
          className="ag-filter--confidence"
          style={{
            opacity: percent / 100,
            backgroundColor: color,
          }}
        />
        {this.state.showTooltip &&
          <TextTooltip
            text={`Confidence: ${validDataLength}/${dataLength}=${percent}%`}
            style={style}
          />
        }
      </div>
    );
  }
}

Confidence.propTypes = propTypes;
Confidence.defaultProps = defaultProps;
