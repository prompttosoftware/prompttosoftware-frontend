// src/hooks/useChatActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Chat, CreateChatInput, EditMessageInput, GetChatResponse, RegenerateResponseInput, SendMessageInput, SwitchBranchInput } from '@/types/chat';
import { api, PaginatedResponse } from '@/lib/api';
import { toast } from 'sonner';

export const useChatActions = (chatId?: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    // --- Invalidation Helpers ---
    const invalidateChatsList = () => {
        queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };

    const invalidateChatHistory = () => {
        if (chatId) {
            queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
        }
    };

    // --- Mutations ---

    /**
     * Creates a new chat session.
     */
    const createChatMutation = useMutation({
        mutationFn: (payload: CreateChatInput) => api.chat.createChat(payload),
        onSuccess: (data) => {
            // Invalidate the main list of chats
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
            
            const newChatResponse: GetChatResponse = {
                chat: data.chat,
                messages: [data.userMessage],
            };
            queryClient.setQueryData(['chat', data.chat._id], newChatResponse);
            router.push(`/chat/${data.chat._id}`);
            toast.success('New chat created!');
        },
        onError: (error) => {
            toast.error(`Failed to create chat: ${error.message}`);
        },
    });

    /**
     * Deletes an entire chat session.
     */
    const deleteChatMutation = useMutation({
        mutationFn: (id: string) => api.chat.deleteChat(id),
        onSuccess: (_, deletedId) => {
            // Optimistically remove from the list
            queryClient.setQueryData<PaginatedResponse<Chat>>(['userChats'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.filter((chat) => chat._id !== deletedId),
                };
            });
            queryClient.removeQueries({ queryKey: ['chat', deletedId] });
            toast.success('Chat deleted.');
            // If the user is on the page of the deleted chat, redirect them
            if (chatId === deletedId) {
                router.push('/chat');
            }
        },
        onError: (error) => {
            toast.error(`Failed to delete chat: ${error.message}`);
            invalidateChatsList(); // Refetch the list on failure
        },
    });

    /**
     * Switches the active conversation branch.
     */
    const switchBranchMutation = useMutation({
        mutationFn: (payload: SwitchBranchInput) => {
            if (!chatId) throw new Error('Chat ID is required to switch branches.');
            return api.chat.switchBranch(chatId, payload);
        },
        onSuccess: (data) => {
            // For a snappy UX, update the cache directly with the response
            queryClient.setQueryData(['chat', chatId], data);
            toast.success('Switched branch');
        },
        onError: (error) => toast.error(`Failed to switch branch: ${error.message}`),
    });

    /**
     * Deletes a message and all its descendants.
     */
    const deleteMessageMutation = useMutation({
        mutationFn: (messageId: string) => api.chat.deleteMessage(messageId),
        onSuccess: () => {
            toast.success('Message branch deleted.');
            invalidateChatHistory(); // This is the simplest way to update the UI
        },
        onError: (error) => toast.error(`Failed to delete message: ${error.message}`),
    });

    const sendMessageStream = async (payload: SendMessageInput, onChunk: (chunk: string) => void) => {
        if (!chatId) throw new Error('Chat ID is required to send a message.');
        await api.chat.sendMessageStream(chatId, payload, {
            onChunk,
            onFinish: invalidateChatHistory, // Refetch the final data when stream is done
            onError: (error) => toast.error(`Streaming failed: ${error.message}`),
        });
    };

    const regenerateResponseStream = async (payload: RegenerateResponseInput, onChunk: (chunk: string) => void) => {
        if (!chatId) throw new Error('Chat ID is required to regenerate a response.');
        await api.chat.regenerateResponseStream(chatId, payload, {
            onChunk,
            onFinish: invalidateChatHistory,
            onError: (error) => toast.error(`Regeneration failed: ${error.message}`),
        });
    };

    const editMessageStream = async (messageId: string, payload: EditMessageInput, onChunk: (chunk: string) => void) => {
        if (!chatId) throw new Error('Chat ID is required to edit a message.');
        await api.chat.editUserMessageStream(chatId, messageId, payload, {
            onChunk,
            onFinish: invalidateChatHistory,
            onError: (error) => toast.error(`Failed to edit: ${error.message}`),
        });
    };

    return {
        // Mutations
        createChat: createChatMutation,
        deleteChat: deleteChatMutation,
        switchBranch: switchBranchMutation,
        deleteMessage: deleteMessageMutation,

        // Streaming Functions
        sendMessageStream,
        regenerateResponseStream,
        editMessageStream,
    };
};
