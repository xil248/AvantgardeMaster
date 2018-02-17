import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

export default function App({ store, history, routes }) {
  return (
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>
  );
}

App.propTypes = {
  store: PropTypes.object,  // eslint-disable-line
  history: PropTypes.object, // eslint-disable-line
  routes: PropTypes.object, // eslint-disable-line
};
