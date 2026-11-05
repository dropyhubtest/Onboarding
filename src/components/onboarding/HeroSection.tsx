'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
    <>
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

          {/* Transparent Rate Card Banner */}
          <div className={styles.payoutHighlightBanner}>
            <div className={styles.payoutBadge}>OFFICIAL RATE CARD</div>
            <div className={styles.payoutHighlightText}>
              Earn <strong>₹35 to ₹100 per order</strong> &bull; Complete rate card &amp; slab incentives shown transparently on the right
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
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className={styles.secondaryBtn}
              title="Inspect complete rate card in high resolution"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>View Full Rate Card</span>
            </button>
          </div>

          <div className={styles.recruiterHint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>A recruiter will contact you directly within 24 hours of application</span>
          </div>
        </div>

        {/* Right Column: Full Uncropped Rate Card Showcase */}
        <div className={styles.visualColumn}>
          <div className={styles.rateCardContainer}>
            <div className={styles.rateCardHeader}>
              <div className={styles.rateCardTitleArea}>
                <span className={styles.rateCardEyebrow}>TRANSPARENT PAYOUTS</span>
                <h3 className={styles.rateCardTitle}>Official Partner Rate Card</h3>
              </div>
              <div className={styles.verifiedBadge}>
                <span className={styles.livePulseDot} />
                <span>2026 Verified Slabs</span>
              </div>
            </div>

            {/* Complete Full Image Without Any Cropping */}
            <div
              className={styles.imageCardWrapper}
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view rate card in high resolution"
            >
              <Image
                src="/assets/Hero_img.jpeg"
                alt="Official DropyHub Delivery Partner Rate Card & Payout Structure"
                width={1080}
                height={1350}
                unoptimized
                priority
                className={styles.fullRateCardImg}
              />
              <div className={styles.expandOverlayHint}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                <span>Click to Expand Rate Card</span>
              </div>
            </div>

            {/* Kotak 811 Required Notice */}
            <div className={styles.kotakNotice}>
              <div className={styles.kotakBadgeWrapper}>
                <span className={styles.kotakLogoBadge}>KOTAK 811</span>
                <span className={styles.kotakZeroPill}>ZERO BALANCE</span>
              </div>
              <div className={styles.kotakNoticeText}>
                <strong>Mandatory Kotak 811 Account:</strong> Compulsory zero-balance digital bank account required for automated daily &amp; weekly payout routing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Full Resolution Rate Card */}
      {isLightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setIsLightboxOpen(false)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={styles.kotakLogoBadge}>KOTAK 811 VERIFIED</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Official Delivery Partner Rate Card</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className={styles.lightboxCloseBtn}
                aria-label="Close rate card preview"
              >
                &times;
              </button>
            </div>
            <div className={styles.lightboxImageWrap}>
              <Image
                src="/assets/Hero_img.jpeg"
                alt="DropyHub Rate Card High Resolution"
                width={1080}
                height={1350}
                unoptimized
                className={styles.lightboxImg}
              />
            </div>
            <div className={styles.lightboxFooter}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                All delivery payouts are settled automatically to your Kotak 811 account.
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  scrollToForm();
                }}
                className={styles.primaryBtn}
                style={{ padding: '10px 20px', fontSize: 13.5 }}
              >
                Apply Now &amp; Register
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
