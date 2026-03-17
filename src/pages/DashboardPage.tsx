import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { neonatoService, observacionService, type Neonato, type Observacion } from '@/services/api';
import { Baby, ClipboardList, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [neonatos, setNeonatos] = useState<Neonato[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([neonatoService.getAll(), observacionService.getAll()])
      .then(([n, o]) => { setNeonatos(n); setObservaciones(o); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const recientes = [...observaciones]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Neonatos registrados', value: neonatos.length, icon: Baby, color: 'text-primary' },
    { label: 'Observaciones totales', value: observaciones.length, icon: ClipboardList, color: 'text-secondary' },
    { label: 'Promedio obs/neonato', value: neonatos.length ? (observaciones.length / neonatos.length).toFixed(1) : '0', icon: Activity, color: 'text-warning' },
  ];

  if (loading) return <AppLayout><div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Cargando...</p></div></AppLayout>;

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s) => (
            <div key={s.label} className="clinical-card flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="clinical-card">
          <h2 className="text-lg font-semibold mb-4">Últimas observaciones</h2>
          {recientes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay observaciones registradas aún.</p>
          ) : (
            <div className="space-y-3">
              {recientes.map((o) => {
                const neo = neonatos.find(n => n.id === o.neonato_id);
                return (
                  <div key={o.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{neo?.codigo_rn ?? 'Desconocido'}</p>
                      <p className="text-sm text-muted-foreground">{o.fecha} · {o.hora} · {o.observador}</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>SpO₂: {o.spo2}</span>
                      <span>FC: {o.fc}</span>
                      <span>FR: {o.fr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
