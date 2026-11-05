/**
 * Kotak Mahindra Bank Account Redirection & Verification Service
 * Ensures safe, compliant parameter passing without leaking sensitive PII (No Aadhaar/PAN in URLs).
 */

export function getKotakAccountOpeningUrl(applicationReference?: string): string {
  const baseKotakUrl =
    process.env.KOTAK_ACCOUNT_OPENING_URL ||
    'https://bit.ly/4i35J6m';

  if (!baseKotakUrl || baseKotakUrl.trim() === '') {
    return 'https://bit.ly/4i35J6m';
  }

  // If already a shortened affiliate campaign URL (e.g. bit.ly), return directly to preserve tracking
  if (baseKotakUrl.includes('bit.ly')) {
    return baseKotakUrl.trim();
  }

  try {
    const urlObj = new URL(baseKotakUrl);
    // Non-sensitive attribution and tracking parameters only
    urlObj.searchParams.set('source', 'dropyhub_partner_onboarding');
    if (applicationReference) {
      urlObj.searchParams.set('partner_ref', encodeURIComponent(applicationReference));
    }
    urlObj.searchParams.set('ts', Date.now().toString());
    return urlObj.toString();
  } catch (e) {
    return baseKotakUrl;
  }
}
