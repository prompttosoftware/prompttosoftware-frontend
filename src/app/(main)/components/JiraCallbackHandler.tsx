'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function JiraCallbackHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { refreshUser, isAuthenticated } = useAuth();

    const isProcessing = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state || isProcessing.current) {
            return;
        }

        // Set the flag to true immediately to prevent re-entry
        isProcessing.current = true;

        console.log('JiraCallbackHandler mounted');
        console.log('Current pathname:', pathname);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        console.log('Is authenticated:', isAuthenticated);

        const error = searchParams.get('error');
        const storedState = sessionStorage.getItem('jira_oauth_state');

        sessionStorage.removeItem('jira_oauth_state');

        console.log('OAuth params:', { code: !!code, state, error, storedState });

        // Handle OAuth errors first
        if (error) {
            console.error('OAuth error:', error);
            const errorDescription = searchParams.get('error_description');
            toast.error('Jira OAuth Error', {
                description: errorDescription || 'Authentication was cancelled or failed.'
            });
            // Clean up URL
            router.replace(pathname, { scroll: false });
            return;
        }

        // Check if we have the required OAuth response
        if (!code || !state) {
            console.log('No OAuth code or state found, handler not triggered');
            return;
        }

        // Validate state parameter
        if (state !== storedState) {
            console.error('State mismatch:', { received: state, stored: storedState });
            toast.error('Security Error', {
                description: 'Invalid OAuth state. Please try linking again.'
            });
            router.replace(pathname, { scroll: false });
            return;
        }

        console.log('Valid OAuth callback detected, processing...');

        router.replace(pathname, { scroll: false });

        const linkPromise = async () => {
            try {
                console.log('Calling API to link Jira account...');
                const updatedUser = await api.linkJiraAccount(code);
                console.log('API response:', updatedUser);
                
                return 'Successfully linked to Jira!';
            } catch (error) {
                console.error('Failed to link Jira account:', error);
                throw error;
            }
        };

        toast.promise(linkPromise(), {
            loading: 'Finalizing Jira connection...',
            success: async (message) => {
                // Update profile with returned data
                await refreshUser();
                return message;
            },
            error: (error) => {
                console.error('Toast error:', error);
                return 'Failed to link Jira account. Please try again.';
            },
        });

    }, [searchParams, pathname, router, refreshUser, isAuthenticated]);

    return null;
}
