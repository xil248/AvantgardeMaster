import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

import * as actions from '../actions/index';

import Sidebar from './Filters/Sidebar';
import GraphContainer from './Graphs/GraphContainer';
import ClusterContainer from './Clusters/ClusterContainer';
import MapContainer from './Graphs/MapContainer';
import LineChartContainer from './Graphs/LineChartContainer';

const propTypes = {
  /**
   * Object containing the features to display coming
   * from Redux state
   */
  features: PropTypes.object,

  /**
   * Redux action creator to initialize the filters
   * on the data
   */
  initializeFilters: PropTypes.func,

  /**
   * Parameters from React-router
   */
  params: PropTypes.object,
};

const defaultProps = {
  features: {},
  initializeFilters() {},
  // Use default dataset if unspecified
  params: { dataset: 'default' },
};

/**
 * Component that handles all the feature and filter
 * toggling. This component uses local state to keep
 * track of all the filters that have been applied.
 */
class Main extends React.Component {

  constructor(props) {
    super(props);

    this.changeDataset = this.changeDataset.bind(this);
  }

  componentWillMount() {
    if (this.props.params.dataset !== 'default' &&
        this.props.params.dataset !== 'artnet') {
      window.location.href = '/viz/default';
    }
    this.props.initializeFilters(this.props.params.dataset);
  }

  changeDataset(datasetOptions) {
    // Only change if different
    if (datasetOptions.value !== this.props.params.dataset) {
      window.location.href = `/viz/${datasetOptions.value}`;
    }
  }

  render() {
    this.featuresToDisplay = Object.keys(this.props.features).filter((feature) => {
      return this.props.features[feature];
    });

    return (
      <div>
        <SplitPane split="vertical" defaultSize={'15%'}>
          <Sidebar changeDataset={this.changeDataset} datasetName={this.props.params.dataset} />
          <div className="ag-main--container">
            <SplitPane split="horizontal" defaultSize={'50%'}>
              <div>
                <SplitPane split="vertical" defaultSize={'50%'}>
                  <div>
                    <SplitPane
                      split="horizontal"
                      defaultSize={'50%'}
                    >
                      <ClusterContainer />
                      <LineChartContainer />
                    </SplitPane>
                  </div>
                  <MapContainer />
                </SplitPane>
              </div>
              <GraphContainer />
            </SplitPane>
          </div>
        </SplitPane>
      </div>
    );
  }
}

Main.propTypes = propTypes;
Main.defaultProps = defaultProps;

function mapStateToProps(state) {
  return { features: state.features };
}

export default connect(mapStateToProps, actions)(Main);
