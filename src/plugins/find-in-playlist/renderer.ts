import { getSongInfo } from '@/providers/song-info-front';
import { SingleColumnMusicWatchNextResultsRenderer } from '@/types/player-api-events';

export interface ResponseContext {
  contents: {
    singleColumnMusicWatchNextResultsRenderer: SingleColumnMusicWatchNextResultsRenderer;
  };
}

export const onPlayerApiReady = () => {};
export const onUnloadPlaylist = () => {
  console.log('');
};
