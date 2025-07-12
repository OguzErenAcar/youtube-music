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

interface ResourceId {
  videoId: string;
}

interface Thumbnail {
  default: {
    url?: string;
    width?: number;
    height?: number;
  };
}

interface Snippet {
  title: string;
  playlistId: string;
  resourceId: ResourceId;
  thumbnails: Thumbnail;
}

interface ItemV3 {
  snippet: Snippet;
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

interface Item {
  musicResponsiveListItemRenderer?: MusicResponsiveListItemRenderer;
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

interface ResponseType {
  contents?: Contents;
  nextPageToken?: string;
  items?: ItemV3[];
}

// --- Functions ---

export const getContinuation = (response: unknown): string | null => {
  const resp = response as ResponseType;
  return (
    resp?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
      ?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer
      ?.continuations?.[0]?.nextContinuationData?.continuation ?? null
  );
};

export const getnextPageT = (response: unknown): string | null => {
  const resp = response as ResponseType;
  return resp?.nextPageToken ?? null;
};

export const arrayToPlaylistV3 = (response: unknown): SongElement[] => {
  const resp = response as ResponseType;
  const array = (resp.items as ItemV3[]) || [];
  const updatedList: SongElement[] = array.map((item) => {
    return {
      name: item.snippet.title,
      playListId: item.snippet.playlistId,
      id: item.snippet.resourceId.videoId,
      duration: '',
      imgUrl: item.snippet.thumbnails.default,
    };
  });
  //console.log('updatedList', updatedList);
  return updatedList;
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
  const updatedList: SongElement[] = filteredArray.map((item) => {
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
  console.log('updatedList', updatedList);
  return updatedList;
};
