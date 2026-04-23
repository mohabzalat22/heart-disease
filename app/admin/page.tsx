import { SystemRepo } from '../../repositories/systemRepo';
import { PromptEditor } from '../../components/admin/PromptEditor';

export default async function AdminPage() {
  const initialPrompt = await SystemRepo.getDefaultPrompt();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage system-wide configuration and default AI behavior.
        </p>
      </div>
      <PromptEditor initialPrompt={initialPrompt} />
    </div>
  );
}



