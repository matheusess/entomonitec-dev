/**
 * Serviço para gerenciar bairros por cidade
 */

// Dados mockados de bairros por cidade
const neighborhoodsByCity: Record<string, string[]> = {
  'curitiba': [
    'Centro', 'Batel', 'Bigorrilho', 'Água Verde', 'Cristo Rei',
    'Portão', 'Fazendinha', 'Capão Raso', 'Cidade Industrial',
    'Boa Vista', 'Alto da XV', 'Rebouças', 'Mercês', 'São Francisco',
    'Cabral', 'Bom Retiro', 'Juvevê', 'Vila Izabel', 'Prado Velho',
    'Jardim Botânico', 'Campo Comprido', 'Uberaba', 'Cajuru',
    'Tatuquara', 'Pinheirinho', 'Sítio Cercado', 'Bairro Novo',
    'Santa Felicidade', 'Mossunguê', 'Vista Alegre', 'Capão da Imbuia'
  ],
  'fazenda-rio-grande': [
    'Eucaliptos', 'Gralha Azul', 'Nações', 'Santa Terezinha', 'Iguaçu',
    'Centro', 'Jardim Veneza', 'Jardim Ipê', 'Pioneiros', 'São Miguel',
    'Boa Vista', 'Brasília', 'Green Field', 'Alvorada', 'Fortunato Perdoncini',
    'Estados', 'Jardim Santarém', 'Sete de Setembro', 'Veneza', 'Vila Rica',
    'Águas Belas', 'Jardim das Américas', 'Vila Nova', 'Residencial Norte'
  ],
  'são-paulo': [
    'Centro', 'Vila Madalena', 'Pinheiros', 'Itaim Bibi', 'Jardins',
    'Moema', 'Vila Olímpia', 'Brooklin', 'Santo André', 'Vila Prudente',
    'Tatuapé', 'Mooca', 'Brás', 'Liberdade', 'Bela Vista', 'Consolação',
    'Higienópolis', 'Perdizes', 'Lapa', 'Barra Funda', 'Vila Buarque',
    'República', 'Sé', 'Anhangabaú', 'Santa Cecília', 'Bom Retiro'
  ],
  'rio-de-janeiro': [
    'Centro', 'Copacabana', 'Ipanema', 'Leblon', 'Botafogo',
    'Flamengo', 'Laranjeiras', 'Catete', 'Glória', 'Santa Teresa',
    'Tijuca', 'Vila Isabel', 'Grajaú', 'Méier', 'Madureira',
    'Campo Grande', 'Santa Cruz', 'Jacarepaguá', 'Barra da Tijuca',
    'Recreio dos Bandeirantes', 'Zona Sul', 'Zona Norte', 'Zona Oeste'
  ]
};

export class NeighborhoodService {
  /**
   * Busca bairros por cidade
   */
  static getNeighborhoodsByCity(city: string): string[] {
    const normalizedCity = city.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/ç/g, 'c');

    return neighborhoodsByCity[normalizedCity] || [];
  }

  /**
   * Busca bairros por estado e cidade
   */
  static getNeighborhoodsByStateAndCity(state: string, city: string): string[] {
    // Para cidades específicas, usar o nome da cidade
    if (city.toLowerCase().includes('curitiba')) {
      return this.getNeighborhoodsByCity('curitiba');
    }
    if (city.toLowerCase().includes('fazenda') && city.toLowerCase().includes('rio')) {
      return this.getNeighborhoodsByCity('fazenda-rio-grande');
    }
    if (city.toLowerCase().includes('são paulo') || city.toLowerCase().includes('sao paulo')) {
      return this.getNeighborhoodsByCity('são-paulo');
    }
    if (city.toLowerCase().includes('rio de janeiro')) {
      return this.getNeighborhoodsByCity('rio-de-janeiro');
    }

    // Para outras cidades, retornar lista genérica baseada no estado
    return this.getGenericNeighborhoodsByState(state);
  }

  /**
   * Retorna bairros genéricos por estado
   */
  private static getGenericNeighborhoodsByState(state: string): string[] {
    const genericNeighborhoods: Record<string, string[]> = {
      'PR': [
        'Centro', 'Vila Nova', 'Jardim das Américas', 'Residencial Norte',
        'Setor Leste', 'Setor Oeste', 'Setor Sul', 'Setor Norte',
        'Industrial', 'Comercial', 'Residencial', 'Rural'
      ],
      'SP': [
        'Centro', 'Vila Nova', 'Jardim das Américas', 'Residencial Norte',
        'Setor Leste', 'Setor Oeste', 'Setor Sul', 'Setor Norte',
        'Industrial', 'Comercial', 'Residencial', 'Rural'
      ],
      'RJ': [
        'Centro', 'Vila Nova', 'Jardim das Américas', 'Residencial Norte',
        'Setor Leste', 'Setor Oeste', 'Setor Sul', 'Setor Norte',
        'Industrial', 'Comercial', 'Residencial', 'Rural'
      ],
      'MG': [
        'Centro', 'Vila Nova', 'Jardim das Américas', 'Residencial Norte',
        'Setor Leste', 'Setor Oeste', 'Setor Sul', 'Setor Norte',
        'Industrial', 'Comercial', 'Residencial', 'Rural'
      ]
    };

    return genericNeighborhoods[state] || [
      'Centro', 'Vila Nova', 'Jardim das Américas', 'Residencial Norte',
      'Setor Leste', 'Setor Oeste', 'Setor Sul', 'Setor Norte',
      'Industrial', 'Comercial', 'Residencial', 'Rural'
    ];
  }

  /**
   * Valida se um bairro existe na cidade
   */
  static isValidNeighborhood(city: string, neighborhood: string): boolean {
    const neighborhoods = this.getNeighborhoodsByCity(city);
    return neighborhoods.includes(neighborhood);
  }

  /**
   * Adiciona um novo bairro (para futuras expansões)
   */
  static addNeighborhood(city: string, neighborhood: string): void {
    const normalizedCity = city.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/ç/g, 'c');

    if (!neighborhoodsByCity[normalizedCity]) {
      neighborhoodsByCity[normalizedCity] = [];
    }

    if (!neighborhoodsByCity[normalizedCity].includes(neighborhood)) {
      neighborhoodsByCity[normalizedCity].push(neighborhood);
    }
  }
}




