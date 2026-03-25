const DEFAULT_GRAPHQL_ENDPOINT = '/api/graphql';

function normalizeEndpoint(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : '';
}

export function getGraphqlEndpoint() {
  return normalizeEndpoint(process.env.NEXT_PUBLIC_GRAPHQL_URL) || DEFAULT_GRAPHQL_ENDPOINT;
}

export function getHealthEndpoint() {
  const endpoint = getGraphqlEndpoint();

  if (endpoint.endsWith('/graphql')) {
    return endpoint.replace(/\/graphql$/, '/health');
  }

  return endpoint.endsWith('/api') ? `${endpoint}/health` : '/api/health';
}
