import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { UserRepo } from '@/repositories/userRepo';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);
  const user = payload ? await UserRepo.findById(payload.userId) : null;

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-md w-full">
          <Alert
            variant="destructive"
            className="flex flex-col items-center text-center p-8 space-y-4"
          >
            <ShieldAlert className="w-12 h-12 mb-2" />
            <div className="space-y-2">
              <AlertTitle className="text-2xl font-bold">
                Access Denied
              </AlertTitle>
              <AlertDescription className="text-muted-foreground text-base">
                You do not have the necessary permissions to access the admin
                dashboard.
              </AlertDescription>
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-6 mt-5" />
            <BreadcrumbNav />
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
