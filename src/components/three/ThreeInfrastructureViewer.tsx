import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Flame, 
  ShieldAlert, 
  Radio, 
  Activity 
} from 'lucide-react';
import { InfrastructureNode, DataFlowLink, ViewerQuality } from '../../types';
import { ViewerControls } from './ViewerControls';
import { AssetDetailPanel } from './AssetDetailPanel';
import { TwoDTopologyFallback } from './TwoDTopologyFallback';

interface ThreeInfrastructureViewerProps {
  nodes: InfrastructureNode[];
  links: DataFlowLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onQuarantineNode: (nodeId: string) => void;
  onNavigateToDetections?: () => void;
  onNavigateToRecommendations?: () => void;
  qualityPreference?: ViewerQuality;
  reducedMotion?: boolean;
  className?: string;
  initial2DMode?: boolean;
}

export const ThreeInfrastructureViewer: React.FC<ThreeInfrastructureViewerProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onQuarantineNode,
  onNavigateToDetections,
  onNavigateToRecommendations,
  qualityPreference = 'auto',
  reducedMotion = false,
  className = '',
  initial2DMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);
  const [is2DMode, setIs2DMode] = useState<boolean>(initial2DMode);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [is360AutoTour, setIs360AutoTour] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showRiskOverlay, setShowRiskOverlay] = useState<boolean>(true);
  const [showDataFlow, setShowDataFlow] = useState<boolean>(!reducedMotion);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [quality, setQuality] = useState<ViewerQuality>(qualityPreference);
  const [showDevMetrics, setShowDevMetrics] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [triangleCount, setTriangleCount] = useState<number>(9800);
  const [drawCalls, setDrawCalls] = useState<number>(24);
  const [currentAzimuth, setCurrentAzimuth] = useState<number>(45);

  // Projected 2D screen positions of nodes for label overlay with threat details
  const [projectedLabels, setProjectedLabels] = useState<{ 
    id: string; 
    name: string; 
    x: number; 
    y: number; 
    risk: number; 
    visible: boolean;
    threatName?: string;
    cve?: string;
    severity?: string;
  }[]>([]);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const flowCurvesRef = useRef<{ curve: THREE.CatmullRomCurve3; packetMesh: THREE.Mesh; isSuspicious: boolean; speed: number; progress: number }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Camera animation & 360 Orbit state
  const orbitState = useRef({
    isDragging: false,
    isPanning: false,
    previousMousePosition: { x: 0, y: 0 },
    spherical: new THREE.Spherical(14, Math.PI / 3, Math.PI / 4),
    target: new THREE.Vector3(0, 0, 0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    desiredCameraPos: new THREE.Vector3(),
    targetSpherical: null as THREE.Spherical | null,
    pinchDistance: 0,
    lastCameraMatrix: new THREE.Matrix4(),
    frameCount: 0
  });

  // Selected node object
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // WebGL Capability Check
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setWebglAvailable(false);
        setIs2DMode(true);
      }
    } catch {
      setWebglAvailable(false);
      setIs2DMode(true);
    }
  }, []);

  // Smooth Camera transition toward selected node
  useEffect(() => {
    if (!selectedNodeId) {
      orbitState.current.targetLookAt.set(0, 0, 0);
      return;
    }
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (node) {
      const [x, y, z] = node.position3D;
      orbitState.current.targetLookAt.set(x, y, z);
    }
  }, [selectedNodeId, nodes]);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    if (is2DMode || !webglAvailable) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.028);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    cameraRef.current = camera;
    orbitState.current.spherical.radius = 13.5;
    orbitState.current.spherical.phi = 1.05;
    orbitState.current.spherical.theta = 0.8;
    camera.position.setFromSpherical(orbitState.current.spherical);
    camera.lookAt(orbitState.current.target);

    // 3. Optimized Renderer
    const isLowPower = quality === 'low';
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isLowPower,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isLowPower ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 4. Lighting System (PBR Balanced & Optimized)
    const ambientLight = new THREE.AmbientLight(0x0c1929, 2.0);
    scene.add(ambientLight);

    const dirKeyLight = new THREE.DirectionalLight(0x93c5fd, 1.7);
    dirKeyLight.position.set(8, 14, 10);
    scene.add(dirKeyLight);

    // Underside light for true 360-degree viewing from below
    const underLight = new THREE.DirectionalLight(0x0369a1, 1.2);
    underLight.position.set(-6, -10, -8);
    scene.add(underLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    // 5. Digital Ground Grid & 360° Cyber Floor (Double-Sided for Nadir / Under Views)
    const gridHelper = new THREE.GridHelper(26, 26, 0x0e7490, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Lower Sub-Grid for 360 underside vantage
    const lowerGrid = new THREE.GridHelper(26, 13, 0x0369a1, 0x0f172a);
    lowerGrid.position.y = -0.12;
    scene.add(lowerGrid);

    // Outer cyber rings (Efficient 32 segments, double-sided)
    const ringGeo1 = new THREE.RingGeometry(5.8, 5.86, 32);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x0891b2, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 2;
    ringMesh1.position.y = -0.04;
    ringMesh1.matrixAutoUpdate = false;
    ringMesh1.updateMatrix();
    scene.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(8.5, 8.58, 32);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x1d4ed8, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 2;
    ringMesh2.position.y = -0.04;
    ringMesh2.matrixAutoUpdate = false;
    ringMesh2.updateMatrix();
    scene.add(ringMesh2);

    // Shared Buffer Geometries with Low-Poly High-Performance Tessellation
    const sharedGeos = {
      basePedestal: new THREE.CylinderGeometry(0.55, 0.65, 0.12, 8),
      statusHalo: new THREE.TorusGeometry(0.68, 0.03, 4, 12),
      selectionAura: new THREE.TorusGeometry(0.85, 0.035, 4, 14),
      threatBeacon: new THREE.CylinderGeometry(0.35, 0.5, 2.5, 8, 1, true),
      dbCore: new THREE.CylinderGeometry(0.42, 0.42, 0.9, 8),
      dbDisc: new THREE.TorusGeometry(0.45, 0.02, 4, 10),
      fwShield: new THREE.BoxGeometry(0.85, 0.95, 0.35),
      fwBar: new THREE.BoxGeometry(0.7, 0.08, 0.38),
      cloudCluster: new THREE.IcosahedronGeometry(0.45, 0),
      cloudWire: new THREE.IcosahedronGeometry(0.55, 0),
      termBody: new THREE.BoxGeometry(0.65, 0.55, 0.45),
      screenPlane: new THREE.PlaneGeometry(0.5, 0.38),
      rackBody: new THREE.BoxGeometry(0.65, 1.1, 0.65),
      rackLed: new THREE.BoxGeometry(0.5, 0.04, 0.68),
      packetNormal: new THREE.SphereGeometry(0.06, 4, 4),
      packetSuspicious: new THREE.SphereGeometry(0.11, 6, 6)
    };

    const sharedMats = {
      basePedestal: new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 }),
      dbMetal: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.25 }),
      fwMetal: new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.35 }),
      cloudMetal: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 }),
      termMetal: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 }),
      rackMetal: new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 }),
      // Risk & Threat Beacon Materials
      emerald: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
      amber: new THREE.MeshBasicMaterial({ color: 0xeab308 }),
      orange: new THREE.MeshBasicMaterial({ color: 0xf97316 }),
      red: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
      quarantined: new THREE.MeshBasicMaterial({ color: 0x64748b }),
      threatBeaconRed: new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.38, side: THREE.DoubleSide }),
      threatBeaconAmber: new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
      packetNormal: new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      packetSuspicious: new THREE.MeshBasicMaterial({ color: 0xef4444 })
    };

    // Ambient Cyber Floating Particle Field Effect
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 26;
      particlePositions[p * 3 + 1] = Math.random() * 7.5 + 0.2;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Floor Cyber Scanning Radar Wave Effect
    const scanGeo = new THREE.RingGeometry(0.1, 0.25, 32);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const scanMesh = new THREE.Mesh(scanGeo, scanMat);
    scanMesh.rotation.x = Math.PI / 2;
    scanMesh.position.y = -0.03;
    scene.add(scanMesh);

    const getRiskMaterial = (riskScore: number, status: string) => {
      if (status === 'quarantined') return sharedMats.quarantined;
      if (riskScore >= 80) return sharedMats.red;
      if (riskScore >= 65) return sharedMats.orange;
      if (riskScore >= 40) return sharedMats.amber;
      return sharedMats.emerald;
    };

    // 6. Node Mesh Generation with Shared Assets
    nodeMeshesRef.current.clear();

    nodes.forEach((node) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(node.position3D[0], node.position3D[1], node.position3D[2]);
      nodeGroup.userData = { nodeId: node.id };

      const statusMat = getRiskMaterial(node.riskScore, node.status);

      // Base Pedestal
      const baseMesh = new THREE.Mesh(sharedGeos.basePedestal, sharedMats.basePedestal);
      baseMesh.matrixAutoUpdate = false;
      baseMesh.updateMatrix();
      nodeGroup.add(baseMesh);

      // Glowing Status Halo
      const haloMat = new THREE.MeshBasicMaterial({
        color: (statusMat as THREE.MeshBasicMaterial).color,
        transparent: true,
        opacity: node.riskScore >= 70 ? 0.9 : 0.6
      });
      const haloMesh = new THREE.Mesh(sharedGeos.statusHalo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      haloMesh.position.y = 0.02;
      haloMesh.name = 'statusHalo';
      nodeGroup.add(haloMesh);

      // Archetype specific physical geometry
      if (node.category === 'database') {
        const coreMesh = new THREE.Mesh(sharedGeos.dbCore, sharedMats.dbMetal);
        coreMesh.position.y = 0.52;
        coreMesh.matrixAutoUpdate = false;
        coreMesh.updateMatrix();
        nodeGroup.add(coreMesh);

        for (let i = 0; i < 3; i++) {
          const discMesh = new THREE.Mesh(sharedGeos.dbDisc, statusMat);
          discMesh.rotation.x = Math.PI / 2;
          discMesh.position.y = 0.25 + i * 0.28;
          discMesh.matrixAutoUpdate = false;
          discMesh.updateMatrix();
          nodeGroup.add(discMesh);
        }
      } else if (node.category === 'gateway-firewall') {
        const shieldMesh = new THREE.Mesh(sharedGeos.fwShield, sharedMats.fwMetal);
        shieldMesh.position.y = 0.55;
        shieldMesh.matrixAutoUpdate = false;
        shieldMesh.updateMatrix();
        nodeGroup.add(shieldMesh);

        const barMesh = new THREE.Mesh(sharedGeos.fwBar, statusMat);
        barMesh.position.y = 0.55;
        barMesh.matrixAutoUpdate = false;
        barMesh.updateMatrix();
        nodeGroup.add(barMesh);
      } else if (node.category === 'cloud-cluster') {
        const clusterMesh = new THREE.Mesh(sharedGeos.cloudCluster, sharedMats.cloudMetal);
        clusterMesh.position.y = 0.6;
        clusterMesh.name = 'rotatingCluster';
        nodeGroup.add(clusterMesh);

        const wireMat = new THREE.MeshBasicMaterial({
          color: (statusMat as THREE.MeshBasicMaterial).color,
          wireframe: true,
          transparent: true,
          opacity: 0.5
        });
        const wireMesh = new THREE.Mesh(sharedGeos.cloudWire, wireMat);
        wireMesh.position.y = 0.6;
        wireMesh.name = 'wireCluster';
        nodeGroup.add(wireMesh);
      } else if (node.category === 'endpoint-workstation') {
        const termMesh = new THREE.Mesh(sharedGeos.termBody, sharedMats.termMetal);
        termMesh.position.y = 0.4;
        termMesh.matrixAutoUpdate = false;
        termMesh.updateMatrix();
        nodeGroup.add(termMesh);

        const screenMesh = new THREE.Mesh(sharedGeos.screenPlane, statusMat);
        screenMesh.position.set(0, 0.4, 0.23);
        screenMesh.matrixAutoUpdate = false;
        screenMesh.updateMatrix();
        nodeGroup.add(screenMesh);
      } else {
        // Standard Server Rack Unit
        const rackMesh = new THREE.Mesh(sharedGeos.rackBody, sharedMats.rackMetal);
        rackMesh.position.y = 0.6;
        rackMesh.matrixAutoUpdate = false;
        rackMesh.updateMatrix();
        nodeGroup.add(rackMesh);

        for (let j = 0; j < 3; j++) {
          const ledMesh = new THREE.Mesh(sharedGeos.rackLed, statusMat);
          ledMesh.position.y = 0.3 + j * 0.25;
          ledMesh.matrixAutoUpdate = false;
          ledMesh.updateMatrix();
          nodeGroup.add(ledMesh);
        }
      }

      // Vertical 3D Threat Light Beacon for High/Critical Threat Nodes
      if (node.riskScore >= 60 && node.status !== 'quarantined') {
        const isCritical = node.riskScore >= 80;
        const beaconMesh = new THREE.Mesh(
          sharedGeos.threatBeacon,
          isCritical ? sharedMats.threatBeaconRed : sharedMats.threatBeaconAmber
        );
        beaconMesh.position.y = 1.35;
        beaconMesh.name = 'threatBeacon';
        nodeGroup.add(beaconMesh);
      }

      // Selection Halo
      const selMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0
      });
      const selMesh = new THREE.Mesh(sharedGeos.selectionAura, selMat);
      selMesh.rotation.x = Math.PI / 2;
      selMesh.position.y = 0.05;
      selMesh.name = 'selectionAura';
      nodeGroup.add(selMesh);

      scene.add(nodeGroup);
      nodeMeshesRef.current.set(node.id, nodeGroup);
    });

    // 7. Data Flow Pipelines & Packets (Shared Assets)
    flowCurvesRef.current = [];
    const linkMaterialNormal = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45
    });
    const linkMaterialSuspicious = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.85
    });

    links.forEach((link) => {
      const sNode = nodes.find((n) => n.id === link.source);
      const tNode = nodes.find((n) => n.id === link.target);
      if (!sNode || !tNode) return;

      const p1 = new THREE.Vector3(...sNode.position3D);
      const p2 = new THREE.Vector3(...tNode.position3D);

      const mid = new THREE.Vector3()
        .addVectors(p1, p2)
        .multiplyScalar(0.5);
      mid.y += Math.max(0.6, p1.distanceTo(p2) * 0.22);

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(p1.x, p1.y + 0.5, p1.z),
        mid,
        new THREE.Vector3(p2.x, p2.y + 0.5, p2.z)
      ]);

      const points = curve.getPoints(18);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMesh = new THREE.Line(
        lineGeo,
        link.isSuspicious ? linkMaterialSuspicious : linkMaterialNormal
      );
      lineMesh.matrixAutoUpdate = false;
      lineMesh.updateMatrix();
      scene.add(lineMesh);

      // Reusable data packet mesh
      const packetMesh = new THREE.Mesh(
        link.isSuspicious ? sharedGeos.packetSuspicious : sharedGeos.packetNormal,
        link.isSuspicious ? sharedMats.packetSuspicious : sharedMats.packetNormal
      );
      scene.add(packetMesh);

      flowCurvesRef.current.push({
        curve,
        packetMesh,
        isSuspicious: link.isSuspicious,
        speed: link.isSuspicious ? 0.007 : 0.004,
        progress: Math.random()
      });
    });

    // Raycaster for picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // =========================================================================
    // 360-DEGREE VIEW CONTROLS & OMNIDIRECTIONAL ORBIT
    // =========================================================================
    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        orbitState.current.isDragging = true;
      } else if (e.button === 2) {
        orbitState.current.isPanning = true;
      }
      orbitState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (orbitState.current.isDragging) {
        const deltaX = e.clientX - orbitState.current.previousMousePosition.x;
        const deltaY = e.clientY - orbitState.current.previousMousePosition.y;

        // True 360 Degree Rotation: No azimuth limit, and full vertical spherical range
        orbitState.current.spherical.theta -= deltaX * 0.007;
        orbitState.current.spherical.phi -= deltaY * 0.007;
        
        // 360 elevation: allows tilting all the way from zenith (0.05) to nadir (PI - 0.05)
        orbitState.current.spherical.phi = Math.max(0.08, Math.min(Math.PI - 0.08, orbitState.current.spherical.phi));

        orbitState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else if (orbitState.current.isPanning) {
        const deltaX = e.clientX - orbitState.current.previousMousePosition.x;
        const deltaY = e.clientY - orbitState.current.previousMousePosition.y;

        const panSpeed = 0.015;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

        orbitState.current.target.addScaledVector(right, -deltaX * panSpeed);
        orbitState.current.target.addScaledVector(up, deltaY * panSpeed);

        orbitState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerUp = () => {
      orbitState.current.isDragging = false;
      orbitState.current.isPanning = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitState.current.spherical.radius += e.deltaY * 0.008;
      orbitState.current.spherical.radius = Math.max(4.2, Math.min(28, orbitState.current.spherical.radius));
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let clickedNodeId: string | null = null;
      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && parent !== scene) {
          if (parent.userData?.nodeId) {
            clickedNodeId = parent.userData.nodeId;
            break;
          }
          parent = parent.parent;
        }
        if (clickedNodeId) break;
      }

      if (clickedNodeId) {
        onSelectNode(clickedNodeId);
      }
    };

    // Touch Event Handlers for Mobile 360° Viewing
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        orbitState.current.isDragging = true;
        orbitState.current.previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      } else if (e.touches.length === 2) {
        orbitState.current.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        orbitState.current.pinchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && orbitState.current.isDragging) {
        const deltaX = e.touches[0].clientX - orbitState.current.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - orbitState.current.previousMousePosition.y;

        orbitState.current.spherical.theta -= deltaX * 0.008;
        orbitState.current.spherical.phi -= deltaY * 0.008;
        orbitState.current.spherical.phi = Math.max(0.08, Math.min(Math.PI - 0.08, orbitState.current.spherical.phi));

        orbitState.current.previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const diff = orbitState.current.pinchDistance - distance;

        orbitState.current.spherical.radius += diff * 0.02;
        orbitState.current.spherical.radius = Math.max(4.2, Math.min(28, orbitState.current.spherical.radius));
        orbitState.current.pinchDistance = distance;
      }
    };

    const handleTouchEnd = () => {
      orbitState.current.isDragging = false;
    };

    // Keyboard 360° Navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft') {
        orbitState.current.spherical.theta += 0.05;
      } else if (e.code === 'ArrowRight') {
        orbitState.current.spherical.theta -= 0.05;
      } else if (e.code === 'ArrowUp') {
        orbitState.current.spherical.phi = Math.max(0.08, orbitState.current.spherical.phi - 0.04);
      } else if (e.code === 'ArrowDown') {
        orbitState.current.spherical.phi = Math.min(Math.PI - 0.08, orbitState.current.spherical.phi + 0.04);
      } else if (e.code === 'Space') {
        setAutoRotate((prev) => !prev);
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop with Throttled Label Projection for Maximum FPS
    let frameCount = 0;
    let fpsTime = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      frameCount++;
      orbitState.current.frameCount++;

      if (time - fpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTime)));
        frameCount = 0;
        fpsTime = time;
      }

      // Smooth interpolation towards snap presets
      if (orbitState.current.targetSpherical) {
        const targetS = orbitState.current.targetSpherical;
        orbitState.current.spherical.theta = THREE.MathUtils.lerp(orbitState.current.spherical.theta, targetS.theta, 0.08);
        orbitState.current.spherical.phi = THREE.MathUtils.lerp(orbitState.current.spherical.phi, targetS.phi, 0.08);
        orbitState.current.spherical.radius = THREE.MathUtils.lerp(orbitState.current.spherical.radius, targetS.radius, 0.08);

        if (Math.abs(orbitState.current.spherical.theta - targetS.theta) < 0.005 &&
            Math.abs(orbitState.current.spherical.phi - targetS.phi) < 0.005) {
          orbitState.current.targetSpherical = null;
        }
      }

      // 360 Auto-Rotation or 360 Auto-Tour
      if ((autoRotate || is360AutoTour) && !orbitState.current.isDragging && !orbitState.current.isPanning) {
        const speed = is360AutoTour ? 0.004 : 0.0025;
        orbitState.current.spherical.theta += speed;
      }

      // Smooth camera interpolation towards target LookAt
      orbitState.current.target.lerp(orbitState.current.targetLookAt, 0.08);

      // Update camera position from spherical coordinates around target
      orbitState.current.desiredCameraPos.setFromSpherical(orbitState.current.spherical);
      orbitState.current.desiredCameraPos.add(orbitState.current.target);
      camera.position.lerp(orbitState.current.desiredCameraPos, 0.14);
      camera.lookAt(orbitState.current.target);

      // Calculate current 360-degree Azimuth in degrees (0 - 360)
      const currentDeg = (((orbitState.current.spherical.theta * 180) / Math.PI) % 360 + 360) % 360;
      if (orbitState.current.frameCount % 6 === 0) {
        setCurrentAzimuth(currentDeg);
      }

      // Animate Ambient Cyber Particle Field
      if (particleSystem) {
        particleSystem.rotation.y += 0.0004;
      }

      // Animate Floor Scanning Radar Wave
      if (scanMesh && scanMat) {
        scanMesh.scale.x += 0.08;
        scanMesh.scale.y += 0.08;
        scanMat.opacity = Math.max(0, 0.65 - (scanMesh.scale.x / 18.0) * 0.65);
        if (scanMesh.scale.x > 18.0) {
          scanMesh.scale.set(0.1, 0.1, 0.1);
          scanMat.opacity = 0.65;
        }
      }

      // Subtle pulse on critical risk halos, threat light beacons & dynamic rotating meshes
      const pulseVal = Math.sin(time * 0.005) * 0.2 + 0.8;
      nodeMeshesRef.current.forEach((mesh, id) => {
        const node = nodes.find((n) => n.id === id);
        if (node) {
          const halo = mesh.getObjectByName('statusHalo') as THREE.Mesh;
          if (halo && halo.material) {
            const mat = halo.material as THREE.MeshBasicMaterial;
            if (node.riskScore >= 70) {
              mat.opacity = pulseVal;
            }
          }

          const beacon = mesh.getObjectByName('threatBeacon') as THREE.Mesh;
          if (beacon && beacon.material) {
            const bMat = beacon.material as THREE.MeshBasicMaterial;
            bMat.opacity = Math.sin(time * 0.006) * 0.2 + 0.32;
            beacon.rotation.y += 0.008;
          }

          const rotatingCluster = mesh.getObjectByName('rotatingCluster');
          if (rotatingCluster) {
            rotatingCluster.rotation.y += 0.01;
            rotatingCluster.rotation.x += 0.005;
          }

          const selectionAura = mesh.getObjectByName('selectionAura') as THREE.Mesh;
          if (selectionAura && selectionAura.material) {
            const isSel = id === selectedNodeId;
            const selMat = selectionAura.material as THREE.MeshBasicMaterial;
            selMat.opacity = isSel ? 0.85 : 0;
            if (isSel) {
              selectionAura.rotation.z += 0.02;
            }
          }
        }
      });

      // Animate data flow packets
      if (showDataFlow) {
        flowCurvesRef.current.forEach((flow) => {
          flow.progress = (flow.progress + flow.speed) % 1;
          const pos = flow.curve.getPointAt(flow.progress);
          flow.packetMesh.position.copy(pos);
          flow.packetMesh.visible = true;
          if (flow.isSuspicious) {
            flow.packetMesh.scale.setScalar(Math.sin(time * 0.01) * 0.25 + 1.1);
          }
        });
      } else {
        flowCurvesRef.current.forEach((flow) => {
          flow.packetMesh.visible = false;
        });
      }

      // Render Scene
      renderer.render(scene, camera);

      // =======================================================================
      // PERFORMANCE OPTIMIZATION: Throttled Label Projection with Threat Titles
      // =======================================================================
      if (showLabels && orbitState.current.frameCount % 3 === 0) {
        const labels: { 
          id: string; 
          name: string; 
          x: number; 
          y: number; 
          risk: number; 
          visible: boolean;
          threatName?: string;
          cve?: string;
          severity?: string;
        }[] = [];

        nodes.forEach((n) => {
          const [x, y, z] = n.position3D;
          const vec = new THREE.Vector3(x, y + 1.25, z);
          vec.project(camera);

          const isVisible = vec.z < 1;
          const screenX = ((vec.x + 1) * container.clientWidth) / 2;
          const screenY = ((-vec.y + 1) * container.clientHeight) / 2;

          // Derive Threat Name & CVE details
          let threatName = '';
          let cve = '';
          let severity = '';

          if (n.vulnerabilities && n.vulnerabilities.length > 0) {
            const topVuln = n.vulnerabilities[0];
            threatName = topVuln.title || topVuln.cve;
            cve = topVuln.cve;
            severity = topVuln.severity;
          } else if (n.riskScore >= 80) {
            threatName = 'Critical Exploit Exposure';
            cve = 'CVE-2024-CRIT';
            severity = 'critical';
          } else if (n.riskScore >= 60) {
            threatName = 'Elevated Risk Warning';
            severity = 'high';
          }

          labels.push({
            id: n.id,
            name: n.name,
            x: screenX,
            y: screenY,
            risk: n.riskScore,
            visible: isVisible,
            threatName,
            cve,
            severity
          });
        });
        setProjectedLabels(labels);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Comprehensive Resource Disposal
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);

      // Dispose shared assets
      Object.values(sharedGeos).forEach((geo) => geo.dispose());
      Object.values(sharedMats).forEach((mat) => mat.dispose());
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();

      renderer.dispose();
    };
  }, [is2DMode, webglAvailable, nodes, links, autoRotate, is360AutoTour, showDataFlow, showLabels, quality, selectedNodeId]);

  // Controls Handlers
  const handleResetCamera = useCallback(() => {
    orbitState.current.targetLookAt.set(0, 0, 0);
    orbitState.current.targetSpherical = new THREE.Spherical(13.5, 1.05, 0.8);
    onSelectNode(null);
  }, [onSelectNode]);

  // Snap to specific 360-degree angle (Front, East, Rear, West, Zenith, Nadir)
  const handleSnapAngle = useCallback((azimuthDeg: number, elevationDeg: number = 60) => {
    const currentTheta = orbitState.current.spherical.theta;
    const targetThetaBase = (azimuthDeg * Math.PI) / 180;
    const twoPi = Math.PI * 2;
    const k = Math.round((currentTheta - targetThetaBase) / twoPi);
    const nearestTheta = targetThetaBase + k * twoPi;

    const phiRad = (elevationDeg * Math.PI) / 180;
    orbitState.current.targetSpherical = new THREE.Spherical(
      orbitState.current.spherical.radius,
      phiRad,
      nearestTheta
    );
  }, []);

  // Execute a smooth full 360 degree panoramic rotation sweep
  const handleExecute360FullSpin = useCallback(() => {
    const currentTheta = orbitState.current.spherical.theta;
    orbitState.current.targetSpherical = new THREE.Spherical(
      orbitState.current.spherical.radius,
      orbitState.current.spherical.phi,
      currentTheta + Math.PI * 2
    );
  }, []);

  const handleZoomIn = useCallback(() => {
    orbitState.current.spherical.radius = Math.max(4.2, orbitState.current.spherical.radius - 2.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    orbitState.current.spherical.radius = Math.min(28, orbitState.current.spherical.radius + 2.5);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id="three-infrastructure-container"
      className={`relative w-full h-full min-h-[460px] bg-[#07090e] overflow-hidden select-none border border-slate-800/80 rounded-xl ${className}`}
      role="region"
      aria-label="3D Cyber Risk Infrastructure Viewer"
    >
      {/* 2D Fallback Map or 3D Canvas */}
      {is2DMode || !webglAvailable ? (
        <TwoDTopologyFallback
          nodes={nodes}
          links={links}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          showRiskOverlay={showRiskOverlay}
          showDataFlow={showDataFlow}
        />
      ) : (
        <canvas
          ref={canvasRef}
          id="three-webgl-canvas"
          className="w-full h-full block outline-none cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D digital infrastructure environment"
        />
      )}

      {/* 3D Screen-Space Floating Labels with Threat Titles & CVE Badges */}
      {!is2DMode && showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {projectedLabels.map((lbl) => {
            if (!lbl.visible) return null;
            const isSelected = lbl.id === selectedNodeId;
            const hasThreat = Boolean(lbl.threatName);

            return (
              <div
                key={lbl.id}
                style={{
                  transform: `translate(${lbl.x}px, ${lbl.y}px) translate(-50%, -100%)`
                }}
                className="absolute transition-transform duration-75 pointer-events-auto cursor-pointer flex flex-col items-center gap-1 group"
                onClick={() => onSelectNode(lbl.id)}
              >
                {/* Node Name & Risk Score Pill */}
                <div
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-tight whitespace-nowrap border shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/95 text-cyan-200 border-cyan-400 scale-105 ring-2 ring-cyan-500/40'
                      : lbl.risk >= 70
                      ? 'bg-red-950/90 text-red-200 border-red-500/80 shadow-red-950/50'
                      : lbl.risk >= 40
                      ? 'bg-amber-950/90 text-amber-200 border-amber-500/80 shadow-amber-950/50'
                      : 'bg-slate-900/90 text-slate-200 border-slate-700/80'
                  }`}
                >
                  {lbl.risk >= 70 ? (
                    <Flame className="w-3 h-3 text-red-400 animate-pulse shrink-0" />
                  ) : lbl.risk >= 40 ? (
                    <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                  <span>{lbl.name.length > 20 ? `${lbl.name.substring(0, 18)}...` : lbl.name}</span>
                  {showRiskOverlay && (
                    <span className={`px-1 py-0.2 rounded font-mono font-bold text-[9px] ${
                      lbl.risk >= 70 ? 'bg-red-900/90 text-red-100' :
                      lbl.risk >= 40 ? 'bg-amber-900/90 text-amber-100' : 'bg-emerald-900/90 text-emerald-100'
                    }`}>
                      {lbl.risk}
                    </span>
                  )}
                </div>

                {/* Showcase Threat Name Overlay Badge */}
                {showRiskOverlay && hasThreat && (
                  <div
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-tight whitespace-nowrap border shadow-lg backdrop-blur-md flex items-center gap-1 max-w-[240px] truncate ${
                      lbl.risk >= 70
                        ? 'bg-red-950/95 text-red-300 border-red-500/80 animate-pulse'
                        : lbl.risk >= 40
                        ? 'bg-amber-950/95 text-amber-300 border-amber-500/80'
                        : 'bg-slate-900/90 text-cyan-300 border-cyan-800/60'
                    }`}
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      THREAT: {lbl.threatName} {lbl.cve ? `(${lbl.cve})` : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 360° Auto-Rotation Active Badge */}
      {!is2DMode && autoRotate && (
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-2xl pointer-events-none select-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-tight">360° AUTO-ROTATION ACTIVE</span>
          <span className="text-slate-400 font-bold ml-1">[{Math.round(currentAzimuth)}°]</span>
        </div>
      )}

      {/* Active Selected Node 3D Threat Spotlight Banner */}
      {!is2DMode && selectedNode && selectedNode.vulnerabilities && selectedNode.vulnerabilities.length > 0 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-slate-950/95 border border-red-500/60 backdrop-blur-md shadow-2xl flex items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>ACTIVE 3D THREAT SPOTLIGHT</span>
              <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 font-mono text-[9px]">
                {selectedNode.vulnerabilities[0].cve}
              </span>
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{selectedNode.vulnerabilities[0].title}</span>
              <span className="text-[10px] text-slate-400 font-mono">[{selectedNode.name}]</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating HUD Controls with 360° View Engine & Performance Dashboard */}
      <ViewerControls
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        onResetCamera={handleResetCamera}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((prev) => !prev)}
        showRiskOverlay={showRiskOverlay}
        onToggleRiskOverlay={() => setShowRiskOverlay((prev) => !prev)}
        showDataFlow={showDataFlow}
        onToggleDataFlow={() => setShowDataFlow((prev) => !prev)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        quality={quality}
        onChangeQuality={setQuality}
        is2DMode={is2DMode}
        onToggle2DMode={() => setIs2DMode((prev) => !prev)}
        showDevMetrics={showDevMetrics}
        onToggleDevMetrics={() => setShowDevMetrics((prev) => !prev)}
        fps={fps}
        triangleCount={triangleCount}
        drawCalls={drawCalls}
        currentAzimuthDegrees={currentAzimuth}
        onSnapAngle={handleSnapAngle}
        is360AutoTour={is360AutoTour}
        onToggle360AutoTour={() => setIs360AutoTour((prev) => !prev)}
        onExecute360FullSpin={handleExecute360FullSpin}
      />

      {/* Selected Asset Deep-Dive Drawer */}
      <AssetDetailPanel
        node={selectedNode}
        onClose={() => onSelectNode(null)}
        onQuarantine={onQuarantineNode}
        onNavigateToDetections={onNavigateToDetections}
        onNavigateToRecommendations={onNavigateToRecommendations}
      />
    </div>
  );
};
