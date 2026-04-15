import { Redirect } from 'expo-router';
import { useUserStore } from '../src/store/useUserStore';

export default function Index() {
  const isOnboarded = useUserStore((s) => s.isOnboarded);
  if (!isOnboarded) return <Redirect href="/v2/onboarding" />;
  return <Redirect href="/v2" />;
}
