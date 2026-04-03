'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mindMapApi } from '@/lib/api';
import MindMapEditor from '@/components/mindmap/MindMapEditor';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function MindMapEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: map, isLoading } = useQuery({
    queryKey: ['mind-map', id],
    queryFn: () => mindMapApi.get(id).then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => mindMapApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mind-maps'] }),
  });

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!map) return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography color="text.secondary">Mapa não encontrado</Typography>
    </Box>
  );

  return (
    <MindMapEditor
      map={map}
      onSave={(data) => saveMutation.mutateAsync(data)}
      onBack={() => router.push('/mapas-mentais')}
      isSaving={saveMutation.isPending}
    />
  );
}
