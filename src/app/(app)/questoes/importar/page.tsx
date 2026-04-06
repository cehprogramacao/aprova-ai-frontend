'use client';

import { useState, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stepper, Step, StepLabel,
  CircularProgress, Alert, Chip, alpha, useTheme, TextField, Paper,
  IconButton, Grid, Select, MenuItem, FormControl, InputLabel, Divider,
  Accordion, AccordionSummary, AccordionDetails, Radio, RadioGroup,
  FormControlLabel, Tooltip,
} from '@mui/material';
import {
  CloudUpload, CheckCircle, ExpandMore, Delete, Edit, SwapHoriz,
  AutoAwesome, QuestionAnswer, School, ArrowBack, ArrowForward,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { questionExtractApi, subjectApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { BRAND_GRADIENT } from '@/theme';

const STEPS = ['Upload do PDF', 'Revisar questões', 'Confirmar'];
const FORMAT_LABELS: Record<string, string> = {
  simple: 'Gabarito simples no final',
  commented: 'Gabarito comentado separado',
  inline: 'Resposta inline por questão',
  unknown: 'Formato não identificado',
};
const FORMAT_COLORS: Record<string, string> = {
  simple: '#F59E0B', commented: '#10B981', inline: '#3B82F6', unknown: '#9CA3AF',
};
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function ImportarQuestoesPage() {
  const theme = useTheme();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [meta, setMeta] = useState({ subjectId: '', banca: '', year: '', source: '' });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-simple'],
    queryFn: () => subjectApi.getAll().then(r => r.data.data),
  });

  // ── Upload e extração
  const previewMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('pdf', file);
      return questionExtractApi.preview(fd);
    },
    onSuccess: (res) => {
      const d = res.data.data;
      setQuestions(d.questions);
      setFormat(d.format);
      setStep(1);
      toast.success(`${d.total} questões detectadas! Formato: ${FORMAT_LABELS[d.format] || d.format}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao extrair questões.');
    },
  });

  // ── Confirmação
  const confirmMutation = useMutation({
    mutationFn: () => questionExtractApi.confirm({
      questions,
      subjectId: meta.subjectId || null,
      banca: meta.banca || null,
      year: meta.year ? parseInt(meta.year) : null,
      source: meta.source || null,
    }),
    onSuccess: (res) => {
      setStep(2);
      toast.success(res.data.data.message);
    },
  });

  const handleFile = (file: File) => {
    if (!file || file.type !== 'application/pdf') { toast.error('Envie um arquivo PDF.'); return; }
    previewMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const removeQuestion = (idx: number) => setQuestions(qs => qs.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, field: string, value: any) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (idx: number, letter: string, value: string) => {
    setQuestions(qs => qs.map((q, i) => i === idx
      ? { ...q, options: { ...q.options, [letter]: value } }
      : q
    ));
  };

  const withAnswer = questions.filter(q => q.answer).length;
  const withExplanation = questions.filter(q => q.explanation).length;

  // ── Step 0: Upload
  if (step === 0) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => router.push('/questoes')} size="small">
            Voltar
          </Button>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>Importar Questões de PDF</Typography>
          <Typography color="text.secondary" variant="body2">
            Detecta automaticamente o formato e extrai questões com alternativas, gabarito e explicações
          </Typography>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {/* Formatos suportados */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {[
            { fmt: 'simple', ex: 'GABARITO\n1-C  2-A  3-D  4-B' },
            { fmt: 'commented', ex: 'GABARITO COMENTADO\n1. Resposta: C\nA alternativa C...' },
            { fmt: 'inline', ex: '1. Questão?\nA) ... B) ...\nResposta: C\nComentário: ...' },
          ].map(({ fmt, ex }) => (
            <Grid size={{ xs: 12, sm: 4 }} key={fmt}>
              <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(FORMAT_COLORS[fmt], 0.3)}`, height: '100%' }}>
                <Chip label={FORMAT_LABELS[fmt]} size="small"
                  sx={{ bgcolor: alpha(FORMAT_COLORS[fmt], 0.1), color: FORMAT_COLORS[fmt], fontWeight: 700, mb: 1, fontSize: 10 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace', whiteSpace: 'pre', fontSize: 10 }}>
                  {ex}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Drop zone */}
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          sx={{
            border: `2px dashed ${dragging ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8)}`,
            borderRadius: 3, p: 6, textAlign: 'center', cursor: 'pointer',
            bgcolor: dragging ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03), borderColor: theme.palette.primary.main },
          }}
        >
          {previewMutation.isPending ? (
            <Box>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6">Detectando formato e extraindo questões...</Typography>
              <Typography color="text.secondary" variant="body2">Isso pode levar alguns segundos</Typography>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={600}>Arraste o PDF aqui ou clique para selecionar</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Suporta todos os formatos de bancas (CEBRASPE, FCC, VUNESP, FGV, etc.)
              </Typography>
            </Box>
          )}
        </Box>
        <input ref={fileRef} type="file" accept=".pdf" hidden onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

        {previewMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(previewMutation.error as any)?.response?.data?.error || 'Erro ao processar PDF.'}
          </Alert>
        )}
      </Box>
    );
  }

  // ── Step 1: Revisão
  if (step === 1) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {/* Resumo */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip icon={<AutoAwesome />} label={`Formato: ${FORMAT_LABELS[format]}`}
                sx={{ bgcolor: alpha(FORMAT_COLORS[format] || '#6C63FF', 0.1), color: FORMAT_COLORS[format] || '#6C63FF', fontWeight: 700 }} />
              <Chip label={`${questions.length} questões`} color="primary" />
              <Chip label={`${withAnswer} com gabarito`} sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }} />
              {withExplanation > 0 && <Chip label={`${withExplanation} com explicação`} sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6' }} />}
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Edite questões sem gabarito antes de confirmar
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Metadados */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select fullWidth size="small" label="Disciplina (opcional)"
                  value={meta.subjectId} onChange={e => setMeta(m => ({ ...m, subjectId: e.target.value }))}>
                  <MenuItem value="">Sem disciplina</MenuItem>
                  {subjects.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField size="small" fullWidth label="Banca" placeholder="CEBRASPE, FCC..."
                  value={meta.banca} onChange={e => setMeta(m => ({ ...m, banca: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField size="small" fullWidth label="Ano" type="number" placeholder="2024"
                  value={meta.year} onChange={e => setMeta(m => ({ ...m, year: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField size="small" fullWidth label="Fonte / Prova"
                  value={meta.source} onChange={e => setMeta(m => ({ ...m, source: e.target.value }))} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de questões */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {questions.map((q, idx) => (
            <Accordion key={idx} disableGutters elevation={0}
              sx={{ border: `1px solid ${q.answer ? alpha('#10B981', 0.3) : alpha('#F59E0B', 0.4)}`, borderRadius: '12px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, minHeight: 56 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 1, overflow: 'hidden' }}>
                  <Chip label={`Q${q.number}`} size="small" sx={{ minWidth: 36, flexShrink: 0, fontWeight: 700, bgcolor: alpha('#6C63FF', 0.1), color: '#6C63FF' }} />
                  <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {q.statement}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    {q.answer
                      ? <Chip label={`${q.answer}`} size="small" sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981', fontWeight: 700, minWidth: 28 }} />
                      : <Chip label="?" size="small" sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', fontWeight: 700 }} />
                    }
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}>
                      <Delete sx={{ fontSize: 16, color: 'text.disabled' }} />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2 }}>
                {/* Enunciado */}
                <TextField fullWidth multiline rows={3} label="Enunciado" size="small" sx={{ mb: 2 }}
                  value={q.statement}
                  onChange={e => updateQuestion(idx, 'statement', e.target.value)} />

                {/* Alternativas */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {OPTION_LETTERS.filter(l => l !== 'E' || q.options?.E !== null).map(letter => (
                    <Grid size={{ xs: 12 }} key={letter}>
                      <TextField fullWidth size="small"
                        label={`Alternativa ${letter}`}
                        value={q.options?.[letter] || ''}
                        onChange={e => updateOption(idx, letter, e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: q.answer === letter ? '#10B981' : alpha('#6C63FF', 0.1),
                              color: q.answer === letter ? '#fff' : '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 12, mr: 1, flexShrink: 0, cursor: 'pointer' }}
                              onClick={() => updateQuestion(idx, 'answer', letter)}>
                              {letter}
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Gabarito */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Resposta correta:</Typography>
                  {OPTION_LETTERS.filter(l => q.options?.[l]).map(letter => (
                    <Box key={letter}
                      onClick={() => updateQuestion(idx, 'answer', letter)}
                      sx={{
                        width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                        bgcolor: q.answer === letter ? '#10B981' : alpha('#6C63FF', 0.1),
                        color: q.answer === letter ? '#fff' : '#6C63FF',
                        border: q.answer === letter ? 'none' : `1px solid ${alpha('#6C63FF', 0.2)}`,
                        transition: 'all 0.15s',
                      }}>
                      {letter}
                    </Box>
                  ))}
                </Box>

                {/* Explicação */}
                <TextField fullWidth multiline rows={2} label="Explicação / Comentário (opcional)" size="small"
                  value={q.explanation || ''}
                  onChange={e => updateQuestion(idx, 'explanation', e.target.value)} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setStep(0)} sx={{ flex: { xs: '1 1 100%', sm: 'none' } }}>Voltar</Button>
          <Button variant="contained"
            sx={{ background: BRAND_GRADIENT, px: 4, flex: { xs: '1 1 100%', sm: 'none' } }}
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending || questions.length === 0}>
            {confirmMutation.isPending ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : `Salvar ${questions.length} questões`}
          </Button>
        </Box>
      </Box>
    );
  }

  // ── Step 2: Concluído
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center', mt: 6 }}>
      <Stepper activeStep={2} sx={{ mb: 4 }}>
        {STEPS.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
      </Stepper>
      <Card>
        <CardContent sx={{ py: 5 }}>
          <CheckCircle sx={{ fontSize: 72, color: '#10B981', mb: 2 }} />
          <Typography variant="h5" fontWeight={800}>Questões importadas!</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {questions.length} questões salvas e prontas para praticar
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" sx={{ background: BRAND_GRADIENT }} onClick={() => router.push('/questoes')}>
              Praticar questões
            </Button>
            <Button variant="outlined" onClick={() => { setStep(0); setQuestions([]); setFormat(''); }}>
              Importar outro PDF
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
