import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Profile } from '../lib/types';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => db.profile.get(),
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Partial<Profile>) => db.profile.update(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
