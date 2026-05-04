import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';

export function useTgChannels() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tg-channels'],
    queryFn: () => db.tgChannels.getAll(),
  });

  const addMutation = useMutation({
    mutationFn: ({ username, title }: { username: string; title: string }) =>
      db.tgChannels.add(username, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-channels'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      db.tgChannels.toggle(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-channels'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.tgChannels.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tg-channels'] });
    },
  });

  return {
    channels: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addChannel: addMutation.mutate,
    toggleChannel: toggleMutation.mutate,
    deleteChannel: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    addError: addMutation.error,
  };
}
