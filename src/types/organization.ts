export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'supervisor' | 'administrator' | 'super_admin';
  organizationId?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganization {
  id: string;
  name: string;
  fullName: string;
  state: string;
  department: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
  neighborhoods: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Propriedades adicionais para funcionalidades avançadas
  branding?: {
    colors: { primary: string; secondary: string };
    headerTitle: string;
    systemName: string;
    description: string;
  };
  contact?: {
    phone: string;
    email: string;
    address: string;
    website: string;
  };
  features?: {
    enableLIRAa: boolean;
    enableLaboratory: boolean;
    enablePredictiveAnalysis: boolean;
    customFields: string[];
  };
  healthMinistrySettings?: {
    region: string;
    coordinatorName: string;
    protocolVersion: string;
    reportingFrequency: string;
  };
  createdBy?: string;
}

export interface ICreateOrganizationRequest {
  name: string;
  fullName: string;
  state: string;
  department: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
  neighborhoods: string[];
}

export interface IUpdateOrganizationRequest {
  name?: string;
  fullName?: string;
  state?: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  neighborhoods?: string[];
  isActive?: boolean;
}