import {
  CHANGE_STARTYEAR,
  CHANGE_ENDYEAR,
} from '../actions/types';

/* This is the schema for the state */
// state = {
//   startYear: <int>,
//   endYear: <int>,
// }
export default function (state = {}, action) {
  switch (action.type) {
    case CHANGE_STARTYEAR: {
      return {
        ...state,
        startYear: action.payload.year,
      };
    }
    case CHANGE_ENDYEAR: {
      return {
        ...state,
        endYear: action.payload.year,
      };
    }
    default: {
      return state;
    }
  }
}
