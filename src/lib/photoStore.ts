import { Platform } from 'react-native';
import { WeekRecord } from '../store/types';

// Week photos live in Documents/ink-photos/ and records store RELATIVE paths
// ("ink-photos/<name>.jpg"). Absolute file:// URIs break on every app update
// because iOS moves the app into a new container (the UUID in the path changes) —
// which is exactly the "grey rectangles after updating" bug.

const DIR_NAME = 'ink-photos/';

// legacy API entry (SDK 54 moved the classic functions here); absent on web
function fs(): any | null {
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-file-system/legacy');
  } catch {
    return null;
  }
}

/** Root of the current app container (documentDirectory minus the Documents/ leaf). */
function containerRoot(FileSystem: any): string | null {
  const doc: string | null = FileSystem.documentDirectory;
  return doc ? doc.replace(/Documents\/?$/, '') : null;
}

/**
 * Turn a stored photo reference into a displayable URI.
 * - https URLs (seed examples) pass through
 * - relative "ink-photos/…" paths resolve against the CURRENT container
 * - legacy absolute file:// URIs are re-based onto the current container UUID,
 *   which revives photos whose file survived the update
 */
export function resolvePhotoUri(stored: string): string {
  if (/^https?:/.test(stored)) return stored;
  const FileSystem = fs();
  if (!FileSystem) return stored;
  if (!stored.startsWith('file:')) return (FileSystem.documentDirectory ?? '') + stored;
  const m = stored.match(/\/Application\/[^/]+\/(.*)$/);
  const root = containerRoot(FileSystem);
  return m && root ? root + m[1] : stored;
}

async function ensureDir(FileSystem: any): Promise<string> {
  const dir = FileSystem.documentDirectory + DIR_NAME;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

/**
 * Copy a just-picked photo into permanent storage. Returns the RELATIVE path to
 * store on the record. Already-persisted and https refs pass through unchanged.
 */
export async function persistPhoto(uri: string, weekIndex: number, slot: number): Promise<string> {
  if (/^https?:/.test(uri) || uri.startsWith(DIR_NAME)) return uri;
  const FileSystem = fs();
  if (!FileSystem || !uri.startsWith('file:')) return uri;
  try {
    await ensureDir(FileSystem);
    const ext = (uri.match(/\.(jpe?g|png|heic|webp)$/i)?.[0] ?? '.jpg').toLowerCase();
    const rel = `${DIR_NAME}${weekIndex}-${slot}-${Date.now()}${ext}`;
    await FileSystem.copyAsync({ from: uri, to: FileSystem.documentDirectory + rel });
    return rel;
  } catch {
    return uri; // keep the original ref rather than losing the photo outright
  }
}

/**
 * One-time repair after hydration: for records still holding legacy absolute
 * file:// URIs, re-base onto the current container — if the file survived the
 * update, copy it into permanent storage and store the relative path; if it's
 * gone, drop the dead reference (no more grey rectangles). Returns the fixed
 * records, or null when nothing needed changing.
 */
export async function repairPhotoRecords(records: WeekRecord[]): Promise<WeekRecord[] | null> {
  const FileSystem = fs();
  if (!FileSystem || !FileSystem.documentDirectory) return null;
  let changed = false;

  const out: WeekRecord[] = [];
  for (const r of records) {
    if (!r.photos.some((p) => p.startsWith('file:'))) {
      out.push(r);
      continue;
    }
    const photos: string[] = [];
    for (let i = 0; i < r.photos.length; i++) {
      const p = r.photos[i];
      if (!p.startsWith('file:')) {
        photos.push(p);
        continue;
      }
      changed = true;
      try {
        const rebased = resolvePhotoUri(p);
        const info = await FileSystem.getInfoAsync(rebased);
        if (info.exists) {
          photos.push(await persistPhoto(rebased, r.weekIndex, i));
        }
        // missing file → dropped
      } catch {
        // unreadable → dropped
      }
    }
    out.push({ ...r, photos });
  }
  return changed ? out : null;
}
