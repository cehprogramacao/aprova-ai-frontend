'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import AppShell from '@/components/layout/AppShell';
import { Box, CircularProgress } from '@mui/material';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !token) {
      router.replace('/auth/login');
    }
  }, [token, router, _hasHydrated]);

  // Aguarda o Zustand reidratar do localStorage
  if (!_hasHydrated) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) return null;

  return <AppShell>{children}</AppShell>;
}
