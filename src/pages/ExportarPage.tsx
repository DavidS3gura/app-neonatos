import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { exportService, neonatoService, type Neonato } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileSpreadsheet, FileText, Search, X } from 'lucide-react';

export default function ExportarPage() {
  const [loading, setLoading] = useState('');
  const [neonatos, setNeonatos] = useState<Neonato[]>([]);
  const [selectedNeonatoId, setSelectedNeonatoId] = useState('');
  const [selectedNeonatoCode, setSelectedNeonatoCode] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    neonatoService
      .getAll()
      .then(setNeonatos)
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar los neonatos');
      });
  }, []);

  const handleExport = async (fn: () => Promise<void>, key: string) => {
    setError('');
    setLoading(key);

    try {
      await fn();
    } catch (e) {
      console.error(e);
      setError('No se pudo completar la exportación');
    } finally {
      setLoading('');
    }
  };

  const handleSelectNeonato = (id: string) => {
    setSelectedNeonatoId(id);
    const found = neonatos.find((n) => n.id === id);
    setSelectedNeonatoCode(found?.codigo_rn || '');
  };

  const clearSelectedNeonato = () => {
    setSelectedNeonatoId('');
    setSelectedNeonatoCode('');
    setSearch('');
  };

  const filteredNeonatos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return neonatos.slice(0, 12);

    return neonatos
      .filter((n) => {
        return (
          n.codigo_rn.toLowerCase().includes(term) ||
          n.diagnostico_principal.toLowerCase().includes(term)
        );
      })
      .slice(0, 12);
  }, [neonatos, search]);

  const selectedNeonato = useMemo(() => {
    return neonatos.find((n) => n.id === selectedNeonatoId) || null;
  }, [neonatos, selectedNeonatoId]);

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold">Exportar Datos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Descarga información global del sistema o exporta la ficha y observaciones de un neonato específico.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="clinical-card space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Exportación global de neonatos</h2>
              <p className="text-sm text-muted-foreground">
                Exporta todos los registros de neonatos actualmente disponibles.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleExport(() => exportService.exportNeonatosCSV(), 'nc')}
                className="h-12 text-base gap-2"
                disabled={!!loading}
              >
                <FileText size={18} />
                {loading === 'nc' ? 'Descargando...' : 'Neonatos CSV'}
              </Button>

              <Button
                onClick={() => handleExport(() => exportService.exportNeonatosXLSX(), 'nx')}
                className="h-12 text-base gap-2"
                disabled={!!loading}
              >
                <FileSpreadsheet size={18} />
                {loading === 'nx' ? 'Descargando...' : 'Neonatos Excel'}
              </Button>
            </div>
          </div>

          <div className="clinical-card space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Exportación global de observaciones</h2>
              <p className="text-sm text-muted-foreground">
                Exporta todas las observaciones registradas en el sistema.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  handleExport(() => exportService.exportObservacionesCSV(), 'oc')
                }
                className="h-12 text-base gap-2"
                disabled={!!loading}
              >
                <FileText size={18} />
                {loading === 'oc' ? 'Descargando...' : 'Observaciones CSV'}
              </Button>

              <Button
                onClick={() =>
                  handleExport(() => exportService.exportObservacionesXLSX(), 'ox')
                }
                className="h-12 text-base gap-2"
                disabled={!!loading}
              >
                <FileSpreadsheet size={18} />
                {loading === 'ox' ? 'Descargando...' : 'Observaciones Excel'}
              </Button>
            </div>
          </div>
        </div>

        <div className="clinical-card space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Exportar por neonato</h2>
              <p className="text-sm text-muted-foreground">
                Busca y selecciona un neonato para exportar su ficha o sus observaciones.
              </p>
            </div>

            {selectedNeonato && (
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={clearSelectedNeonato}
              >
                <X size={16} />
                Limpiar selección
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar neonato</label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="h-12 text-base pl-10"
                placeholder="Buscar por código RN o diagnóstico"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Seleccionar neonato</label>
            <select
              className="w-full h-12 rounded-lg border border-border bg-card px-3 text-base"
              value={selectedNeonatoId}
              onChange={(e) => handleSelectNeonato(e.target.value)}
            >
              <option value="">Seleccionar neonato...</option>
              {filteredNeonatos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.codigo_rn} - {n.sexo} - {n.eg_semanas}s {n.eg_dias}d - {n.diagnostico_principal}
                </option>
              ))}
            </select>

            <p className="text-xs text-muted-foreground">
              Mostrando {filteredNeonatos.length} resultado(s) de {neonatos.length} neonatos cargados.
            </p>
          </div>

          {selectedNeonato && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <p className="font-semibold text-primary">Neonato seleccionado</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Código RN:</strong> {selectedNeonato.codigo_rn}
                </p>
                <p>
                  <strong>Sexo:</strong> {selectedNeonato.sexo}
                </p>
                <p>
                  <strong>Edad gestacional:</strong> {selectedNeonato.eg_semanas}s {selectedNeonato.eg_dias}d
                </p>
                <p>
                  <strong>Peso al nacer:</strong> {selectedNeonato.peso_nacer} g
                </p>
                <p className="md:col-span-2">
                  <strong>Diagnóstico principal:</strong> {selectedNeonato.diagnostico_principal}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <Button
              onClick={() =>
                handleExport(
                  () =>
                    exportService.exportNeonatoCSV(
                      selectedNeonatoId,
                      selectedNeonatoCode
                    ),
                  'nnc'
                )
              }
              className="h-12 text-base gap-2"
              disabled={!selectedNeonatoId || !!loading}
            >
              <FileText size={18} />
              {loading === 'nnc' ? 'Descargando...' : 'Ficha CSV'}
            </Button>

            <Button
              onClick={() =>
                handleExport(
                  () =>
                    exportService.exportNeonatoXLSX(
                      selectedNeonatoId,
                      selectedNeonatoCode
                    ),
                  'nnx'
                )
              }
              className="h-12 text-base gap-2"
              disabled={!selectedNeonatoId || !!loading}
            >
              <FileSpreadsheet size={18} />
              {loading === 'nnx' ? 'Descargando...' : 'Ficha Excel'}
            </Button>

            <Button
              onClick={() =>
                handleExport(
                  () =>
                    exportService.exportObservacionesByNeonatoCSV(
                      selectedNeonatoId,
                      selectedNeonatoCode
                    ),
                  'onc'
                )
              }
              className="h-12 text-base gap-2"
              disabled={!selectedNeonatoId || !!loading}
            >
              <Download size={18} />
              {loading === 'onc' ? 'Descargando...' : 'Observaciones CSV'}
            </Button>

            <Button
              onClick={() =>
                handleExport(
                  () =>
                    exportService.exportObservacionesByNeonatoXLSX(
                      selectedNeonatoId,
                      selectedNeonatoCode
                    ),
                  'onx'
                )
              }
              className="h-12 text-base gap-2"
              disabled={!selectedNeonatoId || !!loading}
            >
              <Download size={18} />
              {loading === 'onx' ? 'Descargando...' : 'Observaciones Excel'}
            </Button>
          </div>
        </div>

        <div className="clinical-card space-y-3">
          <h2 className="text-lg font-semibold">Pendiente para siguiente fase</h2>
          <p className="text-sm text-muted-foreground">
            El módulo ya permite exportaciones globales y por neonato. Para soportar exportación por filtros
            clínicos o por rangos de fecha, será necesario ampliar el backend con nuevos endpoints o parámetros
            de consulta.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}
      </div>
    </AppLayout>
  );
}