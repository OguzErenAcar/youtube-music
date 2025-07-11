import searchbarHtml from './searchbar.html?raw';
import { t } from '@/i18n';
import { createPlugin } from '@/utils';
import { onUnloadPlaylist, onPlayerApiReady } from './renderer';
import { getPlaylistRenderer } from './api';

interface songElement {
  ongName: string;
  artist: string;
  duration: string;
  imgUrl: string;
}
interface playlist {
  SongElements: songElement[];
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
  preload: {
    async start() {},
  },
  renderer: {
    urlInfo: {} as urlInfo,
    playList: {} as playlist,
    async start(ctx) {
      const urlPromise = new Promise<urlInfo>((resolve) => {
        ctx.ipc.on('ytmd:playlist-url', (data: urlInfo) => {
          resolve(data);
        });
      });
      const UrlInfo = await urlPromise;
      this.urlInfo.pageType = UrlInfo.pageType;
      this.urlInfo.playlistId = UrlInfo.playlistId;
      addSearch(this.urlInfo.pageType!);
      const response = await getPlaylistRenderer(this.urlInfo.playlistId || '');
      console.log(response);
    },
    stop: onUnloadPlaylist,
    onPlayerApiReady,
  },
});
const addSearch = (pageType: string) => {
  const id = '#searchbar';
  const sidePanelId = '#side-panel';
  const secondaryContentId = '#secondary #contents';
  const sidePanel = document.querySelector(sidePanelId) as HTMLElement;
  const secondaryContent = document.querySelector(
    secondaryContentId,
  ) as HTMLElement;

  switch (pageType) {
    case 'watch':
      if (!isAdded(sidePanel, id)) addSearchTo(sidePanel);
      break;
    case 'playlist':
      if (!isAdded(secondaryContent, id)) addSearchTo(secondaryContent);
      break;
  }
};

const isAdded = (element: HTMLElement, id: string): boolean =>
  element.querySelector(id) != null;

// prettier-ignore
const addSearchTo = (container: HTMLElement) => {
  const div = document.createElement('div');
  div.id = 'searchbar';
  div.innerHTML = searchbarHtml;
  container?.insertBefore(div, container.children[0]);
};
