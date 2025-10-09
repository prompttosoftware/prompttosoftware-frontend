import { Model } from "./project";

export interface Chat {
    _id: string;
    userId: string;
    name: string;
    analysisId?: string;
    repository: string;
    model: Model;
    cost: number;
    top_k?: number;
    temperature?: number;
    systemPrompt?: string;

    conversationInfo?: string[];

    /** The _id of the last message in the currently active conversation branch. */
    activeMessageId: string;
    
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    _id: string;
    chatId: string;
    sender: 'user' | 'ai';
    content: string;
    reasoning?: string;
    parentMessageId: string | null;
    fingerprint?: number;

    /** The index of this message among its siblings (0-based). */
    branchIndex: number; 

    /** The total number of siblings this message has (including itself). */
    totalBranches: number;

    createdAt: Date;
}

/**
 * Payload for creating a new chat session.
 */
export interface CreateChatInput {
    repository: string;
    initialContent: string;
    systemPrompt?: string;
    analysisId?: string;
    model: {
        primary: string;
        secondary?: string;
    };
    top_k?: number;
    temperature?: number;
}

/**
 * Payload for sending a message in an existing chat.
 */
export interface SendMessageInput {
    content: string;
    systemPrompt?: string;
    top_k?: number;
    temperature?: number;
    stream?: boolean;
}

export interface EditMessageInput {
    newContent: string;
    systemPrompt?: string;
    top_k?: number;
    temperature?: number;
    stream?: boolean;
}

/**
 * Payload for regenerating an AI response.
 */
export interface RegenerateResponseInput {
    parentMessageId: string;
    systemPrompt?: string;
    top_k?: number;
    temperature?: number;
    stream?: boolean;
}

/**
 * Payload for switching the active branch of a conversation.
 */
export interface SwitchBranchInput {
    parentMessageId: string;
    branchIndex: number;
}

/**
 * Generic pagination query parameters.
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
}


// --- New Chat API Response Type Definitions ---
// These define the expected data structure returned from the chat endpoints.

export interface CreateChatResponse {
    chat: Chat;
    userMessage: ChatMessage;
}

export interface GetChatResponse {
    chat: Chat;
    messages: ChatMessage[]; // The message history for the active branch
}

export type SendMessageResponse = ChatMessage;
export type RegenerateResponse = ChatMessage;
export type EditMessageResponse = ChatMessage;

export interface SwitchBranchResponse {
    updatedChat: Chat;        // The chat with the new activeMessageId
    messages: ChatMessage[]; // The messages for the newly selected branch
}

/**
 * A client-side type to manage UI settings for the chat.
 */
export interface ChatSettings {
  analysisId?: string;
  provider: string; // e.g., 'openai', 'anthropic'
  model: string;    // e.g., 'gpt-4-turbo'
  temperature: number;
  top_k: number;
}
