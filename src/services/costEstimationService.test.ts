import {
  getEstimatedDurationAndCost,
  detectDeviceCapability,
  FLAT_RATE_PER_HOUR,
  HOURLY_AI_API_COST,
  resetMLModelStatus,
} from './costEstimationService';

// Import the mocked modules directly for manipulation
import { pipeline, AutoModelForSequenceClassification, AutoTokenizer } from '@xenova/transformers';

// Mock logger utility to prevent console output during tests
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('costEstimationService', () => {
  let originalWindow: Window & typeof globalThis;

  beforeAll(() => {
    originalWindow = window;
    // Set up a default mock for window.isDeviceCapable for tests that don't specifically override it
    Object.defineProperty(window, 'isDeviceCapable', {
      writable: true,
      value: jest.fn(() => true), // Default to capable
    });
    // Ensure window.estimationPipeline is clean before each test
    Object.defineProperty(window, 'estimationPipeline', {
      writable: true,
      value: undefined,
    });
  });

  // Moved resetMLModelStatus to beforeEach to ensure clean service state before each test.
  // jest.clearAllMocks() in afterEach is sufficient for clearing mocks.
  beforeEach(() => {
    resetMLModelStatus();
    // Reset window properties to original if modified before each test for consistency
    Object.defineProperty(window, 'isDeviceCapable', {
      writable: true,
      value: jest.fn(() => true), // Reset to default capable
    });
    Object.defineProperty(window, 'estimationPipeline', {
      writable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    // Reset mocks after each test to ensure isolation
    jest.clearAllMocks();
  });

  describe('detectDeviceCapability', () => {
    const userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get');

    it('should return true for desktop user agents', () => {
      userAgentGetter.mockReturnValue(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      );
      expect(detectDeviceCapability()).toBe(true);
    });

    it('should return false for mobile user agents', () => {
      userAgentGetter.mockReturnValue(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      );
      expect(detectDeviceCapability()).toBe(false);
    });

    it('should return false for tablet user agents', () => {
      userAgentGetter.mockReturnValue(
        'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/94.0.4606.88 Mobile/15E148 Safari/604.1',
      );
      expect(detectDeviceCapability()).toBe(false);
    });

    it('should return true if navigator is undefined (e.g., SSR)', () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        enumerable: true,
        configurable: true,
        value: undefined,
      });
      expect(detectDeviceCapability()).toBe(true);
      Object.defineProperty(global, 'navigator', {
        enumerable: true,
        configurable: true,
        value: originalNavigator,
      });
    });
  });

  describe('cost calculation logic', () => {
    // Add beforeEach here for proper model loading mocks
    beforeEach(() => {
      AutoModelForSequenceClassification.from_pretrained.mockImplementation(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementation(() => Promise.resolve({}));
      // Set a default mock for pipeline that can be overridden by individual tests
      (pipeline as jest.Mock).mockImplementation(() =>
        Promise.resolve(jest.fn(async (text: string) => [{ label: 'UNKNOWN', score: 0.5 }])),
      );
    });
    it('should calculate cost correctly for a given duration', async () => {
      // Mock ML model to return a predictable duration
      // The `pipeline` mock returns a function that will be `estimationPipelineInstance`.
      // We need to set the implementation of that *returned function*.
      const mockInferenceFunction = jest.fn(async (text) => {
        return Promise.resolve([{ label: 'POSITIVE', score: 0.5 }]);
      });
      (pipeline as jest.Mock).mockImplementation(() => Promise.resolve(mockInferenceFunction));

      // Expected duration based on the mock output (15 - (0.5 * 10)) = 10
      const expectedDuration = 10;
      const expectedCost =
        FLAT_RATE_PER_HOUR * expectedDuration + HOURLY_AI_API_COST * expectedDuration;

      const { estimatedDuration, calculatedCost, modelUsed } = await getEstimatedDurationAndCost(
        'Test project description',
      );

      expect(modelUsed).toBe(true);
      expect(estimatedDuration).toBeCloseTo(expectedDuration);
      expect(calculatedCost).toBeCloseTo(expectedCost);
      expect(pipeline).toHaveBeenCalled();
      expect(mockInferenceFunction).toHaveBeenCalledWith('Test project description');
    });

    it('should correctly calculate cost for various completion times', async () => {
      // Test 1: Short duration (simulated)
      const mockInferenceFunction1 = jest.fn(async (text) => {
        return Promise.resolve([{ label: 'POSITIVE', score: 0.9 }]); // Shorter: 15 - 9 = 6 hours
      });
      // Re-mock the pipeline's returned function for this specific test case
      (pipeline as jest.Mock).mockImplementation(() => Promise.resolve(mockInferenceFunction1));
      const description1 = 'Short project';
      let result = await getEstimatedDurationAndCost(description1);
      expect(result.estimatedDuration).toBeCloseTo(6);
      expect(result.calculatedCost).toBeCloseTo((FLAT_RATE_PER_HOUR + HOURLY_AI_API_COST) * 6);
      expect(mockInferenceFunction1).toHaveBeenCalledWith(description1);

      resetMLModelStatus(); // Reset service state to force model reload for next test case

      // Test 2: Longer duration (simulated)
      const mockInferenceFunction2 = jest.fn(async (text) => {
        return Promise.resolve([{ label: 'NEGATIVE', score: 0.8 }]); // Longer: 20 + 24 = 44 hours
      });
      (pipeline as jest.Mock).mockImplementation(() => Promise.resolve(mockInferenceFunction2));
      const description2 = 'Very complex and long project description';
      result = await getEstimatedDurationAndCost(description2);
      expect(result.estimatedDuration).toBeCloseTo(44);
      expect(result.calculatedCost).toBeCloseTo((FLAT_RATE_PER_HOUR + HOURLY_AI_API_COST) * 44);
      expect(mockInferenceFunction2).toHaveBeenCalledWith(description2);

      resetMLModelStatus(); // Reset service state to force model reload for next test case

      // Test 3: Min duration (ML output below 1, but floored at 1, then at 2 by heuristic)
      const mockInferenceFunction3 = jest.fn(async (text) => {
        return Promise.resolve([{ label: 'POSITIVE', score: 0.99 }]); // Should be very short, like 15 - 9.9 = 5.1 hours
      });
      (pipeline as jest.Mock).mockImplementation(() => Promise.resolve(mockInferenceFunction3));
      const description3 = 'minimal project';
      result = await getEstimatedDurationAndCost(description3);
      expect(result.estimatedDuration).toBeCloseTo(5.1);
      expect(result.calculatedCost).toBeCloseTo((FLAT_RATE_PER_HOUR + HOURLY_AI_API_COST) * 5.1);
      expect(mockInferenceFunction3).toHaveBeenCalledWith(description3);
    });
  });

  describe('fallback heuristic for duration estimation', () => {
    // No beforeEach here. Each test will set its own specific mock conditions.
    // This ensures that model loading behaves as expected unless explicitly mocked to fail
    // for a specific test case within this suite that needs it to fail.

    it('should use heuristic if ML model fails to load', async () => {
      // Intentionally mock the from_pretrained to reject, simulating a load failure
      AutoModelForSequenceClassification.from_pretrained.mockImplementation(() => {
        return Promise.reject(new Error('Simulated model loading error'));
      });
      // Ensure tokenizer also rejects to simulate full load failure
      AutoTokenizer.from_pretrained.mockImplementation(() => {
        return Promise.reject(new Error('Simulated tokenizer loading error'));
      });
      // Mock pipeline to always return a resolved promise of a mock function
      // this is important because loadModelAndPipeline sets estimationPipelineInstance based on it
      // if from_pretrained calls resolve, but if from_pretrained calls fail, it won't be called.
      const mockInferenceFunction = jest.fn(() => Promise.resolve([]));
      (pipeline as jest.Mock).mockImplementation(() => Promise.resolve(mockInferenceFunction));

      const description = 'A simple project description for testing fallback.';
      const { estimatedDuration, calculatedCost, modelUsed, modelErrorMessage } =
        await getEstimatedDurationAndCost(description);

      expect(modelUsed).toBe(false);
      expect(modelErrorMessage).toContain('Failed to load ML model');
      expect(estimatedDuration).toBeGreaterThan(0); // Should be a heuristic value
      const expectedHeuristicCost = (FLAT_RATE_PER_HOUR + HOURLY_AI_API_COST) * estimatedDuration;
      expect(calculatedCost).toBeCloseTo(expectedHeuristicCost);

      expect(AutoModelForSequenceClassification.from_pretrained).toHaveBeenCalledTimes(1);
      expect(mockInferenceFunction).not.toHaveBeenCalled(); // Pipeline inference should not be called if model load fails
    });

    it('should use heuristic if device is not capable', async () => {
      // Override the beforeEach here: device is incapable
      Object.defineProperty(window, 'isDeviceCapable', {
        writable: true,
        value: jest.fn(() => false),
      });

      // For this test, we want to ensure pipeline *would* load successfully but isn't used
      AutoModelForSequenceClassification.from_pretrained.mockImplementationOnce(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementationOnce(() => Promise.resolve({}));
      const mockInferenceFunction = jest.fn(async () =>
        Promise.resolve([{ label: 'POSITIVE', score: 0.7 }]),
      );
      pipeline.mockImplementation(() => Promise.resolve(mockInferenceFunction)); // Pipeline successfully created

      const description = 'A project for mobile device, forcing fallback.';
      const { estimatedDuration, calculatedCost, modelUsed, modelErrorMessage } =
        await getEstimatedDurationAndCost(description);

      expect(modelUsed).toBe(false);
      expect(modelErrorMessage).toContain('Device not capable.');
      expect(estimatedDuration).toBeGreaterThan(0); // Should be a heuristic value
      const expectedHeuristicCost = (FLAT_RATE_PER_HOUR + HOURLY_AI_API_COST) * estimatedDuration;
      expect(calculatedCost).toBeCloseTo(expectedHeuristicCost);

      // Verify that the model loading functions were called, and pipeline instance was created,
      // but its *inference* (mockInferenceFunction) was not called
      expect(AutoModelForSequenceClassification.from_pretrained).toHaveBeenCalledTimes(1);
      expect(pipeline).toHaveBeenCalledTimes(1);
      expect(mockInferenceFunction).not.toHaveBeenCalled();
    });

    it('should use heuristic if ML model inference fails', async () => {
      // Ensure model loads, but inference fails
      AutoModelForSequenceClassification.from_pretrained.mockImplementationOnce(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementationOnce(() => Promise.resolve({}));
      const mockInferenceFunction = jest.fn(async () => {
        throw new Error('Simulated inference error');
      });
      pipeline.mockImplementation(() => Promise.resolve(mockInferenceFunction));

      const description = 'A project that causes model inference error.';
      const { estimatedDuration, calculatedCost, modelUsed, modelErrorMessage } =
        await getEstimatedDurationAndCost(description);

      expect(modelUsed).toBe(false);
      expect(modelErrorMessage).toContain('Model inference failed:');
      expect(estimatedDuration).toBeGreaterThan(0); // Should be a heuristic value
      const expectedHeuristicCost = (FLAT_RATE_PER_HOUR + HOURLY_AI_API_COST) * estimatedDuration;
      expect(calculatedCost).toBeCloseTo(expectedHeuristicCost);

      expect(mockInferenceFunction).toHaveBeenCalledWith(description); // Inference was attempted
    });

    it('should use heuristic if ML model output is invalid', async () => {
      // Ensure model loads, but returns invalid output
      AutoModelForSequenceClassification.from_pretrained.mockImplementationOnce(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementationOnce(() => Promise.resolve({}));
      const mockInferenceFunction = jest.fn(async (text) => Promise.resolve([])); // Empty array
      pipeline.mockImplementation(() => Promise.resolve(mockInferenceFunction));

      const { estimatedDuration, modelUsed, modelErrorMessage } =
        await getEstimatedDurationAndCost('Invalid output test');
      expect(modelUsed).toBe(false);
      expect(modelErrorMessage).toContain('Model output was unexpected, fell back to heuristic.');
      expect(estimatedDuration).toBeGreaterThan(0); // Falls back to heuristic
      expect(mockInferenceFunction).toHaveBeenCalledWith('Invalid output test');
    });

    it('should provide reasonable estimations for short project descriptions', async () => {
      const description = 'Simple homepage.';
      // Ensure fallback by forcing device to be incapable
      Object.defineProperty(window, 'isDeviceCapable', {
        writable: true,
        value: jest.fn(() => false),
      }); // Override beforeEach
      // Ensure model loading would succeed, but capability check fails
      AutoModelForSequenceClassification.from_pretrained.mockImplementationOnce(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementationOnce(() => Promise.resolve({}));
      pipeline.mockImplementation(() =>
        Promise.resolve(jest.fn(() => Promise.resolve([{ label: 'POSITIVE', score: 0.5 }]))),
      ); // Fix: return Promise.resolve(jest.fn(...))

      const { estimatedDuration, modelUsed } = await getEstimatedDurationAndCost(description);
      expect(modelUsed).toBe(false);
      expect(estimatedDuration).toBeGreaterThanOrEqual(2); // Minimum 2 hours
      expect(estimatedDuration).toBeLessThan(10); // Should be relatively short
    });

    it('should provide reasonable estimations for long project descriptions', async () => {
      const description =
        'Develop a full-stack, enterprise-level e-commerce platform with microservices architecture, integrated payment gateways, user authentication, inventory management, and a comprehensive admin dashboard. Includes advanced search, recommendation engine, and real-time analytics. Requires extensive API integrations with third-party logistics and CRM systems. This will be a large scale, complex project.';
      // Ensure fallback by forcing device to be incapable
      Object.defineProperty(window, 'isDeviceCapable', {
        writable: true,
        value: jest.fn(() => false),
      }); // Override beforeEach
      // Ensure model loading would succeed, but capability check fails
      AutoModelForSequenceClassification.from_pretrained.mockImplementationOnce(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementationOnce(() => Promise.resolve({}));
      pipeline.mockImplementation(() =>
        Promise.resolve(jest.fn(() => Promise.resolve([{ label: 'POSITIVE', score: 0.5 }]))),
      ); // Fix: return Promise.resolve(jest.fn(...))

      const { estimatedDuration, modelUsed } = await getEstimatedDurationAndCost(description);
      expect(modelUsed).toBe(false);
      expect(estimatedDuration).toBeGreaterThan(30); // Should be a long project
    });

    it('should adjust estimation based on "complex" keyword', async () => {
      const simpleDesc = 'A simple blog website.';
      const complexDesc = 'A complex AI-powered data analysis platform.';
      // Ensure fallback by forcing device to be incapable
      Object.defineProperty(window, 'isDeviceCapable', {
        writable: true,
        value: jest.fn(() => false),
      }); // Override beforeEach
      // Ensure model loading would succeed, but capability check fails
      AutoModelForSequenceClassification.from_pretrained.mockImplementationOnce(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementationOnce(() => Promise.resolve({}));
      pipeline.mockImplementation(() =>
        Promise.resolve(jest.fn(() => Promise.resolve([{ label: 'POSITIVE', score: 0.5 }]))),
      ); // Fix: return Promise.resolve(jest.fn(...))

      const simpleResult = await getEstimatedDurationAndCost(simpleDesc);
      const complexResult = await getEstimatedDurationAndCost(complexDesc);

      expect(complexResult.estimatedDuration).toBeGreaterThan(simpleResult.estimatedDuration);
    });

    it('should adjust estimation based on "simple" keyword', async () => {
      const complexDesc = 'A complex AI-powered data analysis platform.';
      const simpleDesc = 'A simple blog website.';
      // Ensure fallback by forcing device to be incapable
      Object.defineProperty(window, 'isDeviceCapable', {
        writable: true,
        value: jest.fn(() => false),
      }); // Override beforeEach
      // Ensure model loading would succeed, but capability check fails
      AutoModelForSequenceClassification.from_pretrained.mockImplementationOnce(() =>
        Promise.resolve({}),
      );
      AutoTokenizer.from_pretrained.mockImplementationOnce(() => Promise.resolve({}));
      pipeline.mockImplementation(() =>
        Promise.resolve(jest.fn(() => Promise.resolve([{ label: 'POSITIVE', score: 0.5 }]))),
      ); // Fix: return Promise.resolve(jest.fn(...))

      const complexResult = await getEstimatedDurationAndCost(complexDesc);
      const simpleResult = await getEstimatedDurationAndCost(simpleDesc);

      expect(simpleResult.estimatedDuration).toBeLessThan(complexResult.estimatedDuration);
    });
  });
});
