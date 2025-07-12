import { t } from '@/i18n';
import { createPlugin } from '@/utils';
import { onUnloadPlaylist, onPlayerApiReady } from './renderer';
import { getPlaylistRenderer, getPlaylistRendererV3 } from './api';
import {
  arrayToPlaylist,
  arrayToPlaylistV3,
  getnextPageT,
  getContinuation,
} from './responseParse';
import { addSearch } from './searchHandle';

interface songElement {
  name: string;
  id: string;
  playListId: string;
  imgUrl: {
    url?: string;
    width?: number;
    height?: number;
  } | null;
  duration: string;
}

type urlInfo = {
  pageType: string | null;
  playlistId: string | null;
};
export default createPlugin({
  name: () => t('plugins.find-onplaylist.name'),
  description: () => t('plugins.find-onplaylist.description'),
  restartNeeded: true,
  config: {
    enabled: true,
  },
  // prettier-ignore
  backend: {
    urlInfo: {} as urlInfo,
    start({ getConfig, window }) {
      window.webContents.on('did-finish-load', () => {
        const currentUrl = new URL(window.webContents.getURL());
        sendListUrl(currentUrl);
      });
      window.webContents.on('did-navigate-in-page', () => {
        const currentUrl = new URL(window.webContents.getURL());
        sendListUrl(currentUrl);
      });
      const sendListUrl = (url: URL) => {
        this.urlInfo.pageType = (url.pathname.includes('watch') ? 'watch' : null) || (url.pathname.includes('playlist') ? 'playlist' : null);
        this.urlInfo.playlistId = url.searchParams.get('list');
        window.webContents.send('ytmd:playlist-url', {
          pageType: this.urlInfo.pageType,
          playlistId: this.urlInfo.playlistId,
        });
      };
    },
  },
  renderer: {
    urlInfo: {} as urlInfo,
    playList: [] as songElement[],
    continuation: null as string | null,
    nextPageT: null as string | null,
    start(ctx) {
      ctx.ipc.on('ytmd:playlist-url', async (data: urlInfo) =>
        {
      });
    },
    stop: onUnloadPlaylist,
    onPlayerApiReady,
  },
});
