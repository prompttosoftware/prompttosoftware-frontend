/**
 * Request body for adding ad credit.
 */
export interface AddAdCreditRequest {
  amount: number; // The amount of credit to add
  currency: string; // The currency of the credit (e.g., "usd")
  paymentMethodId?: string; // Optional: ID of a payment method to use
  description?: string; // Optional: description for the transaction
  idempotencyKey?: string; // Optional: A unique key to prevent duplicate transactions
}

/**
 * Response body for adding ad credit.
 */
export interface AdCreditResponse {
  newBalance: number; // The new ad credit balance after the transaction
  creditedAmount: number; // The amount that was successfully credited in this transaction
}



/**
 * Represents a basic Ad creative.
 */
export interface AdCreative {
  id: string;
  type: 'image' | 'video' | 'text'; // Type of ad creative
  url: string; // URL to the creative asset (image, video) or text content
  altText?: string; // Alt text for image, or description for video/text
}

/**
 * Represents an Ad targeting configuration.
 */
export interface AdTargeting {
  countries?: string[];
  languages?: string[];
  interests?: string[];
  genders?: ('male' | 'female' | 'other')[];
  minAge?: number;
  maxAge?: number;
}

/**
 * Represents a single Ad within the system.
 */
export interface Ad {
  id: string; // Unique ID for the ad
  campaignId: string; // ID of the campaign this ad belongs to
  name: string; // Name of the ad (for internal reference)
  creative: AdCreative; // The ad's creative content
  targetUrl: string; // The URL the user is directed to upon clicking the ad
  status: 'active' | 'paused' | 'archived' | 'pending_review' | 'rejected'; // Current status of the ad
  startDate: string; // ISO date string
  endDate?: string; // Optional: ISO date string for end of display
  budget: number; // Budget allocated for this specific ad
  currency: string; // Currency of the budget
  targeting?: AdTargeting; // Optional: Targeting criteria for the ad
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Request body for creating a new Ad.
 */
export interface CreateAdRequest {
  campaignId: string;
  name: string;
  creativeType: 'image' | 'video' | 'text';
  creativeUrl: string;
  creativeAltText?: string;
  targetUrl: string;
  startDate: string;
  endDate?: string;
  budget: number;
  currency: string;
  targeting?: AdTargeting;
}

/**
 * Response body for creating an Ad.
 */
export interface CreateAdResponse {
  ad: Ad;
}

/**
 * Request body for updating an existing Ad.
 */
export interface UpdateAdRequest {
  name?: string;
  creativeType?: 'image' | 'video' | 'text';
  creativeUrl?: string;
  creativeAltText?: string;
  targetUrl?: string;
  status?: 'active' | 'paused' | 'archived';
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  targeting?: AdTargeting;
}

/**
 * Represents an Ad Campaign.
 */
export interface AdCampaign {
  id: string; // Unique ID for the campaign
  name: string; // Name of the campaign
  status: 'active' | 'paused' | 'completed' | 'archived';
  budget: number; // Total budget for the campaign
  currency: string; // Currency of the budget
  startDate: string; // ISO date string
  endDate?: string; // Optional: ISO date string
  adIds: string[]; // List of Ad IDs belonging to this campaign
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Request body for creating a new Ad Campaign.
 */
export interface CreateAdCampaignRequest {
  name: string;
  budget: number;
  currency: string;
  startDate: string;
  endDate?: string;
}

/**
 * Response body for creating an Ad Campaign.
 */
export interface CreateAdCampaignResponse {
  campaign: AdCampaign;
}

/**
 * Request body for updating an existing Ad Campaign.
 */
export interface UpdateAdCampaignRequest {
  name?: string;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  budget?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Represents performance metrics for an ad or campaign.
 */
export interface AdPerformanceMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number; // Total amount spent
  currency: string;
  ctr: number; // Click-through rate (clicks / impressions)
  cpc: number; // Cost per click (spend / clicks)
  cpa: number; // Cost per acquisition/conversion (spend / conversions)
}

import { APIErrorResponse, isAPIErrorResponse } from './common';
