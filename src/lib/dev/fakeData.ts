import { UserProfile } from '@/types/auth';
import { SavedCard } from '@/types/payments';
import { Model, Project } from '@/types/project';

const commonModels = {
  utility: [{ provider: 'openai', model: 'gpt-3.5-turbo' } as Model],
  low: [{ provider: 'openai', model: 'gpt-4o' } as Model],
  medium: [{ provider: 'anthropic', model: 'claude-3-sonnet' } as Model],
  high: [{ provider: 'openai', model: 'gpt-4-turbo' } as Model],
  super: [{ provider: 'openai', model: 'gpt-4o' } as Model],
  backup: [{ provider: 'deepseek', model: 'deepseek-7b' } as Model],
};

// A reusable set of fake projects for development mode.
// You can add more variety here to test different UI states.
export const FAKE_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'E-commerce AI Assistant',
    status: 'in_progress',
    desiredStatus: 'completed',
    ownerId: 'user_1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    cost: 23.45,
    elapsedTime: 9000,
    completeIssues: 8,
    incompleteIssues: 2,
    description: 'AI system assisting with product listing and customer support.',
    stars: 58,
    repositories: [
      { type: 'existing', url: 'https://github.com/example/ecommerce-ai' },
      { type: 'existing', url: 'https://github.com/example/ecommerce-ai-backend' },
    ],
    lastError: '',
    pendingSensitiveRequest: null,
    history: [
      {
        id: 'hist_1',
        projectId: 'proj_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        sender: 'user',
        type: 'status_update',
        content: 'Started initial deployment',
      },
      {
        id: 'hist_2',
        projectId: 'proj_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        sender: 'agent',
        type: 'message',
        content: 'Deployment succeeded. Preparing tasks.',
      },
      {
        id: 'hist_3',
        projectId: 'proj_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        sender: 'system',
        type: 'cost_update',
        content: 'Cost updated: $23.45',
      },
    ],
    models: commonModels,
    installations: [
      { ecosystem: 'npm', name: 'openai' },
      { ecosystem: 'docker', name: 'node:18' },
    ],
  },
  {
    id: 'proj_2',
    name: 'Slack Finance Bot',
    status: 'starting',
    desiredStatus: 'in_progress',
    ownerId: 'user_2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    cost: 0.45,
    elapsedTime: 180,
    completeIssues: 1,
    incompleteIssues: 3,
    description: 'Bot that summarizes financial metrics in Slack.',
    stars: 9,
    repositories: [{ type: 'new', name: 'finance-bot', isPrivate: true }],
    lastError: '',
    pendingSensitiveRequest: null,
    history: [
      {
        id: 'hist_4',
        projectId: 'proj_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        sender: 'user',
        type: 'status_update',
        content: 'Created project and configured secrets.',
      },
      {
        id: 'hist_5',
        projectId: 'proj_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        sender: 'system',
        type: 'system_event',
        content: 'Container image is being pulled.',
      },
    ],
    models: {
      ...commonModels,
      high: [{ provider: 'anthropic', model: 'claude-3-opus' }],
    },
    installations: [
      { ecosystem: 'pip', name: 'slack_sdk' },
      { ecosystem: 'docker', name: 'python:3.11' },
    ],
  },
  {
    id: 'proj_3',
    name: 'Video Transcoder',
    status: 'stopping',
    desiredStatus: 'completed',
    ownerId: 'user_3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    cost: 7.2,
    elapsedTime: 10800,
    completeIssues: 11,
    incompleteIssues: 1,
    description: 'Converts video formats using FFMPEG pipeline.',
    stars: 34,
    repositories: [{ type: 'existing', url: 'https://github.com/example/video-transcoder' }],
    lastError: '',
    pendingSensitiveRequest: null,
    history: [
      {
        id: 'hist_6',
        projectId: 'proj_3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        sender: 'user',
        type: 'message',
        content: 'Run completed. Preparing to stop.',
      },
      {
        id: 'hist_7',
        projectId: 'proj_3',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        sender: 'system',
        type: 'status_update',
        content: 'Shutting down resources.',
      },
    ],
    models: commonModels,
    installations: [
      { ecosystem: 'docker', name: 'ffmpeg' },
      { ecosystem: 'npm', name: 'fluent-ffmpeg' },
    ],
  },
  {
    id: 'proj_4',
    name: 'Resume Parser API',
    status: 'completed',
    desiredStatus: 'completed',
    ownerId: 'user_4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    cost: 18.0,
    elapsedTime: 20000,
    completeIssues: 20,
    incompleteIssues: 0,
    description: 'Extracts structured data from uploaded resumes.',
    stars: 112,
    repositories: [{ type: 'existing', url: 'https://github.com/example/resume-parser' }],
    lastError: '',
    pendingSensitiveRequest: null,
    history: [
      {
        id: 'hist_8',
        projectId: 'proj_4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
        sender: 'user',
        type: 'message',
        content: 'Completed QA testing.',
      },
      {
        id: 'hist_9',
        projectId: 'proj_4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        sender: 'system',
        type: 'status_update',
        content: 'Marked project as completed.',
      },
    ],
    models: {
      ...commonModels,
      utility: [{ provider: 'openrouter', model: 'command-r+' }],
    },
    installations: [
      { ecosystem: 'pip', name: 'pdfminer.six' },
      { ecosystem: 'pip', name: 'spacy' },
    ],
  },
  {
    id: 'proj_5',
    name: 'HR Metrics Dashboard',
    status: 'failed',
    desiredStatus: 'completed',
    ownerId: 'user_5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    cost: 4.75,
    elapsedTime: 4000,
    completeIssues: 6,
    incompleteIssues: 5,
    description: 'Visual dashboard of team performance and growth.',
    stars: 21,
    repositories: [{ type: 'new', name: 'hr-dashboard', isPrivate: false }],
    lastError: 'Build step failed due to missing env variable.',
    pendingSensitiveRequest: null,
    history: [
      {
        id: 'hist_10',
        projectId: 'proj_5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        sender: 'system',
        type: 'system_event',
        content: 'Deployment triggered.',
      },
      {
        id: 'hist_11',
        projectId: 'proj_5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        sender: 'system',
        type: 'status_update',
        content: 'Build failed: Missing env var `DB_URL`',
      },
    ],
    models: commonModels,
    installations: [
      { ecosystem: 'npm', name: 'react' },
      { ecosystem: 'npm', name: 'chart.js' },
    ],
  },
  {
    id: 'proj_6',
    name: 'DevOps Onboarding Agent',
    status: 'pending',
    desiredStatus: 'in_progress',
    ownerId: 'user_6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cost: 0,
    elapsedTime: 0,
    completeIssues: 0,
    incompleteIssues: 2,
    description: 'Guides new engineers through dev setup with automation.',
    stars: 0,
    repositories: [{ type: 'new', name: 'onboarding-agent', isPrivate: true }],
    lastError: '',
    pendingSensitiveRequest: null,
    history: [
      {
        id: 'hist_12',
        projectId: 'proj_6',
        timestamp: new Date().toISOString(),
        sender: 'user',
        type: 'sensitive_request',
        content: 'Requested access to internal Slack workspace.',
      },
    ],
    models: commonModels,
    installations: [
      { ecosystem: 'pip', name: 'pyyaml' },
      { ecosystem: 'npm', name: 'dotenv' },
    ],
  },
];

export const FAKE_USER: UserProfile = {
  _id: 'test-user-id',
  email: 'dev-user@prompttosoftware.io',
  name: 'devuser',
  avatarUrl: '/avatar.png',
  isNewUser: true,
  balance: 100.00,
  role: 'user',
  integrations: {
    jira: { isLinked: false },
  },
  apiKeys: [
    { provider: 'OPENAI', api_key: 'sk-xxxxxx' },
    { provider: 'GOOGLE', api_key: 'AIzaSyxxxxxx' },
  ],
  starredProjects: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

import { ProjectSummary } from '@/types/project';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transactions';

const baseModels = {
  utility: [{ provider: 'openai', model: 'gpt-3.5-turbo' } as Model],
  low: [{ provider: 'openai', model: 'gpt-4o' } as Model],
  medium: [{ provider: 'anthropic', model: 'claude-3-sonnet' } as Model],
  high: [{ provider: 'openai', model: 'gpt-4-turbo' } as Model],
  super: [{ provider: 'openai', model: 'gpt-4o' } as Model],
  backup: [{ provider: 'deepseek', model: 'deepseek-7b' } as Model],
};

export const FAKE_EXPLORE_PROJECTS: ProjectSummary[] = [
  {
    id: 'explore_proj_1',
    name: 'AI Marketing Assistant',
    status: 'completed',
    stars: 144,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    incompleteIssues: 1,
    completeIssues: 17,
    repositories: [{ type: 'existing', url: 'https://github.com/example/ai-marketing' }],
    user: { _id: 'creator_1', name: 'Jess Wang', avatarUrl: '/avatars/jess.png' },
    starredByCurrentUser: true,
    models: baseModels,
  },
  {
    id: 'explore_proj_2',
    name: 'Smart Meeting Notes',
    status: 'in_progress',
    stars: 67,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    incompleteIssues: 2,
    completeIssues: 10,
    repositories: [
      { type: 'existing', url: 'https://github.com/example/meeting-notes' },
      { type: 'new', name: 'meeting-ai-backend', isPrivate: false },
    ],
    user: { _id: 'creator_2', name: 'Leo Tran', avatarUrl: '/avatars/leo.png' },
    starredByCurrentUser: false,
    models: {
      ...baseModels,
      high: [{ provider: 'anthropic', model: 'claude-3-opus' }],
      medium: [
        { provider: 'anthropic', model: 'claude-3-opus' },
        { provider: 'openai', model: 'chatgpt-o' },
        { provider: 'deepseek', model: 'r1-reasoner' },
        { provider: 'anthropic', model: 'claude-3-opus' },
      ]
    },
  },
  {
    id: 'explore_proj_3',
    name: 'Code Review Agent',
    status: 'in_progress',
    stars: 93,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    incompleteIssues: 4,
    completeIssues: 9,
    repositories: [{ type: 'existing', url: 'https://github.com/example/code-review-agent' }],
    user: { _id: 'creator_3', name: 'Riya Patel', avatarUrl: '/avatars/riya.png' },
    starredByCurrentUser: false,
    models: {
      ...baseModels,
      utility: [{ provider: 'openrouter', model: 'llama-3-8b' }],
    },
  },
  {
    id: 'explore_proj_4',
    name: 'Personalized Learning Agent',
    status: 'in_progress',
    stars: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // recent
    updatedAt: new Date().toISOString(),
    incompleteIssues: 3,
    completeIssues: 1,
    repositories: [{ type: 'existing', url: 'https://github.com/example/learning-agent' }],
    user: { _id: 'creator_4', name: 'Ana Díaz', avatarUrl: '/avatars/ana.png' },
    starredByCurrentUser: false,
    models: baseModels,
  },
  {
    id: 'explore_proj_5',
    name: 'Resume Screener',
    status: 'completed',
    stars: 112,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    incompleteIssues: 0,
    completeIssues: 25,
    repositories: [{ type: 'existing', url: 'https://github.com/example/resume-screener' }],
    user: { _id: 'creator_5', name: 'Imran Noor', avatarUrl: '/avatars/imran.png' },
    starredByCurrentUser: false,
    models: {
      ...baseModels,
      medium: [{ provider: 'openrouter', model: 'command-r+' }],
    },
  },
  {
    id: 'explore_proj_6',
    name: 'Video Summarization Tool',
    status: 'failed',
    stars: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    incompleteIssues: 6,
    completeIssues: 4,
    repositories: [{ type: 'existing', url: 'https://github.com/example/video-summary' }],
    user: { _id: 'creator_6', name: 'Mei Lin', avatarUrl: '/avatars/mei.png' },
    starredByCurrentUser: true,
    models: baseModels,
  },
  {
    id: 'explore_proj_7',
    name: 'Crypto Market Tracker',
    status: 'completed',
    stars: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // recent
    updatedAt: new Date().toISOString(),
    incompleteIssues: 1,
    completeIssues: 0,
    repositories: [{ type: 'existing', url: 'https://github.com/example/crypto-tracker' }],
    user: { _id: 'creator_7', name: 'Sam Gold', avatarUrl: '/avatars/sam.png' },
    starredByCurrentUser: false,
    models: {
      ...baseModels,
      backup: [{ provider: 'google', model: 'gemini-pro' }],
      medium: [
        { provider: 'google', model: 'gemini-flash-lite' },
        { provider: 'openai', model: 'chatgpt-o' },
        { provider: 'openrouter', model: 'r1-reasoner' },
      ]
    },
  },
  {
    id: 'explore_proj_8',
    name: 'Legal Document Analyzer',
    status: 'completed',
    stars: 58,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    incompleteIssues: 0,
    completeIssues: 14,
    repositories: [{ type: 'existing', url: 'https://github.com/example/legal-analyzer' }],
    user: { _id: 'creator_8', name: 'Aisha Ali', avatarUrl: '/avatars/aisha.png' },
    starredByCurrentUser: false,
    models: baseModels,
  },
  {
    id: 'explore_proj_9',
    name: 'Onboarding Buddy',
    status: 'starting',
    stars: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // recent
    updatedAt: new Date().toISOString(),
    incompleteIssues: 2,
    completeIssues: 0,
    repositories: [{ type: 'new', name: 'onboarding-buddy', isPrivate: false }],
    user: { _id: 'creator_9', name: 'Chris Nolan', avatarUrl: '/avatars/chris.png' },
    starredByCurrentUser: false,
    models: {
      ...baseModels,
      super: [{ provider: 'openai', model: 'gpt-4-turbo' }],
    },
  },
  {
    id: 'explore_proj_10',
    name: 'Fitness Goal Tracker',
    status: 'in_progress',
    stars: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    incompleteIssues: 5,
    completeIssues: 2,
    repositories: [{ type: 'existing', url: 'https://github.com/example/fitness-tracker' }],
    user: { _id: 'creator_10', name: 'Erin Matthews', avatarUrl: '/avatars/erin.png' },
    starredByCurrentUser: false,
    models: baseModels,
  },
  {
    id: 'explore_proj_11',
    name: 'Podcast Summarizer',
    status: 'completed',
    stars: 18,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    incompleteIssues: 1,
    completeIssues: 12,
    repositories: [{ type: 'existing', url: 'https://github.com/example/podcast-summarizer' }],
    user: { _id: 'creator_11', name: 'Luca Romano', avatarUrl: '/avatars/luca.png' },
    starredByCurrentUser: false,
    models: {
      ...baseModels,
      utility: [{ provider: 'deepseek', model: 'deepseek-7b' }],
      medium: [
        { provider: 'anthropic', model: 'claude-3-opus' },
        { provider: 'openai', model: 'chatgpt-o' },
      ]
    },
  },
  {
    id: 'explore_proj_12',
    name: 'Travel Recommendation Engine',
    status: 'in_progress',
    stars: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // recent
    updatedAt: new Date().toISOString(),
    incompleteIssues: 3,
    completeIssues: 3,
    repositories: [{ type: 'existing', url: 'https://github.com/example/travel-recommender' }],
    user: { _id: 'creator_12', name: 'Nora Chen', avatarUrl: '/avatars/nora.png' },
    starredByCurrentUser: false,
    models: baseModels,
  },
  {
    id: 'explore_proj_13',
    name: 'AI Cooking Assistant',
    status: 'in_progress',
    stars: 35,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    incompleteIssues: 2,
    completeIssues: 6,
    repositories: [{ type: 'existing', url: 'https://github.com/example/cooking-assistant' }],
    user: { _id: 'creator_13', name: 'Olivia Grant', avatarUrl: '/avatars/olivia.png' },
    starredByCurrentUser: true,
    models: {
      ...baseModels,
      medium: [{ provider: 'google', model: 'gemini-pro' }],
    },
  },
];

export const FAKE_CARDS: SavedCard[] = [
  {
    id: 'pm_card_visa_1',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
  {
    id: 'pm_card_mc_2',
    brand: 'mastercard',
    last4: '4444',
    expiryMonth: 5,
    expiryYear: 2025,
    isDefault: false,
  },
  {
    id: 'pm_card_amex_3',
    brand: 'amex',
    last4: '3782',
    expiryMonth: 9,
    expiryYear: 2027,
    isDefault: false,
  },
  {
    id: 'pm_card_discover_4',
    brand: 'discover',
    last4: '6011',
    expiryMonth: 1,
    expiryYear: 2028,
    isDefault: false,
  },
];

export const FAKE_TRANSACTIONS: Transaction[] = [
  // 2022
  {
    _id: 'txn_2022_01',
    userId: 'test-user-id',
    type: TransactionType.CREDIT,
    status: TransactionStatus.SUCCEEDED,
    amount: 120.00,
    description: 'Initial account funding',
    stripeChargeId: 'ch_2022_01',
    createdAt: new Date('2022-03-10T10:00:00Z').toISOString(),
  },
  {
    _id: 'txn_2022_02',
    userId: 'test-user-id',
    type: TransactionType.DEBIT,
    status: TransactionStatus.SUCCEEDED,
    amount: -40.00,
    description: 'Project: AI Writer',
    relatedProjectId: 'proj_x1',
    createdAt: new Date('2022-06-21T15:00:00Z').toISOString(),
  },

  // 2023
  {
    _id: 'txn_2023_01',
    userId: 'test-user-id',
    type: TransactionType.CREDIT,
    status: TransactionStatus.SUCCEEDED,
    amount: 200.00,
    description: 'Annual top-up',
    stripeChargeId: 'ch_2023_01',
    createdAt: new Date('2023-01-05T09:30:00Z').toISOString(),
  },
  {
    _id: 'txn_2023_02',
    userId: 'test-user-id',
    type: TransactionType.DEBIT,
    status: TransactionStatus.SUCCEEDED,
    amount: -25.00,
    description: 'Project: Resume Parser',
    relatedProjectId: 'proj_4',
    createdAt: new Date('2023-02-02T10:10:00Z').toISOString(),
  },
  {
    _id: 'txn_2023_03',
    userId: 'test-user-id',
    type: TransactionType.DEBIT,
    status: TransactionStatus.SUCCEEDED,
    amount: -60.00,
    description: 'Project: Podcast Summarizer',
    relatedProjectId: 'proj_11',
    createdAt: new Date('2023-05-05T08:20:00Z').toISOString(),
  },

  // 2024
  {
    _id: 'txn_2024_01',
    userId: 'test-user-id',
    type: TransactionType.CREDIT,
    status: TransactionStatus.SUCCEEDED,
    amount: 90.00,
    description: 'Referral reward',
    createdAt: new Date('2024-03-10T09:00:00Z').toISOString(),
  },
  {
    _id: 'txn_2024_02',
    userId: 'test-user-id',
    type: TransactionType.DEBIT,
    status: TransactionStatus.SUCCEEDED,
    amount: -75.00,
    description: 'Project: Smart Meeting Notes',
    relatedProjectId: 'proj_2',
    createdAt: new Date('2024-05-10T09:45:00Z').toISOString(),
  },

  // 2025
  {
    _id: 'txn_2025_01',
    userId: 'test-user-id',
    type: TransactionType.CREDIT,
    status: TransactionStatus.SUCCEEDED,
    amount: 40.00,
    description: 'Balance top-up',
    createdAt: new Date('2025-07-09T10:15:00Z').toISOString(),
  },
  {
    _id: 'txn_2025_02',
    userId: 'test-user-id',
    type: TransactionType.DEBIT,
    status: TransactionStatus.PENDING,
    amount: -45.00,
    description: 'Project: Video Transcoder',
    relatedProjectId: 'proj_3',
    createdAt: new Date('2025-07-10T08:00:00Z').toISOString(),
  },
  {
    _id: 'txn_2025_03',
    userId: 'test-user-id',
    type: TransactionType.DEBIT,
    status: TransactionStatus.FAILED,
    amount: -10.00,
    description: 'Project: HR Metrics Dashboard',
    relatedProjectId: 'proj_5',
    createdAt: new Date('2025-07-12T18:00:00Z').toISOString(),
  },
  {
    _id: 'txn_2025_04',
    userId: 'test-user-id',
    type: TransactionType.CREDIT,
    status: TransactionStatus.SUCCEEDED,
    amount: 30.00,
    description: 'Stripe refund',
    stripeChargeId: 'ch_refund_001',
    createdAt: new Date('2025-07-15T10:00:00Z').toISOString(),
  },
];
