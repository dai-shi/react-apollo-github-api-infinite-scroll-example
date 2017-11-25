/* eslint-env browser */

import { createElement as h } from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';

import App from './App';

const createApolloClient = () => {
  const match = /access_token=([a-f0-9]+)/.exec(window.location.hash);
  const accessToken = match && match[1];
  const link = new HttpLink({
    uri: 'https://api.github.com/graphql',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  const cache = new InMemoryCache();
  return new ApolloClient({ link, cache });
};

const render = (Component) => {
  ReactDOM.render(
    h(ApolloProvider, { client: createApolloClient() }, h(Component)),
    document.getElementById('app'),
  );
};

render(App);
