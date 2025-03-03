import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLocations, getLocationCount, deleteLocation } from '@/database/database';
import { WeatherData } from '@/types/weather';

const SavedLocations = () => {
  const [savedLocations, setSavedLocations] = useState<WeatherData[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
        const initializeLocation = async () => {
            await loadSavedLocations();
        };
        console.log('Initializing Location for saved locations screen');
        initializeLocation();
    }, [])
  );

  // Load saved locations from AsyncStorage
  const loadSavedLocations = async () => {
    try {
      const storedData = await getLocations();
      setSavedLocations(storedData);
      addTemperatureToLocations(storedData);
    } catch (error) {
      console.error('Error loading saved locations:', error);
    }
  };

  // Fetch weather data based on latitude and longitude
  const getWeatherData = async (city: string) => {
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
        return weatherData.current_weather.temperature; // Return temperature
      } else {
        alert('Weather data not available.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch weather data.');
      return null;
    }
  };

  // Remove a location from saved list
  const removeLocation = async (id: number) => {
    await deleteLocation(id);
    loadSavedLocations();
  };

// Add a temperature to each saved location
const addTemperatureToLocations = async (locations: WeatherData[]) => {
    const updatedLocations = await Promise.all(
      locations.map(async (location) => {
        const temperature = await getWeatherData(location.locationName);
        return { ...location, temperature }; // Add temperature to each location
      })
    );
    setSavedLocations(updatedLocations);
    console.log('Temperature added to saved locations:', updatedLocations);
  };

/*   useEffect(() => {
    console.log('Adding temperature to saved locations...');
    addTemperatureToLocations();
  }, []); */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Locations</Text>
      {savedLocations.length === 0 ? (
        <Text>No saved locations. Add locations from the search screen.</Text>
      ) : (
        <FlatList
          data={savedLocations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.city}>{item.locationName}</Text>
              <Text>Temperature: {item.temperature ? `${item.temperature}°C` : 'Loading...'}</Text>
              <Button title="Remove" onPress={() => removeLocation(item.id)} />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  city: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SavedLocations;
