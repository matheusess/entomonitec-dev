'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Eye, RefreshCw, Settings } from 'lucide-react';

interface OrganizationSwitcherProps {
  showInHeader?: boolean;
  compact?: boolean;
}

export default function OrganizationSwitcher({ 
  showInHeader = false, 
  compact = false 
}: OrganizationSwitcherProps) {
  const { user, availableOrganizations, switchOrganization } = useAuth();
  const { toast } = useToast();
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  if (!user?.isSuperAdmin) {
    return null;
  }

  const handleSwitch = async () => {
    if (!selectedOrgId) return;

    try {
      await switchOrganization(selectedOrgId);
      
      const selectedOrg = availableOrganizations.find(org => org.id === selectedOrgId);
      toast({
        title: 'Organização Alterada',
        description: `Agora visualizando como: ${selectedOrg?.name}`,
      });
      
      if (compact) setIsOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao trocar organização',
        variant: 'destructive'
      });
    }
  };

  const currentOrg = user.organization;

  // Versão para header (compacta)
  if (showInHeader) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Super Admin
        </Badge>
        {currentOrg && (
          <div className="text-xs text-gray-600 hidden md:block">
            Visualizando: {currentOrg.name}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-2"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 z-50">
            <Card className="w-80 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Trocar Organização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma organização" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrganizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} - {org.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSwitch} 
                    disabled={!selectedOrgId}
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    size="sm"
                  >
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Versão completa (standalone)
  if (compact) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Super Admin - Trocar Organização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentOrg && (
            <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
              Atualmente visualizando: <strong>{currentOrg.name} - {currentOrg.state}</strong>
            </div>
          )}
          
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma organização" />
            </SelectTrigger>
            <SelectContent>
              {availableOrganizations.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{org.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {org.state}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSwitch} 
            disabled={!selectedOrgId}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Trocar Visualização
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Versão expandida
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Trocar Visualização de Organização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Como super admin, você pode visualizar o sistema na perspectiva de qualquer organização:
        </div>
        
        {currentOrg && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900">
              Organização Atual
            </div>
            <div className="text-blue-700">
              {currentOrg.name} - {currentOrg.state}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {currentOrg.fullName}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma organização para visualizar" />
            </SelectTrigger>
            <SelectContent>
              {availableOrganizations.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{org.name}</span>
                      <Badge variant="outline">{org.state}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {org.fullName}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleSwitch} 
            disabled={!selectedOrgId}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Trocar para Esta Organização
          </Button>
        </div>

        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <strong>Dica:</strong> Ao trocar de organização, você verá o sistema exatamente como 
          os usuários desta organização veem, incluindo dados, configurações e personalização.
        </div>
      </CardContent>
    </Card>
  );
}

