'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

// Types
export interface ApiKey {
  provider: string;
  api_key: string; // Backend returns masked version like "sk-...abc123"
}

export interface ApiKeyPayload {
  provider: string;
  api_key: string;
}

// Provider configuration
const PROVIDERS = [
  { label: 'Anthropic', value: 'ANTHROPIC' },
  { label: 'OpenAI', value: 'OPENAI' },
  { label: 'Google', value: 'GOOGLE' },
  { label: 'Groq', value: 'GROQ' },
  { label: 'DeepSeek', value: 'DEEPSEEK' },
  { label: 'OpenRouter', value: 'OPENROUTER' },
];

// AddApiKeyButton component - reusable button for adding API keys
// No changes are strictly necessary here for useAuth integration,
// as it interacts with `api.saveApiKey` and then notifies the parent via `onApiKeyAdded`.
interface AddApiKeyButtonProps {
  onApiKeyAdded?: (provider: string) => void;
  excludeProviders?: string[];
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const AddApiKeyButton: React.FC<AddApiKeyButtonProps> = ({
  onApiKeyAdded,
  excludeProviders = [],
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableProviders = PROVIDERS.filter(
    provider => !excludeProviders.includes(provider.value)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !apiKey.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.saveApiKey({
        provider: selectedProvider,
        api_key: apiKey.trim(),
      });

      // Reset form
      setSelectedProvider('');
      setApiKey('');
      setIsOpen(false);

      // Notify parent component
      onApiKeyAdded?.(selectedProvider);
    } catch (error) {
      setError('Failed to save API key. Please try again.');
      console.error('Error saving API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setSelectedProvider('');
      setApiKey('');
      setError(null);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Plus className="w-4 h-4 mr-2" />
          Add API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-popover text-popover-foreground backdrop-blur-md rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Add API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent className="col-span-3 w-full block border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm p-2 bg-white">
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              required
              maxLength={5000}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedProvider || !apiKey.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main ApiKeyManager component for the settings page
export const ApiKeyManager: React.FC = () => {
  // Get the user object, authentication loading state, and refresh function from useAuth
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const queryClient = useQueryClient(); // Initialize query client for optimistic updates

  // API keys are now directly derived from the user object obtained from useAuth.
  // We provide a fallback to an empty array if `user` or `user.apiKeys` is null/undefined.
  const apiKeys = user?.apiKeys || [];

  // Local state to manage errors specifically related to loading API keys
  const [loadError, setLoadError] = useState<string | null>(null);

  // A combined loading state for this component. It's true if useAuth is loading
  // AND the user object (which contains the API keys) isn't yet available.
  // This helps differentiate between an initial load and an empty state after loading.
  const componentIsLoading = authLoading && !user;

  // `fetchApiKeys` is now responsible for triggering `refreshUser` from `useAuth`.
  // This ensures the `user` object (and its `apiKeys`) is up-to-date.
  const fetchApiKeys = useCallback(async () => {
    setLoadError(null); // Clear any previous load errors before attempting to fetch
    try {
      await refreshUser(); // This function from useAuth will re-fetch the user's profile
    } catch (err: any) {
      console.error('Error refreshing user profile for API keys:', err);
      // Set a local error message specific to this component's data loading failure
      setLoadError(err.message || 'Failed to load API keys');
    }
  }, [refreshUser]);

  useEffect(() => {
    // This effect ensures initial loading or re-attempts if user data isn't present.
    // If the `user` object is already populated by `useAuth` on mount, `apiKeys` will be available immediately.
    // We only trigger `fetchApiKeys` if user data isn't already loaded and `useAuth` isn't in an ongoing loading state.
    if (!user && !authLoading) {
      fetchApiKeys();
    }
  }, [user, authLoading, fetchApiKeys]); // Dependencies to re-run effect when user or authLoading changes

  // Callback for when a new API key is successfully added via the AddApiKeyButton.
  const handleApiKeyAdded = useCallback(async () => {
    // After adding a new key, trigger a refresh of the user data to get the latest list of API keys.
    await fetchApiKeys();
  }, [fetchApiKeys]);

  // Callback for deleting an API key.
  const handleDeleteApiKey = useCallback(
    async (provider: string) => {
      // **Optimistic Update:** Temporarily remove the key from the UI
      // by updating the `user.apiKeys` directly in the TanStack Query cache.
      const previousUser = queryClient.getQueryData<typeof user>(['user']); // Store current user data for potential rollback
      queryClient.setQueryData<typeof user>(
        ['user'],
        (oldUser) => {
          if (oldUser) {
            return {
              ...oldUser,
              apiKeys: oldUser.apiKeys?.filter(key => key.provider !== provider) || [],
            };
          }
          return oldUser;
        }
      );

      try {
        await api.deleteApiKey(provider);
        // After successful deletion, refresh the user's entire profile from the backend
        // to ensure the `useAuth`'s user object is perfectly in sync.
        await fetchApiKeys(); 
      } catch (error) {
        console.error('Error deleting API key:', error);
        // **Rollback:** If the API call fails, revert the UI to its previous state.
        if (previousUser) {
          queryClient.setQueryData(['user'], previousUser);
        }
        // You might also consider using a global error notification here (e.g., useGlobalErrorStore).
      }
    },
    [queryClient, fetchApiKeys] // Dependencies for useCallback
  );

  const getProviderLabel = (value: string) => {
    const provider = PROVIDERS.find(p => p.value === value);
    return provider ? provider.label : value;
  };

  // Get a list of providers for which API keys are already added, to disable them in the "Add API Key" dialog.
  const usedProviders = apiKeys.map(key => key.provider);

  // --- Render Logic ---

  // Show a skeleton loader while the component is in its combined loading state.
  if (componentIsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-9 w-28 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Display an error message if there was a problem loading the API keys.
  if (loadError) {
    return (
      <div className="text-destructive text-center p-4">
        {loadError}
        <Button 
          onClick={fetchApiKeys} // The Retry button re-attempts fetching API keys
          variant="outline" 
          size="sm" 
          className="ml-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5" />
          <h3 className="text-lg font-semibold">API Keys</h3>
        </div>
        <AddApiKeyButton
          onApiKeyAdded={handleApiKeyAdded}
          excludeProviders={usedProviders}
          variant="outline"
          size="sm"
        />
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No API Keys</CardTitle>
            <CardDescription>
              We provide a default OpenRouter API key. If you would like to use your own key or use a different provider, add them here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddApiKeyButton
              onApiKeyAdded={handleApiKeyAdded}
              excludeProviders={usedProviders}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <Card key={key.provider}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">
                    {getProviderLabel(key.provider)}
                  </Badge>
                  <span className="font-mono text-sm text-card-foreground">
                    {key.api_key}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteApiKey(key.provider)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
