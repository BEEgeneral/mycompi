/**
 * Auth payload + context types
 */
export interface AuthPayload {
  usuarioId: string;
  clienteId: string;
  email: string;
  iat: number;
  exp: number;
}
