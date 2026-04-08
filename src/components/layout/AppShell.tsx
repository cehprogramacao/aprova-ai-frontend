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
  FileUpload, PlayArrow, AutoStories, School as SchoolIcon,
  Group, Assignment, RateReview,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { gamificationApi, notificationApi } from '@/lib/api';

const DRAWER_WIDTH = 260;

type NavItem =
  | { divider: true; label: string }
  | { label: string; icon: React.ReactNode; href: string; highlight?: boolean };

const studentNavItems: NavItem[] = [
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
  { label: 'Praticar Questões', icon: <PlayArrow />, href: '/questoes/praticar' },
  { label: 'Importar Questões', icon: <FileUpload />, href: '/questoes/importar' },
  { label: 'Anotações', icon: <Notes />, href: '/anotacoes' },
  { label: 'Mapas Mentais', icon: <AccountTree />, href: '/mapas-mentais' },
  { label: 'PDFs', icon: <PictureAsPdf />, href: '/pdfs' },
  { divider: true, label: 'Redação' },
  { label: 'Minhas Redações', icon: <AutoStories />, href: '/redacao' },
  { label: 'Nova Redação', icon: <PlayArrow />, href: '/redacao/nova' },
  { divider: true, label: 'Progresso' },
  { label: 'Metas', icon: <TrackChanges />, href: '/metas' },
  { label: 'Hábitos', icon: <FitnessCenter />, href: '/habitos' },
  { label: 'Analytics', icon: <Analytics />, href: '/analytics' },
  { label: 'Gamificação', icon: <EmojiEvents />, href: '/gamificacao' },
  { divider: true, label: 'Conta' },
  { label: 'Meu Perfil', icon: <Person />, href: '/perfil' },
];

const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <Dashboard />, href: '/professor' },
  { divider: true, label: 'Alunos' },
  { label: 'Meus Alunos', icon: <Group />, href: '/professor/alunos' },
  { divider: true, label: 'Redações' },
  { label: 'Todas as Redações', icon: <Assignment />, href: '/professor/redacoes' },
  { divider: true, label: 'Ferramentas' },
  { label: 'Templates de Feedback', icon: <RateReview />, href: '/professor/templates' },
  { divider: true, label: 'Conta' },
  { label: 'Meu Perfil', icon: <Person />, href: '/perfil' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const theme = useTheme();
  const { user, isDark, toggleDark, logout } = useAuthStore();

  const isTeacher = user?.role === 'TEACHER';
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

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

          {/* Role badge */}
          {isTeacher && (
            <Chip
              icon={<SchoolIcon sx={{ fontSize: 14 }} />}
              label="Professor"
              size="small"
              sx={{ bgcolor: alpha('#7B2FF7', 0.12), color: '#7B2FF7', fontWeight: 700, mr: 1 }}
            />
          )}

          {/* XP / Level — só para alunos */}
          {!isTeacher && gamiData && (
            <Chip
              icon={<Bolt sx={{ fontSize: 16 }} />}
              label={`Nível ${gamiData.level} · ${gamiData.xp} XP`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700, mr: 1 }}
            />
          )}

          {/* Streak — só para alunos */}
          {!isTeacher && gamiData?.streak > 0 && (
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
              background: 'linear-gradient(135deg, #7B2FF7, #00C2FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: -0.5 }}>R</Typography>
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5, lineHeight: 1 }}>
            Rotta<span style={{ color: theme.palette.primary.main }}>Concursos</span>
          </Typography>
        </Toolbar>
        <Divider sx={{ opacity: 0.3 }} />

        <List sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map((item, idx) => {
            if ('divider' in item && item.divider) {
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

            const navItem = item as { label: string; icon: React.ReactNode; href: string; highlight?: boolean };
            const isActive = pathname === navItem.href || pathname.startsWith(navItem.href + '/');

            return (
              <ListItem key={navItem.href} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  href={navItem.href}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 0.75,
                    ...(navItem.highlight && !isActive ? {
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
                  <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : navItem.highlight ? '#7B2FF7' : 'text.secondary' }}>
                    {navItem.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={navItem.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : navItem.highlight ? 600 : 400,
                      color: navItem.highlight && !isActive ? '#7B2FF7' : undefined,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Footer do Drawer */}
        <Box
          sx={{
            px: 2, py: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontSize: 10, lineHeight: 1.6 }}>
            © {new Date().getFullYear()} RottaConcursos
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontSize: 10 }}>
            Desenvolvido por{' '}
            <Box component="a" href="https://www.instagram.com/kauan.cleuton" target="_blank" rel="noopener noreferrer"
              sx={{ color: 'text.disabled', textDecoration: 'underline', '&:hover': { color: 'primary.main' } }}>
              Kauan Cleuton
            </Box>
          </Typography>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {children}
        </Box>

        {/* Footer principal */}
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
              Direitos econômicos e patrimoniais pertencentes a Kauan Cleuton — Lei 9.610/98 (Lei de Direitos Autorais).
            </Typography>
          </Box>

          {/* Desenvolvido por */}
          <Typography variant="caption" color="text.disabled">
            Desenvolvido por{' '}
            <Box component="a" href="https://www.instagram.com/kauan.cleuton" target="_blank" rel="noopener noreferrer"
              sx={{ color: 'text.disabled', fontWeight: 700, textDecoration: 'underline', '&:hover': { color: 'primary.main' } }}>
              Kauan Cleuton
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
