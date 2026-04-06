'use client';

import { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, AppBar, IconButton, Typography,
  Avatar, Badge, Chip, Divider, Tooltip, useTheme, alpha,
} from '@mui/material';
import {
  Dashboard, School, CalendarMonth, FlashOn, MenuBook,
  QuestionAnswer, Notes, AccountTree, PictureAsPdf,
  EmojiEvents, TrackChanges, SelfImprovement, FitnessCenter,
  Analytics, Notifications, DarkMode, LightMode, Menu as MenuIcon,
  ChevronLeft, Bolt, Close, Person, GolfCourse, Quiz,
  Psychology, Article, SupervisorAccount, LocalFireDepartment,
  FileUpload,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { gamificationApi, notificationApi } from '@/lib/api';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Hoje', icon: <Dashboard />, href: '/dashboard' },
  { divider: true, label: 'Inteligência' },
  { label: 'Central de IA', icon: <Psychology />, href: '/inteligencia', highlight: true },
  { label: 'Importar Edital', icon: <Article />, href: '/edital' },
  { label: 'Mentoria', icon: <SupervisorAccount />, href: '/mentoria' },
  { divider: true, label: 'Estudo' },
  { label: 'Meu Concurso', icon: <GolfCourse />, href: '/concurso' },
  { label: 'Disciplinas', icon: <School />, href: '/disciplinas' },
  { label: 'Plano de Estudos', icon: <CalendarMonth />, href: '/plano' },
  { label: 'Simulados', icon: <Quiz />, href: '/simulado' },
  { label: 'Modo Foco', icon: <SelfImprovement />, href: '/foco' },
  { divider: true, label: 'Ferramentas' },
  { label: 'Desafio Diário', icon: <LocalFireDepartment />, href: '/desafio' },
  { label: 'Flashcards', icon: <FlashOn />, href: '/flashcards' },
  { label: 'Importar Flashcards', icon: <FileUpload />, href: '/flashcards/importar' },
  { label: 'Caderno de Erros', icon: <MenuBook />, href: '/caderno-erros' },
  { label: 'Questões', icon: <QuestionAnswer />, href: '/questoes' },
  { label: 'Importar Questões', icon: <FileUpload />, href: '/questoes/importar' },
  { label: 'Anotações', icon: <Notes />, href: '/anotacoes' },
  { label: 'Mapas Mentais', icon: <AccountTree />, href: '/mapas-mentais' },
  { label: 'PDFs', icon: <PictureAsPdf />, href: '/pdfs' },
  { divider: true, label: 'Progresso' },
  { label: 'Metas', icon: <TrackChanges />, href: '/metas' },
  { label: 'Hábitos', icon: <FitnessCenter />, href: '/habitos' },
  { label: 'Analytics', icon: <Analytics />, href: '/analytics' },
  { label: 'Gamificação', icon: <EmojiEvents />, href: '/gamificacao' },
  { divider: true, label: 'Conta' },
  { label: 'Meu Perfil', icon: <Person />, href: '/perfil' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const theme = useTheme();
  const { user, isDark, toggleDark, logout } = useAuthStore();

  const { data: gamiData } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => gamificationApi.getProfile().then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then((r) => r.data.data),
    staleTime: 1000 * 60,
  });

  const unreadCount = notifData?.filter((n: any) => !n.isRead).length || 0;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          color: 'text.primary',
          width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: open ? `${DRAWER_WIDTH}px` : 0,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton onClick={() => setOpen(!open)} size="small">
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* XP / Level */}
          {gamiData && (
            <Chip
              icon={<Bolt sx={{ fontSize: 16 }} />}
              label={`Nível ${gamiData.level} · ${gamiData.xp} XP`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700, mr: 1 }}
            />
          )}

          {/* Streak */}
          {gamiData?.streak > 0 && (
            <Chip
              label={`🔥 ${gamiData.streak} dias`}
              size="small"
              sx={{ bgcolor: alpha('#FF6B35', 0.15), color: '#FF6B35', fontWeight: 700, mr: 1 }}
            />
          )}

          {/* Dark mode */}
          <Tooltip title={isDark ? 'Modo claro' : 'Modo escuro'}>
            <IconButton onClick={toggleDark} size="small">
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Notificações */}
          <Tooltip title="Notificações">
            <IconButton component={Link} href="/notificacoes" size="small">
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Tooltip title="Meu Perfil">
            <IconButton component={Link} href="/perfil" size="small">
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}
                src={user?.avatar}
              >
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Sair">
            <IconButton size="small" onClick={() => logout()}>
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : 0,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          },
        }}
      >
        <Toolbar sx={{ px: 2, gap: 1 }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>A</Typography>
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
            Aprova<span style={{ color: theme.palette.primary.main }}>.AI</span>
          </Typography>
        </Toolbar>
        <Divider sx={{ opacity: 0.3 }} />

        <List sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto' }}>
          {navItems.map((item, idx) => {
            if (item.divider) {
              return (
                <Typography
                  key={idx}
                  variant="caption"
                  sx={{ px: 2, pt: 1.5, pb: 0.5, color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}
                >
                  {item.label}
                </Typography>
              );
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  href={item.href!}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 0.75,
                    ...(item.highlight && !isActive ? {
                      background: 'linear-gradient(135deg, rgba(123,47,247,0.12), rgba(0,194,255,0.08))',
                      border: '1px solid rgba(123,47,247,0.2)',
                    } : {}),
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                    },
                    '&:hover': { bgcolor: alpha(theme.palette.divider, 0.5) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : item.highlight ? '#7B2FF7' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : item.highlight ? 600 : 400,
                      color: item.highlight && !isActive ? '#7B2FF7' : undefined,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
