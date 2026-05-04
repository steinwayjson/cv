import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Vacancy } from '../lib/types';

export function useVacancies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['vacancies'],
    queryFn: () => db.vacancies.getAll(),
    enabled: !!user,
  });
}

export function useVacancy(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => db.vacancies.getById(id),
    enabled: !!user && !!id,
  });
}

export function useUpdateVacancyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, lastStage }: { id: string; status: string; lastStage?: string }) =>
      db.vacancies.updateStatus(id, status, lastStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
    onError: (e: Error) => toast.error(`Ошибка обновления статуса: ${e.message}`),
  });
}

export function useUpdateVacancyNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes, nextAction, nextActionAt }: {
      id: string;
      notes: string;
      nextAction?: string;
      nextActionAt?: string;
    }) => db.vacancies.updateNotes(id, notes, nextAction, nextActionAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
    onError: (e: Error) => toast.error(`Ошибка сохранения: ${e.message}`),
  });
}

export function useUpdateVacancyLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, letterEdited }: { id: string; letterEdited: string }) =>
      db.vacancies.updateLetter(id, letterEdited),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
    onError: (e: Error) => toast.error(`Ошибка сохранения письма: ${e.message}`),
  });
}

export function useDeleteVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => db.vacancies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
    onError: (e: Error) => toast.error(`Ошибка удаления: ${e.message}`),
  });
}
