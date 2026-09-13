import React from 'react';
import { InfrastructureNode, DataFlowLink } from '../../types';
import { Shield, Server, Database, Cloud, Laptop, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface TwoDTopologyFallbackProps {
  nodes: InfrastructureNode[];
  links: DataFlowLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  showRiskOverlay: boolean;
  showDataFlow: boolean;
}

export const TwoDTopologyFallback: React.FC<TwoDTopologyFallbackProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  showRiskOverlay,
  showDataFlow
}) => {
  // Map 3D positions [x, y, z] to 2D SVG coordinates
  // Range of x: approx -6 to +6 -> map to 80 to 920
  // Range of z: approx -5 to +5 -> map to 60 to 540
  const get2DPos = (pos: [number, number, number]): { x: number; y: number } => {
    const x = ((pos[0] + 6) / 12) * 800 + 80;
    const y = ((pos[2] + 5) / 10) * 440 + 60;
    return { x, y };
  };

  const getNodeIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'cloud-cluster':
        return <Cloud className="w-4 h-4" />;
      case 'gateway-firewall':
        return <Shield className="w-4 h-4" />;
      case 'endpoint-workstation':
        return <Laptop className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const getRiskBorderColor = (score: number) => {
    if (!showRiskOverlay) return '#334155';
    if (score >= 80) return '#ef4444'; // Red critical
    if (score >= 65) return '#f97316'; // Orange high
    if (score >= 40) return '#eab308'; // Amber medium
    return '#10b981'; // Green healthy
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#07090e] border border-slate-800 rounded-xl overflow-hidden select-none">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Header bar */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-slate-200">2D Topological Map</span>
        <span className="text-slate-500">| Accessible Architecture Graph</span>
      </div>

      <svg 
        className="w-full h-full min-h-[500px]" 
        viewBox="0 0 960 600"
        preserveAspectRatio="xMidYMid meet"
        role="region"
        aria-label="2D Cybersecurity Infrastructure Map"
      >
        <defs>
          <linearGradient id="normalFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="threatFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Data flow connections */}
        {links.map((link) => {
          const sourceNode = nodes.find((n) => n.id === link.source);
          const targetNode = nodes.find((n) => n.id === link.target);
          if (!sourceNode || !targetNode) return null;

          const p1 = get2DPos(sourceNode.position3D);
          const p2 = get2DPos(targetNode.position3D);
          const isSuspicious = link.isSuspicious;

          // Quadratic curved path
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - 20;
          const d = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;

          return (
            <g key={link.id}>
              <path
                d={d}
                fill="none"
                stroke={isSuspicious ? 'url(#threatFlowGrad)' : '#1e293b'}
                strokeWidth={isSuspicious ? 2.5 : 1.5}
                strokeDasharray={isSuspicious && showDataFlow ? '6,4' : undefined}
                className={isSuspicious && showDataFlow ? 'animate-pulse' : ''}
              />
              {showDataFlow && (
                <circle r={isSuspicious ? 3.5 : 2.5} fill={isSuspicious ? '#ef4444' : '#38bdf8'}>
                  <animateMotion
                    path={d}
                    dur={isSuspicious ? '2s' : '3.5s'}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = get2DPos(node.position3D);
          const isSelected = selectedNodeId === node.id;
          const borderColor = getRiskBorderColor(node.riskScore);

          return (
            <g
              key={node.id}
              id={`2d-node-${node.id}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
              onClick={() => onSelectNode(node.id)}
              tabIndex={0}
              role="button"
              aria-label={`${node.name}, Risk score: ${node.riskScore}, Status: ${node.status}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNode(node.id);
                }
              }}
            >
              {/* Selection aura */}
              {isSelected && (
                <circle
                  r={28}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-spin origin-center"
                />
              )}

              {/* Status pulse if high risk */}
              {node.riskScore >= 70 && (
                <circle
                  r={22}
                  fill="#ef4444"
                  opacity="0.2"
                  className="animate-ping"
                />
              )}

              {/* Main Node Background */}
              <circle
                r={18}
                fill="#0f172a"
                stroke={isSelected ? '#38bdf8' : borderColor}
                strokeWidth={isSelected ? 3 : 2}
              />

              {/* Icon / Status representation */}
              <foreignObject x={-10} y={-10} width={20} height={20} className="pointer-events-none">
                <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {node.category === 'database' && <Database className="w-3.5 h-3.5" />}
                  {node.category === 'gateway-firewall' && <Shield className="w-3.5 h-3.5" />}
                  {node.category === 'cloud-cluster' && <Cloud className="w-3.5 h-3.5" />}
                  {node.category === 'endpoint-workstation' && <Laptop className="w-3.5 h-3.5" />}
                  {node.category === 'app-service' && <Server className="w-3.5 h-3.5" />}
                </div>
              </foreignObject>

              {/* Node Label */}
              <text
                x={0}
                y={28}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-300 pointer-events-none"
              >
                {node.name.length > 20 ? `${node.name.substring(0, 18)}...` : node.name}
              </text>

              {/* Risk Badge */}
              <text
                x={0}
                y={40}
                textAnchor="middle"
                className="text-[9px] font-mono font-semibold pointer-events-none"
                fill={node.riskScore >= 70 ? '#f87171' : node.riskScore >= 40 ? '#fbbf24' : '#34d399'}
              >
                Score: {node.riskScore}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
