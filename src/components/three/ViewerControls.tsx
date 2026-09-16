import React, { useState } from 'react';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Tag, 
  Activity, 
  ShieldAlert, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Sliders,
  Cpu,
  Compass,
  Navigation,
  Check
} from 'lucide-react';
export type VisualizationMode = 'infrastructure' | 'heatmap' | 'attack-path' | 'traffic' | 'criticality' | 'propagation';
export type ViewerQuality = 'auto' | 'high' | 'medium' | 'low';

interface ViewerControlsProps {
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showRiskOverlay: boolean;
  onToggleRiskOverlay: () => void;
  showDataFlow: boolean;
  onToggleDataFlow: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  quality: ViewerQuality;
  onChangeQuality: (q: ViewerQuality) => void;
  is2DMode: boolean;
  onToggle2DMode: () => void;
  visualizationMode?: VisualizationMode;
  onChangeVisualizationMode?: (mode: VisualizationMode) => void;
  showDevMetrics?: boolean;
  onToggleDevMetrics?: () => void;
  fps?: number;
  triangleCount?: number;
  drawCalls?: number;
  currentAzimuthDegrees?: number;
  onSnapAngle?: (azimuthDegrees: number, elevationDegrees?: number) => void;
  is360AutoTour?: boolean;
  onToggle360AutoTour?: () => void;
  onExecute360FullSpin?: () => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  autoRotate,
  onToggleAutoRotate,
  onResetCamera,
  onZoomIn,
  onZoomOut,
  showLabels,
  onToggleLabels,
  showRiskOverlay,
  onToggleRiskOverlay,
  showDataFlow,
  onToggleDataFlow,
  isFullscreen,
  onToggleFullscreen,
  quality,
  onChangeQuality,
  is2DMode,
  onToggle2DMode,
  visualizationMode,
  onChangeVisualizationMode,
  showDevMetrics,
  onToggleDevMetrics,
  fps = 60,
  triangleCount = 9800,
  drawCalls = 24,
  currentAzimuthDegrees = 45,
  onSnapAngle,
  is360AutoTour = false,
  onToggle360AutoTour,
  onExecute360FullSpin
}) => {
  const [showAngleMenu, setShowAngleMenu] = useState(false);

  const anglePresets = [
    { label: '0° Front (North)', azimuth: 0, elevation: 60 },
    { label: '90° East (Right)', azimuth: 90, elevation: 60 },
    { label: '180° Rear (South)', azimuth: 180, elevation: 60 },
    { label: '270° West (Left)', azimuth: 270, elevation: 60 },
    { label: 'Top Zenith (Birds-Eye)', azimuth: 0, elevation: 10 },
    { label: 'Under Nadir (360° Below)', azimuth: 180, elevation: 155 }
  ];

  const getCompassDirection = (deg: number) => {
    const normalized = ((deg % 360) + 360) % 360;
    if (normalized >= 337.5 || normalized < 22.5) return 'N';
    if (normalized >= 22.5 && normalized < 67.5) return 'NE';
    if (normalized >= 67.5 && normalized < 112.5) return 'E';
    if (normalized >= 112.5 && normalized < 157.5) return 'SE';
    if (normalized >= 157.5 && normalized < 202.5) return 'S';
    if (normalized >= 202.5 && normalized < 247.5) return 'SW';
    if (normalized >= 247.5 && normalized < 292.5) return 'W';
    return 'NW';
  };

  const currentDirection = getCompassDirection(currentAzimuthDegrees);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      {/* Left controls: 3D/2D switch, 360° views & camera orientation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg shadow-2xl backdrop-blur-md pointer-events-auto">
        <button
          id="btn-toggle-2d-3d"
          onClick={onToggle2DMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            !is2DMode 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Switch between 3D Spatial Canvas and 2D Topological Map"
          aria-label="Toggle 3D View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{is2DMode ? '2D Map Active' : '3D View'}</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Reset Camera */}
        <button
          id="btn-reset-cam"
          onClick={onResetCamera}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title="Reset Camera Angle & Center"
          aria-label="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* 360 Degree View Presets & Compass Button */}
        {!is2DMode && (
          <div className="relative">
            <button
              id="btn-360-presets"
              onClick={() => setShowAngleMenu(!showAngleMenu)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer border ${
                showAngleMenu
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800/80 text-cyan-400 border-slate-700/80 hover:bg-slate-800'
              }`}
              title="360° Angle Views & Presets"
              aria-label="360 Degree Angle Views"
            >
              <Compass 
                className="w-3.5 h-3.5 text-cyan-400 transition-transform" 
                style={{ transform: `rotate(${currentAzimuthDegrees}deg)` }}
              />
              <span className="font-semibold text-[11px]">{Math.round(currentAzimuthDegrees)}° {currentDirection}</span>
            </button>

            {/* Angle Preset Dropdown */}
            {showAngleMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-56 p-1.5 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1 z-30 font-sans">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-semibold border-b border-slate-800 flex justify-between items-center">
                  <span>360° Orbit Vantage Points</span>
                </div>
                {onExecute360FullSpin && (
                  <button
                    id="btn-spin-360-full"
                    onClick={() => {
                      onExecute360FullSpin();
                      setShowAngleMenu(false);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg text-left text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 font-semibold flex items-center justify-between transition-colors cursor-pointer mb-1"
                  >
                    <span>Execute 360° Full Spin</span>
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  </button>
                )}
                {anglePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      onSnapAngle?.(preset.azimuth, preset.elevation);
                      setShowAngleMenu(false);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg text-left text-slate-300 hover:text-white hover:bg-cyan-500/20 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{preset.label}</span>
                    <Navigation 
                      className="w-3 h-3 text-cyan-400 transition-transform" 
                      style={{ transform: `rotate(${preset.azimuth}deg)` }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 360° Auto-Orbit Tour Toggle */}
        {!is2DMode && (
          <button
            id="btn-360-tour"
            onClick={onToggle360AutoTour || onToggleAutoRotate}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
              (is360AutoTour || autoRotate)
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Continuous 360° Orbit Tour"
            aria-label="Toggle 360 Degree View"
          >
            {(is360AutoTour || autoRotate) ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">360° Orbit</span>
          </button>
        )}

        {/* Zoom Controls */}
        <button
          id="btn-zoom-in"
          onClick={onZoomIn}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          id="btn-zoom-out"
          onClick={onZoomOut}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Middle/Right controls: Overlays, Mode Selector, Quality & Fullscreen */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg shadow-2xl backdrop-blur-md pointer-events-auto">
        {/* Visualization Mode Selector */}
        {onChangeVisualizationMode && (
          <select
            value={visualizationMode || 'infrastructure'}
            onChange={(e) => onChangeVisualizationMode(e.target.value as VisualizationMode)}
            className="bg-slate-950 text-cyan-300 border border-cyan-500/40 rounded-md px-2 py-1 text-[11px] font-mono font-bold focus:outline-none cursor-pointer"
            title="Select 3D Spatial Visualization Mode"
          >
            <option value="infrastructure">Mode: 3D Infrastructure View</option>
            <option value="heatmap">Mode: Risk Heatmap</option>
            <option value="attack-path">Mode: Attack Path Vectors</option>
            <option value="traffic">Mode: High-Speed Traffic Streams</option>
            <option value="criticality">Mode: Asset Criticality Scaling</option>
            <option value="propagation">Mode: Threat Infection Propagation</option>
          </select>
        )}

        <button
          id="btn-toggle-labels"
          onClick={onToggleLabels}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            showLabels 
              ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Toggle Asset Labels"
          aria-label="Toggle Labels"
        >
          <Tag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Labels</span>
        </button>

        <button
          id="btn-toggle-risk"
          onClick={onToggleRiskOverlay}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            showRiskOverlay 
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Toggle Risk Heat Indicators"
          aria-label="Toggle Risk Overlay"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Risk Heat</span>
        </button>

        <button
          id="btn-toggle-flow"
          onClick={onToggleDataFlow}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            showDataFlow 
              ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Toggle Live Data Flows & Threat Signals"
          aria-label="Toggle Data Flow"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Flows</span>
        </button>

        {!is2DMode && (
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              id="select-quality"
              value={quality}
              onChange={(e) => onChangeQuality(e.target.value as ViewerQuality)}
              className="bg-slate-800 text-slate-300 text-xs rounded px-1.5 py-1 border border-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
              title="Select 3D Graphics Fidelity"
              aria-label="3D Rendering Quality"
            >
              <option value="auto">Auto (Efficient)</option>
              <option value="high">High PBR</option>
              <option value="medium">Medium</option>
              <option value="low">Low Power</option>
            </select>
          </div>
        )}

        {onToggleDevMetrics && (
          <button
            id="btn-toggle-metrics"
            onClick={onToggleDevMetrics}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              showDevMetrics ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Technical Engine Telemetry & Efficiency HUD"
            aria-label="Toggle Engine Metrics"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          id="btn-toggle-fullscreen"
          onClick={onToggleFullscreen}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen 3D Viewer"}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Dev telemetry HUD if enabled */}
      {showDevMetrics && !is2DMode && (
        <div className="absolute bottom-14 left-4 p-2.5 bg-slate-950/95 border border-cyan-500/40 rounded-xl font-mono text-[11px] text-cyan-300 space-y-1 backdrop-blur shadow-2xl">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Rendering Rate:</span>
            <span className="font-semibold text-emerald-400">{fps} FPS (Optimized)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Geometry Optimization:</span>
            <span className="text-emerald-300 font-bold">{triangleCount.toLocaleString()} Triangles (-79%)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Shared Geometries:</span>
            <span className="text-cyan-300">Instanced Cache Active</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">360° Azimuth:</span>
            <span className="text-white font-bold">{Math.round(currentAzimuthDegrees)}° ({currentDirection})</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Draw Calls:</span>
            <span className="text-slate-300">{drawCalls} Batched Calls</span>
          </div>
        </div>
      )}
    </div>
  );
};
