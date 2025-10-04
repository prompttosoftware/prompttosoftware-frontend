'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Plus, 
  History, 
  Settings as SettingsIcon, 
  Eye,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import { ChatSettings } from '@/types/chat';
import { Analysis } from '@/types/analysis';
import { ProviderModelSelector } from './ProviderModelSelection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface ChatSidebarProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  analyses?: Analysis[] | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ settings, onSettingsChange, systemPrompt, onSystemPromptChange, analyses }) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  useEffect(() => {
    if (!settings.provider) {
      handleSettingChange('provider', 'openrouter');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <aside className={`hidden md:flex flex-col border-r bg-muted/40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <TooltipProvider delayDuration={100}>
        {/* Header */}
        <div className={`flex h-14 items-center border-b p-2 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <h3 className={`whitespace-nowrap font-semibold px-2 ${isCollapsed ? 'hidden' : 'block'}`}>Menu</h3>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        <span className="sr-only">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</p>
                </TooltipContent>
            </Tooltip>
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col justify-between min-h-0 overflow-y-auto">
          {/* Top Section */}
          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-2">
              {isCollapsed ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => router.push('/chat/new')} className="w-full justify-center" size="icon">
                        <Plus className="h-5 w-5" />
                        <span className="sr-only">New Chat</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>New Chat</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/chat-history" passHref>
                        <Button variant="outline" className="w-full justify-center" size="icon">
                          <History className="h-5 w-5" />
                          <span className="sr-only">Chat History</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>Chat History</p></TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button onClick={() => router.push('/chat/new')} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    New Chat
                  </Button>
                  <Link href="/chat-history" passHref>
                    <Button variant="outline" className="w-full">
                      <History className="mr-2 h-4 w-4" />
                      Chat History
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex-grow" />

          {/* Bottom Section */}
          <div className="p-4 border-t">
            {isCollapsed ? (
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" className="w-full justify-center" size="icon" onClick={() => setIsCollapsed(false)}>
                          <SettingsIcon className="h-5 w-5" />
                          <span className="sr-only">Settings</span>
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                      <p>Settings</p>
                  </TooltipContent>
              </Tooltip>
            ) : (
              <Accordion type="single" collapsible className="w-full" defaultValue="settings">
                <AccordionItem value="system-prompt">
                  <AccordionTrigger className="text-sm font-semibold">System Prompt</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      placeholder="e.g., You are a helpful assistant..."
                      value={systemPrompt}
                      onChange={(e) => onSystemPromptChange(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="settings">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <SettingsIcon className="h-4 w-4" />
                      Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-2">
                    <div className="space-y-2">
                      <Label>Analysis</Label>
                      <Select value={settings.analysisId || ''} onValueChange={(v) => handleSettingChange('analysisId', v || undefined)}>
                        <SelectTrigger><SelectValue placeholder="Link Analysis..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {analyses?.map(analysis => (
                            <SelectItem key={analysis._id} value={analysis._id}>
                              {analysis.repository}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {settings.analysisId && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => router.push(`/analysis/${settings.analysisId}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Analysis
                        </Button>
                      )}
                    </div>
                    
                    <ProviderModelSelector settings={settings} onSettingChange={handleSettingChange} />

                    <div className="space-y-2">
                      <Label>Temperature: {settings.temperature}</Label>
                      <Slider defaultValue={[settings.temperature]} max={1} step={0.1} onValueChange={([v]: number[]) => handleSettingChange('temperature', v)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Top K: {settings.top_k}</Label>
                      <Slider defaultValue={[settings.top_k]} max={100} step={1} onValueChange={([v]: number[]) => handleSettingChange('top_k', v)} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </div>
      </TooltipProvider>
    </aside>
  );
};

export default ChatSidebar;
