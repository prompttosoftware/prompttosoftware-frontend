import { logger } from '../lib/logger'; // Import the logger utility

// Define a type for the pipeline function for better type safety.
type EstimationPipeline = (
  text: string,
  options?: { topk: number },
) => Promise<Array<{ label: string; score: number }>>;

// --- 1. Centralized Constants for Calculations ---
// All magic numbers are moved here for easy configuration and maintenance.
const ESTIMATION_CONFIG = {
  // Costs
  RATES: {
    FLAT_RATE_PER_HOUR: 0.036 + 0.036 + 0.125, // Flat rate per hour in USD
    HOURLY_AI_API_COST: 0.5,  // Hourly cost for external AI API usage
  },
  // ML Model settings
  MODEL: {
    // This model outputs positive, neutral, and negative scores.
    NAME: 'Xenova/distilbert-base-multilingual-cased-sentiments-student',
    // We will combine these scores into a single value to estimate complexity.
    MIN_ESTIMATED_DURATION: 0.5,  // hours, for a purely positive (simple) project
    MAX_ESTIMATED_DURATION: 12, // hours, for a purely negative (complex) project
    // Weights to convert sentiment labels into a single complexity score.
    // Higher weight = simpler. Lower/negative weight = more complex.
    SENTIMENT_WEIGHTS: {
      positive: 1,
      neutral: 0,
      negative: -1,
    },
  },
  // Heuristic settings
  HEURISTICS: {
    // --- 3. More Extensive Heuristics ---
    BASE_WORDS_PER_HOUR: 20, // Base calculation: 1 hour for every 20 words
    MINIMUM_DURATION: 1,     // Minimum duration in hours for any project
    COMPLEXITY_KEYWORDS: {
      // Keywords that increase the complexity score
      'complex': 3, 'advanced': 3, 'intricate': 3, 'sophisticated': 3,
      'large scale': 4, 'enterprise': 4, 'extensive': 4,
      'data science': 5, 'machine learning': 5, 'ai': 5, 'neural network': 5,
      'integration': 2, 'api': 2, 'third-party': 2, 'database': 2, 'backend': 2,
      'security': 3, 'authentication': 3, 'encryption': 3,
      'real-time': 3, 'streaming': 3,
    },
    SIMPLICITY_KEYWORDS: {
      // Keywords that decrease the complexity score
      'simple': -3, 'basic': -3, 'easy': -3, 'straightforward': -3,
      'small project': -2, 'minor': -2, 'tweak': -2, 'adjustment': -2,
      'prototype': -4, 'quick': -4, 'poc': -4, 'proof of concept': -4,
      'static site': -3, 'landing page': -3,
    },
    // Score modifier for structural elements
    STRUCTURE_MODIFIERS: {
      BULLET_POINT_BONUS: 0.2, // Bonus for each bullet point found
    },
    // The final score is used to modify the base duration.
    // A score of 0 means no modification.
    // A positive score increases duration, negative decreases it.
    COMPLEXITY_MULTIPLIER: 0.1, // Each complexity point adjusts duration by 10%
  },
  DEVICE: {
    // Regex for detecting less capable devices
    MOBILE_REGEX: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
    TABLET_REGEX: /(ipad|tablet|playbook|kindle|silk)|(android(?!.*mobile))/i,
  },
};

// Export constants needed for frontend/other modules
export const FLAT_RATE_PER_HOUR: number = ESTIMATION_CONFIG.RATES.FLAT_RATE_PER_HOUR;
export const HOURLY_AI_API_COST: number = ESTIMATION_CONFIG.RATES.HOURLY_AI_API_COST;

// Cache for the loaded pipeline instance
let estimationPipelineInstance: EstimationPipeline | null = null;
let isMLModelActive: boolean = false;
let mlModelErrorMessage: string | null = null;

export function detectDeviceCapability(): boolean {
  if (typeof navigator === 'undefined' || !navigator.userAgent) {
    return true; // Assume capability in non-browser environments
  }
  const userAgent = navigator.userAgent;
  const isMobile = ESTIMATION_CONFIG.DEVICE.MOBILE_REGEX.test(userAgent);
  const isTablet = ESTIMATION_CONFIG.DEVICE.TABLET_REGEX.test(userAgent);
  return !isMobile && !isTablet;
}

async function loadModelAndPipeline(): Promise<void> {
  if (estimationPipelineInstance) {
    return;
  }
  if (typeof window === 'undefined') {
    isMLModelActive = false;
    mlModelErrorMessage = 'ML model not available on the server.';
    return;
  }
  try {
    const { pipeline } = await import('@xenova/transformers');
    logger.info(`Attempting to load ML model: ${ESTIMATION_CONFIG.MODEL.NAME}`);
    estimationPipelineInstance = await pipeline(
      'text-classification',
      ESTIMATION_CONFIG.MODEL.NAME,
    ) as EstimationPipeline;
    logger.info('Transformers.js pipeline loaded successfully.');
    isMLModelActive = true;
    mlModelErrorMessage = null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to load transformers.js pipeline:', error);
    isMLModelActive = false;
    mlModelErrorMessage = `Failed to load ML model: ${errorMessage}`;
    estimationPipelineInstance = null;
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

  await loadModelAndPipeline();

  const deviceIsCapable = detectDeviceCapability();

  if (isMLModelActive && deviceIsCapable && estimationPipelineInstance) {
    try {
      logger.info('Using transformers.js model for estimation...');
      // Request topk:3 to ensure we get scores for all three labels.
      const results = await estimationPipelineInstance(description, { topk: 3 });

      let modelOutputDuration: number | undefined;

      if (Array.isArray(results) && results.length > 0) {
        // --- 2. Corrected Gradient Calculation ---
        // Create a map of labels to scores for easy lookup.
        const scoreMap = new Map<string, number>();
        for (const res of results) {
          scoreMap.set(res.label, res.score);
        }

        // Calculate a single weighted sentiment score.
        // It will range from -1 (purely negative) to +1 (purely positive).
        const weightedScore =
          (scoreMap.get('positive') || 0) * ESTIMATION_CONFIG.MODEL.SENTIMENT_WEIGHTS.positive +
          (scoreMap.get('neutral')  || 0) * ESTIMATION_CONFIG.MODEL.SENTIMENT_WEIGHTS.neutral +
          (scoreMap.get('negative') || 0) * ESTIMATION_CONFIG.MODEL.SENTIMENT_WEIGHTS.negative;

        // Normalize this score into a "complexity" value from 0.0 to 1.0.
        // A weightedScore of +1 (simplest) should map to complexity 0.
        // A weightedScore of -1 (most complex) should map to complexity 1.
        const complexity = (1 - weightedScore) / 2;

        const { MIN_ESTIMATED_DURATION, MAX_ESTIMATED_DURATION } = ESTIMATION_CONFIG.MODEL;
        
        // Interpolate the duration based on the calculated complexity.
        modelOutputDuration = MIN_ESTIMATED_DURATION + complexity * (MAX_ESTIMATED_DURATION - MIN_ESTIMATED_DURATION);
      }

      if (typeof modelOutputDuration === 'number') {
        estimatedDuration = parseFloat(modelOutputDuration.toFixed(2));
        logger.info(`Model estimated duration: ${estimatedDuration} hours based on complexity score.`);
        modelWasUsed = true;
        mlModelErrorMessage = null;
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
    if (!deviceIsCapable) {
      mlModelErrorMessage = 'Device not capable of running the ML model.';
    }
    logger.warn(`${mlModelErrorMessage || 'ML model not loaded.'} Using heuristic for estimation...`);
    estimatedDuration = calculateHeuristicDuration(description);
  }

  const cost =
    FLAT_RATE_PER_HOUR * estimatedDuration + HOURLY_AI_API_COST * estimatedDuration;

  return {
    estimatedDuration,
    calculatedCost: parseFloat(cost.toFixed(2)),
    modelUsed: modelWasUsed,
    modelErrorMessage: modelWasUsed ? null : mlModelErrorMessage,
  };
}

/**
 * --- 3. More Extensive Heuristics Function ---
 * Calculates project duration using a more robust heuristic based on word count,
 * a keyword-based complexity score, and structural analysis.
 * @param description The project description string.
 * @returns Estimated duration in hours.
 */
function calculateHeuristicDuration(description: string): number {
  if (!description || description.trim() === '') {
    return ESTIMATION_CONFIG.HEURISTICS.MINIMUM_DURATION;
  }

  const lowerDescription = description.toLowerCase();
  const words = lowerDescription.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Calculate base duration from word count
  let baseDuration = wordCount / ESTIMATION_CONFIG.HEURISTICS.BASE_WORDS_PER_HOUR;

  // 2. Calculate a "complexity score"
  let complexityScore = 0;

  // Add points for complexity keywords
  for (const [keyword, score] of Object.entries(ESTIMATION_CONFIG.HEURISTICS.COMPLEXITY_KEYWORDS)) {
    if (lowerDescription.includes(keyword)) {
      complexityScore += score;
    }
  }

  // Subtract points for simplicity keywords
  for (const [keyword, score] of Object.entries(ESTIMATION_CONFIG.HEURISTICS.SIMPLICITY_KEYWORDS)) {
    if (lowerDescription.includes(keyword)) {
      complexityScore += score;
    }
  }

  // Add points for structural elements like bullet points/lists
  const bulletPointCount = (description.match(/^(\s*(\*|-)\s+.*)/gm) || []).length;
  complexityScore += bulletPointCount * ESTIMATION_CONFIG.HEURISTICS.STRUCTURE_MODIFIERS.BULLET_POINT_BONUS;

  // 3. Apply the complexity score to the base duration
  const complexityFactor = 1 + (complexityScore * ESTIMATION_CONFIG.HEURISTICS.COMPLEXITY_MULTIPLIER);
  const finalDuration = baseDuration * Math.max(0.1, complexityFactor); // Ensure factor is not zero or negative

  // 4. Return the final duration, ensuring it meets the minimum
  return Math.max(ESTIMATION_CONFIG.HEURISTICS.MINIMUM_DURATION, parseFloat(finalDuration.toFixed(2)));
}

export function getMLModelStatus(): { isActive: boolean; errorMessage: string | null } {
  return {
    isActive: isMLModelActive,
    errorMessage: mlModelErrorMessage,
  };
}

export function resetMLModelStatus(): void {
  estimationPipelineInstance = null;
  isMLModelActive = false;
  mlModelErrorMessage = null;
}
