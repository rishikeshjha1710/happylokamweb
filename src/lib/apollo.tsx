'use client';

import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { PropsWithChildren } from 'react';
import { clearSession } from './auth';
import { getGraphqlEndpoint } from './runtime-config';

const httpLink = new HttpLink({
  uri: getGraphqlEndpoint(),
  credentials: 'include'
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      if (error.extensions?.code === 'UNAUTHENTICATED' || error.extensions?.code === 401) {
        clearSession();
      }

      console.error('[GraphQL error]', error.message);
    });
  }

  if (networkError) {
    console.error('[Network error]', networkError);
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([errorLink, httpLink])
});

export function ApolloAppProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
