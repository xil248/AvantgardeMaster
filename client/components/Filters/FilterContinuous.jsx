import React from 'react';
import PropTypes from 'prop-types';
import DataUtils from '../../utils/dataUtils';

import {
  FILTER_CONTINUOUS,
  FILTER_BUCKETED,
} from '../../filtering/filterTypes';

// Error messages to display
const ERROR_MINMAX_MESSAGE = 'Error: Your min is greater than your max.';
const ERROR_NUM_BUCKETS = 'Error: Impossible number of buckets';
const NO_ERROR_MESSAGE = '\u00a0';

const propTypes = {
  /**
   * Name of feature to display passed in from
   * Sidebar.jsx
   */
  feature: PropTypes.string,

  /**
   * Handler passed in from Main.jsx to handle
   * all the filter toggling
   */
  handleFilter: PropTypes.func,
};

const defaultProps = {
  feature: '',
  handleFilter() {},
};

/**
 * Filter modal for filtering continuous variables
 *   Currently deals with both
 */
export default class FilterContinuous extends React.Component {
  constructor(props) {
    super(props);

    this.max = DataUtils.getMax(this.props.feature);
    this.min = DataUtils.getMin(this.props.feature);

    this.state = {
      currMax: this.max,
      currMin: this.min,
      errorMessage: NO_ERROR_MESSAGE,
      bucketing: true,
      numBuckets: 5,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.toggleBucketing = this.toggleBucketing.bind(this);
    this.changeBuckets = this.changeBuckets.bind(this);
    this.validationError = this.validationError.bind(this);
  }

  /**
   * Handles validation
   * @param errorMessage: the error message to show
   *    Pass in boolean 'false' to remove errors
   */
  validationError(errorMessage) {
    if (!errorMessage) {
      this.setState({
        errorMessage: NO_ERROR_MESSAGE,
        error: false,
      });
    }
    switch (errorMessage) {
      case ERROR_NUM_BUCKETS: {
        this.setState({
          errorMessage: ERROR_NUM_BUCKETS,
          error: true,
        });
        break;
      }
      case ERROR_MINMAX_MESSAGE: {
        this.setState({
          errorMessage: ERROR_MINMAX_MESSAGE,
          error: true,
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * Toggles bucketed vs default continuous filter
   */
  toggleBucketing() {
    this.setState({
      bucketing: !this.state.bucketing,
    });
  }

  /**
   * Changes the number of buckets for this component
   */
  changeBuckets(e) {
    this.setState({
      numBuckets: parseInt(e.target.value, 10),
      errorMessage: NO_ERROR_MESSAGE,
    });
  }

  /**
   * Input change handler for min and max value
   */
  handleInputChange(e) {
    const idLength = e.target.id.length;
    const target = (e.target.id.substring(idLength - 3, idLength));

    const val = parseInt(e.target.value, 10);
    if (target === 'max') {
      // Validate
      if (val < this.state.currMin) {
        this.setState({ errorMessage: ERROR_MINMAX_MESSAGE });
        return false;
      }
      this.setState({
        currMax: val,
        errorMessage: NO_ERROR_MESSAGE,
      });
    } else {
      if (val > this.state.currMax) {
        this.setState({ errorMessage: ERROR_MINMAX_MESSAGE });
        return false;
      }
      this.setState({
        currMin: val,
        errorMessage: NO_ERROR_MESSAGE,
      });
    }
    return true;
  }

  /**
   * Function that updates global filters from this component
   */
  handleUpdate(e) {
    e.preventDefault();

    // Error - terminate early
    if (this.state.error) return;

    const { bucketing, currMin, currMax, numBuckets } = this.state;

    if (bucketing) {
      this.props.handleFilter(this.props.feature, FILTER_BUCKETED, {
        minVal: currMin || this.min,
        maxVal: currMax || this.max,
        numBuckets,
      });
    } else {
      this.props.handleFilter(this.props.feature, FILTER_CONTINUOUS, {
        minVal: currMin || this.min,
        maxVal: currMax || this.max,
      });
    }
  }

  render() {
    const { feature } = this.props;
    const { errorMessage, bucketing, numBuckets } = this.state;

    return (
      <div className="ag-filter ag-filter--continuous">
        <h5 className="ag-filter--title">Filter by {feature}</h5>
        <p className="ag-error--filter-text">{errorMessage}</p>
        <form>
          <div className="ag-input--numeric-wrapper">
            <label
              className="ag-input--numeric-label"
              htmlFor={`ag-filter--continuous-${feature}-min`}
            >
              Start
            </label>
            <input
              id={`ag-filter--continuous-${feature}-min`}
              type="number"
              className="ag-input--numeric"
              onChange={this.handleInputChange}
              placeholder={`Min: ${this.min}`}
            />
          </div><div className="ag-input--numeric-wrapper">
            <label
              className="ag-input--numeric-label"
              htmlFor={`ag-filter--continuous--${feature}-max`}
            >
              End
            </label>
            <input
              id={`ag-filter--continuous--${feature}-max`}
              type="number"
              className="ag-input--numeric"
              onChange={this.handleInputChange}
              placeholder={`Max: ${this.max}`}
            />
          </div>
          <label
            className="ag-input--numeric-label"
            htmlFor={`ag-filter--bucket-toggle-${feature}`}
          >
            Enable bucketing
          </label>
          <input
            className="ag-input--checkbox"
            type="checkbox"
            name={`ag-filter--bucket--${feature}`}
            onChange={this.toggleBucketing}
            checked={bucketing}
          />
          <div style={{ display: (bucketing) ? 'block' : 'none' }} >
            <label
              className="ag-input--numeric-label"
              htmlFor={`ag-filter--bucket-number-${feature}`}
            >
              Number of Buckets:
            </label>
            <input
              className="ag-input--checkbox"
              type="number"
              value={numBuckets}
              name={`ag-filter--bucket-number-${feature}`}
              onChange={this.changeBuckets}
            />
          </div>
          <br />
          <input
            className="btn btn-default"
            type="submit"
            value="Update"
            onClick={this.handleUpdate}
          />
        </form>
      </div>
    );
  }
}

FilterContinuous.propTypes = propTypes;
FilterContinuous.defaultProps = defaultProps;
