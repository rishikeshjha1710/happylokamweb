'use client';

import { PropsWithChildren } from 'react';
import { ApolloAppProvider } from '@/lib/apollo';

export function Providers({ children }: PropsWithChildren) {
  return <ApolloAppProvider>{children}</ApolloAppProvider>;
}

