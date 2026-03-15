import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { warningSymptoms } from '@/components/home/data';

export default function WarningSigns() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-10 text-white shadow-2xl">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                Warning Signs
              </div>
              <h2 className="mb-4 text-3xl font-bold">
                Know the Warning Signs of a Heart Attack
              </h2>
              <p className="mb-8 text-rose-100">
                If you experience any of these symptoms, seek emergency medical
                care immediately. Early action saves lives.
              </p>
              <Button
                asChild
                className="border border-white/30 bg-white text-rose-600 hover:bg-white/90"
                size="lg"
              >
                <Link href="/chat">
                  Assess My Risk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {warningSymptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm"
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-white" />
                  {symptom}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
