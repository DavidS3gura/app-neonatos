# Panel de Registro
-   Se debe de ajustar el campo EG para que permita decimales.


Nota para después: auditoría real en Historial

Objetivo: que el módulo Historial no solo muestre observaciones, sino también trazabilidad real de cambios sobre el registro clínico.

Qué queremos lograr

mostrar qué registro cambió

mostrar qué campo cambió

mostrar valor anterior

mostrar valor nuevo

mostrar quién hizo el cambio

mostrar fecha y hora del cambio

Ejemplos esperados

peso al nacer: 1320 → 1290

diagnóstico principal: SDR → SDR + sepsis

actualizado por: David

fecha: 2026-03-19 14:30

Qué implica técnicamente

Backend

crear tabla de auditoría, por ejemplo AuditLog

registrar eventos al crear, editar o eliminar

guardar:

entidad

entidad_id

campo

valor_anterior

valor_nuevo

accion

usuario_id

fecha_hora

Prisma

nuevo modelo AuditLog

migración

Express

lógica para escribir logs al modificar neonatos y observaciones

endpoint para consultar historial de cambios

Frontend

en Historial, separar:

observaciones registradas

cambios del registro

modal o tabla para ver el detalle

Prioridad

importante, pero no bloqueante

se puede hacer después de filtros y exportaciones