import DataUtils from '../utils/dataUtils';

/**
 * Comparator function for comparing clusters
 */
function sortClusterComparator(a, b) {
  return (a.data.length < b.data.length) ? 1 : -1;
}

/**
 * Singleton clustering class. Will first grab all continuous features (clusterable)
 * for analysis.
 */
class Clustering {
  constructor() {
    this.dateKey = 'date';
    this.yearKey = 'year';
  }

  /**
   * Utility function to filter data by year
   */
  getYearData(year) {
    return DataUtils.getDataset().filter((elem) => {
      if (!elem[this.yearKey]) return false;
      return year === elem[this.yearKey];
    });
  }

  /**
   * Utility function to get all data from before a year
   */
  getPreviousYearData(year, dataToFilter = DataUtils.getDataset()) {
    return dataToFilter.filter((elem) => {
      if (!elem[this.yearKey]) return false;
      return year >= elem[this.yearKey];
    });
  }

  /**
   * Handler that generates clusters and returns a map. Useful for key-based cluster
   * lookup
   *
   * @param clusterFeature: the feature to cluster by
   * @param [dataToCluster]: the data to cluster
   */
  generateClustersHashMap(clusterFeature, dataToCluster = DataUtils.getDataset()) { // eslint-disable-line
    /**
     * The data will be put into clusters as follows
     *      clustersMap = {
     *        'Male': {
     *          data: [
     *            data[0], data[1], etc
     *          ],
     *        },
     *        'Female': {
     *          data: [...]
     *        },
     *        ...
     *      }
     */
    const clusterAttributes = DataUtils.getFeatureAttributesAsArray(clusterFeature);

    // First generate mapping
    let clustersMap = {};
    clusterAttributes.forEach((attr) => {
      clustersMap = {
        ...clustersMap,
        [`${attr}`]: {
          attr,
          data: [],
        },
      };
    });

    // Add data to respective clusters
    dataToCluster.forEach((elem) => {
      clustersMap[elem[clusterFeature]].data.push(elem);
    });

    return clustersMap;
  }

  /**
   * Handler that generates clusters and returns a sorted array (instead of map).
   * Used for iteration in ClusterContainer
   *
   * @param clusterFeature: the feature to cluster by
   * @param [dataToCluster]: the data to cluster
   * @return [clusters]: a list of clusters
   */
  generateClusters(clusterFeature, dataToCluster = DataUtils.getDataset()) { // eslint-disable-line
    const clusters = [];

    const clustersMap = this.generateClustersHashMap(clusterFeature, dataToCluster);

    // (3) Sort into each STABLE, GROWING, NODATA
    Object.keys(clustersMap).forEach((key) => {
      const cluster = clustersMap[key];
      clusters.push(cluster);
    });

    clusters.sort(sortClusterComparator);

    return clusters;
  }
}

export default new Clustering();
