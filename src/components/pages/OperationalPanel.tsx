import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Activity, 
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ZoneMappingService, ZoneSummary } from '@/services/zoneMappingService';

interface AgentPerformance {
  id: string;
  name: string;
  role: string;
  team: string;
  totalVisits: number;
  routineVisits: number;
  liraaVisits: number;
  avgVisitsPerDay: number;
  completionRate: number;
  qualityScore: number;
  lastActivity: Date;
  status: 'active' | 'inactive' | 'leave';
  weeklyTarget: number;
  monthlyTarget: number;
  assignedNeighborhoods: string[];
  achievements: string[];
}

interface TeamSummary {
  teamName: string;
  totalAgents: number;
  activeAgents: number;
  totalVisits: number;
  averageQuality: number;
  completionRate: number;
  targetAchievement: number;
}



interface VisitTrend {
  date: string;
  visits: number;
  quality: number;
  agents: number;
}

export default function OperationalPanel() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [searchAgent, setSearchAgent] = useState('');
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [teamSummary, setTeamSummary] = useState<TeamSummary[]>([]);
  const [zoneSummary, setZoneSummary] = useState<ZoneSummary[]>([]);
  const [visitTrends, setVisitTrends] = useState<VisitTrend[]>([]);

  useEffect(() => {
    // Simulate loading operational data
    setAgentPerformance([
      {
        id: '1',
        name: 'João Silva',
        role: 'agent',
        team: 'Equipe Norte',
        totalVisits: 48,
        routineVisits: 35,
        liraaVisits: 13,
        avgVisitsPerDay: 6.8,
        completionRate: 96,
        qualityScore: 8.7,
        lastActivity: new Date(),
        status: 'active',
        weeklyTarget: 35,
        monthlyTarget: 140,
        assignedNeighborhoods: ['Centro', 'Centro Cívico'],
        achievements: ['Meta Mensal', 'Qualidade Excelente']
      },
      {
        id: '2',
        name: 'Maria Santos',
        role: 'agent',
        team: 'Equipe Sul',
        totalVisits: 52,
        routineVisits: 38,
        liraaVisits: 14,
        avgVisitsPerDay: 7.4,
        completionRate: 98,
        qualityScore: 9.2,
        lastActivity: new Date(),
        status: 'active',
        weeklyTarget: 35,
        monthlyTarget: 140,
        assignedNeighborhoods: ['Batel', 'Bigorrilho'],
        achievements: ['Destaque do Mês', 'Meta Mensal', 'Qualidade Excelente']
      },
      {
        id: '3',
        name: 'Carlos Mendes',
        role: 'agent',
        team: 'Equipe Norte',
        totalVisits: 41,
        routineVisits: 29,
        liraaVisits: 12,
        avgVisitsPerDay: 5.8,
        completionRate: 88,
        qualityScore: 7.9,
        lastActivity: subDays(new Date(), 1),
        status: 'active',
        weeklyTarget: 35,
        monthlyTarget: 140,
        assignedNeighborhoods: ['Cajuru', 'Boa Vista'],
        achievements: ['Participação Ativa']
      },
      {
        id: '4',
        name: 'Ana Costa',
        role: 'supervisor',
        team: 'Equipe Sul',
        totalVisits: 23,
        routineVisits: 16,
        liraaVisits: 7,
        avgVisitsPerDay: 3.2,
        completionRate: 100,
        qualityScore: 9.5,
        lastActivity: new Date(),
        status: 'active',
        weeklyTarget: 20,
        monthlyTarget: 80,
        assignedNeighborhoods: ['Portão', 'Campo Comprido'],
        achievements: ['Supervisora Exemplar', 'Qualidade Excelente']
      },
      {
        id: '5',
        name: 'Pedro Oliveira',
        role: 'agent',
        team: 'Equipe Leste',
        totalVisits: 44,
        routineVisits: 32,
        liraaVisits: 12,
        avgVisitsPerDay: 6.2,
        completionRate: 92,
        qualityScore: 8.1,
        lastActivity: new Date(),
        status: 'active',
        weeklyTarget: 35,
        monthlyTarget: 140,
        assignedNeighborhoods: ['Abranches', 'Bacacheri'],
        achievements: ['Meta Mensal']
      },
      {
        id: '6',
        name: 'Lucia Ferreira',
        role: 'agent',
        team: 'Equipe Sul',
        totalVisits: 28,
        routineVisits: 20,
        liraaVisits: 8,
        avgVisitsPerDay: 4.0,
        completionRate: 78,
        qualityScore: 6.8,
        lastActivity: subDays(new Date(), 2),
        status: 'inactive',
        weeklyTarget: 35,
        monthlyTarget: 140,
        assignedNeighborhoods: ['Seminário', 'Hauer'],
        achievements: []
      }
    ]);

    setTeamSummary([
      {
        teamName: 'Equipe Norte',
        totalAgents: 2,
        activeAgents: 2,
        totalVisits: 89,
        averageQuality: 8.3,
        completionRate: 92,
        targetAchievement: 94
      },
      {
        teamName: 'Equipe Sul',
        totalAgents: 3,
        activeAgents: 2,
        totalVisits: 103,
        averageQuality: 8.8,
        completionRate: 89,
        targetAchievement: 87
      },
      {
        teamName: 'Equipe Leste',
        totalAgents: 1,
        activeAgents: 1,
        totalVisits: 44,
        averageQuality: 8.1,
        completionRate: 92,
        targetAchievement: 98
      }
    ]);

    // Gerar resumo por zona baseado nos agentes
    const generateZoneSummary = () => {
      const zoneGroups = ZoneMappingService.groupUsersByZone(agentPerformance);
      const zones: ZoneSummary[] = [];

      Object.keys(zoneGroups).forEach(zoneName => {
        const agents = zoneGroups[zoneName];
        const activeAgents = agents.filter(agent => agent.status === 'active');
        const totalVisits = agents.reduce((sum, agent) => sum + agent.totalVisits, 0);
        const averageQuality = agents.reduce((sum, agent) => sum + agent.qualityScore, 0) / agents.length;
        const completionRate = agents.reduce((sum, agent) => sum + agent.completionRate, 0) / agents.length;
        const targetAchievement = agents.reduce((sum, agent) => sum + (agent.completionRate * 0.9), 0) / agents.length;
        
        // Coletar todos os bairros únicos da zona
        const allNeighborhoods = new Set<string>();
        agents.forEach(agent => {
          agent.assignedNeighborhoods.forEach((neighborhood: string) => allNeighborhoods.add(neighborhood));
        });

        zones.push({
          zoneName,
          totalAgents: agents.length,
          activeAgents: activeAgents.length,
          totalVisits,
          averageQuality: Math.round(averageQuality * 10) / 10,
          completionRate: Math.round(completionRate),
          targetAchievement: Math.round(targetAchievement),
          neighborhoods: Array.from(allNeighborhoods),
          agents: agents.map(agent => agent.name)
        });
      });

      return zones.sort((a, b) => a.zoneName.localeCompare(b.zoneName));
    };

    setZoneSummary(generateZoneSummary());

    setVisitTrends([
      { date: '01/01', visits: 28, quality: 8.2, agents: 6 },
      { date: '02/01', visits: 34, quality: 8.5, agents: 6 },
      { date: '03/01', visits: 29, quality: 8.1, agents: 5 },
      { date: '04/01', visits: 41, quality: 8.7, agents: 6 },
      { date: '05/01', visits: 38, quality: 8.9, agents: 6 },
      { date: '06/01', visits: 35, quality: 8.4, agents: 5 },
      { date: '07/01', visits: 31, quality: 8.3, agents: 6 }
    ]);
  }, []);

  const filteredAgents = agentPerformance.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchAgent.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || agent.team === selectedTeam;
    const matchesZone = selectedZone === 'all' || ZoneMappingService.getUserZones(agent.assignedNeighborhoods).includes(selectedZone);
    return matchesSearch && matchesTeam && matchesZone;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-warning text-warning-foreground';
      case 'leave': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'leave': return 'Licença';
      default: return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'agent': return 'Agente';
      case 'supervisor': return 'Supervisor';
      case 'administrator': return 'Administrador';
      default: return role;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 9) return 'text-success';
    if (score >= 7) return 'text-info';
    if (score >= 5) return 'text-warning';
    return 'text-critical';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 95) return 'text-success';
    if (rate >= 80) return 'text-info';
    if (rate >= 60) return 'text-warning';
    return 'text-critical';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
          <Users className="h-8 w-8 text-primary" />
          <span>Painel Operacional</span>
        </h1>
        <p className="text-muted-foreground">
          Monitoramento da performance dos agentes e equipes de campo
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Equipe</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as equipes</SelectItem>
                  <SelectItem value="Equipe Norte">Equipe Norte</SelectItem>
                  <SelectItem value="Equipe Sul">Equipe Sul</SelectItem>
                  <SelectItem value="Equipe Leste">Equipe Leste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zona</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as zonas</SelectItem>
                  {ZoneMappingService.getAllZones().map(zone => (
                    <SelectItem key={zone} value={zone}>Zona {zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Agente</label>
              <Input
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                placeholder="Nome do agente..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ações</label>
              <Button className="w-full" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Por Agente</TabsTrigger>
          <TabsTrigger value="teams">Por Equipe</TabsTrigger>
          <TabsTrigger value="zones">Por Zona</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agentPerformance.length}</div>
                <p className="text-xs text-muted-foreground">
                  {agentPerformance.filter(a => a.status === 'active').length} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitas Realizadas</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentPerformance.reduce((sum, agent) => sum + agent.totalVisits, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Média: {(agentPerformance.reduce((sum, agent) => sum + agent.avgVisitsPerDay, 0) / agentPerformance.length).toFixed(1)}/dia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualidade Média</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {(agentPerformance.reduce((sum, agent) => sum + agent.qualityScore, 0) / agentPerformance.length).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Escala de 0-10
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">
                  {(agentPerformance.reduce((sum, agent) => sum + agent.completionRate, 0) / agentPerformance.length).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Meta: 90%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Visitas</CardTitle>
                <CardDescription>Evolução diária das visitas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={visitTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      axisLine={true}
                      tickLine={true}
                      mirror={false}
                      orientation="bottom"
                    />
                    <YAxis 
                      axisLine={true}
                      tickLine={true}
                      mirror={false}
                      orientation="left"
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} name="Visitas" />
                    <Line type="monotone" dataKey="agents" stroke="#10b981" strokeWidth={2} name="Agentes Ativos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Equipe</CardTitle>
                <CardDescription>Comparativo de resultados entre equipes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="teamName"
                      axisLine={true}
                      tickLine={true}
                      mirror={false}
                      orientation="bottom"
                    />
                    <YAxis 
                      axisLine={true}
                      tickLine={true}
                      mirror={false}
                      orientation="left"
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalVisits" fill="#3b82f6" name="Visitas" />
                    <Bar dataKey="averageQuality" fill="#10b981" name="Qualidade (x10)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4">
            {filteredAgents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-lg">{agent.name}</h3>
                        <Badge variant="outline">{getRoleLabel(agent.role)}</Badge>
                        <Badge className={getStatusColor(agent.status)}>
                          {getStatusLabel(agent.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{agent.team}</p>
                      <p className="text-xs text-muted-foreground">
                        Última atividade: {format(agent.lastActivity, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Award className="h-4 w-4 text-warning" />
                        <span className={`font-medium ${getQualityColor(agent.qualityScore)}`}>
                          {agent.qualityScore}/10
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Qualidade</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Total de Visitas</p>
                      <p className="font-medium text-lg">{agent.totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Visitas/Dia</p>
                      <p className="font-medium">{agent.avgVisitsPerDay}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rotina</p>
                      <p className="font-medium">{agent.routineVisits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">LIRAa</p>
                      <p className="font-medium">{agent.liraaVisits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa Conclusão</p>
                      <p className={`font-medium ${getCompletionColor(agent.completionRate)}`}>
                        {agent.completionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Meta Semanal</p>
                      <p className="font-medium">
                        {agent.totalVisits}/{agent.weeklyTarget}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Bairros atribuídos:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.assignedNeighborhoods.map((neighborhood, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {neighborhood}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {agent.achievements.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Conquistas:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.achievements.map((achievement, index) => (
                            <Badge key={index} className="text-xs bg-success">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    {agent.status === 'active' && (
                      <Button size="sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        Localizar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4">
            {teamSummary.map((team, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg">{team.teamName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.activeAgents} de {team.totalAgents} agentes ativos
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{team.totalVisits}</div>
                      <p className="text-xs text-muted-foreground">Visitas realizadas</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Qualidade Média</p>
                      <p className={`font-medium text-lg ${getQualityColor(team.averageQuality)}`}>
                        {team.averageQuality}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa Conclusão</p>
                      <p className={`font-medium ${getCompletionColor(team.completionRate)}`}>
                        {team.completionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Atingimento Meta</p>
                      <p className={`font-medium ${getCompletionColor(team.targetAchievement)}`}>
                        {team.targetAchievement}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <div className="flex items-center space-x-1">
                        {team.activeAgents === team.totalAgents ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-warning" />
                        )}
                        <span className="font-medium">
                          {team.activeAgents === team.totalAgents ? 'Completa' : 'Incompleta'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatório Detalhado
                    </Button>
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Gerenciar Equipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          {/* Zone Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zoneSummary.map((zone) => (
              <Card key={zone.zoneName} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg">Zona {zone.zoneName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {zone.activeAgents} de {zone.totalAgents} agentes ativos
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {zone.neighborhoods.slice(0, 3).map((neighborhood, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {neighborhood}
                          </Badge>
                        ))}
                        {zone.neighborhoods.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{zone.neighborhoods.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{zone.totalVisits}</div>
                      <p className="text-xs text-muted-foreground">Visitas realizadas</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Qualidade Média</p>
                      <p className={`font-medium text-lg ${getQualityColor(zone.averageQuality)}`}>
                        {zone.averageQuality}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa Conclusão</p>
                      <p className={`font-medium ${getCompletionColor(zone.completionRate)}`}>
                        {zone.completionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Atingimento Meta</p>
                      <p className={`font-medium ${getCompletionColor(zone.targetAchievement)}`}>
                        {zone.targetAchievement}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <div className="flex items-center space-x-1">
                        {zone.activeAgents === zone.totalAgents ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-warning" />
                        )}
                        <span className="font-medium">
                          {zone.activeAgents === zone.totalAgents ? 'Completa' : 'Incompleta'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Agentes:</p>
                    <div className="flex flex-wrap gap-1">
                      {zone.agents.map((agent, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatório da Zona
                    </Button>
                    <Button size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver Mapa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Performance</CardTitle>
                <CardDescription>Classificação dos agentes por faixa de qualidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Excelente (9-10)', value: agentPerformance.filter(a => a.qualityScore >= 9).length, color: '#10b981' },
                        { name: 'Bom (7-8.9)', value: agentPerformance.filter(a => a.qualityScore >= 7 && a.qualityScore < 9).length, color: '#3b82f6' },
                        { name: 'Regular (5-6.9)', value: agentPerformance.filter(a => a.qualityScore >= 5 && a.qualityScore < 7).length, color: '#f97316' },
                        { name: 'Ruim (<5)', value: agentPerformance.filter(a => a.qualityScore < 5).length, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Excelente (9-10)', value: agentPerformance.filter(a => a.qualityScore >= 9).length, color: '#10b981' },
                        { name: 'Bom (7-8.9)', value: agentPerformance.filter(a => a.qualityScore >= 7 && a.qualityScore < 9).length, color: '#3b82f6' },
                        { name: 'Regular (5-6.9)', value: agentPerformance.filter(a => a.qualityScore >= 5 && a.qualityScore < 7).length, color: '#f97316' },
                        { name: 'Ruim (<5)', value: agentPerformance.filter(a => a.qualityScore < 5).length, color: '#ef4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtividade vs Qualidade</CardTitle>
                <CardDescription>Relação entre número de visitas e qualidade do trabalho</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentPerformance.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      axisLine={true}
                      tickLine={true}
                      mirror={false}
                      orientation="bottom"
                    />
                    <YAxis 
                      axisLine={true}
                      tickLine={true}
                      mirror={false}
                      orientation="left"
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalVisits" fill="#3b82f6" name="Total de Visitas" />
                    <Bar dataKey="qualityScore" fill="#10b981" name="Qualidade (x5)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Rankings */}
          <Card>
            <CardHeader>
              <CardTitle>Rankings de Performance</CardTitle>
              <CardDescription>Top performers em diferentes categorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Award className="h-4 w-4 text-warning" />
                    <span>Maior Qualidade</span>
                  </h4>
                  <div className="space-y-2">
                    {agentPerformance
                      .sort((a, b) => b.qualityScore - a.qualityScore)
                      .slice(0, 3)
                      .map((agent, index) => (
                        <div key={agent.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{agent.name}</span>
                          </div>
                          <Badge className="bg-success">{agent.qualityScore}/10</Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-info" />
                    <span>Maior Produtividade</span>
                  </h4>
                  <div className="space-y-2">
                    {agentPerformance
                      .sort((a, b) => b.totalVisits - a.totalVisits)
                      .slice(0, 3)
                      .map((agent, index) => (
                        <div key={agent.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{agent.name}</span>
                          </div>
                          <Badge className="bg-info">{agent.totalVisits} visitas</Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Melhor Conclusão</span>
                  </h4>
                  <div className="space-y-2">
                    {agentPerformance
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .slice(0, 3)
                      .map((agent, index) => (
                        <div key={agent.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{agent.name}</span>
                          </div>
                          <Badge className="bg-primary">{agent.completionRate}%</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
