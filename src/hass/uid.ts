// crypto.randomUUID requires a secure context (HTTPS or localhost). HA is
// often accessed over plain HTTP on a LAN hostname, where the function is
// undefined. Mock data only needs uniqueness, not cryptographic strength.
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `m-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;
}
