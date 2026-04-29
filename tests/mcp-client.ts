import { mcpClientService } from "../services/mcpClientService";

async function run() {
  try {
    console.log("🔍 Listing tools...");
    const tools = await mcpClientService.listTools();
    console.log("🛠️  Available Tools:", JSON.stringify(tools, null, 2));

    // Test heart disease prediction (sample data)
    console.log("🫀 Calling predict_heart_disease...");
    const prediction = await mcpClientService.predictHeartDisease({
      age: 52,
      sex: 1,
      resting_bp: 125,
      cholesterol: 212,
      fasting_bs: 0,
      max_hr: 168,
      exercise_angina: 0,
      oldpeak: 1.0,
      chest_pain_type: "ASY",
      resting_ecg: "Normal",
      st_slope: "Flat"
    });
    console.log("📊 Prediction Result:", JSON.stringify(prediction, null, 2));

  } catch (error) {
    console.error("💥 Test failed:", error);
  }
}

run();