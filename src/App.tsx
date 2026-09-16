import React, { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
import { 
  InfrastructureNode, 
  DataFlowLink, 
  AnomalyDetection, 
  Investigation, 
  RemediationRecommendation, 
  ThreatIntelligenceReport, 
  EnterpriseRiskSummary, 
  UserPreferences 
} from './types';
import { TopNavigation } from './components/layout/TopNavigation';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { DashboardPage } from './pages/DashboardPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { AttackPathPage } from './pages/AttackPathPage';
import { AssetsPage } from './pages/AssetsPage';
import { DetectionsPage } from './pages/DetectionsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { RiskQuantificationPage } from './pages/RiskQuantificationPage';
import { ThreatIntelligencePage } from './pages/ThreatIntelligencePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { ThreatCatcherChatBotWidget } from './components/chatbot/ThreatCatcherChatBotWidget';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { DeviceByDeviceScannerModal } from './components/scanner/DeviceByDeviceScannerModal';
import { ScrollProgressBar, ScrollToTopButton, useScrollReveal } from './components/common/ScrollEffects';

export function AppContent() {
  const { user, loading } = useAuth();

  // Navigation Route State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash.replace('#', '') || '/';
  });

  useScrollReveal(currentRoute);

  // Application Data States
  const [nodes, setNodes] = useState<InfrastructureNode[]>(apiService.getNodes());
  const [links, setLinks] = useState<DataFlowLink[]>(apiService.getLinks());
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>(apiService.getAnomalies());
  const [investigations, setInvestigations] = useState<Investigation[]>(apiService.getInvestigations());
  const [recommendations, setRecommendations] = useState<RemediationRecommendation[]>(apiService.getRecommendations());
  const [threatIntel, setThreatIntel] = useState<ThreatIntelligenceReport[]>(apiService.getThreatIntel());
  const [riskSummary, setRiskSummary] = useState<EnterpriseRiskSummary>(apiService.getRiskSummary());
  const [preferences, setPreferences] = useState<UserPreferences>(apiService.getPreferences());

  // Viewer and UI State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [liveStreaming, setLiveStreaming] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDeviceScannerOpen, setIsDeviceScannerOpen] = useState<boolean>(false);

  // Subscribe to real-time updates from API Service
  useEffect(() => {
    const unsubscribe = apiService.subscribe((state) => {
      setNodes([...state.nodes]);
      setLinks([...state.links]);
      setAnomalies([...state.anomalies]);
      setInvestigations([...state.investigations]);
      setRecommendations([...state.recommendations]);
      setThreatIntel([...state.threatIntel]);
      setRiskSummary({ ...state.riskSummary });
      setPreferences({ ...state.userPreferences });
    });

    // Start synthetic live simulation stream
    const cleanupStream = apiService.startLiveSimulation(4500);

    // Sync hash changes
    const handleHashChange = () => {
      const route = window.location.hash.replace('#', '') || '/';
      setCurrentRoute(route);
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubscribe();
      cleanupStream();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Gate Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#04060b] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 mx-auto animate-pulse font-mono font-black text-lg">
            <span className="text-cyan-400">T</span><span className="text-blue-400">C</span>
          </div>
          <div className="text-xs font-mono text-cyan-400">Authenticating Threat Catcher Security Gate...</div>
        </div>
      </div>
    );
  }

  // Mandatory Sign-In Gate: If not authenticated, force Sign-In page view before opening project
  if (!user) {
    return (
      <div className="min-h-screen bg-[#04060b] text-slate-100 font-sans">
        <LoginPage onNavigate={handleNavigate} />
      </div>
    );
  }

  const handleToggleStreaming = () => {
    if (liveStreaming) {
      apiService.stopLiveSimulation();
      setLiveStreaming(false);
    } else {
      apiService.startLiveSimulation(4500);
      setLiveStreaming(true);
    }
  };

  const handleSelectNode = (id: string | null) => {
    setSelectedNodeId(id);
  };

  const handleQuarantineNode = (id: string) => {
    apiService.quarantineNode(id);
  };

  const handleApplyRecommendation = async (recId: string): Promise<boolean> => {
    return await apiService.applyRecommendation(recId);
  };

  const handleResetData = () => {
    apiService.resetState();
    setSelectedNodeId(null);
  };

  const handleUpdatePreferences = (updates: Partial<UserPreferences>) => {
    apiService.updatePreferences(updates);
  };

  const handleAddDevice = (deviceData: Omit<InfrastructureNode, 'id' | 'lastUpdated'>) => {
    return apiService.addDevice(deviceData);
  };

  const handleDeleteDevice = (id: string) => {
    return apiService.deleteDevice(id);
  };

  const handleSolveDeviceProblem = (id: string) => {
    return apiService.solveDeviceProblem(id);
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Scroll Progress Bar at Top of Viewport */}
      <ScrollProgressBar targetContainerId="main-content-scroll" />

      {/* Top Header Navigation */}
      <TopNavigation
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        riskSummary={riskSummary}
        nodes={nodes}
        anomalies={anomalies}
        investigations={investigations}
        onSelectNode={handleSelectNode}
        liveStreaming={liveStreaming}
        onToggleStreaming={handleToggleStreaming}
        onResetData={handleResetData}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDeviceScanner={() => setIsDeviceScannerOpen(true)}
      />

      {/* Main Workspace: Sidebar + Dynamic Route Views */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          riskSummary={riskSummary}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Route Content */}
        <main id="main-content-scroll" className="flex-1 overflow-y-auto bg-gradient-to-b from-[#080b12] to-[#04060a] relative scroll-smooth">
          {currentRoute === '/' && (
            <OverviewPage
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onQuarantineNode={handleQuarantineNode}
              riskSummary={riskSummary}
              onNavigate={handleNavigate}
              reducedMotion={preferences.reducedMotion}
            />
          )}

          {currentRoute === '/dashboard' && (
            <DashboardPage
              riskSummary={riskSummary}
              nodes={nodes}
              anomalies={anomalies}
              onNavigate={handleNavigate}
              onSelectNode={handleSelectNode}
            />
          )}

          {currentRoute === '/infrastructure' && (
            <InfrastructurePage
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onQuarantineNode={handleQuarantineNode}
              onNavigate={handleNavigate}
              reducedMotion={preferences.reducedMotion}
            />
          )}

          {currentRoute === '/attack-path' && (
            <AttackPathPage
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onQuarantineNode={handleQuarantineNode}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/assets' && (
            <AssetsPage
              nodes={nodes}
              onSelectNode={handleSelectNode}
              onQuarantineNode={handleQuarantineNode}
              onAddDevice={handleAddDevice}
              onDeleteDevice={handleDeleteDevice}
              onSolveDeviceProblem={handleSolveDeviceProblem}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/detections' && (
            <DetectionsPage
              anomalies={anomalies}
              nodes={nodes}
              onSelectNode={handleSelectNode}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/investigations' && (
            <InvestigationsPage
              investigations={investigations}
              nodes={nodes}
              onSelectNode={handleSelectNode}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/risk-quantification' && (
            <RiskQuantificationPage
              riskSummary={riskSummary}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/threat-intelligence' && (
            <ThreatIntelligencePage
              threatIntel={threatIntel}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/recommendations' && (
            <RecommendationsPage
              recommendations={recommendations}
              nodes={nodes}
              onApplyRecommendation={handleApplyRecommendation}
              onSelectNode={handleSelectNode}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/reports' && (
            <ReportsPage
              riskSummary={riskSummary}
              nodes={nodes}
            />
          )}

          {currentRoute === '/login' && (
            <LoginPage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/settings' && (
            <SettingsPage
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onResetData={handleResetData}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Threat Catcher AI ChatBot Widget */}
      <ThreatCatcherChatBotWidget
        nodes={nodes}
        riskSummary={riskSummary}
        recommendations={recommendations}
        onSelectNode={handleSelectNode}
        onQuarantineNode={handleQuarantineNode}
        onAddDevice={handleAddDevice}
        onDeleteDevice={handleDeleteDevice}
        onSolveDeviceProblem={handleSolveDeviceProblem}
        onApplyRecommendation={handleApplyRecommendation}
        onNavigate={handleNavigate}
      />

      {/* Supabase Authentication & Connection Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Device-by-Device Scanner Diagnostic Modal */}
      <DeviceByDeviceScannerModal
        isOpen={isDeviceScannerOpen}
        onClose={() => setIsDeviceScannerOpen(false)}
        nodes={nodes}
        onSelectNode={handleSelectNode}
        onQuarantineNode={handleQuarantineNode}
        onDeleteDevice={handleDeleteDevice}
        onSolveDeviceProblem={handleSolveDeviceProblem}
      />

      {/* Floating Back to Top Button */}
      <ScrollToTopButton targetContainerId="main-content-scroll" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
