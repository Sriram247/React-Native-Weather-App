import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function WeatherScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      fetchWeather(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await response.json();
      console.log(data);
      setWeather(data.current_weather);
    } catch (error) {
      setErrorMsg('Failed to fetch weather data');
    }
  };

  if (errorMsg) {
    return <Text style={styles.error}>{errorMsg}</Text>;
  }

  if (!location || !weather) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Weather</Text>
      <Text style={styles.info}>Temperature: {weather.temperature}°C</Text>
      <Text style={styles.info}>Wind Speed: {weather.windspeed} m/s</Text>
      <Text style={styles.info}>Latitude: {location.coords.latitude}</Text>
      <Text style={styles.info}>Longitude: {location.coords.longitude}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  error: {
    fontSize: 18,
    color: 'red',
  },
});
