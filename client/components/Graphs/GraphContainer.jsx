import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../../actions';

import Graphs from './Graphs';

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
   * Boolean to display barcharts for All Data
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

class GraphContainer extends React.Component {
  constructor(props) {
    super(props);

    this.renderStacks = this.renderStacks.bind(this);
  }

  renderStacks() {
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
            className="ag-graph--row"
            style={{
              border: `3px solid ${color}`,
            }}
          >
            <p>Cluster: {stack}</p>
            <button
              onClick={() => this.props.unstackCluster(stack)}
              className="ag-graph--row-close-button"
            >
              &times;
            </button>
            <Graphs data={data} brushedData={brushedData} brush={brush} />
          </div>
        );
      });
    }
    return null;
  }

  render() {
    return (
      <div className="ag-graph--container">
        {this.props.showAllData &&
          <div key={'all'} className="ag-graph--row">
            <p>All Data</p>
            <Graphs
              data={this.props.data}
              brushedData={this.props.brushedData}
              brush={this.props.brush}
            />
          </div>
        }
        {this.renderStacks()}
      </div>
    );
  }
}

GraphContainer.propTypes = propTypes;
GraphContainer.defaultProps = defaultProps;

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

export default connect(mapStateToProps, actions)(GraphContainer);
