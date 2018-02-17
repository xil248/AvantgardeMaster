import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, GeoJSON, TileLayer, Pane } from 'react-leaflet';
import { connect } from 'react-redux';

import sanGeoJSON from '../../data/zipcodes';
import * as actions from '../../actions';
import DataUtils from '../../utils/dataUtils';
import { mapColors, brushMapColors } from './MapColors';

const center = [32.7328, -117.2713];
const ACCESS_TOKEN = 'pk.eyJ1IjoiYXZhbnRnYXJkZSIsImEiOiJjaXpvbHZnNHowMDBpMndwN3Y1d3A0emdiIn0.IxdrXkpCyN2CUSK-lcUTFA';

const propTypes = {
  /**
   * The data to display from MapContainer
   */
  data: PropTypes.array,

  /**
   * The brushed data to display from MapContainer
   */
  brushedData: PropTypes.array,

  /**
   * Whether brushing is on or off from Redux state
   * passed from MapContainer
   */
  brush: PropTypes.bool,

  /**
   * Action creator to apply brushing and linking
   */
  applyBrush: PropTypes.func,

  /**
   * Action creator to remove brush
   */
  removeBrush: PropTypes.func,

  /**
   * Prop showing maps should show label
   */
  showLabels: PropTypes.bool,
};

const defaultProps = {
  data: [],
  brushedData: [],
  brush: false,
  showLabels: false,
  applyBrush() {},
  removeBrush() {},
};

class MapElement extends Component {
  constructor(props) {
    super(props);

    this.onEachFeature = this.onEachFeature.bind(this);
    this.getZipCounts = this.getZipCounts.bind(this);
    this.highlightFeature = this.highlightFeature.bind(this);
    this.resetHighlight = this.resetHighlight.bind(this);
    this.renderMapInfo = this.renderMapInfo.bind(this);
    this.style = this.style.bind(this);
    this.geojson = null;
    this.state = {
      highlightedZip: null,
    };
  }

  onEachFeature(feature, layer) {
    layer.on({
      mouseover: e => this.highlightFeature(e, feature),
      mouseout: this.resetHighlight,
    });
  }

  getColor(count) {
    if (count > 50) {
      return (this.props.brush) ? brushMapColors[0] : mapColors[0];
    }
    if (count > 40) {
      return (this.props.brush) ? brushMapColors[1] : mapColors[1];
    }
    if (count > 30) {
      return (this.props.brush) ? brushMapColors[2] : mapColors[2];
    }
    if (count > 20) {
      return (this.props.brush) ? brushMapColors[3] : mapColors[3];
    }
    if (count > 10) {
      return (this.props.brush) ? brushMapColors[4] : mapColors[4];
    }
    if (count > 5) {
      return (this.props.brush) ? brushMapColors[5] : mapColors[5];
    }
    if (count > 0) {
      return (this.props.brush) ? brushMapColors[6] : mapColors[6];
    }
    return (this.props.brush) ? brushMapColors[7] : mapColors[7];
  }

  /**
   * Function to get the number of data points in each zip code
   *
   * @returns {Object} - Hashmap of zipcodes and the corresponding
   *                     number of cases in each zipcode
   * eg:
   * {
   *  92122: 15,
   *  92123: 10,
   *  ...
   * }
   * @memberOf MapContainer
   */
  getZipCounts() {
    this.zipCounts = {};

    if (this.props.brush && !this.state.highlightedZip) {
      // Loop through the data and find the number of people in each zipcode
      this.props.brushedData.forEach((elem) => {
        this.zipCounts[elem.zip] = this.zipCounts[elem.zip] ? this.zipCounts[elem.zip] + 1 : 1;
      });
    } else {
      // Loop through the data and find the number of people in each zipcode
      this.props.data.forEach((elem) => {
        this.zipCounts[elem.zip] = this.zipCounts[elem.zip] ? this.zipCounts[elem.zip] + 1 : 1;
      });
    }
  }

  highlightFeature(e, feature) {
    const layer = e.target;

    layer.setStyle({
      weight: 5,
      color: 'white',
      dashArray: '',
      fillOpacity: 0.7,
    });

    layer.bringToFront();

    const zips = DataUtils.getFeatureAttributes('zip');

    this.props.applyBrush(this.props.data, [{
      name: 'zip',
      type: 'FILTER_CATEGORICAL',
      value: zips.filter(zip => zip !== `${feature.properties.ZIP}`),
    }]);

    this.setState({
      highlightedZip: feature.properties.ZIP,
    });
  }


  resetHighlight(e) {
    this.geojson.resetStyle(e.target);
    this.setState({
      highlightedZip: null,
    });
    this.props.removeBrush();
  }

  /**
   * Helper function passed in to GeoJSON to style the map
   *
   * @param {Object} feature - Each particular feature in the geojson
   *
   * @memberOf MapContainer
   */
  style(feature) {
    const zipCount = this.zipCounts[feature.properties.ZIP] || 0;

    return {
      color: 'black',
      fillColor: this.getColor(zipCount) || 'white',
      weight: 0.5,
      opacity: 1,
      dashArray: '3',
      fillOpacity: 0.7,
    };
  }

  renderMapInfo() {
    const highlightedZip = this.state.highlightedZip;
    if (highlightedZip !== null) {
      return (
        <div>
          <p>zip: {highlightedZip}</p>
          <p>No. of People: {this.zipCounts[highlightedZip] || 0}</p>
        </div>
      );
    }
    return <p>Highlight a zip to see info</p>;
  }

  render() {
    this.getZipCounts();

    const mapStyle = {
      height: '350px',
      width: '100%',
    };

    return (
      <div className="map-container">
        <Map
          style={mapStyle}
          center={center}
          zoom={10}
          scrollWheelZoom={false}
        >
          <Pane>
            <TileLayer
              url={`http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png?access_token=${ACCESS_TOKEN}`}
              attribution='&copy; <a href="http://mapbox.com">Mapbox</a>'
              id="mapbox.light"
            />
            <GeoJSON
              ref={(elem) => { this.geojson = elem && elem.leafletElement; }}
              data={sanGeoJSON}
              style={this.style}
              onEachFeature={this.onEachFeature}
            />
          </Pane>
          <Pane style={{ display: (this.props.showLabels) ? 'block' : 'none' }}>
            <TileLayer
              url={`http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png?access_token=${ACCESS_TOKEN}`}
              attribution='&copy; <a href="http://mapbox.com">Mapbox</a>'
              id="mapbox.labels"
              zIndex={2}
            />
          </Pane>
        </Map>
        <div className="map-info">
          {this.renderMapInfo()}
        </div>
      </div>
    );
  }
}

MapElement.propTypes = propTypes;
MapElement.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    brush: state.brushing.brush,
  };
}

export default connect(mapStateToProps, actions)(MapElement);
