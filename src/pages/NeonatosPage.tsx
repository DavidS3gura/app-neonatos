import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { neonatoService, type Neonato } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2 } from 'lucide-react';

type NeonatoForm = {
  codigo_rn: string;
  sexo: 'M' | 'F';
  eg_semanas: string;
  eg_dias: string;
  peso_nacer: string;
  diagnostico_principal: string;
  dias_estancia: string;
};

const initialForm: NeonatoForm = {
  codigo_rn: '',
  sexo: 'M',
  eg_semanas: '',
  eg_dias: '',
  peso_nacer: '',
  diagnostico_principal: '',
  dias_estancia: '',
};

export default function NeonatosPage() {
  const [neonatos, setNeonatos] = useState<Neonato[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NeonatoForm>(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await neonatoService.getAll();
      setNeonatos(data);
      setError('');
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los neonatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setError('');
  };

  const toNumber = (value: string) => Number(value);

  const validateForm = () => {
    if (!form.codigo_rn.trim()) {
      return 'Código RN requerido';
    }

    if (form.eg_semanas.trim() === '') {
      return 'La edad gestacional en semanas es obligatoria';
    }

    if (form.eg_dias.trim() === '') {
      return 'Los días de edad gestacional son obligatorios';
    }

    if (form.peso_nacer.trim() === '') {
      return 'El peso al nacer es obligatorio';
    }

    if (form.dias_estancia.trim() === '') {
      return 'Los días de estancia son obligatorios';
    }

    if (!form.diagnostico_principal.trim()) {
      return 'El diagnóstico principal es obligatorio';
    }

    const egSemanas = toNumber(form.eg_semanas);
    const egDias = toNumber(form.eg_dias);
    const pesoNacer = toNumber(form.peso_nacer);
    const diasEstancia = toNumber(form.dias_estancia);

    if (!Number.isInteger(egSemanas) || egSemanas < 20 || egSemanas > 45) {
      return 'La edad gestacional en semanas debe estar entre 20 y 45';
    }

    if (!Number.isInteger(egDias) || egDias < 0 || egDias > 6) {
      return 'Los días de edad gestacional deben estar entre 0 y 6';
    }

    if (Number.isNaN(pesoNacer) || pesoNacer <= 0) {
      return 'El peso al nacer debe ser mayor que 0';
    }

    if (!Number.isInteger(diasEstancia) || diasEstancia < 0) {
      return 'Los días de estancia no pueden ser negativos';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        codigo_rn: form.codigo_rn.trim(),
        sexo: form.sexo,
        eg_semanas: Number(form.eg_semanas),
        eg_dias: Number(form.eg_dias),
        peso_nacer: Number(form.peso_nacer),
        diagnostico_principal: form.diagnostico_principal.trim(),
        dias_estancia: Number(form.dias_estancia),
      };

      if (editId) {
        await neonatoService.update(editId, payload);
      } else {
        await neonatoService.create(payload);
      }

      await loadData();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (n: Neonato) => {
    setForm({
      codigo_rn: n.codigo_rn,
      sexo: n.sexo,
      eg_semanas: String(n.eg_semanas),
      eg_dias: String(n.eg_dias),
      peso_nacer: String(n.peso_nacer),
      diagnostico_principal: n.diagnostico_principal,
      dias_estancia: String(n.dias_estancia),
    });
    setEditId(n.id);
    setShowForm(true);
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
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Neonatos</h1>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="h-12 text-base gap-2"
          >
            <Plus size={18} />
            Nuevo Neonato
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="clinical-card space-y-5">
            <h2 className="text-lg font-semibold">
              {editId ? 'Editar' : 'Registrar'} Neonato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código RN *</label>
                <Input
                  className="h-12 text-base"
                  value={form.codigo_rn}
                  onChange={(e) =>
                    setForm({ ...form, codigo_rn: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo *</label>
                <div className="flex gap-3">
                  {(['M', 'F'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, sexo: s })}
                      className={`scale-button ${
                        form.sexo === s
                          ? 'scale-button-active'
                          : 'scale-button-inactive'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  EG Semanas * (20-45)
                </label>
                <Input
                  type="number"
                  min={20}
                  max={45}
                  inputMode="numeric"
                  className="h-12 text-base"
                  value={form.eg_semanas}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eg_semanas: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">EG Días * (0-6)</label>
                <Input
                  type="number"
                  min={0}
                  max={6}
                  inputMode="numeric"
                  className="h-12 text-base"
                  value={form.eg_dias}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eg_dias: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Peso al nacer (g) *
                </label>
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className="h-12 text-base"
                  value={form.peso_nacer}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      peso_nacer: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Días de estancia *
                </label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className="h-12 text-base"
                  value={form.dias_estancia}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dias_estancia: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">
                  Diagnóstico principal *
                </label>
                <Input
                  className="h-12 text-base"
                  value={form.diagnostico_principal}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      diagnostico_principal: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="h-12 text-base"
                disabled={submitting}
              >
                {submitting
                  ? 'Guardando...'
                  : editId
                  ? 'Actualizar'
                  : 'Registrar'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-12 text-base"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {neonatos.length === 0 ? (
            <div className="clinical-card text-center text-muted-foreground py-12">
              No hay neonatos registrados. Haz clic en "Nuevo Neonato" para
              comenzar.
            </div>
          ) : (
            neonatos.map((n) => (
              <div
                key={n.id}
                className="clinical-card flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-semibold text-lg">{n.codigo_rn}</p>
                    <p className="text-sm text-muted-foreground">
                      Sexo: {n.sexo} · EG: {n.eg_semanas}s {n.eg_dias}d · Peso:{' '}
                      {n.peso_nacer}g
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {n.diagnostico_principal}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => startEdit(n)}
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}