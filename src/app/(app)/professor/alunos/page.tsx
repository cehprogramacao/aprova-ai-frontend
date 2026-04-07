'use client';

import {
  Box, Card, CardContent, Typography, Chip, alpha, useTheme, Grid,
  Avatar, CircularProgress, LinearProgress, Button,
} from '@mui/material';
import { Group, TrendingUp, ArrowForward, Schedule } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const SCORE_COLOR = (s: number | null) =>
  !s ? '#9CA3AF' : s >= 700 ? '#22C55E' : s >= 500 ? '#F59E0B' : '#EF4444';

export default function ProfessorStudentsPage() {
  const theme = useTheme();
  const router = useRouter();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: () => teacherApi.listStudents().then(r => r.data.data),
  });

  if (isLoading) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Meus Alunos</Typography>
        <Typography color="text.secondary" variant="body2">{(students as any[]).length} alunos vinculados</Typography>
      </Box>

      {(students as any[]).length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Group sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography fontWeight={600}>Nenhum aluno vinculado</Typography>
          <Typography color="text.secondary" variant="body2" mt={1}>
            Seus alunos irão gerar um link de convite na página de Redações
          </Typography>
        </CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {(students as any[]).map((student: any) => {
            const color = SCORE_COLOR(student.lastScore);
            const pct = student.lastScore ? (student.lastScore / 1000) * 100 : 0;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={student.id}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}
                  onClick={() => router.push(`/professor/alunos/${student.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Avatar src={student.avatar} sx={{ width: 44, height: 44 }}>{student.name[0]}</Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap>{student.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{student.email}</Typography>
                      </Box>
                    </Box>

                    {student.lastScore != null ? (
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Última nota</Typography>
                          <Typography variant="body2" fontWeight={700} color={color}>{student.lastScore}/1000</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height: 6, borderRadius: 3, bgcolor: alpha('#EF4444', 0.1),
                            '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" mb={1.5}>Sem redação corrigida</Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {student.pendingEssays > 0 ? (
                        <Chip label={`${student.pendingEssays} pendente(s)`}
                          sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', fontWeight: 600 }} size="small" />
                      ) : (
                        <Chip label="Em dia" sx={{ bgcolor: alpha('#22C55E', 0.1), color: '#22C55E' }} size="small" />
                      )}
                      {student.lastCorrectedAt && (
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(student.lastCorrectedAt).format('DD/MM')}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
