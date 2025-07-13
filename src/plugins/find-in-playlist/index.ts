import { t } from '@/i18n';
import { createPlugin } from '@/utils';
import { onUnloadPlaylist, onPlayerApiReady } from './renderer';
import { getPlaylistRenderer, getPlaylistRendererV3 } from './api';
import {
  arrayToPlaylist,
  getContinuation,
  arrayToPlaylistFromContinuation,
  getContinuationFromContinuation,
} from './responseParse';
import { arrayToPlaylistV3, getnextPageT } from './responseParseV3';
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
  url: string;
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
  backend: {
    urlInfo: {} as urlInfo,
    start({ window }) {
      window.webContents.on('did-finish-load', () => {
        const currentUrl = new URL(window.webContents.getURL());
        sendListUrl(currentUrl);
        console.log('did-finish-load');
      });
      window.webContents.on('did-navigate-in-page', () => {
        const currentUrl = new URL(window.webContents.getURL());
        sendListUrl(currentUrl);
      });

      const sendListUrl = (url: URL) => {
        console.log('sendListUrl');
        window.webContents.send('ytmd:playlist-url', {
          url: url.toString(),
          pageType:
            (url.pathname.includes('watch') ? 'watch' : null) ||
            (url.pathname.includes('playlist') ? 'playlist' : null),
          playlistId: url.searchParams.get('list'),
        });
      };
    },
  },
  renderer: {
    urlInfo: {} as urlInfo,
    playList: [] as songElement[],
    initialLoad: true as boolean,
    start(ctx) {
      this.initialLoad = true;

      const refreshedPage = async (data: urlInfo) => {
        if (!data.playlistId) return;
        const cookie = document.cookie.includes('SAPISID');
        let continuation: string | null = null;
        this.playList = [];
        let response: unknown;
        if (cookie) {
          do {
            response = await getPlaylistRenderer(data.playlistId, continuation);
            if (!continuation) {
              this.playList.push(...arrayToPlaylist(response));
              continuation = getContinuation(response);
            } else {
              this.playList.push(...arrayToPlaylistFromContinuation(response));
              continuation = getContinuationFromContinuation(response);
            }
          } while (continuation && this.playList.length < 1000);
        } else {
          let length = 50;
          if (data.playlistId.substring(0, 2) !== 'RD') length = 1000;
          do {
            response = await getPlaylistRendererV3(
              data.playlistId,
              continuation,
            );
            this.playList.push(...arrayToPlaylistV3(response));
            continuation = getnextPageT(response);
          } while (continuation && this.playList.length < length);
        }
        addSearch(data.pageType, this.playList);
      };

      let timer: ReturnType<typeof setTimeout>;
      ctx.ipc.on('ytmd:playlist-url', (data: urlInfo) => {
        if (!this.initialLoad) {
          refreshedPage(data);
        } else {
          clearTimeout(timer);
          timer = setTimeout(() => {
            refreshedPage(data);
            this.initialLoad = false;
          }, 750);
        }
      });
    },
    stop: onUnloadPlaylist,
    onPlayerApiReady,
  },
});
