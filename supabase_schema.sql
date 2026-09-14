-- ====================================================================
-- AEGIS 3D CYBER RISK INTELLIGENCE - COMPLETE SUPABASE SQL SCHEMA
-- ====================================================================
-- Copy and paste this COMPLETE script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jdmgedjuphdtsqknlsrr/sql/new
-- Then click "Run" at the bottom right.
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-initializing (prevents 42P01 or column mismatch)
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.anomalies CASCADE;
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.nodes CASCADE;

-- --------------------------------------------------------------------
-- TABLE 1: INFRASTRUCTURE NODES
-- --------------------------------------------------------------------
CREATE TABLE public.nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hostname TEXT DEFAULT 'node-hostname',
    ip_address TEXT DEFAULT '10.0.0.1',
    category TEXT DEFAULT 'database',
    tier TEXT DEFAULT 'Application',
    risk_score INTEGER NOT NULL DEFAULT 15,
    compromise_probability INTEGER NOT NULL DEFAULT 5,
    business_criticality TEXT DEFAULT 'Tier 2',
    financial_exposure_usd NUMERIC DEFAULT 100000,
    status TEXT NOT NULL DEFAULT 'online',
    last_updated TEXT DEFAULT 'Just now',
    position_3d JSONB DEFAULT '[0,0,0]'::jsonb,
    connections JSONB DEFAULT '[]'::jsonb,
    vulnerabilities JSONB DEFAULT '[]'::jsonb,
    anomalies_count INTEGER DEFAULT 0,
    cpu_load INTEGER DEFAULT 25,
    network_throughput_mbps INTEGER DEFAULT 100,
    operating_system TEXT DEFAULT 'Linux Ubuntu 22.04 LTS',
    location TEXT DEFAULT 'AWS us-east-1',
    owner TEXT DEFAULT 'SecOps Infra Team',
    description TEXT DEFAULT 'Enterprise Infrastructure Node',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- TABLE 2: REMEDIATION RECOMMENDATIONS
-- --------------------------------------------------------------------
CREATE TABLE public.recommendations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_asset_id TEXT NOT NULL,
    target_asset_name TEXT DEFAULT 'Target Asset',
    priority TEXT NOT NULL DEFAULT 'P2 - High',
    effort_days INTEGER DEFAULT 2,
    estimated_cost_usd NUMERIC DEFAULT 5000,
    risk_reduction_score INTEGER NOT NULL DEFAULT 20,
    financial_risk_reduction_usd NUMERIC NOT NULL DEFAULT 100000,
    status TEXT NOT NULL DEFAULT 'pending',
    action_type TEXT DEFAULT 'Patching',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- TABLE 3: ANOMALY DETECTIONS
-- --------------------------------------------------------------------
CREATE TABLE public.anomalies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    asset_name TEXT DEFAULT 'Target Asset',
    severity TEXT NOT NULL DEFAULT 'medium',
    compromise_probability INTEGER DEFAULT 50,
    mitre_tactic TEXT DEFAULT 'Privilege Escalation',
    mitre_technique TEXT DEFAULT 'T1068',
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '[]'::jsonb,
    detected_at TEXT DEFAULT 'Just now',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- TABLE 4: USER PREFERENCES
-- --------------------------------------------------------------------
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'dark',
    quality TEXT DEFAULT 'auto',
    auto_rotate BOOLEAN DEFAULT true,
    show_labels BOOLEAN DEFAULT true,
    show_risk_overlay BOOLEAN DEFAULT true,
    show_data_flow BOOLEAN DEFAULT true,
    reduced_motion BOOLEAN DEFAULT false,
    simulated_live_updates BOOLEAN DEFAULT true,
    prefer_2d_map BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------------------
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- RLS POLICIES (Allow public/anonymous and authenticated access for app)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public nodes viewable by everyone" ON public.nodes;
CREATE POLICY "Public nodes viewable by everyone" ON public.nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public nodes manageable by everyone" ON public.nodes;
CREATE POLICY "Public nodes manageable by everyone" ON public.nodes FOR ALL USING (true);

DROP POLICY IF EXISTS "Public recommendations manageable by everyone" ON public.recommendations;
CREATE POLICY "Public recommendations manageable by everyone" ON public.recommendations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public anomalies manageable by everyone" ON public.anomalies;
CREATE POLICY "Public anomalies manageable by everyone" ON public.anomalies FOR ALL USING (true);

DROP POLICY IF EXISTS "Public user_preferences manageable by everyone" ON public.user_preferences;
CREATE POLICY "Public user_preferences manageable by everyone" ON public.user_preferences FOR ALL USING (true);

-- --------------------------------------------------------------------
-- SEED DEFAULT DEMO DATA
-- --------------------------------------------------------------------
INSERT INTO public.nodes (id, name, hostname, ip_address, category, tier, risk_score, compromise_probability, business_criticality, financial_exposure_usd, status, last_updated, position_3d, connections, vulnerabilities, anomalies_count, cpu_load, network_throughput_mbps, operating_system, location, owner, description)
VALUES 
    ('node-db-primary', 'Database-Primary', 'db-primary.secops.local', '10.0.4.12', 'database', 'Core Data', 45, 18, 'Tier 1', 2400000, 'online', 'Just now', '[-4, 0, -2]'::jsonb, '["node-k8s-cluster-01", "node-api-gateway"]'::jsonb, '[{"id":"v-1","cve":"CVE-2023-38606","title":"PostgreSQL Remote Code Execution","severity":"high","cvss":8.8,"exploitAvailable":true,"attackVector":"Network","description":"RCE in query parsing","remediation":"Upgrade to v15.4"}]'::jsonb, 1, 68, 450, 'Ubuntu 22.04 LTS', 'AWS us-east-1a (VPC-SecOps)', 'Database Admin Team', 'Primary Enterprise PostgreSQL Database Node'),
    ('node-k8s-cluster-01', 'K8s-Prod-Worker-01', 'k8s-worker-01.prod.internal', '10.0.12.84', 'cloud-cluster', 'Application', 88, 74, 'Tier 1', 5800000, 'degraded', '1 min ago', '[0, 0.5, 0]'::jsonb, '["node-api-gateway", "node-storage-s3"]'::jsonb, '[{"id":"v-2","cve":"CVE-2024-21626","title":"RunC Container Escape","severity":"critical","cvss":9.8,"exploitAvailable":true,"attackVector":"Local","description":"Container escape via file descriptor leak","remediation":"Patch runc to v1.1.12"}]'::jsonb, 2, 94, 1280, 'Debian 12 (EKS)', 'AWS us-east-1b (EKS-Prod)', 'DevOps K8s Cluster Ops', 'Production Kubernetes Worker Node'),
    ('node-api-gateway', 'API-Gateway-Edge', 'api-edge.mycompany.com', '192.168.1.1', 'gateway-firewall', 'Perimeter', 28, 9, 'Tier 1', 850000, 'online', 'Just now', '[4, 0, -2]'::jsonb, '["node-k8s-cluster-01", "node-auth-service"]'::jsonb, '[]'::jsonb, 0, 42, 3400, 'Alpine Linux / Envoy Proxy', 'Cloudflare Edge POP', 'Edge Network Infra', 'Public Facing API Gateway & WAF Ingress'),
    ('node-auth-service', 'IAM-Auth-Vault', 'auth-vault.secops.local', '10.0.2.15', 'app-service', 'Ingress', 62, 31, 'Tier 1', 4200000, 'online', 'Just now', '[-2, 0, 3]'::jsonb, '["node-api-gateway"]'::jsonb, '[{"id":"v-3","cve":"CVE-2023-44487","title":"HTTP/2 Rapid Reset DDoS","severity":"medium","cvss":7.5,"exploitAvailable":true,"attackVector":"Network","description":"DoS attack using HTTP/2 stream cancellation","remediation":"Update reverse proxy"}]'::jsonb, 1, 55, 890, 'Red Hat Enterprise Linux 9', 'AWS us-east-1a (VPC-SecOps)', 'IAM Security Core', 'Central Authentication & Key Vault Service'),
    ('node-storage-s3', 'Customer-Data-Lake', 's3-datalake-prod.internal', '10.0.98.4', 'database', 'Core Data', 94, 86, 'Tier 1', 12500000, 'degraded', 'Just now', '[2, 0, 3]'::jsonb, '["node-k8s-cluster-01"]'::jsonb, '[{"id":"v-4","cve":"MISCONFIG-S3-09","title":"Public S3 Bucket ACL Misconfiguration","severity":"critical","cvss":9.1,"exploitAvailable":true,"attackVector":"Network","description":"Bucket policies allow unauthenticated s3:GetObject","remediation":"Enable Block Public Access"}]'::jsonb, 1, 15, 120, 'AWS S3 Storage Engine', 'AWS S3 us-east-1', 'Data Architecture Team', 'Customer Analytics & PII Data Lake'),
    ('node-workstation-secops', 'SecOps-Analyst-Terminal', 'secops-term-01.hq.internal', '10.0.100.42', 'endpoint-workstation', 'Management', 15, 4, 'Tier 3', 150000, 'online', 'Just now', '[0, 0, 5]'::jsonb, '["node-auth-service"]'::jsonb, '[]'::jsonb, 0, 22, 45, 'Windows 11 Enterprise / EDR', 'HQ Physical Subnet', 'SOC Operations Lead', 'SecOps Analyst Dedicated Terminal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.recommendations (id, title, description, target_asset_id, target_asset_name, priority, effort_days, estimated_cost_usd, risk_reduction_score, financial_risk_reduction_usd, status, action_type)
VALUES
    ('rec-01', 'Patch RunC Container Escape Vulnerability', 'Apply immediate patch for CVE-2024-21626 on K8s Worker Node 01 to prevent host takeover.', 'node-k8s-cluster-01', 'K8s-Prod-Worker-01', 'P1 - Critical', 1, 2000, 42, 3800000, 'pending', 'Patching'),
    ('rec-02', 'Enforce Private Access & KMS Encryption on Data Lake', 'Restrict S3 bucket policy to internal VPC endpoint and enable SSE-KMS encryption.', 'node-storage-s3', 'Customer-Data-Lake', 'P1 - Critical', 1, 1500, 55, 9200000, 'pending', 'Egress Lockdown'),
    ('rec-03', 'Rotate Auth Vault JWT Signing Certificates', 'Initiate emergency key rotation for IAM Auth Vault and update public key distribution.', 'node-auth-service', 'IAM-Auth-Vault', 'P2 - High', 2, 4000, 28, 1800000, 'pending', 'Credential Rotation')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.anomalies (id, title, asset_id, asset_name, severity, compromise_probability, mitre_tactic, mitre_technique, description, evidence, detected_at, status)
VALUES
    ('anom-01', 'Unauthorized Container Namespace Escalation', 'node-k8s-cluster-01', 'K8s-Prod-Worker-01', 'critical', 74, 'Privilege Escalation', 'T1068', 'Process attempted host filesystem escape via /proc/self/fd file descriptor handles.', '["Unexpected syscall: execveat", "UID 0 elevation detected"]'::jsonb, '10 mins ago', 'active'),
    ('anom-02', 'Bulk Unauthenticated Object Retrieval', 'node-storage-s3', 'Customer-Data-Lake', 'critical', 86, 'Exfiltration', 'T1537', 'Abnormal outbound egress volume (45 GB/min) matching PII data lake pattern from external IP 185.220.101.4.', '["Egress spike: 45GB/min", "ASN: TOR-EXIT-NODE-88"]'::jsonb, '18 mins ago', 'active'),
    ('anom-03', 'Repeated Failed Auth Token Verification', 'node-auth-service', 'IAM-Auth-Vault', 'medium', 31, 'Credential Access', 'T1110', '1,420 token verification failures detected within 60 seconds from distributed ASN.', '["1420 failed auth tokens/min", "Distributed 34 ASNs"]'::jsonb, '45 mins ago', 'active')
ON CONFLICT (id) DO NOTHING;
