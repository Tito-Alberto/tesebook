import { supabase } from './supabaseClient';

export async function uploadToBucket(
  uri: string,
  bucket: string,
  path: string,
  contentType: string,
) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
