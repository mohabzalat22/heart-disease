import Link from 'next/link';
import { Heart, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { handleSignOut } from '@/actions/authActions';

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? await verifyToken(token) : null;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500">
            <Heart className="h-4 w-4 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold">CardioAI</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#stats"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Statistics
          </a>
          <a
            href="#risk-factors"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Risk Factors
          </a>
          <a
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 mr-4">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {user.email.split('@')[0]}
                </span>
              </div>
              <form action={handleSignOut}>
                <Button variant="outline" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          <Button asChild size="sm" className="hidden sm:flex">
            <Link href="/chat">
              Start Assessment
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
