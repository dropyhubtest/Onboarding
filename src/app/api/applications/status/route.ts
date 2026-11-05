import { NextRequest, NextResponse } from 'next/server';
import { getApplicationForCandidate } from '@/lib/db';
import { cleanIndianMobile } from '@/lib/validation';
import { getKotakAccountOpeningUrl } from '@/lib/kotak';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    const mobile = searchParams.get('mobile');

    if (!reference || !mobile) {
      return NextResponse.json(
        { error: 'Both Application Reference ID and Registered Mobile Number are required.' },
        { status: 400 }
      );
    }

    const cleanedMobile = cleanIndianMobile(mobile);
    const application = getApplicationForCandidate(reference.trim().toUpperCase(), cleanedMobile);

    if (!application) {
      return NextResponse.json(
        { error: 'No matching application found for the provided Reference ID and Mobile Number.' },
        { status: 404 }
      );
    }

    const kotakUrl = getKotakAccountOpeningUrl(application.reference);

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        kotakUrl,
      },
    });
  } catch (error: any) {
    console.error('Candidate status lookup error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to retrieve application status. Please try again.' },
      { status: 500 }
    );
  }
}
