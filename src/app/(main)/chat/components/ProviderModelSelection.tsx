import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { ChatSettings } from "@/types/chat";
import { AddApiKeyButton } from "../../components/ApiKeyManager";


const AI_PROVIDERS = [
  { label: 'OpenAI', value: 'openai' },
//   { label: 'Anthropic', value: 'anthropic' },
//   { label: 'Google', value: 'google' },
//   { label: 'Groq', value: 'groq' },
//   { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenRouter', value: 'openrouter' },
];

interface ProviderModelSelectorProps {
  settings: ChatSettings;
  onSettingChange: (key: keyof ChatSettings, value: any) => void;
}

export const ProviderModelSelector: React.FC<ProviderModelSelectorProps> = ({ settings, onSettingChange }) => {
  const { user, refreshUser } = useAuth();

  const apiKeys = user?.apiKeys || [];
  const availableProviders = apiKeys.map(key => key.provider.toLowerCase());

  const hasApiKey = (providerValue: string): boolean => {
    if (providerValue.toLowerCase() === 'openrouter') {
      return true;
    }
    return availableProviders.includes(providerValue.toLowerCase());
  };

  const handleApiKeyAdded = async () => {
    await refreshUser();
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label>Provider</Label>
            {settings.provider && !hasApiKey(settings.provider) && (
              <AddApiKeyButton
                onApiKeyAdded={handleApiKeyAdded}
                excludeProviders={availableProviders}
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs"
              />
            )}
        </div>
        <Select 
          value={settings.provider} 
          onValueChange={(v) => onSettingChange('provider', v)}
        >
          <SelectTrigger><SelectValue placeholder="Select Provider..." /></SelectTrigger>
          <SelectContent>
            {AI_PROVIDERS.map((provider) => {
              const isAvailable = hasApiKey(provider.value);
              return (
                <SelectItem key={provider.value} value={provider.value} disabled={!isAvailable}>
                  <div className="flex items-center justify-between w-full">
                    <span>{provider.label}</span>
                    {!isAvailable && <span className="text-xs text-muted-foreground ml-2">(Add API key)</span>}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label >Model</Label>
        <Input 
          id="model" 
          value={settings.model} 
          onChange={(e) => onSettingChange('model', e.target.value)}
          placeholder="e.g., gpt-4-turbo"
        />
      </div>
    </>
  );
};
