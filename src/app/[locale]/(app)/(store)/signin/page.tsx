import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SignInPage } from '@/components/auth/sign-in-page';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to RenderWeld to get your licence keys and orders.',
  robots: { index: false, follow: false },
};

interface SignInRouteProps {
  params: Promise<{ locale: string }>;
}

/**
 * /signin (studio issue #597): starts BuildBase's hosted sign-in on load and
 * comes back to `?next=` (a path on this site only). Where other pages send
 * a signed-out visitor; /login and /sign-in redirect here.
 */
export default async function SignInRoute({ params }: SignInRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto w-full max-w-md px-6 py-16 text-center md:py-24">
      <Suspense fallback={null}>
        <SignInPage />
      </Suspense>
    </div>
  );
}
