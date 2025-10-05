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
            invalidateChatsList();
            // Pre-populate the cache for the new chat to avoid a loading flash on redirect
            console.log(`Create chat response: ${JSON.stringify(data)}`);
            const newChatResponse: GetChatResponse = {
                chat: data.chat,
                messages: [data.userMessage, data.aiResponse],
            };
            queryClient.setQueryData(['chat', data.chat?._id], newChatResponse);
            router.push(`/chat/${data.chat?._id}`);
            toast.success('New chat created!');
        },
        onError: (error) => {
            toast.error(`Failed to create chat: ${error.message}`);
        },
    });

    /**
     * Sends a new message in the current chat.
     */
    const sendMessageMutation = useMutation({
        mutationFn: (payload: SendMessageInput) => {
            if (!chatId) throw new Error('Chat ID is required to send a message.');
            return api.chat.sendMessage(chatId, payload);
        },
        onSuccess: invalidateChatHistory,
        onError: (error) => {
            toast.error(`Failed to send message: ${error.message}`);
            invalidateChatHistory(); // Refetch to revert optimistic updates if you were to add them
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
     * Regenerates an AI response, creating a new branch.
     */
    const regenerateResponseMutation = useMutation({
        mutationFn: (payload: RegenerateResponseInput) => {
            if (!chatId) throw new Error('Chat ID is required to regenerate a response.');
            return api.chat.regenerateResponse(chatId, payload);
        },
        onSuccess: () => {
            toast.success('Response regenerated.');
            invalidateChatHistory(); // Invalidate on success to refetch the new branch
        },
        onError: (error) => toast.error(`Failed to regenerate: ${error.message}`),
    });

    /**
     * Edits a user's message and gets a new AI response.
     */
    const editMessageMutation = useMutation({
        mutationFn: (variables: { messageId: string; payload: EditMessageInput }) => {
            if (!chatId) throw new Error('Chat ID is required to edit a message.');
            const { messageId, payload } = variables;
            return api.chat.editUserMessage(chatId, messageId, payload);
        },
        onSuccess: () => {
            toast.success('Message edited and response generated.');
            invalidateChatHistory(); // Invalidate to refetch the entire new branch
        },
        onError: (error) => toast.error(`Failed to edit message: ${error.message}`),
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

    return {
        createChat: createChatMutation,
        sendMessage: sendMessageMutation,
        deleteChat: deleteChatMutation,
        regenerateResponse: regenerateResponseMutation,
        editMessage: editMessageMutation,
        switchBranch: switchBranchMutation,
        deleteMessage: deleteMessageMutation,
    };
};
