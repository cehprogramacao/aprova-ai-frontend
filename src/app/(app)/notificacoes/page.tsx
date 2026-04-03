'use client';

import {
  Box, Card, CardContent, Typography, IconButton, Chip,
  CircularProgress, Button, alpha, useTheme, Divider,
} from '@mui/material';
import { DoneAll, Delete, Notifications, Circle } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/lib/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

export default function NotificacoesPage() {
  const theme = useTheme();
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-page'],
    queryFn: () => notificationApi.getAll().then(r => r.data.data || []),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications-page'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications-page'] }); toast.success('Todas marcadas como lidas'); },
  });

  const unread = notifications.filter((n: any) => !n.isRead).length;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Notificações</Typography>
          <Typography color="text.secondary" variant="body2">{unread} não lidas de {notifications.length}</Typography>
        </Box>
        {unread > 0 && (
          <Button variant="outlined" startIcon={<DoneAll />} onClick={() => markAllMutation.mutate()}>
            Marcar todas como lidas
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Notifications sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6">Nenhuma notificação</Typography>
          <Typography color="text.secondary">Você está em dia com tudo!</Typography>
        </CardContent></Card>
      ) : (
        <Card>
          {notifications.map((notif: any, idx: number) => (
            <Box key={notif.id}>
              {idx > 0 && <Divider />}
              <Box sx={{
                px: 2.5, py: 1.5, display: 'flex', gap: 2, alignItems: 'flex-start',
                bgcolor: !notif.isRead ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                transition: 'background 0.2s',
                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
              }}>
                {!notif.isRead && (
                  <Circle sx={{ fontSize: 8, color: 'primary.main', mt: 0.7, flexShrink: 0 }} />
                )}
                {notif.isRead && <Box sx={{ width: 8, flexShrink: 0 }} />}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={notif.isRead ? 400 : 600}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(notif.createdAt).format('DD/MM/YYYY [às] HH:mm')}
                  </Typography>
                </Box>
                {!notif.isRead && (
                  <IconButton size="small" onClick={() => markReadMutation.mutate(notif.id)}>
                    <DoneAll fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Card>
      )}
    </Box>
  );
}
