# 🛡️ Aegis 3D — Continuous Cyber Risk Intelligence Platform

> **Next-Generation 3D Spatial Cyber Risk Management, Autonomous AI Security Agent, Adversary Attack Path Simulation, and Real-Time Device Telemetry Orchestration.**

Repository: [https://github.com/marichamyramprasanna-pixel/ramsih](https://github.com/marichamyramprasanna-pixel/ramsih)

---

## 🌟 Executive Overview

**Aegis 3D** is a continuous cyber risk intelligence platform designed for Enterprise Security Operations (SecOps), Chief Information Security Officers (CISOs), and Risk Engineers. Combining real-time 3D spatial WebGL rendering, Factor Analysis of Information Risk (FAIR) financial modeling, autonomous AI security agents, and interactive kill-chain containment, Aegis 3D transforms complex multi-cloud and on-premises infrastructure data into actionable defensive intelligence.

---

## ✨ Key Features & Capabilities

### 1. 🌐 Interactive 3D Spatial Topology Engine
- **3D WebGL Canvas**: High-efficiency rendering powered by Three.js with shared geometry pooling, PBR materials, and dynamic bezier curve data-packet flows.
- **Full 360° Omnidirectional Orbit**: Continuous 360-degree horizontal rotation and zenith-to-nadir vertical elevation angles.
- **Shortest-Arc Vantage Snapping**: Instant transition presets for North ($0^\circ$), East ($90^\circ$), South ($180^\circ$), West ($270^\circ$), Birds-Eye Zenith, and Underbelly Nadir views.
- **Accessible 2D Topology Fallback**: Fully compliant WCAG 2.1 AA SVG interactive topological network map for low-spec hardware and screen readers.

### 2. 🤖 Autonomous Aegis AI Security Agent
- **Floating In-App AI Assistant**: Always-available AI agent drawer (`AegisAiAgentWidget`) with glowing launcher and reasoning execution logs.
- **Autonomous Site Risk Assessment**: Scans all 16+ monitored devices, active CVEs, and blast radii in real time to generate executive risk diagnostic reports.
- **Autonomous Remediation & Action Execution**:
  - **Auto-Remediate All Risks**: Patches vulnerabilities on high-risk devices in one click, dropping overall enterprise risk scores to healthy ($\le 18$).
  - **Isolate & Quarantine**: Quarantines compromised Bastion hosts, VPN gateways, or app servers.
  - **Provision Monitored Devices**: Automatically provisions zero-trust web security gateways directly into the 3D spatial canvas.

### 3. 🎯 Attack Path Analysis & Kill-Chain Isolation
- **Adversary Attack Path Simulator**: Map lateral movement paths for threat actors (*UNC-3882 Volt Shadow*, *Scattered Viper*, *Lazarus Group*).
- **MITRE ATT&CK Mapping**: Hop-by-hop breakdown of entry vectors, privilege escalation, lateral transport protocols (`SSH`, `mTLS`, `gRPC`), and CVEs ($\text{CVE-2024-3094}$, $\text{CVE-2024-21762}$).
- **Emergency Kill-Chain Severance**: One-click **"Sever Attack Vector / Break Kill-Chain"** button to isolate ingress nodes and revoke compromised credentials before core SQL vaults are breached.

### 4. 💻 Device Risk Prioritization & Device Manager
- **Risk Score Prioritization**: Devices are strictly ordered by **Risk Score (Highest First: #1, #2, #3...)** with color-coded severity badges.
- **Inline Step-by-Step Solutions**: Exact security problems and **step-by-step remediation plans** displayed right next to each device card, accompanied by a direct **"Solve Problem & Apply Patch"** button.
- **Separate Device Telemetry Monitor**: Track real-time CPU utilization %, throughput Mbps, operating system details, and hardware status (`online`, `degraded`, `quarantined`).
- **Device Lifecycle Operations**: Interactive **`+ Add New Device`** modal form and **Delete Device** action with confirmation prompts.

### 5. 💰 FAIR Financial Loss Quantification
- **FAIR Risk Modeling**: Quantifies risk in monetary terms (Annualized Loss Exposure - ALE, Single Loss Expectancy - SLE, and 95% Value at Risk - VaR).
- **Monte Carlo Simulation**: Interactive sensitivity sliders adjusting Threat Event Frequency (TEF) and Vulnerability (VULN) probabilities.

### 6. 📄 Compliance Audit & Executive Reports
- **Multi-Standard Compliance Generator**: Generates exportable executive briefings and compliance audit reports mapped to **SOC 2 Type II**, **ISO 27001**, and **NIST CSF 2.0**.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18, TypeScript, Vite
- **3D Spatial Graphics**: Three.js, WebGL
- **Styling & UI**: Tailwind CSS v4, Lucide Icons
- **State Management**: Reactive Rx/Pub-Sub Architecture with LocalStorage Persistence
- **Package Manager**: npm / bun

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0 or higher)
- npm or bun

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/marichamyramprasanna-pixel/ramsih.git
   cd ramsih
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📜 Available NPM Scripts

- `npm run dev` — Starts the local Vite development server on port 3000.
- `npm run build` — Bundles the application for production deployment in `dist/`.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.