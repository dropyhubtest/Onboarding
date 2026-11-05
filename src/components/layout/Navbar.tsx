'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const formElement = document.getElementById('apply-now');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
      const firstInput = formElement.querySelector('input') as HTMLInputElement | null;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 650);
      }
    }
  };

  return (
    <header className={styles.header} aria-label="Main Navigation">
      <div className={styles.logoWrapper}>
        <Link href="/" className={styles.logoLink} aria-label="DropyHub Home">
          <Image
            src="/assets/Home/Dropyhub_logo.png"
            alt="DropyHub Logo"
            width={90}
            height={50}
            priority
            className={styles.logoImage}
          />
        </Link>
      </div>

      <div className={styles.navActions}>
        <button type="button" onClick={scrollToForm} className={styles.primaryCta}>
          <span className={styles.ctaTextFull}>Become a Delivery Partner</span>
          <span className={styles.ctaTextMobile}>Become Partner</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </header>
  );
}
