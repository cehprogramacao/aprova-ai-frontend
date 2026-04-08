'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {/* Logo + nome */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 24, height: 24, borderRadius: 1,
            background: 'linear-gradient(135deg, #7B2FF7, #00C2FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 11 }}>R</Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: -0.3 }}>
          Rotta<span style={{ color: theme.palette.primary.main }}>Concursos</span>
        </Typography>
      </Box>

      {/* Copyright central */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled" display="block">
          © {new Date().getFullYear()} RottaConcursos. Todos os direitos reservados.
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: 10 }}>
          É proibida a reprodução, cópia, distribuição ou uso comercial sem autorização expressa do titular.
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: 10 }}>
          Direitos econômicos e patrimoniais pertencentes a{' '}
          <Box
            component="a"
            href="https://www.instagram.com/kauan.cleuton"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'text.disabled', textDecoration: 'underline', '&:hover': { color: 'primary.main' } }}
          >
            Kauan Cleuton
          </Box>
          {' '}— Lei 9.610/98 (Lei de Direitos Autorais).
        </Typography>
      </Box>

      {/* Desenvolvido por */}
      <Typography variant="caption" color="text.disabled">
        Desenvolvido por{' '}
        <Box
          component="a"
          href="https://www.instagram.com/kauan.cleuton"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'text.disabled', fontWeight: 700, textDecoration: 'underline', '&:hover': { color: 'primary.main' } }}
        >
          Kauan Cleuton
        </Box>
      </Typography>
    </Box>
  );
}
