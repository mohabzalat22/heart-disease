'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Share2, Globe, Lock, Loader2 } from 'lucide-react';
import { toggleChatShare } from '@/actions/share-actions';
import { toast } from 'sonner';

interface ShareDialogProps {
  chatId: number;
  token: string;
  isShared: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  chatId,
  token,
  isShared: initialIsShared,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [isPublic, setIsPublic] = React.useState(initialIsShared);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/share/${token}`
      : '';

  const handleToggleShare = async () => {
    setIsLoading(true);
    try {
      const result = await toggleChatShare(chatId, !isPublic);
      if (result.success) {
        setIsPublic(!isPublic);
        toast.success(!isPublic ? 'Chat is now public' : 'Chat is now private');
      } else {
        toast.error(result.error || 'Failed to update sharing status');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Chat
          </DialogTitle>
          <DialogDescription>
            Generate a public link to share this cardio assessment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 transition-all duration-300">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Globe className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Public Visibility</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? 'Anyone with the link can view this chat.'
                  : 'Only you can view this chat.'}
              </p>
            </div>
            <Button
              variant={isPublic ? 'default' : 'outline'}
              size="sm"
              disabled={isLoading}
              onClick={handleToggleShare}
              className="relative min-w-[80px] transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPublic ? (
                'Public'
              ) : (
                'Private'
              )}
            </Button>
          </div>

          {isPublic && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label
                htmlFor="share-url"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Shareable Link
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="share-url"
                  readOnly
                  value={shareUrl}
                  className="h-10 bg-muted/50 border-border/50 focus-visible:ring-primary/20"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 shadow-lg shadow-primary/20"
                  onClick={copyToClipboard}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
