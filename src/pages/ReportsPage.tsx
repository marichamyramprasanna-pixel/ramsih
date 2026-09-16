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
  Calendar,
  FileSpreadsheet,
  Code
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
  const [reportType, setReportType] = useState<'executive' | 'technical' | 'compliance'>('executive');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Hostname", "IP Address", "Category", "Environment", "Risk Score", "Status", "CVSS Count", "Financial Exposure (USD)"];
    const rows = nodes.map(n => [
      n.id,
      `"${n.name}"`,
      n.hostname,
      n.ipAddress,
      n.category,
      `"${n.environment}"`,
      n.riskScore,
      n.status,
      n.vulnerabilities.length,
      n.financialExposure
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Threat_Catcher_Asset_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMsg("CSV Technical Asset Audit file exported!");
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExportJSON = () => {
    const bundle = {
      generatedAt: new Date().toISOString(),
      platform: "Threat Catcher - Aegis 3D Cyber Risk Intelligence",
      riskSummary: {
        overallRiskScore: riskSummary.overallRiskScore,
        riskLevel: riskSummary.riskLevel,
        totalAssetsMonitored: riskSummary.activeAssetsCount,
        criticalAnomalies: riskSummary.criticalAnomaliesCount,
        compliancePercentage: riskSummary.compliancePosturePercentage,
        fairMetrics: riskSummary.fairMetrics
      },
      infrastructureAssets: nodes
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Threat_Catcher_Telemetry_Audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMsg("JSON Audit Telemetry Bundle exported!");
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto print:p-0">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-950/95 border border-emerald-500/50 rounded-xl shadow-2xl flex items-center gap-3 text-emerald-200 text-xs animate-bounce print:hidden">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-800">
              AUDIT & COMPLIANCE READY
            </span>
            <span className="text-xs text-slate-500 font-mono">SOC 2 Type II • ISO 27001 • NIST CSF 2.0</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Risk & Compliance Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate board briefings, export raw technical CSV/JSON audits, or print PDF compliance bundles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4 text-purple-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:hidden">
        <button
          onClick={() => setReportType('executive')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'executive'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Board & Executive Risk Briefing
        </button>
        <button
          onClick={() => setReportType('technical')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'technical'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Technical Vulnerability & Asset Audit
        </button>
        <button
          onClick={() => setReportType('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'compliance'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SOC 2 / ISO 27001 Compliance Matrix
        </button>
      </div>

      {/* Rendered Document View */}
      <div className="p-8 bg-[#090d15] border border-slate-800 rounded-2xl space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 print:border-slate-300 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white print:text-black text-xl">
                <span className="text-cyan-400 font-black">T</span>hreat <span className="text-cyan-400 font-black">C</span>atcher
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800 print:border-black print:text-black">
                CONFIDENTIAL AUDIT REPORT
              </span>
            </div>
            <h2 className="text-lg font-bold text-white print:text-black mt-2">
              {reportType === 'executive' && 'Quarterly Cyber Risk Exposure & Executive Posture Assessment'}
              {reportType === 'technical' && 'Granular Infrastructure Telemetry & Asset Vulnerability Matrix'}
              {reportType === 'compliance' && 'Regulatory & Standard Compliance Matrix (SOC 2, ISO 27001, PCI-DSS)'}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 print:text-slate-600 mt-1 font-mono">
              <span>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>Prepared for: Board Audit & Cyber Risk Committee</span>
            </div>
          </div>
        </div>

        {/* Executive Summary Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
          <div>
            <div className="text-slate-400 print:text-slate-600 text-[11px]">Posture Risk Score</div>
            <div className="text-2xl font-bold font-mono text-cyan-300 print:text-black">
              {riskSummary.overallRiskScore} / 100
            </div>
          </div>
          <div>
            <div className="text-slate-400 print:text-slate-600 text-[11px]">Annual Expected Financial Loss</div>
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

        {/* Dynamic Report Content based on selected tab */}
        {reportType === 'executive' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-300 print:text-slate-800">
            <h3 className="text-sm font-bold text-white print:text-black">Executive Risk Narrative & Strategy</h3>
            <p>
              During this assessment period, Threat Catcher continuous monitoring evaluated <strong>{nodes.length}</strong> enterprise assets across multi-cloud (AWS, GCP) and on-premises core infrastructure. The organization currently exhibits an overall cyber risk score of <strong>{riskSummary.overallRiskScore}/100</strong>, driven primarily by remote code execution vulnerabilities in zero-trust bastions and payment API worker pods.
            </p>
            <p>
              Applying the FAIR (Factor Analysis of Information Risk) standard, single-event breach exposure is calculated at <strong>${(riskSummary.fairMetrics.singleLossExpectancyUSD / 1000000).toFixed(2)}M</strong>. Implementing prioritized mitigation actions (such as automated eBPF microsegmentation and dependency downgrades) will avoid an estimated <strong>$4.3M</strong> in business downtime, regulatory fines, and forensic remediation costs.
            </p>
          </div>
        )}

        {reportType === 'technical' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white print:text-black">Infrastructure Vulnerability Inventory ({nodes.length} Assets)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-black font-mono">
                    <th className="py-2 px-3">Asset ID</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">IP Address</th>
                    <th className="py-2 px-3">Risk Score</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Exposure ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                  {nodes.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                      <td className="py-2.5 px-3 font-mono text-cyan-400 print:text-black font-bold">{n.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200 print:text-black">{n.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 print:text-slate-700">{n.ipAddress}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-red-400 print:text-black">{n.riskScore} / 100</td>
                      <td className="py-2.5 px-3 font-mono uppercase text-[10px]">{n.status}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400 print:text-black">
                        ${(n.financialExposure / 1000).toFixed(0)}k
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'compliance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white print:text-black">Regulatory Framework Control Matrix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>SOC 2 Type II</span>
                  <span className="text-emerald-400 font-mono">92% Compliance</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  Security, Confidentiality, and Availability trust service criteria validated across API gateways.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>ISO/IEC 27001:2022</span>
                  <span className="text-emerald-400 font-mono">88% Compliance</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  Annex A controls for asset management, encryption key rotation, and access control enforced.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>NIST CSF 2.0</span>
                  <span className="text-emerald-400 font-mono">94% Compliance</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  Identify, Protect, Detect, Respond, and Recover core functions continuously monitored in real-time.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
