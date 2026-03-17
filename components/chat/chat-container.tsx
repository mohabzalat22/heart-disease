'use client';

import * as React from 'react';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { SidebarInset } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User as UserIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContainerProps {
  user: { name: string; email: string; image: string | null };
  initialMessages: Message[];
  chatId: number;
}

export function ChatContainer({
  user,
  initialMessages,
  chatId,
}: ChatContainerProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    );
    if (scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: content }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Update URL if it's a new chat
      const newChatId = response.headers.get('X-Chat-Id');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const { content } = JSON.parse(data);
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            } catch (e) {
              console.error('Chat error:', e);
            }
          }
        }
      }

      // Redirect if it was a new chat
      if (newChatId && chatId === 0) {
        router.push(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background/50">
      <ChatHeader user={user} />

      <main className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4 lg:px-0" ref={scrollRef}>
          <div className="max-w-3xl mx-auto py-8 space-y-8 pb-32">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 group animate-in slide-in-from-bottom-2 duration-500 fade-in fill-mode-both`}
                style={{ animationDelay: `${i * 10}ms` }}
              >
                <Avatar
                  className={`h-8 w-8 shrink-0 mt-0.5 shadow-sm ring-1 ring-border/50 ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                >
                  <AvatarImage
                    src={
                      msg.role === 'assistant'
                        ? '/ai-avatar.png'
                        : user.image || '/user-avatar.png'
                    }
                  />
                  <AvatarFallback>
                    {msg.role === 'assistant' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold tracking-tight text-foreground/90">
                      {msg.role === 'assistant' ? 'CardioAI' : 'You'}
                    </p>
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground prose prose-neutral dark:prose-invert max-w-none">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </main>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </SidebarInset>
  );
}
