import { logger } from '../lib/logger'; // Import the logger utility

// Define a type for the pipeline function for better type safety.
// This is an approximation of the actual pipeline function signature.
type EstimationPipeline = (text: string) => Promise<Array<{ label: string; score: number }>>;

// Cache for the loaded pipeline instance
let estimationPipelineInstance: EstimationPipeline | null = null;

// Global flag to indicate if the ML model is successfully loaded and can be used
let isMLModelActive: boolean = false;
// Global variable to store any error message if ML model failed to load or during inference
let mlModelErrorMessage: string | null = null;

// Constants for cost calculation. Exported for use in the frontend breakdown.
export const FLAT_RATE_PER_HOUR: number = 50; // Flat rate per hour in USD
export const HOURLY_AI_API_COST: number = 5; // Hourly cost for external AI API usage

/**
 * Detects if the current device is likely capable of running a resource-intensive ML model.
 * This is primarily based on user agent string to differentiate between desktop and mobile/tablet devices.
 *
 * @returns {boolean} True if the device is likely capable (e.g., not a mobile/tablet), false otherwise.
 */
export function detectDeviceCapability(): boolean {
  if (typeof navigator === 'undefined' || !navigator.userAgent) {
    // Assume capability in non-browser environments (e.g., server-side)
    return true;
  }
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /(ipad|tablet|playbook|kindle|silk)|(android(?!.*mobile))/i.test(userAgent);

  // A device is considered capable if it is not identified as mobile or tablet.
  return !isMobile && !isTablet;
}

/**
 * Lazily loads the transformers.js pipeline.
 * Caches it for subsequent calls.
 */
async function loadModelAndPipeline(): Promise<void> {
  // If the pipeline is already loaded, do nothing.
  if (estimationPipelineInstance) {
    return;
  }

  // Ensure this function only runs in a browser environment
  if (typeof window === 'undefined') {
    logger.warn('Skipping transformers.js model loading: Not in a browser environment.');
    isMLModelActive = false;
    mlModelErrorMessage = 'ML model not available on the server.';
    return;
  }

  try {
    // Dynamically import the pipeline factory from transformers.js
    const { pipeline } = await import('@xenova/transformers');

    logger.info('Attempting to load transformers.js pipeline...');
    // Create the pipeline. Transformers.js will handle the download and caching
    // of the model and tokenizer automatically.
    // Using a sentiment analysis model as a proxy for complexity, as per the original code.
    estimationPipelineInstance = await pipeline(
      'text-classification',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
    ) as EstimationPipeline;

    logger.info('Transformers.js pipeline loaded successfully.');
    isMLModelActive = true; // Mark the model as active
    mlModelErrorMessage = null; // Clear any previous errors
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to load transformers.js pipeline:', error);
    isMLModelActive = false; // Mark the model as inactive
    mlModelErrorMessage = `Failed to load ML model: ${errorMessage}`;
    estimationPipelineInstance = null; // Ensure the instance is null on failure
  }
}

/**
 * Estimates the project duration and calculates the cost based on the project description.
 * Uses the lazy-loaded transformers.js model with a fallback to a heuristic.
 *
 * @param description The project description string.
 * @returns An object containing estimatedDuration (in hours), calculatedCost,
 *          whether the ML model was used, and any associated error message.
 */
export async function getEstimatedDurationAndCost(description: string): Promise<{
  estimatedDuration: number;
  calculatedCost: number;
  modelUsed: boolean;
  modelErrorMessage: string | null;
}> {
  let estimatedDuration: number;
  let modelWasUsed: boolean = false;

  // Attempt to load the model and pipeline. This is a no-op if already loaded.
  await loadModelAndPipeline();

  const deviceIsCapable = detectDeviceCapability();

  if (isMLModelActive && deviceIsCapable && estimationPipelineInstance) {
    try {
      logger.info('Using transformers.js model for estimation...');
      const result = await estimationPipelineInstance(description);

      // This logic simulates duration from a sentiment model's output.
      // A dedicated regression model would directly output a duration.
      let modelOutputDuration: number | undefined;
      if (Array.isArray(result) && result.length > 0 && result[0]?.label) {
        const { label, score } = result[0];
        if (label === 'POSITIVE') { // Interpreted as "simple", "clear" -> shorter duration
          modelOutputDuration = 15 - score * 10; // Range: 5 to 15 hours
        } else if (label === 'NEGATIVE') { // Interpreted as "complex", "difficult" -> longer duration
          modelOutputDuration = 20 + score * 30; // Range: 20 to 50 hours
        }
      }

      if (typeof modelOutputDuration === 'number' && !isNaN(modelOutputDuration)) {
        estimatedDuration = Math.max(1, parseFloat(modelOutputDuration.toFixed(2)));
        logger.info(`Model estimated duration: ${estimatedDuration} hours.`);
        modelWasUsed = true;
        mlModelErrorMessage = null; // Clear any stale error messages
      } else {
        logger.warn('Model output was unexpected. Falling back to heuristic.');
        mlModelErrorMessage = 'Model output was invalid, using heuristic.';
        estimatedDuration = calculateHeuristicDuration(description);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error during model inference:', error);
      mlModelErrorMessage = `Model inference failed: ${errorMessage}`;
      estimatedDuration = calculateHeuristicDuration(description);
    }
  } else {
    // Determine the reason for not using the ML model and log it.
    let reason = 'Using heuristic for estimation...';
    if (!deviceIsCapable) {
      mlModelErrorMessage = 'Device not capable of running the ML model.';
    }
    // If mlModelErrorMessage is already set from a loading failure, it will be used.
    if (mlModelErrorMessage) {
      reason = `${mlModelErrorMessage} ${reason}`;
    }
    logger.warn(reason);
    estimatedDuration = calculateHeuristicDuration(description);
  }

  // Calculate the estimated cost based on the final duration.
  const calculatedCost =
    FLAT_RATE_PER_HOUR * estimatedDuration + HOURLY_AI_API_COST * estimatedDuration;

  return {
    estimatedDuration,
    calculatedCost,
    modelUsed: modelWasUsed,
    modelErrorMessage: modelWasUsed ? null : mlModelErrorMessage,
  };
}

/**
 * Calculates project duration using a simple heuristic based on word count and keywords.
 * @param description The project description string.
 * @returns Estimated duration in hours.
 */
function calculateHeuristicDuration(description: string): number {
  const words = description.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  let baseDuration = wordCount / 10; // Base heuristic: 1 hour per 10 words

  // Keyword-based adjustments (case-insensitive)
  const lowerDescription = description.toLowerCase();
  if (lowerDescription.includes('complex') || lowerDescription.includes('advanced')) baseDuration *= 2.0;
  if (lowerDescription.includes('simple') || lowerDescription.includes('basic')) baseDuration *= 0.6;
  if (lowerDescription.includes('large scale') || lowerDescription.includes('extensive')) baseDuration *= 2.2;
  if (lowerDescription.includes('small project') || lowerDescription.includes('minor')) baseDuration *= 0.7;
  if (lowerDescription.includes('prototype') || lowerDescription.includes('quick')) baseDuration *= 0.4;
  if (lowerDescription.includes('data science') || lowerDescription.includes('machine learning') || lowerDescription.includes('ai')) baseDuration *= 2.5;
  if (lowerDescription.includes('integration') || lowerDescription.includes('api')) baseDuration *= 1.5;

  return Math.max(2, parseFloat(baseDuration.toFixed(2))); // Ensure a minimum of 2 hours
}


/**
 * Returns the current status of the ML model.
 * @returns An object indicating if the model is active and any error message.
 */
export function getMLModelStatus(): { isActive: boolean; errorMessage: string | null } {
  return {
    isActive: isMLModelActive,
    errorMessage: mlModelErrorMessage,
  };
}

/**
 * Resets the internal state of the ML model for testing purposes.
 * @internal
 */
export function resetMLModelStatus(): void {
  estimationPipelineInstance = null;
  isMLModelActive = false;
  mlModelErrorMessage = null;
}
