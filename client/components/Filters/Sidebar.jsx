import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import Select from 'react-select';

import Filter from './Filter';
import ConfidenceLegend from './ConfidenceLegend';
import * as actions from '../../actions/index';
import DataUtils from '../../utils/dataUtils';

import Filters from '../../filtering';
import {
  FILTER_CONTINUOUS,
  FILTER_CATEGORICAL,
} from '../../filtering/filterTypes';

const propTypes = {
  /**
   * Data the display coming from Redux state
   */
  data: PropTypes.array,

  /**
   * All of the data (for filtering purposes)
   */
  allData: PropTypes.array,

  /**
   * Features shown from Redux state
   */
  features: PropTypes.object,

  /**
   * Redux Action creator to add a feature
   */
  addFeature: PropTypes.func,

  /**
   * Redux Action creator to remove a feature
   */
  removeFeature: PropTypes.func,

  /**
   * Redux action creator to change the filters
   * on the data
   */
  updateFilters: PropTypes.func,

  /**
   * Array of filters from Redux state
   */
  filters: PropTypes.array,

  /**
   * Boolean whether or not to display visualizations for All Data
   */
  showAllData: PropTypes.bool,

  /**
   * Action creator to toggle showing of visualizations for All Data
   */
  toggleAllData: PropTypes.func,

  /**
   * Function that changes the dataset by forcing a refresh
   */
  changeDataset: PropTypes.func,

  /**
   * The name of the current dataset
   */
  datasetName: PropTypes.string.isRequired,
};

const defaultProps = {
  data: [],
  allData: [],
  features: {},
  addFeature() {},
  removeFeature() {},
  updateFilters() {},
  filters: [],
  showAllData: true,
  toggleAllData() {},
  changeDataset() {},
};

/**
 * Component that is responsible for rendering the filters
 */
class Sidebar extends React.Component {
  // TODO: use display:none to hide elements instead of forcing rerender
  constructor(props) {
    super(props);

    // Hide EnrollmentDate because it's filtered in LineChart and not a proper
    // bucketable filter
    const disabledFeatures = ['EnrollmentDate', 'date', 'year', 'DateofEnrollment', 'ZIP', 'ZIP_FINAL'];

    this.possibleData = DataUtils.getAllAttributes();
    this.features = DataUtils.getAllFeatures();

    this.categoricalFeatures = DataUtils.getAllCategoricalFeatures().filter((feature) => {
      return disabledFeatures.indexOf(feature) === -1;
    });
    this.continuousFeatures = DataUtils.getAllContinuousFeatures().filter((feature) => {
      return disabledFeatures.indexOf(feature) === -1;
    });

    // Function bindings
    this.handleFeature = this.handleFeature.bind(this);
    this.renderFilters = this.renderFilters.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleFilterFilters = this.handleFilterFilters.bind(this);
    this.handleAllDataToggle = this.handleAllDataToggle.bind(this);
    this.filterFilters = this.filterFilters.bind(this);
    this.filterFilters = debounce(this.filterFilters, 250);

    // Handle the content of filter input box
    this.state = {
      // Tracks which features to display
      categoricalFeaturesDisplayed: this.categoricalFeatures,
      continuousFeaturesDisplayed: this.continuousFeatures,
    };
  }

  handleFeature(featureName, checked) {
    if (checked) this.props.addFeature({ featureName, featureData: 1 });
    else this.props.removeFeature(featureName);
  }

  /**
   * handleFilter - handles all the filtering of data
   * on Redux state by calling the action creator. Calls Filters'
   * handleUpdateFilter function to handle logic
   *
   * @param feature - the feature to apply filter on, eg. Sex
   * @param type - type of filter, (FILTER_CATEGORICAL, FILTER_CONTINUOUS)
   * @param options - filter-type-specific options
   */
  handleFilter(feature, type, options) {
    const { filters, allData } = this.props;

    const res = Filters.handleUpdateFilters(filters, feature, type, options);
    this.props.updateFilters(allData, res);
  }

  /**
   * Function that filters specific filters. Note the separation between
   * categorical and continuous filters
   */
  handleFilterFilters(e) {
    this.filterFilters(e.target.value);
  }

  handleAllDataToggle() {
    const show = !this.props.showAllData;

    this.props.toggleAllData(show);
  }

  filterFilters(term) {
    let filteredContinuousFeatures = this.continuousFeatures;
    let filteredCategoricalFeatures = this.categoricalFeatures;

    if (term.length) {
      filteredContinuousFeatures = this.continuousFeatures.filter((feature) => {
        return feature.toLowerCase().startsWith(term.toLowerCase());
      });
      filteredCategoricalFeatures = this.categoricalFeatures.filter((feature) => {
        return feature.toLowerCase().startsWith(term.toLowerCase());
      });
    }

    this.setState({
      continuousFeaturesDisplayed: filteredContinuousFeatures,
      categoricalFeaturesDisplayed: filteredCategoricalFeatures,
    });
  }

  /**
   * Function that returns all the filters to be displayed
   *
   * @param    filterType FILTER_CATEGORICAL or FILTER_CONTINUOUS
   * @returns  Empty div or a filter
   */
  renderFilters(filterType) {
    if (filterType !== FILTER_CATEGORICAL &&
        filterType !== FILTER_CONTINUOUS) return false;

    const featuresToDisplay = (filterType === FILTER_CATEGORICAL) ?
        [...this.state.categoricalFeaturesDisplayed] :
        [...this.state.continuousFeaturesDisplayed];

    if (!featuresToDisplay) {
      return (
        <div>
          <h5>No filters</h5>
        </div>
      );
    }

    const appliedFilters = [];
    const unAppliedFilters = [];

    // Place displayed filters at the front
    featuresToDisplay.forEach((elem) => {
      if (Filters.isFilterApplied(elem)) appliedFilters.push(elem);
      else unAppliedFilters.push(elem);
    });

    const sortedFeaturesToDisplay = [
      // TODO: figure out how to sort without recreating components
      // ...appliedFilters,
      // ...unAppliedFilters,
      ...featuresToDisplay,
    ];

    // Iterate through features and return filters
    return sortedFeaturesToDisplay.map((feature, i) => {
      const attribute = this.possibleData[feature];
      if (!attribute) return <div />;

      // For barchart icon: shows if feature is activated: possible values: 1 or null
      const featureActive = this.props.features[feature] === 1;

      return (
        <Filter
          data={this.props.data}
          index={i}
          featureActive={featureActive}
          feature={feature}
          handleFeature={this.handleFeature}
          handleFilter={this.handleFilter}
          featureData={[...attribute]}
          key={feature}
          filters={this.props.filters}
          type={filterType}
        />
      );
    });
  }

  render() {
    // Only render if there is data
    if (!this.props.data || this.props.data.length <= 0) {
      return (
        <div>
          <h4>No data to show</h4>
        </div>
      );
    }

    // Hardcode temporarily
    const dataSelectOptions = [
      { value: 'artnet', label: 'ARTNET Dataset (Change)' },
      { value: 'default', label: 'Default Dataset (Change)' },
    ];

    // Default sidebar
    return (
      <div className="ag-sidebar clearfix">
        <div className="ag-sidebar--header">
          <Select
            value={this.props.datasetName}
            options={dataSelectOptions}
            onChange={this.props.changeDataset}
            clearable={false}
          />
          <h3 className="ag-sidebar--title">Filters</h3>
          <div className="ag-sidebar--filter-filter form-group">
            <label
              htmlFor="filterFilter"
              className="ag-sidebar--label"
            >
              Search:
              <input
                className="ag-sidebar--input form-control"
                type="text"
                name="filterFilter"
                value={this.state.filterFilters}
                onChange={this.handleFilterFilters}
              />
            </label>
          </div>
        </div>
        <label htmlFor="toggle-all-data">
          <input
            type="checkbox"
            name="toggle-all-data"
            onChange={this.handleAllDataToggle}
            checked={this.props.showAllData}
          />
          Show All Data
        </label>
        <ConfidenceLegend />
        <div className="ag-sidebar--section">
          <h4 className="ag-sidebar--filter-type">Categorical</h4>
          <ul className="ag-input--list ag-sidebar--list">
            {this.renderFilters(FILTER_CATEGORICAL)}
          </ul>
        </div>
        <div className="ag-sidebar--section">
          <h4 className="ag-sidebar--filter-type">Numeric</h4>
          <ul className="ag-input--list ag-sidebar--list">
            {this.renderFilters(FILTER_CONTINUOUS)}
          </ul>
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = propTypes;
Sidebar.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    features: state.features,
    data: state.filters.data,
    allData: state.filters.allData,
    filters: state.filters.filters,
    showAllData: state.filters.showAllData,
  };
}

export default connect(mapStateToProps, actions)(Sidebar);
