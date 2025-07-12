import { extractToken, getAuthorizationHeader, getClient } from './client';

const cookies = document.cookie
  .split(';')
  .map((c) => c.trim())
  .join(';\n      ');

const formattedCookie = `${cookies}`.trim().replace(/\s+/g, ' ');

export const getPlaylistRenderer = async (
  playlistId: string,
  continuation: string | null,
): Promise<unknown> => {
  const token = extractToken();
  if (!token) return null;

  const response = await fetch(
    'https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://music.youtube.com',
        'Authorization': await getAuthorizationHeader(token),
        'Cookie': formattedCookie,
      },
      body: JSON.stringify({
        context: {
          client: getClient(),
        },
        browseId: `VL${playlistId}`,
        continuation,
      }),
    },
  );

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const getPlaylistRendererV3 = async (
  playlistId: string,
  nextPageT: string | null = null,
) => {
  const API_KEY = 'AIzaSyC_zwXJXgAv-Uo3PBdryIf27tE7VuEFI2Q';

  const baseUrl = new URL(
    'https://www.googleapis.com/youtube/v3/playlistItems',
  );
  baseUrl.searchParams.set('part', 'snippet');
  baseUrl.searchParams.set('playlistId', playlistId);
  baseUrl.searchParams.set('maxResults', '49');
  baseUrl.searchParams.set('key', API_KEY);

  if (nextPageT) {
    baseUrl.searchParams.set('pageToken', nextPageT);
  }

  const res = await fetch(baseUrl.toString());
  const data = await res.json();
  return data;
};
