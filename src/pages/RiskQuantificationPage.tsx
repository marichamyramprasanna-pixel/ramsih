import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  ArrowRight,
  Info,
  CheckCircle2,
  Zap,
  Activity,
  ShieldAlert,
  Sparkles,
  Calculator
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
  const fair = riskSummary.fairMetrics;

  // Interactive What-If Simulation Sliders
  const [lossEventFrequency, setLossEventFrequency] = useState<number>(fair.lossFrequencyPerYear);
  const [patchCompliance, setPatchCompliance] = useState<number>(78); // 0-100%
  const [microsegmentation, setMicrosegmentation] = useState<number>(65); // 0-100%
  const [zeroTrustCoverage, setZeroTrustCoverage] = useState<number>(50); // 0-100%
  const [appliedSimulation, setAppliedSimulation] = useState<boolean>(false);

  // Baseline Annualized Loss Exposure (ALE)
  const baselineALE = Math.round(fair.singleLossExpectancyUSD * fair.lossFrequencyPerYear);

  // Simulated ALE reduction formula based on controls
  // Patching reduces SLE by up to 30%, microsegmentation reduces frequency by up to 40%, ZT reduces frequency by up to 25%
  const patchFactor = 1 - (patchCompliance / 100) * 0.35;
  const microFactor = 1 - (microsegmentation / 100) * 0.40;
  const zeroTrustFactor = 1 - (zeroTrustCoverage / 100) * 0.25;

  const simulatedSLE = Math.round(fair.singleLossExpectancyUSD * patchFactor);
  const simulatedFrequency = lossEventFrequency * microFactor * zeroTrustFactor;
  const simulatedALE = Math.round(simulatedSLE * simulatedFrequency);

  const aleSavings = Math.max(0, baselineALE - simulatedALE);
  const riskReductionPercentage = baselineALE > 0 ? Math.round((aleSavings / baselineALE) * 100) : 0;

  const lossCategories = [
    { label: 'Business Interruption & Production Downtime', percentage: 38, amountUSD: Math.round(simulatedALE * 0.38) },
    { label: 'Regulatory Fines & PCI-DSS Sanctions', percentage: 27, amountUSD: Math.round(simulatedALE * 0.27) },
    { label: 'Forensic Investigation & Incident Response', percentage: 19, amountUSD: Math.round(simulatedALE * 0.19) },
    { label: 'Customer Churn & Enterprise Brand Restitution', percentage: 16, amountUSD: Math.round(simulatedALE * 0.16) }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Floating Ambient Glowing Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl bg-orb-cyan pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl bg-orb-blue pointer-events-none" />
      {/* Toast Notification Banner */}
      {appliedSimulation && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-950/95 border border-emerald-500/50 rounded-xl shadow-2xl flex items-center gap-3 text-emerald-200 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Simulated Security Controls Applied to Baseline Telemetry Model!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold uppercase border border-cyan-800 flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              FAIR MODEL STANDARD
            </span>
            <span className="text-xs text-slate-500 font-mono">Factor Analysis of Information Risk</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Risk Quantification & What-If Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Translate abstract technical vulnerabilities into dollar-denominated loss exposures and simulate security ROI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('/reports')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Export FAIR Actuarial Report
          </button>
          <button
            onClick={() => onNavigate('/recommendations')}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            View Prioritized Recommendations
          </button>
        </div>
      </div>

      {/* Main FAIR Exposure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Total Expected Loss</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">
            ${(fair.totalExpectedLossUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Cumulative portfolio exposure</div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Single Loss Expectancy (SLE)</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300">
            ${(simulatedSLE / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Impact per catastrophic breach</div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Annualized Loss Exposure (ALE)</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-300">
            ${(simulatedALE / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Adjusted for current attack rate</div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Value-at-Risk (95% Confidence)</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-red-400">
            ${(fair.valueAtRisk95PercentileUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">Maximum expected annual loss</div>
        </div>
      </div>

      {/* Interactive What-If Simulator & Financial Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Interactive What-If Controls (6 cols) */}
        <div className="lg:col-span-6 p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Interactive What-If Control Simulator</span>
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 font-bold">
              -{riskReductionPercentage}% Risk Reduction
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Adjust security posture parameters below to simulate immediate financial loss reduction across enterprise assets.
          </p>

          <div className="space-y-4 pt-1">
            {/* Slider 1: Annual Attack Frequency */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">Threat Frequency (Attacks / Year):</span>
                <span className="font-mono font-bold text-cyan-300">{lossEventFrequency.toFixed(2)}x</span>
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
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.1x (Hardened Boundary)</span>
                <span>1.0x (Current Baseline)</span>
                <span>2.5x (Targeted Surge)</span>
              </div>
            </div>

            {/* Slider 2: Vulnerability Patch Compliance */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">CVE Patch Compliance Rate:</span>
                <span className="font-mono font-bold text-emerald-400">{patchCompliance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={patchCompliance}
                onChange={(e) => setPatchCompliance(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Unpatched)</span>
                <span>75% (Standard)</span>
                <span>100% (Zero Known Vulnerabilities)</span>
              </div>
            </div>

            {/* Slider 3: Network Microsegmentation */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">SDN Microsegmentation Enforcement:</span>
                <span className="font-mono font-bold text-purple-400">{microsegmentation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={microsegmentation}
                onChange={(e) => setMicrosegmentation(parseInt(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Flat Network)</span>
                <span>50% (Tier Isolated)</span>
                <span>100% (Strict eBPF Micro-Isolation)</span>
              </div>
            </div>

            {/* Slider 4: Zero Trust Teleport Coverage */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">Zero-Trust Identity & PAM Coverage:</span>
                <span className="font-mono font-bold text-amber-300">{zeroTrustCoverage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={zeroTrustCoverage}
                onChange={(e) => setZeroTrustCoverage(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Static Keys)</span>
                <span>50% (Hardware MFA)</span>
                <span>100% (Continuous Identity Telemetry)</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setAppliedSimulation(true);
              setTimeout(() => setAppliedSimulation(false), 3500);
            }}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Simulated Controls to Active Security Baseline</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Before vs After & Financial Category Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Before vs After Impact Box */}
          <div className="p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Simulated Loss Reduction vs Baseline</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Baseline Annual Loss (ALE):</div>
                <div className="text-2xl font-bold font-mono text-slate-300">
                  ${(baselineALE / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-500">Unmodified telemetry state</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                <div className="text-[11px] text-emerald-300">Simulated Annual Loss (ALE):</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  ${(simulatedALE / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-emerald-300/80 font-mono font-bold">
                  Saved ${(aleSavings / 1000000).toFixed(2)}M / year ({riskReductionPercentage}% reduction)
                </div>
              </div>
            </div>
          </div>

          {/* Loss Categorization Breakdown */}
          <div className="p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Simulated Financial Damage Vectors</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">FAIR Categorization</span>
            </div>

            <div className="space-y-3 pt-1">
              {lossCategories.map((cat, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.label}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-300 font-bold">${(cat.amountUSD / 1000000).toFixed(2)}M</span>
                      <span className="text-cyan-300 text-[11px] font-bold">{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
