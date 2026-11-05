'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isValidIndianMobile } from '@/lib/validation';

function StatusContent() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const urlRef = searchParams.get('reference');
    if (urlRef) {
      setReference(urlRef);
    }
  }, [searchParams]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!reference.trim()) {
      setError('Please enter your Application Reference ID.');
      return;
    }

    if (!mobile.trim() || !isValidIndianMobile(mobile)) {
      setError('Please enter your 10-digit registered Indian mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/applications/status?reference=${encodeURIComponent(reference.trim())}&mobile=${encodeURIComponent(
          mobile.trim()
        )}`
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'No matching application found.');
      }

      setResult(json.application);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve application status.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return '#10b981';
      case 'Under Review':
      case 'Completion Awaited':
        return '#3b82f6';
      case 'Pending Review':
      case 'Pending':
      case 'Verification Required':
        return '#f59e0b';
      case 'Rejected':
      case 'Failed':
        return '#ef4444';
      default:
        return '#a78bfa';
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '60px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#ff4d94', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Applicant Self-Service Portal
        </span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, color: '#ffffff', marginTop: 8 }}>
          Track Your Application Status
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginTop: 8 }}>
          Enter your Application Reference ID and registered mobile number to check the real-time status of your onboarding and Kotak banking verification.
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 36,
          boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
          marginBottom: 32,
        }}
      >
        <form onSubmit={handleLookup} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Application Reference ID
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="e.g. DH-DP-20261105-9A4B"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Registered Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px 28px',
              background: 'var(--gradient-cta)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 'var(--radius-sm)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              height: 44,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: 20,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: '#fca5a5',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: 36,
            boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate Name</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>{result.fullName}</div>
            </div>
            <div>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Reference ID: </span>
              <strong style={{ color: '#ff4d94', fontSize: 15 }}>{result.reference}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Application Review Status
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(result.applicationStatus) }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: getStatusColor(result.applicationStatus) }}>
                  {result.applicationStatus}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Kotak 811 Banking Status
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(result.kotakStatus) }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: getStatusColor(result.kotakStatus) }}>
                  {result.kotakStatus}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Submission Timestamp
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#ffffff', marginTop: 8 }}>
                {new Date(result.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          {/* Kotak Pending Action Alert if not completed */}
          {result.kotakStatus !== 'Completed' && result.kotakUrl && (
            <div
              style={{
                background: 'rgba(218, 37, 28, 0.1)',
                border: '1px solid rgba(218, 37, 28, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                  Kotak Bank Account Creation Pending
                </div>
                <div style={{ fontSize: 12.5, color: '#e2e8f0' }}>
                  Please complete your Kotak 811 zero-balance account opening to finalize onboarding.
                </div>
              </div>

              <a
                href={result.kotakUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#da251c',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Resume Kotak Registration</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#fff' }}>Loading status tracker...</div>}>
      <StatusContent />
    </Suspense>
  );
}
