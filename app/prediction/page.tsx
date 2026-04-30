import { PredictionForm } from '@/components/prediction/PredictionForm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRepo } from '@/repositories/userRepo';

export default async function PredictionPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const verifiedUser = token ? await verifyToken(token) : null;

  if (!verifiedUser) {
    redirect('/login');
  }

  const user = await UserRepo.findById(verifiedUser.userId);
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            CardioAI <span className="text-red-500">Diagnostics</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
            Advanced heart disease risk prediction powered by machine learning and Model Context Protocol.
          </p>
        </div>
        <PredictionForm />
      </div>
    </div>
  );
}
