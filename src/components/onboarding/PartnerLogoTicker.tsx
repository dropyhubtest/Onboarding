'use client';

import React from 'react';
import Image from 'next/image';
import styles from './PartnerLogoTicker.module.css';

const PARTNERS = [
  { name: 'Swiggy', src: '/assets/Home/swiggy.png', width: 85, height: 28 },
  { name: 'Zomato', src: '/assets/Home/zomato.png', width: 90, height: 26 },
  { name: 'Blinkit', src: '/assets/Home/blinkit.png', width: 80, height: 26 },
  { name: 'Zepto', src: '/assets/Home/zepto.png', width: 75, height: 26 },
  { name: 'BigBasket', src: '/assets/Home/big_basket.png', width: 95, height: 28 },
  { name: 'Apollo 24|7', src: '/assets/apollo.png', width: 85, height: 28 },
  { name: 'Licious', src: '/assets/licious.jfif', width: 75, height: 28 },
  { name: 'Delhivery', src: '/assets/Home/delhivery.png', width: 90, height: 26 },
  { name: 'Shadowfax', src: '/assets/Home/shadowfax.png', width: 95, height: 28 },
  { name: 'McDonald\'s', src: '/assets/mcdonalds.jfif', width: 70, height: 28 },
  { name: 'KFC', src: '/assets/KFC.jfif', width: 70, height: 28 },
  { name: 'Paradise Biryani', src: '/assets/Paradise.png', width: 80, height: 28 },
];

export default function PartnerLogoTicker() {
  return (
    <div className={styles.container} aria-label="Ecosystem Client Platforms">
      <div className={styles.labelWrapper}>
        <span className={styles.eyebrow}>
          Representative Delivery Ecosystems &amp; Fulfillment Networks
        </span>
      </div>

      <div className={styles.logoGrid}>
        {PARTNERS.map((p) => (
          <div key={p.name} className={styles.logoCard} title={p.name}>
            <Image
              src={p.src}
              alt={p.name}
              width={p.width}
              height={p.height}
              className={styles.logoImg}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
