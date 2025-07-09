import { t } from '@/i18n';
import { createPlugin } from '@/utils';
import { catchWebRequest, onUnloadPlaylist } from './renderer';

export default createPlugin({
  name: () => t('plugins.find-onplaylist.name'),
  description: () => t('plugins.find-onplaylist.description'),
  restartNeeded: false,
  config: {
    enabled: true,
  },
  backend: {
    start({ window }) {
      catchWebRequest.onBackend();
    },
  },
  renderer: {
    start() {
      catchWebRequest.onRenderer();
    },
    stop: onUnloadPlaylist,
  },
  preload: {
    start({ getConfig }) {
      console.log('t-preload');
    },
  },
});
