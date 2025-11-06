/**
 * Serviço de Geocodificação usando OpenStreetMap Nominatim API
 * Converte nomes de cidades em coordenadas geográficas
 */

import logger from '@/lib/logger';

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface CityCoordinates {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface ReverseGeocodingResult {
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    municipality?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  display_name: string;
}

interface AddressDetails {
  fullAddress: string;
  address: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

class GeocodingService {
  private baseURL = 'https://nominatim.openstreetmap.org';
  private cache: Map<string, CityCoordinates> = new Map();
  private addressCache: Map<string, AddressDetails> = new Map();

  /**
   * Geocodifica uma cidade brasileira
   * @param city Nome da cidade
   * @param state UF do estado (ex: "PR", "SP")
   * @returns Coordenadas da cidade
   */
  async geocodeCity(city: string, state: string): Promise<CityCoordinates | null> {
    const cacheKey = `${city}-${state}`;
    
    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      logger.log(`📍 Coordenadas do cache: ${cacheKey}`);
      return this.cache.get(cacheKey)!;
    }

    try {
      // Construir query para cidade brasileira
      const query = `${city}, ${state}, Brasil`;
      
      const response = await fetch(
        `${this.baseURL}/search?` + new URLSearchParams({
          q: query,
          format: 'json',
          limit: '1',
          countrycodes: 'br',
          'accept-language': 'pt-BR'
        }),
        {
          headers: {
            'User-Agent': 'Entomonitec/1.0' // Nominatim requer User-Agent
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na geocodificação: ${response.statusText}`);
      }

      const data: GeocodingResult[] = await response.json();

      if (data.length === 0) {
        logger.warn(`⚠️ Nenhuma coordenada encontrada para: ${query}`);
        return null;
      }

      const result = data[0];
      const coordinates: CityCoordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name
      };

      // Armazenar no cache
      this.cache.set(cacheKey, coordinates);
      
      logger.log(`📍 Coordenadas encontradas para ${city}/${state}:`, coordinates);
      
      return coordinates;
    } catch (error) {
      logger.error('❌ Erro ao geocodificar cidade:', error);
      return null;
    }
  }

  /**
   * Obtém coordenadas com fallback para coordenadas padrão
   * @param city Nome da cidade
   * @param state UF do estado
   * @returns Coordenadas ou coordenadas padrão (Curitiba)
   */
  async getCityCoordinatesWithFallback(
    city: string, 
    state: string
  ): Promise<[number, number]> {
    const coordinates = await this.geocodeCity(city, state);
    
    if (coordinates) {
      return [coordinates.latitude, coordinates.longitude];
    }

    // Fallback para Curitiba
    logger.warn(`⚠️ Usando coordenadas padrão (Curitiba)`);
    return [-25.4284, -49.2733];
  }

  /**
   * Geocodificação reversa - converte coordenadas em endereço
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns Detalhes do endereço
   */
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<AddressDetails | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/reverse?` + new URLSearchParams({
          lat: latitude.toString(),
          lon: longitude.toString(),
          format: 'json',
          'accept-language': 'pt-BR'
        }),
        {
          headers: {
            'User-Agent': 'Entomonitec/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na geocodificação reversa: ${response.statusText}`);
      }

      const data: ReverseGeocodingResult = await response.json();

      if (!data.address) {
        logger.warn('⚠️ Nenhum endereço encontrado para as coordenadas');
        return null;
      }

      const addressDetails: AddressDetails = {
        fullAddress: data.display_name,
        address: data.display_name,
        street: data.address.road,
        number: data.address.house_number,
        neighborhood: data.address.suburb || data.address.neighbourhood,
        city: data.address.city || data.address.municipality || data.address.town || data.address.village,
        state: data.address.state,
        postalCode: data.address.postcode
      };

      logger.log('📍 Endereço encontrado:', addressDetails);

      return addressDetails;
    } catch (error) {
      logger.error('❌ Erro ao obter endereço:', error);
      return null;
    }
  }

  /**
   * Geocodificação reversa com cache
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns Detalhes do endereço (do cache ou da API)
   */
  async getAddressFromCoordinatesWithCache(
    latitude: number,
    longitude: number
  ): Promise<AddressDetails> {
    // Criar chave de cache arredondando coordenadas para 4 casas decimais (~11m de precisão)
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    // Verificar cache primeiro
    if (this.addressCache.has(cacheKey)) {
      logger.log(`📍 Endereço do cache: ${cacheKey}`);
      return this.addressCache.get(cacheKey)!;
    }

    // Buscar da API
    const address = await this.getAddressFromCoordinates(latitude, longitude);

    if (address) {
      // Armazenar no cache
      this.addressCache.set(cacheKey, address);
      return address;
    }

    // Fallback se não encontrar endereço
    const fallbackAddress: AddressDetails = {
      fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    };

    return fallbackAddress;
  }

  /**
   * Limpa o cache de coordenadas e endereços
   */
  clearCache(): void {
    this.cache.clear();
    this.addressCache.clear();
    logger.log('🗑️ Cache de coordenadas e endereços limpo');
  }
}

export const geocodingService = new GeocodingService();
export default geocodingService;
