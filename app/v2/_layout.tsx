import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { V2WebFonts } from '../../src/components/v2/WebFonts';
import { v2Colors } from '../../src/theme/v2';

export default function V2Layout() {
  return (
    <>
      <V2WebFonts />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: v2Colors.paper },
          animation: 'fade',
        }}
      />
    </>
  );
}
