import * as FileSystem from 'expo-file-system/legacy';

export async function ensureFileUri(uri: string) {
  if (!uri) return uri;
  if (uri.startsWith('content://')) {
    const name = uri.split('/').pop() || `file-${Date.now()}`;
    const dest = `${FileSystem.cacheDirectory}${name}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  }
  return uri;
}

export async function readFileAsBase64(uri: string) {
  if (!uri) return null;
  const localUri = await ensureFileUri(uri);

  if (!FileSystem.readAsStringAsync) {
    throw new Error('Leitura de arquivo nao suportada neste ambiente.');
  }
  const encoding = (FileSystem as any).EncodingType?.Base64 || 'base64';
  return FileSystem.readAsStringAsync(localUri, {
    encoding,
  });
}
