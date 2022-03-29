import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render((
  <Auth0Provider
    domain="dev-jcp6xhzs.us.auth0.com"
    clientId="XdW3S9wZTZJlMloCQuEOZDzSq2LGr2Za"
    redirectUri={window.location.origin}
  >
  <BrowserRouter>
    <App />,
  </BrowserRouter>
  </Auth0Provider>),
  document.getElementById('root')
);

