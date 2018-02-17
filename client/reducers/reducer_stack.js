import {
  STACK_CLUSTER,
  UNSTACK_CLUSTER,
  UPDATE_FILTERS,
} from '../actions/types';
import { FILTER_CATEGORICAL } from '../filtering/filterTypes';

import DataUtils from '../utils/dataUtils';
import Filtering from '../filtering';
import ColorUtils from '../utils/colorUtils';

const StackColorUtils = new ColorUtils();

/**
 * Helper function to convert input to a number if it can be.
 * @param {String} input - the input string
 */
function convertToNum(input) {
  const val = parseFloat(input);
  return isNaN(val) ? input : val;
}

export default function (state = {}, action) {
  switch (action.type) {
    case STACK_CLUSTER: {
      const { feature, cluster, clusterData } = action.payload;
      return {
        ...state,
        [`${cluster}`]: {
          feature,
          data: clusterData,
          color: StackColorUtils.getColor(),
        },
      };
    }
    case UNSTACK_CLUSTER: {
      const { clusterToRemove } = action.payload;
      const ret = { ...state };
      StackColorUtils.freeColor(ret[clusterToRemove].color);
      delete ret[clusterToRemove];
      return ret;
    }
    case UPDATE_FILTERS: {
      // NOTE: Current assumption is that stacking only works for categorical
      // variables.
      // TODO: Make this potentially work with other data types if that becomes
      // a thing.

      const ret = { ...state };
      const { data } = action.payload;

      Object.keys(ret).forEach((elem) => {
        const elemFeature = ret[elem].feature;
        // Check to see if elem can be converted to a number for the filter function below
        const checkedElem = convertToNum(elem);
        const value = DataUtils.getFeatureAttributesAsArray(elemFeature).filter(attr => attr !== checkedElem);

        ret[elem].data = Filtering.filtering(data, [{
          name: elemFeature,
          type: FILTER_CATEGORICAL,
          value,
        }]);
      });

      return ret;
    }
    default: {
      return state;
    }
  }
}
