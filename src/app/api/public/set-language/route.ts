import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/public/set-language
 * Sets the 'lang' cookie and redirects back to the referrer page.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const lang = formData.get('lang');
  const redirectTo = formData.get('redirectTo')?.toString() || '/';

  const validLang = lang === 'mr' ? 'mr' : 'en';

  // Safely construct the base URL to handle production proxies (like Railway)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  const response = NextResponse.redirect(new URL(redirectTo, baseUrl));
  response.cookies.set('lang', validLang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client JS to read if needed
    sameSite: 'lax',
  });

  return response;
}
