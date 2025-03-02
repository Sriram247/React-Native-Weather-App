import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, FlatList } from 'react-native';
import { createTable, saveLocation, getLocations, getLocationCount, deleteLocation } from '@/database/database';

  const SearchWeatherScreen = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [locations, setLocations] = useState<any>([]);
  const [locationCount, setLocationCount] = useState<number>(0);

  useEffect(() => {
    const initializeDB = async () => {
       createTable();
       fetchLocations();
       fetchLocationCount(); 
    };
    initializeDB();
  }, []);

  const getWeatherData = async () => {
    if (!city.trim()) {
      alert('Please enter a city name.');
      return;
    }

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405&current_weather=true`
      );
      const data = await response.json();

      if (data?.current_weather) {
        setWeatherData(data.current_weather);
      } else {
        alert('Weather data not available.');
      }
    } catch (error) {
      console.error('Weather API error:', error);
      alert('Failed to fetch weather data.');
    }
  };

  const handleSaveLocation = async () => {
    if (locationCount >= 4) {
      alert('You can only save up to 4 locations.');
      return;
    }

    try {
       saveLocation(city);
       fetchLocations();
       fetchLocationCount();
    } catch (error) {
      console.error('Save location error:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const savedLocations =  getLocations();
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
    <View style={{ padding: 20 }}>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Search Weather" onPress={getWeatherData} />

      {weatherData && (
        <View style={{ marginTop: 20 }}>
          <Text>Weather Information:</Text>
          <Text>Temperature: {weatherData.temperature}°C</Text>
          <Text>Wind Speed: {weatherData.windspeed} km/h</Text>
          <Text>Weather Code: {weatherData.weathercode}</Text>
        </View>
      )}

      <Button
        title="Save Location"
        onPress={handleSaveLocation}
        disabled={locationCount >= 4}
      />

      {locationCount >= 4 && (
        <Text style={{ color: 'red', marginTop: 10 }}>
          You can only save up to 4 locations.
        </Text>
      )}

      <FlatList
        data={locations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

export default SearchWeatherScreen;
