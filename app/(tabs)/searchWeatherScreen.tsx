import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, FlatList, StyleSheet } from 'react-native';
import { createTable, saveLocation, getLocations, getLocationCount, deleteLocation } from '@/database/database';

const SearchWeatherScreen = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [locations, setLocations] = useState<any>([]);
  const [locationCount, setLocationCount] = useState<number>(0);

  useEffect(() => {
    const initializeDB = async () => {
      await createTable();
      await fetchLocations();
      await fetchLocationCount();
    };
    console.log('Initializing database');
    initializeDB();
  }, []);

  const getWeatherData = async () => {
    if (!city.trim()) {
      alert('Please enter a city name.');
      return;
    }

    try {
      // Step 1: Get latitude and longitude from city name
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData?.results || geoData.results.length === 0) {
        alert('City not found. Please try again.');
        return;
      }

      const { latitude, longitude } = geoData.results[0];

      // Step 2: Fetch weather data using lat and lon
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherResponse.json();

      if (weatherData?.current_weather) {
        setWeatherData(weatherData.current_weather);
      } else {
        alert('Weather data not available.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch weather data.');
    }
  };

  const handleSaveLocation = async () => {
    if (locationCount >= 4) {
      alert('You can only save up to 4 locations.');
      return;
    }

    try {
      await saveLocation(city);
      fetchLocations();
      fetchLocationCount();
      alert('Location saved successfully.');
    } catch (error) {
      console.error('Save location error:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const savedLocations = await getLocations();
      setLocations(savedLocations);
    } catch (error) {
      console.error('Fetch locations error:', error);
    }
  };

  const fetchLocationCount = async () => {
    try {
      const countString = await getLocationCount();
      setLocationCount(countString);
    } catch (error) {
      console.error('Fetch count error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        placeholderTextColor="gray"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Search Weather" onPress={getWeatherData} />

      {weatherData && (
        <View style={styles.weatherInfo}>
          <Text style={styles.text}>Weather Information:</Text>
          <Text style={styles.text}>Temperature: {weatherData.temperature}°C</Text>
          <Text style={styles.text}>Wind Speed: {weatherData.windspeed} km/h</Text>
          <Text style={styles.text}>Weather Code: {weatherData.weathercode}</Text>
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Save Location"
          onPress={handleSaveLocation}
          disabled={locationCount >= 4 || city.trim() === ''}
        />
      </View>

      {locationCount >= 4 && (
        <Text style={styles.errorText}>
          You can only save up to 4 locations.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white', // Set background color to white
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    color: 'black', // Set text color to black
  },
  weatherInfo: {
    marginTop: 20,
  },
  text: {
    color: 'black', // Set text color to black
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default SearchWeatherScreen;
