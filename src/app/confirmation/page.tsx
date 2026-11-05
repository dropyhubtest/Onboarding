'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const ref = searchParams.get('ref') || 'DH-DP-SAMPLE';
  const submittedDate = searchParams.get('date')
    ? new Date(searchParams.get('date')!).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const kotakUrl = searchParams.get('kotakUrl') || 'https://bit.ly/4i35J6m';

  const copyRef = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKotakRedirect = () => {
    if (kotakUrl) {
      window.open(kotakUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ maxWidth: 740, margin: '48px auto 80px', padding: '0 20px' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--status-success-bg)',
              border: '2px solid var(--status-success-border)',
              color: 'var(--status-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            ✓
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.1rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Application Successfully Submitted!
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            Thank you for registering with DropyHub. Your application has been securely recorded and queued for immediate onboarding review.
          </p>
        </div>

        {/* Recruiter Contact Assurance Banner */}
        <div
          style={{
            background: 'var(--brand-blue-bg)',
            border: '1px solid var(--brand-blue-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div style={{ color: 'var(--brand-blue)', marginTop: 2, flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>
              A Recruiter Will Call You Within 24 Hours
            </div>
            <p style={{ fontSize: 13, color: '#1e3a8a', lineHeight: 1.55 }}>
              You do not need to follow up or wait in long queues. Our onboarding coordinator will call you directly on your registered mobile number within 24 hours to verify your details, answer any questions, and assign you to your nearest delivery hub.
            </p>
          </div>
        </div>

        {/* Reference Number Card */}
        <div
          style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Application Reference ID
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                {ref}
              </span>
              <button
                type="button"
                onClick={copyRef}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#ffffff',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Submitted At
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              {submittedDate}
            </div>
          </div>
        </div>

        {/* Mandatory Kotak Action Box */}
        <div
          style={{
            background: '#ffffff',
            border: '2px solid var(--kotak-border)',
            borderRadius: 'var(--radius-md)',
            padding: 24,
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span
              style={{
                background: 'var(--kotak-primary)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              MANDATORY
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              Open Your Kotak 811 Zero-Balance Digital Account
            </h3>
          </div>

          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 18 }}>
            To complete your induction and receive daily delivery payouts, you must complete your Kotak 811 account opening. Click the button below to proceed to the official Kotak 811 verification portal.
          </p>

          <div>
            <a
              href={kotakUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--kotak-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span>Proceed to Kotak 811 Account Opening</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textDecoration: 'underline',
            }}
          >
            Return to DropyHub Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
