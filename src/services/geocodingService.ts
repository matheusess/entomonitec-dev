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
  private readonly BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly USER_AGENT = 'EntoMonitec/2.0.1';

  // Converter coordenadas em endereço (Reverse Geocoding)
  async getAddressFromCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<GeocodingResult> {
    try {
      console.log(`🌍 Buscando endereço para: ${latitude}, ${longitude}`);
      
      // Parâmetros otimizados para Curitiba
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'pt-BR,pt,en',
        zoom: '18', // Zoom máximo para endereços precisos
        extratags: '1' // Informações extras
      });
      
      const url = `${this.BASE_URL}/reverse?${params.toString()}`;
      
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

      console.log('✅ Endereço encontrado:', data.display_name);
      
      return this.parseAddressData(data);
    } catch (error) {
      console.error('❌ Erro no geocoding:', error);
      throw new Error(`Falha ao obter endereço: ${error}`);
    }
  }

  // Buscar coordenadas por endereço (Forward Geocoding)
  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      console.log(`🔍 Buscando coordenadas para: ${address}`);
      
      const encodedAddress = encodeURIComponent(address);
      const url = `${this.BASE_URL}/search?q=${encodedAddress}&format=json&limit=1&accept-language=pt-BR,pt,en`;
      
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
        throw new Error('Coordenadas não encontradas');
      }

      const result = data[0];
      console.log('✅ Coordenadas encontradas:', result.lat, result.lon);
      
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    } catch (error) {
      console.error('❌ Erro no geocoding forward:', error);
      throw new Error(`Falha ao obter coordenadas: ${error}`);
    }
  }

  // Parsear dados do endereço retornado pela API
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
}

export const geocodingService = new GeocodingService();
