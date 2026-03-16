'use client';

import * as React from 'react';
import { SendHorizontal, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ChatInput() {
  const [input, setInput] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="sticky bottom-0 z-20 w-full bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border/50 bg-background/50 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-border/50 focus-within:ring-primary/20 transition-all duration-300">
          <TooltipProvider>
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
            </div>

            <Textarea
              ref={textareaRef}
              placeholder="Ask anything about your heart health..."
              className="max-h-60 min-h-[44px] flex-1 resize-none bg-transparent py-3 border-0 focus-visible:ring-0 shadow-none text-sm placeholder:text-muted-foreground/60 transition-all duration-300"
              value={input}
              onChange={handleInput}
              rows={1}
            />

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                className={`h-9 w-9 rounded-xl transition-all duration-300 ${input ? 'bg-primary text-primary-foreground shadow-lg scale-100 hover:scale-105 active:scale-95' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 scale-95'}`}
                disabled={!input}
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
