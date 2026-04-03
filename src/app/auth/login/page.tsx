'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Link as MuiLink, InputAdornment, IconButton, alpha, useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { BRAND_GRADIENT } from '@/theme';
import Image from 'next/image';

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { token, user } = res.data.data;
      setAuth(token, user);
      toast.success(`Bem-vindo, ${user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, #0A1F44 0%, #1E3A8A 50%, #0B0F1A 100%)`,
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* <Box
            sx={{
              width: 56, height: 56, borderRadius: 3,
              background: BRAND_GRADIENT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
              boxShadow: `0 8px 32px ${alpha('#7B2FF7', 0.4)}`,
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 24 }}>A</Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', letterSpacing: -1 }}>
            Aprova<span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.AI</span>
          </Typography> */}
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
          <Typography sx={{ color: alpha('#fff', 0.6), mt: 0.5 }}>
            Plataforma Inteligente de Estudos
          </Typography>
        </Box>

        <Card sx={{ bgcolor: alpha('#111827', 0.9), backdropFilter: 'blur(20px)', border: `1px solid ${alpha('#fff', 0.08)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} color="white" gutterBottom>
              Entrar na plataforma
            </Typography>

            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: alpha('#fff', 0.15) },
                    '&:hover fieldset': { borderColor: alpha('#fff', 0.3) },
                  },
                  '& .MuiInputLabel-root': { color: alpha('#fff', 0.6) },
                }}
              />

              <TextField
                label="Senha"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} sx={{ color: alpha('#fff', 0.5) }}>
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: alpha('#fff', 0.15) },
                    '&:hover fieldset': { borderColor: alpha('#fff', 0.3) },
                  },
                  '& .MuiInputLabel-root': { color: alpha('#fff', 0.6) },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ background: BRAND_GRADIENT, py: 1.5, fontWeight: 700, fontSize: 16 }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>
                  Não tem conta?{' '}
                  <MuiLink component={Link} href="/auth/register" sx={{ color: '#00C2FF', fontWeight: 600 }}>
                    Criar agora
                  </MuiLink>
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: alpha('#7B2FF7', 0.1), borderRadius: 2, border: `1px solid ${alpha('#7B2FF7', 0.2)}` }}>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                  Demo: <strong style={{ color: '#00C2FF' }}>demo@aprovaai.com</strong> · senha: <strong style={{ color: '#00C2FF' }}>demo1234</strong>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
