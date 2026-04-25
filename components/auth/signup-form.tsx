'use client';

import { useActionState, useState } from 'react';
import { motion } from 'framer-motion';
import { handleSignUp } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export function SignUpForm() {
  const [state, action, isPending] = useActionState(handleSignUp, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-6"
    >
      <form action={action}>
        <div className="grid gap-4">
          {state?.message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{state.message}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name" className={state?.errors?.name ? "text-destructive" : ""}>Full Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="John Doe" 
              required 
              className={state?.errors?.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {state?.errors?.name && (
              <div className="flex items-center gap-1.5 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>{state.errors.name}</span>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className={state?.errors?.email ? "text-destructive" : ""}>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              className={state?.errors?.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {state?.errors?.email && (
              <div className="flex items-center gap-1.5 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>{state.errors.email}</span>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className={state?.errors?.password ? "text-destructive" : ""}>Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className={`pr-10 ${state?.errors?.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {state?.errors?.password && (
              <div className="flex items-center gap-1.5 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>{state.errors.password}</span>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? 'Signing up...' : 'Sign up'}
          </Button>
        </div>
      </form>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-4 text-rose-500 hover:text-rose-600">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
