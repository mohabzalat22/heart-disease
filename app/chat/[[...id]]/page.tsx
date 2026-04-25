import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { UserRepo } from '@/repositories/userRepo';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ChatContainer } from '@/components/chat/chat-container';
import { Actor } from '@/generated/prisma';

import { HistoryProvider } from '@/hooks/use-history';

export default async function ChatPage({
  params,
}: {
  params: { id: string[] };
}) {
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

  const chatParam = (await params).id;
  const tokenParam = chatParam ? chatParam[0] : null;

  let chatId: number | null = null;
  let chatRecord = null;

  if (tokenParam) {
    chatRecord = await prisma.chat.findUnique({
      where: { token: tokenParam },
    });

    if (!chatRecord) {
      redirect('/chat');
    }
    chatId = chatRecord.id;
  }

  // Fetch chats for the sidebar
  const chats = await prisma.chat.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  let initialMessages: { role: 'user' | 'assistant'; content: string }[] = [];

  if (chatId) {
    const dbMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    initialMessages = dbMessages.map((m) => ({
      role: m.actor === Actor.USER ? 'user' : 'assistant',
      content: m.message,
    }));
  }

  if (initialMessages.length === 0) {
    initialMessages = [
      {
        role: 'assistant',
        content: `Hello ${user.name}! I'm your CardioAI assistant. How can I help you with your heart health today?`,
      },
    ];
  }

  return (
    <SidebarProvider>
      <HistoryProvider>
        <ChatSidebar
          user={{ name: user.name, email: user.email, image: user.image, tokens: user.tokens }}
          chats={chats}
        />
        <ChatContainer
          user={{ name: user.name, email: user.email, image: user.image }}
          initialMessages={initialMessages}
          chatId={chatId || 0}
          token={chatRecord?.token || ''}
          isShared={chatRecord?.isShared || false}
        />
      </HistoryProvider>
    </SidebarProvider>
  );
}
