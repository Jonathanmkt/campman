export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { OnboardingClient } from './components/onboarding-client';

export default function OnboardingPage() {
  return <OnboardingClient />;
}
