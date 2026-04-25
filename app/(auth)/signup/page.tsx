import { SignUpForm } from '@/components/auth/signup-form';
import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand/Hero Section */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-zinc-900/50 z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>
        
        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl">
          <Activity className="h-8 w-8 text-rose-500" />
          <span>CardioCare AI</span>
        </div>
        
        <div className="relative z-10">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;Join our network of healthcare professionals pushing the boundaries of cardiovascular care with AI-driven insights.&quot;
            </p>
            <footer className="text-sm text-zinc-400">CardioCare AI Team</footer>
          </blockquote>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-col justify-center items-center p-8 bg-background relative">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 font-bold text-xl">
          <Activity className="h-6 w-6 text-rose-500" />
          <span>CardioCare AI</span>
        </div>
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-muted-foreground">
              Enter your details to get started
            </p>
          </div>
          <SignUpForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
