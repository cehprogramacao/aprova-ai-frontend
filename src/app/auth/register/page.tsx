'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Link as MuiLink, alpha, useTheme,
} from '@mui/material';
import { School, MenuBook } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { BRAND_GRADIENT } from '@/theme';
import Image from 'next/image';

type Role = 'STUDENT' | 'TEACHER';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [role, setRole] = useState<Role>('STUDENT');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register({ ...form, role });
      const { token, user } = res.data.data;
      setAuth(token, user);
      toast.success('Conta criada com sucesso!');
      router.push(role === 'TEACHER' ? '/professor' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Erro ao criar conta');
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
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 206, height: 176, borderRadius: 3, display: 'flex', alignItems: 'center',
            justifyContent: 'center', mx: 'auto', mb: 2,
            boxShadow: `0 8px 32px ${alpha('#7B2FF7', 0.4)}`, position: 'relative' }}>
            <Image alt="Logo" layout="fill" style={{ objectFit: 'cover' }} src="/logos/logo.png" />
          </Box>
        </Box>

        <Card sx={{ bgcolor: alpha('#111827', 0.9), backdropFilter: 'blur(20px)', border: `1px solid ${alpha('#fff', 0.08)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} color="white" gutterBottom>Criar sua conta</Typography>

            {/* Seletor de cargo */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, mt: 1 }}>
              {([
                { value: 'STUDENT' as Role, label: 'Sou Aluno', desc: 'Quero estudar e melhorar', icon: <MenuBook sx={{ fontSize: 28 }} /> },
                { value: 'TEACHER' as Role, label: 'Sou Professor', desc: 'Quero corrigir redações', icon: <School sx={{ fontSize: 28 }} /> },
              ] as const).map(opt => (
                <Box key={opt.value} onClick={() => setRole(opt.value)}
                  sx={{
                    flex: 1, p: 2, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${role === opt.value ? '#7B2FF7' : alpha('#fff', 0.1)}`,
                    bgcolor: role === opt.value ? alpha('#7B2FF7', 0.15) : alpha('#fff', 0.03),
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: alpha('#7B2FF7', 0.5) },
                  }}>
                  <Box sx={{ color: role === opt.value ? '#A78BFA' : alpha('#fff', 0.5), mb: 0.5 }}>
                    {opt.icon}
                  </Box>
                  <Typography fontWeight={700} color={role === opt.value ? '#A78BFA' : alpha('#fff', 0.7)} fontSize={14}>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" color={alpha('#fff', 0.4)} display="block">
                    {opt.desc}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                {loading ? 'Criando conta...' : `Criar conta ${role === 'TEACHER' ? 'de professor' : 'grátis'}`}
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
