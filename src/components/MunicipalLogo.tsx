import { Shield } from 'lucide-react';
import { useMunicipalConfig, type MunicipalConfig } from '@/lib/municipalConfig';

interface MunicipalLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPlaceholder?: boolean;
  municipalConfig?: MunicipalConfig;
}

export default function MunicipalLogo({
  size = 'md',
  showPlaceholder = true,
  municipalConfig
}: MunicipalLogoProps) {
  const defaultConfig = useMunicipalConfig();
  const config = municipalConfig || defaultConfig;
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8', 
    xl: 'h-10 w-10'
  };

  // Se há logo configurado, usar ele
  if (config.logo) {
    return (
      <img
        src={config.logo}
        alt={`Brasão de ${config.name}`}
        className={`${sizeClasses[size]} object-contain`}
        onError={(e) => {
          // Fallback para placeholder se a imagem falhar
          if (showPlaceholder) {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }
        }}
      />
    );
  }

  // Placeholder personalizável para brasão
  if (showPlaceholder) {
    return (
      <div className={`${sizeClasses[size]} bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-sm`}>
        <Shield className={`${iconSizes[size]} text-slate-500 dark:text-slate-400`} />
      </div>
    );
  }

  return null;
}

// Re-exportar para compatibilidade
export { useMunicipalConfig } from '@/lib/municipalConfig';
