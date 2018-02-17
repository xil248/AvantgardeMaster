import DataUtils from '../utils/dataUtils';
import {
  CHANGE_CLUSTER_FEATURE,
  INIT_CLUSTERS,
} from '../actions/types';

/* This is the schema for the state */
// state = {
//   clusterFeature: ""
//   clustersList: [{}]
// }

export default function (state = {}, action) {
  switch (action.type) {
    case INIT_CLUSTERS: {
      return {
        ...state,
        clusterFeature: DataUtils.getMetaData().defaultClusterFeature,
      };
    }
    case CHANGE_CLUSTER_FEATURE: {
      return {
        ...state,
        clusterFeature: action.payload.feature,
      };
    }
    default: {
      return state;
    }
  }
}
