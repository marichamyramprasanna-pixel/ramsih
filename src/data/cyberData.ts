import { 
  InfrastructureNode, 
  DataFlowLink, 
  AnomalyDetection, 
  Investigation, 
  Recommendation, 
  ThreatIntelligenceReport, 
  EnterpriseRiskSummary 
} from '../types';

export const INITIAL_NODES: InfrastructureNode[] = [
  {
    id: 'node-dc-core',
    name: 'Primary Financial SQL Vault',
    hostname: 'sql-prod-fin-01.vault.internal',
    ipAddress: '10.140.2.14',
    category: 'database',
    tier: 'Core Data',
    riskScore: 78,
    compromiseProbability: 42,
    businessCriticality: 'Tier 1',
    financialExposure: 4250000,
    status: 'under-investigation',
    lastUpdated: '2 mins ago',
    position3D: [0, 0.4, 0], // Center core
    connections: ['node-app-cluster-a', 'node-auth-iam', 'node-cache-tier', 'node-bastion'],
    anomaliesCount: 2,
    cpuLoad: 84,
    dataThroughputMbps: 620,
    operatingSystem: 'Red Hat Enterprise Linux 9.2 (FIPS-140-3)',
    environment: 'On-Premises Core',
    owner: 'Financial Platform Engineering',
    description: 'Mission-critical relational ledger database housing PCI-DSS cardholder records and transaction ledgers.',
    vulnerabilities: [
      {
        id: 'vuln-01',
        cve: 'CVE-2024-3094',
        title: 'XZ Utils Upstream Supply Chain Backdoor',
        severity: 'critical',
        cvss: 9.8,
        exploitAvailable: true,
        attackVector: 'Network',
        description: 'Compromised build-time backdoor enabling unauthorized SSH authentication bypass under specific glibc environments.',
        remediation: 'Downgrade liblzma to 5.4.6 and revoke all active SSH host session tokens immediately.'
      },
      {
        id: 'vuln-02',
        cve: 'CVE-2023-48795',
        title: 'Terrapin SSH Protocol Flaw',
        severity: 'medium',
        cvss: 5.9,
        exploitAvailable: false,
        attackVector: 'Network',
        description: 'Sequence manipulation vulnerability in SSH transport protocol allowing handshake integrity tampering.',
        remediation: 'Disable ChaCha20-Poly1305 and encrypt-then-mac MACs in sshd_config.'
      }
    ]
  },
  {
    id: 'node-data-warehouse',
    name: 'Customer Master Lakehouse',
    hostname: 'lakehouse-core-01.data.internal',
    ipAddress: '10.140.4.88',
    category: 'database',
    tier: 'Core Data',
    riskScore: 64,
    compromiseProbability: 29,
    businessCriticality: 'Tier 1',
    financialExposure: 2900000,
    status: 'online',
    lastUpdated: '14 mins ago',
    position3D: [1.8, 0.2, -1.2],
    connections: ['node-dc-core', 'node-app-cluster-b', 'node-s3-bucket'],
    anomaliesCount: 1,
    cpuLoad: 68,
    dataThroughputMbps: 1450,
    operatingSystem: 'Debian GNU/Linux 12 (Hardened)',
    environment: 'GCP asia-east',
    owner: 'BigData & Analytics Team',
    description: 'Aggregated analytics and user identity metadata warehouse storing pseudonymized customer profiles.',
    vulnerabilities: [
      {
        id: 'vuln-03',
        cve: 'CVE-2024-21626',
        title: 'Runc Container Breakout via Leaked File Descriptors',
        severity: 'high',
        cvss: 8.6,
        exploitAvailable: true,
        attackVector: 'Local',
        description: 'Internal file descriptor leak in runc allows container processes to overwrite host filesystem binaries.',
        remediation: 'Upgrade containerd to v1.7.13 and apply kernel Seccomp filters.'
      }
    ]
  },
  {
    id: 'node-waf-edge',
    name: 'NextGen Perimeter Gateway WAF',
    hostname: 'gw-waf-edge-01.perimeter.net',
    ipAddress: '198.51.100.22',
    category: 'gateway-firewall',
    tier: 'Perimeter',
    riskScore: 88,
    compromiseProbability: 67,
    businessCriticality: 'Tier 1',
    financialExposure: 3100000,
    status: 'degraded',
    lastUpdated: 'Just now',
    position3D: [-3.6, 0.5, 3.2],
    connections: ['node-internet', 'node-load-balancer'],
    anomaliesCount: 4,
    cpuLoad: 92,
    dataThroughputMbps: 4800,
    operatingSystem: 'Hardened Alpine Linux (BSD Kernel)',
    environment: 'Edge DC',
    owner: 'SecOps Perimeter Defense',
    description: 'Exterior DDoS shield, Layer-7 HTTP inspection, TLS termination engine, and Geo-IP boundary defender.',
    vulnerabilities: [
      {
        id: 'vuln-04',
        cve: 'CVE-2024-27198',
        title: 'JetBrains / Gateway Authentication Bypass',
        severity: 'critical',
        cvss: 9.8,
        exploitAvailable: true,
        attackVector: 'Network',
        description: 'Unauthenticated remote administrative access bypass through improper URI path parsing.',
        remediation: 'Apply emergency vendor patch or inject strict ingress URI path rejection rules at CDN layer.'
      }
    ]
  },
  {
    id: 'node-internet',
    name: 'External Ingress Transit (WAN)',
    hostname: 'asn-transit-border.isp.net',
    ipAddress: '203.0.113.1',
    category: 'gateway-firewall',
    tier: 'Perimeter',
    riskScore: 45,
    compromiseProbability: 22,
    businessCriticality: 'Tier 2',
    financialExposure: 800000,
    status: 'online',
    lastUpdated: '3 mins ago',
    position3D: [-5.2, 0.8, 4.5],
    connections: ['node-waf-edge'],
    anomaliesCount: 0,
    cpuLoad: 38,
    dataThroughputMbps: 8500,
    operatingSystem: 'Junos OS 23.4R1',
    environment: 'Edge DC',
    owner: 'Network Engineering',
    description: 'BGP Anycast routing hub peering with tier-1 transit providers.',
    vulnerabilities: []
  },
  {
    id: 'node-load-balancer',
    name: 'Global Anycast Load Balancer',
    hostname: 'alb-prod-ingress.cloud.internal',
    ipAddress: '10.100.0.1',
    category: 'gateway-firewall',
    tier: 'Ingress',
    riskScore: 32,
    compromiseProbability: 15,
    businessCriticality: 'Tier 1',
    financialExposure: 1100000,
    status: 'online',
    lastUpdated: '8 mins ago',
    position3D: [-2.2, 0.3, 1.8],
    connections: ['node-waf-edge', 'node-app-cluster-a', 'node-payment-api'],
    anomaliesCount: 0,
    cpuLoad: 44,
    dataThroughputMbps: 3600,
    operatingSystem: 'Envoy Proxy 1.29.1 on Linux 6.6',
    environment: 'AWS us-east-1',
    owner: 'Site Reliability Engineering',
    description: 'Distributes encrypted customer requests across production microservices clusters with health checks.',
    vulnerabilities: []
  },
  {
    id: 'node-app-cluster-a',
    name: 'Kubernetes Microservices Mesh [AWS]',
    hostname: 'k8s-prod-us-east.cluster.internal',
    ipAddress: '10.100.12.50',
    category: 'cloud-cluster',
    tier: 'Application',
    riskScore: 72,
    compromiseProbability: 51,
    businessCriticality: 'Tier 1',
    financialExposure: 3800000,
    status: 'under-investigation',
    lastUpdated: '1 min ago',
    position3D: [-1.2, 0.4, -0.8],
    connections: ['node-load-balancer', 'node-dc-core', 'node-auth-iam', 'node-cache-tier'],
    anomaliesCount: 3,
    cpuLoad: 79,
    dataThroughputMbps: 2100,
    operatingSystem: 'Bottlerocket OS (Kubernetes 1.29)',
    environment: 'AWS us-east-1',
    owner: 'Cloud Platform Engineering',
    description: 'Hosts customer dashboard, loan underwriting calculations, and consumer-facing API microservices.',
    vulnerabilities: [
      {
        id: 'vuln-05',
        cve: 'CVE-2024-21626',
        title: 'Container Escape via Shared Workdir Leaks',
        severity: 'high',
        cvss: 8.6,
        exploitAvailable: true,
        attackVector: 'Local',
        description: 'Allows unprivileged pods to break out to node root namespace through cwd descriptors.',
        remediation: 'Apply Kubernetes admission webhook to enforce non-root user containers and runc 1.1.12.'
      },
      {
        id: 'vuln-06',
        cve: 'CVE-2023-44487',
        title: 'HTTP/2 Rapid Reset Attack',
        severity: 'high',
        cvss: 7.5,
        exploitAvailable: true,
        attackVector: 'Network',
        description: 'RST_STREAM frame flood causes massive CPU exhaustion in gRPC service endpoints.',
        remediation: 'Cap concurrent stream resets at 100 per connection inside envoy ingress.'
      }
    ]
  },
  {
    id: 'node-app-cluster-b',
    name: 'Kubernetes Analytics Mesh [GCP]',
    hostname: 'k8s-analytics-asia.cluster.internal',
    ipAddress: '10.120.18.20',
    category: 'cloud-cluster',
    tier: 'Application',
    riskScore: 48,
    compromiseProbability: 24,
    businessCriticality: 'Tier 2',
    financialExposure: 1400000,
    status: 'online',
    lastUpdated: '12 mins ago',
    position3D: [2.5, 0.4, 0.6],
    connections: ['node-data-warehouse', 'node-s3-bucket', 'node-cache-tier'],
    anomaliesCount: 1,
    cpuLoad: 52,
    dataThroughputMbps: 1800,
    operatingSystem: 'Container-Optimized OS (GKE)',
    environment: 'GCP asia-east',
    owner: 'Data Science & Risk Modeling',
    description: 'Batch processing and ML inference workers computing algorithmic risk metrics and real-time fraud scores.',
    vulnerabilities: []
  },
  {
    id: 'node-payment-api',
    name: 'Payment Settlement Tokenizer',
    hostname: 'token-pay-pci.internal.secure',
    ipAddress: '10.140.8.10',
    category: 'app-service',
    tier: 'Application',
    riskScore: 82,
    compromiseProbability: 58,
    businessCriticality: 'Tier 1',
    financialExposure: 5100000,
    status: 'under-investigation',
    lastUpdated: 'Just now',
    position3D: [-0.6, 0.6, 1.6],
    connections: ['node-load-balancer', 'node-dc-core', 'node-auth-iam'],
    anomaliesCount: 2,
    cpuLoad: 88,
    dataThroughputMbps: 890,
    operatingSystem: 'Alpine Linux 3.19 (Minimal Hardened)',
    environment: 'On-Premises Core',
    owner: 'Payments & Treasury Tech',
    description: 'PCI Level 1 isolated tokenization vault that converts credit card and ACH account numbers into cryptographic handles.',
    vulnerabilities: [
      {
        id: 'vuln-07',
        cve: 'CVE-2024-23897',
        title: 'Arbitrary File Read via CLI Argument Syntax',
        severity: 'critical',
        cvss: 9.8,
        exploitAvailable: true,
        attackVector: 'Network',
        description: 'Improper command parsing lets attackers read arbitrary files from server memory through @-file syntax.',
        remediation: 'Disable CLI over remoting and isolate HSM signing keys to hardware crypto modules.'
      }
    ]
  },
  {
    id: 'node-auth-iam',
    name: 'Directory IAM & Okta Identity Vault',
    hostname: 'id-vault-oauth.sso.internal',
    ipAddress: '10.140.1.5',
    category: 'app-service',
    tier: 'Management',
    riskScore: 55,
    compromiseProbability: 31,
    businessCriticality: 'Tier 1',
    financialExposure: 4800000,
    status: 'online',
    lastUpdated: '5 mins ago',
    position3D: [0.8, 0.5, -2.4],
    connections: ['node-dc-core', 'node-app-cluster-a', 'node-bastion', 'node-payment-api'],
    anomaliesCount: 1,
    cpuLoad: 41,
    dataThroughputMbps: 310,
    operatingSystem: 'Ubuntu Core 22.04 LTS',
    environment: 'On-Premises Core',
    owner: 'Identity & Access Management',
    description: 'Central OAuth2, OIDC and SAML identity broker managing workforce credentials, MFA tokens and service account keys.',
    vulnerabilities: []
  },
  {
    id: 'node-cache-tier',
    name: 'Distributed Redis In-Memory Mesh',
    hostname: 'cache-cluster-prod.cache.internal',
    ipAddress: '10.100.30.12',
    category: 'app-service',
    tier: 'Application',
    riskScore: 28,
    compromiseProbability: 12,
    businessCriticality: 'Tier 2',
    financialExposure: 650000,
    status: 'online',
    lastUpdated: '19 mins ago',
    position3D: [1.2, 0.2, 1.8],
    connections: ['node-app-cluster-a', 'node-app-cluster-b', 'node-dc-core'],
    anomaliesCount: 0,
    cpuLoad: 33,
    dataThroughputMbps: 2900,
    operatingSystem: 'Redis Enterprise 7.2 on Debian',
    environment: 'AWS us-east-1',
    owner: 'Core Backend Engineering',
    description: 'Ephemeral session cache holding customer JWT revocation lists and hot user sessions.',
    vulnerabilities: []
  },
  {
    id: 'node-s3-bucket',
    name: 'Immutable Audit Blob Vault',
    hostname: 's3-cold-audit-storage.cloud',
    ipAddress: '10.120.90.5',
    category: 'database',
    tier: 'Core Data',
    riskScore: 22,
    compromiseProbability: 8,
    businessCriticality: 'Tier 2',
    financialExposure: 950000,
    status: 'online',
    lastUpdated: '22 mins ago',
    position3D: [3.8, 0.2, -1.8],
    connections: ['node-data-warehouse', 'node-app-cluster-b'],
    anomaliesCount: 0,
    cpuLoad: 18,
    dataThroughputMbps: 740,
    operatingSystem: 'Cloud Managed Object Store',
    environment: 'GCP asia-east',
    owner: 'Compliance & Legal Archive',
    description: 'WORM (Write Once, Read Many) encrypted storage for 7-year regulatory compliance records and ledger logs.',
    vulnerabilities: []
  },
  {
    id: 'node-bastion',
    name: 'Zero-Trust Bastion Teleport Host',
    hostname: 'bastion-ztna-01.mgmt.internal',
    ipAddress: '10.140.0.10',
    category: 'gateway-firewall',
    tier: 'Management',
    riskScore: 91,
    compromiseProbability: 74,
    businessCriticality: 'Tier 1',
    financialExposure: 4900000,
    status: 'quarantined',
    lastUpdated: '2 mins ago',
    position3D: [-2.4, 0.7, -2.6],
    connections: ['node-dc-core', 'node-auth-iam', 'node-cicd-runner', 'node-siem-core'],
    anomaliesCount: 3,
    cpuLoad: 95,
    dataThroughputMbps: 120,
    operatingSystem: 'Fedora CoreOS with SELinux Enforcing',
    environment: 'On-Premises Core',
    owner: 'Infrastructure Security Ops',
    description: 'Jump host providing SSH certificate validation, session recording, and credential-less privileged access.',
    vulnerabilities: [
      {
        id: 'vuln-08',
        cve: 'CVE-2024-3094',
        title: 'Malicious Code Injection in xz/lzma SSH Helper',
        severity: 'critical',
        cvss: 10.0,
        exploitAvailable: true,
        attackVector: 'Network',
        description: 'Observed weaponized payload attempting memory-resident shell injection through pre-auth openssh daemon.',
        remediation: 'Immediate node isolation, revert VM snapshot to clean gold image, rotate host SSH host keys.'
      }
    ]
  },
  {
    id: 'node-cicd-runner',
    name: 'GitOps CI/CD Deployment Controller',
    hostname: 'runner-controller-01.cicd.internal',
    ipAddress: '10.100.45.10',
    category: 'cloud-cluster',
    tier: 'Management',
    riskScore: 84,
    compromiseProbability: 61,
    businessCriticality: 'Tier 1',
    financialExposure: 3400000,
    status: 'under-investigation',
    lastUpdated: '4 mins ago',
    position3D: [-3.8, 0.4, -1.2],
    connections: ['node-bastion', 'node-app-cluster-a'],
    anomaliesCount: 2,
    cpuLoad: 76,
    dataThroughputMbps: 450,
    operatingSystem: 'Ubuntu 22.04 LTS (Docker in Docker)',
    environment: 'AWS us-east-1',
    owner: 'DevOps & Tooling Engineering',
    description: 'Build automation engine with IAM deployment roles capable of pushing production container manifests.',
    vulnerabilities: [
      {
        id: 'vuln-09',
        cve: 'CVE-2023-42793',
        title: 'TeamCity/Build Server Authentication Bypass',
        severity: 'high',
        cvss: 8.8,
        exploitAvailable: true,
        attackVector: 'Network',
        description: 'Permits unauthenticated remote token generation via RPC endpoints in build server orchestrator.',
        remediation: 'Enforce private subnet access only and rotate runner service account AWS STS credentials.'
      }
    ]
  },
  {
    id: 'node-siem-core',
    name: 'SOC Threat Analytics & SIEM Core',
    hostname: 'siem-engine-soc.sec.internal',
    ipAddress: '10.140.0.50',
    category: 'app-service',
    tier: 'Management',
    riskScore: 19,
    compromiseProbability: 6,
    businessCriticality: 'Tier 1',
    financialExposure: 1200000,
    status: 'online',
    lastUpdated: 'Just now',
    position3D: [-1.2, 0.3, -3.6],
    connections: ['node-bastion', 'node-auth-iam', 'node-dc-core'],
    anomaliesCount: 0,
    cpuLoad: 58,
    dataThroughputMbps: 3400,
    operatingSystem: 'Hardened Rocky Linux 9',
    environment: 'On-Premises Core',
    owner: 'Security Operations Center',
    description: 'Aggregates 40,000 events/sec across VPC flow logs, endpoint EDR, and IAM cloud audit streams.',
    vulnerabilities: []
  },
  {
    id: 'node-workstation-dev',
    name: 'Staff Engineering Bastion Fleet',
    hostname: 'vdi-corp-eng-fleet.corp.internal',
    ipAddress: '10.200.5.100',
    category: 'endpoint-workstation',
    tier: 'Management',
    riskScore: 61,
    compromiseProbability: 38,
    businessCriticality: 'Tier 2',
    financialExposure: 1800000,
    status: 'online',
    lastUpdated: '10 mins ago',
    position3D: [3.4, 0.3, 2.8],
    connections: ['node-vpn-gw', 'node-cicd-runner'],
    anomaliesCount: 1,
    cpuLoad: 48,
    dataThroughputMbps: 210,
    operatingSystem: 'macOS Sonoma Enterprise Profile / Intune',
    environment: 'Edge DC',
    owner: 'Enterprise IT & Workstation Ops',
    description: 'Developer laptops with source code access, local Docker instances, and internal Git credentials.',
    vulnerabilities: [
      {
        id: 'vuln-10',
        cve: 'CVE-2024-21413',
        title: 'Microsoft Outlook / Mail Preview Moniker Bypass',
        severity: 'medium',
        cvss: 6.5,
        exploitAvailable: false,
        attackVector: 'Local',
        description: 'Improper sanitization of file:// links allowing NTLM credential relaying across external routes.',
        remediation: 'Deploy endpoint patch KB5034763 and block outbound SMB port 445 on corporate gateway.'
      }
    ]
  },
  {
    id: 'node-vpn-gw',
    name: 'Executive & Remote VPN Gateway',
    hostname: 'vpn-ssl-corporate.corp.net',
    ipAddress: '198.51.100.95',
    category: 'gateway-firewall',
    tier: 'Perimeter',
    riskScore: 71,
    compromiseProbability: 49,
    businessCriticality: 'Tier 2',
    financialExposure: 2300000,
    status: 'degraded',
    lastUpdated: '7 mins ago',
    position3D: [4.2, 0.5, 1.4],
    connections: ['node-internet', 'node-workstation-dev', 'node-auth-iam'],
    anomaliesCount: 2,
    cpuLoad: 81,
    dataThroughputMbps: 920,
    operatingSystem: 'FortiOS 7.4.2 Hardened Appliance',
    environment: 'Edge DC',
    owner: 'Network Security Team',
    description: 'SSL-VPN termination appliance supporting WireGuard, OpenVPN, and SAML token authentication.',
    vulnerabilities: [
      {
        id: 'vuln-11',
        cve: 'CVE-2024-21762',
        title: 'FortiOS Out-of-Bound Write in sslvpnd Daemon',
        severity: 'critical',
        cvss: 9.8,
        exploitAvailable: true,
        attackVector: 'Network',
        description: 'Unauthenticated remote code execution via specially crafted HTTP requests to ssl-vpn portal.',
        remediation: 'Upgrade firmware to v7.4.3 or disable SSL-VPN web portal feature immediately.'
      }
    ]
  }
];

export const INITIAL_DATA_FLOWS: DataFlowLink[] = [
  {
    id: 'flow-01',
    source: 'node-internet',
    target: 'node-waf-edge',
    protocol: 'HTTPS',
    trafficVolumeMbps: 4800,
    isSuspicious: true,
    threatLabel: 'Distributed Volumetric Ingress Surge (42k req/s)'
  },
  {
    id: 'flow-02',
    source: 'node-waf-edge',
    target: 'node-load-balancer',
    protocol: 'HTTPS',
    trafficVolumeMbps: 3600,
    isSuspicious: false
  },
  {
    id: 'flow-03',
    source: 'node-load-balancer',
    target: 'node-payment-api',
    protocol: 'gRPC',
    trafficVolumeMbps: 890,
    isSuspicious: false
  },
  {
    id: 'flow-04',
    source: 'node-load-balancer',
    target: 'node-app-cluster-a',
    protocol: 'HTTPS',
    trafficVolumeMbps: 2100,
    isSuspicious: false
  },
  {
    id: 'flow-05',
    source: 'node-app-cluster-a',
    target: 'node-dc-core',
    protocol: 'TLS-DB',
    trafficVolumeMbps: 620,
    isSuspicious: true,
    threatLabel: 'Unusual Bulk Query Pattern: 1.2M records/min'
  },
  {
    id: 'flow-06',
    source: 'node-payment-api',
    target: 'node-dc-core',
    protocol: 'TLS-DB',
    trafficVolumeMbps: 340,
    isSuspicious: false
  },
  {
    id: 'flow-07',
    source: 'node-bastion',
    target: 'node-dc-core',
    protocol: 'SSH',
    trafficVolumeMbps: 45,
    isSuspicious: true,
    threatLabel: 'Anomalous Lateral SSH Attempt with CVE-2024-3094 signature'
  },
  {
    id: 'flow-08',
    source: 'node-cicd-runner',
    target: 'node-bastion',
    protocol: 'SSH',
    trafficVolumeMbps: 35,
    isSuspicious: true,
    threatLabel: 'Out-of-Schedule Automated Credential Probing'
  },
  {
    id: 'flow-09',
    source: 'node-vpn-gw',
    target: 'node-workstation-dev',
    protocol: 'IPSec',
    trafficVolumeMbps: 210,
    isSuspicious: false
  },
  {
    id: 'flow-10',
    source: 'node-workstation-dev',
    target: 'node-cicd-runner',
    protocol: 'HTTPS',
    trafficVolumeMbps: 110,
    isSuspicious: false
  },
  {
    id: 'flow-11',
    source: 'node-app-cluster-a',
    target: 'node-cache-tier',
    protocol: 'gRPC',
    trafficVolumeMbps: 1800,
    isSuspicious: false
  },
  {
    id: 'flow-12',
    source: 'node-data-warehouse',
    target: 'node-s3-bucket',
    protocol: 'HTTPS',
    trafficVolumeMbps: 740,
    isSuspicious: false
  },
  {
    id: 'flow-13',
    source: 'node-siem-core',
    target: 'node-bastion',
    protocol: 'TLS-DB',
    trafficVolumeMbps: 90,
    isSuspicious: false
  }
];

export const INITIAL_ANOMALIES: AnomalyDetection[] = [
  {
    id: 'anom-101',
    title: 'Lateral SSH Movement from Zero-Trust Bastion Host',
    assetId: 'node-bastion',
    assetName: 'Zero-Trust Bastion Teleport Host',
    detectedAt: '3 minutes ago',
    severity: 'critical',
    compromiseProbability: 89,
    mitreTactic: 'Lateral Movement (TA0008)',
    mitreTechnique: 'Remote Services: SSH (T1021.004)',
    description: 'Sudden spike in automated SSH key exchange sequences targeting Core Financial DB using anomalous pre-auth headers resembling CVE-2024-3094 payload signatures.',
    evidence: [
      'SSHD auth failures jumped from 0.02/min to 148/min',
      'Origin socket matched non-standard build artifact thread',
      'Target IP: 10.140.2.14 (Primary Financial SQL Vault)'
    ],
    status: 'active'
  },
  {
    id: 'anom-102',
    title: 'WAF Evasion & Out-of-Bounds Buffer Spraying',
    assetId: 'node-waf-edge',
    assetName: 'NextGen Perimeter Gateway WAF',
    detectedAt: '7 minutes ago',
    severity: 'critical',
    compromiseProbability: 78,
    mitreTactic: 'Initial Access (TA0001)',
    mitreTechnique: 'Exploit Public-Facing App (T1190)',
    description: 'High-density fragmented HTTP requests containing crafted byte sequences attempting heap overflow in SSL proxy handler.',
    evidence: [
      'Byte pattern matches CVE-2024-21762 exploit generator',
      'Origin ASNs traced to bulletproof hosting networks in Eastern Europe',
      'Worker process segfault rate: 12 events in 90 seconds'
    ],
    status: 'investigating'
  },
  {
    id: 'anom-103',
    title: 'PCI Tokenizer Database Extraction Volume Anomaly',
    assetId: 'node-payment-api',
    assetName: 'Payment Settlement Tokenizer',
    detectedAt: '18 minutes ago',
    severity: 'high',
    compromiseProbability: 64,
    mitreTactic: 'Exfiltration (TA0010)',
    mitreTechnique: 'Exfiltration Over Web Service (T1567)',
    description: 'Token lookup volume exceeded 400% of rolling 30-day baseline during non-trading operational hours.',
    evidence: [
      'Query rate: 4,200 token lookups/sec (baseline: 450/sec)',
      'No corresponding settlement batch job scheduled in cron',
      'Anomalous API caller identity: runner-service-account'
    ],
    status: 'active'
  },
  {
    id: 'anom-104',
    title: 'Unauthorized IAM Role Assumption on CI/CD Controller',
    assetId: 'node-cicd-runner',
    assetName: 'GitOps CI/CD Deployment Controller',
    detectedAt: '34 minutes ago',
    severity: 'high',
    compromiseProbability: 58,
    mitreTactic: 'Privilege Escalation (TA0004)',
    mitreTechnique: 'Valid Accounts: Cloud Accounts (T1078.004)',
    description: 'Continuous Integration agent invoked sts:AssumeRole for AdministratorAccess outside verified pull-request workflow.',
    evidence: [
      'AWS CloudTrail event logged without corresponding GitHub webhook HMAC',
      'Session tagged with unauthorized dev branch: test-debug-eval',
      'Egress socket opened to unfamiliar digital ocean droplet'
    ],
    status: 'investigating'
  },
  {
    id: 'anom-105',
    title: 'Privilege Probing on Kubernetes Node DaemonSet',
    assetId: 'node-app-cluster-a',
    assetName: 'Kubernetes Microservices Mesh [AWS]',
    detectedAt: '1 hour ago',
    severity: 'medium',
    compromiseProbability: 38,
    mitreTactic: 'Discovery (TA0007)',
    mitreTechnique: 'System Information Discovery (T1082)',
    description: 'Pod repeatedly inspected /proc/self/fd and host mount paths indicating automated container escape survey.',
    evidence: [
      'Syscall audit logged SYS_PTRACE denials',
      'Pod name: telemetry-exporter-c89b4f'
    ],
    status: 'contained'
  }
];

export const INITIAL_INVESTIGATIONS: Investigation[] = [
  {
    id: 'inv-2024-089',
    title: 'Operation Velvet Breach: Supply Chain & Bastion Pivot',
    incidentCommander: 'Elena Vance, Lead Threat Hunter',
    startedAt: '42 mins ago',
    severity: 'critical',
    status: 'containment-in-progress',
    targetAssetIds: ['node-bastion', 'node-cicd-runner', 'node-dc-core'],
    threatVector: 'Supply Chain Compromise -> SSH Backdoor -> SQL Infiltration',
    estimatedLossAvoided: 3850000,
    timeline: [
      {
        timestamp: '03:12:04 UTC',
        event: 'Unusual git commit pushed to internal dependency mirror by CI runner account',
        actor: 'Threat Actor UNC-3882',
        type: 'alert'
      },
      {
        timestamp: '03:16:45 UTC',
        event: 'Bastion host compiled modified liblzma utility during scheduled update',
        actor: 'Automated Package Manager',
        type: 'forensic'
      },
      {
        timestamp: '03:22:10 UTC',
        event: 'Anomalous SSH connection initiated from Bastion to Primary Financial SQL Vault',
        actor: 'Threat Actor UNC-3882',
        type: 'alert'
      },
      {
        timestamp: '03:25:30 UTC',
        event: 'Automated Aegis 3D quarantine rule triggered: Host network isolated via SDN VLAN swap',
        actor: 'Aegis Autonomous Defense Engine',
        type: 'containment'
      },
      {
        timestamp: '03:29:12 UTC',
        event: 'Memory dump acquisition completed for forensic analysis (artifact sha256: 4f8a...e9)',
        actor: 'Elena Vance (SecOps)',
        type: 'action'
      }
    ],
    mitigationSteps: [
      'Quarantine Bastion host from production control plane [COMPLETED]',
      'Invalidate and reissue all Okta Kerberos and SSH host certificates [IN PROGRESS]',
      'Execute database integrity checksum verification on table: pci_card_records [QUEUED]',
      'Roll back CI runner images to immutable gold image v2.14.0 [COMPLETED]'
    ]
  },
  {
    id: 'inv-2024-088',
    title: 'Perimeter SSL-VPN Buffer Spray & Egress Beaconing',
    incidentCommander: 'Marcus Zhang, Principal SOC Analyst',
    startedAt: '2 hours ago',
    severity: 'high',
    status: 'open',
    targetAssetIds: ['node-vpn-gw', 'node-waf-edge'],
    threatVector: 'Unauthenticated RCE Exploit in Perimeter VPN Daemon',
    estimatedLossAvoided: 1800000,
    timeline: [
      {
        timestamp: '01:45:12 UTC',
        event: 'CVE-2024-21762 signature matched across 14 inbound packets',
        actor: 'Perimeter Sensor 04',
        type: 'alert'
      },
      {
        timestamp: '02:05:00 UTC',
        event: 'WAF rate limiter automatically shifted VPN ingress to verified IP whitelist',
        actor: 'Marcus Zhang',
        type: 'containment'
      }
    ],
    mitigationSteps: [
      'Apply vendor emergency firmware patch v7.4.3 [SCHEDULED FOR 04:00 UTC]',
      'Force immediate re-authentication for all 384 active employee VPN sessions [QUEUED]'
    ]
  }
];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-01',
    title: 'Emergency Downgrade & Removal of Compromised XZ/LZMA Libraries',
    targetAssetId: 'node-bastion',
    targetAssetName: 'Zero-Trust Bastion Teleport Host',
    priority: 'P1 - Critical',
    effortDays: 0.2,
    estimatedCostUSD: 2500,
    riskReductionScore: 32,
    financialRiskReductionUSD: 2450000,
    status: 'pending',
    actionType: 'Patching',
    description: 'Downgrade liblzma package to 5.4.6 and rebuild initramfs to permanently eradicate CVE-2024-3094 injection paths.'
  },
  {
    id: 'rec-02',
    title: 'Zero-Trust Microsegmentation: Isolate SQL Vault from Management Tier',
    targetAssetId: 'node-dc-core',
    targetAssetName: 'Primary Financial SQL Vault',
    priority: 'P1 - Critical',
    effortDays: 1.0,
    estimatedCostUSD: 8000,
    riskReductionScore: 24,
    financialRiskReductionUSD: 1850000,
    status: 'pending',
    actionType: 'Segmentation',
    description: 'Enforce mutual TLS (mTLS) with client certificate pinned strictly to Kubernetes Payment Microservice, blocking direct SSH transit.'
  },
  {
    id: 'rec-03',
    title: 'Rotate Root STS Credentials and Enforce GitHub OIDC Federation',
    targetAssetId: 'node-cicd-runner',
    targetAssetName: 'GitOps CI/CD Deployment Controller',
    priority: 'P2 - High',
    effortDays: 0.5,
    estimatedCostUSD: 3200,
    riskReductionScore: 18,
    financialRiskReductionUSD: 1100000,
    status: 'pending',
    actionType: 'Credential Rotation',
    description: 'Revoke long-lived IAM user access keys on build runners; replace with short-lived ephemeral OpenID Connect AWS roles.'
  },
  {
    id: 'rec-04',
    title: 'Upgrade FortiOS Perimeter Appliance & Disable Web-Mode SSL-VPN',
    targetAssetId: 'node-vpn-gw',
    targetAssetName: 'Executive & Remote VPN Gateway',
    priority: 'P2 - High',
    effortDays: 0.5,
    estimatedCostUSD: 4500,
    riskReductionScore: 16,
    financialRiskReductionUSD: 950000,
    status: 'pending',
    actionType: 'Patching',
    description: 'Deploy patch firmware 7.4.3 and terminate web portal mode to close unauthenticated memory overwrite attack surface.'
  },
  {
    id: 'rec-05',
    title: 'Kubernetes Seccomp & Read-Only Root Filesystem Policy Enforcement',
    targetAssetId: 'node-app-cluster-a',
    targetAssetName: 'Kubernetes Microservices Mesh [AWS]',
    priority: 'P3 - Moderate',
    effortDays: 2.0,
    estimatedCostUSD: 12000,
    riskReductionScore: 12,
    financialRiskReductionUSD: 720000,
    status: 'pending',
    actionType: 'Egress Lockdown',
    description: 'Apply Gatekeeper admission constraints to mandate readOnlyRootFilesystem=true across all production pods.'
  }
];

export const INITIAL_THREAT_INTEL: ThreatIntelligenceReport[] = [
  {
    id: 'threat-actor-01',
    threatActor: 'UNC-3882 (Volt Shadow)',
    campaignName: 'Operation Velvet Keystone',
    targetedIndustries: ['FinTech', 'Cloud Infrastructure', 'Payment Processors'],
    targetedCVEs: ['CVE-2024-3094', 'CVE-2024-21762', 'CVE-2023-48795'],
    confidence: 'Confirmed',
    firstSeen: 'March 2024',
    summary: 'Nation-state affiliated advanced persistent threat (APT) specialized in supply chain infiltration, upstream tarball poisoning, and stealth lateral movement via living-off-the-land binaries.',
    iocs: [
      '194.26.29.112 (Command & Control)',
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBackdoorKeyExampleHash',
      'sha256: 4f8a912bb1590e8c4598d1a6136d2e99f0183204910a74791b8d2238466102ee'
    ]
  },
  {
    id: 'threat-actor-02',
    threatActor: 'Scattered Viper (FIN-12 Affiliate)',
    campaignName: 'Ransomware Pre-Positioning Campaign',
    targetedIndustries: ['Financial Institutions', 'Healthcare Enterprise'],
    targetedCVEs: ['CVE-2024-27198', 'CVE-2023-42793'],
    confidence: 'High',
    firstSeen: 'January 2024',
    summary: 'Financially motivated cartel targeting CI/CD controllers and internal software release pipelines for double-extortion ransomware attacks.',
    iocs: [
      '45.154.255.89 (Malicious Proxy)',
      'api.sync-telemetry-cdn.com (Exfiltration Staging Domain)'
    ]
  }
];

export const INITIAL_ENTERPRISE_RISK: EnterpriseRiskSummary = {
  overallRiskScore: 74,
  riskTrend: -3.8, // -3.8% risk reduction after recent mitigations
  activeAssetsCount: 16,
  highRiskAssetsCount: 5,
  criticalAnomaliesCount: 2,
  fairMetrics: {
    totalExpectedLossUSD: 8640000,
    annualizedLossExposureUSD: 3180000,
    singleLossExpectancyUSD: 4250000,
    valueAtRisk95PercentileUSD: 9400000,
    lossFrequencyPerYear: 0.74,
    lossMagnitudeMinUSD: 850000,
    lossMagnitudeMaxUSD: 14200000,
    lossMagnitudeProbableUSD: 4250000
  },
  industryBenchmarkScore: 58, // Peers average 58 (higher is worse risk)
  compliancePosturePercentage: 86.4
};
