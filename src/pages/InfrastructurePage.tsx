import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Share2, 
  ArrowRight,
  Server
} from 'lucide-react';
import { InfrastructureNode, DataFlowLink } from '../types';
import { ThreeInfrastructureViewer } from '../components/three/ThreeInfrastructureViewer';

interface InfrastructurePageProps {
  nodes: InfrastructureNode[];
  links: DataFlowLink[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onQuarantineNode: (id: string) => void;
  onNavigate: (route: string) => void;
  reducedMotion: boolean;
}

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onQuarantineNode,
  onNavigate,
  reducedMotion
}) => {
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tiers = ['all', 'Perimeter', 'Ingress', 'Application', 'Core Data', 'Management'];

  // Filtered nodes for the blast radius / search list
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchTier = tierFilter === 'all' || node.tier === tierFilter;
      const query = searchQuery.toLowerCase();
      const matchQuery =
        !query ||
        node.name.toLowerCase().includes(query) ||
        node.hostname.toLowerCase().includes(query) ||
        node.ipAddress.includes(query) ||
        node.vulnerabilities.some((v) => v.cve.toLowerCase().includes(query));
      return matchTier && matchQuery;
    });
  }, [nodes, tierFilter, searchQuery]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Calculate blast radius for selected node
  const blastRadiusNodes = useMemo(() => {
    if (!selectedNode) return [];
    return nodes.filter((n) => selectedNode.connections.includes(n.id));
  }, [selectedNode, nodes]);

  const totalBlastExposure = useMemo(() => {
    if (!selectedNode) return 0;
    return blastRadiusNodes.reduce((acc, n) => acc + n.financialExposure, selectedNode.financialExposure);
  }, [selectedNode, blastRadiusNodes]);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1700px] mx-auto flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090d15] p-3 rounded-xl border border-slate-800">
        {/* Tier Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium px-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Tier:
          </span>
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                tierFilter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t === 'all' ? 'All Tiers' : t}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
          <input
            id="input-infra-search"
            type="text"
            placeholder="Search host, IP, or CVE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative flex-1 min-h-[500px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        <ThreeInfrastructureViewer
          nodes={nodes}
          links={links}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onQuarantineNode={onQuarantineNode}
          onNavigateToDetections={() => onNavigate('/detections')}
          onNavigateToRecommendations={() => onNavigate('/recommendations')}
          reducedMotion={reducedMotion}
          className="w-full h-full"
        />

        {/* Floating Blast Radius Inspector (if node selected) */}
        {selectedNode && (
          <div className="hidden md:block absolute top-4 left-4 z-20 w-72 p-3 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Blast Radius Propagation</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-semibold">
                {blastRadiusNodes.length} Peers Connected
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              Direct exposure of <strong className="text-white">{selectedNode.name}</strong> cascades to connected dependencies:
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {blastRadiusNodes.map((peer) => (
                <div
                  key={peer.id}
                  onClick={() => onSelectNode(peer.id)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
                >
                  <span className="text-slate-300 truncate max-w-[140px]">{peer.name}</span>
                  <span className={`font-mono font-bold text-[10px] ${
                    peer.riskScore >= 70 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {peer.riskScore} risk
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-1.5 border-t border-slate-800 flex justify-between text-[11px]">
              <span className="text-slate-400">Combined Cascade Loss:</span>
              <span className="font-mono font-bold text-cyan-300">
                ${(totalBlastExposure / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
