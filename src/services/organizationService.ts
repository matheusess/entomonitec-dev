import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';

export interface IOrganization {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  fullName: string;
  state: string;
  city: string;
  department: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationData {
  name: string;
  fullName: string;
  state: string;
  city: string;
  department: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
}

export class OrganizationService {
  private static readonly COLLECTION_NAME = 'organizations';

  /**
   * Verifica se usuário é super admin baseado no email
   */
  static isSuperAdmin(email: string): boolean {
    const superAdminDomains = [
      'entomonitec.com.br', // Domínio principal
      'entomonitec.com',    // Domínio alternativo
      process.env.NEXT_PUBLIC_SUPER_ADMIN_DOMAIN || 'entomonitec.com.br'
    ];
    return superAdminDomains.some(domain => email.endsWith(`@${domain}`));
  }

  /**
   * Cria uma nova organização
   */
  static async createOrganization(data: CreateOrganizationData): Promise<IOrganization> {
    try {
      console.log('🏢 Criando organização no Firebase:', data);

      // Gerar slug único
      const slug = await this.generateUniqueSlug(data.name);

      const organizationData = {
        ...data,
        slug,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), organizationData);
      
      console.log('✅ Organização criada com ID e slug:', docRef.id, slug);

      return {
        id: docRef.id,
        ...data,
        slug,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Erro ao criar organização:', error);
      throw new Error('Falha ao criar organização');
    }
  }

  /**
   * Gera slug amigável a partir do nome
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Gera slug único verificando se já existe
   */
  static async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = this.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Verificar se slug já existe
    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Verifica se slug já existe
   */
  private static async slugExists(slug: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ Erro ao verificar slug:', error);
      return false;
    }
  }

  /**
   * Busca organização por slug
   */
  static async getOrganizationBySlug(slug: string): Promise<IOrganization | null> {
    try {
      console.log('🔍 Buscando organização por slug:', slug);
      
      // Busca direta por slug (mais eficiente)
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Fallback: buscar por slug gerado dinamicamente (organizações antigas)
        console.log('🔄 Slug não encontrado, tentando busca por nome...');
        return await this.getOrganizationBySlugFallback(slug);
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        slug: data.slug || this.generateSlug(data.name),
        fullName: data.fullName,
        state: data.state,
        city: data.city,
        department: data.department,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar organização por slug:', error);
      return null;
    }
  }

  /**
   * Busca por slug gerado dinamicamente (fallback para organizações antigas)
   */
  private static async getOrganizationBySlugFallback(slug: string): Promise<IOrganization | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const generatedSlug = this.generateSlug(data.name);
        
        if (generatedSlug === slug) {
          // Aproveitar para salvar o slug na organização
          await this.updateOrganizationSlug(doc.id, generatedSlug);
          
          return {
            id: doc.id,
            name: data.name,
            slug: generatedSlug,
            fullName: data.fullName,
            state: data.state,
            city: data.city,
            department: data.department,
            email: data.email,
            phone: data.phone,
            address: data.address,
            website: data.website,
            isActive: data.isActive ?? true,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro no fallback de busca por slug:', error);
      return null;
    }
  }

  /**
   * Atualiza slug de organização existente
   */
  private static async updateOrganizationSlug(orgId: string, slug: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, orgId), {
        slug,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Slug atualizado para organização:', orgId, slug);
    } catch (error) {
      console.error('❌ Erro ao atualizar slug:', error);
    }
  }

  /**
   * Lista todas as organizações
   */
  static async listOrganizations(): Promise<IOrganization[]> {
    try {
      console.log('📋 Buscando organizações...');
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const organizations: IOrganization[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        organizations.push({
          id: doc.id,
          name: data.name,
          slug: data.slug || this.generateSlug(data.name), // Gerar se não existir
          fullName: data.fullName,
          state: data.state,
          city: data.city,
          department: data.department,
          phone: data.phone,
          email: data.email,
          address: data.address,
          website: data.website,
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });

      console.log('✅ Organizações carregadas:', organizations.length);
      return organizations;
    } catch (error) {
      console.error('❌ Erro ao listar organizações:', error);
      throw new Error('Falha ao carregar organizações');
    }
  }

  /**
   * Busca uma organização por ID
   */
  static async getOrganization(id: string): Promise<IOrganization | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        fullName: data.fullName,
        state: data.state,
        city: data.city,
        department: data.department,
        phone: data.phone,
        email: data.email,
        address: data.address,
        website: data.website,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        slug: data.slug || this.generateSlug(data.name)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar organização:', error);
      return null;
    }
  }

  /**
   * Atualiza uma organização
   */
  static async updateOrganization(id: string, data: Partial<CreateOrganizationData>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Organização atualizada:', id);
    } catch (error) {
      console.error('❌ Erro ao atualizar organização:', error);
      throw new Error('Falha ao atualizar organização');
    }
  }

  /**
   * Desativa uma organização (soft delete)
   */
  static async deactivateOrganization(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Organização desativada:', id);
    } catch (error) {
      console.error('❌ Erro ao desativar organização:', error);
      throw new Error('Falha ao desativar organização');
    }
  }

  /**
   * Remove uma organização permanentemente
   */
  static async deleteOrganization(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      console.log('✅ Organização removida:', id);
    } catch (error) {
      console.error('❌ Erro ao remover organização:', error);
      throw new Error('Falha ao remover organização');
    }
  }
}