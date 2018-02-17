import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const propTypes = {
  /**
   * Data to display coming from Redux state
   */
  data: PropTypes.array,

  /**
   * List of all the features coming from Redux state.
   */
  features: PropTypes.object,
};

const defaultProps = {
  data: [],
  features: {},
};

class DataTable extends React.Component {
  render() {
    // Only render if there is data
    if (!this.props.data || this.props.data.length <= 0) {
      return <div />;
    }

    // Get the features to display from Redux
    this.featuresToDisplay = Object.keys(this.props.features).filter((feature) => {
      return this.props.features[feature];
    });

    return (
      <table>
        <thead>
          <tr>
            {Object.keys(this.props.data[0]).map((feature) => {
              if (this.featuresToDisplay.includes(feature)) return (<th key={feature}>{feature}</th>);
              return null;
            })}
          </tr>
        </thead>
        <tbody>
          {this.props.data.map(item =>
            <tr key={item.PrimaryStudyID}>
              {Object.keys(item).map((feature, i) => {
                if (this.featuresToDisplay.includes(feature)) return <td key={`${item.id}_${i}`}>{item[feature]}</td>; // eslint-disable-line
                return null;
              })}
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

function mapStateToProps(state) {
  return { features: state.features, data: state.filters.data };
}

DataTable.propTypes = propTypes;
DataTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(DataTable);
