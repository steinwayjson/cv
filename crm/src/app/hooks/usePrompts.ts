import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PromptKey } from '../lib/types';

export function usePrompts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['prompts', 'active'],
    queryFn: () => db.prompts.getAll(),
    enabled: !!user,
  });
}

export function usePromptVersions(key: PromptKey | null, limit = 5) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['prompts', key, 'versions', limit],
    queryFn: () => db.prompts.getVersions(key!, limit),
    enabled: !!user && !!key,
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content, description, name }: { id: string; content: string; description?: string | null; name?: string | null }) =>
      db.prompts.update(id, content, description, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.id] });
    },
  });
}

export function useCreatePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: db.prompts.createVersion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.key, 'versions'] });
    },
  });
}

export function useActivatePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, version }: { key: PromptKey; version: number }) =>
      db.prompts.activateVersion(key, version),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.key, 'versions'] });
    },
  });
}

export function useDeletePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; key: PromptKey }) => db.prompts.deleteVersion(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.key, 'versions'] });
    },
  });
}
