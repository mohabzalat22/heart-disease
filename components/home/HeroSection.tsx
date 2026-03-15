import Link from 'next/link';
import {
  Heart,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-1.5 text-sm text-rose-600 dark:text-rose-400">
            <Activity className="h-3.5 w-3.5" />
            AI-Powered Heart Disease Risk Assessment
          </div>

          <h1 className="mb-6 text-5xl leading-tight font-bold tracking-tight md:text-6xl lg:text-7xl">
            Know Your Heart&apos;s{' '}
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              Risk Today
            </span>
          </h1>

          <p className="mb-10 text-xl leading-relaxed text-muted-foreground">
            Heart disease kills 1 person every 33 seconds in the US alone. Our
            AI analyzes your health profile and gives you a personalized risk
            assessment — in just minutes.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/chat">
                <Heart className="mr-2 h-5 w-5" />
                Check My Risk Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
            >
              <a href="#stats">
                Learn More
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              No personal data stored
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Instant results
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Trained on clinical data
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
