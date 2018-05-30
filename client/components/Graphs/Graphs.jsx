import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  FILTER_CATEGORICAL,
  FILTER_CONTINUOUS,
  FILTER_BUCKETED,
} from '../../filtering/filterTypes';
import ContinuousBarChart from './ContinuousBarChart';
import Filter from '../../filtering/index';
import DiscreteBarChart from './DiscreteBarChart';
// import BarChart2 from './BarChart2';
import Confidence from '../Filters/Confidence';
import * as actions from '../../actions/index';
import DataUtils from '../../utils/dataUtils';
// import {
//   DiscreteBinUtil,
// } from '../../utils/binUtils';

const propTypes = {
  /**
   * The data to display from GraphContainer
   */
  data: PropTypes.array,

  /**
   * Object containing the features to display coming
   * from Redux state
   */
  features: PropTypes.object,

  /**
   * Array of filters from Redux state
   */
  filters: PropTypes.array,

  /**
   * Action creator to apply brushing
   */
  applyBrush: PropTypes.func,

  /**
   * Action creator to remove brushing
   */
  removeBrush: PropTypes.func,

  /**
   * The brushed data from GraphContainer
   */
  brushedData: PropTypes.array,

  /**
   * Whether brushing is on. From Redux state but
   * passed in from GraphContainer.
   */
  brush: PropTypes.bool,
};

const defaultProps = {
  data: [],
  features: {},
  filters: [],
  applyBrush() {},
  removeBrush() {},
  brushedData: [],
  brush: false,
};

/**
 * Component that handles rendering of all the graphs
 * @class Graphs
 * @extends {React.Component}
 */
class Graphs extends React.Component {

  constructor(props) {
    super(props);
    this.renderGraphs = this.renderGraphs.bind(this);
  }

  componentWillMount() {
    // data to store the filtered data
    this.data = [];
    // previous filters
    this.filters = '';
  }

  getData() {
    return this.data;
  }

  /**
   * Function to render Graphs for each feature
   * in the Redux state using the data from Redux
   * state
   * @memberOf GraphContainer
   */
  renderGraphs() {
    // For each feature, render the appropriate graph

    // check if filters changed
    const filters = JSON.stringify(this.props.filters);
    const changed = filters !== this.filters;

    // update data if filters changed
    if (changed) {
      this.data = Filter.filtering(this.props.data, this.props.filters);
      this.filters = filters;
    }

    const element = Object.keys(this.props.features)
      .filter(feature => this.props.features[feature])
      .map((feature) => {
        // Get the type of the filter
        const type = DataUtils.getFilterType(feature);

        console.log(`garph ${feature} start`, performance.now());
        switch (type) {
          case FILTER_CATEGORICAL: {
            // get attributes to be filtered
            let filteredTypes = [];
            this.props.filters.forEach((e) => {
              if (e.name === feature) {
                filteredTypes = e.value;
              }
            });

            // filter attributes
            const allTypes = DataUtils.getFeatureAttributes(feature);
            const types = allTypes.filter(e => (e && e.toString().trim()) && !filteredTypes.find(s => s === e));

            return (
              <div key={feature} className="ag-chart--barchart">
                {/* <BarChart2
                  label={feature}
                  data={graphData}
                  width={200}
                  brush={this.props.brush}
                  brushedData={this.props.brushedData}
                  applyBrush={this.props.applyBrush}
                  removeBrush={this.props.removeBrush}
                /> */}
                <DiscreteBarChart
                  types={types}
                  label={feature}
                  dataChanged={changed}
                  width={400}
                  height={200}
                  brush={this.props.brush}
                  brushedData={this.props.brushedData}
                  applyBrush={this.props.applyBrush}
                  removeBrush={this.props.removeBrush}
                  getData={this.getData.bind(this)}
                />
                <div className="ag-chart--barchart-title text-center">
                  <Confidence feature={feature} position={'top'} />
                  {feature}
                </div>
              </div>
            );
          }
          case FILTER_BUCKETED:
          case FILTER_CONTINUOUS: {
            // Get the Number of Bins from props
            let numOfBins = null;
            this.props.filters.forEach((e) => {
              if (Number.isInteger(e.numBuckets) && e.name === feature) {
                numOfBins = e.numBuckets;
              }
            });

            return (
              <div key={feature} className="ag-chart--barchart">
                <ContinuousBarChart
                  numOfBins={numOfBins}
                  dataChanged={changed}
                  label={feature}
                  width={400}
                  height={200}
                  brush={this.props.brush}
                  brushedData={this.props.brushedData}
                  applyBrush={this.props.applyBrush}
                  removeBrush={this.props.removeBrush}
                  getData={this.getData.bind(this)}
                />
                <div className="ag-chart--barchart-title text-center">
                  <Confidence feature={feature} />
                  {feature}
                </div>
              </div>
            );
          }
          default: {
            return <div />;
          }
        }
      });

    return element;
  }


  render() {
    return (
      <div className="ag-chart--container">
        {this.renderGraphs()}
      </div>
    );
  }
}

Graphs.propTypes = propTypes;
Graphs.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    features: state.features,
    filters: state.filters.filters,
  };
}

export default connect(mapStateToProps, actions)(Graphs);
