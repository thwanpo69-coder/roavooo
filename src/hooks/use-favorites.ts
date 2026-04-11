import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useFavorites() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async (currentUser: User | null) => {
    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('place_id')
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
      setLoading(false);
      return;
    }

    setFavorites((data || []).map((row) => row.place_id));
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
      }

      if (!mounted) return;

      const currentUser = data.user ?? null;
      setUser(currentUser);
      await loadFavorites(currentUser);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(true);
      await loadFavorites(currentUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleFavorite = async (placeId: string) => {
    if (!user) {
      setLocation('/login');
      return;
    }

    const alreadyFavorite = favorites.includes(placeId);

    if (alreadyFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      if (error) {
        console.error('Error removing favorite:', error);
        return;
      }

      setFavorites((prev) => prev.filter((id) => id !== placeId));
      return;
    }

    const { error } = await supabase.from('favorites').insert({
      user_id: user.id,
      place_id: placeId,
    });

    if (error) {
      console.error('Error adding favorite:', error);
      return;
    }

    setFavorites((prev) => [...prev, placeId]);
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return {
    user,
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
  };
}