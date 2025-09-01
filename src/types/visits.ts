export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
  timestamp: Date;
}

export interface BreedingSite {
  id: string;
  visitaId: string;
  tipoRecipiente: string;
  presencaLarvas: boolean;
  quantidadeLarvas?: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitFormBase {
  id: string;
  type: 'routine' | 'liraa';
  timestamp: Date;
  location: LocationData | null;
  neighborhood: string;
  agentName: string;
  agentId: string;
  userId: string; // Campo necessário para as regras do Firebase
  organizationId: string;
  observations: string;
  photos: string[];
  status: 'completed' | 'refused' | 'closed';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  firebaseId?: string;
  syncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineVisitForm extends VisitFormBase {
  type: 'routine';
  breedingSites: {
    waterReservoir: boolean;
    tires: boolean;
    bottles: boolean;
    cans: boolean;
    buckets: boolean;
    plantPots: boolean;
    gutters: boolean;
    pools: boolean;
    wells: boolean;
    tanks: boolean;
    drains: boolean;
    others: string;
  };
  larvaeFound: boolean;
  pupaeFound: boolean;
  controlMeasures: string[];
  calculatedRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface LIRAAVisitForm extends VisitFormBase {
  type: 'liraa';
  propertyType: 'residential' | 'commercial' | 'institutional' | 'vacant';
  inspected: boolean;
  refused: boolean;
  closed: boolean;
  containers: {
    a1: number; // Reservatórios de água
    a2: number; // Depósitos móveis
    b: number;  // Depósitos fixos
    c: number;  // Passíveis de remoção
    d1: number; // Pneus
    d2: number; // Lixo
    e: number;  // Naturais
  };
  positiveContainers: {
    a1: number;
    a2: number;
    b: number;
    c: number;
    d1: number;
    d2: number;
    e: number;
  };
  larvaeSpecies: string[];
  treatmentApplied: boolean;
  eliminationAction: boolean;
  liraaIndex?: number; // Índice calculado para o LIRAa
}

export type VisitForm = RoutineVisitForm | LIRAAVisitForm;

// Interfaces para criação de visitas
export interface CreateRoutineVisitRequest {
  neighborhood: string;
  location: LocationData;
  observations: string;
  photos: string[];
  breedingSites: {
    waterReservoir: boolean;
    tires: boolean;
    bottles: boolean;
    cans: boolean;
    buckets: boolean;
    plantPots: boolean;
    gutters: boolean;
    pools: boolean;
    wells: boolean;
    tanks: boolean;
    drains: boolean;
    others: string;
  };
  larvaeFound: boolean;
  pupaeFound: boolean;
  controlMeasures: string[];
}

export interface CreateLIRAAVisitRequest {
  neighborhood: string;
  location: LocationData;
  observations: string;
  photos: string[];
  propertyType: 'residential' | 'commercial' | 'institutional' | 'vacant';
  inspected: boolean;
  refused: boolean;
  closed: boolean;
  containers: {
    a1: number;
    a2: number;
    b: number;
    c: number;
    d1: number;
    d2: number;
    e: number;
  };
  positiveContainers: {
    a1: number;
    a2: number;
    b: number;
    c: number;
    d1: number;
    d2: number;
    e: number;
  };
  larvaeSpecies: string[];
  treatmentApplied: boolean;
  eliminationAction: boolean;
}

// Interfaces para atualização
export interface UpdateVisitRequest {
  observations?: string;
  status?: 'completed' | 'refused' | 'closed';
  photos?: string[];
}

// Interfaces para respostas da API
export interface VisitResponse {
  success: boolean;
  data?: VisitForm;
  message?: string;
  error?: string;
}

export interface VisitsListResponse {
  success: boolean;
  data?: VisitForm[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}
