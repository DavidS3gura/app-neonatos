export type UserRole = "admin" | "investigador";

const hiddenModulesByRole: Record<UserRole, string[]> = {
  admin: [],
  investigador: ["observaciones", "historial", "exportar"],
};

export function canAccessModule(role: UserRole, moduleName: string): boolean {
  return !hiddenModulesByRole[role].includes(moduleName);
}