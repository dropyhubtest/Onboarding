'use client';

import React from 'react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const scrollToForm = () => {
    const el = document.getElementById('apply-now');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const firstInput = el.querySelector('input') as HTMLInputElement | null;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 600);
      }
    }
  };

  return (
    <section className={styles.hero} aria-label="Delivery Partner Opportunity Introduction">
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Official Logistics Recruitment</span>
        </div>

        <h1 className={styles.heading}>
          Your Next Opportunity <br />
          <span className={styles.headingAccent}>Starts Here.</span>
        </h1>

        <p className={styles.lead}>
          Join our delivery partner network and choose the delivery opportunities that work best for your schedule, preferences and goals.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Flexible Opportunities</div>
              <div className={styles.cardText}>Full-time, part-time, or weekend peak delivery shifts.</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Multiple Categories</div>
              <div className={styles.cardText}>Food, quick-commerce, retail and pharma parcel tracks.</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Structured Onboarding</div>
              <div className={styles.cardText}>Direct phone contact by our recruiter within 24 hours.</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Dedicated Support</div>
              <div className={styles.cardText}>Localized partner hub teams, vehicle assistance &amp; daily payouts.</div>
            </div>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <button type="button" onClick={scrollToForm} className={styles.primaryBtn}>
            <span>Become a Delivery Partner</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>
          <span className={styles.recruiterHint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            A recruiter will contact you directly within 24 hours
          </span>
        </div>
      </div>

      <div>
        <div className={styles.highlightCard}>
          <div className={styles.highlightHeader}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                PARTNER NETWORK
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Earnings &amp; Settlements
              </div>
            </div>
            <span className={styles.hiringPill}>Actively Hiring</span>
          </div>

          <div className={styles.earningsBox}>
            <div className={styles.earningsLabel}>Per Order Payout &amp; Estimated Earnings</div>
            <div className={styles.earningsValue}>
              ₹35 – ₹100
              <span className={styles.earningsUnit}>/ order</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: '#047857' }}>
              ₹25,000 – ₹45,000+ monthly potential + daily incentives
            </div>
          </div>

          <div className={styles.benefitList}>
            <div className={styles.benefitItem}>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span><strong>₹35 to ₹100 / order</strong> base + distance &amp; wait time pay</span>
            </div>
            <div className={styles.benefitItem}>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Rain/weather surges &amp; weekly milestone incentives</span>
            </div>
            <div className={styles.benefitItem}>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Direct bank deposits &amp; accidental insurance coverage</span>
            </div>
          </div>

          <div className={styles.kotakNotice}>
            <span className={styles.kotakLogoBadge}>KOTAK MAHINDRA</span>
            <span className={styles.kotakNoticeText}>
              Mandatory Kotak Mahindra Bank account required for digital onboarding &amp; instant payroll routing.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
