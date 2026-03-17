import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { neonatoService, type Neonato, type Observacion } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HistorialPage() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [neonato, setNeonato] = useState<(Neonato & { observaciones?: Observacion[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const data = await neonatoService.getByCode(search.trim());
      setNeonato(data);
    } catch {
      setNeonato(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const observaciones = (neonato?.observaciones || []).filter(o => !dateFilter || o.fecha === dateFilter);

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold">Historial Clínico</h1>

        <div className="clinical-card space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
              <Input
                className="h-12 text-base pl-10"
                placeholder="Buscar por Código RN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button onClick={handleSearch} className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium">
              Buscar
            </button>
            {neonato && (
              <Input type="date" className="h-12 text-base w-48" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            )}
          </div>
          {loading && <p className="text-muted-foreground text-sm">Buscando...</p>}
          {notFound && <p className="text-destructive text-sm">No se encontró el neonato con ese código.</p>}
        </div>

        {neonato && (
          <>
            <div className="clinical-card">
              <h2 className="text-lg font-semibold mb-3">Ficha: {neonato.codigo_rn}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Sexo:</span> <strong>{neonato.sexo}</strong></div>
                <div><span className="text-muted-foreground">EG:</span> <strong>{neonato.eg_semanas}s {neonato.eg_dias}d</strong></div>
                <div><span className="text-muted-foreground">Peso:</span> <strong>{neonato.peso_nacer}g</strong></div>
                <div><span className="text-muted-foreground">Estancia:</span> <strong>{neonato.dias_estancia}d</strong></div>
                <div className="md:col-span-4"><span className="text-muted-foreground">Diagnóstico:</span> <strong>{neonato.diagnostico_principal}</strong></div>
              </div>
            </div>

            <div className="clinical-card">
              <h2 className="text-lg font-semibold mb-4">
                Observaciones ({observaciones.length})
              </h2>
              {observaciones.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sin observaciones registradas{dateFilter ? ' para esta fecha' : ''}.</p>
              ) : (
                <div className="space-y-4">
                  {observaciones.map(o => (
                    <div key={o.id} className="p-4 rounded-lg border border-border bg-background">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{o.fecha} · {o.hora}</p>
                          <p className="text-sm text-muted-foreground">Observador: {o.observador}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {[
                          { label: 'Pos. Cómoda', val: o.posicion_comoda },
                          { label: 'SpO₂', val: o.spo2 },
                          { label: 'FR', val: o.fr },
                          { label: 'FC', val: o.fc },
                        ].map(s => (
                          <div key={s.label} className="p-2 rounded bg-muted">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-xl font-bold">{s.val}</p>
                          </div>
                        ))}
                      </div>
                      {o.observaciones && (
                        <p className="text-sm text-muted-foreground mt-3">{o.observaciones}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
