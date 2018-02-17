import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import FilterReducer from './reducer_filter';
import FeatureReducer from './reducer_feature';
import BrushReducer from './reducer_brush';
import StackReducer from './reducer_stack';
import ClusterReducer from './reducer_cluster';
import YearDataReducer from './reducer_yeardata';

const rootReducer = combineReducers({
  filters: FilterReducer,
  features: FeatureReducer,
  brushing: BrushReducer,
  routing: routerReducer,
  stacking: StackReducer,
  clusters: ClusterReducer,
  yearsData: YearDataReducer,
});

export default rootReducer;
