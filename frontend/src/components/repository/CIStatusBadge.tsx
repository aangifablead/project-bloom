import React from 'react';
import { CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type CIStatus = 'success' | 'failure' | 'in_progress' | 'queued' | 'neutral' | 'skipped' | 'timed_out' | 'cancelled' | null | undefined;

interface CIStatusBadgeProps {
  status: CIStatus;
  conclusion?: string | null;
  size?: 'sm' | 'md';
}

export const CIStatusBadge: React.FC<CIStatusBadgeProps> = ({ status, conclusion, size = 'sm' }) => {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  const effective = conclusion || status;

  if (effective === 'success') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCircle2 className={`${sz} text-emerald-500 shrink-0`} />
        </TooltipTrigger>
        <TooltipContent>Passed</TooltipContent>
      </Tooltip>
    );
  }
  if (effective === 'failure' || effective === 'timed_out' || effective === 'cancelled') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <XCircle className={`${sz} text-red-500 shrink-0`} />
        </TooltipTrigger>
        <TooltipContent>Failed</TooltipContent>
      </Tooltip>
    );
  }
  if (effective === 'in_progress' || effective === 'queued') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Loader2 className={`${sz} text-blue-400 animate-spin shrink-0`} />
        </TooltipTrigger>
        <TooltipContent>Running</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Circle className={`${sz} text-muted-foreground shrink-0`} />
      </TooltipTrigger>
      <TooltipContent>No checks</TooltipContent>
    </Tooltip>
  );
};
