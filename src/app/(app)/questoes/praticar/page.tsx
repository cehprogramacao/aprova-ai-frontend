'use client';

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, alpha, useTheme,
  CircularProgress, LinearProgress, Paper, Grid, IconButton, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Divider,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Cancel, SkipNext, Refresh, FilterList,
  EmojiEvents, QuestionAnswer,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { questionExtractApi, subjectApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { BRAND_GRADIENT } from '@/theme';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

type Question = {
  id: string;
  number: number;
  statement: string;
  options: Record<string, string | null>;
  answer: string;
  explanation: string | null;
  banca: string | null;
  year: number | null;
  source: string | null;
  subject?: { name: string; color: string } | null;
};

type SessionStats = { total: number; correct: number; incorrect: number; skipped: number };

function normalizeQuestion(q: any, i: number): Question {
  return {
    id: q.id,
    number: i + 1,
    statement: q.statement || '',
    options: {
      A: q.optionA ?? q.options?.A ?? '',
      B: q.optionB ?? q.options?.B ?? '',
      C: q.optionC ?? q.options?.C ?? '',
      D: q.optionD ?? q.options?.D ?? '',
      E: q.optionE ?? q.options?.E ?? null,
    },
    answer: q.answer || '',
    explanation: q.explanation || null,
    banca: q.banca || null,
    year: q.year || null,
    source: q.source || null,
    subject: q.subject || null,
  };
}

// ─── Card de resultado de uma questão ─────────────────────────────────────────

function ResultCard({ question, selected, onNext, isLast }: {
  question: Question; selected: string; onNext: () => void; isLast: boolean;
}) {
  const isCorrect = selected === question.answer;

  return (
    <Box>
      <Box sx={{
        mb: 2, p: 2, borderRadius: 2,
        bgcolor: isCorrect ? alpha('#22C55E', 0.08) : alpha('#EF4444', 0.08),
        border: `2px solid ${isCorrect ? '#22C55E' : '#EF4444'}`,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        {isCorrect
          ? <CheckCircle sx={{ color: '#22C55E', fontSize: 32, flexShrink: 0 }} />
          : <Cancel sx={{ color: '#EF4444', fontSize: 32, flexShrink: 0 }} />}
        <Box>
          <Typography fontWeight={700} color={isCorrect ? '#22C55E' : '#EF4444'}>
            {isCorrect ? 'Correto!' : 'Incorreto'}
          </Typography>
          {!isCorrect && (
            <Typography variant="body2" color="text.secondary">
              Resposta correta: <strong>{question.answer}</strong>
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {OPTION_LETTERS.filter(l => question.options?.[l] != null && question.options[l] !== '').map(letter => {
          const isAns = letter === question.answer;
          const isSel = letter === selected;
          return (
            <Box key={letter} sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5,
              borderRadius: 2,
              border: `1.5px solid ${isAns ? '#22C55E' : isSel ? '#EF4444' : alpha('#9CA3AF', 0.3)}`,
              bgcolor: isAns ? alpha('#22C55E', 0.08) : isSel ? alpha('#EF4444', 0.08) : 'transparent',
            }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                bgcolor: isAns ? '#22C55E' : isSel ? '#EF4444' : alpha('#6C63FF', 0.1),
                color: (isAns || isSel) ? '#fff' : '#6C63FF',
              }}>
                {letter}
              </Box>
              <Typography variant="body2" sx={{ flexGrow: 1, mt: 0.25 }}>
                {question.options[letter]}
              </Typography>
              {isAns && <CheckCircle sx={{ color: '#22C55E', fontSize: 18, flexShrink: 0, mt: 0.25 }} />}
            </Box>
          );
        })}
      </Box>

      {question.explanation && (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#3B82F6', 0.06), border: `1px solid ${alpha('#3B82F6', 0.2)}`, mb: 2 }}>
          <Typography variant="caption" fontWeight={700} color="#3B82F6" display="block" mb={0.5}>EXPLICAÇÃO</Typography>
          <Typography variant="body2" color="text.secondary">{question.explanation}</Typography>
        </Paper>
      )}

      <Button fullWidth variant="contained" sx={{ background: BRAND_GRADIENT, py: 1.5, fontWeight: 700 }} onClick={onNext}>
        {isLast ? 'Ver resultado final' : 'Próxima questão →'}
      </Button>
    </Box>
  );
}

// ─── Tela de sessão encerrada ──────────────────────────────────────────────────

function SessionResult({ stats, onRestart }: { stats: SessionStats; onRestart: () => void }) {
  const router = useRouter();
  const answered = stats.total - stats.skipped;
  const taxa = answered > 0 ? Math.round((stats.correct / answered) * 100) : 0;
  const taxaColor = taxa >= 70 ? '#22C55E' : taxa >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', mt: 4 }}>
      <EmojiEvents sx={{ fontSize: 72, color: taxaColor, mb: 2 }} />
      <Typography variant="h5" fontWeight={800} mb={1}>Sessão encerrada!</Typography>
      <Typography color="text.secondary" mb={3}>Confira seu desempenho</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Respondidas', value: answered, color: '#7B2FF7' },
          { label: 'Acertos', value: stats.correct, color: '#22C55E' },
          { label: 'Erros', value: stats.incorrect, color: '#EF4444' },
          { label: 'Taxa', value: `${taxa}%`, color: taxaColor },
        ].map(s => (
          <Grid size={{ xs: 6 }} key={s.label}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(s.color, 0.2)}`, bgcolor: alpha(s.color, 0.05) }}>
              <Typography variant="h4" fontWeight={900} color={s.color}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <LinearProgress variant="determinate" value={taxa}
        sx={{ height: 10, borderRadius: 5, mb: 3, bgcolor: alpha('#EF4444', 0.15),
          '& .MuiLinearProgress-bar': { bgcolor: taxaColor, borderRadius: 5 } }} />

      <Typography variant="body2" color="text.secondary" mb={3}>
        {taxa >= 70 ? 'Excelente! Continue assim.' : taxa >= 50 ? 'Bom progresso! Revise os erros.' : 'Não desista! Pratique mais.'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" sx={{ background: BRAND_GRADIENT }} startIcon={<Refresh />} onClick={onRestart}>
          Praticar novamente
        </Button>
        <Button variant="outlined" onClick={() => router.push('/questoes')}>
          Voltar
        </Button>
      </Box>
    </Box>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function PraticarQuestoesPage() {
  const theme = useTheme();
  const router = useRouter();

  const [filterSubject, setFilterSubject] = useState('');
  const [filterBanca, setFilterBanca] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ total: 0, correct: 0, incorrect: 0, skipped: 0 });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-simple'],
    queryFn: () => subjectApi.getAll().then(r => r.data.data),
  });

  // Bancas distintas das questões importadas
  const { data: bancasData } = useQuery({
    queryKey: ['questions-bancas'],
    queryFn: () => questionExtractApi.list({ limit: 200 }).then(r => {
      const qs: any[] = r.data.data?.questions || [];
      const set = new Set(qs.map((q: any) => q.banca).filter(Boolean));
      return Array.from(set) as string[];
    }),
  });
  const bancas: string[] = bancasData || [];

  const startSession = async () => {
    setIsStarting(true);
    try {
      const res = await questionExtractApi.list({
        subjectId: filterSubject || undefined,
        banca: filterBanca || undefined,
        limit: 100,
      });
      const raw: any[] = res.data.data?.questions || [];
      if (raw.length === 0) {
        toast.error('Nenhuma questão encontrada. Importe questões primeiro ou mude os filtros.');
        return;
      }
      const qs = raw.map(normalizeQuestion).sort(() => Math.random() - 0.5);
      setQuestions(qs);
      setCurrentIdx(0);
      setSelected(null);
      setAnswered(false);
      setSessionDone(false);
      setStats({ total: qs.length, correct: 0, incorrect: 0, skipped: 0 });
      setStarted(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Erro ao carregar questões.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected || !questions[currentIdx]) return;
    const q = questions[currentIdx];
    const isCorrect = selected === q.answer;
    setAnswered(true);
    setStats(s => ({
      ...s,
      correct: s.correct + (isCorrect ? 1 : 0),
      incorrect: s.incorrect + (isCorrect ? 0 : 1),
    }));
    // Registra tentativa em segundo plano
    questionExtractApi.answer(q.id, { selected }).catch(() => {});
  };

  const goNext = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(next);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleSkip = () => {
    setStats(s => ({ ...s, skipped: s.skipped + 1 }));
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(next);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => {
    setStarted(false);
    setSessionDone(false);
    setQuestions([]);
    setCurrentIdx(0);
    setSelected(null);
    setAnswered(false);
  };

  const q = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + (answered ? 1 : 0)) / questions.length) * 100 : 0;

  if (sessionDone) {
    return <Box sx={{ p: 2 }}><SessionResult stats={stats} onRestart={restart} /></Box>;
  }

  // ─── Tela de filtros / início
  if (!started) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => router.push('/questoes')} size="small">Voltar</Button>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>Praticar Questões</Typography>
          <Typography color="text.secondary" variant="body2">
            Questões importadas de PDF com gabarito e explicações
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterList sx={{ color: 'text.secondary' }} />
              <Typography fontWeight={700}>Filtros (opcional)</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Disciplina</InputLabel>
                  <Select value={filterSubject} label="Disciplina" onChange={e => setFilterSubject(e.target.value)}>
                    <MenuItem value="">Todas</MenuItem>
                    {(subjects as any[]).map((s: any) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Banca</InputLabel>
                  <Select value={filterBanca} label="Banca" onChange={e => setFilterBanca(e.target.value)}>
                    <MenuItem value="">Todas</MenuItem>
                    {bancas.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2.5 }} />

            <Button
              fullWidth variant="contained" size="large"
              sx={{ background: BRAND_GRADIENT, py: 1.5, fontWeight: 700, fontSize: 16 }}
              onClick={startSession}
              disabled={isStarting}
              startIcon={isStarting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <QuestionAnswer />}
            >
              {isStarting ? 'Carregando...' : 'Iniciar sessão'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!q) return null;

  // ─── Sessão em andamento
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      {/* Progresso */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton size="small" onClick={restart}><ArrowBack /></IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress variant="determinate" value={progress}
            sx={{ height: 6, borderRadius: 3,
              bgcolor: alpha(theme.palette.divider, 0.3),
              '& .MuiLinearProgress-bar': { background: BRAND_GRADIENT, borderRadius: 3 } }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
          {currentIdx + 1}/{questions.length}
        </Typography>
      </Box>

      {/* Stats + meta */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label={`${stats.correct} acertos`}
          size="small" sx={{ bgcolor: alpha('#22C55E', 0.1), color: '#22C55E', fontWeight: 700 }} />
        <Chip icon={<Cancel sx={{ fontSize: 14 }} />} label={`${stats.incorrect} erros`}
          size="small" sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', fontWeight: 700 }} />
        {q.subject && (
          <Chip label={q.subject.name} size="small"
            sx={{ bgcolor: alpha(q.subject.color || '#7B2FF7', 0.1), color: q.subject.color || '#7B2FF7' }} />
        )}
        {q.banca && <Chip label={q.banca} size="small" variant="outlined" />}
        {q.year && <Chip label={String(q.year)} size="small" variant="outlined" />}
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Enunciado */}
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
            QUESTÃO {q.number}
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3, whiteSpace: 'pre-wrap' }}>
            {q.statement}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {answered ? (
            <ResultCard question={q} selected={selected!} onNext={goNext} isLast={currentIdx >= questions.length - 1} />
          ) : !OPTION_LETTERS.some(l => q.options?.[l]) ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="text.secondary" mb={2}>
                Esta questão não tem alternativas extraídas. Reimporte o PDF.
              </Typography>
              <Button variant="outlined" onClick={handleSkip}>Pular</Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {OPTION_LETTERS.filter(l => q.options?.[l]).map(letter => {
                  const isSel = selected === letter;
                  return (
                    <Box key={letter} onClick={() => setSelected(letter)} sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5,
                      borderRadius: 2, cursor: 'pointer',
                      border: `1.5px solid ${isSel ? theme.palette.primary.main : alpha(theme.palette.divider, 0.6)}`,
                      bgcolor: isSel ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      transition: 'all 0.15s',
                      '&:hover': {
                        border: `1.5px solid ${theme.palette.primary.main}`,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                        bgcolor: isSel ? theme.palette.primary.main : alpha('#6C63FF', 0.1),
                        color: isSel ? '#fff' : '#6C63FF', transition: 'all 0.15s',
                      }}>
                        {letter}
                      </Box>
                      <Typography variant="body2" sx={{ flexGrow: 1, mt: 0.25, lineHeight: 1.6 }}>
                        {q.options[letter]}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" fullWidth
                  sx={{ background: BRAND_GRADIENT, py: 1.25, fontWeight: 700 }}
                  onClick={handleConfirm} disabled={!selected}>
                  Confirmar resposta
                </Button>
                <Tooltip title="Pular questão">
                  <Button variant="outlined" color="inherit" onClick={handleSkip} sx={{ px: 2, flexShrink: 0 }}>
                    <SkipNext />
                  </Button>
                </Tooltip>
              </Box>

              {!selected && (
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
                  Selecione uma alternativa para confirmar
                </Typography>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
