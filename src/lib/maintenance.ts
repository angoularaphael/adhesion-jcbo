import { getConfigValue, setConfigValue } from "./store-admin";

export const MAINTENANCE_KEYS = {
  adherent: "maintenance_adherent",
  vitrine: "maintenance_vitrine",
} as const;

export type MaintenanceStatus = {
  adherent: boolean;
  vitrine: boolean;
};

function parseBool(value: string): boolean {
  return value === "true" || value === "1";
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const [adherent, vitrine] = await Promise.all([
    getConfigValue(MAINTENANCE_KEYS.adherent),
    getConfigValue(MAINTENANCE_KEYS.vitrine),
  ]);
  return {
    adherent: parseBool(adherent),
    vitrine: parseBool(vitrine),
  };
}

export async function setMaintenanceFlag(
  site: keyof MaintenanceStatus,
  enabled: boolean
): Promise<MaintenanceStatus> {
  const key = site === "adherent" ? MAINTENANCE_KEYS.adherent : MAINTENANCE_KEYS.vitrine;
  await setConfigValue(key, enabled ? "true" : "false");
  return getMaintenanceStatus();
}
