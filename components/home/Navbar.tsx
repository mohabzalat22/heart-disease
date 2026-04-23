import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { UserRepo } from '@/repositories/userRepo';

import { UserButton } from './user-button';
import { ModeToggle } from '@/components/mode-toggle';

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const verifiedUser = token ? await verifyToken(token) : null;

  const user = verifiedUser
    ? await UserRepo.findById(verifiedUser.userId)
    : null;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 shadow-sm shadow-rose-500/20">
            <Heart className="h-4 w-4 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight">CardioAI</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#stats"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Statistics
          </a>
          <a
            href="#risk-factors"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Risk Factors
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <ModeToggle />
              <UserButton
                user={{ name: user.name, email: user.email, image: user.image }}
              />
            </>
          ) : (
            <>
              <ModeToggle />
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          <Button asChild size="sm" className="hidden lg:flex">
            <Link href="/chat">
              Start Assessment
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
