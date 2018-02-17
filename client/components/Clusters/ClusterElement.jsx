import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DataUtils from '../../utils/dataUtils';

import TextTooltip from '../PureComponents/TextTooltip';

// Denotes minimum element height
const MIN_ELEMENT_HEIGHT = 28;
// Denotes the amount to multiply size by
const ELEMENT_HEIGHT_MULTIPLIER = 120;

const propTypes = {
  /**
   * The cluster (object data) to display
   */
  cluster: PropTypes.object,

  /**
   * Whether brushing is occurring from OUTSIDE Clustering module
   */
  brushedOutside: PropTypes.bool,

  /**
   * Function for handling application of brush
   */
  handleApplyBrush: PropTypes.func,

  /**
   * Function for handling deletion of brush
   */
  handleRemoveBrush: PropTypes.func,

  /**
   * Function passed from ClusterContainer to stack/unstack clusters.
   */
  onClick: PropTypes.func,

  /**
   * Feature that this cluster belongs to passed in from ClusterContainer
   */
  clusterFeature: PropTypes.string,

  /**
   * Dictionary of all the stacked clusters from Redux state.
   */
  stacks: PropTypes.object,

  /**
   * A map of the clusters built from brushed data
   */
  brushedClustersHashMap: PropTypes.object,

  /**
   * The size of the cluster (in number of elements)
   */
  size: PropTypes.number,

  /**
   * If tooltips are enabled or not
   */
  tooltipsEnabled: PropTypes.bool,
};

const defaultProps = {
  cluster: {},
  brushedOutside: false,
  handleApplyBrush() {},
  handleRemoveBrush() {},
  onClick() {},
  clusterFeature: '',
  stacks: {},
  brushedClustersHashMap: {},
  size: 0,
  tooltipsEnabled: false,
};

class ClusterElement extends React.Component {
  constructor(props) {
    super(props);

    this.mouseApplyBrush = this.mouseApplyBrush.bind(this);
    this.mouseRemoveBrush = this.mouseRemoveBrush.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { cluster, stacks, clusterFeature } = this.props;
    // Check to see if the cluster should be selected or not. If previously unselected, then select = true
    const select = !(stacks[cluster.attr] && (stacks[cluster.attr].feature === clusterFeature));
    this.props.onClick(cluster.attr, cluster.data, select);
  }

  mouseApplyBrush() {
    this.props.handleApplyBrush(
      this.props.cluster.data,
    );
  }

  mouseRemoveBrush() {
    this.props.handleRemoveBrush();
  }

  render() {
    const { stacks, cluster, clusterFeature, brushedOutside, brushedClustersHashMap, size, tooltipsEnabled } = this.props;
    const length = DataUtils.getLength();

    // Discard clusters with nothing
    if (!cluster.attr || cluster.attr === ' ') {
      return null;
    }

    let brushHeight = 0;
    let showTooltip = false;

    const dimension = Math.max((size / length) * ELEMENT_HEIGHT_MULTIPLIER, MIN_ELEMENT_HEIGHT);

    // If brushed outside then show orange brush, if brushed inside show tooltip
    if (brushedOutside) {
      if (!brushedClustersHashMap) {
        brushHeight = 0;
      } else {
        brushHeight = (brushedClustersHashMap[cluster.attr].data.length / size) * dimension;
      }
    } else if (brushedClustersHashMap && brushedClustersHashMap[cluster.attr].data.length) {
      showTooltip = true;
    }

    // Check to see if the cluster is selected
    const selected = stacks[cluster.attr] && (stacks[cluster.attr].feature === clusterFeature);

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div
        className="ag-cluster--element"
        data-attr={cluster.attr}
        onMouseEnter={this.mouseApplyBrush}
        onMouseLeave={this.mouseRemoveBrush}
        onClick={this.onClick}
        style={{
          // Transparent border by default for consistent sizing
          outline: (selected) ? `2px solid ${stacks[cluster.attr].color}` : '2px solid transparent',
          width: `${dimension}px`,
          height: `${dimension}px`,
          backgroundColor: (showTooltip) ? '#CCCCCC' : '#EEEEEE',
        }}
      >
        {showTooltip && tooltipsEnabled &&
          <TextTooltip
            text={`Cluster: ${cluster.attr}`}
            position={'top'}
          />
        }
        <div
          className="ag-cluster--brush"
          style={{
            display: (brushedOutside) ? 'block' : 'none',
            height: `${brushHeight}px`,
          }}
        >
          &nbsp;
        </div>
        <div
          className="ag-cluster--element-data"
          style={{
            lineHeight: `${dimension}px`,
          }}
        >
          {this.props.size}
        </div>
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

ClusterElement.propTypes = propTypes;
ClusterElement.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    stacks: state.stacking,
  };
}

export default connect(mapStateToProps)(ClusterElement);
