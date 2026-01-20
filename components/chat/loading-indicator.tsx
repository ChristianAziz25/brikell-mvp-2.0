'use client';

export function LoadingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2">
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-loading-dot" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-loading-dot" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-loading-dot" />
    </div>
  );
}
