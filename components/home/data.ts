import {
  Heart,
  ShieldCheck,
  TrendingUp,
  Zap,
  Brain,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

export const stats = [
  {
    value: '17.9M',
    label: 'Deaths per year',
    sublabel: 'Globally from cardiovascular disease',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    value: '32%',
    label: 'Of all deaths',
    sublabel: 'Heart disease is the #1 global killer',
    icon: TrendingUp,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    value: '80%',
    label: 'Preventable',
    sublabel: 'Cases through early detection & lifestyle changes',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    value: '5min',
    label: 'Assessment time',
    sublabel: 'Get your AI-powered risk prediction instantly',
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
];

export const riskFactors = [
  {
    title: 'High Blood Pressure',
    description:
      'Hypertension forces the heart to work harder, damaging arteries over time.',
    prevalence: '47%',
    severity: 'High',
    severityColor: 'text-rose-500 bg-rose-500/10',
  },
  {
    title: 'High Cholesterol',
    description:
      'LDL buildup in arteries restricts blood flow and increases clot risk.',
    prevalence: '38%',
    severity: 'High',
    severityColor: 'text-rose-500 bg-rose-500/10',
  },
  {
    title: 'Diabetes',
    description:
      'High blood sugar damages blood vessels, doubling cardiovascular risk.',
    prevalence: '11%',
    severity: 'High',
    severityColor: 'text-rose-500 bg-rose-500/10',
  },
  {
    title: 'Obesity',
    description: 'Excess weight strains the heart and promotes inflammation.',
    prevalence: '42%',
    severity: 'Medium',
    severityColor: 'text-orange-500 bg-orange-500/10',
  },
  {
    title: 'Smoking',
    description:
      'Toxins in tobacco damage vessel walls and accelerate artery hardening.',
    prevalence: '14%',
    severity: 'High',
    severityColor: 'text-rose-500 bg-rose-500/10',
  },
  {
    title: 'Physical Inactivity',
    description:
      'Sedentary lifestyles weaken the heart and promote weight gain.',
    prevalence: '25%',
    severity: 'Medium',
    severityColor: 'text-orange-500 bg-orange-500/10',
  },
];

export const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description:
      'Our model analyzes your health data using machine learning trained on thousands of patient records.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Conversational Interface',
    description:
      'Chat naturally with our AI assistant. No confusing forms — just a friendly conversation about your health.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Detailed Risk Report',
    description:
      'Get a comprehensive breakdown of your risk level with personalized recommendations and next steps.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Private & Secure',
    description:
      'Your health data is encrypted and never shared. We take your privacy as seriously as your health.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
];

export const warningSymptoms = [
  'Chest pain or pressure',
  'Shortness of breath',
  'Pain radiating to arm, jaw, or back',
  'Unusual fatigue',
  'Dizziness or lightheadedness',
  'Irregular heartbeat',
];
