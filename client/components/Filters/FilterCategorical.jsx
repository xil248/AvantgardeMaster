import React from 'react';
import PropTypes from 'prop-types';

import { FILTER_CATEGORICAL } from '../../filtering/filterTypes';

const propTypes = {
  /**
   * Name of feature to display passed in from
   * Sidebar.jsx
   */
  feature: PropTypes.string,

  /*
   * Array passed in from Main.jsx for all the possible
   * types for each field of data.
   */
  featureData: PropTypes.array,

  /**
   * Handler passed in from Main.jsx to handle
   * all the filter toggling
   */
  handleFilter: PropTypes.func,
};

const defaultProps = {
  data: [],
  feature: '',
  index: 0,
  featureData: [],
  handleFilter() {},
};

/**
 * Filtering component for categorical variables.
 * TODO: add search functionality
 */
export default class FilterCategorical extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      types: this.props.featureData,
      checked: this.props.featureData.concat().fill(true),
    };
    this.props.featureData.sort();
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleCheck(feature, index, attr) {
    const checked = this.state.checked;
    checked[index] = !this.state.checked[index];
    this.setState({ checked });

    this.props.handleFilter(feature, FILTER_CATEGORICAL, { checked: checked[index], attr });
  }

  render() {
    return (
      <div className="ag-filter ag-filter--categorical">
        <h5 className="ag-filter--title">Filter by {this.props.feature}</h5>
        <ul className="ag-filter--checkboxes ag-input--list">
          <form>
            {this.props.featureData.map((attr, i) => {
              if (!attr || attr === ' ') return false;
              return (
                <li key={attr}>
                  <label htmlFor={attr}>
                    <input
                      type="checkbox"
                      id={attr}
                      value={attr}
                      checked={this.state.checked[i]}
                      onChange={() => this.handleCheck(this.props.feature, i, attr)}
                    />
                    {attr}
                  </label>
                </li>
              );
            })}
          </form>
        </ul>
      </div>
    );
  }
}

FilterCategorical.propTypes = propTypes;
FilterCategorical.defaultProps = defaultProps;
