import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey);

const DEVICE_ID_KEY = 'compass-device-id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export type SavedDirection = {
  id: string;
  name: string;
  heading: number;
  color: string;
};

export async function listSavedDirections(): Promise<SavedDirection[]> {
  const { data, error } = await supabase
    .from('saved_directions')
    .select('id, name, heading, color')
    .eq('device_id', getDeviceId())
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addSavedDirection(
  name: string,
  heading: number,
  color: string
): Promise<void> {
  const { error } = await supabase.from('saved_directions').insert({
    device_id: getDeviceId(),
    name,
    heading,
    color,
  });
  if (error) throw error;
}

export async function removeSavedDirection(id: string): Promise<void> {
  const { error } = await supabase.from('saved_directions').delete().eq('id', id);
  if (error) throw error;
}
