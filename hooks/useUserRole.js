// hooks/useUserRole.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!error) setRole(data?.role);
      setLoading(false);
    };

    fetchRole();
  }, []);

  return { role, loading, isAdmin: role === 'admin' };
}
