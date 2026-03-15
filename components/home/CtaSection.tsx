import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="border-t border-border/50 bg-muted/30 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500">
          <Heart className="h-8 w-8 text-white" fill="white" />
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">
          Your Heart Can&apos;t Wait
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Take 5 minutes now to understand your cardiovascular risk. Our AI will
          guide you through a simple conversation and give you actionable,
          personalized insights.
        </p>
        <Button asChild size="lg" className="h-12 px-10 text-base">
          <Link href="/chat">
            <Heart className="mr-2 h-5 w-5" />
            Start Free Assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">
          ⚠️ This tool is for educational purposes and does not replace
          professional medical advice. Consult your doctor for medical
          diagnosis.
        </p>
      </div>
    </section>
  );
}
