import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { UserRepo } from '@/repositories/userRepo';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ChatPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const verifiedUser = token ? await verifyToken(token) : null;

  if (!verifiedUser) {
    redirect('/login');
  }

  const user = await UserRepo.findById(verifiedUser.userId);
  if (!user) {
    redirect('/login');
  }

  // Fetch chats for the sidebar
  const chats = await prisma.chat.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // For now, using mock messages, but in a real app, you'd fetch them based on chatId
  const messages = [
    {
      role: 'assistant',
      content: `Hello ${user.name}! I'm your CardioAI assistant. How can I help you with your heart health today?`,
    },
  ];

  return (
    <SidebarProvider>
      <ChatSidebar
        user={{ name: user.name, email: user.email, image: user.image }}
        chats={chats}
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background/50">
        <ChatHeader
          user={{ name: user.name, email: user.email, image: user.image }}
        />

        <main className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full px-4 lg:px-0">
            <div className="max-w-3xl mx-auto py-8 space-y-8 pb-32">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-4 group animate-in slide-in-from-bottom-2 duration-500 fade-in fill-mode-both`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Avatar
                    className={`h-8 w-8 shrink-0 mt-0.5 shadow-sm ring-1 ring-border/50 ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                  >
                    <AvatarImage
                      src={
                        msg.role === 'assistant'
                          ? '/ai-avatar.png'
                          : '/user-avatar.png'
                      }
                    />
                    <AvatarFallback>
                      {msg.role === 'assistant' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
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

        <ChatInput />
      </SidebarInset>
    </SidebarProvider>
  );
}
