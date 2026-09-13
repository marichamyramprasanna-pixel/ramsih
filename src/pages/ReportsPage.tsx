import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Calendar
} from 'lucide-react';
import { EnterpriseRiskSummary, InfrastructureNode } from '../types';

interface ReportsPageProps {
  riskSummary: EnterpriseRiskSummary;
  nodes: InfrastructureNode[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  riskSummary,
  nodes
}) => {
  const [reportType, setReportType] = useState<'executive' | 'technical'>('executive');
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // create synthetic download blob
      const blob = new Blob([
        `AEGIS 3D - CYBER RISK REPORT\nDate: ${new Date().toISOString()}\nOverall Risk Score: ${riskSummary.overallRiskScore}/100\nTotal Expected Loss: $${(riskSummary.fairMetrics.totalExpectedLossUSD/1000000).toFixed(2)}M\nActive Assets: ${riskSummary.activeAssetsCount}\nCritical Anomalies: ${riskSummary.criticalAnomaliesCount}\nCompliance: ${riskSummary.compliancePosturePercentage}%\n`
      ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Aegis_Cyber_Risk_Report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-800">
              AUDIT READY
            </span>
            <span className="text-xs text-slate-500 font-mono">SOC 2 & ISO 27001</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive & Technical Reports</h1>
          <p className="text-xs text-slate-400">
            Generate board-ready risk summaries and granular technical compliance audit reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Export Audit Summary'}</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:hidden">
        <button
          onClick={() => setReportType('executive')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'executive'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Board & Executive Briefing
        </button>
        <button
          onClick={() => setReportType('technical')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'technical'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Technical Vulnerability & Asset Audit
        </button>
      </div>

      {/* Rendered Document */}
      <div className="p-8 bg-[#090d15] border border-slate-800 rounded-2xl space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 print:border-slate-300 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white print:text-black text-xl">AEGIS 3D</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono print:border print:border-black print:text-black">
                CONFIDENTIAL
              </span>
            </div>
            <h2 className="text-lg font-bold text-white print:text-black mt-2">
              {reportType === 'executive'
                ? 'Quarterly Cyber Risk Exposure & Posture Assessment'
                : 'Granular Infrastructure Telemetry & Vulnerability Audit'}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 print:text-slate-600 mt-1 font-mono">
              <span>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>Prepared for: Board Audit & Risk Committee</span>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
          <div>
            <div className="text-slate-400 print:text-slate-600 text-[11px]">Posture Score</div>
            <div className="text-2xl font-bold font-mono text-cyan-300 print:text-black">
              {riskSummary.overallRiskScore} / 100
            </div>
          </div>
          <div>
            <div className="text-slate-400 print:text-slate-600 text-[11px]">Expected Financial Loss</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 print:text-black">
              ${(riskSummary.fairMetrics.totalExpectedLossUSD / 1000000).toFixed(2)}M
            </div>
          </div>
          <div>
            <div className="text-slate-400 print:text-slate-600 text-[11px]">Monitored Assets</div>
            <div className="text-2xl font-bold font-mono text-white print:text-black">
              {riskSummary.activeAssetsCount} Systems
            </div>
          </div>
          <div>
            <div className="text-slate-400 print:text-slate-600 text-[11px]">Compliance Posture</div>
            <div className="text-2xl font-bold font-mono text-purple-400 print:text-black">
              {riskSummary.compliancePosturePercentage}%
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="space-y-3 text-xs leading-relaxed text-slate-300 print:text-slate-800">
          <h3 className="text-sm font-bold text-white print:text-black">Executive Risk Narrative</h3>
          <p>
            During this assessment period, Aegis 3D continuous monitoring evaluated 16 mission-critical enterprise systems across AWS, GCP, and on-premises physical data centers. The organization currently exhibits an overall risk posture score of <strong>{riskSummary.overallRiskScore}/100</strong>, reflecting significant exposure to remote code execution vectors in ingress bastions and Kubernetes worker pods.
          </p>
          <p>
            Using the FAIR (Factor Analysis of Information Risk) standard, single-event loss expectancy is modeled at <strong>${(riskSummary.fairMetrics.singleLossExpectancyUSD / 1000000).toFixed(2)}M</strong>. By applying prioritized defensive actions (e.g. downgrading compromised utility libraries and enforcing microsegmentation), the enterprise can avoid an estimated <strong>$4.3M</strong> in regulatory fines, downtime, and forensic remediation costs.
          </p>
        </div>

        {/* Framework Compliance Checklist */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white print:text-black">Compliance Framework Verification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/40 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 print:text-black mb-1">
                <span>SOC 2 Type II</span>
                <span className="text-emerald-400 font-mono">92% Met</span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Security, Confidentiality, and Availability trust principles validated.
              </p>
            </div>

            <div className="p-3 bg-slate-900/40 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 print:text-black mb-1">
                <span>ISO/IEC 27001:2022</span>
                <span className="text-emerald-400 font-mono">88% Met</span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Annex A controls for asset management and access control enforced.
              </p>
            </div>

            <div className="p-3 bg-slate-900/40 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 print:text-black mb-1">
                <span>NIST CSF 2.0</span>
                <span className="text-emerald-400 font-mono">94% Met</span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Govern, Identify, Protect, Detect, Respond, and Recover tiers mapped.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
