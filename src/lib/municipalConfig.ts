// Sistema de configuração municipal para múltiplas prefeituras

export interface MunicipalConfig {
  id: string;
  name: string;
  state: string;
  fullName: string;
  department: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    website?: string;
  };
  branding: {
    headerTitle: string;
    systemName: string;
    description: string;
  };
  features: {
    enableLIRAa: boolean;
    enableLaboratory: boolean;
    enablePredictiveAnalysis: boolean;
    customFields: string[];
  };
  neighborhoods: string[];
  // Configurações específicas do MS
  healthMinistrySettings: {
    region: string;
    coordinatorName: string;
    protocolVersion: string;
    reportingFrequency: 'weekly' | 'biweekly' | 'monthly';
  };
}

// Configurações predefinidas para diferentes municípios
const municipalConfigurations: Record<string, MunicipalConfig> = {
  'fazenda-rio-grande': {
    id: 'fazenda-rio-grande',
    name: 'Fazenda Rio Grande',
    state: 'PR',
    fullName: 'Prefeitura Municipal de Fazenda Rio Grande',
    department: 'Secretaria Municipal de Saúde',
    logo: undefined, // Será carregado da API/assets
    colors: {
      primary: '#0B4B3C',
      secondary: '#1E7A5F',
      accent: '#F4B942'
    },
    contact: {
      phone: '(41) 3699-7000',
      email: 'saude@fazendariogrande.pr.gov.br',
      address: 'Rua Iguaçu, 1470 - Centro',
      website: 'https://fazendariogrande.pr.gov.br'
    },
    branding: {
      headerTitle: 'Sistema de Vigilância Entomológica',
      systemName: 'EntomoVigilância FRG',
      description: 'Programa Municipal de Controle da Dengue'
    },
    features: {
      enableLIRAa: true,
      enableLaboratory: true,
      enablePredictiveAnalysis: true,
      customFields: ['Tipo de Imóvel', 'Responsável Local']
    },
    neighborhoods: [
      'Eucaliptos', 'Gralha Azul', 'Nações', 'Santa Terezinha', 'Iguaçu',
      'Pioneiros', 'São Miguel', 'Boa Vista', 'Brasília', 'Green Field',
      'Alvorada', 'Fortunato Perdoncini', 'Estados', 'Jardim Santarém',
      'Sete de Setembro', 'Veneza', 'Vila Rica', 'Águas Belas',
      'Canaã', 'Cidade Nova', 'Fátima', 'Florida', 'Maracaña',
      'Roma', 'São Carlos', 'São Francisco'
    ],
    healthMinistrySettings: {
      region: 'Região Metropolitana de Curitiba',
      coordinatorName: 'Dr. Carlos Mendes',
      protocolVersion: 'MS-PNCD-2024',
      reportingFrequency: 'weekly'
    }
  },
  
  'curitiba': {
    id: 'curitiba',
    name: 'Curitiba',
    state: 'PR',
    fullName: 'Prefeitura Municipal de Curitiba',
    department: 'Secretaria Municipal da Saúde',
    colors: {
      primary: '#1a5490',
      secondary: '#2980b9',
      accent: '#f39c12'
    },
    contact: {
      phone: '(41) 3350-9000',
      email: 'saude@curitiba.pr.gov.br',
      address: 'Av. Cândido de Abreu, 817 - Centro Cívico'
    },
    branding: {
      headerTitle: 'Vigilância Entomológica Curitiba',
      systemName: 'EntomoCWB',
      description: 'Controle Vetorial da Capital'
    },
    features: {
      enableLIRAa: true,
      enableLaboratory: true,
      enablePredictiveAnalysis: true,
      customFields: ['Regional de Saúde', 'Distrito Sanitário']
    },
    neighborhoods: [
      'Centro', 'Batel', 'Água Verde', 'Bacacheri', 'Bairro Alto',
      'Boa Vista', 'Cabral', 'Cajuru', 'Campo Comprido', 'Cristo Rei'
      // ... outros bairros de Curitiba
    ],
    healthMinistrySettings: {
      region: 'Região Metropolitana de Curitiba',
      coordinatorName: 'Dra. Maria Silva',
      protocolVersion: 'MS-PNCD-2024',
      reportingFrequency: 'weekly'
    }
  }
};

// Hook para obter configuração municipal
export function useMunicipalConfig(): MunicipalConfig {
  // Em produção, isso seria determinado por:
  // 1. Subdomínio (frg.entomo.gov.br)
  // 2. Parâmetro na URL
  // 3. Token de autenticação
  // 4. Configuração do servidor
  
  const municipalId = getMunicipalId();
  return municipalConfigurations[municipalId] || municipalConfigurations['fazenda-rio-grande'];
}

// Função para determinar o município (seria mais complexa em produção)
function getMunicipalId(): string {
  // Lógica para determinar o município baseado em:
  // - Subdomínio
  // - Parâmetro URL
  // - Local storage (para desenvolvimento)
  // - Token JWT
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlMunicipal = urlParams.get('municipal');
  
  if (urlMunicipal && municipalConfigurations[urlMunicipal]) {
    return urlMunicipal;
  }
  
  // Verificar localStorage para desenvolvimento
  const storedMunicipal = localStorage.getItem('municipal_config');
  if (storedMunicipal && municipalConfigurations[storedMunicipal]) {
    return storedMunicipal;
  }
  
  // Analisar subdomínio
  const hostname = window.location.hostname;
  if (hostname.includes('frg') || hostname.includes('fazenda')) {
    return 'fazenda-rio-grande';
  }
  if (hostname.includes('curitiba') || hostname.includes('cwb')) {
    return 'curitiba';
  }
  
  // Padrão: Fazenda Rio Grande
  return 'fazenda-rio-grande';
}

// Função para aplicar cores dinâmicas ao CSS
export function applyMunicipalTheme(config: MunicipalConfig) {
  const root = document.documentElement;
  
  // Converter hex para HSL para compatibilidade com Tailwind
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };
  
  const [h, s, l] = hexToHsl(config.colors.primary);
  root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
  
  const [h2, s2, l2] = hexToHsl(config.colors.secondary);
  root.style.setProperty('--secondary', `${h2} ${s2}% ${l2}%`);
  
  const [h3, s3, l3] = hexToHsl(config.colors.accent);
  root.style.setProperty('--accent', `${h3} ${s3}% ${l3}%`);
}

// Função para gerar relatórios personalizados por município
export function generateMunicipalReport(config: MunicipalConfig, data: any) {
  return {
    header: {
      title: config.branding.systemName,
      municipality: config.fullName,
      department: config.department,
      logo: config.logo,
      generatedAt: new Date().toISOString(),
      reportingPeriod: config.healthMinistrySettings.reportingFrequency
    },
    data,
    footer: {
      contact: config.contact,
      protocol: config.healthMinistrySettings.protocolVersion,
      coordinator: config.healthMinistrySettings.coordinatorName
    }
  };
}

// Lista de municípios disponíveis (para seleção administrativa)
export function getAvailableMunicipalities() {
  return Object.values(municipalConfigurations).map(config => ({
    id: config.id,
    name: config.name,
    state: config.state,
    fullName: config.fullName
  }));
}

// Função para desenvolvimento - trocar município
export function switchMunicipality(municipalId: string) {
  if (municipalConfigurations[municipalId]) {
    localStorage.setItem('municipal_config', municipalId);
    window.location.reload();
  }
}
