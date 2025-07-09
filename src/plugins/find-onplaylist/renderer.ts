import { SingleColumnMusicWatchNextResultsRenderer } from '@/types/player-api-events';

export interface ResponseContext {
  contents: {
    singleColumnMusicWatchNextResultsRenderer: SingleColumnMusicWatchNextResultsRenderer;
  };
}

export const onUnloadPlaylist = () => {
  console.log('');
};

export const catchWebRequest = {
  onBackend: async () => {
    const { session } = await import('electron');
    session.defaultSession.webRequest.onCompleted(
      { urls: ['*://music.youtube.com/*'] },
      (details) => {
        console.log(JSON.stringify(details));
      },
    );
  },
  onRenderer: () => {
    console.log('t-renderer');
    const orginalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await orginalFetch(...args);
      try {
        const copy = res.clone();
        const json = (await copy.json()) as ResponseContext;
        // prettier-ignore
        const list = json.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer.tabs[0].tabRenderer.content?.musicQueueRenderer.content?.playlistPanelRenderer.contents;
      } catch (e) {
        console.warn('non-json response or failed to parse');
      }
      return res;
    };
  },
};
