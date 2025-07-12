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
} from '@/components/ui/dropdown-menu';
import { ProjectFormData } from '@/types/project';

const ECOSYSTEMS = ['apt', 'brew', 'choco', 'docker', 'github', 'npm', 'pip', 'yarn'].sort();

export default function InstallationManager() {
  const { control } = useFormContext<ProjectFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'advancedOptions.installations',
  });

  const [ecosystem, setEcosystem] = useState('');
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!ecosystem || !name.trim()) {
      toast.warning('Please select an ecosystem and enter a package name.');
      return;
    }
    append({ ecosystem, name: name.trim() });
    setEcosystem('');
    setName('');
  };

  return (
    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm">
      <h3 className="text-md font-semibold text-gray-800 mb-3">Installations</h3>
      <div className="space-y-3 mb-4">
        {fields.length === 0 ? (
            <p className="text-sm text-gray-500">No installations added.</p>
        ) : (
            fields.map((installation, index) => (
            <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-100 bg-white rounded-md shadow-sm"
            >
                <span className="text-sm text-gray-700">
                {installation.ecosystem} {installation.name}
                </span>
                <Button
                type="button"
                onClick={() => remove(index)}
                variant="destructive"
                size="sm"
                >
                Delete
                </Button>
            </div>
            ))
        )}
        </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">{ecosystem || 'Select Type'}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            {ECOSYSTEMS.map((eco) => (
              <DropdownMenuItem key={eco} onSelect={() => setEcosystem(eco)}>{eco}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input placeholder="Package name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="button" onClick={handleAdd}>Add</Button>
      </div>
    </div>
  );
}
