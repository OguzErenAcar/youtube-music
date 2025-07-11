import { extractToken, getAuthorizationHeader, getClient } from './client'

const cookies = document.cookie
  .split(';')
  .map((c) => c.trim())
  .join(';\n      ');

const formattedCookie = `${cookies}`.trim().replace(/\s+/g, ' ');

export const getPlaylistRenderer = async (
  playlistId: string,
): Promise<unknown | null> => {
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
        browseId: `VL${playlistId}`, // dikkat: başına 'VL' gelecek
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
