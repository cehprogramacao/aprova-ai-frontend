'use client';

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  IconButton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon,
  alpha, useTheme, CircularProgress, Tabs, Tab, Divider,
  Select, MenuItem, FormControl, InputLabel, LinearProgress, Tooltip,
} from '@mui/material';
import {
  Add, CalendarMonth, AutoAwesome, CheckCircle,
  RadioButtonUnchecked, Timer, Delete, Edit, PlayArrow,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planApi, taskApi, subjectApi } from '@/lib/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import isToday from 'dayjs/plugin/isToday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);
dayjs.locale('pt-br');

const TASK_TYPES = ['LEITURA','REVISAO','EXERCICIOS','VIDEO','RESUMO','FLASHCARDS','SIMULADO'];
const TASK_LABEL: Record<string,string> = { LEITURA:'Leitura', REVISAO:'Revisão', EXERCICIOS:'Exercícios', VIDEO:'Vídeo', RESUMO:'Resumo', FLASHCARDS:'Flashcards', SIMULADO:'Simulado' };
const TASK_COLOR: Record<string,string> = { LEITURA:'#7B2FF7', REVISAO:'#EC4899', EXERCICIOS:'#22C55E', VIDEO:'#F59E0B', RESUMO:'#3B82F6', FLASHCARDS:'#8B5CF6', SIMULADO:'#EF4444' };

export default function PlanoPage() {
  const theme = useTheme();
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ name:'', startDate: dayjs().format('YYYY-MM-DD'), endDate: dayjs().add(3,'month').format('YYYY-MM-DD') });
  const [taskForm, setTaskForm] = useState({ title:'', scheduledDate: dayjs().format('YYYY-MM-DD'), estimatedMinutes:'60', type:'LEITURA', topicId:'' });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['study-plans'],
    queryFn: () => planApi.getAll().then(r => r.data.data),
  });

  const { data: todayData } = useQuery({
    queryKey: ['today-tasks'],
    queryFn: () => planApi.getToday().then(r => r.data.data),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-simple'],
    queryFn: () => subjectApi.getAll().then(r => r.data.data),
  });

  const activePlan = plans.find((p: any) => p.isActive);

  const createPlanMutation = useMutation({
    mutationFn: () => planApi.create({ ...planForm, startDate: planForm.startDate, endDate: planForm.endDate }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['study-plans'] }); setCreatePlanOpen(false); toast.success('Plano criado!'); },
  });

  const generateMutation = useMutation({
    mutationFn: () => planApi.generate({ planId: activePlan?.id, startDate: activePlan?.startDate, endDate: activePlan?.endDate }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['study-plans'] });
      qc.invalidateQueries({ queryKey: ['today-tasks'] });
      setGenerateOpen(false);
      toast.success(res.data.message || 'Cronograma gerado!');
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: () => taskApi.create({ ...taskForm, studyPlanId: activePlan?.id, estimatedMinutes: parseInt(taskForm.estimatedMinutes) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['study-plans'] }); qc.invalidateQueries({ queryKey: ['today-tasks'] }); setCreateTaskOpen(false); toast.success('Tarefa criada!'); },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => taskApi.complete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['study-plans'] }); qc.invalidateQueries({ queryKey: ['today-tasks'] }); toast.success('Concluída! +10 XP 🎉'); },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['study-plans'] }); qc.invalidateQueries({ queryKey: ['today-tasks'] }); },
  });

  // Agrupar tarefas do plano ativo por data
  const tasksByDate: Record<string, any[]> = {};
  activePlan?.tasks?.forEach((t: any) => {
    const d = dayjs(t.scheduledDate).format('YYYY-MM-DD');
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });

  const allTopics = subjects.flatMap((s: any) => s.modules?.flatMap((m: any) => m.topics?.map((t: any) => ({ ...t, subjectName: s.name })) || []) || []);

  if (plansLoading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Plano de Estudos</Typography>
          <Typography color="text.secondary">{activePlan ? `Plano ativo: ${activePlan.name}` : 'Nenhum plano ativo'}</Typography>
        </Box>
        <Box sx={{ display:'flex', gap:1 }}>
          {activePlan && (
            <>
              <Button variant="outlined" startIcon={<AutoAwesome />} onClick={() => setGenerateOpen(true)}>
                Gerar Automático
              </Button>
              <Button variant="outlined" startIcon={<Add />} onClick={() => setCreateTaskOpen(true)}>
                Tarefa
              </Button>
            </>
          )}
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreatePlanOpen(true)}>
            Novo Plano
          </Button>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_,v) => setTab(v)} sx={{ mb:3 }}>
        <Tab label="Hoje" />
        <Tab label="Calendário" />
        <Tab label="Todos os Planos" />
      </Tabs>

      {/* Aba Hoje */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs:12, md:4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Resumo de Hoje</Typography>
                {todayData ? (
                  <>
                    <Box sx={{ mb:2 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                        <Typography variant="body2" color="text.secondary">Progresso</Typography>
                        <Typography variant="body2" fontWeight={700}>{todayData.summary?.progressPercent || 0}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={todayData.summary?.progressPercent || 0} sx={{ height:8 }} />
                    </Box>
                    {[
                      { label:'Total', value: todayData.summary?.total || 0 },
                      { label:'Concluídas', value: todayData.summary?.completed || 0, color:'success.main' },
                      { label:'Pendentes', value: todayData.summary?.pending || 0, color:'warning.main' },
                      { label:'Tempo estimado', value: `${todayData.summary?.totalMinutes || 0} min` },
                    ].map(s => (
                      <Box key={s.label} sx={{ display:'flex', justifyContent:'space-between', py:0.5, borderBottom:`1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                        <Typography variant="body2" fontWeight={700} color={s.color}>{s.value}</Typography>
                      </Box>
                    ))}
                  </>
                ) : (
                  <Typography color="text.secondary">Sem tarefas para hoje</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs:12, md:8 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Tarefas — {dayjs().format('DD/MM/YYYY')}
                </Typography>
                {!todayData?.tasks?.length ? (
                  <Box sx={{ textAlign:'center', py:4 }}>
                    <Typography color="text.secondary">Nenhuma tarefa para hoje.</Typography>
                    {!activePlan && (
                      <Button variant="contained" sx={{ mt:2 }} onClick={() => setCreatePlanOpen(true)}>
                        Criar Plano de Estudos
                      </Button>
                    )}
                  </Box>
                ) : (
                  <List disablePadding>
                    {todayData.tasks.map((t: any) => (
                      <ListItem key={t.id} disablePadding sx={{ py:0.5 }}>
                        <ListItemIcon sx={{ minWidth:36 }}>
                          <IconButton size="small" onClick={() => !t.isCompleted && completeMutation.mutate(t.id)}
                            sx={{ color: t.isCompleted ? 'success.main' : 'text.disabled' }}>
                            {t.isCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
                          </IconButton>
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={500} sx={{ textDecoration: t.isCompleted ? 'line-through' : 'none', opacity: t.isCompleted ? 0.6 : 1 }}>{t.title}</Typography>}
                          secondary={
                            <Box sx={{ display:'flex', gap:0.5, mt:0.25 }}>
                              <Chip label={TASK_LABEL[t.type]} size="small" sx={{ height:18, fontSize:11, bgcolor: alpha(TASK_COLOR[t.type], 0.1), color: TASK_COLOR[t.type] }} />
                              <Chip icon={<Timer sx={{ fontSize:'12px !important' }} />} label={`${t.estimatedMinutes}min`} size="small" sx={{ height:18, fontSize:11 }} />
                            </Box>
                          }
                        />
                        <IconButton size="small" color="error" onClick={() => deleteTaskMutation.mutate(t.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Aba Calendário */}
      {tab === 1 && activePlan && (
        <Box>
          {Object.keys(tasksByDate).sort().map(date => (
            <Box key={date} sx={{ mb:3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb:1 }}>
                {dayjs(date).format('dddd, DD/MM')}
                {dayjs(date).isToday() && <Chip label="Hoje" size="small" color="primary" sx={{ ml:1 }} />}
              </Typography>
              <Card>
                <List disablePadding>
                  {tasksByDate[date].map((t: any, i: number) => (
                    <Box key={t.id}>
                      {i > 0 && <Divider />}
                      <ListItem>
                        <ListItemIcon sx={{ minWidth:36 }}>
                          <IconButton size="small" onClick={() => !t.isCompleted && completeMutation.mutate(t.id)}
                            sx={{ color: t.isCompleted ? 'success.main' : 'text.disabled' }}>
                            {t.isCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
                          </IconButton>
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={500} sx={{ textDecoration: t.isCompleted ? 'line-through' : 'none' }}>{t.title}</Typography>}
                          secondary={<Chip label={TASK_LABEL[t.type]} size="small" sx={{ height:18, fontSize:11, mt:0.25, bgcolor: alpha(TASK_COLOR[t.type], 0.1), color: TASK_COLOR[t.type] }} />}
                        />
                        <Chip label={`${t.estimatedMinutes}min`} size="small" icon={<Timer sx={{ fontSize:'12px !important' }} />} />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Card>
            </Box>
          ))}
          {Object.keys(tasksByDate).length === 0 && (
            <Card><CardContent sx={{ textAlign:'center', py:6 }}>
              <Typography color="text.secondary">Nenhuma tarefa no plano ainda.</Typography>
              <Button variant="contained" startIcon={<AutoAwesome />} onClick={() => setGenerateOpen(true)} sx={{ mt:2 }}>Gerar Cronograma Automático</Button>
            </CardContent></Card>
          )}
        </Box>
      )}

      {/* Aba Todos os Planos */}
      {tab === 2 && (
        <Grid container spacing={2}>
          {plans.map((plan: any) => (
            <Grid size={{ xs:12, md:6 }} key={plan.id}>
              <Card sx={{ borderLeft: plan.isActive ? '4px solid #7B2FF7' : '4px solid transparent' }}>
                <CardContent>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                    <Typography fontWeight={700}>{plan.name}</Typography>
                    {plan.isActive && <Chip label="Ativo" size="small" color="primary" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(plan.startDate).format('DD/MM/YYYY')} → {dayjs(plan.endDate).format('DD/MM/YYYY')}
                  </Typography>
                  <Box sx={{ mt:1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {plan.tasks?.length || 0} tarefas · {plan.tasks?.filter((t: any) => t.isCompleted).length || 0} concluídas
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Novo Plano */}
      <Dialog open={createPlanOpen} onClose={() => setCreatePlanOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Novo Plano de Estudos</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, pt:2 }}>
          <TextField label="Nome do plano" value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="Início" type="date" value={planForm.startDate} onChange={e => setPlanForm(f => ({ ...f, startDate: e.target.value }))} InputLabelProps={{ shrink:true }} />
          <TextField label="Fim" type="date" value={planForm.endDate} onChange={e => setPlanForm(f => ({ ...f, endDate: e.target.value }))} InputLabelProps={{ shrink:true }} />
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setCreatePlanOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => createPlanMutation.mutate()} disabled={!planForm.name}>Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Nova Tarefa */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Nova Tarefa</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, pt:2 }}>
          <TextField label="Título *" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} />
          <TextField label="Data" type="date" value={taskForm.scheduledDate} onChange={e => setTaskForm(f => ({ ...f, scheduledDate: e.target.value }))} InputLabelProps={{ shrink:true }} />
          <TextField label="Minutos estimados" type="number" value={taskForm.estimatedMinutes} onChange={e => setTaskForm(f => ({ ...f, estimatedMinutes: e.target.value }))} />
          <FormControl size="small">
            <InputLabel>Tipo</InputLabel>
            <Select value={taskForm.type} label="Tipo" onChange={e => setTaskForm(f => ({ ...f, type: e.target.value }))}>
              {TASK_TYPES.map(t => <MenuItem key={t} value={t}>{TASK_LABEL[t]}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Tópico (opcional)</InputLabel>
            <Select value={taskForm.topicId} label="Tópico (opcional)" onChange={e => setTaskForm(f => ({ ...f, topicId: e.target.value }))}>
              <MenuItem value="">Nenhum</MenuItem>
              {allTopics.map((t: any) => <MenuItem key={t.id} value={t.id}>{t.subjectName} — {t.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => createTaskMutation.mutate()} disabled={!taskForm.title || !activePlan}>Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Gerar Automático */}
      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Gerar Cronograma Automático</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            O sistema vai distribuir automaticamente todos os tópicos das suas disciplinas nos dias de estudo da sua rotina, priorizando pelo peso de cada disciplina.
          </Typography>
          {!activePlan && (
            <Typography color="error" sx={{ mt:1 }}>Crie um plano de estudos primeiro.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setGenerateOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<AutoAwesome />} onClick={() => generateMutation.mutate()}
            disabled={!activePlan || generateMutation.isPending}>
            {generateMutation.isPending ? 'Gerando...' : 'Gerar Agora'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
