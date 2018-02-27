import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  FILTER_CATEGORICAL,
  FILTER_CONTINUOUS,
  // FILTER_BUCKETED,
} from '../../filtering/filterTypes';
import BarChart2 from './BarChart2';
import BarChart1 from './BarChart1';
import Confidence from '../Filters/Confidence';
import * as actions from '../../actions/index';
import DataUtils from '../../utils/dataUtils';

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
  // filters: PropTypes.array,

  /**
   * Action creator to apply brushing
   */
  // applyBrush: PropTypes.func,

  /**
   * Action creator to remove brushing
   */
  // removeBrush: PropTypes.func,

  /**
   * The brushed data from GraphContainer
   */
  // brushedData: PropTypes.array,

  /**
   * Whether brushing is on. From Redux state but
   * passed in from GraphContainer.
   */
  // brush: PropTypes.bool,
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
  /**
   * Returns the absolute 'position' of the chart container element.
   * Used to place tooltips
   */
  // static findContainerDims(el, cls = 'ag-chart--container') {
  //   let currEl = el;
  //   while (!currEl.classList.contains(cls)) {
  //     currEl = currEl.parentElement;
  //   }

  //   return currEl.getBoundingClientRect();
  // }

  constructor(props) {
    super(props);

    this.renderGraphs = this.renderGraphs.bind(this);
    // this.mouseOverHandler = this.mouseOverHandler.bind(this);
    // this.mouseOutHandler = this.mouseOutHandler.bind(this);

    this.state = {
      showToolTip: false,
    };
  }

  mouseOverHandler(d, e, feature, type, bucketsHash = {}) { // eslint-disable-line
    // Use containerDims as reference to absolutely position tooltips
    // on the tops of bars
    const containerDims = this.constructor.findContainerDims(e.target);
    const rectDims = e.target.getBoundingClientRect();

    this.setState({
      showToolTip: true,
      ttTop: `${rectDims.top - containerDims.top - 22}px`,
      ttLeft: `${rectDims.left - containerDims.left}px`,
      ttWidth: `${rectDims.width}px`,
      ttAmt: d.y,
    });

  //   if (!this.props.brush) {
  //     const attribs = DataUtils.getFeatureAttributes(feature);

  //     if (type === FILTER_CATEGORICAL) {
  //       this.props.applyBrush(this.props.data, [{
  //         name: feature,
  //         type,
  //         value: attribs.filter(attrib => attrib !== d.x),
  //       }]);
  //     } else if (type === FILTER_CONTINUOUS ||
  //                type === FILTER_BUCKETED) {
  //       // Find correct minVal and maxVal from bucketsHash
  //       const bucket = bucketsHash[d.x];
  //       this.props.applyBrush(this.props.data, [{
  //         name: feature,
  //         type,
  //         minVal: bucket.minVal,
  //         maxVal: bucket.maxVal,
  //       }]);
  //     }
  //   }
  }

  // mouseOutHandler() {
  //   this.setState({
  //     showToolTip: false,
  //   });

  //   if (this.props.brush) {
  //     this.props.removeBrush();
  //   }
  // }

  /**
   * Function to render Graphs for each feature
   * in the Redux state using the data from Redux
   * state
   * @memberOf GraphContainer
   */
  renderGraphs() {
    // For each feature, render the appropriate graph
    return Object.keys(this.props.features)
      .filter(feature => this.props.features[feature])
      .map((feature) => {
        // Get the type of the filter
        console.log(`start ${performance.now()}`);
        const type = DataUtils.getFilterType(feature);

        // Get all the attributes for this particular feature (datatype: SET)
        const attribs = DataUtils.getFeatureAttributes(feature);

        let valuesKeys = [...attribs];
        console.log(`continue ${performance.now()}`);
        switch (type) {
          case FILTER_CATEGORICAL: {
            /**
             * Build the values object that will be used to create the data for
             * the chart. The keys for it will be the attributes of the feature
             * and the value for each key will be its count in the data set
             * eg. for Sex {
             *  'Male': 500,
             *  'Female': 200,
             *  'Trans': 50,
             * };
             */
            valuesKeys = valuesKeys.filter(value => value.trim());
            const values = {};
            this.props.data.forEach((elem) => {
              const currElemFeatureValue = elem[feature];
              values[currElemFeatureValue] = values[currElemFeatureValue] ? values[currElemFeatureValue] + 1 : 1;
            });

            /**
             * Data to pass into chart needs to look like:
             * [
             *   { x: 'Male', y: 500 },
             *   { x: 'Female', y: 200 },
             *   { x: 'Trans', y: 100 },
             * ]
             */
            const data = valuesKeys.reduce((acc, curr) => {
              return [
                ...acc,
                {
                  x: curr,
                  y: parseFloat(values[curr] || 0),
                },
              ];
            }, []);

            // let brushedData = [];

            // if (this.props.brush) {
            //   const brushedValues = {};
            //   this.props.brushedData.forEach((elem) => {
            //     const currElemFeatureValue = elem[feature];
            //     brushedValues[currElemFeatureValue] = brushedValues[currElemFeatureValue] ?
            //       brushedValues[currElemFeatureValue] + 1
            //       : 1;
            //   });

            //   brushedData = valuesKeys.reduce((acc, curr) => {
            //     return [
            //       ...acc,
            //       {
            //         x: curr,
            //         y: parseFloat(brushedValues[curr] || 0),
            //       },
            //     ];
            //   }, []);
            // }

            return (
              <div key={feature} className="ag-chart--barchart">
                <BarChart2
                  data={data}
                  width={200}
                  // mouseOutHandler={this.mouseOutHandler}
                  // mouseOverHandler={(d, e) => this.mouseOverHandler(d, e, feature, type)}
                />
                <div className="ag-chart--barchart-title text-center">
                  <Confidence feature={feature} position={'top'} />
                  {feature}
                </div>
              </div>
            );
          }
          // case FILTER_BUCKETED:
          case FILTER_CONTINUOUS: {
            return (
              <div key={feature} className="ag-chart--barchart">
                <BarChart1
                  data={DataUtils.data}
                  label={feature}
                  width={200}
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
  }

  render() {
    // const { ttTop, ttLeft, showToolTip, ttWidth } = this.state;
    // console.log(ttTop, ttLeft, ttWidth);
    console.log(`start render graph ${performance.now()}`);
    return (
      <div className="ag-chart--container">
        <div className="ag-chart--tooltip-container">
          {/* {showToolTip &&
            <div
              className="ag-chart--tooltip"
              style={{
                top: ttTop,
                left: ttLeft,
                width: ttWidth,
              }}
            >
            </div>
          } */}
        </div>
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
