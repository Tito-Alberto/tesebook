import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system/legacy';
import { ensureFileUri } from './fileUtils';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

const STORAGE_URL_RE = /\/storage\/v1\/object\/(?:public\/)?([^/]+)\/(.+)$/i;
const IMAGE_CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

export async function uploadToBucket(
  uri: string,
  bucket: string,
  path: string,
  contentType: string,
  base64?: string | null,
  useFileSystem?: boolean,
  accessToken?: string | null,
) {
  if (useFileSystem) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase nao configurado.');
    }
    const fileUri = await ensureFileUri(uri);
    const encodedPath = path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('Arquivo nao encontrado para upload.');
    }
    const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: 'PUT',
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${accessToken || supabaseKey}`,
        apikey: supabaseKey,
        'x-upsert': 'true',
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });
    if (result.status !== 200 && result.status !== 201) {
      const body = result.body ? ` - ${result.body}` : '';
      const sizeInfo = fileInfo.size ? ` (${fileInfo.size} bytes)` : '';
      throw new Error(`Upload HTTP ${result.status}${sizeInfo}${body}`);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  const blob = await (async () => {
    if (base64) {
      const response = await fetch(`data:${contentType};base64,${base64}`);
      return response.blob();
    }
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Falha ao ler arquivo para upload.');
    }
    return response.blob();
  })();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getFileExtension(value?: string | null) {
  if (!value) return '';
  const cleanValue = value.split('?')[0];
  const lastSlash = cleanValue.lastIndexOf('/');
  const lastDot = cleanValue.lastIndexOf('.');
  if (lastDot === -1 || (lastSlash !== -1 && lastDot < lastSlash)) return '';
  return cleanValue.slice(lastDot + 1).toLowerCase();
}

export function getImageContentType(
  value?: string | null,
  mimeType?: string | null,
  fallback = 'image/jpeg',
) {
  if (mimeType) return mimeType;
  const ext = getFileExtension(value);
  return IMAGE_CONTENT_TYPES[ext] || fallback;
}

export async function resolveStorageUrl(url?: string | null, expiresIn = 60 * 60) {
  if (!url) return null;
  if (url.startsWith('file://') || url.startsWith('ph://')) return url;

  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(STORAGE_URL_RE);
  if (!match) return url;

  const bucket = match[1];
  const path = match[2];
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return url;
  return data.signedUrl;
}
