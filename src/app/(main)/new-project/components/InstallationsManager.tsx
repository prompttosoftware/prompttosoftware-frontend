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
export const ALWAYS_INSTALLED = [
    // APT packages
    'git',
    'curl',
    'bash',
    'python3',
    'python3-pip',
    'xvfb',
    'redis-server',
    'sudo',
    'net-tools',
    'iproute2',
    'psmisc',
    'lsof',
    'procps',
    'dnsutils',
    'wget',
    'unzip',
    'nodejs',
    'npm',
    'yarn',
    'ca-certificates',

    // Pip packages
    'pytest',
    'pillow',
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
    { name: 'mono-complete', description: 'Mono development platform' },
    { name: 'r-base', description: 'The R statistical programming language' },
    { name: 'perl', description: 'Practical Extraction and Report Language' },
  ],
  'Package Managers': [
    { name: 'npm', description: 'Node.js package manager' },
    { name: 'yarn', description: 'Alternative Node.js package manager' },
    { name: 'composer', description: 'PHP package manager' },
    { name: 'gradle', description: 'Java/Android build system' },
    { name: 'maven', description: 'Java dependency/build manager' },
  ],
  'Development Tools': [
    { name: 'vim', description: 'Text editor' },
    { name: 'neovim', description: 'Modern Vim fork' },
    { name: 'tmux', description: 'Terminal multiplexer' },
    { name: 'htop', description: 'Interactive process viewer' },
    { name: 'jq', description: 'JSON processor' },
    { name: 'tree', description: 'Directory tree viewer' },
    { name: 'unzip', description: 'Archive extraction utility' },
    { name: 'cmake', description: 'Widely used build system' },
    { name: 'ninja-build', description: 'Fast build system' },
    { name: 'pkg-config', description: 'Helps tools find installed libs' },
    { name: 'clang', description: 'Modern C/C++ compiler' },
    { name: 'lld', description: 'Fast LLVM linker' },
    { name: 'expect', description: 'For scripting interactive CLI tools' },
    { name: 'rsync', description: 'File transfer and synchronization tool' },
    { name: 'zip', description: 'Archive compression utility' },
    { name: 'p7zip-full', description: '7-Zip archive manager' },
    { name: 'file', description: 'Identify file types' },
    { name: 'rar', description: 'RAR archive tool' },
    { name: 'scrot', description: 'Command-line screen capture' },
    { name: 'imagemagick', description: 'Image manipulation suite' },
    { name: 'openssl', description: 'Secure Sockets Layer toolkit' },
    { name: 'man', description: 'Display manual pages' },
    { name: 'ctags', description: 'Generate tag files for source code' },
    { name: 'cscope', description: 'Source code browsing tool' },
    { name: 'nmap', description: 'Network exploration tool' },
    { name: 'tcpdump', description: 'Network packet analyzer' },
    { name: 'inetutils-ping', description: 'Ping utility' },
    { name: 'gnupg', description: 'GNU Privacy Guard' },
    { name: 'software-properties-common', description: 'Manage software sources' },
    { name: 'net-tools', description: 'Legacy networking tools' },
    { name: 'iproute2', description: 'Modern networking tools' },
    { name: 'psmisc', description: 'Utilities that manipulate processes' },
    { name: 'lsof', description: 'List open files' },
    { name: 'procps', description: 'Utilities for /proc filesystem' },
    { name: 'dnsutils', description: 'DNS client tools' },
    { name: 'sudo', description: 'Execute a command as another user' },
    { name: 'xvfb', description: 'X virtual framebuffer' },
    { name: 'netcat', description: 'TCP/UDP network utility' },
    { name: 'gdb', description: 'GNU debugger' },
    { name: 'strace', description: 'Trace system calls' },
    { name: 'ltrace', description: 'Trace library calls' },
    { name: 'valgrind', description: 'Memory debugging/profiling tool' },
  ],
  'Version Control & CI': [
    { name: 'gh', description: 'GitHub CLI' },
    { name: 'git-lfs', description: 'Git Large File Storage' },
  ],
  'Database Tools': [
    { name: 'postgresql-client', description: 'PostgreSQL client tools' },
    { name: 'default-mysql-client', description: 'MySQL client tools' },
    { name: 'sqlite3', description: 'SQLite database engine' },
    { name: 'redis-server', description: 'Redis key-value store' },
  ],
  'Code Quality': [
    { name: 'shellcheck', description: 'Shell script linter' },
    { name: 'yamllint', description: 'YAML linter' },
    { name: 'clang-format', description: 'Code formatter' },
  ],
  'Development Libraries': [
    { name: 'libssl-dev', description: 'Common for crypto, Node.js modules, etc.' },
    { name: 'libffi-dev', description: 'Used in Python cryptography & FFI modules' },
    { name: 'zlib1g-dev', description: 'Compression library' },
    { name: 'libsqlite3-dev', description: 'SQLite development' },
    { name: 'libxml2-dev', description: 'For Python\'s lxml, etc.' },
    { name: 'libxslt1-dev', description: 'For XML transformations' },
    { name: 'ca-certificates', description: 'Trusted CA certificates' },
    { name: 'libbz2-dev', description: 'bzip2 compression library' },
    { name: 'libreadline-dev', description: 'Readline command-line editing' },
    { name: 'liblzma-dev', description: 'XZ (LZMA) compression library' },
  ],
  'Cross-Compilation': [
    { name: 'gcc-arm-linux-gnueabi', description: 'For 32-bit ARM' },
    { name: 'g++-arm-linux-gnueabi', description: 'For 32-bit ARM' },
    { name: 'gcc-aarch64-linux-gnu', description: 'For 64-bit ARM' },
    { name: 'g++-aarch64-linux-gnu', description: 'For 64-bit ARM' },
  ],
  'Python Packages': [
    { name: 'pytest', description: 'Python testing framework' },
    { name: 'pillow', description: 'Python Imaging Library fork' },
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
            <DropdownMenuContent className='max-h-96 overflow-y-auto'>
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
