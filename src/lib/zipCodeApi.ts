// src/lib/zipCodeApi.ts

interface ZipCodePlace {
  "place name": string;
  longitude: string;
  state: string;
  "state abbreviation": string;
  latitude: string;
}

interface ZipCodeData {
  "post code": string;
  country: string;
  "country abbreviation": string;
  places: ZipCodePlace[];
}

/**
 * Fetches location data for a given US zip code.
 * @param zipCode - The 5-digit US zip code.
 * @returns A promise that resolves to the zip code data.
 */
export const fetchZipCodeData = async (
  zipCode: number,
): Promise<ZipCodeData | null> => {
  if (!zipCode) {
    console.error("Invalid zip code provided.");
    return null;
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch zip code data: ${response.statusText}`);
    }
    const data: ZipCodeData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching zip code data:", error);
    return null;
  }
};

/**
 * Parses the city from the zip code API response.
 * @param data - The zip code data object.
 * @returns The city name or an empty string if not found.
 */
export const getCity = (data: ZipCodeData | null): string => {
  return data?.places?.[0]?.["place name"] || "";
};

/**
 * Parses the state abbreviation from the zip code API response.
 * @param data - The zip code data object.
 * @returns The state abbreviation or an empty string if not found.
 */
export const getState = (data: ZipCodeData | null): string => {
  return data?.places?.[0]?.["state abbreviation"] || "";
};
