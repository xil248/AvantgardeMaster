import {
  defaultData,
  defaultMetaData,
  artnetData,
  artnetMetaData,
  preprocessData,
} from '../data';

import {
  FILTER_CATEGORICAL,
  FILTER_CONTINUOUS,
} from '../filtering/filterTypes';

/**
 * Default Utility Class providing data reading accessibility functions
 */
class DataUtils {

  constructor(data = defaultData, metaData = defaultMetaData) {
    this.data = preprocessData(data, metaData);
    this.attributes = this.getAllAttributes();
    this.filterTypes = this.createFilterTypes();
    this.metaData = metaData;
  }

  /**
   * Function that chooses a dataset. This will change the internal state
   * of this module while also returning the processed dataset
   *
   * @param datasetName
   * @return the processed dataset
   */
  chooseDataset(datasetName) {
    let data = [];
    let metaData = {};

    switch (datasetName) {
      case 'artnet': {
        data = artnetData;
        metaData = artnetMetaData;
        break;
      }
      default: {
        data = defaultData;
        metaData = defaultMetaData;
      }
    }

    return this.setDataset(data, metaData);
  }

  /**
   * Function that sets the dataset.
   *
   * @param the data (can be raw)
   * @param metadata - information about the dataset from 'data/index.js'
   * @return the processed data
   */
  setDataset(data, metaData) {
    this.metaData = metaData;
    this.data = preprocessData(data, metaData);
    this.attributes = this.getAllAttributes();
    this.filterTypes = this.createFilterTypes();

    return this.data;
  }

  /**
   * Getter for metadata
   */
  getMetaData() {
    return this.metaData;
  }

  /**
   * Getter for data
   */
  getDataset() {
    return this.data;
  }

  /**
   * Function that returns all valid data for a feature
   *
   * @param feature: the feature by which's values we filter out null
   *                 "", and " "
   */
  getValidData(feature) {
    return this.data.filter((item) => {
      return !(item[feature] === null || item[feature] === '' || item[feature] === ' ');
    });
  }

  /**
   * Function that gets all the possible attributes (values) for a given ____
   * @param  feature
   * @return All possible attributes for it in SET form
   */
  getFeatureAttributes(feature) {
    // Query our hashmap
    return [...this.attributes[feature]];
  }

  /**
   * Gets all possible attributes (value) for a given feature in ARRAY form
   * @param  feature
   * @return All possible attributes, in ARRAY form
   */
  getFeatureAttributesAsArray(feature) {
    return Array.from(this.getFeatureAttributes(feature));
  }

  /**
   * Utility function returning all keys (features) of data
   */
  getAllFeatures() {
    return Object.keys(this.data[0]);
  }

  /**
   * Utility function returning all continuous keys (features) of data
   */
  getAllContinuousFeatures() {
    return Object.keys(this.data[0]).filter((key) => {
      return this.filterTypes[key] === FILTER_CONTINUOUS;
    });
  }

  /**
   * Utility function returning all categorical keys (features) of data
   */
  getAllCategoricalFeatures() {
    return Object.keys(this.data[0]).filter((key) => {
      return this.filterTypes[key] === FILTER_CATEGORICAL;
    });
  }

  /**
   * Function that generates a mapping from feature -> set of possible attributes (values)
   * associated with that feature
   *
   * @return Hashmap with key = each feature and val = set of possible attributes for feature
   *    ex: {
   *      Sex: Set(['Male', 'Female', 'Trans']),
   *      ...
   *    }
   */
  getAllAttributes() {
    const features = this.getAllFeatures();

    // Generate hashmap with keys
    const attribs = features.reduce((attributeMap, curr) => {
      return {
        ...attributeMap,
        // Thank GOD for ES6
        [`${curr}`]: new Set(),
      };
    }, {});

    // Loop through data adding each attribute to attribute hashmap
    this.data.forEach((item) => {
      features.forEach((feature) => {
        attribs[feature].add(item[feature]);
      });
    });

    return attribs;
  }

  /**
   * Function that gets the minimum possible value of a possible feature data
   * TODO: error handling
   */
  getMin(feature) {
    return Math.min.apply(null,
      // Filter out NaN values but keep convertible ones
      this.getFeatureAttributes(feature).reduce((result, item) => {
        if (isNaN(parseFloat(item))) return result;
        result.push(parseFloat(item));
        return result;
      }, [])
    );
  }

  /**
   * Function that gets the maximum possible value of a possible feature data
   * TODO: error handling
   */
  getMax(feature) {
    return Math.max.apply(null,
      // Filter out NaN values but keep convertible ones
      this.getFeatureAttributes(feature).reduce((result, item) => {
        if (isNaN(parseFloat(item))) return result;
        result.push(parseFloat(item));
        return result;
      }, [])
    );
  }

  /**
   * Function that returns the proper filter type (categorical or continuous) for a feature
   */
  getFilterType(feature) {
    return this.filterTypes[feature];
  }

  /**
   * Function that generates all the filter types based on data value types
   *
   * @return  filterTypes ex: {
   *            Sex: FILTER_CATEGORICAL,
   *            Alcohol: FILTER_CONTINUOUS,
   *          }
   */
  createFilterTypes() {
    const features = this.getAllFeatures();
    const filterTypes = {};

    // Iterate through features and find type of each feature
    features.forEach((feature) => {
      const attributeSet = this.getFeatureAttributes(feature);
      filterTypes[feature] = (isNaN(parseFloat([...attributeSet][0]))) ?
                          FILTER_CATEGORICAL : FILTER_CONTINUOUS;
    });

    return filterTypes;
  }

  /**
   * Function that returns the number of valid data points for
   * feature
   *
   * @param feature: the feature by which's values we don't count
   */
  getValidDataLength(feature) {
    return this.getValidData(feature).length;
  }

  /**
   * Function that returns the length of data
   */
  getLength() {
    return this.data.length;
  }
}

export default new DataUtils();
