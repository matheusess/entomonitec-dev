import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PlaceholderPageProps {
  title: string;
  description: string;
  feature: string;
}

export default function PlaceholderPage({ title, description, feature }: PlaceholderPageProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">
                <Construction className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-lg">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Esta funcionalidade ({feature}) está sendo desenvolvida. 
              Continue conversando para que possamos implementar esta seção específica do sistema.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <Button>
                Continuar Desenvolvimento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
