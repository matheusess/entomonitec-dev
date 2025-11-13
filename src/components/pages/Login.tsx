import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Bug, MapPin, Shield, User, Lock, Globe } from 'lucide-react';
import logger from '@/lib/logger';

export default function Login() {
  const { user, login, isLoading, isAuthenticating } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(email, password);
    if (!success) {
      setError('Email ou senha inválidos. Tente novamente.');
    }
    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail antes de solicitar a recuperação de senha.');
      return;
    }

    try {
      logger.log('🔄 Iniciando solicitação de reset de senha para:', email);
      
      // Obter URL da aplicação para redirecionamento após reset
      const actionCodeSettings = {
        url: `${window.location.origin}/login?resetPassword=true`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      logger.log('✅ Email de reset enviado com sucesso para:', email);
      
      // Toast de sucesso
      toast({
        variant: 'success',
        title: '📧 E-mail enviado!',
        description: `Instruções para redefinir sua senha foram enviadas para ${email}. Verifique sua caixa de entrada e spam.`,
        duration: 8000,
      });
      
      // Limpar erro se houver
      setError('');
      
    } catch (error: any) {
      logger.error('❌ Erro ao enviar email de recuperação:', error);
      logger.error('❌ Código do erro:', error.code);
      logger.error('❌ Mensagem do erro:', error.message);
      
      let errorMessage = 'Erro ao enviar e-mail de recuperação. Tente novamente.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'E-mail não encontrado. Verifique o endereço informado.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido. Verifique o formato do e-mail.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
          break;
        case 'auth/invalid-continue-uri':
          errorMessage = 'URL de redirecionamento inválida. Contate o suporte.';
          break;
        case 'auth/unauthorized-continue-uri':
          errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
          break;
        default:
          errorMessage = `Erro: ${error.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`;
      }
      
      toast({
        variant: 'destructive',
        title: '❌ Erro no envio',
        description: errorMessage,
        duration: 6000,
      });
    }
  };

  if (isLoading || isAuthenticating) {
    return (
      <LoadingScreen 
        message={isAuthenticating ? 'Carregando seus dados...' : 'Verificando autenticação...'}
        submessage={isAuthenticating ? 'Preparando sua área de trabalho' : 'Validando credenciais'}
      />
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Informações institucionais */}
      <div className="hidden lg:flex lg:w-1/2 institutional-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo/Brasão placeholder */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Sistema de Vigilância Entomológica</h1>
            <p className="text-xl text-white/90 mb-6">Brasil</p>
            <p className="text-white/80 leading-relaxed">
              Plataforma integrada para monitoramento e controle vetorial conforme diretrizes 
              do Ministério da Saúde do Brasil.
            </p>
          </div>

          {/* Recursos principais */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-white/80" />
              <span className="text-white/90">Geolocalização automática de visitas</span>
            </div>
            <div className="flex items-center space-x-3">
              <Bug className="h-5 w-5 text-white/80" />
              <span className="text-white/90">Análise entomológica em tempo real</span>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-white/80" />
              <span className="text-white/90">Diagnósticos automáticos por bairro</span>
            </div>
          </div>

          {/* Rodapé institucional */}
          <div className="absolute bottom-8 left-12 right-12">
            <div className="border-t border-white/20 pt-6">
              <p className="text-sm text-white/70">
                Secretaria Municipal de Saúde • Versão 2.1.1+a
              </p>
              <p className="text-xs text-white/60 mt-1">
                Desenvolvido conforme protocolos do MS • PNCD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bug className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Entomonitec</h2>
            <p className="text-slate-600">Vigilância Entomológica</p>
          </div>

          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-slate-600">
                Entre com suas credenciais oficiais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Institucional
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@saude.gov.br"
                      className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                  disabled={isSubmitting || isAuthenticating}
                >
                  {isSubmitting || isAuthenticating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>{isAuthenticating ? 'Carregando dados...' : 'Verificando...'}</span>
                    </div>
                  ) : (
                    'Acessar Sistema'
                  )}
                </Button>
              </form>

              {/* Esqueci a senha */}
              <div className="mt-6 text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-emerald-600 hover:text-emerald-700 p-0 h-auto font-normal"
                  onClick={handleForgotPassword}
                >
                  Esqueci minha senha
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações de segurança */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sistema protegido • Acesso autorizado apenas para servidores municipais
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
