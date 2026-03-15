import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import WarningSigns from '@/components/home/WarningSigns';
import RiskFactors from '@/components/home/RiskFactors';
import FeaturesSection from '@/components/home/FeaturesSection';
import CtaSection from '@/components/home/CtaSection';
import Footer from '@/components/home/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <WarningSigns />
      <RiskFactors />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
