import { AuthGuard } from '@/components/auth-guard';
import { WorkspaceShell } from '@/features/workspace/components/workspace-shell';

export default function AppPage() {
  return (
    <AuthGuard>
      <WorkspaceShell />
    </AuthGuard>
  );
}
