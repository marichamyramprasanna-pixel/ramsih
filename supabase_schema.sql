-- ==========================================================
-- AEGIS 3D CYBER RISK INTELLIGENCE - SUPABASE DATABASE SCHEMA
-- ==========================================================
-- Run this SQL blueprint in your Supabase SQL Editor to set up
-- tables, indexes, row-level security (RLS), and default seed data.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 1. INFRASTRUCTURE NODES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    ip TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'online',
    risk_score INTEGER NOT NULL DEFAULT 15,
    compromise_probability INTEGER NOT NULL DEFAULT 5,
    vulnerabilities JSONB DEFAULT '[]'::jsonb,
    cpu_load INTEGER DEFAULT 25,
    memory_load INTEGER DEFAULT 30,
    network_throughput_mbps INTEGER DEFAULT 100,
    financial_exposure_usd NUMERIC DEFAULT 100000,
    location TEXT DEFAULT 'Cloud US-East',
    compliance_status TEXT DEFAULT 'compliant',
    last_updated TEXT DEFAULT 'Just now',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 2. REMEDIATION RECOMMENDATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recommendations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_asset_id TEXT NOT NULL,
    risk_reduction_score INTEGER NOT NULL,
    financial_risk_reduction_usd NUMERIC NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    remediation_steps JSONB DEFAULT '[]'::jsonb,
    cve_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3. ANOMALY DETECTIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anomalies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    attack_vector TEXT,
    mitigation_suggested TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 4. USER PREFERENCES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
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

-- ----------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow public read access to demo nodes, recommendations & anomalies
CREATE POLICY "Public nodes are viewable by everyone" ON public.nodes
    FOR SELECT USING (true);

CREATE POLICY "Public nodes insertable by authenticated or anon users" ON public.nodes
    FOR ALL USING (true);

CREATE POLICY "Public recommendations viewable by everyone" ON public.recommendations
    FOR ALL USING (true);

CREATE POLICY "Public anomalies viewable by everyone" ON public.anomalies
    FOR ALL USING (true);

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- ----------------------------------------------------------
-- 6. DEFAULT SEED DATA INSERTION
-- ----------------------------------------------------------
INSERT INTO public.nodes (id, name, type, ip, status, risk_score, compromise_probability, vulnerabilities, cpu_load, memory_load, network_throughput_mbps, financial_exposure_usd, location, compliance_status)
VALUES 
    ('node-db-primary', 'Database-Primary', 'database', '10.0.4.12', 'online', 45, 18, '["CVE-2023-38606", "Outdated TLS Cipher Suite"]'::jsonb, 68, 82, 450, 2400000, 'AWS us-east-1a (VPC-SecOps)', 'compliant'),
    ('node-k8s-cluster-01', 'K8s-Prod-Worker-01', 'k8s-cluster', '10.0.12.84', 'degraded', 88, 74, '["CVE-2024-21626 (Container Escape)", "Unpatched Linux Kernel 5.15", "Overprivileged SA"]'::jsonb, 94, 88, 1280, 5800000, 'AWS us-east-1b (EKS-Prod)', 'non-compliant'),
    ('node-api-gateway', 'API-Gateway-Edge', 'gateway', '192.168.1.1', 'online', 28, 9, '["Minor HTTP Header Leak"]'::jsonb, 42, 38, 3400, 850000, 'Cloudflare Edge POP', 'compliant'),
    ('node-auth-service', 'IAM-Auth-Vault', 'auth-server', '10.0.2.15', 'online', 62, 31, '["JWT Key Rotation Expiry", "Brute Force Warning"]'::jsonb, 55, 60, 890, 4200000, 'AWS us-east-1a (VPC-SecOps)', 'needs-audit'),
    ('node-storage-s3', 'Customer-Data-Lake', 'storage', '10.0.98.4', 'degraded', 94, 86, '["Public S3 Bucket ACL misconfiguration", "Exposed PII", "No Server-Side Encryption"]'::jsonb, 15, 22, 120, 12500000, 'AWS S3 us-east-1', 'non-compliant'),
    ('node-workstation-secops', 'SecOps-Analyst-Terminal', 'workstation', '10.0.100.42', 'online', 15, 4, '[]'::jsonb, 22, 45, 45, 150000, 'HQ Physical Subnet', 'compliant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.recommendations (id, title, description, target_asset_id, risk_reduction_score, financial_risk_reduction_usd, priority, status, cve_id)
VALUES
    ('rec-01', 'Patch RunC Container Escape Vulnerability', 'Apply immediate patch for CVE-2024-21626 on K8s Worker Node 01 to prevent host takeover.', 'node-k8s-cluster-01', 42, 3800000, 'critical', 'pending', 'CVE-2024-21626'),
    ('rec-02', 'Enforce Private Access & KMS Encryption on Data Lake', 'Restrict S3 bucket policy to internal VPC endpoint and enable SSE-KMS encryption.', 'node-storage-s3', 55, 9200000, 'critical', 'pending', 'MISCONFIG-S3-09'),
    ('rec-03', 'Rotate Auth Vault JWT Signing Certificates', 'Initiate emergency key rotation for IAM Auth Vault and update public key distribution.', 'node-auth-service', 28, 1800000, 'high', 'pending', 'SEC-IAM-2024-02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.anomalies (id, title, asset_id, severity, type, description, timestamp, status, attack_vector)
VALUES
    ('anom-01', 'Unauthorized Container Namespace Escalation', 'node-k8s-cluster-01', 'critical', 'privilege-escalation', 'Process attempted host filesystem escape via /proc/self/fd file descriptor handles.', '10 mins ago', 'active', 'Kubernetes Escape'),
    ('anom-02', 'Bulk Unauthenticated Object Retrieval', 'node-storage-s3', 'critical', 'data-exfiltration', 'Abnormal outbound egress volume (45 GB/min) matching PII data lake pattern from external IP 185.220.101.4.', '18 mins ago', 'active', 'Cloud Misconfiguration'),
    ('anom-03', 'Repeated Failed Auth Token Verification', 'node-auth-service', 'warning', 'auth-anomaly', '1,420 token verification failures detected within 60 seconds from distributed ASN.', '45 mins ago', 'active', 'Credential Stuffing')
ON CONFLICT (id) DO NOTHING;
