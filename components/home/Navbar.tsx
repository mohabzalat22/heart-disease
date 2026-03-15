import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500">
            <Heart className="h-4 w-4 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold">CardioAI</span>
        </div>

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

        <Button asChild size="sm">
          <Link href="/chat">
            Start Assessment
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
