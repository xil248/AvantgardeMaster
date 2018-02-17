import {
  INIT_FILTERS,
  UPDATE_FILTERS,
  TOGGLE_ALL_DATA,
} from '../actions/types';

/* This is the schema for the state */
// state = {
//   data: [dataPoint], dataPoint - each entry of data
//   filters: [], filters - filters applied to data
//   showAllData: Boolean, whether or not to have visualizations for all data
// }

const initialState = {
  data: [],
  filters: [],
  showAllData: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case INIT_FILTERS: {
      return {
        ...state,
        allData: action.payload.allData,
        data: action.payload.data,
        filters: action.payload.filters,
      };
    }
    case UPDATE_FILTERS: {
      return {
        ...state,
        data: action.payload.data,
        filters: action.payload.filters,
      };
    }
    case TOGGLE_ALL_DATA: {
      return {
        ...state,
        showAllData: action.payload.show,
      };
    }
    default: {
      return state;
    }
  }
}
