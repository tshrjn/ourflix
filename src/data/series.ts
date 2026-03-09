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

// ---- URL Helpers ----
// Supports both relative paths (R2) and full URLs (UploadThing).
// If the path starts with "http", it's returned as-is.
export function getPhotoUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${ASSET_BASE_URL}/${path}`;
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
export function getMusicUrl(preset: string): string {
  if (preset.startsWith("http")) return preset;
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
  name: "NETFLIX",
  username: "Tushar \u2764\uFE0F Sheetal",
  profileAvatar: "profile/avatar.jpg",
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
    cover_thumbnail_url: "covers/early-audition-days.png",
    seasons: [
      {
        id: "9cab140d-bd0f-4e00-81f8-e9c91bec8198",
        title: "The Early Audition Days",
        season_order: 1,
        episodes: [
          {
            id: "a8e81bd4-24a5-46c9-84fc-e486631009d1",
            episode_title: "Us in our Snapchat Filter era",
            episode_subtext: "Fire Samjha Kya Re, Flower Hai Hum",
            episode_type: "photo",
            episode_order: 1,
            video_playback_id: null,
            background_music_url: "romantic-eternal-love",
            photo_urls: ["episodes/s1e1/1.gif", "episodes/s1e1/2.jpg"],
          },
          {
            id: "8bcecb5e-e69c-481c-a21d-85a8c383ba20",
            episode_title: "Our Fan Moment",
            episode_subtext:
              "The rare occasion when we both agree on the fan speed",
            episode_type: "video",
            episode_order: 2,
            video_playback_id:
              "QjFsZmflm29lx02bLvpGqQhpUWnDTnDpn02Of700rC9Da8",
            background_music_url: null,
            photo_urls: [],
          },
          {
            id: "0eb76c74-8a0c-46e2-8e66-51e293a9bc28",
            episode_title: "Teaching Sheetal Cycling",
            episode_subtext:
              "Sowing the seeds of our fitness & sports journey",
            episode_type: "photo",
            episode_order: 3,
            video_playback_id: null,
            background_music_url: "romantic-eternal-love",
            photo_urls: ["episodes/s1e3/1.jpg", "episodes/s1e3/2.jpg"],
          },
          {
            id: "ea3c59f3-21e0-4d2c-a19e-31af2fdfb57e",
            episode_title: "Good Hair Days",
            episode_subtext:
              "Using other people's wedding as pre-wedding photoshoot opportunities.",
            episode_type: "photo",
            episode_order: 4,
            video_playback_id: null,
            background_music_url: "romantic-eternal-love",
            photo_urls: ["episodes/s1e4/1.gif"],
          },
          {
            id: "dc478057-ce7c-4a2f-8cd5-2a27aea34b5d",
            episode_title: "Trying our hand at Tiktok Trends",
            episode_subtext:
              "Tushar doesn't mind the occasional dance - if he can sit through it!",
            episode_type: "video",
            episode_order: 5,
            video_playback_id:
              "rC013kXrmqI02GV91MOP01sZfqiB7YHj2bBQsMXP9KXkJw",
            background_music_url: null,
            photo_urls: [],
          },
          {
            id: "ccb7d715-c9c8-4b28-ac56-c9f9f2c1a6ac",
            episode_title: "Matching PJs",
            episode_subtext:
              "A surprise gift from her when I was visiting her",
            episode_type: "photo",
            episode_order: 6,
            video_playback_id: null,
            background_music_url: "romantic-eternal-love",
            photo_urls: ["episodes/s1e6/1.jpg"],
          },
          {
            id: "429172af-51d0-42b3-91ba-c81e04475be1",
            episode_title: "Lockdown Parties",
            episode_subtext:
              "Covid got us back in the same city, but dates take out meals inside a car!",
            episode_type: "photo",
            episode_order: 7,
            video_playback_id: null,
            background_music_url: "romantic-folklore",
            photo_urls: ["episodes/s1e7/1.jpg"],
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
    cover_thumbnail_url: "covers/wedding.png",
    seasons: [
      {
        id: "fd0d89dc-ec0d-45d8-a01a-8f9afa86f50a",
        title: "The Day We Got Societal & Legal Approval",
        season_order: 1,
        episodes: [
          {
            id: "0f55b546-f945-4bfc-b232-cf89ae54cca2",
            episode_title: "Surprise!",
            episode_subtext:
              "Sheetal shocked by everyone turning up on time",
            episode_type: "photo",
            episode_order: 1,
            video_playback_id: null,
            background_music_url: "happy",
            photo_urls: [
              "episodes/s2e1/1.jpg",
              "episodes/s2e1/2.jpg",
              "episodes/s2e1/3.jpg",
            ],
          },
          {
            id: "7722cb94-93b8-429f-b229-149c25507331",
            episode_title: "Sheetal's Musical Haldi",
            episode_subtext:
              "I paid homage to my years in the South while Sheetal wore a hand painted skirt",
            episode_type: "photo",
            episode_order: 2,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s2e2/1.jpg", "episodes/s2e2/2.jpg"],
          },
          {
            id: "cf1ab8af-53e6-498a-bbdf-15495c183d59",
            episode_title: "Gratitude",
            episode_subtext:
              "Thanking everyone for their blessings. Were we first or did Sid Kiara beat us to this pose?",
            episode_type: "photo",
            episode_order: 3,
            video_playback_id: null,
            background_music_url: "happy",
            photo_urls: ["episodes/s2e3/1.jpg"],
          },
          {
            id: "884dad66-ba0a-4c01-9f78-dfce662a34fc",
            episode_title: "Calm amidst the Storm",
            episode_subtext: "One of the moments we found to ourselves",
            episode_type: "photo",
            episode_order: 4,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s2e4/1.jpg"],
          },
          {
            id: "9fae8cda-e280-4431-80cc-4d2afcf91b7a",
            episode_title: "The First Dance",
            episode_subtext:
              'We learnt the steps to "I will walk 500 Miles" 10 mins before so Tushar (hates dancing) could fulfil his promise to Sheetal',
            episode_type: "photo",
            episode_order: 5,
            video_playback_id: null,
            background_music_url: "romantic-folklore",
            photo_urls: ["episodes/s2e5/1.jpg"],
          },
          {
            id: "00bc10bb-7c3d-4647-9a34-5ce6f92f9d38",
            episode_title: "T-1 - Inviting the God's Blessings",
            episode_subtext:
              "Stealing hugs before the 1st set of Poojas begin",
            episode_type: "photo",
            episode_order: 6,
            video_playback_id: null,
            background_music_url: "romantic-eternal-love",
            photo_urls: ["episodes/s2e6/1.jpg"],
          },
          {
            id: "e1c4ae0b-dc1c-4d7b-97f0-42d64602b17e",
            episode_title: "Thodi Si Toh Lift Kara De",
            episode_subtext:
              "One of our favourite failed attempts - would not recommend open footwear!",
            episode_type: "video",
            episode_order: 7,
            video_playback_id:
              "esr2002CWHL8PJG5QmthLN8oC5lqntHEZbcZmHsEmYMQ",
            background_music_url: null,
            photo_urls: [],
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
    cover_thumbnail_url: "covers/travel.png",
    seasons: [
      {
        id: "f43f4da4-f33e-4d7f-aa36-a233fa5b6f52",
        title: "Getting Lost & Finding Memories",
        season_order: 1,
        episodes: [
          {
            id: "63524f7b-ab48-49dc-ba4c-b7f8c5bf530a",
            episode_title: "Havelock, Andaman Islands",
            episode_subtext:
              "Swim, Snorkel & Scuba - Indulging in our love for Water together is our favourite getaway activity",
            episode_type: "video",
            episode_order: 1,
            video_playback_id:
              "kMxzrwlKxh02dDO7k4K4rTYqc01V1pfXNCQE36pF13qvg",
            background_music_url: null,
            photo_urls: [],
          },
          {
            id: "4e073dbd-9596-4c08-95ee-9c9b3cdf5ed6",
            episode_title: "Majorda, Goa",
            episode_subtext:
              "Found some cute puppies waiting for us when we revisited the beach we got married on",
            episode_type: "video",
            episode_order: 2,
            video_playback_id:
              "v5p1MOfuYsJZsaLoN3xq02i8nVvakBl93zGvJ24Q4lvU",
            background_music_url: null,
            photo_urls: [],
          },
          {
            id: "9df6431a-e4e1-4c4e-ac25-f1eb6b5070b5",
            episode_title: "Maldives",
            episode_subtext:
              "Living up the Resort Life - pretending we did not skip lunch for the all inclusive dinner",
            episode_type: "photo",
            episode_order: 3,
            video_playback_id: null,
            background_music_url: "romantic-white-petals",
            photo_urls: [
              "episodes/s3e3/1.jpg",
              "episodes/s3e3/2.jpg",
              "episodes/s3e3/3.jpg",
            ],
          },
          {
            id: "e8cbc308-e307-4c17-9dd2-862127832744",
            episode_title: "Colva, Goa",
            episode_subtext:
              "Our favourite Beach Shack in Goa - Boomerang Beach Bar - you gotta bounce back here",
            episode_type: "photo",
            episode_order: 4,
            video_playback_id: null,
            background_music_url: "holiday",
            photo_urls: ["episodes/s3e4/1.jpg"],
          },
          {
            id: "e64faac5-6f99-4c0a-8235-30ae659b6410",
            episode_title: "Kyoto, Japan",
            episode_subtext:
              "Waking up super early to beat the crowds was totally worth it!",
            episode_type: "photo",
            episode_order: 5,
            video_playback_id: null,
            background_music_url: null,
            photo_urls: ["episodes/s3e5/1.jpg"],
          },
          {
            id: "5cb2c831-b998-4d05-a469-3c549dacfa97",
            episode_title: "Gokarna, Karnataka",
            episode_subtext:
              "Reawakening the child in us on a quick weekend getaway from Bangalore",
            episode_type: "video",
            episode_order: 6,
            video_playback_id:
              "qwesb3C4pXUXj6Pbb7Ru00NBcjRnaGyPSa601JRKYniJE",
            background_music_url: null,
            photo_urls: [],
          },
          {
            id: "1db97210-ff3e-49fe-81de-24917ee0c844",
            episode_title: "Koh Tao, Thailand",
            episode_subtext:
              "Most treks are about the journey, but some like this are also about the view from the summit!",
            episode_type: "photo",
            episode_order: 7,
            video_playback_id: null,
            background_music_url: null,
            photo_urls: ["episodes/s3e7/1.jpg"],
          },
          {
            id: "9592375e-5b91-4f2f-8c2e-7e205ff21286",
            episode_title: "Digurah, Maldives",
            episode_subtext:
              "Finding our little private moment on a beautiful Maldivian local island",
            episode_type: "video",
            episode_order: 8,
            video_playback_id:
              "Um9VrdQPs5dtkAP8mii2FeyXSf014Vuwix01L8Us2WSkE",
            background_music_url: null,
            photo_urls: [],
          },
          {
            id: "4e374ebd-2932-461f-81cc-a377bafd1639",
            episode_title: "Bandipur, Karnataka",
            episode_subtext:
              "Driving so close to wildlife on our way to Ooty was so surreal.",
            episode_type: "video",
            episode_order: 9,
            video_playback_id:
              "K7k1h801mPEH1a7fKwYsXDlO6dNFZXOAVBBm01K201JV8s",
            background_music_url: null,
            photo_urls: [],
          },
        ],
      },
    ],
  },
];
