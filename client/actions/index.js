import Filters from '../filtering';
import DataUtils from '../utils/dataUtils';

import {
  ADD_FEATURE,
  REMOVE_FEATURE,
  INIT_FILTERS,
  UPDATE_FILTERS,
  APPLY_BRUSH,
  REMOVE_BRUSH,
  STACK_CLUSTER,
  UNSTACK_CLUSTER,
  INIT_CLUSTERS,
  UPDATE_CLUSTERS,
  CHANGE_CLUSTER_FEATURE,
  CHANGE_STARTYEAR,
  CHANGE_ENDYEAR,
  TOGGLE_ALL_DATA,
} from './types';


/**
 * Action creator to load and initialize data. This is and should be the
 * first action creator called
 */
export function initializeFilters(datasetName) {
  const data = DataUtils.chooseDataset(datasetName);

  return {
    type: INIT_FILTERS,
    payload: {
      data,
      allData: data,
      filters: [],
    },
  };
}

/**
 * Action creator to change filters of the data
 */
export function updateFilters(allData, filters) {
  return {
    type: UPDATE_FILTERS,
    payload: {
      filters,
      data: Filters.filtering(allData, filters),
    },
  };
}

/**
 * Action creator to display a feature
 */
export function addFeature(feature) {
  // {featureName: featureData}
  return {
    type: ADD_FEATURE,
    payload: feature,
  };
}

/**
 * Action creator to remove a feature from displaying
 */
export function removeFeature(featureName) {
  return {
    type: REMOVE_FEATURE,
    payload: featureName,
  };
}

/**
 * Action creator to apply brushing
 *
 * @param {[Object]} filteredData - the pre-filtered data
 * @param {Object} filter - the filter for the feature being brushed
 * @param {Boolean} filtered - if this is the final state of filtering
 * @returns {Object} - Object for Reducer
 */
export function applyBrush(filteredData, filter, filtered = false) {
  return {
    type: APPLY_BRUSH,
    payload: {
      filter,
      data: filtered ? filteredData : Filters.filtering(filteredData, filter),
    },
  };
}

/**
 * Action creator to remove brushing
 *
 * @returns {Object} - Object for reducer
 */
export function removeBrush() {
  return {
    type: REMOVE_BRUSH,
    payload: {
      filter: null,
      data: null,
    },
  };
}


/**
 * Action creator that initializes clustering clusters
 *
 * @returns {Object} - Object for reducer
 */
export function initializeClusters() {
  return {
    type: INIT_CLUSTERS,
  };
}

/**
 * Action creator that updates clustering based on an
 * updated parameters (year, feature, etc)
 */
export function updateClusters() {
  return {
    type: UPDATE_CLUSTERS,
  };
}

/**
 * Action creator that creates a stack for a cluster
 *
 * @param cluster: name of attribute ('Female')
 * @param clusterData: array of all data for that attr.
 */
export function stackCluster(feature, cluster, clusterData) {
  return {
    type: STACK_CLUSTER,
    payload: {
      feature,
      cluster,
      clusterData,
    },
  };
}

/**
 * Action creator that removes a stack for a cluster
 */
export function unstackCluster(cluster) {
  return {
    type: UNSTACK_CLUSTER,
    payload: {
      clusterToRemove: cluster,
    },
  };
}

/**
 * Action creator for updating the feature to cluster by
 */
export function changeClusterFeature(feature) {
  return {
    type: CHANGE_CLUSTER_FEATURE,
    payload: {
      feature,
    },
  };
}

/**
 * Action creator to update the cluster start year
 */
export function changeStartYear(year) {
  return {
    type: CHANGE_STARTYEAR,
    payload: {
      year,
    },
  };
}

/**
 * Action creator to update the cluster end year
 */
export function changeEndYear(year) {
  return {
    type: CHANGE_ENDYEAR,
    payload: {
      year,
    },
  };
}

/**
 * Action creator to toggle the displaying of visualizations for
 * all data
 */
export function toggleAllData(show) {
  return {
    type: TOGGLE_ALL_DATA,
    payload: {
      show,
    },
  };
}
