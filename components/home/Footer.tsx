import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500">
              <Heart className="h-3 w-3 text-white" fill="white" />
            </div>
            <span className="text-sm font-semibold">CardioAI</span>
            <span className="text-sm text-muted-foreground">
              — AI Heart Disease Risk Predictor
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            For educational use only. Not a substitute for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
