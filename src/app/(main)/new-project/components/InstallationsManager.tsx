'use client';
import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ProjectFormData } from '@/types/project';

// Always installed tools (shown as disabled)
const ALWAYS_INSTALLED = [
  'git',
  'curl', 
  'wget',
  'build-essential',
  'ca-certificates',
];

// Optional global development tools grouped by category
const OPTIONAL_TOOLS = {
  'Language Runtimes': [
    { name: 'nodejs', description: 'JavaScript runtime' },
    { name: 'python3-dev', description: 'Python development package' },
    { name: 'golang', description: 'Go programming language' },
    { name: 'openjdk-17-jdk', description: 'Java Development Kit' },
    { name: 'php', description: 'PHP runtime' },
    { name: 'ruby', description: 'Ruby programming language' },
  ],
  'Package Managers': [
    { name: 'npm', description: 'Node.js package manager' },
    { name: 'yarn', description: 'Alternative Node.js package manager' },
    { name: 'pip', description: 'Python package manager' },
    { name: 'composer', description: 'PHP package manager' },
  ],
  'Development Tools': [
    { name: 'vim', description: 'Text editor' },
    { name: 'neovim', description: 'Modern Vim fork' },
    { name: 'tmux', description: 'Terminal multiplexer' },
    { name: 'htop', description: 'Interactive process viewer' },
    { name: 'jq', description: 'JSON processor' },
    { name: 'tree', description: 'Directory tree viewer' },
    { name: 'unzip', description: 'Archive extraction utility' },
    { name: 'make', description: 'Build automation tool' },
  ],
  'Version Control & CI': [
    { name: 'gh', description: 'GitHub CLI' },
    { name: 'git-lfs', description: 'Git Large File Storage' },
  ],
  'Database Tools': [
    { name: 'postgresql-client', description: 'PostgreSQL client tools' },
    { name: 'mysql-client', description: 'MySQL client tools' },
    { name: 'redis-tools', description: 'Redis client tools' },
    { name: 'sqlite3', description: 'SQLite database engine' },
  ],
  'Cloud & DevOps': [
    { name: 'awscli', description: 'AWS command line interface' },
    { name: 'docker-compose', description: 'Docker container orchestration' },
    { name: 'kubectl', description: 'Kubernetes command line tool' },
    { name: 'terraform', description: 'Infrastructure as code tool' },
  ],
  'Code Quality': [
    { name: 'shellcheck', description: 'Shell script linter' },
    { name: 'yamllint', description: 'YAML linter' },
    { name: 'clang-format', description: 'Code formatter' },
  ],
};

export default function InstallationManager() {
  const { control } = useFormContext<ProjectFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'advancedOptions.installations',
  });
  
  const [customTool, setCustomTool] = useState('');

  const handleAddCustom = () => {
    if (!customTool.trim()) {
      toast.warning('Please enter a tool name.');
      return;
    }
    
    const toolName = customTool.trim();
    
    // Check if already exists
    if (ALWAYS_INSTALLED.includes(toolName) || fields.some(field => field.name === toolName)) {
      toast.warning('This tool is already included.');
      return;
    }
    
    append({ name: toolName });
    setCustomTool('');
    toast.success(`Added ${toolName}`);
  };

  const handleAddPredefined = (toolName: string) => {
    // Check if already exists
    if (fields.some(field => field.name === toolName)) {
      toast.warning('This tool is already added.');
      return;
    }
    
    append({ name: toolName });
    toast.success(`Added ${toolName}`);
  };

  const isToolAdded = (toolName: string) => {
    return fields.some(field => field.name === toolName);
  };

  return (
    <div className="p-4 rounded-md bg-card border">
      <h3 className="text-md font-semibold text-card-foreground mb-2">Development Tools</h3>
      <p className="text-sm text-card-foreground mb-4">
        Select additional development tools to install globally. Basic tools like git and curl are always included.
      </p>
      
      {/* Always installed tools */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-card-foreground mb-2">Always Installed</h4>
        <div className="flex flex-wrap gap-2">
          {ALWAYS_INSTALLED.map((tool) => (
            <span
              key={tool}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
            >
              {tool} (installed)
            </span>
          ))}
        </div>
      </div>

      {/* User selected tools */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-card-foreground mb-2">Additional Tools</h4>
        <div className="space-y-2">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional tools selected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fields.map((installation, index) => (
                <div
                  key={installation.id}
                  className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded"
                >
                  <span>{installation.name}</span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="ml-1 text-primary-foreground hover:text-primary-hover-foreground font-bold text-sm"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add tools interface */}
      <div className="space-y-3">
        {/* Predefined tools dropdown */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[160px]" data-testid="add-tools-button">
                Add Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(OPTIONAL_TOOLS).map(([category, tools]) => (
                <div key={category}>
                  <DropdownMenuLabel>
                    {category}
                  </DropdownMenuLabel>
                  {tools.map((tool) => (
                    <DropdownMenuItem
                      key={tool.name}
                      onSelect={() => handleAddPredefined(tool.name)}
                      disabled={isToolAdded(tool.name)}
                      className={`flex flex-col items-start px-3 py-2 ${
                        isToolAdded(tool.name) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {tool.name} {isToolAdded(tool.name) && '(added)'}
                      </div>
                      <div className="text-xs text-popover-foreground">{tool.description}</div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
