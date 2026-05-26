import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DiffViewerProps {
  patch?: string;
  filename: string;
  additions: number;
  deletions: number;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ patch, filename, additions, deletions }) => {
  const [mode, setMode] = useState<'unified' | 'split'>('unified');

  if (!patch) {
    return (
      <div className="text-xs text-muted-foreground p-3 italic">
        Binary file or no diff available
      </div>
    );
  }

  const lines = patch.split('\n');

  const renderUnified = () => (
    <div className="font-mono text-xs overflow-x-auto">
      {lines.map((line, i) => {
        let cls = 'px-3 py-0.5 whitespace-pre';
        if (line.startsWith('+') && !line.startsWith('+++')) cls += ' bg-emerald-950/50 text-emerald-300';
        else if (line.startsWith('-') && !line.startsWith('---')) cls += ' bg-red-950/50 text-red-300';
        else if (line.startsWith('@@')) cls += ' bg-blue-950/40 text-blue-300';
        else cls += ' text-muted-foreground';
        return <div key={i} className={cls}>{line || ' '}</div>;
      })}
    </div>
  );

  const renderSplit = () => {
    const leftLines: string[] = [];
    const rightLines: string[] = [];

    lines.forEach((line) => {
      if (line.startsWith('-') && !line.startsWith('---')) {
        leftLines.push(line);
        rightLines.push('');
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        leftLines.push('');
        rightLines.push(line);
      } else {
        leftLines.push(line);
        rightLines.push(line);
      }
    });

    return (
      <div className="font-mono text-xs overflow-x-auto grid grid-cols-2 divide-x divide-border">
        <div>
          {leftLines.map((line, i) => {
            const cls = line.startsWith('-') && !line.startsWith('---')
              ? 'px-3 py-0.5 whitespace-pre bg-red-950/50 text-red-300'
              : 'px-3 py-0.5 whitespace-pre text-muted-foreground';
            return <div key={i} className={cls}>{line || ' '}</div>;
          })}
        </div>
        <div>
          {rightLines.map((line, i) => {
            const cls = line.startsWith('+') && !line.startsWith('+++')
              ? 'px-3 py-0.5 whitespace-pre bg-emerald-950/50 text-emerald-300'
              : 'px-3 py-0.5 whitespace-pre text-muted-foreground';
            return <div key={i} className={cls}>{line || ' '}</div>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* file header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-foreground truncate">{filename}</span>
          <span className="text-xs text-emerald-400 shrink-0">+{additions}</span>
          <span className="text-xs text-red-400 shrink-0">-{deletions}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            size="sm"
            variant={mode === 'unified' ? 'secondary' : 'ghost'}
            className="h-6 text-xs px-2"
            onClick={() => setMode('unified')}
          >
            Unified
          </Button>
          <Button
            size="sm"
            variant={mode === 'split' ? 'secondary' : 'ghost'}
            className="h-6 text-xs px-2"
            onClick={() => setMode('split')}
          >
            Split
          </Button>
        </div>
      </div>
      {mode === 'unified' ? renderUnified() : renderSplit()}
    </div>
  );
};
