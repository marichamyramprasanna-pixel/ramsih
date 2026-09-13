import React, { useState } from 'react';
import { 
  CheckSquare, 
  ShieldCheck, 
  DollarSign, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Award,
  Layers,
  Calendar
} from 'lucide-react';
import { Recommendation, InfrastructureNode } from '../types';

interface RecommendationsPageProps {
  recommendations: Recommendation[];
  nodes: InfrastructureNode[];
  onApplyRecommendation: (id: string) => Promise<boolean>;
  onSelectNode: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  recommendations,
  nodes,
  onApplyRecommendation,
  onSelectNode,
  onNavigate
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleApply = async (rec: Recommendation) => {
    setLoadingId(rec.id);
    const success = await onApplyRecommendation(rec.id);
    setLoadingId(null);
    if (success) {
      setSuccessToast(`Applied "${rec.title}"! Risk posture updated.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const totalPossibleSavings = recommendations
    .filter((r) => r.status === 'pending')
    .reduce((acc, r) => acc + r.financialRiskReductionUSD, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-950/95 border border-emerald-500/50 rounded-xl shadow-2xl flex items-center gap-3 text-emerald-200 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-bold uppercase border border-blue-800">
              REMEDIATION ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">Quantified ROI Prioritization</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Prioritized Defensive Actions</h1>
          <p className="text-xs text-slate-400">
            Remediate high-impact vulnerabilities and misconfigurations ordered by maximum loss reduction.
          </p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs flex items-center gap-3">
          <span className="text-slate-400">Potential Portfolio Savings:</span>
          <span className="text-emerald-400 font-bold font-mono text-sm">
            ${(totalPossibleSavings / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isApplied = rec.status === 'applied';
          const isLoading = loadingId === rec.id;
          const targetNode = nodes.find((n) => n.id === rec.targetAssetId);

          return (
            <div
              key={rec.id}
              id={`rec-${rec.id}`}
              className={`p-5 rounded-2xl border transition-all ${
                isApplied
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  : 'bg-[#090d15] border-slate-800 shadow-xl'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      rec.priority.includes('P1') ? 'bg-red-950 text-red-300 border-red-800' :
                      rec.priority.includes('P2') ? 'bg-orange-950 text-orange-300 border-orange-800' :
                      'bg-blue-950 text-blue-300 border-blue-800'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="text-xs font-mono text-slate-500">Effort: {rec.effortDays} Days</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">Action: <strong className="text-slate-200">{rec.actionType}</strong></span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">Target Asset: <strong className="text-slate-200">{rec.targetAssetName}</strong></span>
                  </div>

                  <h3 className="text-base font-bold text-white">{rec.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{rec.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>-${(rec.financialRiskReductionUSD / 1000000).toFixed(2)}M Exposure</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>-{rec.riskReductionScore} Pts Asset Risk</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Est. Execution Cost: ${rec.estimatedCostUSD.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
                  {isApplied ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Mitigation Enforced</span>
                    </div>
                  ) : (
                    <button
                      id={`btn-apply-${rec.id}`}
                      disabled={isLoading}
                      onClick={() => handleApply(rec)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <span>Enforcing fix...</span>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Apply Remediation</span>
                        </>
                      )}
                    </button>
                  )}

                  {targetNode && (
                    <button
                      onClick={() => {
                        onSelectNode(targetNode.id);
                        onNavigate('/infrastructure');
                      }}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>Focus Asset in 3D</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
