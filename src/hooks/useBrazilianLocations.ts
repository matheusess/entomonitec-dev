'use client';

import { useState, useEffect } from 'react';

interface Estado {
  id?: number;
  sigla?: string;
  nome?: string;
  // Campos da API Brasil Aberto
  name?: string;
  shortName?: string;
  region?: string;
}

interface Cidade {
  id: number;
  nome?: string;
  // Campos da API Brasil Aberto
  name?: string;
}

interface Bairro {
  id: number;
  nome?: string;
  // Campos da API Brasil Aberto
  name?: string;
}

export function useBrazilianLocations() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [isLoadingEstados, setIsLoadingEstados] = useState(false);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [isLoadingBairros, setIsLoadingBairros] = useState(false);

  // Função para normalizar dados de estado da API Brasil Aberto
  const normalizeEstadoBrasilAberto = (estado: any): Estado => ({
    id: estado.id || Math.random(), // Gera ID se não tiver
    nome: estado.name,
    sigla: estado.shortName,
    region: estado.region
  });

  // Função para normalizar dados de cidade da API Brasil Aberto
  const normalizeCidadeBrasilAberto = (cidade: any): Cidade => ({
    id: cidade.id,
    nome: cidade.name
  });

  // Função para normalizar dados de bairro da API Brasil Aberto
  const normalizeBairroBrasilAberto = (bairro: any): Bairro => ({
    id: bairro.id,
    nome: bairro.name
  });

    // Carregar estados na inicialização
  useEffect(() => {
    const fetchEstados = async () => {
      setIsLoadingEstados(true);
      try {
        // Primeiro tenta Brasil Aberto, se falhar usa IBGE como fallback
        const API_KEY = process.env.NEXT_PUBLIC_API_LOCALIDADES;
        console.log('🔑 Tentando API Brasil Aberto...');
        
        let response = await fetch('https://api.brasilaberto.com/v1/states', {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Brasil Aberto failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Estados carregados da API Brasil Aberto:', data.result.length);
        // Normalizar e ordenar estados em ordem alfabética
        const estadosNormalizados = data.result.map(normalizeEstadoBrasilAberto);
        const estadosOrdenados = estadosNormalizados.sort((a: Estado, b: Estado) => 
          (a.nome || '').localeCompare(b.nome || '')
        );
        setEstados(estadosOrdenados);
      } catch (brasilAbertoError) {
        console.warn('⚠️ Brasil Aberto falhou, tentando IBGE...', brasilAbertoError);
        
        try {
          // Fallback para IBGE
          const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
          
          if (!response.ok) {
            throw new Error(`IBGE failed: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('✅ Estados carregados da API IBGE (fallback):', data.length);
          // Ordenar estados em ordem alfabética
          const estadosOrdenados = data.sort((a: Estado, b: Estado) => a.nome.localeCompare(b.nome));
          setEstados(estadosOrdenados);
        } catch (ibgeError) {
          console.error('❌ Ambas APIs falharam:', ibgeError);
          // Fallback final com TODOS os estados brasileiros em ordem alfabética
          setEstados([
            { id: 12, sigla: 'AC', nome: 'Acre' },
            { id: 27, sigla: 'AL', nome: 'Alagoas' },
            { id: 16, sigla: 'AP', nome: 'Amapá' },
            { id: 13, sigla: 'AM', nome: 'Amazonas' },
            { id: 29, sigla: 'BA', nome: 'Bahia' },
            { id: 23, sigla: 'CE', nome: 'Ceará' },
            { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
            { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
            { id: 52, sigla: 'GO', nome: 'Goiás' },
            { id: 21, sigla: 'MA', nome: 'Maranhão' },
            { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
            { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
            { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
            { id: 15, sigla: 'PA', nome: 'Pará' },
            { id: 25, sigla: 'PB', nome: 'Paraíba' },
            { id: 41, sigla: 'PR', nome: 'Paraná' },
            { id: 26, sigla: 'PE', nome: 'Pernambuco' },
            { id: 22, sigla: 'PI', nome: 'Piauí' },
            { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
            { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
            { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
            { id: 11, sigla: 'RO', nome: 'Rondônia' },
            { id: 14, sigla: 'RR', nome: 'Roraima' },
            { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
            { id: 35, sigla: 'SP', nome: 'São Paulo' },
            { id: 28, sigla: 'SE', nome: 'Sergipe' },
            { id: 17, sigla: 'TO', nome: 'Tocantins' }
          ]);
        }
      } finally {
        setIsLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

    // Buscar cidades por estado com fallback IBGE
  const fetchCidadesByEstado = async (estadoSigla: string) => {
    if (!estadoSigla) {
      setCidades([]);
      return;
    }

    setIsLoadingCidades(true);
    try {
      // Primeiro tenta Brasil Aberto
      const API_KEY = process.env.NEXT_PUBLIC_API_LOCALIDADES;
      let response = await fetch(
        `https://api.brasilaberto.com/v1/cities/${estadoSigla}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Brasil Aberto failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Cidades carregadas do Brasil Aberto para ${estadoSigla}:`, data.result.length);
      // Normalizar e ordenar cidades em ordem alfabética
      const cidadesNormalizadas = data.result.map(normalizeCidadeBrasilAberto);
      const cidadesOrdenadas = cidadesNormalizadas.sort((a: Cidade, b: Cidade) => 
        (a.nome || '').localeCompare(b.nome || '')
      );
      setCidades(cidadesOrdenadas);
    } catch (brasilAbertoError) {
      console.warn(`⚠️ Brasil Aberto falhou para cidades, tentando IBGE...`, brasilAbertoError);
      
      try {
        // Fallback para IBGE
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios?orderBy=nome`
        );

        if (!response.ok) {
          throw new Error(`IBGE failed: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Cidades carregadas do IBGE (fallback) para ${estadoSigla}:`, data.length);
        // Ordenar cidades em ordem alfabética
        const cidadesOrdenadas = data.sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome));
        setCidades(cidadesOrdenadas);
      } catch (ibgeError) {
        console.error('❌ Ambas APIs falharam para cidades:', ibgeError);
        setCidades([]);
      }
    } finally {
      setIsLoadingCidades(false);
    }
  };

    // Buscar bairros por cidade com fallback para bairros comuns
  const fetchBairrosByCidade = async (cidadeId: number) => {
    if (!cidadeId) {
      setBairros([]);
      return;
    }

    setIsLoadingBairros(true);
    try {
      // Primeiro tenta Brasil Aberto
      const API_KEY = process.env.NEXT_PUBLIC_API_LOCALIDADES;
      let response = await fetch(
        `https://api.brasilaberto.com/v1/districts/${cidadeId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Brasil Aberto failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Bairros carregados do Brasil Aberto para cidade ${cidadeId}:`, data.result.length);
      // Normalizar e ordenar bairros em ordem alfabética
      const bairrosNormalizados = data.result.map(normalizeBairroBrasilAberto);
      const bairrosOrdenados = bairrosNormalizados.sort((a: Bairro, b: Bairro) => 
        (a.nome || '').localeCompare(b.nome || '')
      );
      setBairros(bairrosOrdenados);
    } catch (brasilAbertoError) {
      console.warn(`⚠️ Brasil Aberto falhou para bairros, usando bairros comuns...`, brasilAbertoError);
      
      // Fallback para bairros comuns baseado na cidade selecionada
      const cidadeSelecionada = cidades.find(c => c.id === cidadeId);
      if (cidadeSelecionada) {
        const bairrosComuns = getBairrosComuns(cidadeSelecionada.nome);
        console.log(`✅ Bairros comuns carregados para ${cidadeSelecionada.nome}:`, bairrosComuns.length);
        // Ordenar bairros em ordem alfabética
        const bairrosOrdenados = bairrosComuns.sort((a, b) => a.localeCompare(b));
        setBairros(bairrosOrdenados.map((nome, index) => ({ id: index + 1, nome })));
      } else {
        console.log('🔄 Carregando bairros genéricos...');
        setBairros([
          { id: 1, nome: 'Centro' },
          { id: 2, nome: 'Zona Norte' },
          { id: 3, nome: 'Zona Sul' },
          { id: 4, nome: 'Zona Leste' },
          { id: 5, nome: 'Zona Oeste' }
        ]);
      }
    } finally {
      setIsLoadingBairros(false);
    }
  };

  // Função para obter bairros comuns por cidade
  const getBairrosComuns = (cidadeNome: string): string[] => {
    const bairrosComuns: Record<string, string[]> = {
      'São Paulo': ['Centro', 'Vila Madalena', 'Pinheiros', 'Itaim Bibi', 'Moema', 'Jardins', 'Liberdade', 'Bela Vista', 'Vila Olímpia', 'Brooklin'],
      'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Leblon', 'Centro', 'Botafogo', 'Flamengo', 'Tijuca', 'Barra da Tijuca', 'Recreio', 'Jacarepaguá'],
      'Belo Horizonte': ['Centro', 'Savassi', 'Funcionários', 'Lourdes', 'Belvedere', 'Buritis', 'Pampulha', 'Cidade Nova', 'Santa Efigênia'],
      'Curitiba': ['Centro', 'Batel', 'Água Verde', 'Bigorrilho', 'Portão', 'Santa Felicidade', 'Jardim Botânico', 'Mercês', 'Alto da Glória'],
      'Porto Alegre': ['Centro', 'Moinhos de Vento', 'Auxiliadora', 'Rio Branco', 'Cidade Baixa', 'Floresta', 'Santana', 'Petrópolis'],
      'Salvador': ['Centro', 'Pelourinho', 'Barra', 'Ondina', 'Rio Vermelho', 'Pituba', 'Itaigara', 'Caminho das Árvores', 'Federação'],
      'Fortaleza': ['Centro', 'Aldeota', 'Meireles', 'Iracema', 'Cocó', 'Papicu', 'Varjota', 'Dionísio Torres', 'Fátima'],
      'Recife': ['Centro', 'Boa Viagem', 'Pina', 'Espinheiro', 'Graças', 'Casa Forte', 'Apipucos', 'Parnamirim', 'Aflitos'],
      'Brasília': ['Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Octogonal', 'Cruzeiro', 'Guará', 'Águas Claras'],
      'Goiânia': ['Centro', 'Setor Oeste', 'Setor Sul', 'Jardim Goiás', 'Setor Bueno', 'Nova Suíça', 'Setor Marista', 'Vila Nova'],
      'Fazenda Rio Grande': ['Eucaliptos', 'Gralha Azul', 'Nações', 'Santa Terezinha', 'Iguaçu', 'Estados', 'Pioneiros', 'Green Field']
    };

    return bairrosComuns[cidadeNome] || ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste'];
  };



  return {
    estados,
    cidades,
    bairros,
    isLoadingEstados,
    isLoadingCidades,
    isLoadingBairros,
    fetchCidadesByEstado,
    fetchBairrosByCidade,
  };
}
