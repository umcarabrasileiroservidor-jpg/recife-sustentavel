import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminReports } from '../../services/dataService';
import { Loader2 } from 'lucide-react';

export function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminReports('monthly').then(res => {
        setData(res);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin"/></div>;

  if (!data?.daily || data.daily.length === 0) {
    return <div className="p-6 text-muted-foreground">Nenhum dado de relatório disponível ainda. Cadastre descartes para ver os gráficos.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Relatórios</h2>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-bold">Descartes por Dia (Última Semana)</h3>
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
      </div>
    </div>
  );
}