// src/lib/server-fetches/chat.ts
import { Chat, GetChatResponse, PaginationParams } from '@/types/chat';
import { serverFetch } from '@/lib/server-api';
import { FAKE_CHATS, FAKE_MESSAGES_BY_CHAT } from '../dev/fakeData';
import { PaginatedResponse } from '../api';

/**
 * SERVER-SIDE FETCH: Fetches the list of chats for the logged-in user.
 * Corresponds to the `useUserChats` hook.
 */
export async function fetchAllChats(params: PaginationParams = {}): Promise<PaginatedResponse<Chat>> {
    const defaultResponse = { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };

    if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') {
        return { data: FAKE_CHATS, page: 1, limit: 10, total: FAKE_CHATS.length, totalPages: 1 };
    }

    try {
        const qs = new URLSearchParams(params as any).toString();
        const res = await serverFetch(`/chats?${qs}`);
        if (!res.ok) {
            console.error('fetchAllChats error:', res.statusText);
            return defaultResponse;
        }
        return res.json();
    } catch (e) {
        console.error('fetchAllChats exception:', e);
        return defaultResponse;
    }
}

/**
 * SERVER-SIDE FETCH: Fetches a single chat and its message history.
 * Corresponds to the `useChat` hook.
 */
export async function fetchChatById(chatId: string): Promise<GetChatResponse | null> {
    if (!chatId) return null;

    if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') {
        const chat = FAKE_CHATS.find(c => c._id === chatId);
        const messages = FAKE_MESSAGES_BY_CHAT[chatId] || [];
        return chat ? { chat, messages } : null;
    }

    try {
        const res = await serverFetch(`/chats/${chatId}`);
        if (res.status === 404) return null;
        if (!res.ok) {
            console.error('fetchChatById error:', res.statusText);
            return null;
        }
        return res.json();
    } catch (e) {
        console.error('fetchChatById exception:', e);
        return null;
    }
}
