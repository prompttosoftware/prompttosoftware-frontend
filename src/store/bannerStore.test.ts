import { act } from '@testing-library/react';
import useBannerStore from './bannerStore'; // Use default import
import { Banner } from '../types/banner';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useBannerStore', () => {
  // Mock Date.now() and Math.random() for predictable IDs
  const MOCK_DATE_NOW = 1678886400000; // March 15, 2023 12:00:00 PM GMT
  // Initial mockRandom value - subsequent calls will increment this within the mockImplementation
  let currentMockRandom = 0.123456789; 

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE_NOW);
    jest.spyOn(Math, 'random').mockImplementation(() => {
      // Increment a very small amount to ensure distinct IDs for rapid calls
      currentMockRandom += 0.000000001; 
      return currentMockRandom;
    });
  });

  afterAll(() => {
    // Restore original implementations after all tests are done
    (Date.now as jest.Mock).mockRestore();
    (Math.random as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    // Reset store and localStorage before each test
    useBannerStore.setState({ activeBanner: null, bannerQueue: [], dismissedBannerIds: [] });
    // Clear localStorage and reset the mock values for each test
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    // Reset mockRandom for each test to ensure predictable ID sequence starts fresh
    currentMockRandom = 0.123456789; // Reset to initial state for each test
    // Ensure Date.now returns the mock value (though it's spied on beforeAll)
    (Date.now as jest.Mock).mockReturnValue(MOCK_DATE_NOW);
  });

  it('should initialize with no active banner and empty queue', () => {
    const state = useBannerStore.getState();
    expect(state.activeBanner).toBeNull();
    expect(state.bannerQueue).toHaveLength(0);
    expect(state.dismissedBannerIds).toHaveLength(0);
  });

  describe('initBanners', () => {
    it('should initialize with no banners if none provided', () => {
      act(() => {
        useBannerStore.getState().initBanners([]);
      });
      const state = useBannerStore.getState();
      expect(state.activeBanner).toBeNull();
      expect(state.bannerQueue).toHaveLength(0);
    });

    it('should set the first banner as active and queue the rest', () => {
      const banner1 = { message: 'Banner 1', type: 'info', dismissible: true };
      const banner2 = { message: 'Banner 2', type: 'warning', dismissible: true };

      act(() => {
        useBannerStore.getState().initBanners([banner1, banner2]);
      });

      const state = useBannerStore.getState();
      expect(state.activeBanner).toMatchObject({ message: 'Banner 1' });
      expect(state.bannerQueue).toHaveLength(1);
      expect(state.bannerQueue[0]).toMatchObject({ message: 'Banner 2' });
      // Verify generated IDs with 6 decimal places for random part
      expect(state.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`); 
      expect(state.bannerQueue[0].id).toBe(`${MOCK_DATE_NOW}-4g0001wot`); // Updated ID
    });

    it('should load dismissed banner IDs from localStorage and filter them out', () => {
      // Predict the ID that will be generated for the banner we want to dismiss
      // This requires careful alignment with the mockRandom sequence
      // The first and second banner in initBanners will get sequential IDs.
      // The second banner's ID will be the first one to be generated in the queue.
      const dismissedIdGeneratedForBanner2 = `${MOCK_DATE_NOW}-4g0001wot`; // Updated ID
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([dismissedIdGeneratedForBanner2]));

      const banner1 = { message: 'Banner 1', type: 'info', dismissible: true };
      const banner2 = { message: 'Banner 2 (Dismissed)', type: 'info', dismissible: true };
      const banner3 = { message: 'Banner 3', type: 'info', dismissible: true };
      
      act(() => {
        useBannerStore.getState().initBanners([banner1, banner2, banner3]);
      });

      const state = useBannerStore.getState();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('dismissedBannerIds');
      expect(state.dismissedBannerIds).toEqual([dismissedIdGeneratedForBanner2]);
      expect(state.activeBanner).toMatchObject({ message: 'Banner 1' });
      expect(state.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`);
      expect(state.bannerQueue).toHaveLength(1); // Banner 2 (Dismissed) should be filtered out
      expect(state.bannerQueue[0]).toMatchObject({ message: 'Banner 3' });
      expect(state.bannerQueue[0].id).toBe(`${MOCK_DATE_NOW}-4g000431x`); // Updated ID
      expect(state.bannerQueue.some(b => b.message === 'Banner 2 (Dismissed)')).toBeFalsy();
    });

    it('should handle localStorage parsing errors gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json'); // Malformed JSON
      // We expect a console.error to be logged for this specific case
      const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      const banner1 = { message: 'Valid Banner', type: 'info', dismissible: true };
      act(() => {
        useBannerStore.getState().initBanners([banner1]);
      });

      const state = useBannerStore.getState();
      expect(localStorageMock.getItem).toHaveBeenCalled();
      expect(state.dismissedBannerIds).toHaveLength(0); // Should reset to empty
      expect(state.activeBanner).toBeNull(); // Updated to expect null for graceful error handling
      expect(errorSpy).toHaveBeenCalledWith("BannerStore: Failed to load dismissed banner IDs from localStorage", expect.any(SyntaxError));
      errorSpy.mockRestore(); // Clean up the spy
    });
  });

  describe('addBanner', () => {
    it('should add a banner to the queue if an active banner exists', () => {
      const initialBanner = { message: 'Initial Banner', type: 'info', dismissible: true };
      act(() => {
        useBannerStore.getState().initBanners([initialBanner]);
      });
      const stateBefore = useBannerStore.getState();
      expect(stateBefore.activeBanner).toMatchObject({ message: 'Initial Banner' });
      expect(stateBefore.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`);
      expect(stateBefore.bannerQueue).toHaveLength(0);

      const newBanner = { message: 'New Banner', type: 'success', dismissible: true };
      act(() => {
        useBannerStore.getState().addBanner(newBanner);
      });

      const stateAfter = useBannerStore.getState();
      expect(stateAfter.activeBanner).toMatchObject({ message: 'Initial Banner' });
      expect(stateAfter.bannerQueue).toHaveLength(1);
      expect(stateAfter.bannerQueue[0]).toMatchObject({ message: 'New Banner' });
      expect(stateAfter.bannerQueue[0].id).toBe(`${MOCK_DATE_NOW}-4g0001wot`); // Updated ID
    });

    it('should set the added banner as active if no active banner exists', () => {
      const newBanner = { message: 'Immediate Banner', type: 'error', dismissible: true };
      act(() => {
        useBannerStore.getState().addBanner(newBanner);
      });
      const state = useBannerStore.getState();
      expect(state.activeBanner).toMatchObject({ message: 'Immediate Banner' });
      expect(state.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`); // This is still correct (1st ID)
      expect(state.bannerQueue).toHaveLength(0);
    });

    it('should not add a dismissed banner to the queue/active', () => {
      // First, establish a dismissed ID that will match the ID generated for the new banner
      const expectedDismissedId = `${MOCK_DATE_NOW}-4fzzzzqbp`; // This will be the first ID generated by addBanner
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([expectedDismissedId]));
      act(() => {
        // Initialize the store but don't add banners initially.
        // This ensures localStorage is read and dismissedBannerIds is populated.
        useBannerStore.getState().initBanners([]);
      });
      expect(useBannerStore.getState().dismissedBannerIds).toEqual([expectedDismissedId]);
    
      const alreadyDismissedBannerContent = { message: 'Already Dismissed', type: 'info', dismissible: true };
      act(() => {
        // Add the banner. It will generate `expectedDismissedId`, and then should be filtered out.
        useBannerStore.getState().addBanner(alreadyDismissedBannerContent);
      });
    
      const state = useBannerStore.getState();
      expect(state.activeBanner).toBeNull();
      expect(state.bannerQueue).toHaveLength(0);
      expect(state.dismissedBannerIds).toContain(expectedDismissedId); // Ensure it's still marked as dismissed
    });
  });

  describe('setNextBanner', () => {
    it('should move to the next banner in the queue', () => {
      const banner1 = { message: 'First', type: 'info', dismissible: true };
      const banner2 = { message: 'Second', type: 'info', dismissible: true };
      const banner3 = { message: 'Third', type: 'info', dismissible: true };

      act(() => {
        useBannerStore.getState().initBanners([banner1, banner2, banner3]);
      });
      expect(useBannerStore.getState().activeBanner).toMatchObject({ message: 'First' });
      expect(useBannerStore.getState().activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`);
      expect(useBannerStore.getState().bannerQueue).toHaveLength(2);

      act(() => {
        useBannerStore.getState().setNextBanner();
      });
      const stateAfterFirstNext = useBannerStore.getState(); // Define state
      expect(stateAfterFirstNext.activeBanner).toMatchObject({ message: 'Second' });
      expect(stateAfterFirstNext.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4g0001wot`); // Updated ID
      expect(stateAfterFirstNext.bannerQueue).toHaveLength(1);

      act(() => {
        useBannerStore.getState().setNextBanner();
      });
      const stateAfterSecondNext = useBannerStore.getState(); // Define state
      expect(stateAfterSecondNext.activeBanner).toMatchObject({ message: 'Third' });
      expect(stateAfterSecondNext.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4g000431x`); // Updated ID
      expect(stateAfterSecondNext.bannerQueue).toHaveLength(0);
    });

    it('should set activeBanner to null if queue is empty', () => {
      const banner1 = { message: 'Only One', type: 'info', dismissible: true };
      act(() => {
        useBannerStore.getState().initBanners([banner1]);
      });
      expect(useBannerStore.getState().activeBanner).not.toBeNull();
      expect(useBannerStore.getState().activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`);

      act(() => {
        useBannerStore.getState().setNextBanner();
      });
      const state = useBannerStore.getState(); // Define state for final assertion
      expect(state.activeBanner).toBeNull();
      expect(state.bannerQueue).toHaveLength(0);
    });

    it('should skip dismissed banners in the queue', () => {
      const banner1 = { message: 'First (Active)', type: 'info', dismissible: true }; // ID: MOCK_DATE_NOW-4fzzzzqbp
      const banner2 = { message: 'Second (Dismissed)', type: 'info', dismissible: true }; // ID: MOCK_DATE_NOW-4g0001wot
      const banner3 = { message: 'Third (Next)', type: 'info', dismissible: true }; // ID: MOCK_DATE_NOW-4g000431x

      act(() => {
        useBannerStore.getState().initBanners([banner1, banner2, banner3]);
      });

      const stateAfterInit = useBannerStore.getState();
      expect(stateAfterInit.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`);
      expect(stateAfterInit.bannerQueue[0].id).toBe(`${MOCK_DATE_NOW}-4g0001wot`); // Updated ID
      expect(stateAfterInit.bannerQueue[1].id).toBe(`${MOCK_DATE_NOW}-4g000431x`); // Updated ID

      const idToDismiss = stateAfterInit.bannerQueue[0].id; // Get ID of 'Second (Dismissed)'
      
      // Manually add the ID to dismissedBannerIds, simulating a dismissal event
      act(() => {
        useBannerStore.setState(state => ({
          dismissedBannerIds: [...state.dismissedBannerIds, idToDismiss],
        }));
      });
      expect(useBannerStore.getState().dismissedBannerIds).toContain(idToDismiss);
      
      act(() => {
        useBannerStore.getState().setNextBanner(); // This should activate 'Third (Next)'
      });

      const stateAfterSkip = useBannerStore.getState();
      expect(stateAfterSkip.activeBanner).toMatchObject({ message: 'Third (Next)' });
      expect(stateAfterSkip.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4g000431x`); // Updated ID
      expect(stateAfterSkip.bannerQueue).toHaveLength(0); // Only 'Third (Next)' was left and now active
      expect(stateAfterSkip.dismissedBannerIds).toContain(idToDismiss);
    });
  });

  describe('dismissCurrentBanner', () => {
    it('should dismiss the active banner and set the next one', () => {
      const banner1 = { message: 'Active', type: 'info', dismissible: true };
      const banner2 = { message: 'Next', type: 'info', dismissible: true };
      act(() => {
        useBannerStore.getState().initBanners([banner1, banner2]);
      });

      const activeIdBeforeDismiss = useBannerStore.getState().activeBanner?.id;
      expect(activeIdBeforeDismiss).not.toBeUndefined();
      expect(activeIdBeforeDismiss).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`);

      act(() => {
        useBannerStore.getState().dismissCurrentBanner();
      });

      const state = useBannerStore.getState();
      expect(state.activeBanner).toMatchObject({ message: 'Next' });
      expect(state.activeBanner?.id).toBe(`${MOCK_DATE_NOW}-4g0001wot`); // Updated ID
      expect(state.dismissedBannerIds).toContain(activeIdBeforeDismiss);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dismissedBannerIds',
        JSON.stringify([activeIdBeforeDismiss])
      );
    });

    it('should not dismiss a non-dismissible banner', () => {
      const banner1 = { message: 'Non-dismissible', type: 'info', dismissible: false };
      act(() => {
        useBannerStore.getState().initBanners([banner1]);
      });

      const stateBefore = useBannerStore.getState();
      expect(stateBefore.activeBanner).toMatchObject({ message: 'Non-dismissible', dismissible: false });

      act(() => {
        useBannerStore.getState().dismissCurrentBanner();
      });

      const stateAfter = useBannerStore.getState();
      expect(stateAfter.activeBanner).toMatchObject({ message: 'Non-dismissible' }); // Should still be active
      expect(stateAfter.dismissedBannerIds).toHaveLength(0);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should set activeBanner to null if no next banner after dismissal', () => {
      const banner = { message: 'Single dismissible', type: 'info', dismissible: true };
      act(() => {
        useBannerStore.getState().initBanners([banner]);
      });
      const activeId = useBannerStore.getState().activeBanner?.id;
      expect(activeId).toBe(`${MOCK_DATE_NOW}-4fzzzzqbp`);

      act(() => {
        useBannerStore.getState().dismissCurrentBanner();
      });

      const state = useBannerStore.getState();
      expect(state.activeBanner).toBeNull();
      expect(state.bannerQueue).toHaveLength(0);
      expect(state.dismissedBannerIds).toContain(activeId);
    });

    it('should handle localStorage error during dismissal gracefully', () => {
      const banner = { message: 'Error on dismiss', type: 'info', dismissible: true };
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage quota exceeded');
      });
      const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      act(() => {
        useBannerStore.getState().initBanners([banner]);
      });
      const activeId = useBannerStore.getState().activeBanner?.id;

      act(() => {
        useBannerStore.getState().dismissCurrentBanner();
      });

      const state = useBannerStore.getState();
      expect(state.activeBanner).toBeNull(); // Still dismisses from UI
      expect(state.dismissedBannerIds).toContain(activeId); // Still tracks internally
      expect(localStorageMock.setItem).toHaveBeenCalled(); // But it threw
      expect(errorSpy).toHaveBeenCalledWith("BannerStore: Failed to save dismissed banner IDs to localStorage", expect.any(Error));
      errorSpy.mockRestore(); // Clean up the spy
    });
  });
});
