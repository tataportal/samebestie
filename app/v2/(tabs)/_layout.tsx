import { Tabs } from 'expo-router';
import { PaperTabBar, PaperTab } from '../../../src/components/v2/PaperTabBar';
import { v2Colors } from '../../../src/theme/v2';

const TABS: PaperTab[] = [
  { key: 'pet',      label: 'Bestie',   glyph: '🐧', accent: v2Colors.coral  },
  { key: 'stats',    label: 'Records',  glyph: '📊', accent: v2Colors.moss   },
  { key: 'settings', label: 'Settings', glyph: '⚙', accent: v2Colors.sky    },
];

export default function V2TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: v2Colors.paper } }}
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index].name;
        return (
          <PaperTabBar
            tabs={TABS}
            activeTab={activeRoute}
            onTabPress={(key) => {
              const route = props.state.routes.find((r) => r.name === key);
              if (route) {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              }
            }}
          />
        );
      }}
    >
      <Tabs.Screen name="pet" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
