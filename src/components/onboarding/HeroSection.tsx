'use client';

import React from 'react';
import Image from 'next/image';
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
      {/* Left Column: Value Prop, Features, CTA */}
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Official Logistics Recruitment Network</span>
        </div>

        <h1 className={styles.heading}>
          Your Next Opportunity <br />
          <span className={styles.headingAccent}>Starts Here.</span>
        </h1>

        <p className={styles.lead}>
          Join our delivery partner network and choose the delivery opportunities that work best for your schedule, preferences, and earning goals.
        </p>

        {/* Payout Banner */}
        <div className={styles.payoutHighlightBanner}>
          <div className={styles.payoutBadge}>EARNINGS HIGHLIGHT</div>
          <div className={styles.payoutHighlightText}>
            Earn <strong>₹35 to ₹100 per order</strong> &bull; Surge pay &amp; daily/weekly milestone incentives included
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Flexible Shifts</div>
              <div className={styles.cardText}>Full-time, part-time, or peak weekend delivery slots.</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Multiple Categories</div>
              <div className={styles.cardText}>Food, quick-commerce, retail, and pharmaceutical packages.</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Fast-Track Onboarding</div>
              <div className={styles.cardText}>A dedicated recruiter will call you directly within 24 hours.</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div className={styles.cardTitle}>Dedicated Support</div>
              <div className={styles.cardText}>Localized partner hubs, vehicle guidance &amp; direct bank deposits.</div>
            </div>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <button type="button" onClick={scrollToForm} className={styles.primaryBtn}>
            <span>Become a Delivery Partner</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>
          <span className={styles.recruiterHint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Recruiter contacts you within 24 hrs
          </span>
        </div>
      </div>

      {/* Right Column: Hero Visual & Kotak 811 Payroll Card */}
      <div className={styles.visualColumn}>
        <div className={styles.heroImageCard}>
          <div className={styles.imageWrapper}>
            <Image
              src="/assets/Hero_img.jpeg"
              alt="DropyHub Delivery Partner at work"
              width={640}
              height={420}
              unoptimized
              priority
              className={styles.heroImg}
            />
            <div className={styles.floatingEarningBadge}>
              <span className={styles.floatingEarningNum}>₹35 – ₹100</span>
              <span className={styles.floatingEarningSub}>per completed order</span>
            </div>
            <div className={styles.floatingKotakBadge}>
              <span className={styles.floatingKotakDot} />
              <span>Kotak 811 Banking Partner</span>
            </div>
          </div>

          <div className={styles.highlightCardBottom}>
            <div className={styles.earningsBox}>
              <div className={styles.earningsTopRow}>
                <div>
                  <div className={styles.earningsLabel}>Estimated Monthly Earnings</div>
                  <div className={styles.earningsValue}>
                    ₹25,000 – ₹45,000+
                    <span className={styles.earningsUnit}>/ month</span>
                  </div>
                </div>
                <span className={styles.hiringPill}>Actively Hiring</span>
              </div>
              <div className={styles.earningsPerks}>
                <span>&bull; ₹35 – ₹100 base payout / drop</span>
                <span>&bull; Peak surge &amp; fuel incentives</span>
                <span>&bull; Direct weekly payroll deposits</span>
              </div>
            </div>

            {/* Kotak 811 Compulsory Banking Notice */}
            <div className={styles.kotakNotice}>
              <div className={styles.kotakBadgeWrapper}>
                <span className={styles.kotakLogoBadge}>KOTAK 811</span>
                <span className={styles.kotakZeroPill}>ZERO BALANCE</span>
              </div>
              <div className={styles.kotakNoticeText}>
                <strong>Mandatory Kotak 811 Account:</strong> A zero-balance Kotak 811 digital savings account is required for digital payroll payouts and onboarding verification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
