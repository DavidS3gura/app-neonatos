import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  neonatoService,
  observacionService,
  type Neonato,
} from '@/services/api';
import {
  getDefaultScale,
  getSpo2Scale,
  type ScaleLevel,
} from '@/lib/observation-scales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScaleInput from '@/components/ScaleInput';
import { Search } from 'lucide-react';

type ObservacionForm = {
  fecha: string;
  hora: string;
  observador: string;
  posicion_comoda: number;
  spo2: number;
  fr: number;
  fc: number;
  observaciones: string;
};

const initialForm = (): ObservacionForm => ({
  fecha: new Date().toISOString().split('T')[0],
  hora: new Date().toTimeString().slice(0, 5),
  observador: '',
  posicion_comoda: 0,
  spo2: 0,
  fr: 0,
  fc: 0,
  observaciones: '',
});

function ScaleInterpretationCard({
  title,
  info,
}: {
  title: string;
  info: ScaleLevel | null;
}) {
  if (!info) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
      <p className="text-sm font-semibold text-primary">{title}</p>
      <div className="text-sm space-y-1">
        <p>
          <strong>Puntaje:</strong> {info.score}
        </p>
        <p>
          <strong>Categoría:</strong> {info.category}
        </p>
        <p>
          <strong>Rango:</strong> {info.range}
        </p>
        <p>
          <strong>Interpretación:</strong> {info.interpretation}
        </p>
      </div>
    </div>
  );
}

export default function ObservacionesPage() {
  const [neonatos, setNeonatos] = useState<Neonato[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeonato, setSelectedNeonato] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<ObservacionForm>(initialForm());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    neonatoService
      .getAll()
      .then(setNeonatos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const recentNeonatos = useMemo(() => neonatos.slice(0, 3), [neonatos]);

  const filteredNeonatos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];

    return neonatos
      .filter((n) => n.codigo_rn.toLowerCase().includes(term))
      .slice(0, 10);
  }, [neonatos, search]);

  const selectedNeonatoData = useMemo(
    () => neonatos.find((n) => n.id === selectedNeonato) || null,
    [neonatos, selectedNeonato]
  );

  const posicionComodaInfo = useMemo(
    () => getDefaultScale(form.posicion_comoda),
    [form.posicion_comoda]
  );

  const spo2Info = useMemo(() => getSpo2Scale(form.spo2), [form.spo2]);

  const frInfo = useMemo(() => getDefaultScale(form.fr), [form.fr]);

  const fcInfo = useMemo(() => getDefaultScale(form.fc), [form.fc]);

  const validateForm = () => {
    if (!selectedNeonato) return 'Debe seleccionar un neonato';
    if (!form.fecha) return 'La fecha es obligatoria';
    if (!form.hora) return 'La hora es obligatoria';
    if (!form.observador.trim()) return 'El observador es obligatorio';
    if (form.posicion_comoda < 1 || form.posicion_comoda > 5) {
      return 'Debe seleccionar un valor de 1 a 5 para Posición Cómoda';
    }
    if (form.spo2 < 1 || form.spo2 > 5) {
      return 'Debe seleccionar un valor de 1 a 5 para SpO₂';
    }
    if (form.fr < 1 || form.fr > 5) {
      return 'Debe seleccionar un valor de 1 a 5 para FR';
    }
    if (form.fc < 1 || form.fc > 5) {
      return 'Debe seleccionar un valor de 1 a 5 para FC';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await observacionService.create({
        neonato_id: selectedNeonato,
        fecha: form.fecha,
        hora: form.hora,
        observador: form.observador.trim(),
        posicion_comoda: form.posicion_comoda,
        spo2: form.spo2,
        fr: form.fr,
        fc: form.fc,
        observaciones: form.observaciones.trim(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setForm({
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
        observador: form.observador,
        posicion_comoda: 0,
        spo2: 0,
        fr: 0,
        fc: 0,
        observaciones: '',
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al registrar la observación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectNeonato = (id: string) => {
    setSelectedNeonato(id);
    setError('');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold">Nueva Observación</h1>

        {neonatos.length === 0 ? (
          <div className="clinical-card text-center text-muted-foreground py-12">
            Primero registra un neonato para poder agregar observaciones.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="clinical-card space-y-5">
              <h2 className="text-lg font-semibold">Seleccionar Neonato</h2>

              <div className="space-y-3">
                <p className="text-sm font-medium">Neonatos más recientes</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recentNeonatos.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleSelectNeonato(n.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-150 active:scale-[0.97] ${
                        selectedNeonato === n.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <p className="font-semibold">{n.codigo_rn}</p>
                      <p className="text-xs text-muted-foreground">
                        {n.sexo} · {n.eg_semanas}s {n.eg_dias}d
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Buscar neonato por código RN</p>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="h-12 text-base pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ej: RN001"
                  />
                </div>

                {search.trim() && (
                  <div className="space-y-2">
                    {filteredNeonatos.length === 0 ? (
                      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                        No se encontraron neonatos con ese código.
                      </div>
                    ) : (
                      filteredNeonatos.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleSelectNeonato(n.id)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-150 active:scale-[0.99] ${
                            selectedNeonato === n.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card'
                          }`}
                        >
                          <p className="font-semibold">{n.codigo_rn}</p>
                          <p className="text-xs text-muted-foreground">
                            {n.sexo} · {n.eg_semanas}s {n.eg_dias}d · Peso:{' '}
                            {n.peso_nacer}g
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedNeonatoData ? (
              <>
                <div className="clinical-card border-primary/30 bg-primary/5">
                  <h2 className="text-lg font-semibold mb-2">
                    Neonato seleccionado
                  </h2>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Código RN:</strong> {selectedNeonatoData.codigo_rn}
                    </p>
                    <p>
                      <strong>Sexo:</strong> {selectedNeonatoData.sexo}
                    </p>
                    <p>
                      <strong>EG:</strong> {selectedNeonatoData.eg_semanas}s{' '}
                      {selectedNeonatoData.eg_dias}d
                    </p>
                    <p>
                      <strong>Peso:</strong> {selectedNeonatoData.peso_nacer} g
                    </p>
                    <p>
                      <strong>Diagnóstico:</strong>{' '}
                      {selectedNeonatoData.diagnostico_principal}
                    </p>
                  </div>
                </div>

                <div className="clinical-card space-y-4">
                  <h2 className="text-lg font-semibold">Datos de la observación</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fecha *</label>
                      <Input
                        type="date"
                        className="h-12 text-base"
                        value={form.fecha}
                        onChange={(e) =>
                          setForm({ ...form, fecha: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hora *</label>
                      <Input
                        type="time"
                        className="h-12 text-base"
                        value={form.hora}
                        onChange={(e) =>
                          setForm({ ...form, hora: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Observador *</label>
                      <Input
                        className="h-12 text-base"
                        value={form.observador}
                        onChange={(e) =>
                          setForm({ ...form, observador: e.target.value })
                        }
                        placeholder="Nombre"
                      />
                    </div>
                  </div>
                </div>

                <div className="clinical-card space-y-6">
                  <h2 className="text-lg font-semibold">Escalas Clínicas</h2>

                  <div className="space-y-3">
                    <ScaleInput
                      label="Posición Cómoda"
                      value={form.posicion_comoda}
                      onChange={(v) =>
                        setForm({ ...form, posicion_comoda: Number(v) })
                      }
                    />
                    <ScaleInterpretationCard
                      title="Interpretación de Posición Cómoda"
                      info={posicionComodaInfo}
                    />
                  </div>

                  <div className="space-y-3">
                    <ScaleInput
                      label="SpO₂"
                      value={form.spo2}
                      onChange={(v) => setForm({ ...form, spo2: Number(v) })}
                    />
                    <ScaleInterpretationCard
                      title="Interpretación de SpO₂"
                      info={spo2Info}
                    />
                  </div>

                  <div className="space-y-3">
                    <ScaleInput
                      label="Frecuencia Respiratoria (FR)"
                      value={form.fr}
                      onChange={(v) => setForm({ ...form, fr: Number(v) })}
                    />
                    <ScaleInterpretationCard
                      title="Interpretación de Frecuencia Respiratoria"
                      info={frInfo}
                    />
                  </div>

                  <div className="space-y-3">
                    <ScaleInput
                      label="Frecuencia Cardíaca (FC)"
                      value={form.fc}
                      onChange={(v) => setForm({ ...form, fc: Number(v) })}
                    />
                    <ScaleInterpretationCard
                      title="Interpretación de Frecuencia Cardíaca"
                      info={fcInfo}
                    />
                  </div>
                </div>

                <div className="clinical-card space-y-4">
                  <h2 className="text-lg font-semibold">Observaciones adicionales</h2>
                  <textarea
                    className="w-full h-24 p-3 rounded-lg border border-border text-base bg-card resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.observaciones}
                    onChange={(e) =>
                      setForm({ ...form, observaciones: e.target.value })
                    }
                    placeholder="Notas adicionales..."
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 rounded-lg bg-secondary/10 text-secondary font-medium border border-secondary/20">
                    ✓ Observación registrada correctamente
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Registrar Observación'}
                </Button>
              </>
            ) : (
              <div className="clinical-card text-center text-muted-foreground py-10">
                Selecciona un neonato para habilitar el formulario de observación.
              </div>
            )}
          </form>
        )}
      </div>
    </AppLayout>
  );
}