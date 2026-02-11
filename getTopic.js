import { supabase } from './db.js';

export async function getNextTopic() {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('status', 'pending')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch next topic: ${error.message}`);
  }

  return data ?? null;
}
