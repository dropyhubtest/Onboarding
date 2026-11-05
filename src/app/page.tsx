import React from 'react';
import HeroSection from '@/components/onboarding/HeroSection';
import PartnerLogoTicker from '@/components/onboarding/PartnerLogoTicker';
import EarningsRateCard from '@/components/onboarding/EarningsRateCard';
import DeliveryCategoriesShowcase from '@/components/onboarding/DeliveryCategoriesShowcase';
import RegistrationWizard from '@/components/onboarding/RegistrationWizard';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Partner Brand Logos Grid */}
      <PartnerLogoTicker />

      {/* Per-Order Earnings & Surges Rate Card */}
      <EarningsRateCard />

      {/* Delivery Categories */}
      <DeliveryCategoriesShowcase />

      {/* Process Section */}
      <section style={{ padding: 'clamp(28px, 5vw, 48px) clamp(14px, 4vw, 32px)', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Structured 4-Step Process
          </span>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.1rem)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>
            How Your Onboarding Journey Works
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>
            Direct, transparent process from application submission to first delivery.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 22, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary)', marginBottom: 8 }}>STEP 01</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Submit Profile &amp; ID</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enter your work preferences, vehicle availability, and securely upload your Aadhaar and PAN documents.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--kotak-border)', borderRadius: 'var(--radius-md)', padding: 22, boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--kotak-primary)', marginBottom: 8 }}>STEP 02 (MANDATORY)</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Open Kotak Mahindra Bank Account</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Complete the mandatory Kotak Mahindra Bank account opening required for daily earnings &amp; payroll disbursements.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 22, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-blue)', marginBottom: 8 }}>STEP 03</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Recruiter Phone Contact</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              A DropyHub recruiter calls your registered mobile number within 24 hours to schedule your onboarding induction.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 22, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--status-success)', marginBottom: 8 }}>STEP 04</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Hub Induction &amp; Delivery</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Collect your rider kit and app activation at your assigned local logistics hub and start delivering.
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form Wizard */}
      <RegistrationWizard />
    </div>
  );
}
