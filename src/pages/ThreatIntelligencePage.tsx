import React, { useState } from 'react';
import { 
  Globe2, 
  ShieldAlert, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  Target,
  FileCode
} from 'lucide-react';
import { ThreatIntelligenceReport } from '../types';

interface ThreatIntelligencePageProps {
  threatIntel: ThreatIntelligenceReport[];
  onNavigate: (route: string) => void;
}

export const ThreatIntelligencePage: React.FC<ThreatIntelligencePageProps> = ({
  threatIntel,
  onNavigate
}) => {
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);

  const handleCopy = (ioc: string) => {
    navigator.clipboard.writeText(ioc);
    setCopiedIoc(ioc);
    setTimeout(() => setCopiedIoc(null), 2000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] font-bold uppercase border border-amber-800">
            GLOBAL FEED ACTIVE
          </span>
          <span className="text-xs text-slate-500 font-mono">MITRE CTI v14.1</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Threat Intelligence & Contextual Analysis</h1>
        <p className="text-xs text-slate-400">
          Curated adversarial intelligence, campaign targeting signatures, and active CVE weaponization vectors.
        </p>
      </div>

      {/* Threat Actor Campaigns */}
      <div className="space-y-6">
        {threatIntel.map((actor) => (
          <div
            key={actor.id}
            className="p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{actor.threatActor}</h2>
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-mono font-bold uppercase border border-red-800">
                    {actor.confidence} Confidence
                  </span>
                </div>
                <p className="text-xs text-cyan-400 font-mono mt-0.5">Campaign: {actor.campaignName}</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Observed: {actor.firstSeen}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{actor.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Targeted CVEs */}
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-400" />
                  <span>Targeted CVE Weaponization</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {actor.targetedCVEs.map((cve) => (
                    <span
                      key={cve}
                      className="px-2 py-1 rounded bg-red-950/80 text-red-300 font-mono text-xs border border-red-800"
                    >
                      {cve}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Sectors */}
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Targeted Industry Verticals</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {actor.targetedIndustries.map((ind) => (
                    <span
                      key={ind}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicators of Compromise (IOCs) */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Weaponized Indicators of Compromise (IOCs)</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {actor.iocs.map((ioc) => (
                  <div
                    key={ioc}
                    className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 flex items-center justify-between gap-2 group"
                  >
                    <span className="text-slate-300 select-all truncate">{ioc}</span>
                    <button
                      onClick={() => handleCopy(ioc)}
                      className="p-1 text-slate-500 hover:text-cyan-300 transition-colors shrink-0"
                      title="Copy IOC hash or address"
                    >
                      {copiedIoc === ioc ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
