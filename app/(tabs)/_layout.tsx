import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="weatherScreen" options={{ title: 'Weather' }} />
      <Tabs.Screen name="searchWeatherScreen" options={{ title: 'Search' }} />
    </Tabs>
  );
}
