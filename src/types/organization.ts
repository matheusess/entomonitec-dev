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