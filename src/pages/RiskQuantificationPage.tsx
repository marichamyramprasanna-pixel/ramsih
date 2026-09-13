import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';
import { FAIRMetrics, EnterpriseRiskSummary } from '../types';

interface RiskQuantificationPageProps {
  riskSummary: EnterpriseRiskSummary;
  onNavigate: (route: string) => void;
}

export const RiskQuantificationPage: React.FC<RiskQuantificationPageProps> = ({
  riskSummary,
  onNavigate
}) => {
  const [lossEventFrequency, setLossEventFrequency] = useState<number>(riskSummary.fairMetrics.lossFrequencyPerYear);
  const fair = riskSummary.fairMetrics;

  // Dynamic calculations based on slider
  const dynamicALE = Math.round(fair.singleLossExpectancyUSD * lossEventFrequency);

  const lossCategories = [
    { label: 'Business Interruption & Downtime', percentage: 38, amountUSD: Math.round(fair.totalExpectedLossUSD * 0.38) },
    { label: 'Regulatory & PCI Compliance Fines', percentage: 27, amountUSD: Math.round(fair.totalExpectedLossUSD * 0.27) },
    { label: 'Forensic Investigation & Incident Response', percentage: 19, amountUSD: Math.round(fair.totalExpectedLossUSD * 0.19) },
    { label: 'Customer Churn & Brand Restitution', percentage: 16, amountUSD: Math.round(fair.totalExpectedLossUSD * 0.16) }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold uppercase border border-cyan-800">
              FAIR STANDARD
            </span>
            <span className="text-xs text-slate-500 font-mono">Factor Analysis of Information Risk</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Numerical Risk & Financial Exposure</h1>
          <p className="text-xs text-slate-400">
            Translating abstract cyber risk scores into mathematically quantified financial loss distributions.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/recommendations')}
          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          View Loss-Reducing Actions
        </button>
      </div>

      {/* Main Exposure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs">Total Expected Loss</div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">
            ${(fair.totalExpectedLossUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Cumulative portfolio exposure</div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs">Single Loss Expectancy (SLE)</div>
          <div className="text-3xl font-extrabold font-mono text-amber-300">
            ${(fair.singleLossExpectancyUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Impact per catastrophic event</div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs">Annualized Loss Exposure (ALE)</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-300">
            ${(dynamicALE / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Adjusted for current attack rate</div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs">Value-at-Risk (95% Confidence)</div>
          <div className="text-3xl font-extrabold font-mono text-red-400">
            ${(fair.valueAtRisk95PercentileUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Maximum expected annual loss</div>
        </div>
      </div>

      {/* Loss Distribution Breakdown & Interactive Sensitivity Modeling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-7 p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Financial Loss Categorization</span>
          </h2>
          <p className="text-xs text-slate-400">
            Estimated financial damages broken down across regulatory, technical, and operational vectors.
          </p>

          <div className="space-y-3 pt-2">
            {lossCategories.map((cat, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{cat.label}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400 font-bold">${(cat.amountUSD / 1000000).toFixed(2)}M</span>
                    <span className="text-cyan-300 text-[11px]">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monte Carlo & Sensitivity Simulation */}
        <div className="lg:col-span-5 p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Monte Carlo Sensitivity Simulation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulate how threat frequency modifications alter Annualized Loss Exposure.
          </p>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-300">Annual Attack Frequency (events/yr):</span>
                <span className="font-mono font-bold text-cyan-300">{lossEventFrequency}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={lossEventFrequency}
                onChange={(e) => setLossEventFrequency(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0.1x (Hardened)</span>
                <span>1.0x (Normal)</span>
                <span>2.5x (Targeted)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Simulated Annual Loss (ALE):</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                ${(dynamicALE / 1000000).toFixed(2)}M / year
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('/reports')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              Export FAIR Actuarial Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
