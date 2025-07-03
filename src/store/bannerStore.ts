import { create } from 'zustand';
import { Banner } from '../types/banner';

interface BannerState {
  banners: Banner[];
  activeBanner: Banner | null;
  dismissedBannerIds: string[];
  bannerIndex: number;
  initializeBanners: () => void;
  displayNextBanner: () => void;
  dismissCurrentBanner: () => void;
}

const BANNER_STORAGE_KEY = 'dismissedBannerIds';

const initialBanners: Banner[] = [
  {
    id: 'welcome-banner',
    message: 'This website was created from a single prompt!',
    type: 'info',
    dismissible: false,
    autoDismissDelay: 5000,
  },
  {
    id: 'project-creation-banner',
    message: 'Ready to start? Create your first project today!',
    type: 'success',
    dismissible: true,
  },
  {
    id: 'feedback-banner',
    message: "Enjoying the platform? We'd love to hear your feedback!",
    type: 'warning',
    dismissible: true,
  },
];

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: initialBanners,
  activeBanner: null,
  dismissedBannerIds: [],
  bannerIndex: 0,

  initializeBanners: () => {
    if (typeof window === 'undefined') {
      // Skip localStorage access on the server
      return;
    }
    let dismissedIds: string[] = [];
    try {
      const storedIds = localStorage.getItem(BANNER_STORAGE_KEY);
      if (storedIds) {
        dismissedIds = JSON.parse(storedIds);
      }
    } catch (e) {
      console.error('Failed to parse dismissed banner IDs from localStorage', e);
      // Fallback to empty array if parsing fails
      dismissedIds = [];
    }

    set({ dismissedBannerIds: dismissedIds });

    get().displayNextBanner(); // Set the initial active banner
  },

  displayNextBanner: () => {
    const { banners, dismissedBannerIds, bannerIndex } = get();
    let nextIndex = bannerIndex;
    let foundNext = false;

    while (nextIndex < banners.length && !foundNext) {
      const potentialBanner = banners[nextIndex];
      if (!dismissedBannerIds.includes(potentialBanner.id)) {
        set({ activeBanner: potentialBanner, bannerIndex: nextIndex });
        foundNext = true;
      } else {
        nextIndex++;
      }
    }

    if (!foundNext) {
      set({ activeBanner: null, bannerIndex: banners.length }); // No banners left to show
    }
  },

  dismissCurrentBanner: () => {
    const { activeBanner, dismissedBannerIds, displayNextBanner } = get();

    if (activeBanner && activeBanner.dismissible) {
      const newDismissedIds = [...new Set([...dismissedBannerIds, activeBanner.id])];
      set({ dismissedBannerIds: newDismissedIds });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(newDismissedIds));
        } catch (e) {
          console.error('Failed to save dismissed banner IDs to localStorage', e);
        }
      }
    }

    // Always attempt to display the next banner after dismissal (or if not dismissible)
    // This handles the transition for non-dismissible banners and moves to the next for dismissible ones.
    set((state) => ({ bannerIndex: state.bannerIndex + 1 })); // Increment index to move past current
    displayNextBanner();
  },
}));

// Call initializeBanners once when the store is created globally (client-side)
// This ensures localStorage is read and the first banner is set up.
// Note: This pattern is for simple cases. For SSR, hydrating state is more complex.
// We'll rely on calling `initializeBanners` from a React component (e.g., in a useEffect)
// for proper client-side initialization after hydration.
// useBannerStore.getState().initializeBanners(); // Not here, will cause issues with SSR.
