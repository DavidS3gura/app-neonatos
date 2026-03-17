import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { exportService, neonatoService, type Neonato } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ExportarPage() {
  const [loading, setLoading] = useState('');
  const [neonatos, setNeonatos] = useState<Neonato[]>([]);
  const [selectedNeonatoId, setSelectedNeonatoId] = useState('');
  const [selectedNeonatoCode, setSelectedNeonatoCode] = useState('');
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

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold">Exportar Datos</h1>

        <div className="clinical-card space-y-4">
          <h2 className="text-lg font-semibold">Neonatos</h2>
          <p className="text-sm text-muted-foreground">
            Exportar todos los registros de neonatos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleExport(() => exportService.exportNeonatosCSV(), 'nc')}
              className="h-12 text-base gap-2"
              disabled={!!loading}
            >
              <Download size={18} />
              {loading === 'nc' ? 'Descargando...' : 'CSV'}
            </Button>

            <Button
              onClick={() => handleExport(() => exportService.exportNeonatosXLSX(), 'nx')}
              className="h-12 text-base gap-2"
              disabled={!!loading}
            >
              <Download size={18} />
              {loading === 'nx' ? 'Descargando...' : 'Excel'}
            </Button>
          </div>
        </div>

        <div className="clinical-card space-y-4">
          <h2 className="text-lg font-semibold">Observaciones</h2>
          <p className="text-sm text-muted-foreground">
            Exportar todas las observaciones.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                handleExport(() => exportService.exportObservacionesCSV(), 'oc')
              }
              className="h-12 text-base gap-2"
              disabled={!!loading}
            >
              <Download size={18} />
              {loading === 'oc' ? 'Descargando...' : 'CSV'}
            </Button>

            <Button
              onClick={() =>
                handleExport(() => exportService.exportObservacionesXLSX(), 'ox')
              }
              className="h-12 text-base gap-2"
              disabled={!!loading}
            >
              <Download size={18} />
              {loading === 'ox' ? 'Descargando...' : 'Excel'}
            </Button>
          </div>
        </div>

        <div className="clinical-card space-y-4">
          <h2 className="text-lg font-semibold">Exportar por neonato</h2>
          <p className="text-sm text-muted-foreground">
            Selecciona un neonato para exportar su ficha o sus observaciones.
          </p>

          <select
            className="w-full h-12 rounded-lg border border-border bg-card px-3 text-base"
            value={selectedNeonatoId}
            onChange={(e) => handleSelectNeonato(e.target.value)}
          >
            <option value="">Seleccionar neonato...</option>
            {neonatos.map((n) => (
              <option key={n.id} value={n.id}>
                {n.codigo_rn} - {n.sexo} - {n.eg_semanas}s {n.eg_dias}d
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3">
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
              <Download size={18} />
              {loading === 'nnc' ? 'Descargando...' : 'Ficha neonato CSV'}
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
              <Download size={18} />
              {loading === 'nnx' ? 'Descargando...' : 'Ficha neonato Excel'}
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

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}
      </div>
    </AppLayout>
  );
}