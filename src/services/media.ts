// Local media persistence using the SDK 54+ object API of expo-file-system.
// Camera output lands in a cache directory the OS may purge at any time, so we
// move it into the app's document directory under /proofs.
import { Directory, File, Paths } from 'expo-file-system';

import type { MediaType } from '../types';

const PROOF_DIR_NAME = 'proofs';

function getProofDir(): Directory {
  const dir = new Directory(Paths.document, PROOF_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function extensionOf(uri: string, fallback: string): string {
  const match = /\.([a-z0-9]+)(?:\?.*)?$/i.exec(uri);
  return match?.[1]?.toLowerCase() ?? fallback;
}

/**
 * Moves a freshly captured temp file into permanent app storage.
 * Returns the new file:// URI. Throws if the file can't be saved.
 */
export function persistCapture(tempUri: string, taskId: string, mediaType: MediaType): string {
  const dir = getProofDir();
  const ext = extensionOf(tempUri, mediaType === 'video' ? 'mp4' : 'jpg');
  const safeId = taskId.replace(/[^a-z0-9-]/gi, '');
  const destination = new File(dir, `${safeId}-${Date.now()}.${ext}`);
  const source = new File(tempUri);

  try {
    source.move(destination);
  } catch {
    // Some Android devices keep camera cache on a different volume where a
    // rename fails; copy + delete is the portable fallback.
    source.copy(destination);
    safeDelete(tempUri);
  }
  return destination.uri;
}

export function mediaExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

/** Deletes a file if present. Never throws — cleanup must not crash the app. */
export function safeDelete(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('[media] Failed to delete', uri, error);
  }
}

function fileName(uri: string): string {
  return decodeURIComponent(uri.split('/').pop() ?? '');
}

/**
 * Deletes any file in /proofs that no task references (e.g. left behind if
 * the app was killed between capture and save).
 */
export function deleteOrphans(referencedUris: readonly string[]): void {
  try {
    const keep = new Set(referencedUris.map(fileName));
    for (const entry of getProofDir().list()) {
      if (entry instanceof File && !keep.has(fileName(entry.uri))) {
        safeDelete(entry.uri);
      }
    }
  } catch (error) {
    console.warn('[media] Orphan sweep failed', error);
  }
}
