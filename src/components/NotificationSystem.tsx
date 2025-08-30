import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Mail,
  Smartphone,
  Settings,
  X
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  relatedData?: {
    neighborhood?: string;
    trapId?: string;
    infestationLevel?: number;
  };
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  criticalAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  trapMaintenanceReminders: boolean;
  newInfestationAlerts: boolean;
}

interface NotificationSystemProps {
  showSettings?: boolean;
  compact?: boolean;
}

export default function NotificationSystem({ showSettings = false, compact = false }: NotificationSystemProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    criticalAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    trapMaintenanceReminders: true,
    newInfestationAlerts: true
  });

  useEffect(() => {
    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'critical',
        title: 'Nível Crítico de Infestação',
        message: 'Centro apresenta nível crítico com 45 mosquitos detectados. Ação imediata necessária.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        actionRequired: true,
        relatedData: { neighborhood: 'Centro', infestationLevel: 5 }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Manutenção de Armadilha Pendente',
        message: 'Armadilha ARM-125 está há 15 dias sem manutenção.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        actionRequired: true,
        relatedData: { trapId: 'ARM-125', neighborhood: 'Vila Nova' }
      },
      {
        id: '3',
        type: 'info',
        title: 'Relatório Semanal Disponível',
        message: 'O relatório semanal de monitoramento está pronto para visualização.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        actionRequired: false
      },
      {
        id: '4',
        type: 'success',
        title: 'Meta Mensal Atingida',
        message: 'Parabéns! A meta de visitas mensais foi atingida com 127 visitas realizadas.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        actionRequired: false
      },
      {
        id: '5',
        type: 'warning',
        title: 'Novo Foco de Infestação',
        message: 'Detectado novo foco no Jardim das Flores. Recomenda-se visita de inspeção.',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        read: false,
        actionRequired: true,
        relatedData: { neighborhood: 'Jardim das Flores', infestationLevel: 3 }
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-critical" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info': return <Info className="h-5 w-5 text-info" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const badgeConfig = {
      critical: { label: 'Crítico', className: 'bg-critical text-critical-foreground' },
      warning: { label: 'Atenção', className: 'bg-warning text-warning-foreground' },
      info: { label: 'Info', className: 'bg-info text-info-foreground' },
      success: { label: 'Sucesso', className: 'bg-success text-success-foreground' }
    };

    const config = badgeConfig[type as keyof typeof badgeConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return `Hoje às ${format(timestamp, 'HH:mm')}`;
    } else if (isYesterday(timestamp)) {
      return `Ontem às ${format(timestamp, 'HH:mm')}`;
    } else {
      return format(timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Configurações atualizadas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.read).length;

  if (compact) {
    return (
      <div className="relative">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-critical text-critical-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Alertas automáticos e notificações do sistema
          </p>
        </div>

        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Critical Alerts Summary */}
      {criticalCount > 0 && (
        <Card className="border-critical bg-critical/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-critical" />
              <div>
                <p className="font-medium text-critical">
                  {criticalCount} alerta{criticalCount !== 1 ? 's' : ''} crítico{criticalCount !== 1 ? 's' : ''} pendente{criticalCount !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ação imediata necessária para áreas com nível crítico de infestação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground">
                Você está em dia! Todas as notificações foram visualizadas.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? 'bg-muted/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        {getNotificationBadge(notification.type)}
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Ação necessária
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                        
                        {notification.relatedData?.neighborhood && (
                          <span>• {notification.relatedData.neighborhood}</span>
                        )}
                        
                        {notification.relatedData?.trapId && (
                          <span>• {notification.relatedData.trapId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configurações de Notificação</span>
            </CardTitle>
            <CardDescription>
              Configure como e quando receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Methods */}
            <div className="space-y-4">
              <h4 className="font-medium">Métodos de Entrega</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email">Notificações por Email</Label>
                  </div>
                  <Switch
                    id="email"
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => updateSettings('emailEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="sms">Notificações por SMS</Label>
                  </div>
                  <Switch
                    id="sms"
                    checked={settings.smsEnabled}
                    onCheckedChange={(checked) => updateSettings('smsEnabled', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Alert Types */}
            <div className="space-y-4">
              <h4 className="font-medium">Tipos de Alerta</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="critical">Alertas Críticos</Label>
                  <Switch
                    id="critical"
                    checked={settings.criticalAlerts}
                    onCheckedChange={(checked) => updateSettings('criticalAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="infestation">Novos Focos de Infestação</Label>
                  <Switch
                    id="infestation"
                    checked={settings.newInfestationAlerts}
                    onCheckedChange={(checked) => updateSettings('newInfestationAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance">Lembretes de Manutenção</Label>
                  <Switch
                    id="maintenance"
                    checked={settings.trapMaintenanceReminders}
                    onCheckedChange={(checked) => updateSettings('trapMaintenanceReminders', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Report Notifications */}
            <div className="space-y-4">
              <h4 className="font-medium">Relatórios Automáticos</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly">Relatórios Semanais</Label>
                  <Switch
                    id="weekly"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => updateSettings('weeklyReports', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly">Relatórios Mensais</Label>
                  <Switch
                    id="monthly"
                    checked={settings.monthlyReports}
                    onCheckedChange={(checked) => updateSettings('monthlyReports', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
