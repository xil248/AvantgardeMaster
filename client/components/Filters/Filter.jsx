import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import FilterCategorical from './FilterCategorical';
import FilterContinuous from './FilterContinuous';
import Confidence from './Confidence';

import Filters from '../../filtering';
import {
  FILTER_CATEGORICAL,
  FILTER_CONTINUOUS,
} from '../../filtering/filterTypes';

const propTypes = {
  /**
   *
   */
  handleFeature: PropTypes.func,

  /**
   * Data to display coming from Redux state
   */
  data: PropTypes.array,

  /**
   * Name of the feature to display passed in from
   * Sidebar.jsx
   */
  feature: PropTypes.string,

  /**
   * Boolean showing whether this feature is active from
   * parent component. Decides whether barchart should display
   */
  featureActive: PropTypes.bool,

  /**
   * Index of the field in an entry of the data.js file
   */
  index: PropTypes.number,

  /**
   * Array passed in from Main.jsx for all the possible
   * types for each field of data.
   * eg: [
   *  "Sex": ['Male', 'Female', 'Other'],
   *  ...,
   * ]
   */
  featureData: PropTypes.array,

  /**
   * Handler passed in from Main.jsx to handle
   * all the filter toggling.
   */
  handleFilter: PropTypes.func,

  /**
   * Type of filter passed in from Sidebar
   * Currently: FILTER_CATEGORICAL or FILTER_CONTINUOUS
   */
  type: PropTypes.string,
};

const defaultProps = {
  handleFeature() {},
  data: [],
  feature: '',
  featureActive: false,
  index: 0,
  featureData: [],
  handleFilter() {},
  filters: [],
  type: '',
};

/**
 * Component to display a single feature and its corresponding
 * filtering options.
 */
export default class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFilter: false,
    };
    this.toggleFeature = this.toggleFeature.bind(this);
    this.toggleDisplayFilterBox = this.toggleDisplayFilterBox.bind(this);
    this.hideComponent = this.hideComponent.bind(this);
  }

  /**
   * Function that handles toggling of displaying columns
   * in dashboard table and features in future graphs
   */
  toggleFeature(e) {
    // Prevent click through
    e.stopPropagation();

    this.props.handleFeature(this.props.feature, !this.props.featureActive);
  }

  /**
   * Function that handles toggling display of filters
   */
  toggleDisplayFilterBox() {
    this.setState({ showFilter: !this.state.showFilter });
  }

  hideComponent() {
    this.toggleDisplayFilterBox();
  }

  render() {
    // Only render if there is data
    if (!this.props.data || this.props.data.length <= 0) {
      return <div />;
    }

    const { feature, handleFilter, featureData, featureActive, index } = this.props;

    let filterComponent = null;
    switch (this.props.type) {
      case FILTER_CATEGORICAL: {
        filterComponent = (
          <FilterCategorical
            data={this.props.data}
            feature={feature}
            handleFilter={handleFilter}
            featureData={featureData}
          />
        );
        break;
      }
      case FILTER_CONTINUOUS: {
        filterComponent = (
          <FilterContinuous
            data={this.props.data}
            feature={feature}
            handleFilter={handleFilter}
            featureData={featureData}
          />
        );
        break;
      }
      default: {
        break;
      }
    }

    const filterIconStyle = (Filters.isFilterApplied(feature)) ?
      {} : { color: 'white' };

    const barChartIconStyle = (featureActive) ?
      {} : { color: 'white' };

    return (
      <li
        className="ag-filter--list-element"
        key={index}
      >
        <a // eslint-disable-line
          className="ag-filter--list-bar"
          onClick={this.toggleDisplayFilterBox}
        >
          <Confidence feature={feature} />
          {feature}
          <button
            className="ag-filter--icon"
            onClick={this.toggleFeature}
          >
            <FontAwesome
              name="bar-chart"
              style={barChartIconStyle}
            />
          </button>
          <button
            className="ag-filter--icon"
            onClick={this.toggleDisplayFilterBox}
          >
            <FontAwesome
              name="filter"
              style={filterIconStyle}
            />
          </button>
        </a>
        <div
          className="ag-filter--dropdown"
          style={{
            display: (this.state.showFilter) ? 'block' : 'none',
          }}
        >
          <div className="ag-filter--component-wrapper">
            {filterComponent}
          </div>
        </div>
      </li>
    );
  }
}

Filter.propTypes = propTypes;
Filter.defaultProps = defaultProps;
