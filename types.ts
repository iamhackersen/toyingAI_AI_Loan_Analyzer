export interface FinancialAnalysis {
  // Step 1: DSCR (Repayment)
  operatingCashFlow: number;
  totalDebtService: number;
  dscr: number;
  dscrVerdict: 'APPROVED' | 'REJECTED' | 'REVIEW';
  
  // Step 2: Leverage (Debt Load)
  fundedDebt: number;
  ebitda: number;
  debtToEbitda: number;
  leverageVerdict: 'SAFE' | 'RISKY' | 'REVIEW';

  // Step 3: Liquidity (Survival)
  currentAssets: number;
  currentLiabilities: number;
  currentRatio: number;
  liquidityVerdict: 'SAFE' | 'RISKY' | 'REVIEW';

  // Step 4: Solvency (Owner Commitment)
  totalLiabilities: number;
  totalEquity: number;
  debtToEquity: number;
  solvencyVerdict: 'SAFE' | 'RISKY' | 'REVIEW';

  // Meta
  currency: string;
  period: string;
  summary: string;
  confidenceScore: number;
}

export interface AnalysisState {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  data: FinancialAnalysis | null;
  error: string | null;
  fileName: string | null;
}