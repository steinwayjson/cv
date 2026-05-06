import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { db } from '../lib/supabase';

export function useTgChannels() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tg-channels'],
    queryFn: () => db.tgChannels.getAll(),
  });

  const addMutation = useMutation({
    mutationFn: ({ username, title, depthDays }: { username: string; title: string; depthDays?: number }) =>
      db.tgChannels.add(username, title, depthDays),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tg-channels'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      db.tgChannels.toggle(id, isActive),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tg-channels'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.tgChannels.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tg-channels'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateDepthMutation = useMutation({
    mutationFn: ({ id, depthDays }: { id: string; depthDays: number }) =>
      db.tgChannels.updateDepth(id, depthDays),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tg-channels'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    channels: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addChannel: addMutation.mutate,
    toggleChannel: toggleMutation.mutate,
    deleteChannel: deleteMutation.mutate,
    updateDepth: updateDepthMutation.mutate,
    isAdding: addMutation.isPending,
    addError: addMutation.error,
  };
}
