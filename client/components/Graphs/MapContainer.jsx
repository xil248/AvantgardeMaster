import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../../actions';

import Map from './MapElement';
import { mapColors, brushMapColors } from './MapColors';

const propTypes = {
  /**
   * The data to display from Redux state
   */
  data: PropTypes.array,

  /**
   * The brushed data to display from Redux state
   */
  brushedData: PropTypes.array,

  /**
   * Whether brushing is on. From Redux state.
   */
  brush: PropTypes.bool,

  /**
   * The brush filter from the Redux state
   */
  brushFilterArray: PropTypes.array,

  /**
   * The stacks of clusters from Redux state
   */
  stacks: PropTypes.object,

  /**
   * Action creator to unstack a cluster
   */
  unstackCluster: PropTypes.func,

  /**
   * Boolean whether to show map for All Data
   */
  showAllData: PropTypes.bool,
};

const defaultProps = {
  data: [],
  brushedData: [],
  brush: false,
  brushFilterArray: [],
  stacks: {},
  unstackCluster() {},
  showAllData: true,
};

class MapContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { labelsChecked: false };
    this.handleLabelsChange = this.handleLabelsChange.bind(this);
    this.renderMaps = this.renderMaps.bind(this);
  }

  handleLabelsChange() {
    this.setState({
      labelsChecked: !this.state.labelsChecked,
    });
  }

  renderMaps() {
    // Add class to shrink maps if enough stacks
    let mapClass = '';
    if (Object.keys(this.props.stacks).length > 0) {
      mapClass = 'ag-map--container-tiled';
    }

    if (Object.keys(this.props.stacks).length > 0) {
      return Object.keys(this.props.stacks).map((stack) => {
        const { brush, brushFilterArray } = this.props;
        const { feature, data, color } = this.props.stacks[stack];
        let brushedData = [];

        if (brush && brushFilterArray) {
          brushedData = this.props.brushedData.filter((elem) => {
            // This is an intentional == instead of ===. The value of
            // elem[feature] can be an int or a string but the value
            // of `stack` is always a string.
            return elem[feature] == stack; // eslint-disable-line
          });
        }

        return (
          <div
            key={stack}
            className={`ag-map--container ${mapClass}`}
            style={{
              border: `2px solid ${color}`,
            }}
          >
            <div
              className="ag-map--title-box"
            >
              <p>Cluster: {stack}</p>
              <button
                onClick={() => this.props.unstackCluster(stack)}
                className="ag-map--container-close-button"
              >
                &times;
              </button>
            </div>
            <Map
              data={data}
              brushedData={brushedData}
              brush={brush}
              showLabels={this.state.labelsChecked}
            />
          </div>
        );
      });
    }
    return null;
  }

  render() {
    const { stacks, data, brushedData, brush, showAllData } = this.props;

    // Add class to shrink maps if enough stacks
    const colors = (brush) ? brushMapColors : mapColors;
    let mapClass = '';
    if (Object.keys(stacks).length > 0) {
      mapClass = 'ag-map--container-tiled';
    }
    return (
      <div className="ag-map--section">
        <div className="ag-map--legend">
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[7] }} /> 0
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[6] }} /> 1-5
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[5] }} /> 6-10
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[4] }} /> 11-20
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[3] }} /> 21-30
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[2] }} /> 31-40
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[1] }} /> 41-50
          <div className="ag-map--legend-item" style={{ backgroundColor: colors[0] }} /> &gt;50
          <div className="ag-map--legend-checkbox">
            <label htmlFor="ag-map--label-checkbox" />Map Labels:
            <input
              id="ag-map--label-checkbox"
              name="ag-map--label-checkbox"
              type="checkbox"
              value={this.state.labelsChecked}
              onChange={this.handleLabelsChange}
            />
          </div>
        </div>
        {showAllData &&
          <div
            key={'all'}
            className={`ag-map--container ${mapClass}`}
          >
            <p>All Data</p>
            <Map
              data={data}
              brushedData={brushedData}
              brush={brush}
              showLabels={this.state.labelsChecked}
            />
          </div>
        }
        {this.renderMaps()}
      </div>
    );
  }
}

MapContainer.propTypes = propTypes;
MapContainer.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    data: state.filters.data,
    brushedData: state.brushing.data,
    brush: state.brushing.brush,
    brushFilterArray: state.brushing.filter,
    stacks: state.stacking,
    showAllData: state.filters.showAllData,
  };
}

export default connect(mapStateToProps, actions)(MapContainer);
