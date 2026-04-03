'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Link as MuiLink, alpha, useTheme,
} from '@mui/material';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { BRAND_GRADIENT } from '@/theme';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(form);
      const { token, user } = res.data.data;
      setAuth(token, user);
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, #0A1F44 0%, #1E3A8A 50%, #0B0F1A 100%)`,
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 206, height: 176, borderRadius: 3,
              // background: BRAND_GRADIENT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
              boxShadow: `0 8px 32px ${alpha('#7B2FF7', 0.4)}`,
              position: "relative"
            }}
          >
            <Image alt="Logo" layout='fill' style={{
              objectFit: 'cover'
            }} src="/logos/logo.png" />
          </Box>
        </Box>

        <Card sx={{ bgcolor: alpha('#111827', 0.9), backdropFilter: 'blur(20px)', border: `1px solid ${alpha('#fff', 0.08)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} color="white" gutterBottom>Criar sua conta</Typography>

            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {(['name', 'email', 'password'] as const).map((field) => (
                <TextField
                  key={field}
                  label={field === 'name' ? 'Nome completo' : field === 'email' ? 'E-mail' : 'Senha (min. 8 caracteres)'}
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: alpha('#fff', 0.15) }, '&:hover fieldset': { borderColor: alpha('#fff', 0.3) } },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.6) },
                  }}
                />
              ))}

              <Button
                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{ background: BRAND_GRADIENT, py: 1.5, fontWeight: 700, fontSize: 16 }}
              >
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>
                  Já tem conta?{' '}
                  <MuiLink component={Link} href="/auth/login" sx={{ color: '#00C2FF', fontWeight: 600 }}>
                    Entrar
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
