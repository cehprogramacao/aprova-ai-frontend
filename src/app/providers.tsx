'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { lightTheme, darkTheme } from '@/theme';
import { useAuthStore } from '@/store/auth.store';
import MuiRegistry from './mui-registry';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
    })
  );

  const { isDark } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <MuiRegistry>
        <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
          <CssBaseline />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: isDark ? '#1A1D23' : '#fff',
                color: isDark ? '#F9FAFB' : '#1A1D23',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#00C896', secondary: '#fff' } },
              error: { iconTheme: { primary: '#FF4B6B', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </MuiRegistry>
    </QueryClientProvider>
  );
}
