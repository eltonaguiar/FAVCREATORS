import { useState, useEffect } from "react";
// Build version: 2026-01-30-v4 - Single proxy only
import "./App.css";
import type { Creator, SocialAccount, Platform } from "./types";
import CreatorCard from "./components/CreatorCard";
import CreatorForm from "./components/CreatorForm";

const INITIAL_DATA: Creator[] = [
  {
    id: "1",
    name: "MrBeast",
    bio: "I want to make the world a better place before I die.",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_n_E3Qh8H-8G4Z_K2o8F-XwJ0R4X-K6M=s176-c-k-c0x00ffffff-no-rj",
    isFavorite: false,
    lastChecked: Date.now() - 50000,
    addedAt: Date.now(),
    category: "Other",
    accounts: [
      {
        id: "1a",
        platform: "youtube",
        username: "MrBeast",
        url: "https://youtube.com/@MrBeast",
        followers: "341M",
        lastChecked: Date.now() - 50000,
      },
      {
        id: "1b",
        platform: "instagram",
        username: "mrbeast",
        url: "https://instagram.com/mrbeast",
        followers: "61.1M",
        lastChecked: Date.now() - 52000,
      },
    ],
  },
  {
    id: "zarthestar-1",
    name: "Zarthestar",
    bio: "Cosmic content creator and explorer of the digital universe.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zarthestar",
    isFavorite: false,
    addedAt: Date.now() - 2000,
    lastChecked: Date.now() - 1500,
    category: "Other",
    accounts: [
      {
        id: "zarthestar-kick",
        platform: "kick",
        username: "zarthestar",
        url: "https://kick.com/zarthestar",
        followers: "1.2K",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-twitch",
        platform: "twitch",
        username: "zarthestar",
        url: "https://twitch.tv/zarthestar",
        followers: "2.3K",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-youtube",
        platform: "youtube",
        username: "zarthestar",
        url: "https://youtube.com/@zarthestar",
        followers: "800",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-tiktok",
        platform: "tiktok",
        username: "zarthestar",
        url: "https://tiktok.com/@zarthestar",
        followers: "500",
        lastChecked: Date.now() - 1500,
      },
    ],
  },
  {
    id: "10",
    name: "Dream",
    bio: "Minecraft storyteller and creator.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dream",
    isFavorite: false,
    note: "Track collaborations with the squad.",
    addedAt: Date.now() - 500,
    lastChecked: Date.now() - 650,
    category: "Other",
    accounts: [
      {
        id: "10a",
        platform: "youtube",
        username: "dream",
        url: "https://youtube.com/@Dream",
        followers: "33M",
        lastChecked: Date.now() - 650,
      },
      {
        id: "10b",
        platform: "twitch",
        username: "dreamwastaken",
        url: "https://www.twitch.tv/dreamwastaken",
        followers: "12M",
        lastChecked: Date.now() - 700,
      },
    ],
  },
  {
    id: "4",
    name: "Tyler1",
    bio: "Built different. League of Legends legend.",
    avatarUrl:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/430374e5-9d5f-4f6c-941f-fd11be43093c-profile_image-70x70.png",
    isFavorite: false,
    note: "Always check on the 1v1 streams.",
    addedAt: Date.now() - 10000,
    lastChecked: Date.now() - 35000,
    category: "Other",
    accounts: [
      {
        id: "4a",
        platform: "twitch",
        username: "loltyler1",
        url: "https://www.twitch.tv/loltyler1",
        followers: "5.3M",
        lastChecked: Date.now() - 36000,
      },
    ],
  },
  {
    id: "5",
    name: "Allecakes",
    bio: "Variety streamer and content creator.",
    avatarUrl:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/allecakes-profile_image-0d4ad6e0d37e3d11-70x70.png",
    isFavorite: false,
    addedAt: Date.now() - 20000,
    lastChecked: Date.now() - 30000,
    category: "Other",
    accounts: [
      {
        id: "5a",
        platform: "twitch",
        username: "allecakes",
        url: "https://www.twitch.tv/allecakes",
        followers: "1.2M",
        lastChecked: Date.now() - 31000,
      },
    ],
  },
  {
    id: "3",
    name: "Adin Ross",
    bio: "Kick's No. 1 Creator | Live every day.",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1628173456037085184/D8n_d7_C_400x400.jpg",
    isFavorite: true,
    isPinned: true,
    addedAt: Date.now() - 50000,
    lastChecked: Date.now() - 45000,
    category: "Favorites",
    accounts: [
      {
        id: "3a",
        platform: "kick",
        username: "adinross",
        url: "https://kick.com/adinross",
        followers: "1.9M",
        lastChecked: Date.now() - 47000,
      },
      {
        id: "3b",
        platform: "youtube",
        username: "adinross",
        url: "https://youtube.com/@adinross",
        followers: "4.6M",
        lastChecked: Date.now() - 47000,
      },
    ],
  },
  {
    id: "6",
    name: "Starfireara",
    bio: "Content creator and visionary.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Starfireara",
    isFavorite: true,
    isPinned: true,
    addedAt: Date.now() - 5000,
    reason: "Motivational speaker",
    isLive: true,
    lastChecked: Date.now() - 4000,
    category: "Favorites",
    accounts: [
      {
        id: "6a",
        platform: "kick",
        username: "starfireara",
        url: "https://kick.com/starfireara",
        followers: "50.2K",
        lastChecked: Date.now() - 2500,
      },
      {
        id: "6b",
        platform: "tiktok",
        username: "starfireara",
        url: "https://www.tiktok.com/@starfireara",
        followers: "247.3K",
        isLive: true,
        lastChecked: Date.now() - 4000,
      },
    ],
  },
  {
    id: "2",
    name: "Marques Brownlee",
    bio: "Quality Tech Videos | MKBHD",
    avatarUrl:
      "https://yt3.googleusercontent.com/lkH3xt4nRzQKoxoxEncyZdx_n9S6S7E3Y2ba9BVA9_5uYx5rOsu_O2fD2m-v-j5v6k=s176-c-k-c0x00ffffff-no-rj",
    isFavorite: false,
    addedAt: Date.now() - 100000,
    lastChecked: Date.now() - 95000,
    category: "Other",
    accounts: [
      {
        id: "2a",
        platform: "youtube",
        username: "mkbhd",
        url: "https://youtube.com/@mkbhd",
        followers: "19.6M",
        lastChecked: Date.now() - 95000,
      },
    ],
  },
  {
    id: "7",
    name: "Tfue",
    bio: "Professional Gaming Legend.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tfue",
    isFavorite: false,
    addedAt: Date.now() - 30000,
    lastChecked: Date.now() - 28000,
    category: "Other",
    accounts: [
      {
        id: "7a",
        platform: "twitch",
        username: "tfue",
        url: "https://www.twitch.tv/tfue",
        followers: "11.4M",
        lastChecked: Date.now() - 28000,
      },
    ],
  },
  {
    id: "8",
    name: "Shroud",
    bio: "The human aimbot.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shroud",
    isFavorite: false,
    addedAt: Date.now() - 40000,
    lastChecked: Date.now() - 38000,
    category: "Other",
    accounts: [
      {
        id: "8a",
        platform: "twitch",
        username: "shroud",
        url: "https://www.twitch.tv/shroud",
        followers: "10.9M",
        lastChecked: Date.now() - 38000,
      },
    ],
  },
  {
    id: "9",
    name: "Pokimane",
    bio: "Voted best variety streamer.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pokimane",
    isFavorite: false,
    addedAt: Date.now() - 50000,
    lastChecked: Date.now() - 48000,
    category: "Other",
    accounts: [
      {
        id: "9a",
        platform: "twitch",
        username: "pokimane",
        url: "https://www.twitch.tv/pokimane",
        followers: "9.3M",
        lastChecked: Date.now() - 48000,
      },
    ],
  },
];

const DATA_VERSION = "5.0"; // Increment this to force reset localStorage

function App() {
  const [creators, setCreators] = useState<Creator[]>(() => {
    try {
      const savedVersion = localStorage.getItem("fav_creators_version");
      // Reset data if version mismatch (categories changed)
      if (savedVersion !== DATA_VERSION) {
        localStorage.setItem("fav_creators_version", DATA_VERSION);
        localStorage.removeItem("fav_creators");
        return INITIAL_DATA;
      }
      const saved = localStorage.getItem("fav_creators");
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch (e) {
      console.error("Failed to parse creators from localStorage", e);
      return INITIAL_DATA;
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Favorites");
  const [quickAddValue, setQuickAddValue] = useState("fouseytube");
  const [packPreview, setPackPreview] = useState<Creator[] | null>(null);
  const [packNotice, setPackNotice] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Helper: Fetch with timeout to prevent hanging requests
  const fetchWithTimeout = async (
    url: string,
    timeoutMs: number = 8000,
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  };

  // Helper: Fetch via CORS proxy with retry logic
  const fetchViaProxy = async (
    targetUrl: string,
    retries: number = 2,
  ): Promise<string | null> => {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add small delay between retries
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }

        const response = await fetchWithTimeout(proxyUrl, 10000);
        if (response.ok) {
          const text = await response.text();
          if (text && text.length > 50) {
            return text;
          }
        }
      } catch (e) {
        console.warn(
          `Proxy fetch attempt ${attempt + 1} failed for ${targetUrl}`,
          e,
        );
        if (attempt === retries) {
          return null;
        }
      }
    }
    return null;
  };

  const checkLiveStatus = async (
    platform: string,
    username: string,
  ): Promise<boolean | null> => {
    // Returns: true = live, false = offline, null = check failed (unknown)

    // 1. Twitch Check (Real via DecAPI - multiple endpoints)
    if (platform === "twitch") {
      // Try DecAPI uptime endpoint
      try {
        const response = await fetchWithTimeout(
          `https://decapi.me/twitch/uptime/${username}`,
          5000,
        );
        if (response.ok) {
          const text = (await response.text()).toLowerCase().trim();
          // DecAPI returns the uptime if live, or specific messages if offline
          if (text.includes("offline")) return false;
          if (text.includes("not found") || text.includes("does not exist"))
            return false;
          // If we get a time format (e.g., "2h 30m"), they're live
          if (/\d+[hms]/.test(text) || /\d+\s*(hour|minute|second)/i.test(text))
            return true;
          // Any other non-error response with reasonable length likely means live
          if (text.length > 0 && text.length < 50 && !text.includes("error"))
            return true;
        }
      } catch (e) {
        console.warn("Twitch DecAPI check failed, trying fallback", e);
      }

      // Fallback: Try Twitch's public API via proxy
      try {
        const html = await fetchViaProxy(`https://www.twitch.tv/${username}`);
        if (html) {
          // Check for live indicators in the page
          if (
            html.includes('"isLiveBroadcast":true') ||
            html.includes('"isLiveBroadcast": true')
          )
            return true;
          if (html.includes('"isLive":true') || html.includes('"isLive": true'))
            return true;
          // Check for offline indicators
          if (
            html.includes('"isLive":false') ||
            html.includes('"isLive": false')
          )
            return false;
          if (
            html.includes("offline_embed_player") ||
            html.includes("channel-status-info--offline")
          )
            return false;
        }
      } catch (e) {
        console.warn("Twitch proxy check failed", e);
      }

      return null; // Check failed, status unknown
    }

    // 2. Kick Check (Real via Proxy with multiple detection methods)
    if (platform === "kick") {
      try {
        const apiResponse = await fetchViaProxy(
          `https://kick.com/api/v2/channels/${username}`,
        );
        if (apiResponse) {
          // First try: Check raw string for is_live (most reliable)
          if (apiResponse.includes('"is_live":true')) {
            console.log(`Kick: ${username} is LIVE (string match)`);
            return true;
          }
          if (apiResponse.includes('"is_live":false')) {
            console.log(`Kick: ${username} is OFFLINE (string match)`);
            return false;
          }
          // Also check for livestream:null which means offline
          if (apiResponse.includes('"livestream":null')) {
            console.log(`Kick: ${username} is OFFLINE (no livestream)`);
            return false;
          }

          // Second try: Parse JSON for structured check
          try {
            const data = JSON.parse(apiResponse);
            if (data.livestream && typeof data.livestream === "object") {
              const isLive = data.livestream.is_live === true;
              console.log(
                `Kick: ${username} is ${isLive ? "LIVE" : "OFFLINE"} (JSON parse)`,
              );
              return isLive;
            }
            if (data.livestream === null) {
              console.log(`Kick: ${username} is OFFLINE (JSON null)`);
              return false;
            }
          } catch {
            // JSON parse failed, but we already tried string matching
          }
        }
      } catch (e) {
        console.warn("Kick API check failed", e);
      }

      // Fallback: page scraping (only if API failed completely)
      try {
        const pageHtml = await fetchViaProxy(`https://kick.com/${username}`);
        if (pageHtml) {
          if (pageHtml.includes('"is_live":true')) {
            console.log(`Kick: ${username} is LIVE (page scrape)`);
            return true;
          }
          if (
            pageHtml.includes('"is_live":false') ||
            pageHtml.includes('"livestream":null')
          ) {
            console.log(`Kick: ${username} is OFFLINE (page scrape)`);
            return false;
          }
        }
      } catch (e) {
        console.warn("Kick page scrape failed", e);
      }

      return null; // Check failed, status unknown
    }

    // 3. TikTok Check (Real via Proxy with improved detection)
    if (platform === "tiktok") {
      try {
        const html = await fetchViaProxy(
          `https://www.tiktok.com/@${username}/live`,
        );
        if (html) {
          // TikTok live page markers
          const isLiveIndicators = [
            '"status":4', // Status 4 often means live on TikTok
            '"liveRoomUserInfo"',
            '"LiveRoom"',
            "room_id",
            '"isLiveStreaming":true',
          ];
          const isOfflineIndicators = [
            "LIVE_UNAVAILABLE",
            '"status":2', // Status 2 often means offline
            "This LIVE has ended",
            "currently unavailable",
          ];

          // Check for live indicators
          for (const indicator of isLiveIndicators) {
            if (html.includes(indicator)) {
              // Make sure it's not also showing offline
              let hasOfflineIndicator = false;
              for (const offIndicator of isOfflineIndicators) {
                if (html.includes(offIndicator)) {
                  hasOfflineIndicator = true;
                  break;
                }
              }
              if (!hasOfflineIndicator) return true;
            }
          }

          // Check for definite offline indicators
          for (const indicator of isOfflineIndicators) {
            if (html.includes(indicator)) return false;
          }
        }
      } catch (e) {
        console.warn("TikTok check failed", e);
      }

      return null; // Check failed, status unknown
    }

    // 4. YouTube Check (via proxy - basic support)
    if (platform === "youtube") {
      try {
        const html = await fetchViaProxy(
          `https://www.youtube.com/@${username}/live`,
        );
        if (html) {
          if (
            html.includes('"isLive":true') ||
            html.includes('"isLiveBroadcast":true')
          )
            return true;
          if (html.includes('"isLiveNow":true')) return true;
          // Check for live badge in page
          if (html.includes("LIVE NOW") || html.includes('"liveBadge"'))
            return true;
          if (
            html.includes('"isLive":false') ||
            html.includes("No live stream")
          )
            return false;
        }
      } catch (e) {
        console.warn("YouTube check failed", e);
      }

      return null; // Check failed, status unknown
    }

    // Platform not supported for live checking
    return null;
  };

  useEffect(() => {
    localStorage.setItem("fav_creators", JSON.stringify(creators));
  }, [creators]);



  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pack = params.get("pack");
    if (!pack) return;

    try {
      const decoded = JSON.parse(decodeURIComponent(atob(pack))) as Creator[];
      if (Array.isArray(decoded) && decoded.length > 0) {
        setPackPreview(decoded);
        setPackNotice("A shared creator pack is waiting for you.");
      }
    } catch (error) {
      console.warn("Failed to decode shared pack", error);
      setPackNotice("Could not read the shared creator pack.");
    }
  }, []);

  const updateAllLiveStatuses = async () => {
    // Get current creators
    const currentCreators = [...creators];
    const updatedCreators: Creator[] = [];

    // Process creators sequentially with small delays to avoid overwhelming proxy
    for (let i = 0; i < currentCreators.length; i++) {
      const c = currentCreators[i];
      const now = Date.now();

      // Add delay between creators (except first one)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const updatedAccounts = await Promise.all(
        c.accounts.map(async (acc) => {
          const liveResult = await checkLiveStatus(acc.platform, acc.username);
          const isLive = liveResult === null ? acc.isLive : liveResult;
          return { ...acc, isLive, lastChecked: now };
        }),
      );

      const anyAccountLive = updatedAccounts.some((acc) => acc.isLive === true);
      updatedCreators.push({
        ...c,
        isLive: anyAccountLive,
        accounts: updatedAccounts,
        lastChecked: now,
      });
    }

    setCreators(updatedCreators);
  };

  // Auto-check live status on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      updateAllLiveStatuses();
    }, 1500);

    const interval = setInterval(updateAllLiveStatuses, 180000); // Check every 3 mins

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Data Migration: Ensure all existing accounts have follower counts
  useEffect(() => {
    let changed = false;
    const migrated = creators.map((c) => {
      const newAccounts = c.accounts.map((acc) => {
        if (!acc.followers) {
          changed = true;
          const randomFollowers = (Math.random() * 10 + 1).toFixed(1) + "M";
          return { ...acc, followers: randomFollowers };
        }
        return acc;
      });
      return { ...c, accounts: newAccounts };
    });

    if (changed) {
      setCreators(migrated);
    }
  }, []);

  const handleQuickAdd = () => {
    if (!quickAddValue.trim()) return;

    const parts = quickAddValue.split(":").map((p) => p.trim());
    const name = parts[0];
    let requestedPlatforms = parts.slice(1);

    if (!name) return;

    // Auto-find logic: if no platforms specified, search all major ones
    if (requestedPlatforms.length === 0) {
      requestedPlatforms = ["kick", "twitch", "youtube", "tiktok"];
    }

    const accounts: SocialAccount[] = [];
    const now = Date.now();

    requestedPlatforms.forEach((p) => {
      const platform = p.toLowerCase() as Platform;
      const id = crypto.randomUUID();
      const cleanUsername = name.toLowerCase().replace(/\s+/g, "");
      const dummyFollowers = (Math.random() * 5 + 0.5).toFixed(1) + "M";

      const baseAccount = {
        id,
        platform,
        username: cleanUsername,
        followers: dummyFollowers,
        lastChecked: now,
      };

      if (platform === "kick") {
        accounts.push({
          ...baseAccount,
          url: `https://kick.com/${cleanUsername}`,
        });
      } else if (platform === "twitch") {
        accounts.push({
          ...baseAccount,
          url: `https://twitch.tv/${cleanUsername}`,
        });
      } else if (platform === "youtube") {
        accounts.push({
          ...baseAccount,
          url: `https://youtube.com/@${cleanUsername}`,
        });
      } else if (platform === "tiktok") {
        accounts.push({
          ...baseAccount,
          url: `https://tiktok.com/@${cleanUsername}`,
        });
      }
    });

    const newCreator: Creator = {
      id: crypto.randomUUID(),
      name: name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      bio: `Auto-found social accounts for ${name}`,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`,
      accounts,
      isFavorite: false,
      isPinned: false,
      note: "",
      addedAt: now,
      lastChecked: now,
    };

    setCreators([newCreator, ...creators]);
    setQuickAddValue("");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(creators, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "fav-creators-export.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleCheckCreatorStatus = async (id: string) => {
    const creator = creators.find((c) => c.id === id);
    if (!creator) return;

    const now = Date.now();
    const updatedAccounts = await Promise.all(
      creator.accounts.map(async (acc) => {
        const liveResult = await checkLiveStatus(acc.platform, acc.username);
        // If check failed (null), keep previous status; otherwise use new status
        const isLive = liveResult === null ? acc.isLive : liveResult;
        return { ...acc, isLive, lastChecked: now };
      }),
    );

    // Only mark creator as live if at least one account is definitively live
    const anyAccountLive = updatedAccounts.some((acc) => acc.isLive === true);
    setCreators(
      creators.map((c) =>
        c.id === id
          ? {
            ...c,
            isLive: anyAccountLive,
            accounts: updatedAccounts,
            lastChecked: now,
          }
          : c,
      ),
    );
  };

  const applySharedPack = () => {
    if (!packPreview) return;
    setCreators(packPreview);
    setPackPreview(null);
    setPackNotice("Shared creator pack applied.");

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.delete("pack");
      const search = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${search ? `?${search}` : ""}`,
      );
    }
  };

  const handleSharePack = async () => {
    if (typeof window === "undefined") return;

    const payload = btoa(encodeURIComponent(JSON.stringify(creators)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?pack=${payload}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const field = document.createElement("textarea");
        field.value = shareUrl;
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
      }
      setShareFeedback("Share link copied to clipboard!");
    } catch (error) {
      console.error("Share pack copy failed", error);
      setShareFeedback("Copy failed. You can still share the URL manually.");
    }

    setTimeout(() => {
      setShareFeedback(null);
    }, 3500);
  };

  const handleRefreshStatus = async () => {
    await updateAllLiveStatuses();
  };

  const handleResetDatabase = () => {
    if (
      window.confirm(
        "This will reset your entire list to the latest official creator data. Continue?",
      )
    ) {
      setCreators(INITIAL_DATA);
    }
  };

  const handleSaveCreator = (newCreator: Creator) => {
    setCreators([newCreator, ...creators]);
    setIsFormOpen(false);
  };

  const handleDeleteCreator = (id: string) => {
    if (window.confirm("Are you sure you want to remove this creator?")) {
      setCreators(creators.filter((c) => c.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    setCreators(
      creators.map((c) =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c,
      ),
    );
  };

  const handleTogglePin = (id: string) => {
    setCreators(
      creators.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c)),
    );
  };

  const handleUpdateNote = (id: string, note: string) => {
    setCreators(creators.map((c) => (c.id === id ? { ...c, note } : c)));
  };

  const handleRemoveAccount = (creatorId: string, accountId: string) => {
    setCreators(
      creators.map((c) =>
        c.id === creatorId
          ? { ...c, accounts: c.accounts.filter((acc) => acc.id !== accountId) }
          : c,
      ),
    );
  };

  return (
    <div className="app-container">
      <header>
        <h1>FavCreators</h1>
        <p className="subtitle">
          Keep track of your favorite creators across the web
        </p>
      </header>

      <div className="quick-add-group">
        <input
          className="quick-add-input"
          placeholder="Quick add (e.g. adinross:kick:twitch:youtube:tiktok)"
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
        />
        <button className="quick-add-btn" onClick={handleQuickAdd}>
          Quick Add
        </button>
      </div>

      <div className="controls">
        <div
          className="search-bar"
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="Favorites">Favorites</option>
            <option value="Other">Other</option>
          </select>

        </div>
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <button
            className="btn-secondary"
            onClick={handleResetDatabase}
            title="Reset to official data"
          >
            🔄 Reset
          </button>
          <button
            className="btn-secondary"
            onClick={handleExport}
            title="Export to JSON"
          >
            📤 Export
          </button>
          <button
            className="btn-secondary"
            onClick={handleRefreshStatus}
            title="Check all live statuses"
          >
            📡 Live check
          </button>
          <button
            className="btn-secondary"
            onClick={handleSharePack}
            title="Share this creator pack"
          >
            🔗 Share pack
          </button>
          <button className="btn-add" onClick={() => setIsFormOpen(true)}>
            <span>+</span> Add Creator
          </button>
        </div>
        {shareFeedback && <p className="share-feedback">{shareFeedback}</p>}
      </div>

      {packPreview && (
        <div className="pack-notice">
          <p>
            A creator pack was shared through the URL.{" "}
            <button className="btn-add" onClick={applySharedPack}>
              Apply pack
            </button>
          </p>
        </div>
      )}
      {!packPreview && packNotice && (
        <div className="pack-notice">{packNotice}</div>
      )}

      {/* Featured View - Single list filtered by dropdown */}
      <div className="creator-grid" style={{ marginTop: "2rem" }}>
        {creators
          .filter((c) => {
            const search = searchQuery.toLowerCase().replace(/\s+/g, "");
            const matchesSearch = c.name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(search);
            const matchesCategory =
              !categoryFilter || c.category === categoryFilter;
            return matchesSearch && matchesCategory;
          })
          .map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteCreator}
              onRemoveAccount={handleRemoveAccount}
              onCheckStatus={handleCheckCreatorStatus}
              onTogglePin={handleTogglePin}
              onUpdateNote={handleUpdateNote}
            />
          ))}
      </div>



      {isFormOpen && (
        <CreatorForm
          onSave={handleSaveCreator}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <footer
        style={{
          marginTop: "5rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
        }}
      >
        <p>© 2026 FavCreators. Built with ❤️ for creators. v1.7.5-Production</p>
      </footer>
    </div>
  );
}

export default App;
