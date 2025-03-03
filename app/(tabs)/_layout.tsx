import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Weather',tabBarIcon: () => null, }} />
      <Tabs.Screen name="searchWeatherScreen" options={{ title: 'Search',tabBarIcon: () => null, }} />
      <Tabs.Screen name="savedLocations" options={{ title: 'Locations',tabBarIcon: () => null, }} />
    </Tabs>
  );
}
