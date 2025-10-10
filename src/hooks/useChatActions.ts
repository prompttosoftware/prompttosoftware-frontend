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

    const invalidateChatHistory = (chatIdToInvalidate: string) => {
        if (chatIdToInvalidate) {
            queryClient.invalidateQueries({ queryKey: ['chat', chatIdToInvalidate] });
        }
    };

    // --- Mutations ---

    /**
     * Creates a new chat session.
     */
    const createChatMutation = useMutation({
        mutationFn: (payload: CreateChatInput) => api.chat.createChat(payload),
        onSuccess: (data) => {
            // Simplify this. We only need to invalidate the list.
            // The component will handle pre-populating the UI.
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
            
            // We set the initial data here so the new page has something to show immediately
            const newChatResponse: GetChatResponse = {
                chat: data.chat,
                messages: []
            };
            queryClient.setQueryData(['chat', data.chat._id], newChatResponse);
            
            // Let the component handle navigation.
            // toast.success('New chat created!'); // Can be moved or kept
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
            if (!chatId) throw new Error('Chat ID is required to delete a message.');
            toast.success('Message branch deleted.');
            invalidateChatHistory(chatId); // This is the simplest way to update the UI
        },
        onError: (error) => toast.error(`Failed to delete message: ${error.message}`),
    });

    const sendMessageStream = async (chatId: string, payload: SendMessageInput, onChunk: (chunk: string) => void) => {
        if (!chatId) throw new Error('Chat ID is required to send a message.');
        await api.chat.sendMessageStream(chatId, payload, {
            onChunk,
            onFinish: () => invalidateChatHistory(chatId), // Use the passed-in ID
            onError: (error) => toast.error(`Streaming failed: ${error.message}`),
        });
    };

    const regenerateResponseStream = async (chatId: string, payload: RegenerateResponseInput, onChunk: (chunk: string) => void) => {
        if (!chatId) throw new Error('Chat ID is required to regenerate a response.');
        await api.chat.regenerateResponseStream(chatId, payload, {
            onChunk,
            onFinish: () => invalidateChatHistory(chatId),
            onError: (error) => toast.error(`Regeneration failed: ${error.message}`),
        });
    };

    const editMessageStream = async (chatId: string, messageId: string, payload: EditMessageInput, onChunk: (chunk: string) => void) => {
        if (!chatId) throw new Error('Chat ID is required to edit a message.');
        await api.chat.editUserMessageStream(chatId, messageId, payload, {
            onChunk,
            onFinish: () => invalidateChatHistory(chatId),
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
