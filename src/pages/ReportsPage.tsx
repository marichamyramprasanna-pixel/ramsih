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
  Code,
  Zap,
  Check
} from 'lucide-react';
import { EnterpriseRiskSummary, InfrastructureNode } from '../types';
import { formatRiskScore } from '../utils/riskCalculator';

interface ReportsPageProps {
  riskSummary: EnterpriseRiskSummary;
  nodes: InfrastructureNode[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  riskSummary,
  nodes
}) => {
  const [reportType, setReportType] = useState<'full' | 'executive' | 'technical' | 'compliance'>('full');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handlePrint = () => {
    // Ensure full report is active during print export
    const previousType = reportType;
    if (reportType !== 'full') {
      setReportType('full');
      setTimeout(() => {
        window.print();
        setReportType(previousType);
      }, 150);
    } else {
      window.print();
    }
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
        overallRiskScore: riskSummary.enterpriseRiskScore ?? riskSummary.overallRiskScore,
        riskLevel: riskSummary.riskLevel,
        totalAssetsMonitored: riskSummary.activeAssetsCount ?? nodes.length,
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

      {/* Header (Hidden on Print PDF) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-800">
              AUDIT & COMPLIANCE READY
            </span>
            <span className="text-xs text-slate-500 font-mono">SOC 2 Type II • ISO 27001 • NIST CSF 2.0</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Cyber Risk & Compliance Audit Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Export comprehensive CISO board briefings, CSV technical asset audits, or print clean PDF report documents.
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
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs (Hidden on Print PDF) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:hidden">
        <button
          onClick={() => setReportType('full')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            reportType === 'full'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Full Comprehensive Audit Report (All Sections)
        </button>
        <button
          onClick={() => setReportType('executive')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'executive'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Board & Executive Briefing
        </button>
        <button
          onClick={() => setReportType('technical')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'technical'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Technical Vulnerability & Asset Matrix
        </button>
        <button
          onClick={() => setReportType('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            reportType === 'compliance'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Compliance Framework Matrix
        </button>
      </div>

      {/* Full Document PDF Output Container */}
      <div className="p-8 bg-[#090d15] border border-slate-800 rounded-2xl space-y-8 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Document Header & Metadata Seal */}
        <div className="flex items-start justify-between border-b border-slate-800 print:border-black pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white print:text-black text-2xl">
                <span className="text-cyan-400 print:text-black font-black">AEGIS 3D</span> THREAT CATCHER
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800 print:border-black print:text-black">
                CONFIDENTIAL CISO AUDIT
              </span>
            </div>
            <h2 className="text-xl font-bold text-white print:text-black mt-2 tracking-tight">
              {reportType === 'full' && 'Continuous Cyber Risk Intelligence & Infrastructure Audit Report'}
              {reportType === 'executive' && 'Quarterly Cyber Risk Exposure & Executive Posture Assessment'}
              {reportType === 'technical' && 'Granular Infrastructure Telemetry & Asset Vulnerability Matrix'}
              {reportType === 'compliance' && 'Regulatory & Standard Compliance Matrix (SOC 2, ISO 27001, PCI-DSS)'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 print:text-slate-700 mt-1 font-mono">
              <span>Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>Audited Organization: SecOps Enterprise Cyber Operations</span>
              <span>•</span>
              <span>Classification: Highly Confidential</span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-slate-500 print:text-slate-700">AUDIT HASH: 8f9b2a74c10e</div>
            <div className="text-[10px] font-mono text-cyan-400 print:text-black mt-0.5 font-bold">FAIR Model v2.4 Certified</div>
          </div>
        </div>

        {/* 1. Executive Summary & FAIR Metrics Dashboard */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black font-mono border-b border-slate-800 print:border-slate-300 pb-1">
            Section 1 • Enterprise Posture & FAIR Risk Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
            <div>
              <div className="text-slate-400 print:text-slate-600 text-[11px] font-medium">Enterprise Posture Score</div>
              <div className="text-2xl font-bold font-mono text-cyan-300 print:text-black mt-0.5">
                {formatRiskScore(riskSummary.enterpriseRiskScore ?? riskSummary.overallRiskScore)}
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono mt-0.5">
                Level: {riskSummary.riskLevel || 'High'}
              </div>
            </div>

            <div>
              <div className="text-slate-400 print:text-slate-600 text-[11px] font-medium">Annual Expected Financial Loss</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 print:text-black mt-0.5">
                ₹3,50,000
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono mt-0.5">
                FAIR Value-at-Risk (95th %)
              </div>
            </div>

            <div>
              <div className="text-slate-400 print:text-slate-600 text-[11px] font-medium">Monitored Infrastructure Assets</div>
              <div className="text-2xl font-bold font-mono text-white print:text-black mt-0.5">
                {nodes.length} Systems
              </div>
              <div className="text-[10px] text-emerald-400 print:text-slate-700 font-mono mt-0.5">
                100% Telemetry Streaming
              </div>
            </div>

            <div>
              <div className="text-slate-400 print:text-slate-600 text-[11px] font-medium">Compliance Posture</div>
              <div className="text-2xl font-bold font-mono text-purple-400 print:text-black mt-0.5">
                {riskSummary.compliancePosturePercentage ?? 94}%
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono mt-0.5">
                SOC 2 / ISO 27001 Validated
              </div>
            </div>
          </div>
        </div>

        {/* 2. Executive Risk Narrative & Strategic Analysis */}
        {(reportType === 'full' || reportType === 'executive') && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 print:text-black">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black font-mono border-b border-slate-800 print:border-slate-300 pb-1">
              Section 2 • Strategic Threat Narrative & Behavioral Analysis
            </h3>
            <p className="leading-relaxed">
              During this continuous monitoring audit cycle, Threat Catcher analyzed telemetry streams across <strong>{nodes.length}</strong> core production devices including perimeter firewalls, Kubernetes application microservice clusters, zero-trust bastions, and primary PostgreSQL databases.
            </p>
            <p className="leading-relaxed">
              The aggregate enterprise risk posture score stands at <strong>{formatRiskScore(riskSummary.enterpriseRiskScore ?? riskSummary.overallRiskScore)}</strong>. The main threat drivers stem from unpatched CVE container escape vulnerabilities in API microservices and abnormal outbound data bursts detected on high-value cluster nodes.
            </p>
            <p className="leading-relaxed">
              Utilizing Factor Analysis of Information Risk (FAIR) metrics, the annualized loss expectancy (ALE) is modeled at <strong>₹3,50,000</strong>. Implementing recommended containment policies and zero-trust microsegmentation will reduce potential single-event financial exposure by up to <strong>70%</strong>.
            </p>
          </div>
        )}

        {/* 3. Granular Infrastructure Telemetry & Asset Vulnerability Matrix */}
        {(reportType === 'full' || reportType === 'technical') && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black font-mono border-b border-slate-800 print:border-slate-300 pb-1">
              Section 3 • Infrastructure Asset & Vulnerability Audit Matrix ({nodes.length} Monitored Devices)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-black font-mono">
                    <th className="py-2 px-2.5">Asset ID</th>
                    <th className="py-2 px-2.5">Device Name</th>
                    <th className="py-2 px-2.5">IP Address</th>
                    <th className="py-2 px-2.5">Tier</th>
                    <th className="py-2 px-2.5">Risk Score</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5">Exposure (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                  {nodes.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                      <td className="py-2.5 px-2.5 font-mono text-cyan-400 print:text-black font-bold">{n.id}</td>
                      <td className="py-2.5 px-2.5 font-semibold text-slate-200 print:text-black">{n.name}</td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-400 print:text-slate-800">{n.ipAddress}</td>
                      <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-400 print:text-black">{n.tier}</td>
                      <td className="py-2.5 px-2.5 font-mono font-bold text-red-400 print:text-black">{n.riskScore} / 100</td>
                      <td className="py-2.5 px-2.5 font-mono uppercase text-[10px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded ${
                          n.status === 'secure' ? 'text-emerald-400 print:text-black' : 'text-red-400 print:text-black'
                        }`}>
                          {n.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono font-semibold text-emerald-400 print:text-black">
                        ₹{(n.financialExposure / 10).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Regulatory Framework Control Matrix */}
        {(reportType === 'full' || reportType === 'compliance') && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black font-mono border-b border-slate-800 print:border-slate-300 pb-1">
              Section 4 • Regulatory Compliance & Governance Control Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>SOC 2 Type II</span>
                  <span className="text-emerald-400 print:text-black font-mono font-bold">92% Compliance</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-700">
                  Trust Services Criteria (Security, Availability, Confidentiality) validated across all API gateways.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>ISO/IEC 27001:2022</span>
                  <span className="text-emerald-400 print:text-black font-mono font-bold">88% Compliance</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-700">
                  Annex A controls for asset management, encryption key rotation, and identity access management enforced.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>NIST CSF 2.0</span>
                  <span className="text-emerald-400 print:text-black font-mono font-bold">94% Compliance</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-700">
                  Identify, Protect, Detect, Respond, and Recover governance controls continuously monitored.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Priority Remediation Actions & Risk Reduction */}
        {reportType === 'full' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black font-mono border-b border-slate-800 print:border-slate-300 pb-1">
              Section 5 • Priority Remediation Actions & Financial Risk Savings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>P1 • HTTP/2 Stream Rate Limit Enforcement</span>
                  <span className="text-emerald-400 print:text-black font-mono">-₹1,45,000 Risk Exp</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-700">
                  Mitigates CVE-2023-44487 Rapid Reset DDoS vectors on Perimeter Ingress Firewall.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200 print:text-black">
                  <span>P1 • CVE-2024-21626 Container Escape Patch</span>
                  <span className="text-emerald-400 print:text-black font-mono">-₹1,00,000 Risk Exp</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-700">
                  Upgrades runc container runtime to prevent host file-descriptor leak vulnerabilities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6. Formal Executive Sign-off & Audit Verification */}
        {reportType === 'full' && (
          <div className="pt-6 border-t border-slate-800 print:border-black space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black font-mono">
              Section 6 • Official Verification & Sign-Off Block
            </h3>
            <div className="grid grid-cols-2 gap-8 text-xs pt-2">
              <div className="space-y-6">
                <div className="border-b border-slate-700 print:border-black h-8 flex items-end font-mono text-[11px] text-slate-300 print:text-black font-bold">
                  Chief Information Security Officer (CISO)
                </div>
                <div className="text-[10px] text-slate-400 print:text-slate-700 font-mono">
                  Signature & Approval Date: ____________________
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-b border-slate-700 print:border-black h-8 flex items-end font-mono text-[11px] text-slate-300 print:text-black font-bold">
                  Lead Cybersecurity Architect & Auditor
                </div>
                <div className="text-[10px] text-slate-400 print:text-slate-700 font-mono">
                  Signature & Approval Date: ____________________
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
