import { Tabs } from 'expo-router';
import { BottomNav } from '../../src/components';

const TAB_CONFIG = [
  { key: 'index', label: 'FOCUS', icon: 'timer', iconFilled: 'timer' },
  { key: 'stats', label: 'STATS', icon: 'bar-chart', iconFilled: 'bar-chart' },
  { key: 'pet', label: 'PET', icon: 'pets', iconFilled: 'pets' },
  { key: 'settings', label: 'GEAR', icon: 'settings', iconFilled: 'settings' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index].name;
        return (
          <BottomNav
            tabs={TAB_CONFIG}
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
      <Tabs.Screen name="index" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="pet" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
