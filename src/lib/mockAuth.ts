import { UserRole, User } from '@/components/AuthContext';
import { IOrganization } from '@/types/organization';

interface MockUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Only for mock
  role: UserRole;
  organizationId: string;
  permissions: string[];
  isSuperAdmin?: boolean;
}

export const mockOrganizations: IOrganization[] = [
  {
    id: 'fazenda-rio-grande-pr',
    name: 'Fazenda Rio Grande',
    fullName: 'Prefeitura Municipal de Fazenda Rio Grande',
    state: 'PR',
    department: 'Secretaria Municipal de Saúde',
    branding: {
      colors: { primary: '#0B4B3C', secondary: '#1E7A5F' },
      headerTitle: 'Sistema de Vigilância Entomológica',
      systemName: 'EntomoVigilância FRG',
      description: 'Programa Municipal de Controle da Dengue',
    },
    contact: {
      phone: '(41) 3699-7000',
      email: 'saude@fazendariogrande.pr.gov.br',
      address: 'Rua Iguaçu, 1470 - Centro',
      website: 'https://fazendariogrande.pr.gov.br',
    },
    features: {
      enableLIRAa: true,
      enableLaboratory: true,
      enablePredictiveAnalysis: true,
      customFields: ['Tipo de Imóvel', 'Responsável Local'],
    },
    neighborhoods: ['Eucaliptos', 'Gralha Azul', 'Nações', 'Santa Terezinha', 'Iguaçu', 'Estados'],
    healthMinistrySettings: {
      region: 'Região Metropolitana de Curitiba',
      coordinatorName: 'Dr. Carlos Mendes',
      protocolVersion: 'MS-PNCD-2024',
      reportingFrequency: 'weekly',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'curitiba-pr',
    name: 'Curitiba',
    fullName: 'Prefeitura Municipal de Curitiba',
    state: 'PR',
    department: 'Secretaria Municipal da Saúde',
    branding: {
      colors: { primary: '#1a5490', secondary: '#2980b9' },
      headerTitle: 'Sistema de Vigilância Entomológica',
      systemName: 'EntomoVigilância CWB',
      description: 'Programa Municipal de Controle da Dengue',
    },
    contact: {
      phone: '(41) 3350-9400',
      email: 'saude@curitiba.pr.gov.br',
      address: 'Rua Francisco Torres, 830 - Centro',
      website: 'https://saude.curitiba.pr.gov.br',
    },
    features: {
      enableLIRAa: true,
      enableLaboratory: false,
      enablePredictiveAnalysis: false,
      customFields: [],
    },
    neighborhoods: ['Centro', 'Batel', 'Água Verde', 'Bigorrilho', 'Cabral'],
    healthMinistrySettings: {
      region: 'Região Metropolitana de Curitiba',
      coordinatorName: 'Dra. Ana Paula',
      protocolVersion: 'MS-PNCD-2024',
      reportingFrequency: 'monthly',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
];

export const mockUsers: Record<string, MockUser> = {
  'admin@entomonitec.com': {
    id: 'super-admin-1',
    name: 'Super Admin',
    email: 'admin@entomonitec.com',
    password: '123456',
    role: 'super_admin',
    organizationId: '', // Super admin não tem org específica
    permissions: ['*'],
    isSuperAdmin: true,
  },
  'admin@frg.gov.br': {
    id: 'admin-frg-1',
    name: 'Admin FRG',
    email: 'admin@frg.gov.br',
    password: '123456',
    role: 'administrator',
    organizationId: 'fazenda-rio-grande-pr',
    permissions: ['users:manage', 'org:manage', 'reports:view'],
  },
  'supervisor@frg.gov.br': {
    id: 'supervisor-frg-1',
    name: 'Supervisor FRG',
    email: 'supervisor@frg.gov.br',
    password: '123456',
    role: 'supervisor',
    organizationId: 'fazenda-rio-grande-pr',
    permissions: ['visits:view', 'collections:view', 'reports:view'],
  },
  'agent@frg.gov.br': {
    id: 'agent-frg-1',
    name: 'Agente FRG',
    email: 'agent@frg.gov.br',
    password: '123456',
    role: 'agent',
    organizationId: 'fazenda-rio-grande-pr',
    permissions: ['visits:create', 'visits:view_own', 'collections:create', 'collections:view_own'],
  },
  'admin@curitiba.pr.gov.br': {
    id: 'admin-cwb-1',
    name: 'Admin CWB',
    email: 'admin@curitiba.pr.gov.br',
    password: '123456',
    role: 'administrator',
    organizationId: 'curitiba-pr',
    permissions: ['users:manage', 'org:manage', 'reports:view'],
  },
  'agent@curitiba.pr.gov.br': {
    id: 'agent-cwb-1',
    name: 'Agente CWB',
    email: 'agent@curitiba.pr.gov.br',
    password: '123456',
    role: 'agent',
    organizationId: 'curitiba-pr',
    permissions: ['visits:create', 'visits:view_own', 'collections:create', 'collections:view_own'],
  },
};

export const isSuperAdminEmail = (email: string) => email.endsWith(process.env.NEXT_PUBLIC_SUPER_ADMIN_DOMAIN || '@entomonitec.com');

export const getOrganizationById = (id: string) => mockOrganizations.find(org => org.id === id);

// Função para converter MockUser para User do AuthContext
export const mockUserToUser = (mockUser: MockUser): User => {
  const organization = getOrganizationById(mockUser.organizationId);
  
  return {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    role: mockUser.role,
    organizationId: mockUser.organizationId,
    organization: organization,
    permissions: mockUser.permissions,
    isSuperAdmin: mockUser.isSuperAdmin || false,
  };
};

// Mock data para o Dashboard
export const mockDashboardData = {
  totalVisits: 1247,
  routineVisits: 892,
  liraaVisits: 355,
  criticalAreas: 23,
  agentsActive: 12,
  larvaePositive: 89,
  neighborhoods: [
    { name: 'Santa Terezinha', risk: 'high', visits: 156, positives: 23, breteau: 8.2 },
    { name: 'Eucaliptos', risk: 'medium', visits: 142, positives: 12, breteau: 4.1 },
    { name: 'Gralha Azul', risk: 'low', visits: 134, positives: 8, breteau: 2.3 },
    { name: 'Nações', risk: 'medium', visits: 128, positives: 15, breteau: 5.7 },
    { name: 'Iguaçu', risk: 'high', visits: 98, positives: 18, breteau: 7.9 },
    { name: 'Estados', risk: 'low', visits: 89, positives: 6, breteau: 1.8 },
  ],
  agents: [
    { id: '1', name: 'Carlos Silva', active: true, visits: 45, efficiency: 92 },
    { id: '2', name: 'Maria Santos', active: true, visits: 38, efficiency: 88 },
    { id: '3', name: 'João Oliveira', active: true, visits: 42, efficiency: 90 },
    { id: '4', name: 'Ana Costa', active: false, visits: 0, efficiency: 0 },
  ],
  recentVisits: [
    {
      id: '1',
      date: '2024-01-15T10:30:00Z',
      agent: 'Carlos Silva',
      neighborhood: 'Santa Terezinha',
      address: 'Rua das Flores, 123',
      type: 'liraa',
      result: 'positive'
    },
    {
      id: '2', 
      date: '2024-01-15T09:15:00Z',
      agent: 'Maria Santos',
      neighborhood: 'Eucaliptos',
      address: 'Av. Central, 456',
      type: 'routine',
      result: 'negative'
    },
  ],
  trends: {
    weekly: [
      { period: 'Sem 1', visits: 89, positives: 12 },
      { period: 'Sem 2', visits: 94, positives: 15 },
      { period: 'Sem 3', visits: 87, positives: 9 },
      { period: 'Sem 4', visits: 102, positives: 18 },
    ],
    monthly: [
      { period: 'Jan', visits: 372, positives: 54 },
      { period: 'Fev', visits: 398, positives: 62 },
      { period: 'Mar', visits: 445, positives: 71 },
      { period: 'Abr', visits: 423, positives: 68 },
    ]
  }
};
