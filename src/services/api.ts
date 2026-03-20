const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'investigador';
  activo: boolean;
  created_at: string;
}

export interface Neonato {
  id: string;
  codigo_rn: string;
  sexo: 'M' | 'F';
  eg_semanas: number;
  eg_dias: number;
  peso_nacer: number;
  diagnostico_principal: string;
  dias_estancia: number;
  created_at: string;
}

export interface Observacion {
  id: string;
  neonato_id: string;
  fecha: string;
  hora: string;
  observador: string;
  posicion_comoda: number;
  spo2: number;
  fr: number;
  fc: number;
  observaciones: string;
  created_at: string;
}

function getToken(): string | null {
  return localStorage.getItem('hc_token');
}

function setToken(token: string) {
  localStorage.setItem('hc_token', token);
}

function clearToken() {
  localStorage.removeItem('hc_token');
  localStorage.removeItem('hc_user');
}

function setStoredUser(user: Usuario) {
  localStorage.setItem('hc_user', JSON.stringify(user));
}

function getStoredUser(): Usuario | null {
  try {
    const d = localStorage.getItem('hc_user');
    return d ? JSON.parse(d) : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/';
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let errorMessage = `Error ${res.status}`;

    try {
      if (contentType.includes('application/json')) {
        const body = await res.json();
        errorMessage = body.error || body.message || errorMessage;
      } else {
        errorMessage = await res.text();
      }
    } catch {
      errorMessage = `Error ${res.status}`;
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: Usuario } | null> {
    try {
      const data = await request<{ token: string; user: Usuario }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setStoredUser(data.user);
      return data;
    } catch {
      return null;
    }
  },

  logout() {
    clearToken();
  },

  getUser(): Usuario | null {
    return getStoredUser();
  },

  getToken,

  isAuthenticated(): boolean {
    return !!getToken();
  },
};

export const neonatoService = {
  async getAll(): Promise<Neonato[]> {
    return request<Neonato[]>('/neonatos');
  },

  async getById(id: string): Promise<Neonato & { observaciones?: Observacion[] }> {
    return request(`/neonatos/${id}`);
  },

  async getByCode(code: string): Promise<Neonato & { observaciones?: Observacion[] }> {
    return request(`/neonatos/code/${encodeURIComponent(code)}`);
  },

  async create(data: Omit<Neonato, 'id' | 'created_at'>): Promise<Neonato> {
    return request('/neonatos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Neonato>): Promise<Neonato> {
    return request(`/neonatos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

    async delete(id: string): Promise<{ message: string }> {
    return request(`/neonatos/${id}`, {
      method: 'DELETE',
    });
  },
  
};

export const observacionService = {
  async getAll(): Promise<Observacion[]> {
    return request<Observacion[]>('/observaciones');
  },

  async getByNeonato(neonatoId: string): Promise<Observacion[]> {
    return request(`/observaciones/neonato/${neonatoId}`);
  },

  async create(data: Omit<Observacion, 'id' | 'created_at'>): Promise<Observacion> {
    return request('/observaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request(`/observaciones/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteByNeonato(neonatoId: string): Promise<{ message: string; count: number }> {
    return request(`/observaciones/neonato/${neonatoId}/todas`, {
      method: 'DELETE',
    });
  },
};

export const usuarioService = {
  async getAll(): Promise<Usuario[]> {
    return request<Usuario[]>('/usuarios');
  },

  async create(data: {
    nombre: string;
    email: string;
    password: string;
    rol: 'admin' | 'investigador';
  }): Promise<Usuario> {
    return request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleActive(id: string): Promise<Usuario> {
    return request(`/usuarios/${id}/activar`, {
      method: 'PATCH',
    });
  },
};

export const exportService = {
  async downloadFile(path: string, filename: string) {
    const token = getToken();

    const res = await fetch(`${API_URL}/api${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      clearToken();
      window.location.href = '/';
      throw new Error('No autorizado');
    }

    if (!res.ok) {
      throw new Error('Error al exportar');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async exportNeonatosXLSX() {
    return this.downloadFile('/export/neonatos', 'neonatos.xlsx');
  },

  async exportObservacionesXLSX() {
    return this.downloadFile('/export/observaciones', 'observaciones.xlsx');
  },

  async exportNeonatosCSV() {
    return this.downloadFile('/export/neonatos/csv', 'neonatos.csv');
  },

  async exportObservacionesCSV() {
    return this.downloadFile('/export/observaciones/csv', 'observaciones.csv');
  },

  async exportNeonatoCSV(neonatoId: string, codigoRn?: string) {
    return this.downloadFile(
      `/export/neonatos/${neonatoId}/csv`,
      `neonato_${codigoRn || neonatoId}.csv`
    );
  },

  async exportNeonatoXLSX(neonatoId: string, codigoRn?: string) {
    return this.downloadFile(
      `/export/neonatos/${neonatoId}/xlsx`,
      `neonato_${codigoRn || neonatoId}.xlsx`
    );
  },

  async exportObservacionesByNeonatoCSV(neonatoId: string, codigoRn?: string) {
    return this.downloadFile(
      `/export/observaciones/neonato/${neonatoId}/csv`,
      `observaciones_${codigoRn || neonatoId}.csv`
    );
  },

  async exportObservacionesByNeonatoXLSX(neonatoId: string, codigoRn?: string) {
    return this.downloadFile(
      `/export/observaciones/neonato/${neonatoId}/xlsx`,
      `observaciones_${codigoRn || neonatoId}.xlsx`
    );
  },
};

export { API_URL };