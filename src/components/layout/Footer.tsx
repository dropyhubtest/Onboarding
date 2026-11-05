import React from 'react';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.brandCol}>
            <Image
              src="/assets/Home/Dropyhub_logo.png"
              alt="DropyHub Delivery Partner Network"
              width={80}
              height={44}
              className={styles.footerLogo}
            />
            <p className={styles.tagline}>
              DropyHub is India&apos;s premier delivery partner network connecting independent riders with verified food, quick commerce, and enterprise logistics hubs.
            </p>
          </div>

          <div className={styles.recruiterNotice}>
            <div className={styles.recruiterNoticeTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Direct Recruiter Contact Process</span>
            </div>
            <p className={styles.recruiterNoticeText}>
              Once your application is submitted with your mandatory Kotak bank account, an official DropyHub recruitment coordinator will call you directly within 24 hours to schedule your local hub induction.
            </p>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div>
            &copy; {new Date().getFullYear()} DropyHub Logistics Private Limited. All rights reserved.
          </div>

          <div className={styles.securityNote}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Bank-Grade Document Encryption &amp; RBI Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
