export interface PredictHeartDiseaseArgs {
  age: number;
  sex: number;
  resting_bp: number;
  cholesterol: number;
  fasting_bs: number;
  max_hr: number;
  exercise_angina: number;
  oldpeak: number;
  chest_pain_type: "ASY" | "NAP" | "ATA" | "TA";
  resting_ecg: "Normal" | "ST" | "LVH";
  st_slope: "Flat" | "Up" | "Down";
}

export interface PredictHeartDiseaseResponse {
  prediction: number;
  probability: number;
  risk_level: string;
  recommendations: string[];
  result_text?: string;
  probability_of_disease?: number;
}