import React from 'react';
import { FinancialAnalysis } from '../types';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Activity, Scale } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface AnalysisResultProps {
  data: FinancialAnalysis;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onReset }) => {
  const isDscrApproved = data.dscrVerdict === 'APPROVED';
  const isLeverageSafe = data.leverageVerdict === 'SAFE';
  const isLiquiditySafe = data.liquidityVerdict === 'SAFE';
  const isSolvencySafe = data.solvencyVerdict === 'SAFE';
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const dscrChartData = [
    { name: 'Cash Flow', value: data.operatingCashFlow, fill: '#10b981' },
    { name: 'Debt Service', value: data.totalDebtService, fill: '#ef4444' },
  ];
  
  const liquidityChartData = [
    { name: 'Current Assets', value: data.currentAssets, fill: '#8b5cf6' }, // Violet
    { name: 'Current Liab.', value: data.currentLiabilities, fill: '#ef4444' }, // Red
  ];

  const solvencyChartData = [
    { name: 'Total Equity', value: data.totalEquity, fill: '#0ea5e9' }, // Sky Blue
    { name: 'Total Liab.', value: data.totalLiabilities, fill: '#f59e0b' }, // Amber
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Executive Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Executive Summary
        </h3>
        <p className="text-slate-600 leading-relaxed">
          {data.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* STEP 1: CASH FLOW */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className={`p-6 border-b ${isDscrApproved ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 1</span>
                <h2 className="text-lg font-bold text-slate-900">Cash Flow</h2>
                <p className="text-xs text-slate-500 mt-1">"Can they pay?"</p>
              </div>
              {isDscrApproved ? 
                <CheckCircle className="w-6 h-6 text-green-600" /> : 
                <XCircle className="w-6 h-6 text-red-600" />
              }
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-slate-500 block mb-1">DSCR Ratio</span>
                <span className={`text-3xl font-black ${isDscrApproved ? 'text-slate-800' : 'text-red-600'}`}>
                  {data.dscr.toFixed(2)}x
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 block">Target</span>
                <span className="text-sm font-bold text-slate-600">≥ 1.25x</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-grow space-y-4">
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Operating Cash Flow</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.operatingCashFlow)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Debt Service</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.totalDebtService)}</span>
                </div>
             </div>

             <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dscrChartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip cursor={{fill: 'transparent'}} formatter={(val: number) => formatCurrency(val)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {dscrChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <p className="text-xs text-slate-400 italic text-center">
               Generates ${data.dscr.toFixed(2)} for every $1.00 of debt payment.
             </p>
          </div>
        </div>

        {/* STEP 2: LEVERAGE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className={`p-6 border-b ${isLeverageSafe ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
             <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 2</span>
                <h2 className="text-lg font-bold text-slate-900">Debt Load</h2>
                <p className="text-xs text-slate-500 mt-1">"Is borrowing > worth?"</p>
              </div>
              {isLeverageSafe ? 
                <CheckCircle className="w-6 h-6 text-blue-600" /> : 
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              }
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-slate-500 block mb-1">Debt / EBITDA</span>
                <span className={`text-3xl font-black ${isLeverageSafe ? 'text-slate-800' : 'text-orange-600'}`}>
                  {data.debtToEbitda.toFixed(2)}x
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 block">Limit</span>
                <span className="text-sm font-bold text-slate-600">&lt; 3.0x</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-grow space-y-4">
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Funded Debt</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.fundedDebt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">EBITDA</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.ebitda)}</span>
                </div>
             </div>

             <div className="relative pt-6 pb-2">
               <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-green-400 to-blue-400 w-3/4"></div>
                  <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 w-1/4"></div>
               </div>
               
               <div 
                 className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000"
                 style={{ left: `${Math.min((data.debtToEbitda / 4) * 100, 100)}%` }}
               >
                  <div className="w-1 h-6 bg-slate-800 rounded-full"></div>
                  <span className="text-xs font-bold text-slate-800 mt-1">{data.debtToEbitda.toFixed(1)}x</span>
               </div>
             </div>
             
             <p className="text-xs text-slate-400 italic text-center">
               Takes {data.debtToEbitda.toFixed(1)} years to pay off debt.
             </p>
          </div>
        </div>

        {/* STEP 3: LIQUIDITY */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className={`p-6 border-b ${isLiquiditySafe ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
             <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 3</span>
                <h2 className="text-lg font-bold text-slate-900">Liquidity</h2>
                <p className="text-xs text-slate-500 mt-1">"Can they survive?"</p>
              </div>
              {isLiquiditySafe ? 
                <CheckCircle className="w-6 h-6 text-indigo-600" /> : 
                <AlertTriangle className="w-6 h-6 text-red-600" />
              }
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-slate-500 block mb-1">Current Ratio</span>
                <span className={`text-3xl font-black ${isLiquiditySafe ? 'text-slate-800' : 'text-red-600'}`}>
                  {data.currentRatio.toFixed(2)}x
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 block">Target</span>
                <span className="text-sm font-bold text-slate-600">≥ 1.2x</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-grow space-y-4">
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Current Assets</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.currentAssets)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Current Liab.</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.currentLiabilities)}</span>
                </div>
             </div>

             <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liquidityChartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip cursor={{fill: 'transparent'}} formatter={(val: number) => formatCurrency(val)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {liquidityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             
             <p className="text-xs text-slate-400 italic text-center">
               Has ${data.currentRatio.toFixed(2)} in assets for every $1 of bills due.
             </p>
          </div>
        </div>

        {/* STEP 4: SOLVENCY */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className={`p-6 border-b ${isSolvencySafe ? 'bg-teal-50 border-teal-100' : 'bg-orange-50 border-orange-100'}`}>
             <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 4</span>
                <h2 className="text-lg font-bold text-slate-900">Solvency</h2>
                <p className="text-xs text-slate-500 mt-1">"Skin in the game?"</p>
              </div>
              {isSolvencySafe ? 
                <CheckCircle className="w-6 h-6 text-teal-600" /> : 
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              }
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-slate-500 block mb-1">Debt / Equity</span>
                <span className={`text-3xl font-black ${isSolvencySafe ? 'text-slate-800' : 'text-orange-600'}`}>
                  {data.debtToEquity.toFixed(2)}x
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 block">Target</span>
                <span className="text-sm font-bold text-slate-600">≤ 2.5x</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-grow space-y-4">
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Liabilities</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.totalLiabilities)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Equity</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.totalEquity)}</span>
                </div>
             </div>

             <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={solvencyChartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip cursor={{fill: 'transparent'}} formatter={(val: number) => formatCurrency(val)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {solvencyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             
             <p className="text-xs text-slate-400 italic text-center">
               For every $1 of owner money, they owe ${data.debtToEquity.toFixed(2)} to others.
             </p>
          </div>
        </div>

      </div>

      <div className="flex justify-center pb-12 pt-4">
        <button
          onClick={onReset}
          className="flex items-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-xl shadow-slate-200"
        >
          Analyze Another Statement
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AnalysisResult;