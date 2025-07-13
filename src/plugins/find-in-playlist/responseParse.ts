import { JSONObject } from 'hono/utils/types';

// --- Types and Interfaces ---

export interface SongElement {
  name: string;
  playListId: string;
  id: string;
  duration: string;
  imgUrl: {
    url?: string;
    width?: number;
    height?: number;
  } | null;
}

interface MusicPlayButtonRenderer {
  accessibilityPlayData?: {
    accessibilityData?: {
      label?: string;
    };
  };
  playNavigationEndpoint?: {
    watchEndpoint?: {
      playlistId?: string;
    };
  };
}

interface MusicItemThumbnailOverlayRenderer {
  content?: {
    musicPlayButtonRenderer?: MusicPlayButtonRenderer;
  };
}

interface PlaylistItemData {
  videoId?: string;
}

interface MusicThumbnailRenderer {
  thumbnail?: {
    thumbnails?: {
      url?: string;
      width?: number;
      height?: number;
    }[];
  };
}

interface MusicResponsiveListItemRenderer {
  overlay?: {
    musicItemThumbnailOverlayRenderer?: MusicItemThumbnailOverlayRenderer;
  };
  playlistItemData?: PlaylistItemData;
  thumbnail?: {
    musicThumbnailRenderer?: MusicThumbnailRenderer;
  };
}
interface ContinuationItemRenderer {
  continuationEndpoint?: {
    continuationCommand?: {
      token?: string;
    };
  };
}
interface Item {
  musicResponsiveListItemRenderer?: MusicResponsiveListItemRenderer;
  continuationItemRenderer?: ContinuationItemRenderer;
}

interface MusicPlaylistShelfRenderer {
  continuations?: {
    nextContinuationData?: {
      continuation?: string;
    };
  }[];
  contents?: Item[];
}

interface SectionListRenderer {
  contents?: {
    musicPlaylistShelfRenderer?: MusicPlaylistShelfRenderer;
  }[];
}

interface SecondaryContents {
  sectionListRenderer?: SectionListRenderer;
}

interface TwoColumnBrowseResultsRenderer {
  secondaryContents?: SecondaryContents;
}

interface Contents {
  twoColumnBrowseResultsRenderer?: TwoColumnBrowseResultsRenderer;
}
interface onResponseReceivedActions {
  appendContinuationItemsAction?: {
    continuationItems?: Item[];
  };
}

interface ResponseType {
  contents?: Contents;
  onResponseReceivedActions?: onResponseReceivedActions[];
}

// --- Functions ---

export const getContinuation = (response: unknown): string | null => {
  if (!response || typeof response !== 'object') return null;
  const resp = response as ResponseType;
  const contents =
    resp?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
      ?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer
      ?.contents;
  if (!contents || !Array.isArray(contents) || contents.length === 0)
    return null;
  const lastIndex = contents.length - 1;
  return (
    contents[lastIndex]?.continuationItemRenderer?.continuationEndpoint
      ?.continuationCommand?.token ?? null
  );
};
//onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems[100].continuationItemRenderer.continuationEndpoint.continuationCommand.token
export const getContinuationFromContinuation = (
  response: unknown,
): string | null => {
  const resp = response as ResponseType;
  const items =
    resp.onResponseReceivedActions?.[0]?.appendContinuationItemsAction
      ?.continuationItems ?? null;
  const lastItem =
    items && items.length > 0 ? items[items.length - 1] : undefined;
  const continuation =
    lastItem?.continuationItemRenderer?.continuationEndpoint
      ?.continuationCommand?.token ?? null;
  return continuation;
};

//onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems
export const arrayToPlaylistFromContinuation = (response: unknown) => {
  const resp = response as ResponseType;
  const array =
    resp.onResponseReceivedActions?.[0]?.appendContinuationItemsAction
      ?.continuationItems ?? null;
  return arrayToSongElement(array);
};

export const arrayToPlaylist = (response: unknown): SongElement[] => {
  const resp = response as ResponseType;
  const array =
    (resp.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
      ?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer
      ?.contents as Item[]) || [];
  const filteredArray = array.filter(
    (item) => item.musicResponsiveListItemRenderer !== undefined,
  );

  return arrayToSongElement(filteredArray);
};

const arrayToSongElement = (array: Item[] | null): SongElement[] => {
  if (!array) return [];
  const updatedList: SongElement[] = array.map((item) => {
    const renderer = item.musicResponsiveListItemRenderer;
    // Defensive: renderer may be undefined
    if (!renderer) {
      return {
        name: '',
        id: '',
        playListId: '',
        duration: '',
        imgUrl: null,
      };
    }
    const fullLabel: string =
      renderer?.overlay?.musicItemThumbnailOverlayRenderer?.content
        ?.musicPlayButtonRenderer?.accessibilityPlayData?.accessibilityData
        ?.label ?? '';
    const labelParts = fullLabel.split('-');
    const duration = labelParts.at(labelParts.length - 1) as string;
    labelParts.pop();
    const joined = labelParts.join('-').trim();
    const name = joined.slice(5);
    const id = renderer.playlistItemData?.videoId ?? '';
    const playListId =
      renderer.overlay?.musicItemThumbnailOverlayRenderer?.content
        ?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
        ?.playlistId ?? '';
    const imgObj = renderer?.thumbnail?.musicThumbnailRenderer?.thumbnail
      ?.thumbnails?.[0] as JSONObject;
    return {
      name,
      id,
      playListId,
      duration: duration,
      imgUrl: imgObj,
    };
  });
  return updatedList;
};
