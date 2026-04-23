import { SystemRepo } from '@/repositories/systemRepo';
import { PromptEditor } from '@/components/admin/PromptEditor';
import { LogViewer } from '@/components/admin/LogViewer';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = 'prompt' } = await searchParams;
  const initialPrompt = await SystemRepo.getDefaultPrompt();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          {view === 'logs'
            ? 'Monitor application activity and system logs.'
            : 'Manage system configurations and default AI behavior.'}
        </p>
      </div>

      <div className="w-full">
        {view === 'logs' ? (
          <LogViewer />
        ) : (
          <PromptEditor initialPrompt={initialPrompt} />
        )}
      </div>
    </div>
  );
}
