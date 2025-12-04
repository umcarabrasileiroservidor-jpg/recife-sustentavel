import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminReports } from '../../services/dataService';

export function Reports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAdminReports('monthly').then(setData);
  }, []);

  if (!data) return <div className="p-6">Carregando relatórios...</div>;

  // Se não tiver dados, mostra mensagem amigável
  if (!data.daily || data.daily.length === 0) {
    return <div className="p-6 text-muted-foreground">Nenhum dado de relatório disponível ainda.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Relatórios de Impacto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gráfico de Descartes */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-bold">Descartes (Últimos 7 dias)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.daily}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="descartes" fill="#2E8B57" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fluxo de Pontos */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-bold">Movimentação de Pontos</h3>
            <div className="space-y-4">
               {data.flow && data.flow.map((f: any, i: number) => (
                 <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="capitalize">{f.tipo}</span>
                    <span className="font-bold text-lg">{f.total} pts</span>
                 </div>
               ))}
               {(!data.flow || data.flow.length === 0) && <p>Sem movimentações.</p>}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}