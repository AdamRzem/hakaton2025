import type { AppRouter } from '@/backend/index';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://192.168.0.56:3000',
    }),
  ],
});
