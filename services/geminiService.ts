import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FinancialAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    // Step 1: DSCR
    operatingCashFlow: {
      type: Type.NUMBER,
      description: "Net Operating Cash Flow."
    },
    totalDebtService: {
      type: Type.NUMBER,
      description: "Total annual debt service (Principal + Interest)."
    },
    dscr: {
      type: Type.NUMBER,
      description: "Operating Cash Flow / Total Debt Service."
    },
    dscrVerdict: {
      type: Type.STRING,
      enum: ["APPROVED", "REJECTED", "REVIEW"],
      description: "APPROVED if DSCR >= 1.25, REJECTED if < 1.25."
    },
    // Step 2: Leverage
    fundedDebt: {
      type: Type.NUMBER,
      description: "Total Funded Debt (Short Term Debt + Long Term Debt)."
    },
    ebitda: {
      type: Type.NUMBER,
      description: "Earnings Before Interest, Taxes, Depreciation, and Amortization."
    },
    debtToEbitda: {
      type: Type.NUMBER,
      description: "Funded Debt / EBITDA."
    },
    leverageVerdict: {
      type: Type.STRING,
      enum: ["SAFE", "RISKY", "REVIEW"],
      description: "SAFE if Debt/EBITDA < 3.0, RISKY if >= 3.0."
    },
    // Step 3: Liquidity
    currentAssets: {
      type: Type.NUMBER,
      description: "Total Current Assets."
    },
    currentLiabilities: {
      type: Type.NUMBER,
      description: "Total Current Liabilities."
    },
    currentRatio: {
      type: Type.NUMBER,
      description: "Current Assets / Current Liabilities."
    },
    liquidityVerdict: {
      type: Type.STRING,
      enum: ["SAFE", "RISKY", "REVIEW"],
      description: "SAFE if Current Ratio >= 1.2, RISKY if < 1.2."
    },
    // Step 4: Solvency
    totalLiabilities: {
      type: Type.NUMBER,
      description: "Total Liabilities."
    },
    totalEquity: {
      type: Type.NUMBER,
      description: "Total Owner's Equity."
    },
    debtToEquity: {
      type: Type.NUMBER,
      description: "Total Liabilities / Total Equity."
    },
    solvencyVerdict: {
      type: Type.STRING,
      enum: ["SAFE", "RISKY", "REVIEW"],
      description: "SAFE if Debt/Equity <= 2.5, RISKY if > 2.5."
    },
    // Meta
    currency: { type: Type.STRING },
    period: { type: Type.STRING },
    summary: { type: Type.STRING, description: "Executive summary covering DSCR, Leverage, Liquidity, and Solvency." },
    confidenceScore: { type: Type.NUMBER }
  },
  required: [
    "operatingCashFlow",
    "totalDebtService",
    "dscr",
    "dscrVerdict",
    "fundedDebt",
    "ebitda",
    "debtToEbitda",
    "leverageVerdict",
    "currentAssets",
    "currentLiabilities",
    "currentRatio",
    "liquidityVerdict",
    "totalLiabilities",
    "totalEquity",
    "debtToEquity",
    "solvencyVerdict",
    "currency",
    "summary",
    "confidenceScore"
  ]
};

export const analyzeDocument = async (file: File): Promise<FinancialAnalysis> => {
  const base64Data = await fileToBase64(file);
  // Ensure we get the data part even if split fails or format is different
  const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const mimeType = file.type;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Content } },
          {
            text: `Perform a comprehensive credit analysis on this financial statement for a banker.
            
            STEP 1: Verify Repayment Capacity (Cash Flow)
            - Goal: "Can they make the monthly payments?"
            - Calculate DSCR = Net Operating Cash Flow / Total Debt Service.
            - Benchmark: DSCR >= 1.25 is APPROVED. Below is REJECTED.

            STEP 2: Measure Total Debt Load (Leverage)
            - Goal: "Is the company borrowing more than it is worth?"
            - Calculate Funded Debt to EBITDA = Total Interest Bearing Debt / EBITDA.
            - Benchmark: Ratio < 3.0x is SAFE. Ratio >= 3.0x is RISKY.
            - Note: Funded Debt = Short Term Debt + Long Term Debt.

            STEP 3: Assess Short-Term Survival (Liquidity)
            - Goal: "Can they pay their bills if a client pays late?"
            - Calculate Current Ratio = Current Assets / Current Liabilities.
            - Benchmark: Ratio >= 1.2x is SAFE. Below is RISKY.

            STEP 4: Confirm Owner Commitment (Solvency)
            - Goal: "Do the owners have skin in the game?"
            - Calculate Debt-to-Equity Ratio = Total Liabilities / Total Equity.
            - Benchmark: Ratio <= 2.5x is SAFE. Ratio > 2.5x is RISKY.
            
            Provide a strict verdict for all four steps.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Sanitize JSON string: remove markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Remove potential trailing commas which are common in LLM JSON but invalid in standard JSON
    text = text.replace(/,(\s*[}\]])/g, '$1');
    
    return JSON.parse(text) as FinancialAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the document. Ensure it contains clear Balance Sheet and Cash Flow data.");
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
