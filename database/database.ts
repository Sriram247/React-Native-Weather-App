import * as SQLite from 'expo-sqlite';
import type { WeatherData } from '@/types/weather';

const db = SQLite.openDatabaseAsync('locations.db');
console.log('Database initialized');

export const createTable = async () => {
  // Create the table if it doesn't exist
  const Database = await db;
  await Database.execAsync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      locationName TEXT UNIQUE,
      temperature REAL,
      weatherCondition TEXT,
    )
  `);

  console.log('Database and table initialized successfully');
}

// Save a location
export const saveLocation = async (city: string) => {
  const Database = await db;
  
  // Corrected: Parameters need to be passed as an array
  const st = await Database.prepareAsync(`
    INSERT INTO locations (name) VALUES ($location);
    `);
  await st.executeAsync({ $location: city });
}

// Get all saved locations
export const getLocations = async (): Promise<WeatherData[]> => {
  const Database = await db;
  const result = await Database.getAllAsync<WeatherData>('SELECT * FROM locations;');
  console.log('Locations fetched:', result);
  return result;
};

// Get the count of saved locations
export const getLocationCount = async (): Promise<number> => {
  const Database = await db;
  const result = await Database.getAllAsync<{ count: number }>('SELECT COUNT(*) AS count FROM locations;');
  return result[0].count;
};

// Delete a location by ID
export const deleteLocation = async (id: number) => {
  const Database = await db;
  await Database.runAsync('DELETE FROM locations WHERE id = ?;', [id]);
  console.log('Location deleted:', id);
};