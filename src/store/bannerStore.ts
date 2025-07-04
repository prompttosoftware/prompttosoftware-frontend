import { create } from 'zustand';
import { Banner } from '../types/banner';

interface BannerStore {
    activeBanner: Banner | null;
    bannerQueue: Banner[];
    dismissedBannerIds: string[];
    addBanner: (banner: Omit<Banner, 'id'>) => void;
    setNextBanner: () => void;
    dismissCurrentBanner: () => void;
    initBanners: (initialBanners: Omit<Banner, 'id'>[]) => void;
}

const LOCAL_STORAGE_KEY = 'dismissedBannerIds';

const useBannerStore = create<BannerStore>((set, get) => ({
    activeBanner: null,
    bannerQueue: [],
    dismissedBannerIds: [],

    initBanners: (initialBanners) => {
        // Load dismissed IDs from localStorage
        try {
            const storedDismissedIds = localStorage.getItem(LOCAL_STORAGE_KEY);
            const dismissedIds = storedDismissedIds ? JSON.parse(storedDismissedIds) : [];
            set({ dismissedBannerIds: dismissedIds });

            // Add initial banners, filtering out already dismissed ones
            const currentDismissedIds = get().dismissedBannerIds;
            const newBanners = initialBanners.map(banner => ({
                ...banner,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            })).filter(banner => !currentDismissedIds.includes(banner.id));

            set((state) => {
                const updatedQueue = [...state.bannerQueue, ...newBanners];
                if (!state.activeBanner && updatedQueue.length > 0) {
                    const nextBanner = updatedQueue.shift();
                    return { activeBanner: nextBanner, bannerQueue: updatedQueue };
                }
                return { bannerQueue: updatedQueue };
            });

        } catch (e) {
            console.error("Failed to load dismissed banner IDs from localStorage", e);
            set({ dismissedBannerIds: [] });
        }
    },

    addBanner: (banner) => {
        const newBanner: Banner = { ...banner, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        set((state) => {
            const updatedQueue = [...state.bannerQueue, newBanner].filter(b => !get().dismissedBannerIds.includes(b.id)); // Filter out dismissed
            if (!state.activeBanner && updatedQueue.length > 0) {
                const nextBanner = updatedQueue.shift();
                return { activeBanner: nextBanner, bannerQueue: updatedQueue };
            }
            return { bannerQueue: updatedQueue };
        });
    },

    setNextBanner: () => {
        set((state) => {
            // Filter out any banners in the queue that have been dismissed
            const playableQueue = state.bannerQueue.filter(b => !state.dismissedBannerIds.includes(b.id));

            if (playableQueue.length > 0) {
                const nextBanner = playableQueue.shift();
                return { activeBanner: nextBanner, bannerQueue: playableQueue };
            }
            return { activeBanner: null, bannerQueue: [] }; // No more banners
        });
    },

    dismissCurrentBanner: () => {
        set((state) => {
            const { activeBanner, dismissedBannerIds } = state;
            if (activeBanner && activeBanner.dismissible) {
                const updatedDismissedIds = [...dismissedBannerIds, activeBanner.id];
                // Persist to localStorage
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDismissedIds));
                } catch (e) {
                    console.error("Failed to save dismissed banner IDs to localStorage", e);
                }
                // Find the next banner that hasn't been dismissed
                const nextBannerQueue = state.bannerQueue.filter(b => !updatedDismissedIds.includes(b.id));
                const nextActiveBanner = nextBannerQueue.length > 0 ? nextBannerQueue.shift() : null;

                return {
                    dismissedBannerIds: updatedDismissedIds,
                    activeBanner: nextActiveBanner,
                    bannerQueue: nextActiveBanner ? nextBannerQueue : [],
                };
            }
            return state; // No active banner or not dismissible
        });
    },
}));

export default useBannerStore;
