import defaultData from '../data/data';
import artnetData from '../data/artnetData';

/**
 * MetaData objects describe the datasets being used
 */
const defaultMetaData = {
  name: 'Default',
  key: 'default',
  dateKey: 'EnrollmentDate',
  getDateFunction(val) {
    return new Date(val);
  },
  defaultClusterFeature: 'SDTJ_0.015',
  zipKey: 'ZIP',
};

const artnetMetaData = {
  name: 'ARTNET',
  key: 'artnet',
  dateKey: 'DateofEnrollment',
  getDateFunction(val) {
    return new Date(val);
  },
  defaultClusterFeature: 'Sequence',
  zipKey: 'ZIP_FINAL',
};

/**
 * Function handling all preprocessing of data. Called by initializeFilters in
 * redux state
 */
function preprocessData(rawData, datasetMetaData) {
  /**
   * Function to add a 'date' key with corresponding Javascript Date to data
   */
  function createDatesFromKeys(dataset, dateKey, getDateFunction) {
    return dataset.map((elem) => {
      const date = getDateFunction(elem[dateKey]);

      if (isNaN(date.getTime())) {
        return {
          ...elem,
          date: null,
          year: null,
        };
      }
      return {
        ...elem,
        date,
        year: date.getFullYear(),
      };
    });
  }

  function createZips(dataset, zipKey) {
    return dataset.map((elem) => {
      return {
        ...elem,
        zip: elem[zipKey],
      };
    });
  }

  return createZips(createDatesFromKeys(rawData, datasetMetaData.dateKey, datasetMetaData.getDateFunction), datasetMetaData.zipKey);
}

export { defaultData, defaultMetaData, artnetData, artnetMetaData, preprocessData };
