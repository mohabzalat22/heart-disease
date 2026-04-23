'use client';

import { useEffect, useState, useCallback } from 'react';
import { getLogs } from '@/actions/adminActions';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCcw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Info,
  AlertTriangle,
  Filter,
  XCircle,
  Calendar as CalendarIcon,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface LogEntry {
  time: string;
  level: string;
  message: string;
  meta?: string;
}

const PAGE_SIZE = 50;

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLogs(page, PAGE_SIZE, filterLevel, filterDate);
      setLogs(result.logs);
      setTotalPages(result.pages);
      setTotalLogs(result.total);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterLevel, filterDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterLevel, filterDate]);

  const clearFilters = () => {
    setFilterLevel('all');
    setFilterDate('');
  };

  const toggleExpand = (index: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="size-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="size-4 text-yellow-500" />;
      default:
        return <Info className="size-4 text-blue-500" />;
    }
  };

  const getLevelStyles = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warn':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <Card className="flex flex-col h-[750px] border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Application Logs
            </CardTitle>
            <CardDescription>
              Showing {logs.length} of {totalLogs} events.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
          >
            <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Filters:
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 text-xs border-border/50 bg-background"
              >
                <div
                  className={cn(
                    'size-2 rounded-full',
                    filterLevel === 'all'
                      ? 'bg-muted-foreground'
                      : filterLevel === 'error'
                        ? 'bg-destructive'
                        : filterLevel === 'warn'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                  )}
                />
                Level:{' '}
                {filterLevel === 'all'
                  ? 'All'
                  : filterLevel === 'warn'
                    ? 'Warning'
                    : filterLevel.charAt(0).toUpperCase() + filterLevel.slice(1)}
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem
                onClick={() => setFilterLevel('all')}
                className="gap-2"
              >
                <div className="size-2 rounded-full bg-muted-foreground" />
                All Levels
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterLevel('info')}
                className="gap-2"
              >
                <div className="size-2 rounded-full bg-blue-500" />
                Info
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterLevel('warn')}
                className="gap-2"
              >
                <div className="size-2 rounded-full bg-yellow-500" />
                Warning
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterLevel('error')}
                className="gap-2"
              >
                <div className="size-2 rounded-full bg-destructive" />
                Error
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative">
            <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-8 pl-8 pr-2 text-xs w-[140px] border-border/50 bg-background"
            />
          </div>

          {(filterLevel !== 'all' || filterDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <XCircle className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0 border-t border-border/50">
        <ScrollArea className="flex-1 min-h-0">
          <div className="divide-y divide-border/30">
            {logs.length === 0 && !loading ? (
              <div className="p-12 text-center">
                <AlertCircle className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  No logs match your filters.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-1 text-primary"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="p-3.5 flex items-start gap-3.5 cursor-pointer"
                    onClick={() => log.meta && toggleExpand(index)}
                  >
                    <div className="mt-1.5 shrink-0">
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm',
                            getLevelStyles(log.level)
                          )}
                        >
                          {log.level}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                          {new Date(log.time).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium leading-relaxed text-foreground/90 break-words">
                        {log.message}
                      </p>
                      {log.meta && (
                        <div className="mt-2.5 flex items-center text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                          {expandedLogs[index] ? (
                            <ChevronDown className="size-3.5 mr-1.5" />
                          ) : (
                            <ChevronRight className="size-3.5 mr-1.5" />
                          )}
                          View Metadata
                        </div>
                      )}
                    </div>
                  </div>
                  {log.meta && expandedLogs[index] && (
                    <div className="px-4 pb-4 ml-10 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="bg-muted/50 dark:bg-muted/20 rounded-xl p-4 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all border border-border/50 shadow-inner">
                        {typeof log.meta === 'string'
                          ? (() => {
                              try {
                                return JSON.stringify(
                                  JSON.parse(log.meta),
                                  null,
                                  2
                                );
                              } catch {
                                return log.meta;
                              }
                            })()
                          : JSON.stringify(log.meta, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex items-center justify-between py-3">
        <div className="text-xs text-muted-foreground font-medium">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
