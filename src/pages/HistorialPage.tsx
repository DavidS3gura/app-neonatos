import { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  neonatoService,
  observacionService,
  type Neonato,
  type Observacion,
} from '@/services/api';
import {
  getFcScale,
  getFrScale,
  getPosicionComodaScale,
  getSpo2Scale,
} from '@/lib/observation-scales';
import { Input } from '@/components/ui/input';
import { Search, X, Trash2 } from 'lucide-react';

type NeonatoWithObservaciones = Neonato & { observaciones?: Observacion[] };

type ScaleSummaryCardProps = {
  label: string;
  value: number;
  category?: string;
  range?: string;
};

function ScaleSummaryCard({
  label,
  value,
  category,
  range,
}: ScaleSummaryCardProps) {
  return (
    <div className="p-3 rounded-lg bg-muted space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {category && <p className="text-xs font-medium text-primary">{category}</p>}
      {range && <p className="text-[11px] text-muted-foreground">{range}</p>}
    </div>
  );
}

export default function HistorialPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol?.toLowerCase() === 'admin';

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [neonato, setNeonato] = useState<NeonatoWithObservaciones | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<Observacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setNotFound(false);
    setError('');

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

  const reloadSelectedNeonato = async () => {
    if (!neonato) return;

    try {
      const data = await neonatoService.getByCode(neonato.codigo_rn);
      setNeonato(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo recargar el historial');
    }
  };

  const handleDeleteObservation = async (observation: Observacion) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la observación del ${observation.fecha} a las ${observation.hora}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');
      await observacionService.delete(observation.id);

      if (selectedObservation?.id === observation.id) {
        setSelectedObservation(null);
      }

      await reloadSelectedNeonato();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al eliminar observación');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAllObservations = async () => {
    if (!neonato) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar TODAS las observaciones del neonato ${neonato.codigo_rn}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');
      setSelectedObservation(null);

      await observacionService.deleteByNeonato(neonato.id);
      await reloadSelectedNeonato();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al eliminar todas las observaciones');
    } finally {
      setActionLoading(false);
    }
  };

  const observaciones = useMemo(() => {
    return (neonato?.observaciones || []).filter(
      (o) => !dateFilter || o.fecha === dateFilter
    );
  }, [neonato, dateFilter]);

  const selectedPosicionComoda = selectedObservation
    ? getPosicionComodaScale(selectedObservation.posicion_comoda)
    : null;

  const selectedSpo2 = selectedObservation
    ? getSpo2Scale(selectedObservation.spo2)
    : null;

  const selectedFr = selectedObservation
    ? getFrScale(selectedObservation.fr)
    : null;

  const selectedFc = selectedObservation
    ? getFcScale(selectedObservation.fc)
    : null;

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold">Historial Clínico</h1>

        <div className="clinical-card space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-3.5 text-muted-foreground"
                size={18}
              />
              <Input
                className="h-12 text-base pl-10"
                placeholder="Buscar por Código RN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <button
              onClick={handleSearch}
              className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              Buscar
            </button>

            {neonato && (
              <Input
                type="date"
                className="h-12 text-base w-full lg:w-48"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            )}
          </div>

          {loading && (
            <p className="text-muted-foreground text-sm">Buscando...</p>
          )}

          {notFound && (
            <p className="text-destructive text-sm">
              No se encontró el neonato con ese código.
            </p>
          )}

          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
        </div>

        {neonato && (
          <>
            <div className="clinical-card">
              <h2 className="text-lg font-semibold mb-3">
                Ficha: {neonato.codigo_rn}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sexo:</span>{' '}
                  <strong>{neonato.sexo}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">EG:</span>{' '}
                  <strong>
                    {neonato.eg_semanas}s {neonato.eg_dias}d
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Peso:</span>{' '}
                  <strong>{neonato.peso_nacer}g</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Estancia:</span>{' '}
                  <strong>{neonato.dias_estancia}d</strong>
                </div>
                <div className="md:col-span-4">
                  <span className="text-muted-foreground">Diagnóstico:</span>{' '}
                  <strong>{neonato.diagnostico_principal}</strong>
                </div>
              </div>
            </div>

            <div className="clinical-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Observaciones ({observaciones.length})
                  </h2>
                  {dateFilter && (
                    <p className="text-sm text-muted-foreground">
                      Filtrado por fecha: {dateFilter}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleDeleteAllObservations}
                    disabled={actionLoading || observaciones.length === 0}
                    className="h-10 px-4 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 size={16} />
                      Eliminar todas
                    </span>
                  </button>
                )}
              </div>

              {observaciones.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Sin observaciones registradas
                  {dateFilter ? ' para esta fecha' : ''}.
                </p>
              ) : (
                <div className="space-y-4">
                  {observaciones.map((o) => {
                    const spo2 = getSpo2Scale(o.spo2);
                    const fr = getFrScale(o.fr);
                    const fc = getFcScale(o.fc);
                    const posicionComoda = getPosicionComodaScale(o.posicion_comoda);

                    return (
                      <div
                        key={o.id}
                        className="p-4 rounded-lg border border-border bg-background space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {o.fecha} · {o.hora}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Observador: {o.observador}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedObservation(o)}
                              className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
                            >
                              Ver detalle
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteObservation(o)}
                                disabled={actionLoading}
                                className="h-10 px-4 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Trash2 size={16} />
                                  Eliminar
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                          <ScaleSummaryCard
                            label="Pos. Cómoda"
                            value={o.posicion_comoda}
                            category={posicionComoda?.category}
                            range={posicionComoda?.range}
                          />
                          <ScaleSummaryCard
                            label="SpO₂"
                            value={o.spo2}
                            category={spo2?.category}
                            range={spo2?.range}
                          />
                          <ScaleSummaryCard
                            label="FR"
                            value={o.fr}
                            category={fr?.category}
                            range={fr?.range}
                          />
                          <ScaleSummaryCard
                            label="FC"
                            value={o.fc}
                            category={fc?.category}
                            range={fc?.range}
                          />
                        </div>

                        {o.observaciones && (
                          <p className="text-sm text-muted-foreground">
                            {o.observaciones}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {selectedObservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-background border border-border shadow-xl">
              <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Detalle de observación
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedObservation.fecha} · {selectedObservation.hora}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedObservation(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Cerrar detalle"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="clinical-card">
                  <h3 className="text-lg font-semibold mb-3">
                    Datos generales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p>
                      <strong>Observador:</strong> {selectedObservation.observador}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {selectedObservation.fecha}
                    </p>
                    <p>
                      <strong>Hora:</strong> {selectedObservation.hora}
                    </p>
                    {neonato && (
                      <p>
                        <strong>Código RN:</strong> {neonato.codigo_rn}
                      </p>
                    )}
                  </div>
                </div>

                <div className="clinical-card space-y-4">
                  <h3 className="text-lg font-semibold">
                    Interpretación de escalas
                  </h3>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <p className="font-semibold text-primary">
                      Posición Cómoda
                    </p>
                    <p className="text-sm">
                      <strong>Puntaje:</strong> {selectedObservation.posicion_comoda}
                    </p>
                    <p className="text-sm">
                      <strong>Categoría:</strong>{' '}
                      {selectedPosicionComoda?.category ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Descripción:</strong>{' '}
                      {selectedPosicionComoda?.range ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Interpretación:</strong>{' '}
                      {selectedPosicionComoda?.interpretation ?? 'No disponible'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <p className="font-semibold text-primary">SpO₂</p>
                    <p className="text-sm">
                      <strong>Puntaje:</strong> {selectedObservation.spo2}
                    </p>
                    <p className="text-sm">
                      <strong>Categoría:</strong>{' '}
                      {selectedSpo2?.category ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Rango:</strong> {selectedSpo2?.range ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Interpretación:</strong>{' '}
                      {selectedSpo2?.interpretation ?? 'No disponible'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <p className="font-semibold text-primary">
                      Frecuencia Respiratoria
                    </p>
                    <p className="text-sm">
                      <strong>Puntaje:</strong> {selectedObservation.fr}
                    </p>
                    <p className="text-sm">
                      <strong>Categoría:</strong>{' '}
                      {selectedFr?.category ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Rango:</strong> {selectedFr?.range ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Interpretación:</strong>{' '}
                      {selectedFr?.interpretation ?? 'No disponible'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <p className="font-semibold text-primary">
                      Frecuencia Cardíaca
                    </p>
                    <p className="text-sm">
                      <strong>Puntaje:</strong> {selectedObservation.fc}
                    </p>
                    <p className="text-sm">
                      <strong>Categoría:</strong>{' '}
                      {selectedFc?.category ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Rango:</strong> {selectedFc?.range ?? 'No disponible'}
                    </p>
                    <p className="text-sm">
                      <strong>Interpretación:</strong>{' '}
                      {selectedFc?.interpretation ?? 'No disponible'}
                    </p>
                  </div>
                </div>

                <div className="clinical-card">
                  <h3 className="text-lg font-semibold mb-3">
                    Observaciones adicionales
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedObservation.observaciones?.trim()
                      ? selectedObservation.observaciones
                      : 'Sin observaciones adicionales.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}