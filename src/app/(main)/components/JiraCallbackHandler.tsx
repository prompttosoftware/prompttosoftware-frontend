// src/app/(main)/components/JiraCallbackHandler.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function JiraCallbackHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { updateProfile } = useAuth(); 

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const storedState = sessionStorage.getItem('jira_oauth_state');

        if (code && state && state === storedState) {
        sessionStorage.removeItem('jira_oauth_state');
        router.replace(pathname, { scroll: false });

        const linkPromise = async () => {
            // 1. Make ONE API call to the backend.
            const updatedUser = await api.linkJiraAccount(code);
            // 2. Use the returned data to INSTANTLY update the context/cache.
            updateProfile(updatedUser);
            // The toast's success message can now use the updated data.
            return `Successfully linked to Jira!`;
        };

        toast.promise(linkPromise(), { // Execute the async function
            loading: 'Finalizing Jira connection...',
            success: (message) => message,
            error: 'Failed to link Jira account. Please try again.',
        });
        }
    }, [searchParams, pathname, router, updateProfile]);

    return null; // This component renders nothing
}
