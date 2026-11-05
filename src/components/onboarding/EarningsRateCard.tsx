'use client';

import React from 'react';
import styles from './EarningsRateCard.module.css';

export default function EarningsRateCard() {
  return (
    <section className={styles.section} aria-label="Partner Earnings and Rate Card">
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Transparent Payout Model</span>
        </div>

        <h2 className={styles.title}>
          Earn <span className={styles.highlightAmount}>₹35 to ₹100</span> Per Order
        </h2>

        <p className={styles.subtitle}>
          Competitive trip payouts with zero commission deductions. Earn high base order fees, dynamic peak-hour multipliers, and performance milestone bonuses deposited directly into your Kotak Mahindra Bank account.
        </p>
      </div>

      {/* Primary Rate Cards */}
      <div className={styles.cardsGrid}>
        {/* CARD 1: Base Order Pay */}
        <div className={styles.rateCard}>
          <div className={styles.cardTop}>
            <div className={styles.iconBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className={styles.rateType}>Per Completed Delivery</div>
              <h3 className={styles.rateHeadline}>Standard Trip Rate</h3>
            </div>
          </div>

          <div className={styles.payoutDisplay}>
            ₹35 – ₹100
            <span className={styles.payoutUnit}>/ order</span>
          </div>

          <p className={styles.rateDesc}>
            Base distance payout calculated transparently per delivery drop. Short-range quick commerce drops earn instant fast turnarounds, while bulk parcels earn higher packet rates.
          </p>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>₹35 base rate for 0 – 3 km local delivery</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>₹55 – ₹75 for 3 – 6 km mid-range deliveries</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>Up to ₹100+ for express logistics &amp; multi-bag drops</span>
            </li>
          </ul>
        </div>

        {/* CARD 2: Peak Surge Multiplier */}
        <div className={`${styles.rateCard} ${styles.rateCardFeatured}`}>
          <div className={styles.cardTop}>
            <div className={styles.iconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div className={styles.rateType}>High-Demand Hours</div>
              <h3 className={styles.rateHeadline}>Peak Surge Multipliers</h3>
            </div>
          </div>

          <div className={styles.payoutDisplay}>
            1.3x – 1.8x
            <span className={styles.payoutUnit}>surge boost</span>
          </div>

          <p className={styles.rateDesc}>
            Automated surge multipliers applied directly on top of your order fee during lunch rushes, weekend evenings, and holiday shopping festivals.
          </p>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>Lunch Surge (12:00 PM – 3:30 PM): +₹15 to +₹30</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>Dinner Peak (7:00 PM – 11:30 PM): 1.5x Multiplier</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>IPL, Cricket &amp; Festive Night Surges</span>
            </li>
          </ul>
        </div>

        {/* CARD 3: Weekly Milestone Incentives */}
        <div className={styles.rateCard}>
          <div className={styles.cardTop}>
            <div className={styles.iconBox} style={{ background: '#fef3c7', color: '#d97706' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div>
              <div className={styles.rateType}>Weekly Bonus</div>
              <h3 className={styles.rateHeadline}>Milestone Incentives</h3>
            </div>
          </div>

          <div className={styles.payoutDisplay}>
            +₹3,500
            <span className={styles.payoutUnit}>extra weekly</span>
          </div>

          <p className={styles.rateDesc}>
            Consistent deliveries unlock tiered bonus milestones. Hit your target delivery counts every week to earn lucrative lump-sum performance payouts.
          </p>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>50 completed trips/week = +₹800 bonus</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>90 completed trips/week = +₹1,800 bonus</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <span>130+ completed trips/week = +₹3,500 bonus</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Surges & Guarantee Banner */}
      <div className={styles.surgesRow}>
        <div className={styles.surgeCard}>
          <div className={styles.surgeIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
              <line x1="8" y1="19" x2="8" y2="21" />
              <line x1="8" y1="13" x2="8" y2="15" />
              <line x1="16" y1="19" x2="16" y2="21" />
              <line x1="16" y1="13" x2="16" y2="15" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="12" y1="15" x2="12" y2="17" />
            </svg>
          </div>
          <div>
            <h4 className={styles.surgeTitle}>Rain &amp; Weather Protection Surge (+₹25 – +₹40/order)</h4>
            <p className={styles.surgeDesc}>
              Inclement weather and heavy rain automatically trigger danger/weather surcharge credits directly added to every order drop.
            </p>
          </div>
        </div>

        <div className={styles.surgeCard}>
          <div className={styles.surgeIcon} style={{ color: '#16a34a' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h4 className={styles.surgeTitle}>Daily Minimum Guarantee Protection (₹800 – ₹1,400/day)</h4>
            <p className={styles.surgeDesc}>
              Active logged-in delivery riders with accepted order readiness are guaranteed an assured minimum daily floor payout, protecting your time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
