import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Delivery Partner Onboarding Portal | DropyHub Logistics',
  description:
    'Join our premier delivery partner network. Flexible earning opportunities across food, quick commerce, and enterprise logistics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto-recover if a stale tab attempts to load chunks from an overwritten build
              window.addEventListener('error', function(event) {
                if (event && event.message && (
                  event.message.indexOf('Loading chunk') !== -1 ||
                  event.message.indexOf('ChunkLoadError') !== -1
                )) {
                  console.warn('Stale build chunk detected. Reloading to latest version...');
                  window.location.reload();
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
