'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Goes back one step in the browser's history. */
export function BackButton({ label }: { label: string }) {
  return (
    <Button variant="outline" onClick={() => window.history.back()}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
