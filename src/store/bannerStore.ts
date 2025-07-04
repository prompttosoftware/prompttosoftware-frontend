import { create } from 'zustand';
import { Banner } from '../types/banner';

interface BannerState {
  banners: Banner[];
  activeBanner: Banner | null;
  dismissedBannerIds: string[];
  initialized: boolean;
  bannerTimer: number | null; // Stores the setTimeout ID

  setBanners: (newBanners: Banner[]) => void;
  initializeBanners: () => void;
  dismissCurrentBanner: () => void;
  showNextBanner: () => void;
  clearDismissedBanners: () => void; // Assuming this function exists as per earlier context
  showBanner: (banner: Banner) => void;
  }
clearDismissedBanners: () => void;
}

const LOCAL_STORAGE_KEY = 'dismissedBannerIds';

const INITIAL_BLUE_BANNER_ID = 'initial-blue-banner';

const HARDCODED_BANNERS: Banner[] = [
  {
    id: INITIAL_BLUE_BANNER_ID,
    message: 'This website was created from a single prompt!',
    type: 'info',
    dismissible: false,
  },
  // Add other hardcoded banners here if needed later
];

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [], // Initialize empty, will be set via setBanners
  activeBanner: null,
  dismissedBannerIds: [],
  initialized: false, // Default to false, set to true after first initialization
  bannerTimer: null,

  setBanners: (newBanners: Banner[]) => {
    // Prepend hardcoded banners to ensure they are always present and at the start
    const allBanners = [...HARDCODED_BANNERS, ...newBanners.filter(
      (nb) => !HARDCODED_BANNERS.some((hb) => hb.id === nb.id)
    )];
    set({ banners: allBanners });
    // After banners are updated, re-evaluate the active banner if already initialized
    // Or if not initialized, the next initializeBanners call will handle it.
    if (get().initialized) {
      get().initializeBanners(); // Re-trigger to set correct active banner
    }
  },

  initializeBanners: () => {
    // Prevent running on server-side or if already initialized
    if (typeof window === 'undefined') {
      return;
    }
    if (get().initialized && get().activeBanner && get().banners.length > 0) {
      // If already initialized and an active banner exists, re-check if it's still valid
      // This handles cases where `setBanners` might update the list
      const availableBanners = get().banners.filter(
        (b) => !get().dismissedBannerIds.includes(b.id)
      );
      if (!availableBanners.some((b) => b.id === get().activeBanner?.id)) {
        // If current active banner is no longer available (e.g., it was dismissed elsewhere, or removed from list)
        set({ activeBanner: availableBanners.length > 0 ? availableBanners[0] : null });
      }
      return;
    }


    let storedDismissedIds: string[] = [];
    try {
      const storedIds = localStorage.getItem(LOCAL_STORAGE_KEY);
      storedDismissedIds = storedIds ? JSON.parse(storedIds) : [];
    } catch (error) {
      console.error('Failed to load dismissed banner IDs from localStorage:', error);
      // Fallback to empty array on error
    }

    set({ dismissedBannerIds: storedDismissedIds, initialized: true });

    // After loading dismissed IDs, set the initial active banner
    // This will show the first available banner.
    get().showNextBanner();

    // Special handling for the initial hardcoded blue banner:
    // If it's the active banner and it's non-dismissible, automatically move past it after a delay.
    // This simulates it being "viewed" and then transitioning.
    const currentActiveBanner = get().activeBanner;
    if (currentActiveBanner && currentActiveBanner.id === INITIAL_BLUE_BANNER_ID) {
      if (typeof window !== 'undefined') {
        // Clear any existing timer before setting a new one
        if (get().bannerTimer) {
          clearTimeout(get().bannerTimer);
        }
        const timerId = window.setTimeout(() => {
          // Check if it's still the active banner before moving on
          if (get().activeBanner?.id === INITIAL_BLUE_BANNER_ID) {
            console.log('Auto-advancing past initial blue banner...');
            get().showNextBanner();
          }
          set({ bannerTimer: null }); // Clear timer in state after it fires
        }, 5000); // Display for 5 seconds
        set({ bannerTimer: timerId });
      }
    }
  },

  dismissCurrentBanner: () => {
    const { activeBanner, dismissedBannerIds } = get();

    // Clear any active auto-dismiss timer
    if (get().bannerTimer) {
      clearTimeout(get().bannerTimer);
      set({ bannerTimer: null });
    }

    if (!activeBanner) { // No banner to dismiss
      return;
    }

    if (!activeBanner.dismissible) { // Cannot dismiss non-dismissible banners
      return;
    }

    const newDismissedIds = [...new Set([...dismissedBannerIds, activeBanner.id])];
    set({ dismissedBannerIds: newDismissedIds });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDismissedIds));
      } catch (e) {
        console.error('Failed to save dismissed banner IDs to localStorage', e);
      }
    }
    // Move to the next banner after successful dismissal
    get().showNextBanner();
  },

  showNextBanner: () => {
    const { banners, dismissedBannerIds } = get();

    // Clear any existing banner timer before showing next banner
    if (get().bannerTimer) {
      clearTimeout(get().bannerTimer);
      set({ bannerTimer: null });
    }

    const availableBanners = banners.filter(
      (banner) => !dismissedBannerIds.includes(banner.id)
    );

    if (availableBanners.length === 0) {
      set({ activeBanner: null }); // No banners to show
      return;
    }

    let nextBanner: Banner | null = null;
    const currentActiveBannerId = get().activeBanner?.id; // Get current active banner id
    if (currentActiveBannerId) {
      const currentIndex = availableBanners.findIndex((b) => b.id === currentActiveBannerId);
      if (currentIndex !== -1 && currentIndex < availableBanners.length - 1) {
        // If there's a next banner in sequence
        nextBanner = availableBanners[currentIndex + 1];
      } else {
        // If at the end of the list or current active banner is not found (e.g., dismissed externally)
        // or was the last available one, loop back to the first available.
        // This makes the sequence continuous; if the last banner is dismissed, it goes to the first
        // If at the end of the list, or current active banner is no longer available/found,
// set to null to end the display sequence.
nextBanner = null;
      }
    } else {
      // If there's no active banner currently (initial state or after all sequential banners are dismissed),
      // display the first available banner to start the sequence.
      nextBanner = availableBanners[0];
    }

    set({ activeBanner: nextBanner });

    // Set auto-dismiss timer if the next banner has autoDismiss property
    if (nextBanner && typeof nextBanner.autoDismiss === 'number' && nextBanner.autoDismiss > 0) {
      if (typeof window !== 'undefined') {
        const timerId = window.setTimeout(() => {
          // Check if this is still the active banner before dismissing
          if (get().activeBanner?.id === nextBanner?.id) {
            console.log('Auto-dismissing banner:', nextBanner.id);
            get().dismissCurrentBanner();
          }
        }, nextBanner.autoDismiss);
        set({ bannerTimer: timerId });
      }
    }
  },

  showBanner: (banner: Banner) => {
    set((state) => {
      // Prevent adding duplicate banners by ID
      if (state.banners.some((b) => b.id === banner.id)) {
        console.warn(`Banner with ID "${banner.id}" already exists. Not adding.`);
        return state; // Return current state unchanged
      }

      // Add the new banner to the end of the existing banners list
      const updatedBanners = [...state.banners, banner];
      return { banners: updatedBanners };
    });
    // After adding the banner, re-evaluate which banner should be active
    // This will either show the new banner if it's the next in sequence or
    // if there was no active banner, or continue with the current sequence.
    get().showNextBanner();
  },
  clearDismissedBanners: () => {
    set({ dismissedBannerIds: [] });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear dismissed banner IDs from localStorage', e);
      }
    }
  },
}));

// Call initializeBanners once when the store is created globally (client-side)
// This ensures localStorage is read and the first banner is set up.
// Note: This pattern is for simple cases. For SSR, hydrating state is more complex.
// We'll rely on calling `initializeBanners` from a React component (e.g., in a useEffect)
// for proper client-side initialization after hydration.
// useBannerStore.getState().initializeBanners(); // Not here, will cause issues with SSR.
