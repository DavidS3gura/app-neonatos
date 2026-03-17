import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { usuarioService, type Usuario } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, UserCheck, UserX } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'investigador' as 'admin' | 'investigador' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usuarioService.create(form);
      await loadData();
      setShowForm(false);
      setForm({ nombre: '', email: '', password: '', rol: 'investigador' });
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (id: string) => {
    try {
      await usuarioService.toggleActive(id);
      await loadData();
    } catch (err) { console.error(err); }
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Cargando...</p></div></AppLayout>;

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <Button onClick={() => setShowForm(!showForm)} className="h-12 text-base gap-2">
            <Plus size={18} /> Nuevo Usuario
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="clinical-card space-y-4">
            <h2 className="text-lg font-semibold">Crear Usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input className="h-12 text-base" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" className="h-12 text-base" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <Input type="password" className="h-12 text-base" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <div className="flex gap-3">
                  {(['investigador', 'admin'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setForm({...form, rol: r})}
                      className={`scale-button text-sm ${form.rol === r ? 'scale-button-active' : 'scale-button-inactive'}`} style={{ width: 'auto', padding: '0 20px' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="h-12 text-base" disabled={submitting}>{submitting ? 'Creando...' : 'Crear'}</Button>
              <Button type="button" variant="outline" className="h-12 text-base" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {usuarios.map(u => (
            <div key={u.id} className="clinical-card flex items-center justify-between">
              <div>
                <p className="font-semibold">{u.nombre}</p>
                <p className="text-sm text-muted-foreground">{u.email} · <span className="capitalize">{u.rol}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${u.activo ? 'text-secondary' : 'text-destructive'}`}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => toggleActive(u.id)}>
                  {u.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
