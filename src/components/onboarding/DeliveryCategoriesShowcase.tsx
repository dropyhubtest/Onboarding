'use client';

import React from 'react';
import Image from 'next/image';
import styles from './DeliveryCategoriesShowcase.module.css';

export default function DeliveryCategoriesShowcase() {
  return (
    <section id="categories" className={styles.section} aria-label="Available Delivery Opportunities">
      <div className={styles.header}>
        <span className={styles.eyebrow}>High-Demand Verticals</span>
        <h2 className={styles.title}>Choose Your Preferred Delivery Track</h2>
        <p className={styles.subtitle}>
          DropyHub connects you across India&apos;s largest food delivery networks, instant grocery darkstores, and scheduled e-commerce supply chains.
        </p>
      </div>

      <div className={styles.cardsGrid}>
        {/* CARD A: Food & Quick Commerce */}
        <div className={styles.categoryCard}>
          <div className={styles.cardTop}>
            <div className={styles.categoryIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <div>
              <div className={styles.categoryTag}>Category A</div>
              <h3 className={styles.categoryName}>Food &amp; Quick Commerce</h3>
            </div>
          </div>

          <p className={styles.cardDescription}>
            Deliver hot meals, groceries, fresh produce, and everyday essentials through established delivery platforms and instant commerce darkstores.
          </p>

          <div className={styles.platformTitle}>Representative Ecosystem Partners:</div>
          <div className={styles.logoRow}>
            <div className={styles.logoBadge} title="Swiggy">
              <Image src="/assets/Home/swiggy.png" alt="Swiggy" width={70} height={22} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="Zomato">
              <Image src="/assets/Home/zomato.png" alt="Zomato" width={75} height={20} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="Blinkit">
              <Image src="/assets/Home/blinkit.png" alt="Blinkit" width={65} height={20} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="Zepto">
              <Image src="/assets/Home/zepto.png" alt="Zepto" width={60} height={20} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="BigBasket">
              <Image src="/assets/Home/big_basket.png" alt="BigBasket" width={75} height={22} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="McDonald's">
              <Image src="/assets/mcdonalds.jfif" alt="McDonald's" width={50} height={20} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="KFC">
              <Image src="/assets/KFC.jfif" alt="KFC" width={45} height={20} className={styles.badgeImg} />
            </div>
          </div>

          <ul className={styles.benefitsList}>
            <li className={styles.benefitItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>High peak order surges during lunch and dinner hours</span>
            </li>
            <li className={styles.benefitItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Instant customer tips and localized short-radius trips (0 – 4 km)</span>
            </li>
          </ul>
        </div>

        {/* CARD B: Logistics & E-Commerce */}
        <div className={styles.categoryCard}>
          <div className={styles.cardTop}>
            <div className={styles.categoryIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div className={styles.categoryTag}>Category B</div>
              <h3 className={styles.categoryName}>Logistics &amp; E-Commerce</h3>
            </div>
          </div>

          <p className={styles.cardDescription}>
            Deliver packages and products across specialized industries including pharmaceuticals, healthcare, fashion, retail, and general logistics.
          </p>

          <div className={styles.platformTitle}>Representative Ecosystem Partners:</div>
          <div className={styles.logoRow}>
            <div className={styles.logoBadge} title="Apollo 24|7">
              <Image src="/assets/apollo.png" alt="Apollo 24|7" width={75} height={22} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="Licious">
              <Image src="/assets/licious.jfif" alt="Licious" width={65} height={22} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="Delhivery">
              <Image src="/assets/Home/delhivery.png" alt="Delhivery" width={75} height={20} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="Shadowfax">
              <Image src="/assets/Home/shadowfax.png" alt="Shadowfax" width={78} height={22} className={styles.badgeImg} />
            </div>
            <div className={styles.logoBadge} title="Paradise Biryani">
              <Image src="/assets/Paradise.png" alt="Paradise Biryani" width={70} height={22} className={styles.badgeImg} />
            </div>
          </div>

          <ul className={styles.benefitsList}>
            <li className={styles.benefitItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Predictable daytime route clusters with bulk bag deliveries</span>
            </li>
            <li className={styles.benefitItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Fixed payout rates per packet drop &amp; volume incentives (up to ₹100/drop)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.disclaimerBanner}>
        <div className={styles.disclaimerIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className={styles.disclaimerText}>
          <strong>Operational Notice &amp; Platform Allocation Policy:</strong> Company names and trademarks mentioned above represent delivery categories serviced by DropyHub partner hubs. They do not constitute a confirmed direct employment contract or guarantee of placement with any single commercial brand. Final platform and hub allocation depends on city availability, zone demand, vehicle eligibility, and background verification.
        </p>
      </div>
    </section>
  );
}
