// ============================================================
// Data Layer — All series, seasons, and episodes hardcoded
// ============================================================

export interface Episode {
  id: string;
  episode_title: string;
  episode_subtext: string;
  episode_type: "photo" | "video";
  episode_order: number;
  video_playback_id: string | null;
  background_music_url: string | null;
  photo_urls: string[]; // relative paths in R2
}

export interface Season {
  id: string;
  title: string;
  season_order: number;
  episodes: Episode[];
}

export interface Series {
  id: string;
  title: string;
  sub_title: string;
  genre: string;
  series_cast: string;
  occasion_type: string;
  cover_thumbnail_url: string; // relative path in R2
  seasons: Season[];
}

// ---- Configuration ----
// Set this to your R2 public bucket URL or UploadThing base URL.
// For R2:          "https://pub-abc123.r2.dev"
// For UploadThing: "https://utfs.io/f"
// If using UploadThing, photo_urls and music URLs should be full URLs
// (they'll be returned as-is). If using R2, they should be relative paths.
export const ASSET_BASE_URL = "https://YOUR_ASSET_BASE_URL";

// When true, serves photos/covers/music from public/assets/ instead of CDN.
// Set NEXT_PUBLIC_LOCAL_ASSETS=true in .env.local for local dev mode.
export const LOCAL_ASSETS =
  process.env.NEXT_PUBLIC_LOCAL_ASSETS === "true";

// Maps full ImageKit URLs to local asset paths for local dev mode.
// Currently unused — all assets use relative paths. Kept for future CDN migration.
const LOCAL_PHOTO_MAP: Record<string, string> = {};

// ---- URL Helpers ----
// Supports both relative paths (R2) and full URLs (UploadThing/ImageKit).
// In local mode, maps ImageKit URLs to local /assets/ paths.
export function getPhotoUrl(path: string): string {
  if (path.startsWith("http")) {
    if (LOCAL_ASSETS) return LOCAL_PHOTO_MAP[path] ?? path;
    return path;
  }
  return LOCAL_ASSETS ? `/assets/${path}` : `${ASSET_BASE_URL}/${path}`;
}

export function getMuxThumbnail(playbackId: string, token?: string): string {
  const url = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
  return token ? `${url}?token=${token}` : url;
}

export function getEpisodeThumbnail(
  episode: Episode,
  thumbnailTokens?: Record<string, string>
): string {
  if (episode.episode_type === "video" && episode.video_playback_id) {
    const token = thumbnailTokens?.[episode.video_playback_id];
    return getMuxThumbnail(episode.video_playback_id, token);
  }
  if (episode.photo_urls.length > 0) {
    return getPhotoUrl(episode.photo_urls[0]);
  }
  return "";
}

export function getAllVideoPlaybackIds(seriesList: Series[]): string[] {
  const ids: string[] = [];
  for (const series of seriesList) {
    for (const season of series.seasons) {
      for (const episode of season.episodes) {
        if (episode.video_playback_id) {
          ids.push(episode.video_playback_id);
        }
      }
    }
  }
  return ids;
}

// Supports both preset names (R2: prepends base + /music/) and full URLs (UploadThing).
// In local mode, serves from /assets/music/.
export function getMusicUrl(preset: string): string {
  if (preset.startsWith("http")) return preset;
  if (LOCAL_ASSETS) return `/assets/music/${preset}.mp3`;
  return `${ASSET_BASE_URL}/music/${preset}.mp3`;
}

// ---- Category Tags (cycle through per episode) ----
export const CATEGORY_TAGS = [
  "100% Match",
  "Hero",
  "New Season",
  "Action-Comedy",
  "New Character",
  "Drama 99%",
  "Nostalgia",
  "Guest Star",
];

export function getCategoryTag(episodeOrder: number): string {
  return CATEGORY_TAGS[(episodeOrder - 1) % CATEGORY_TAGS.length];
}

// ---- Project Data ----
export const PROJECT = {
  name: "OURFLIX",
  username: "Tushar \u2764\uFE0F Sheetal",
  profileAvatar: "/ourflix-profile.jpg",
};

// ---- Series Data ----
export const seriesData: Series[] = [
  {
    id: "57736a12-e4f1-4722-a449-092be6244adb",
    title: "The Early Audition Days",
    sub_title:
      'The early days of the "Sheetal & Me" show. Highlights include the chase, the charm offensive, and how we grew up together',
    genre: "Irreverent, Witty & Heartfelt",
    series_cast: "Tushar and Sheetal",
    occasion_type: "Relationship",
    cover_thumbnail_url: "covers/early-audition-days.jpg",
    seasons: [
      {
        id: "9cab140d-bd0f-4e00-81f8-e9c91bec8198",
        title: "The Early Audition Days",
        season_order: 1,
        episodes: [
          {
            id: "a5685280-57f0-4cae-8733-084658bdcbf5",
            episode_title: "Museum Day",
            episode_subtext:
              "Striking a pose by the staircase — floral vibes and effortless elegance",
            episode_type: "photo",
            episode_order: 1,
            video_playback_id: null,
            background_music_url: "romantic-eternal-love",
            photo_urls: ["episodes/s1e1/1.jpg"],
          },
          {
            id: "c236f2e7-afda-428f-8833-0f097d27ebb1",
            episode_title: "Jaipuriyaa",
            episode_subtext:
              "Channeling royalty in a Rajasthani palace — SAVAGE tee meets heritage arches",
            episode_type: "photo",
            episode_order: 2,
            video_playback_id: null,
            background_music_url: "romantic-eternal-love",
            photo_urls: ["episodes/s1e2/1.jpg"],
          },
          {
            id: "36a32875-acce-4741-878c-8942076b0462",
            episode_title: "Games with LRIs",
            episode_subtext:
              "Squad goals on a winter night — scarves, beanies and board game battles",
            episode_type: "photo",
            episode_order: 3,
            video_playback_id: null,
            background_music_url: "romantic-folklore",
            photo_urls: ["episodes/s1e3/1.jpg"],
          },
          {
            id: "54dfceb6-010a-4252-becc-75f7d5196408",
            episode_title: "Garden Blossoms",
            episode_subtext:
              "Surrounded by kites and cherry blossoms in a heritage courtyard",
            episode_type: "photo",
            episode_order: 4,
            video_playback_id: null,
            background_music_url: "romantic-folklore",
            photo_urls: ["episodes/s1e4/1.jpg"],
          },
          {
            id: "539eda3f-0b38-4afd-ad03-0b0f3a1139ca",
            episode_title: "1st Stayacation",
            episode_subtext:
              "Twinning in prints for our first hotel staycation — peace out!",
            episode_type: "photo",
            episode_order: 5,
            video_playback_id: null,
            background_music_url: "romantic-white-petals",
            photo_urls: ["episodes/s1e5/1.jpg"],
          },
        ],
      },
    ],
  },
  {
    id: "92b486c0-0ebf-4a70-986f-67060c786c60",
    title: "The Day We Got Societal & Legal Approval",
    sub_title:
      "Includes: Nervous sweating, awkward posing, Sheetal looking like a goddess & me trying not to step on her sari.",
    genre: "Emotional, D Day, Feel Good",
    series_cast: "Tushar and Sheetal",
    occasion_type: "Wedding",
    cover_thumbnail_url: "covers/wedding.jpg",
    seasons: [
      {
        id: "fd0d89dc-ec0d-45d8-a01a-8f9afa86f50a",
        title: "The Day We Got Societal & Legal Approval",
        season_order: 1,
        episodes: [
          {
            id: "0f55b546-f945-4bfc-b232-cf89ae54cca2",
            episode_title: "Rokka prep",
            episode_subtext:
              "Behind the scenes of the big day preparations",
            episode_type: "video",
            episode_order: 1,
            video_playback_id:
              "HW00AJKHAjC000135ntgnj0001gHCV3017IboJA4fMKupRjwI",
            background_music_url: null,
            photo_urls: [],
          },
          {
            id: "923a4cce-6681-43ee-9641-da9bdebb8225",
            episode_title: "The Proposal Day",
            episode_subtext:
              "Rose petals, candlelight, and the question that changed everything",
            episode_type: "photo",
            episode_order: 2,
            video_playback_id: null,
            background_music_url: "happy",
            photo_urls: ["episodes/s2e2/1.jpg"],
          },
          {
            id: "58b0317b-6142-4e0e-b888-dd67b6105ad1",
            episode_title: "Twirling in the Roka",
            episode_subtext:
              "Twirling her in a pink lehenga under the chandeliers",
            episode_type: "photo",
            episode_order: 3,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s2e3/1.jpg"],
          },
          {
            id: "eaa03f5d-3cd6-4669-bcdc-435705d662b3",
            episode_title: "Roka Power Pose",
            episode_subtext:
              "That one frame among the flowers that made it all feel real",
            episode_type: "photo",
            episode_order: 4,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s2e4/1.jpg"],
          },
        ],
      },
    ],
  },
  {
    id: "57b8f371-5752-492c-ab56-17ac9608d490",
    title: "Getting Lost & Finding Memories",
    sub_title:
      "A visual diary of us travelling & eating our way across the globe as we often took the wrong turn but found the right vibe",
    genre: "Captivating, Nature, Adventure",
    series_cast: "Tushar and Sheetal",
    occasion_type: "Travel",
    cover_thumbnail_url: "covers/travel.jpg",
    seasons: [
      {
        id: "f43f4da4-f33e-4d7f-aa36-a233fa5b6f52",
        title: "Getting Lost & Finding Memories",
        season_order: 1,
        episodes: [
          {
            id: "ac0288be-2ef6-44fe-9d5a-7404e054a248",
            episode_title: "Milo Milan",
            episode_subtext:
              "Sunset over the city skyline from the Duomo rooftop",
            episode_type: "photo",
            episode_order: 1,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s3e1/1.jpg"],
          },
          {
            id: "ad3bb2f3-29c3-44b4-849c-6bc4a6aead65",
            episode_title: "Leaning Pisa",
            episode_subtext:
              "Mandatory tourist selfie — grinning harder than the tower is leaning",
            episode_type: "photo",
            episode_order: 2,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s3e2/1.jpg"],
          },
          {
            id: "8f921314-e9bf-47aa-98a2-ab0effeb0df6",
            episode_title: "Italian Model, Venice",
            episode_subtext:
              "Grand Canal, gondolas, and giving her best Italian model energy",
            episode_type: "photo",
            episode_order: 3,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s3e3/1.jpg"],
          },
          {
            id: "c51cbbc1-11ff-460c-af9e-6ac841061880",
            episode_title: "One with the Eiffel",
            episode_subtext:
              "Obligatory Paris selfie — because did you even go if you didn't get this shot?",
            episode_type: "photo",
            episode_order: 4,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s3e4/1.jpg"],
          },
        ],
      },
    ],
  },
];
