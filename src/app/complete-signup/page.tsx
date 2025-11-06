'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
// Imports do Firestore removidos - agora usando UserService
import { auth, db } from '@/lib/firebase';
import { UserInviteService, IUserInvite } from '@/services/userInviteService';
import { UserService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Eye, EyeOff, Building2, User, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/logger';

function CompleteSignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [invite, setInvite] = useState<IUserInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setLoading(false);
      return;
    }

    loadInvite(token);
  }, [searchParams]);

  const loadInvite = async (token: string) => {
    try {
      const inviteData = await UserInviteService.getInviteByToken(token);
      setInvite(inviteData);
    } catch (error) {
      logger.error('Erro ao carregar convite:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !invite) return;

    setSubmitting(true);
    
    try {
      logger.log('🎯 Completando cadastro para:', invite.email);

      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        invite.email, 
        formData.password
      );
      const firebaseUser = userCredential.user;
      
      logger.log('✅ Usuário criado no Auth:', firebaseUser.uid);

      // 2. Criar documento no Firestore usando o método seguro
      await UserService.createUserFromInvite(firebaseUser.uid, {
        name: invite.name,
        email: invite.email,
        role: invite.role,
        organizationId: invite.organizationId,
        createdBy: invite.invitedBy
      });
      logger.log('✅ Documento de usuário criado no Firestore');

      // 3. Marcar convite como aceito
      if (invite.id) {
        await UserInviteService.markAsAccepted(invite.id);
        logger.log('✅ Convite marcado como aceito');
      }

      // 4. Sucesso - redirecionar para dashboard
      toast({
        title: "Cadastro concluído com sucesso!",
        description: `Bem-vindo(a) à ${invite.organizationName}!`,
        variant: "default"
      });

      // Redirecionar após um breve delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      logger.error('❌ Erro ao completar cadastro:', error);
      
      let errorMessage = 'Erro ao completar cadastro';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já possui uma conta. Faça login normalmente.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      }

      toast({
        title: "Erro ao completar cadastro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Função getDefaultPermissions removida - agora é tratada pelo UserService

  const getRoleInfo = (role: string) => {
    const roles = {
      'administrator': {
        name: 'Administrador',
        description: 'Acesso completo ao sistema',
        icon: Shield,
        color: 'text-red-600'
      },
      'supervisor': {
        name: 'Supervisor',
        description: 'Supervisão de atividades e relatórios',
        icon: User,
        color: 'text-blue-600'
      },
      'agent': {
        name: 'Agente de Campo',
        description: 'Registro de visitas e coletas',
        icon: User,
        color: 'text-green-600'
      }
    };
    return roles[role as keyof typeof roles] || roles.agent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Verificando convite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Convite Inválido
              </h2>
              <p className="text-gray-600 mb-4">
                Este convite não é válido, pode ter expirado ou já foi utilizado.
              </p>
              <Button onClick={() => router.push('/login')} variant="outline">
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleInfo = getRoleInfo(invite.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete seu Cadastro</CardTitle>
          <CardDescription>
            Você foi convidado para fazer parte do Sistema de Vigilância Entomológica
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações do Convite */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">{invite.organizationName}</p>
                <p className="text-sm text-gray-600">Organização</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">{invite.email}</p>
                <p className="text-sm text-gray-600">Seu email</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <RoleIcon className={`h-5 w-5 ${roleInfo.color}`} />
              <div>
                <p className="font-medium">{roleInfo.name}</p>
                <p className="text-sm text-gray-600">{roleInfo.description}</p>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Convidado por <strong>{invite.invitedByName}</strong> em{' '}
              {invite.createdAt.toLocaleDateString('pt-BR')}
            </AlertDescription>
          </Alert>

          {/* Formulário de Senha */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Defina sua Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirme sua Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Digite a senha novamente"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completando Cadastro...
                </>
              ) : (
                'Completar Cadastro'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>Ao completar o cadastro, você aceita fazer parte da organização</p>
            <p className="font-medium">{invite.organizationName}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompleteSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <CompleteSignupPageContent />
    </Suspense>
  );
}
