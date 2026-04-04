/**
 * Custom env + context types para MyCompi Worker
 */
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
  RESEND_API_KEY: string;
  MINIMAX_API_KEY: string;
  AGENT_API_KEY: string;
  OWNER_KEY: string;
}

export interface AuthPayload {
  usuarioId: string;
  clienteId: string;
  email: string;
  iat: number;
  exp: number;
}
