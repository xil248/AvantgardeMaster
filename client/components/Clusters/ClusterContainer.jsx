import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';

import * as actions from '../../actions/index';
import DataUtils from '../../utils/dataUtils';
import Clustering from '../../clustering';
import Confidence from '../Filters/Confidence';

import ClusterElement from './ClusterElement';

const propTypes = {
  /**
   * Filtered data
   */
  data: PropTypes.array,

  /**
   * Whether brushing is on or off from Redux state
   */
  brush: PropTypes.bool,

  /**
   * The brushed data to display from Redux state
   */
  brushedData: PropTypes.array,

  /**
   * Action creator to apply brushing and linking
   */
  applyBrush: PropTypes.func,

  /**
   * Action creator to remove brush
   */
  removeBrush: PropTypes.func,

  /**
   * Action creator to initialize clusters
   */
  initializeClusters: PropTypes.func,

  /**
   * Action creator to change feature to cluster by
   */
  changeClusterFeature: PropTypes.func,

  /**
   * Action creator to stack a cluster
   */
  stackCluster: PropTypes.func,

  /**
   * Action creator to unstack a cluster
   */
  unstackCluster: PropTypes.func,

  /**
   * The feature to cluster by from Redux state
   */
  clusterFeature: PropTypes.string,
};

const defaultProps = {
  data: [],
  brush: false,
  brushedData: [],
  applyBrush() {},
  removeBrush() {},
  initializeClusters() {},
  changeClusterFeature() {},
  stackCluster() {},
  unstackCluster() {},
  clusterFeature: null,
};

/**
 * Component that wraps and handles rendering/resizing of cluster components
 */
class ClusterContainer extends React.Component {

  /**
   * We want to order clusters by descending order
   */
  constructor(props) {
    super(props);

    // Valid clustering features can be either (for continuous, need to bucket)
    this.features = DataUtils.getAllFeatures();

    this.state = {
      brushed: false,
      tooltipsEnabled: true,
    };

    this.handleClusterUpdate = this.handleClusterUpdate.bind(this);
    this.handleApplyBrush = this.handleApplyBrush.bind(this);
    this.handleRemoveBrush = this.handleRemoveBrush.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleTooltipsToggle = this.handleTooltipsToggle.bind(this);
    this.renderClusterElements = this.renderClusterElements.bind(this);
  }

  componentWillMount() {
    this.props.initializeClusters();
  }

  /**
   * Handler for the cluster selector, which updates redux state on
   * which feature to cluster by
   */
  handleClusterUpdate(selected) {
    if (!selected) return;
    this.props.changeClusterFeature(selected.value);
  }

  /**
   * Handler for brushing.
   */
  handleApplyBrush(data) {
    this.setState({
      brushed: true,
    });
    this.props.applyBrush(data, [], true);
  }

  /**
   * Handler for removing brush
   */
  handleRemoveBrush() {
    this.setState({
      brushed: false,
    });
    this.props.removeBrush();
  }

  /**
   * Handler for onClick that stacks / unstacks charts for a cluster
   * @param {String} attr - the attribute of the feature that is selected
   *                        (eg. a particular id in the SDTJ_0.015 feature).
   * @param {Array} clusterData - the array of data for the cluster.
   * @param {Boolean} selected - whether the cluster is being selected or
   *                             unselected.
   * @memberOf ClusterContainer
   */
  handleOnClick(attr, clusterData, selected) {
    if (selected) {
      this.props.stackCluster(this.props.clusterFeature, attr, clusterData);
    } else {
      this.props.unstackCluster(attr);
    }
  }

  /**
   * Toggles the tooltips
   */
  handleTooltipsToggle() {
    this.setState({ tooltipsEnabled: !this.state.tooltipsEnabled });
  }

  renderClusterElements() {
    const { clusterFeature, brush, brushedData, data } = this.props;

    if (!clusterFeature) {
      return <div>Loading...</div>;
    }

    const clustersList = Clustering.generateClusters(clusterFeature, data);
    const brushedOutside = brush && !this.state.brushed;

    const brushedClustersHashMap = (brushedData && brushedData.length !== 0) ?
        Clustering.generateClustersHashMap(clusterFeature, brushedData) : null;

    return clustersList.map((elem) => {
      if (!elem.attr) return null;
      const size = elem.data.length;
      const attr = elem.attr;

      let brushedSize = 0;

      if (brushedClustersHashMap) {
        brushedSize = brushedClustersHashMap[attr].data.length;
      }

      return (
        <ClusterElement
          handleApplyBrush={this.handleApplyBrush}
          handleRemoveBrush={this.handleRemoveBrush}
          brushedClustersHashMap={brushedClustersHashMap}
          brushedOutside={brushedOutside}
          cluster={elem}
          size={size}
          brushedSize={brushedSize}
          key={attr}
          onClick={this.handleOnClick}
          clusterFeature={clusterFeature}
          tooltipsEnabled={this.state.tooltipsEnabled}
        />
      );
    });
  }

  render() {
    const { clusterFeature } = this.props;

    const clusterOptions = this.features.map((feature) => {
      return { value: feature, label: feature };
    });

    return (
      <div className="ag-cluster--container ag-section">
        <div className="ag-cluster--selectors">
          <div className="ag-cluster--selector">
            <span>Clustered by </span>
            <Select
              name="ag-cluster--by"
              value={clusterFeature}
              options={clusterOptions}
              onChange={this.handleClusterUpdate}
            />
          </div>
          <div className="ag-cluster--selector">
            <label htmlFor="ag-cluster--tooltips-checkbox">
              <input
                id="ag-cluster--tooltips-checkbox"
                type="checkbox"
                onChange={this.handleTooltipsToggle}
                checked={this.state.tooltipsEnabled}
              />
              Enable Tooltips (cluster names)
            </label>
            <div>
              Confidence:
              {clusterFeature &&
                <Confidence feature={clusterFeature} />
              }
            </div>
          </div>
        </div>
        <div className="ag-cluster--section">
          <div className="ag-cluster--section-header">
            All clusters
          </div>
          <div className="ag-cluster--section-content">
            {this.renderClusterElements()}
          </div>
        </div>
      </div>
    );
  }
}

ClusterContainer.propTypes = propTypes;
ClusterContainer.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    data: state.filters.data,
    brush: state.brushing.brush,
    brushedData: state.brushing.data,
    brushFilterArray: state.brushing.filter,
    clusterFeature: state.clusters.clusterFeature,
  };
}

export default connect(mapStateToProps, actions)(ClusterContainer);
