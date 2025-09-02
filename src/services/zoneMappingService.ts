/**
 * Serviço para mapear bairros para zonas geográficas
 * Permite agrupamento automático de usuários por zona baseado nos bairros atribuídos
 */

export interface ZoneMapping {
  neighborhood: string;
  zone: 'Norte' | 'Sul' | 'Leste' | 'Oeste' | 'Centro';
}

export interface ZoneSummary {
  zoneName: string;
  totalAgents: number;
  activeAgents: number;
  totalVisits: number;
  averageQuality: number;
  completionRate: number;
  targetAchievement: number;
  neighborhoods: string[];
  agents: string[];
}

// Mapeamento de bairros para zonas (baseado em Curitiba)
// Este mapeamento pode ser expandido conforme necessário
const NEIGHBORHOOD_ZONE_MAPPING: ZoneMapping[] = [
  // Zona Norte
  { neighborhood: 'Boa Vista', zone: 'Norte' },
  { neighborhood: 'Cachoeira', zone: 'Norte' },
  { neighborhood: 'Cajuru', zone: 'Norte' },
  { neighborhood: 'Capão Raso', zone: 'Norte' },
  { neighborhood: 'Cidade Industrial', zone: 'Norte' },
  { neighborhood: 'Fanny', zone: 'Norte' },
  { neighborhood: 'Guabirotuba', zone: 'Norte' },
  { neighborhood: 'Jardim das Américas', zone: 'Norte' },
  { neighborhood: 'Mercês', zone: 'Norte' },
  { neighborhood: 'Pilarzinho', zone: 'Norte' },
  { neighborhood: 'Santa Felicidade', zone: 'Norte' },
  { neighborhood: 'Santo Inácio', zone: 'Norte' },
  { neighborhood: 'Tatuquara', zone: 'Norte' },
  { neighborhood: 'Uberaba', zone: 'Norte' },

  // Zona Sul
  { neighborhood: 'Água Verde', zone: 'Sul' },
  { neighborhood: 'Alto Boqueirão', zone: 'Sul' },
  { neighborhood: 'Batel', zone: 'Sul' },
  { neighborhood: 'Bigorrilho', zone: 'Sul' },
  { neighborhood: 'Campo Comprido', zone: 'Sul' },
  { neighborhood: 'Capão da Imbuia', zone: 'Sul' },
  { neighborhood: 'Cristo Rei', zone: 'Sul' },
  { neighborhood: 'Fazendinha', zone: 'Sul' },
  { neighborhood: 'Guadalupe', zone: 'Sul' },
  { neighborhood: 'Hauer', zone: 'Sul' },
  { neighborhood: 'Lindóia', zone: 'Sul' },
  { neighborhood: 'Novo Mundo', zone: 'Sul' },
  { neighborhood: 'Pinheirinho', zone: 'Sul' },
  { neighborhood: 'Portão', zone: 'Sul' },
  { neighborhood: 'Seminário', zone: 'Sul' },
  { neighborhood: 'Sítio Cercado', zone: 'Sul' },
  { neighborhood: 'Vila Izabel', zone: 'Sul' },

  // Zona Leste
  { neighborhood: 'Abranches', zone: 'Leste' },
  { neighborhood: 'Bacacheri', zone: 'Leste' },
  { neighborhood: 'Barreirinha', zone: 'Leste' },
  { neighborhood: 'Boa Vista', zone: 'Leste' },
  { neighborhood: 'Cachoeira', zone: 'Leste' },
  { neighborhood: 'Cajuru', zone: 'Leste' },
  { neighborhood: 'Capão Raso', zone: 'Leste' },
  { neighborhood: 'Cidade Industrial', zone: 'Leste' },
  { neighborhood: 'Fanny', zone: 'Leste' },
  { neighborhood: 'Guabirotuba', zone: 'Leste' },
  { neighborhood: 'Jardim das Américas', zone: 'Leste' },
  { neighborhood: 'Mercês', zone: 'Leste' },
  { neighborhood: 'Pilarzinho', zone: 'Leste' },
  { neighborhood: 'Santa Felicidade', zone: 'Leste' },
  { neighborhood: 'Santo Inácio', zone: 'Leste' },
  { neighborhood: 'Tatuquara', zone: 'Leste' },
  { neighborhood: 'Uberaba', zone: 'Leste' },

  // Zona Oeste
  { neighborhood: 'Alto da Glória', zone: 'Oeste' },
  { neighborhood: 'Alto da XV', zone: 'Oeste' },
  { neighborhood: 'Batel', zone: 'Oeste' },
  { neighborhood: 'Bigorrilho', zone: 'Oeste' },
  { neighborhood: 'Campo Comprido', zone: 'Oeste' },
  { neighborhood: 'Capão da Imbuia', zone: 'Oeste' },
  { neighborhood: 'Cristo Rei', zone: 'Oeste' },
  { neighborhood: 'Fazendinha', zone: 'Oeste' },
  { neighborhood: 'Guadalupe', zone: 'Oeste' },
  { neighborhood: 'Hauer', zone: 'Oeste' },
  { neighborhood: 'Lindóia', zone: 'Oeste' },
  { neighborhood: 'Novo Mundo', zone: 'Oeste' },
  { neighborhood: 'Pinheirinho', zone: 'Oeste' },
  { neighborhood: 'Portão', zone: 'Oeste' },
  { neighborhood: 'Seminário', zone: 'Oeste' },
  { neighborhood: 'Sítio Cercado', zone: 'Oeste' },
  { neighborhood: 'Vila Izabel', zone: 'Oeste' },

  // Centro
  { neighborhood: 'Centro', zone: 'Centro' },
  { neighborhood: 'Centro Cívico', zone: 'Centro' },
  { neighborhood: 'Rebouças', zone: 'Centro' },
  { neighborhood: 'São Francisco', zone: 'Centro' },
  { neighborhood: 'Vila Izabel', zone: 'Centro' }
];

export class ZoneMappingService {
  /**
   * Obtém a zona de um bairro específico
   */
  static getZoneByNeighborhood(neighborhood: string): string | null {
    const mapping = NEIGHBORHOOD_ZONE_MAPPING.find(
      item => item.neighborhood.toLowerCase() === neighborhood.toLowerCase()
    );
    return mapping ? mapping.zone : null;
  }

  /**
   * Obtém todos os bairros de uma zona específica
   */
  static getNeighborhoodsByZone(zone: string): string[] {
    return NEIGHBORHOOD_ZONE_MAPPING
      .filter(item => item.zone === zone)
      .map(item => item.neighborhood);
  }

  /**
   * Obtém todas as zonas disponíveis
   */
  static getAllZones(): string[] {
    return Array.from(new Set(NEIGHBORHOOD_ZONE_MAPPING.map(item => item.zone)));
  }

  /**
   * Determina a zona principal de um usuário baseado nos bairros atribuídos
   * Se o usuário tem bairros de múltiplas zonas, retorna a zona com mais bairros
   */
  static getUserPrimaryZone(assignedNeighborhoods: string[]): string | null {
    if (!assignedNeighborhoods || assignedNeighborhoods.length === 0) {
      return null;
    }

    const zoneCount: { [zone: string]: number } = {};
    
    assignedNeighborhoods.forEach(neighborhood => {
      const zone = this.getZoneByNeighborhood(neighborhood);
      if (zone) {
        zoneCount[zone] = (zoneCount[zone] || 0) + 1;
      }
    });

    // Retorna a zona com mais bairros
    const primaryZone = Object.keys(zoneCount).reduce((a, b) => 
      zoneCount[a] > zoneCount[b] ? a : b, Object.keys(zoneCount)[0]
    );

    return primaryZone || null;
  }

  /**
   * Obtém todas as zonas que um usuário atende baseado nos bairros atribuídos
   */
  static getUserZones(assignedNeighborhoods: string[]): string[] {
    if (!assignedNeighborhoods || assignedNeighborhoods.length === 0) {
      return [];
    }

    const zones = new Set<string>();
    assignedNeighborhoods.forEach(neighborhood => {
      const zone = this.getZoneByNeighborhood(neighborhood);
      if (zone) {
        zones.add(zone);
      }
    });

    return Array.from(zones);
  }

  /**
   * Agrupa usuários por zona baseado nos bairros atribuídos
   */
  static groupUsersByZone(users: Array<{
    id: string;
    name: string;
    assignedNeighborhoods: string[];
    [key: string]: any;
  }>): { [zone: string]: any[] } {
    const zoneGroups: { [zone: string]: any[] } = {};

    users.forEach(user => {
      const userZones = this.getUserZones(user.assignedNeighborhoods);
      
      if (userZones.length === 0) {
        // Usuário sem bairros atribuídos vai para "Sem Zona"
        if (!zoneGroups['Sem Zona']) {
          zoneGroups['Sem Zona'] = [];
        }
        zoneGroups['Sem Zona'].push(user);
      } else {
        // Usuário pode estar em múltiplas zonas
        userZones.forEach(zone => {
          if (!zoneGroups[zone]) {
            zoneGroups[zone] = [];
          }
          zoneGroups[zone].push(user);
        });
      }
    });

    return zoneGroups;
  }

  /**
   * Adiciona um novo mapeamento bairro → zona
   */
  static addNeighborhoodZoneMapping(neighborhood: string, zone: string): void {
    const existingIndex = NEIGHBORHOOD_ZONE_MAPPING.findIndex(
      item => item.neighborhood.toLowerCase() === neighborhood.toLowerCase()
    );

    if (existingIndex >= 0) {
      NEIGHBORHOOD_ZONE_MAPPING[existingIndex].zone = zone as any;
    } else {
      NEIGHBORHOOD_ZONE_MAPPING.push({ neighborhood, zone: zone as any });
    }
  }

  /**
   * Remove um mapeamento bairro → zona
   */
  static removeNeighborhoodZoneMapping(neighborhood: string): void {
    const index = NEIGHBORHOOD_ZONE_MAPPING.findIndex(
      item => item.neighborhood.toLowerCase() === neighborhood.toLowerCase()
    );

    if (index >= 0) {
      NEIGHBORHOOD_ZONE_MAPPING.splice(index, 1);
    }
  }

  /**
   * Obtém todos os mapeamentos
   */
  static getAllMappings(): ZoneMapping[] {
    return [...NEIGHBORHOOD_ZONE_MAPPING];
  }
}

