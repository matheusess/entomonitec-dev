export interface GeocodingResult {
  address: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  fullAddress: string;
}

class GeocodingService {
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
  private readonly MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private readonly GOOGLE_MAPS_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
  private readonly USER_AGENT = 'EntoMonitec/2.0.1';
  private readonly MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  private readonly GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Converter coordenadas em endereço (Reverse Geocoding) - com fallback para múltiplas APIs
  async getAddressFromCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<GeocodingResult> {
    console.log(`🌍 Buscando endereço para: ${latitude}, ${longitude}`);
    
    // Tentar Google Maps primeiro (mais preciso)
    if (this.GOOGLE_MAPS_API_KEY) {
      try {
        const result = await this.getAddressFromGoogleMaps(latitude, longitude);
        if (result) {
          console.log('✅ Endereço encontrado via Google Maps:', result.fullAddress);
          return result;
        }
      } catch (error) {
        console.warn('⚠️ Google Maps falhou, tentando fallback:', error);
      }
    }
    
    // Fallback para Nominatim
    try {
      const result = await this.getAddressFromNominatim(latitude, longitude);
      console.log('✅ Endereço encontrado via Nominatim:', result.fullAddress);
      return result;
    } catch (error) {
      console.error('❌ Erro no geocoding:', error);
      throw new Error(`Falha ao obter endereço: ${error}`);
    }
  }

  // Buscar endereço via Google Maps (mais preciso)
  private async getAddressFromGoogleMaps(
    latitude: number, 
    longitude: number
  ): Promise<GeocodingResult | null> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      return null;
    }

    const url = `${this.GOOGLE_MAPS_URL}?latlng=${latitude},${longitude}&key=${this.GOOGLE_MAPS_API_KEY}&language=pt-BR&region=BR&result_type=street_address|route|neighborhood|locality|administrative_area_level_2`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('Google Maps API response:', data.status, data.error_message);
      return null;
    }

    const result = data.results[0];
    return this.parseGoogleMapsAddress(result);
  }

  // Buscar endereço via Nominatim (fallback)
  private async getAddressFromNominatim(
    latitude: number, 
    longitude: number
  ): Promise<GeocodingResult> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      addressdetails: '1',
      'accept-language': 'pt-BR,pt,en',
      zoom: '18', // Zoom máximo para endereços precisos
      extratags: '1' // Informações extras
    });
    
    const url = `${this.NOMINATIM_URL}/reverse?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.USER_AGENT,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.address) {
      throw new Error('Endereço não encontrado');
    }
    
    return this.parseAddressData(data);
  }

  // Buscar coordenadas por endereço (Forward Geocoding) - com fallback para múltiplas APIs
  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      console.log(`🔍 Buscando coordenadas para: ${address}`);
      
      // Tentar primeiro com Google Maps (mais preciso)
      if (this.GOOGLE_MAPS_API_KEY) {
        try {
          const result = await this.getCoordinatesFromGoogleMaps(address);
          if (result) {
            console.log('✅ Coordenadas encontradas via Google Maps:', result.lat, result.lng);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ Google Maps falhou, tentando MapBox:', error);
        }
      }
      
      // Fallback para MapBox se disponível
      if (this.MAPBOX_ACCESS_TOKEN) {
        try {
          const result = await this.getCoordinatesFromMapBox(address);
          if (result) {
            console.log('✅ Coordenadas encontradas via MapBox:', result.lat, result.lng);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ MapBox falhou, tentando Nominatim:', error);
        }
      }
      
      // Último fallback para Nominatim (OpenStreetMap)
      try {
        const result = await this.getCoordinatesFromNominatim(address);
        if (result) {
          console.log('✅ Coordenadas encontradas via Nominatim:', result.lat, result.lng);
          return result;
        }
      } catch (error) {
        console.warn('⚠️ Nominatim também falhou:', error);
      }
      
      throw new Error('Coordenadas não encontradas em nenhuma API');
    } catch (error) {
      console.error('❌ Erro no geocoding forward:', error);
      throw new Error(`Falha ao obter coordenadas: ${error}`);
    }
  }

  // Buscar coordenadas via Nominatim (OpenStreetMap)
  private async getCoordinatesFromNominatim(address: string): Promise<{ lat: number; lng: number } | null> {
    const encodedAddress = encodeURIComponent(address);
    const url = `${this.NOMINATIM_URL}/search?q=${encodedAddress}&format=json&limit=1&accept-language=pt-BR,pt,en`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.USER_AGENT,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
  }

  // Buscar coordenadas via Google Maps
  private async getCoordinatesFromGoogleMaps(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key não configurado');
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `${this.GOOGLE_MAPS_URL}?address=${encodedAddress}&key=${this.GOOGLE_MAPS_API_KEY}&language=pt-BR&region=BR`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('Google Maps API response:', data.status, data.error_message);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    return {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    };
  }

  // Buscar coordenadas via MapBox
  private async getCoordinatesFromMapBox(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.MAPBOX_ACCESS_TOKEN) {
      throw new Error('MapBox access token não configurado');
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `${this.MAPBOX_URL}/${encodedAddress}.json?access_token=${this.MAPBOX_ACCESS_TOKEN}&country=BR&language=pt&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }

    const result = data.features[0];
    const [lng, lat] = result.center;
    
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
  }

  // Parsear dados de endereço do Google Maps (mais preciso)
  private parseGoogleMapsAddress(result: any): GeocodingResult {
    const addressComponents = result.address_components;
    const formattedAddress = result.formatted_address;
    
    let street = '';
    let houseNumber = '';
    let neighborhood = '';
    let city = '';
    let state = '';
    let country = '';
    let postcode = '';
    
    // Parsear componentes do endereço (ordem de prioridade corrigida)
    addressComponents.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        houseNumber = component.long_name;
      } else if (types.includes('route')) {
        street = component.long_name;
      } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        neighborhood = component.long_name;
      } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        postcode = component.long_name;
      }
    });
    
    // Se não encontrou bairro, tentar outros campos
    if (!neighborhood) {
      const neighborhoodComponent = addressComponents.find((comp: any) => 
        comp.types.includes('neighborhood') || 
        comp.types.includes('sublocality_level_2') ||
        comp.types.includes('political')
      );
      if (neighborhoodComponent) {
        neighborhood = neighborhoodComponent.long_name;
      }
    }
    
    // Fallback: extrair rua e número do formatted_address se não foram encontrados nos componentes
    if (!street || !houseNumber) {
      const addressParts = formattedAddress.split(',');
      if (addressParts.length >= 2) {
        const firstPart = addressParts[0].trim();
        const secondPart = addressParts[1].trim();
        
        // Rua está na primeira parte
        if (!street) {
          street = firstPart;
        }
        
        // Número pode estar na segunda parte (só dígitos)
        if (!houseNumber && /^\d+$/.test(secondPart)) {
          houseNumber = secondPart;
        }
      } else if (addressParts.length > 0) {
        const firstPart = addressParts[0].trim();
        
        // Tentar extrair número e rua da primeira parte (fallback secundário)
        const streetNumberMatch = firstPart.match(/^(.+?)\s+(\d+)$/);
        if (streetNumberMatch) {
          if (!street) street = streetNumberMatch[1].trim();
          if (!houseNumber) houseNumber = streetNumberMatch[2].trim();
        } else if (!street) {
          street = firstPart;
        }
      }
    }
    
    // Construir endereço completo
    const fullAddress = formattedAddress;
    
    return {
      address: formattedAddress,
      street,
      number: houseNumber,
      neighborhood,
      city,
      state,
      country,
      postalCode: postcode,
      fullAddress
    };
  }

  // Parsear dados do endereço retornado pela API (Nominatim)
  private parseAddressData(data: any): GeocodingResult {
    const address = data.address;
    
    // Extrair componentes do endereço com prioridade para Curitiba
    const street = address.road || address.street || address.pedestrian || '';
    const number = address.house_number || '';
    const neighborhood = address.suburb || address.neighbourhood || address.quarter || address.district || '';
    const city = address.city || address.town || address.village || '';
    const state = address.state || '';
    const country = address.country || '';
    const postalCode = address.postcode || '';

    // Construir endereço completo otimizado para Curitiba
    let fullAddress = '';
    
    // Rua e número
    if (street) {
      fullAddress += street;
      if (number) fullAddress += `, ${number}`;
      fullAddress += ', ';
    }
    
    // Bairro
    if (neighborhood) {
      fullAddress += neighborhood + ', ';
    }
    
    // Cidade e estado
    if (city) {
      fullAddress += city;
      if (state) fullAddress += ` - ${state}`;
      fullAddress += ', ';
    }
    
    // País
    if (country) {
      fullAddress += country;
    }

    // Limpar vírgulas extras
    fullAddress = fullAddress.replace(/,\s*$/, '');

    // Se não conseguiu construir endereço completo, usar o display_name
    if (!fullAddress.trim()) {
      fullAddress = data.display_name;
    }

    // Otimizar endereços - remover informações redundantes do país
    if (country === 'Brasil' || country === 'Brazil') {
      fullAddress = fullAddress.replace(`, ${country}`, '');
    }

    return {
      address: data.display_name,
      street,
      number,
      neighborhood,
      city,
      state,
      country,
      postalCode,
      fullAddress
    };
  }

  // Verificar se o serviço está disponível
  async checkServiceAvailability(): Promise<boolean> {
    try {
      const testCoords = { lat: -25.442868, lng: -49.226276 }; // Curitiba
      await this.getAddressFromCoordinates(testCoords.lat, testCoords.lng);
      return true;
    } catch (error) {
      console.warn('⚠️ Serviço de geocoding não está disponível:', error);
      return false;
    }
  }

  // Cache local para evitar chamadas repetidas
  private cache = new Map<string, GeocodingResult>();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

  // Obter endereço com cache
  async getAddressFromCoordinatesWithCache(
    latitude: number, 
    longitude: number
  ): Promise<GeocodingResult> {
    const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Endereço encontrado no cache');
      return cached;
    }

    const result = await this.getAddressFromCoordinates(latitude, longitude);
    
    // Salvar no cache
    this.cache.set(cacheKey, result);
    
    // Limpar cache expirado
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, this.CACHE_EXPIRY);

    return result;
  }

  // Limpar todo o cache (para debug)
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache do geocoding limpo');
  }
}

export const geocodingService = new GeocodingService();
