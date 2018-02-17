import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { LineChart } from 'react-easy-chart';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import DataUtils from '../../utils/dataUtils';
import Filters from '../../filtering';
import * as actions from '../../actions/index';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

const propTypes = {
  /**
   * The data to display from Redux state
   */
  data: PropTypes.array,

  /**
   * All the data
   */
  allData: PropTypes.array,

  /**
   * The stacks of clusters from Redux state
   */
  stacks: PropTypes.object,

  /**
   * The filters being applied on the data from Redux state
   */
  filters: PropTypes.array,

  /**
   * Action creator to update filters on Redux state
   */
  updateFilters: PropTypes.func,

  /**
   * Year data from Redux state
   */
  yearsData: PropTypes.object,

  /**
   * Action creator to update start year on Redux state
   */
  changeStartYear: PropTypes.func,

  /**
   * Action creator to update end year on redux state
   */
  changeEndYear: PropTypes.func,

  /**
   * Boolean whether to show line for All Data
   */
  showAllData: PropTypes.bool,
};

const defaultProps = {
  data: [],
  allData: [],
  stacks: {},
  filters: [],
  updateFilters() {},
  yearsData: {},
  changeStartYear() {},
  changeEndYear() {},
  showAllData: true,
};

class LineChartContainer extends React.Component {
  /**
   * Function that gets the total number of cases up to a particular year.
   * eg. If there were 15 people enrolled in 2009 (assuming 2009 is start)
   * and 10 people enrolled in 2010, then it will return something like:
   * [
   *  { x: '2009', y: 15 },
   *  { x: '2010', y: 25 }, // note that the 10 got added to 15
   * ]
   */
  static getYearCounts(data, dateKey) {
    const newDataArray = [...data].filter((elem) => {
      return elem[dateKey] !== null;
    }).sort((x, y) => {
      const xDate = new Date(x[dateKey]);
      const yDate = new Date(y[dateKey]);

      return xDate.valueOf() - yDate.valueOf();
    });

    // Hashmap of years and their corresponding number of enrollments
    const yearCounts = newDataArray.reduce((acc, curr) => {
      // Store month strings to be used in the date format
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const date = curr[dateKey];

      const ret = { ...acc };
      // Handle improper dates
      if (isNaN(date.valueOf())) {
        return ret;
      }
      const dateString = date.getDate();
      // Look up the month string in the months array
      const monthString = months[date.getMonth()];
      const yearString = date.getFullYear();

      const fullDateString = `${dateString}-${monthString}-${yearString}`;

      ret[fullDateString] = ret[fullDateString] ? ret[fullDateString] + 1 : 1;
      return ret;
    }, {});

    // Return an array just like the example in the function comment
    return Object.keys(yearCounts).reduce((acc, curr, i) => {
      let prevYearCount = 0;

      if (i > 0) {
        prevYearCount = parseInt(acc[i - 1].y, 10);
      }

      return [
        ...acc,
        {
          x: curr,
          y: parseInt(yearCounts[curr] || 0, 10) + prevYearCount,
        },
      ];
    }, []);
  }

  constructor(props) {
    super(props);

    this.dateKey = 'date';
    this.yearKey = 'year';

    this.startYear = DataUtils.getMin(this.yearKey);
    this.endYear = DataUtils.getMax(this.yearKey);

    // TODO: issue: this doesn't end before rendering calls on redux state data
    // that depends on these
    this.props.changeStartYear(this.startYear);
    this.props.changeEndYear(this.endYear);

    this.handleYearChange = this.handleYearChange.bind(this);
    this.generateMarks = this.generateMarks.bind(this);
  }

  componentWillMount() {
    const { yearsData } = this.props;
    const startYear = yearsData.startYear || this.startYear;
    const endYear = yearsData.endYear || this.endYear;

    this.handleYearChange([startYear, endYear]);
  }

  /**
   * This function generates marks for the start and end years
   */
  generateMarks(minVal, maxVal, step = 5) {
    const res = {};

    for (let i = minVal; i < maxVal; i += step) {
      res[i] = `${i}`;
    }

    // Also create mark for start and end years
    const selectedYearStyle = { top: '-40px', fontWeight: 'bold' };
    const { startYear, endYear } = this.props.yearsData;
    if (startYear) {
      res[startYear] = {
        style: selectedYearStyle,
        label: `${startYear}`,
      };
    }
    if (endYear) {
      res[endYear] = {
        style: selectedYearStyle,
        label: `${endYear}`,
      };
    }

    return res;
  }
  /**
   * Handle the change of the year filtering slider
   * @param {[Number]} values - the start and end values
   * @memberof LineChartContainer
   */
  handleYearChange(values) {
    const { filters, allData } = this.props;

    const startYear = values[0] < values[1] ? values[0] : values[1];
    const endYear = values[0] < values[1] ? values[1] : values[0];
    const res = Filters.handleUpdateFilters(filters, this.dateKey, 'FILTER_DATE', {
      startYear,
      endYear,
    });
    this.props.updateFilters(allData, res);

    // Update start and end year data
    this.props.changeStartYear(startYear);
    this.props.changeEndYear(endYear);
  }

  render() {
    // Data to pass on to LineChart. Needs to be 2D array
    const data = [];

    if (this.props.showAllData) {
      data.push(this.constructor.getYearCounts(this.props.data, this.dateKey));
    }

    const { stacks, yearsData } = this.props;

    if (stacks) {
      Object.keys(stacks).forEach((stack) => {
        data.push(this.constructor.getYearCounts(stacks[stack].data, this.dateKey));
      });
    }

    // Use default years when redux state is undefined
    const startYear = yearsData.startYear || this.startYear;
    const endYear = yearsData.endYear || this.endYear;

    const axisLabels = {
      x: 'Year',
      y: 'Total patients enrolled',
    };

    const marks = this.generateMarks(this.startYear, this.endYear);

    return (
      <div className="ag-line-chart--container">
        <div className="ag-line-chart--slider">
          <p className="ag-line-chart--slider-title">Filter by Year</p>
          <Range
            min={this.startYear}
            max={this.endYear}
            marks={marks}
            defaultValue={[startYear, endYear]}
            tipFormatter={value => `${value}`}
            onAfterChange={this.handleYearChange}
          />
        </div>
        <LineChart
          xType={'time'}
          datePattern={'%d-%b-%Y'}
          axes
          axisLabels={axisLabels}
          grid
          verticalGrid
          dataPoints
          height={250}
          width={500}
          data={data}
        />
      </div>
    );
  }
}

LineChartContainer.propTypes = propTypes;
LineChartContainer.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    allData: state.filters.allData,
    data: state.filters.data,
    stacks: state.stacking,
    filters: state.filters.filters,
    yearsData: state.yearsData,
    showAllData: state.filters.showAllData,
  };
}

export default connect(mapStateToProps, actions)(LineChartContainer);
