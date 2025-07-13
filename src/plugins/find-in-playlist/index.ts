import style from './style.css?inline';

import { t } from '@/i18n';
import { createPlugin } from '@/utils';
import { onUnloadPlaylist, onPlayerApiReady } from './renderer';
import { addSearch, songElement } from './searchHandle';

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
    enabled: false,
  },
  stylesheets: [style],
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
      const refreshedPage = (data: urlInfo) => {
        if (data.pageType !== 'playlist') return;
        console.log('refreshedPage');
        const playlistDiv = document.querySelector(
          '.style-scope ytmusic-playlist-shelf-renderer #contents',
        ) as HTMLElement;
        const html = document.documentElement;
        //scrollIn(html);
        const SongList = catchItems(playlistDiv);
        addSearch('playlist', SongList);
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
const catchItems = (content: HTMLElement): songElement[] => {
  console.log('catchItem');
  const list = Array.from(content.children);
  list.pop();
  return list.map((item, i) => {
    const imgTag = item.querySelector('img') as HTMLImageElement;
    const img = imgTag.src;
    const nameTag = item.querySelector('.title-column a') as HTMLElement;
    const name = nameTag.innerHTML;
    const artistTag = item.querySelector(
      '.secondary-flex-columns a',
    ) as HTMLElement;
    const artist = artistTag.innerHTML;
    const paramsItem = item.querySelector(
      'a.yt-simple-endpoint',
    ) as HTMLAnchorElement;
    const params = new URL(paramsItem?.href, location.origin).searchParams;
    const id = params.get('v');
    const playListId = params.get('list');

    return {
      name,
      artist,
      img,
      playListId,
      id,
    };
  });
};
const scrollIn = async (content: HTMLElement) => {
  const prev = content.scrollTop;
  for (let i = 0; i < 50; i++) {
    content.scrollBy({ top: 2000 * i, behavior: 'auto' });
    await new Promise((resolve) => setTimeout(resolve, 150));
    console.log('scrolled');
  }
  await new Promise((resolve) => setTimeout(resolve, 4000));
  content.scrollTop = prev;
};
