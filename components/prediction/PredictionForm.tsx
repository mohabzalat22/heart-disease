'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { predictHeartDiseaseAction } from '@/actions/predictionActions';
import { toast } from 'sonner';
import { Loader2, Activity, Heart, AlertCircle } from 'lucide-react';
import { PredictHeartDiseaseResponse, PredictHeartDiseaseArgs } from '@/types/index';

const formSchema = z.object({
  age: z.coerce.number().min(1).max(120),
  sex: z.coerce.number().min(0).max(1),
  resting_bp: z.coerce.number().min(50).max(250),
  cholesterol: z.coerce.number().min(50).max(600),
  fasting_bs: z.coerce.number().min(0).max(1),
  max_hr: z.coerce.number().min(50).max(250),
  exercise_angina: z.coerce.number().min(0).max(1),
  oldpeak: z.coerce.number().min(0).max(10),
  chest_pain_type: z.enum(['ASY', 'NAP', 'ATA', 'TA']),
  resting_ecg: z.enum(['Normal', 'ST', 'LVH']),
  st_slope: z.enum(['Flat', 'Up', 'Down']),
});

interface FormValues {
  age: number;
  sex: number;
  resting_bp: number;
  cholesterol: number;
  fasting_bs: number;
  max_hr: number;
  exercise_angina: number;
  oldpeak: number;
  chest_pain_type: 'ASY' | 'NAP' | 'ATA' | 'TA';
  resting_ecg: 'Normal' | 'ST' | 'LVH';
  st_slope: 'Flat' | 'Up' | 'Down';
}

export function PredictionForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictHeartDiseaseResponse | string | null>(null);

  const form = useForm<FormValues>({
    // @ts-expect-error - zodResolver type mismatch with coerce
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 50,
      sex: 1,
      resting_bp: 120,
      cholesterol: 200,
      fasting_bs: 0,
      max_hr: 150,
      exercise_angina: 0,
      oldpeak: 1.0,
      chest_pain_type: 'ASY',
      resting_ecg: 'Normal',
      st_slope: 'Flat',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await predictHeartDiseaseAction(data as unknown as PredictHeartDiseaseArgs);
      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        setResult(response.data);
        toast.success('Prediction completed successfully!');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Heart Disease Risk Assessment
          </CardTitle>
          <CardDescription>
            Enter patient clinical data to predict heart disease risk using our AI model via MCP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" {...form.register('age')} />
              {form.formState.errors.age && <p className="text-xs text-red-500">{form.formState.errors.age.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex (1: Male, 0: Female)</Label>
              <select 
                id="sex" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('sex')}
              >
                <option value={1}>Male</option>
                <option value={0}>Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resting_bp">Resting Blood Pressure (mm Hg)</Label>
              <Input id="resting_bp" type="number" {...form.register('resting_bp')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cholesterol">Serum Cholesterol (mm/dl)</Label>
              <Input id="cholesterol" type="number" {...form.register('cholesterol')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fasting_bs">Fasting Blood Sugar &gt; 120 mg/dl (1: True, 0: False)</Label>
              <select 
                id="fasting_bs" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                {...form.register('fasting_bs')}
              >
                <option value={0}>False</option>
                <option value={1}>True</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_hr">Max Heart Rate</Label>
              <Input id="max_hr" type="number" {...form.register('max_hr')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise_angina">Exercise Induced Angina (1: Yes, 0: No)</Label>
              <select 
                id="exercise_angina" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                {...form.register('exercise_angina')}
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oldpeak">Oldpeak (ST depression)</Label>
              <Input id="oldpeak" type="number" step="0.1" {...form.register('oldpeak')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chest_pain_type">Chest Pain Type</Label>
              <select 
                id="chest_pain_type" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                {...form.register('chest_pain_type')}
              >
                <option value="ASY">Asymptomatic (ASY)</option>
                <option value="NAP">Non-Anginal Pain (NAP)</option>
                <option value="ATA">Atypical Angina (ATA)</option>
                <option value="TA">Typical Angina (TA)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resting_ecg">Resting ECG</Label>
              <select 
                id="resting_ecg" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                {...form.register('resting_ecg')}
              >
                <option value="Normal">Normal</option>
                <option value="ST">ST-T wave abnormality</option>
                <option value="LVH">Left ventricular hypertrophy</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="st_slope">ST Slope</Label>
              <select 
                id="st_slope" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                {...form.register('st_slope')}
              >
                <option value="Flat">Flat</option>
                <option value="Up">Up</option>
                <option value="Down">Down</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-4">
              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-5 w-5" />
                    Get AI Prediction
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-2 shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${typeof result === 'string' ? 'border-primary bg-primary/5' : (result.prediction === 1 ? 'border-red-500 bg-red-50/10' : 'border-green-500 bg-green-50/10')}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {typeof result === 'string' ? (
                <Activity className="text-primary" />
              ) : (
                result.prediction === 1 ? <AlertCircle className="text-red-500" /> : <Heart className="text-green-500" />
              )}
              {typeof result === 'string' ? 'Prediction Result' : `Prediction Result: ${result.risk_level || (result.prediction === 1 ? 'High risk of heart disease' : 'Low risk of heart disease')}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof result === 'string' ? (
              <div className="whitespace-pre-wrap font-mono text-lg p-4 rounded-lg bg-background/50 border">
                {result}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border">
                  <span className="text-lg font-medium">Probability:</span>
                  <span className="text-2xl font-bold text-primary">
                    {((result.probability || result.probability_of_disease || 0) * 100).toFixed(2)}%
                  </span>
                </div>
                
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {result.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.result_text && (
                  <div className="p-4 rounded-lg bg-muted/30 italic">
                    {result.result_text}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
