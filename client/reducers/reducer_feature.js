/* eslint-disable */
import {
  ADD_FEATURE,
  LOAD_ALL_FEATURES,
  REMOVE_FEATURE,
} from '../actions/types';

export default function (state = {}, action) {
  switch (action.type) {
    case ADD_FEATURE: {
      console.log(state);
      // Takes in feature, data (keyval)
  
      const { featureName, featureData } = action.payload;
      return { ...state, [`${featureName}`]: featureData };
    }
    case LOAD_ALL_FEATURES: {
      // Takes in feature, data (keyval)
      const features = action.payload;
      var newState = {};
      for(var i = 0; i < features.length; i++){
        newState[features[i]] = 1;
      }
      return newState;
    }
    case REMOVE_FEATURE: {
      // Takes in name of feature
      return { ...state, [`${action.payload}`]: null };
    }
    default: {
      return state;
    }
  }
}
