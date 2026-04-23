import { SystemRepo } from '@/repositories/systemRepo';
import { PromptEditor } from '@/components/admin/PromptEditor';
import { LogViewer } from '@/components/admin/LogViewer';
import { UserManagement } from '@/components/admin/UserManagement';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = 'prompt' } = await searchParams;
  const initialPrompt = await SystemRepo.getDefaultPrompt();

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const payload = token ? await verifyToken(token) : null;
  const currentUserId = payload?.userId;

  let description = '';
  switch (view) {
    case 'logs':
      description = 'Monitor application activity and system logs.';
      break;
    case 'users':
      description = 'Manage application users and account access.';
      break;
    default:
      description = 'Manage system configurations and default AI behavior.';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="w-full">
        {view === 'logs' ? (
          <LogViewer />
        ) : view === 'users' ? (
          <UserManagement currentUserId={currentUserId} />
        ) : (
          <PromptEditor initialPrompt={initialPrompt} />
        )}
      </div>
    </div>
  );
}
