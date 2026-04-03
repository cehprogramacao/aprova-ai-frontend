'use client';

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  IconButton, LinearProgress, alpha, useTheme, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import {
  Add, FlashOn, CheckCircle, Cancel, Schedule,
  ThumbUp, ThumbDown, FiberManualRecord,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardApi, subjectApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { BRAND_GRADIENT } from '@/theme';

const RATING_LABELS = [
  { value: 0, label: 'Errei', color: 'error', icon: <Cancel /> },
  { value: 1, label: 'Difícil', color: 'warning', icon: <ThumbDown /> },
  { value: 2, label: 'Ok', color: 'info', icon: <ThumbUp /> },
  { value: 3, label: 'Fácil', color: 'success', icon: <CheckCircle /> },
];

export default function FlashcardsPage() {
  const theme = useTheme();
  const qc = useQueryClient();
  const [tab, setTab] = useState(0); // 0=revisar, 1=todos, 2=criar
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ front: '', back: '', subjectId: '', topicId: '' });

  const { data: dueData } = useQuery({
    queryKey: ['flashcards-due'],
    queryFn: () => flashcardApi.getDue().then((r) => r.data.data),
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ['flashcards-all'],
    queryFn: () => flashcardApi.getAll().then((r) => r.data.data),
    enabled: tab === 1,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-simple'],
    queryFn: () => subjectApi.getAll().then((r) => r.data.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      flashcardApi.review(id, rating),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards-due'] });
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    },
  });

  const createMutation = useMutation({
    mutationFn: () => flashcardApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards-all'] });
      qc.invalidateQueries({ queryKey: ['flashcards-due'] });
      setCreateOpen(false);
      setForm({ front: '', back: '', subjectId: '', topicId: '' });
      toast.success('Flashcard criado!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => flashcardApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards-all'] });
      toast.success('Flashcard removido');
    },
  });

  const dueCards = dueData?.flashcards || [];
  const currentCard = dueCards[currentIndex];
  const isSessionDone = currentIndex >= dueCards.length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Flashcards</Typography>
          <Typography color="text.secondary">Revisão espaçada com algoritmo SM-2</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          Novo Card
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Revisar (${dueData?.total || 0})`} icon={<Schedule />} iconPosition="start" />
        <Tab label={`Todos (${allCards.length})`} icon={<FlashOn />} iconPosition="start" />
      </Tabs>

      {/* Modo revisão */}
      {tab === 0 && (
        <Box>
          {dueCards.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6">Nenhum card para revisar!</Typography>
                <Typography color="text.secondary">Volte mais tarde ou crie novos flashcards.</Typography>
              </CardContent>
            </Card>
          ) : isSessionDone ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h4" fontWeight={700} mb={1}>🎉 Sessão Concluída!</Typography>
                <Typography color="text.secondary" gutterBottom>
                  Você revisou {dueCards.length} flashcard{dueCards.length > 1 ? 's' : ''}
                </Typography>
                <Button variant="contained" onClick={() => setCurrentIndex(0)} sx={{ mt: 2 }}>
                  Revisar novamente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              {/* Progress */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {currentIndex + 1} / {dueCards.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentCard?.subject?.name} {currentCard?.topic?.name && `· ${currentCard.topic.name}`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(currentIndex / dueCards.length) * 100}
                sx={{ mb: 3, height: 6 }}
              />

              {/* Card */}
              <Box
                onClick={() => setFlipped(!flipped)}
                sx={{
                  perspective: '1000px', cursor: 'pointer', mb: 3,
                  '& .inner': {
                    position: 'relative', width: '100%', height: 280,
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.5s',
                  },
                  '& .front, & .back': {
                    position: 'absolute', width: '100%', height: '100%',
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    borderRadius: 4, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', p: 3, textAlign: 'center',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                  '& .front': {
                    background: BRAND_GRADIENT,
                    color: '#fff',
                  },
                  '& .back': {
                    background: theme.palette.background.paper,
                    border: `2px solid ${theme.palette.primary.main}`,
                    transform: 'rotateY(180deg)',
                  },
                }}
              >
                <Box className="inner">
                  <Box className="front">
                    <Chip label="Pergunta" size="small" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                    <Typography variant="h6" fontWeight={600}>
                      {currentCard?.front}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 2, opacity: 0.7 }}>
                      Clique para ver a resposta
                    </Typography>
                  </Box>
                  <Box className="back">
                    <Chip label="Resposta" size="small" color="primary" sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {currentCard?.back}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Rating buttons */}
              {flipped && (
                <Grid container spacing={1.5}>
                  {RATING_LABELS.map((r) => (
                    <Grid size={3} key={r.value}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color={r.color as any}
                        startIcon={r.icon}
                        onClick={() => reviewMutation.mutate({ id: currentCard.id, rating: r.value })}
                        disabled={reviewMutation.isPending}
                        sx={{ flexDirection: 'column', py: 1.5, gap: 0.5 }}
                      >
                        {r.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Todos os cards */}
      {tab === 1 && (
        <Grid container spacing={2}>
          {allCards.map((card: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    {card.subject && (
                      <Chip
                        label={card.subject.name}
                        size="small"
                        sx={{ bgcolor: alpha(card.subject.color || '#6C63FF', 0.1), color: card.subject.color || '#6C63FF' }}
                      />
                    )}
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(card.id)}>
                      <Cancel fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom noWrap>{card.front}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{card.back}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                    <Chip label={`${card.repetitions}x`} size="small" />
                    <Chip label={`EF: ${card.easeFactor.toFixed(1)}`} size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog criar */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Novo Flashcard</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Pergunta (frente)"
            multiline rows={3}
            value={form.front}
            onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
          />
          <TextField
            label="Resposta (verso)"
            multiline rows={3}
            value={form.back}
            onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))}
          />
          <FormControl size="small">
            <InputLabel>Disciplina</InputLabel>
            <Select value={form.subjectId} label="Disciplina"
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}>
              <MenuItem value="">Nenhuma</MenuItem>
              {subjects.map((s: any) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={!form.front || !form.back || createMutation.isPending}
          >
            Criar Flashcard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
