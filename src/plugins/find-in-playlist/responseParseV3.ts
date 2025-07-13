interface ResponseType {
  contents?: Contents;
  nextPageToken?: string;
  items?: ItemV3[];
}

interface Contents {
  twoColumnBrowseResultsRenderer?: TwoColumnBrowseResultsRenderer;
}

interface TwoColumnBrowseResultsRenderer {
  secondaryContents?: SecondaryContents;
}

interface SecondaryContents {
  sectionListRenderer?: SectionListRenderer;
}

interface SectionListRenderer {
  contents?: Contents[];
}

interface ItemV3 {
  snippet: {
    title: string;
    playlistId: string;
    resourceId: {
      videoId: string;
    };
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

interface SongElement {
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
