--
-- PostgreSQL database dump
--

\restrict 7Y1xeQoQ5egZiGMst9yBOLHkD2qmftfnAkVVHvQjEy03OTSRlpSpoliBnFbWhvb

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoAgente; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."EstadoAgente" AS ENUM (
    'ACTIVO',
    'DESCANSANDO',
    'OFFLINE'
);


ALTER TYPE public."EstadoAgente" OWNER TO mycompi;

--
-- Name: EstadoChat; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."EstadoChat" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."EstadoChat" OWNER TO mycompi;

--
-- Name: EstadoEmail; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."EstadoEmail" AS ENUM (
    'RECIBIDO',
    'PROCESANDO',
    'RESPONDIDO',
    'FALLIDO'
);


ALTER TYPE public."EstadoEmail" OWNER TO mycompi;

--
-- Name: EstadoPago; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."EstadoPago" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."EstadoPago" OWNER TO mycompi;

--
-- Name: EstadoTrabajo; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."EstadoTrabajo" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'BLOCKED'
);


ALTER TYPE public."EstadoTrabajo" OWNER TO mycompi;

--
-- Name: Plan; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."Plan" AS ENUM (
    'BASICO',
    'EQUIPO',
    'DIRECCION',
    'COMPLETO'
);


ALTER TYPE public."Plan" OWNER TO mycompi;

--
-- Name: Prioridad; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."Prioridad" AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);


ALTER TYPE public."Prioridad" OWNER TO mycompi;

--
-- Name: Rol; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."Rol" AS ENUM (
    'OWNER',
    'USUARIO',
    'VIEWER'
);


ALTER TYPE public."Rol" OWNER TO mycompi;

--
-- Name: RolPlatform; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."RolPlatform" AS ENUM (
    'ADMIN',
    'CLIENT'
);


ALTER TYPE public."RolPlatform" OWNER TO mycompi;

--
-- Name: TipoAgente; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."TipoAgente" AS ENUM (
    'ENGINEERING',
    'MARKETING',
    'SALES',
    'SUPPORT',
    'DATA',
    'RESEARCH',
    'CONTENT',
    'CEO'
);


ALTER TYPE public."TipoAgente" OWNER TO mycompi;

--
-- Name: TipoDocumento; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."TipoDocumento" AS ENUM (
    'MISION',
    'PRODUCTO',
    'BRAND_VOICE',
    'USER_RESEARCH',
    'TECNICO',
    'MEMORIA_AGENTE'
);


ALTER TYPE public."TipoDocumento" OWNER TO mycompi;

--
-- Name: TipoMensaje; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."TipoMensaje" AS ENUM (
    'MENSAJE',
    'ALERTA',
    'REPORTE',
    'SOLICITUD'
);


ALTER TYPE public."TipoMensaje" OWNER TO mycompi;

--
-- Name: TipoNotificacion; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."TipoNotificacion" AS ENUM (
    'INFO',
    'WARNING',
    'ERROR',
    'SUCCESS'
);


ALTER TYPE public."TipoNotificacion" OWNER TO mycompi;

--
-- Name: TipoPago; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."TipoPago" AS ENUM (
    'SUSCRIPCION',
    'EXTRA',
    'META_ADS'
);


ALTER TYPE public."TipoPago" OWNER TO mycompi;

--
-- Name: TipoPeticion; Type: TYPE; Schema: public; Owner: mycompi
--

CREATE TYPE public."TipoPeticion" AS ENUM (
    'CREAR_CONTENIDO',
    'CONSULTAR_INFO',
    'MODIFICAR_SOLICITUD',
    'QUEJA',
    'ALERTA',
    'OTRO'
);


ALTER TYPE public."TipoPeticion" OWNER TO mycompi;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivationToken; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."ActivationToken" (
    id text NOT NULL,
    token text NOT NULL,
    email text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ActivationToken" OWNER TO mycompi;

--
-- Name: AgentLearning; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."AgentLearning" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "agenteId" text NOT NULL,
    "clienteId" text NOT NULL,
    contexto text NOT NULL,
    decision text NOT NULL,
    resultado text NOT NULL,
    rating integer,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);


ALTER TABLE public."AgentLearning" OWNER TO mycompi;

--
-- Name: AgentSkill; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."AgentSkill" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "agenteId" text NOT NULL,
    "skillId" text NOT NULL,
    "installedAt" timestamp with time zone DEFAULT now(),
    activo boolean DEFAULT true,
    "usageCount" integer DEFAULT 0
);


ALTER TABLE public."AgentSkill" OWNER TO mycompi;

--
-- Name: Agente; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Agente" (
    id text NOT NULL,
    "clienteId" text NOT NULL,
    "workerId" text NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    tipo public."TipoAgente" NOT NULL,
    personalidad text,
    bio text,
    birthday timestamp(3) without time zone,
    habilidades text[],
    "modelId" text DEFAULT 'minimax/MiniMax-M2.7'::text NOT NULL,
    config jsonb,
    estado public."EstadoAgente" DEFAULT 'ACTIVO'::public."EstadoAgente" NOT NULL,
    horario jsonb,
    memory jsonb,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ultimoResetTokens" timestamp with time zone DEFAULT now() NOT NULL,
    "activoHeartbeat" boolean DEFAULT true NOT NULL,
    "budgetTokensMes" bigint DEFAULT 1000000 NOT NULL,
    "alertaPorcentaje" integer DEFAULT 80 NOT NULL,
    "tokensUsadosMes" bigint DEFAULT 0 NOT NULL,
    "ultimoHeartbeat" timestamp with time zone
);


ALTER TABLE public."Agente" OWNER TO mycompi;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."AuditLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    clienteid text NOT NULL,
    agenteid text,
    accion text NOT NULL,
    recursotipo text NOT NULL,
    recursoid text,
    detalle jsonb,
    costetokens bigint,
    createdat timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO mycompi;

--
-- Name: Cliente; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Cliente" (
    id text NOT NULL,
    nombre text NOT NULL,
    slug text NOT NULL,
    email text NOT NULL,
    plan public."Plan" DEFAULT 'BASICO'::public."Plan" NOT NULL,
    logo text,
    "webUrl" text,
    "stripeCustomerId" text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cliente" OWNER TO mycompi;

--
-- Name: Documento; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Documento" (
    id text NOT NULL,
    "clienteId" text NOT NULL,
    tipo public."TipoDocumento" NOT NULL,
    titulo text NOT NULL,
    contenido text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Documento" OWNER TO mycompi;

--
-- Name: Email; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Email" (
    id text NOT NULL,
    "messageId" text,
    de text NOT NULL,
    para text NOT NULL,
    asunto character varying(500) NOT NULL,
    texto text NOT NULL,
    html text,
    raw text,
    "EstadoEmail" public."EstadoEmail" DEFAULT 'RECIBIDO'::public."EstadoEmail" NOT NULL,
    "clienteId" text,
    "interaccionId" text,
    "respuestaA" text,
    "agenteId" text DEFAULT 'paco'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Email" OWNER TO mycompi;

--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Feedback" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "trabajoId" text NOT NULL,
    "clienteId" text NOT NULL,
    rating integer NOT NULL,
    comentario text,
    "agenteId" text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now()
);


ALTER TABLE public."Feedback" OWNER TO mycompi;

--
-- Name: Handoff; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Handoff" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "clienteId" text NOT NULL,
    "deAgenteId" text NOT NULL,
    "aAgenteId" text NOT NULL,
    razon text NOT NULL,
    contexto text NOT NULL,
    resuelto boolean DEFAULT false,
    rating integer,
    "createdAt" timestamp with time zone DEFAULT now(),
    "resolvedAt" timestamp with time zone
);


ALTER TABLE public."Handoff" OWNER TO mycompi;

--
-- Name: InteraccionChat; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."InteraccionChat" (
    id text NOT NULL,
    "clienteId" text NOT NULL,
    "agenteId" text NOT NULL,
    "tipoPeticion" public."TipoPeticion" NOT NULL,
    "mensajeOriginal" text NOT NULL,
    resumen character varying(250),
    "respuestaAgente" text,
    "estadoChat" public."EstadoChat" DEFAULT 'PENDING'::public."EstadoChat" NOT NULL,
    "streamId" text,
    "clienteAcepta" boolean,
    "resultadoExitoso" boolean,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InteraccionChat" OWNER TO mycompi;

--
-- Name: Mensaje; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Mensaje" (
    id text NOT NULL,
    "agenteId" text NOT NULL,
    "paraAgenteId" text,
    contenido text NOT NULL,
    tipo public."TipoMensaje" DEFAULT 'MENSAJE'::public."TipoMensaje" NOT NULL,
    metadata jsonb,
    leido boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Mensaje" OWNER TO mycompi;

--
-- Name: Notificacion; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Notificacion" (
    id text NOT NULL,
    "clienteId" text NOT NULL,
    "agenteId" text DEFAULT 'sistema'::text NOT NULL,
    tipo public."TipoNotificacion" DEFAULT 'INFO'::public."TipoNotificacion" NOT NULL,
    titulo text NOT NULL,
    contenido text NOT NULL,
    leida boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notificacion" OWNER TO mycompi;

--
-- Name: OnboardingRun; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."OnboardingRun" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "clienteId" text NOT NULL,
    estado text DEFAULT 'scanning'::text,
    progreso integer DEFAULT 0,
    "scannedUrls" text[],
    briefing text,
    "startedAt" timestamp with time zone DEFAULT now(),
    "completedAt" timestamp with time zone
);


ALTER TABLE public."OnboardingRun" OWNER TO mycompi;

--
-- Name: OnboardingSequence; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."OnboardingSequence" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "clienteId" text NOT NULL,
    "dia1Sent" boolean DEFAULT false NOT NULL,
    "dia3Sent" boolean DEFAULT false NOT NULL,
    "dia7Sent" boolean DEFAULT false NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "startedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lastEmailAt" timestamp without time zone
);


ALTER TABLE public."OnboardingSequence" OWNER TO mycompi;

--
-- Name: Pago; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Pago" (
    id text NOT NULL,
    "clienteId" text NOT NULL,
    "stripePaymentId" text,
    cantidad double precision NOT NULL,
    moneda text DEFAULT 'EUR'::text NOT NULL,
    estado public."EstadoPago" NOT NULL,
    tipo public."TipoPago" NOT NULL,
    descripcion text,
    "fechaPago" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Pago" OWNER TO mycompi;

--
-- Name: Skill; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Skill" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    key text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    categoria text NOT NULL,
    contenido text DEFAULT ''::text,
    "sourceType" text DEFAULT 'custom'::text,
    "sourceUrl" text,
    "trustLevel" text DEFAULT 'verified'::text,
    "creadoEn" timestamp with time zone DEFAULT now(),
    "actualizadoAt" timestamp with time zone DEFAULT now()
);


ALTER TABLE public."Skill" OWNER TO mycompi;

--
-- Name: TeamHealth; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."TeamHealth" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "agenteId" text NOT NULL,
    semana text NOT NULL,
    actividad integer DEFAULT 0,
    "tasaExito" double precision DEFAULT 0,
    "ideasOff" integer DEFAULT 0,
    "budgetUsado" double precision DEFAULT 0,
    "createdAt" timestamp with time zone DEFAULT now()
);


ALTER TABLE public."TeamHealth" OWNER TO mycompi;

--
-- Name: TokenUsage; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."TokenUsage" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    clienteid text NOT NULL,
    agenteid text NOT NULL,
    trabajoid text,
    accion text NOT NULL,
    tokensusados bigint DEFAULT 0 NOT NULL,
    modelo text,
    costeeuros numeric(10,6),
    createdat timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."TokenUsage" OWNER TO mycompi;

--
-- Name: Trabajo; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Trabajo" (
    id text NOT NULL,
    "clienteId" text NOT NULL,
    "agenteId" text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    estado public."EstadoTrabajo" DEFAULT 'TODO'::public."EstadoTrabajo" NOT NULL,
    prioridad public."Prioridad" DEFAULT 'MEDIA'::public."Prioridad" NOT NULL,
    tags text[],
    "inputData" jsonb,
    "outputData" jsonb,
    "errorMsg" text,
    "estimatedHours" double precision,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "aprobadoPor" text,
    "aprobadoAt" timestamp with time zone,
    "notaAprobacion" text,
    "parentId" text,
    "requiereAprobacion" boolean DEFAULT false NOT NULL,
    ejecutor text,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."Trabajo" OWNER TO mycompi;

--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public."Usuario" (
    id text NOT NULL,
    "clienteId" text NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    rol public."Rol" DEFAULT 'USUARIO'::public."Rol" NOT NULL,
    idioma text DEFAULT 'es'::text NOT NULL,
    timezone text DEFAULT 'Europe/Madrid'::text NOT NULL,
    "ultimoAcceso" timestamp(3) without time zone,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    rol_platform public."RolPlatform" DEFAULT 'CLIENT'::public."RolPlatform" NOT NULL
);


ALTER TABLE public."Usuario" OWNER TO mycompi;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mycompi
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO mycompi;

--
-- Data for Name: ActivationToken; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."ActivationToken" (id, token, email, "expiresAt", used, "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: AgentLearning; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."AgentLearning" (id, "agenteId", "clienteId", contexto, decision, resultado, rating, "createdAt", "updatedAt") FROM stdin;
d037b96e-e402-4f39-ad41-edcd800eff44	cmnct7zvf0001r9tkvm0p3dbw	cmn3je5zq0000e31xg8wru9iy	Email a lead frío	Usar tono casual + pregunta abierta en vez de pitch formal	18% más respuesta en emails fríos	5	2026-04-09 19:38:35.92381+00	2026-04-09 19:38:35.92381+00
659d2d47-8dd0-423c-a867-c6173e1938a8	cmnct7zvf0001r9tkvm0p3dbw	cmn3je5zq0000e31xg8wru9iy	Post LinkedIn para cliente B2B	Titular con pregunta + 3 bullets con números	2.4x más engagement que promedio anterior	4	2026-04-09 19:38:35.930306+00	2026-04-09 19:38:35.930306+00
2a1b0841-d688-43b8-a24f-b96b375ab045	cmnct7zvf0001r9tkvm0p3dbw	cmn3je5zq0000e31xg8wru9iy	Reunión de cierre de venta	Menos features, más ROI concreto con cifras	30% mejora en tasa de conversión	5	2026-04-09 19:38:35.931326+00	2026-04-09 19:38:35.931326+00
\.


--
-- Data for Name: AgentSkill; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."AgentSkill" (id, "agenteId", "skillId", "installedAt", activo, "usageCount") FROM stdin;
98a75b66-f3a1-44fc-bd41-2923692b8f52	cmnct7zvf0001r9tkvm0p3dbw	e5dc2a23-98ba-4037-be9f-52b0236bc7c8	2026-04-09 20:01:26.313183+00	t	0
47520cc5-bdc0-4ca5-b3be-13489e9508cb	cmnct7zvf0001r9tkvm0p3dbw	0b017964-86de-4fd4-995f-1b4dc69f9546	2026-04-09 20:01:26.313183+00	t	0
701815fa-6ef3-4d74-a337-7230d47a7aa3	cmnct7zvf0001r9tkvm0p3dbw	d87106b4-2169-4ccc-969c-cceec6fb3880	2026-04-09 20:01:26.313183+00	t	0
35e8eca0-c266-4023-b6e6-a4ed5e8f1634	cmnct809d0003r9tkbdzelzv3	8f0efbce-52f1-48b6-b266-919c081790ee	2026-04-09 20:01:26.319412+00	t	0
c8f7e5b6-83ab-4682-ba96-0c47258a864f	cmnct809d0003r9tkbdzelzv3	815e8639-3c9a-413a-996d-a2f38450e633	2026-04-09 20:01:26.319412+00	t	0
484092cb-063b-4159-951e-7f16764f0ed1	cmnct809d0003r9tkbdzelzv3	7bfd83bf-f85e-491a-80d8-ccd311768af9	2026-04-09 20:01:26.319412+00	t	0
716e462c-4c34-4f89-a673-177f7dd4da95	cmnct809d0003r9tkbdzelzv3	e5dc2a23-98ba-4037-be9f-52b0236bc7c8	2026-04-09 20:01:26.319412+00	t	0
d37538ed-4dda-418a-82c8-d6769deadb13	cmnct80ih0005r9tkdmktoi7i	e5dc2a23-98ba-4037-be9f-52b0236bc7c8	2026-04-09 20:01:26.320932+00	t	0
0d6cd3cb-f128-4877-a627-c0fb6382cd06	cmnct80ih0005r9tkdmktoi7i	f45f92b4-1543-4308-a354-d109e1b76d63	2026-04-09 20:01:26.320932+00	t	0
205071f9-2836-40d2-84cf-f85c9e9e3416	cmnct80ih0005r9tkdmktoi7i	ba9cbb42-7726-4abe-8c62-1a86e73e0a12	2026-04-09 20:01:26.320932+00	t	0
d606d419-09ab-4354-a16a-e9ddfb1d6297	cmnct80rm0007r9tkodlpaghf	e5dc2a23-98ba-4037-be9f-52b0236bc7c8	2026-04-09 20:01:26.322025+00	t	0
a0bd1c43-9429-4211-91c2-ddb0d94306d3	cmnct80rm0007r9tkodlpaghf	0b017964-86de-4fd4-995f-1b4dc69f9546	2026-04-09 20:01:26.322025+00	t	0
88acaf08-5e3d-4943-80e0-06a5d999b879	cmnct80rm0007r9tkodlpaghf	d87106b4-2169-4ccc-969c-cceec6fb3880	2026-04-09 20:01:26.322025+00	t	0
bcda45ef-3956-43a7-9d63-443e1b52c350	cmnct810q0009r9tkib9nzb6z	7bfd83bf-f85e-491a-80d8-ccd311768af9	2026-04-09 20:01:26.323131+00	t	0
f1267f8d-1c3b-4b96-8bcd-8ff43c3eac43	cmnct810q0009r9tkib9nzb6z	6507359f-8874-49f2-a742-f88716f873ea	2026-04-09 20:01:26.323131+00	t	0
4c8d0778-e1a9-4f0e-b9d3-abb6296734f8	cmnct810q0009r9tkib9nzb6z	10f8698e-e27c-49ed-b229-e049645ed2a8	2026-04-09 20:01:26.323131+00	t	0
55fc9289-aaef-4a9d-a6d8-7a9ba6b67fb1	cmnct819t000br9tk1t1nm1f1	0c917391-214e-4e70-924e-c90e40b02200	2026-04-09 20:01:26.324247+00	t	0
bceedd62-bcf0-4086-ac3b-c93e8c99b557	cmnct819t000br9tk1t1nm1f1	c18fa8dd-30d5-4466-882a-f29919fbba9a	2026-04-09 20:01:26.324247+00	t	0
41c1139f-aba1-4d12-bac4-020f9fb58b1e	cmnct819t000br9tk1t1nm1f1	d1911acc-893c-4f16-9799-061a2b413dad	2026-04-09 20:01:26.324247+00	t	0
0d470730-ffd4-4f9a-9d9a-af8ed63f19ad	cmnct819t000br9tk1t1nm1f1	dc76640e-5cd0-4bdb-802f-3dabf0b08e7e	2026-04-09 20:01:26.324247+00	t	0
4b7e59da-ce4c-41ae-8e72-dabbe88a7a86	cmndh3yet0001r915hh6etshs	0b017964-86de-4fd4-995f-1b4dc69f9546	2026-04-09 20:01:26.32544+00	t	0
3c931a4a-4190-48d2-b82d-641089b181de	cmndh3yet0001r915hh6etshs	d87106b4-2169-4ccc-969c-cceec6fb3880	2026-04-09 20:01:26.32544+00	t	0
7ce42a6e-9ec5-4ae5-94c6-7b1b287bd86f	cmndh3yet0001r915hh6etshs	10f8698e-e27c-49ed-b229-e049645ed2a8	2026-04-09 20:01:26.32544+00	t	0
\.


--
-- Data for Name: Agente; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Agente" (id, "clienteId", "workerId", nombre, email, tipo, personalidad, bio, birthday, habilidades, "modelId", config, estado, horario, memory, activo, "createdAt", "updatedAt", "ultimoResetTokens", "activoHeartbeat", "budgetTokensMes", "alertaPorcentaje", "tokensUsadosMes", "ultimoHeartbeat") FROM stdin;
cmnct7zvf0001r9tkvm0p3dbw	cmn3je5zq0000e31xg8wru9iy	laura_atCliente_01	Laura Montes	laura@mycompi.com	SUPPORT	\N	\N	\N	{"atención al cliente",email,soporte}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-30 06:31:19.899	2026-03-30 06:31:19.899	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
cmnct809d0003r9tkbdzelzv3	cmn3je5zq0000e31xg8wru9iy	enzo_marketing_02	Enzo Costa	enzo@mycompi.com	MARKETING	\N	\N	\N	{"marketing digital",SEO,campañas}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-30 06:31:20.401	2026-03-30 06:31:20.401	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
cmnct80ih0005r9tkdmktoi7i	cmn3je5zq0000e31xg8wru9iy	carlos_ventas_03	Carlos Ruiz	carlos@mycompi.com	SALES	\N	\N	\N	{ventas,CRM,leads}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-30 06:31:20.729	2026-03-30 06:31:20.729	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
cmnct80rm0007r9tkodlpaghf	cmn3je5zq0000e31xg8wru9iy	elena_operaciones_04	Elena Ortega	elena@mycompi.com	ENGINEERING	\N	\N	\N	{operaciones,automatización,integraciones}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-30 06:31:21.058	2026-03-30 06:31:21.058	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
cmnct810q0009r9tkib9nzb6z	cmn3je5zq0000e31xg8wru9iy	diana_contabilidad_05	Diana Fabián	diana@mycompi.com	DATA	\N	\N	\N	{contabilidad,facturación,"análisis financiero"}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-30 06:31:21.386	2026-03-30 06:31:21.386	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
cmnct819t000br9tk1t1nm1f1	cmn3je5zq0000e31xg8wru9iy	marcos_legal_06	Marcos Torralba	marcos@mycompi.com	ENGINEERING	\N	\N	\N	{administración,legal,contratos}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-30 06:31:21.714	2026-03-30 06:31:21.714	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
cmndh3yet0001r915hh6etshs	cmn3je5zq0000e31xg8wru9iy	valeria_qa_07	Valeria Sanz	valeria@mycompi.com	ENGINEERING	\N	\N	\N	{QA,"quality assurance",testing,delivery}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-30 17:40:02.164	2026-03-30 17:43:34.251	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
a1c29523-4fb5-4a70-b029-9a8052da1ac0	cmn3je5zq0000e31xg8wru9iy	worker_paco_00	Paco	paco@mycompi.com	CEO	Orquestador, coordinador, director de equipo	\N	\N	{coordinación,delegación,supervisión,decisión}	minimax/MiniMax-M2.7	\N	ACTIVO	\N	\N	t	2026-03-31 15:49:47.886	2026-03-31 15:49:47.886	2026-03-31 17:13:56.969256+00	t	1000000	80	0	\N
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."AuditLog" (id, clienteid, agenteid, accion, recursotipo, recursoid, detalle, costetokens, createdat) FROM stdin;
97aeabd2-bcaa-40eb-8d5a-e3f1ec2cdd76	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	JOB_APROBADO	Trabajo	6e00f6b1-d006-4c17-a9ae-7d09d8fccc81	{"nota": "OK test", "trabajo": "🔍 Investigar empresa, sector y competencia", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 18:58:34.857545+00
3e7bcab8-393e-4501-98a0-7c496d1a97e0	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	JOB_APROBADO	Trabajo	25b4e9b3-892f-4a0f-8760-b1d7d9dac925	{"nota": "Aprobado por Alberto — ejecuten", "trabajo": "📧 Preparar emailing de bienvenida para el cliente", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 19:35:21.076752+00
b4241e14-73fb-42a3-aaad-59177a9ac626	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	JOB_APROBADO	Trabajo	5717edc9-9843-476a-bf76-70dd41900e76	{"nota": "Aprobado por Alberto — ejecuten", "trabajo": "🎯 Outreach: identificar 10 leads en sector del cliente", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 19:35:21.57834+00
7f4e9184-4643-4b50-8fec-1649898c07d8	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	JOB_APROBADO	Trabajo	1c5eaaed-365f-4832-89fe-92fd213485c5	{"nota": "Aprobado por Alberto — ejecuten", "trabajo": "📊 Análisis competitivo: 3-5 competidores directos", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 19:35:22.044676+00
6f273fc6-b5d9-4804-af7b-79ef40bde51d	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	JOB_APROBADO	Trabajo	08e215da-2e6b-4090-a1fd-916e7be10055	{"nota": "Aprobado por Alberto — ejecuten", "trabajo": "🤖 Implementar primera automatización de proceso", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 19:35:22.85665+00
c8c462da-ce43-4fa4-a1a5-5ed9dd4468c2	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	JOB_APROBADO	Trabajo	a250d678-02c3-46b4-a700-cf2efc75ca73	{"nota": "Aprobado por Alberto — ejecuten", "trabajo": "📈 Primer reporte de métricas: retención y uso", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 19:35:23.334233+00
ab397f57-8750-486b-81fc-f67cc470bee2	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	JOB_APROBADO	Trabajo	940617b5-23f8-473f-a77a-67f0451344b0	{"nota": "Aprobado por Alberto — ejecuten", "trabajo": "📢 Testear canal de adquisición: LinkedIn o email", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 19:35:23.818908+00
51bbdcd8-bb7c-4b8c-b591-33a0488289d4	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	JOB_APROBADO	Trabajo	40cc9a98-1af5-4a52-a90c-07409e47aa87	{"nota": "Aprobado por Alberto — ejecuten", "trabajo": "🎯 Escalar outreach si hay respuesta positiva", "aprobadoPor": "cmn3je6040002e31xi99h82gd"}	\N	2026-03-31 19:35:24.284619+00
c9f4cd77-a9ac-47d6-9d09-4c1856d6a7d8	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_sl	{"name": "Test SL", "type": "client", "entity_id": "test_sl", "properties": {"id": "cmn77j4yd0002b41efmeyg8o1"}}	\N	2026-04-10 22:17:05.398583+00
f9e69b82-7a80-41b4-b517-43901ee6a897	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test2_sl	{"name": "Test2 SL", "type": "client", "entity_id": "test2_sl", "properties": {"id": "cmn77tmsh0004e81e667qlyks"}}	\N	2026-04-10 22:17:05.402645+00
4c5cc940-933b-4e3e-9ebd-1ccde6468b31	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_testempresa	{"name": "TestEmpresa", "type": "client", "entity_id": "testempresa", "properties": {"id": "cmn7fddc60000ew1e76drd41a"}}	\N	2026-04-10 22:17:05.403548+00
bef77132-904c-4b0f-85f3-6d6023e532ee	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_tester	{"name": "Tester", "type": "client", "entity_id": "tester", "properties": {"id": "cmn7jgl500000j41enpnhqa2z"}}	\N	2026-04-10 22:17:05.404206+00
ae2c3b82-845c-4aeb-9e22-641ca31f2432	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_empresatest	{"name": "EmpresaTest", "type": "client", "entity_id": "empresatest", "properties": {"id": "cmn7jjmjm0003j41ekknkwjzf"}}	\N	2026-04-10 22:17:05.405103+00
7a908a25-89f9-474c-a3fe-3451a94c11e2	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_bee	{"name": "BEE", "type": "client", "entity_id": "bee", "properties": {"id": "cmnbhljm70000f01x9jbyuea1"}}	\N	2026-04-10 22:17:05.405839+00
aae91ca4-7bdf-4ac7-b6b7-879e82ddf786	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_sa	{"name": "Test SA", "type": "client", "entity_id": "test_sa", "properties": {"id": "cmnbz84yf0000i81e9n51vef8"}}	\N	2026-04-10 22:17:05.406728+00
9167c511-da57-4461-9703-bded2cf5c5f6	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_csima_ritual_	{"name": "Cósima Ritual ", "type": "client", "entity_id": "csima_ritual_", "properties": {"id": "cmnc3bxds0000g81e1plhkg46"}}	\N	2026-04-10 22:17:05.407344+00
cade0942-fb1c-4c7c-a7c7-cdc8fb1c9b39	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_empresa_test_sl	{"name": "Empresa Test SL", "type": "client", "entity_id": "empresa_test_sl", "properties": {"id": "cmneo7cu00000dz1wdl77hf64"}}	\N	2026-04-10 22:17:05.408025+00
63a7131d-b2d7-4350-882d-1650d70a4518	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_alberbee	{"name": "AlberBEE", "type": "client", "entity_id": "alberbee", "properties": {"id": "cmn3je5zq0000e31xg8wru9iy"}}	\N	2026-04-10 22:17:05.40872+00
2838c6ec-b2f8-4bb2-af63-76defdb72b0f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_empresa_sl	{"name": "Test Empresa SL", "type": "client", "entity_id": "test_empresa_sl", "properties": {"id": "cmnh4nxww0008gn1wiluvj9wk"}}	\N	2026-04-10 22:17:05.409318+00
924e8e8b-a70d-4daa-af7c-6a1eb2cf0ffc	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4oykc000bgn1wen6wmarh"}}	\N	2026-04-10 22:17:05.409933+00
bb21cc97-9079-4731-aefd-bf4e85748447	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4q2ou000egn1w2znos5qz"}}	\N	2026-04-10 22:17:05.410888+00
9745ef7d-6d8e-4b67-99b6-65b37f43b349	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4qq85000hgn1wr57vw439"}}	\N	2026-04-10 22:17:05.411993+00
0712e9fe-a137-4355-b2c0-847c6fd43e52	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4s788000kgn1wkpx47bmn"}}	\N	2026-04-10 22:17:05.412792+00
085a6b75-0c57-4a49-90a4-43416134dabd	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4ssgd000ngn1w9e0b5s58"}}	\N	2026-04-10 22:17:05.413506+00
eabaf55c-6665-4225-8dcf-fc8b2167975b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4tgg4000qgn1w45s623jo"}}	\N	2026-04-10 22:17:05.414364+00
81e56948-6edb-4148-a3d5-db42ec38f69d	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4tvnb000tgn1wwgi6vtnm"}}	\N	2026-04-10 22:17:05.414901+00
71f7bbb2-f4b4-45ad-8e32-5a678cc8b7ea	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4v8t3000wgn1wbf1znk11"}}	\N	2026-04-10 22:17:05.415568+00
ce13e7f7-d57b-48ca-a4c4-e5912b5ee9b7	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh59k760000fq1x0dr5pedx"}}	\N	2026-04-10 22:17:05.416323+00
87ae1b4e-11dc-45a1-b655-2577f4033900	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh5eckw0003fq1x00pe8jmw"}}	\N	2026-04-10 22:17:05.417769+00
b5b20d66-8831-4c9d-b502-f7c35e336e10	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh5wror000cfq1xe8sydndo"}}	\N	2026-04-10 22:17:05.418466+00
722203d9-7075-4b1a-9db2-7bec1886b52e	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_laura_montes	{"name": "Laura Montes", "type": "agent", "entity_id": "laura_montes", "properties": {"id": "cmnct7zvf0001r9tkvm0p3dbw", "tipo": "SUPPORT"}}	\N	2026-04-10 22:17:05.419115+00
f288b952-a24d-4c63-a33c-2af4b9212566	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_enzo_costa	{"name": "Enzo Costa", "type": "agent", "entity_id": "enzo_costa", "properties": {"id": "cmnct809d0003r9tkbdzelzv3", "tipo": "MARKETING"}}	\N	2026-04-10 22:17:05.419718+00
1d158be2-2c60-4b82-82d6-72ebd02f2866	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_carlos_ruiz	{"name": "Carlos Ruiz", "type": "agent", "entity_id": "carlos_ruiz", "properties": {"id": "cmnct80ih0005r9tkdmktoi7i", "tipo": "SALES"}}	\N	2026-04-10 22:17:05.420378+00
bf76cc75-f273-47af-a84b-fd4615e492ff	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_elena_ortega	{"name": "Elena Ortega", "type": "agent", "entity_id": "elena_ortega", "properties": {"id": "cmnct80rm0007r9tkodlpaghf", "tipo": "ENGINEERING"}}	\N	2026-04-10 22:17:05.420924+00
3af2777f-2acf-4b72-b731-27bfe9617312	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_diana_fabin	{"name": "Diana Fabián", "type": "agent", "entity_id": "diana_fabin", "properties": {"id": "cmnct810q0009r9tkib9nzb6z", "tipo": "DATA"}}	\N	2026-04-10 22:17:05.421521+00
02edcb2f-c932-4976-bc17-01d2491e0700	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_marcos_torralba	{"name": "Marcos Torralba", "type": "agent", "entity_id": "marcos_torralba", "properties": {"id": "cmnct819t000br9tk1t1nm1f1", "tipo": "ENGINEERING"}}	\N	2026-04-10 22:17:05.422161+00
b0da7e42-dca2-4fe4-b402-9420fd83ecd5	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_valeria_sanz	{"name": "Valeria Sanz", "type": "agent", "entity_id": "valeria_sanz", "properties": {"id": "cmndh3yet0001r915hh6etshs", "tipo": "ENGINEERING"}}	\N	2026-04-10 22:17:05.423013+00
49fc97ea-491c-4411-bfd2-7e1434728463	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_paco	{"name": "Paco", "type": "agent", "entity_id": "paco", "properties": {"id": "a1c29523-4fb5-4a70-b029-9a8052da1ac0", "tipo": "CEO"}}	\N	2026-04-10 22:17:05.423597+00
f12080f8-9c20-4221-aa2e-62a5e68b08c9	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.424686+00
b17979a2-a008-4cc5-b7e8-f0546c6f9582	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.425308+00
36ce8726-158c-4ca1-928e-3e3048e0e70a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmndh3yet0001r915hh6etshs", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.425902+00
bbfd374f-cad8-48e1-bc47-6b254f68596f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.426455+00
c46cb3eb-f1ae-4ac9-8eb9-4f1efab504d2	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.427011+00
9700c0bb-a4fc-4486-924c-fe9063565147	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.427586+00
babb9e70-206b-4d42-aec4-c5118d54994c	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_revisar_emails_de_bienvenida_y_soporte_", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.428371+00
f7e1d4a7-ec0c-494d-96f5-f6e06ec379de	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.429001+00
079ecb3c-c857-4317-a0a7-ded8c33562db	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_configurar_dashboard_de_mtricas_del_cli", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.429647+00
2741b5fc-efc2-40c6-bf70-b07cfa92b286	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.430279+00
a248dd75-72f8-41be-9b5e-cc48cab64fa2	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_enviar_primer_email_fro_personalizado_a", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.431067+00
10252456-0fe9-4c99-a41c-7e997c811a96	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.431651+00
f98de673-8f0b-452f-91a5-35844b0787db	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.432176+00
980190b1-57c0-4c78-9b60-ba8b16ea1fd2	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_integrar_mvp_con_panel_del_cliente", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.4327+00
d7f76134-5913-4f10-9a94-2b79d63e0366	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.433398+00
2533a162-2bb4-4364-bfe2-b61437c55428	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_construir_mvp_del_proyecto_segn_briefin", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.434068+00
8a8a4401-e919-4791-acdc-ea1ea9bc24b2	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.434722+00
3e446e85-9f0b-41d2-99dd-68bc8859ab28	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.435257+00
86cb651b-8bf7-4d13-b910-a0a0a565e640	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmndh3yet0001r915hh6etshs", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.435908+00
f439577c-dc28-4c21-a17d-55dd826fa036	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.436561+00
0d9bf9c1-4e2f-4f56-abe2-24f6a8c21008	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.437166+00
04fc16c7-6c98-4f06-9856-100dc03a8639	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_recopilar_y_clasificar_feedback_de_prim", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.437855+00
9152299a-2403-4b07-b34a-d92623d2b739	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.438757+00
9ad8821d-4dd4-43df-9d68-4585ce4e7325	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_seguimiento_de_outreach_responder_a_los", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.439426+00
b54ce100-374d-4354-ac60-2e592fa7a3a5	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.440022+00
6a47fb39-48f9-4712-a06e-9df0acfa5ae5	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_outreach_de_segunda_ronda_10_leads_adic", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.4406+00
e1e7d68d-92e2-4600-9669-e6f773c6dabd	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.441135+00
46731b07-09e5-4d54-8b3a-d80c3e0979bb	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_implementar_top_2_features_del_feedback", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.441689+00
cea610c7-af87-4cdf-9d2f-40b6a1e6c4e7	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.442255+00
89a47d49-5c69-4f52-8f7a-a5d19113463a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_configurar_inbox_de_soporte_y_respuesta", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.442823+00
1193fc29-dd45-4ca8-a96a-a264450a6873	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.443525+00
bcd9dea8-786c-4e47-b5fb-ccd624d47e6a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.444195+00
c3637cdd-442e-4985-8e7b-4cf86b170a2b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.444796+00
1318614a-feb5-4d80-95ef-6637da84f4b4	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmndh3yet0001r915hh6etshs", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.445343+00
3c1eb6f1-7935-4b16-ae94-60522174210c	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.446106+00
f89f6e0e-527c-4d31-b164-f2b527de14f3	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.446694+00
3db6afd8-1335-4e0f-be6c-4a6adf6a9bfb	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.447248+00
4b96d40c-172a-4aba-beb3-454732a5d670	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.447888+00
4c84e113-20fe-4394-b90e-69011a23b1ad	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.448517+00
e36f96a6-539d-4ece-b404-ef371d0cd77f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.449109+00
27502f16-54ae-4f07-9b47-22f93b2c4f58	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_outreach_buscar_1_lead_nuevo_de_calidad", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.449786+00
479525e9-7911-45c3-a0b7-9ae003b4f70a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.450417+00
5420e68c-a254-4e81-8de8-13f064cea8ca	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_anlisis_de_canal_de_adquisicin_con_mejo", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.451003+00
0a0a0b4e-1be0-4edf-b021-248bc911520f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.451567+00
cb69ce2f-fe45-4854-8592-1fe28f9dfd5b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_generar_reporte_semanal_de_mtricas", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.45211+00
73856a8f-e7ab-42ed-9b94-59572aa5660e	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.452743+00
f4043e79-f816-47f7-a581-213778cb8b38	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_revisin_de_satisfaccin_del_cliente_mes_", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.453629+00
dc44e560-c274-46b7-9e03-00db3ea88755	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.454476+00
972ec771-0096-43ea-bece-62137e67f911	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_atender_emails_de_soporte_entrantes", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.455094+00
24b67850-08a8-4149-a4a1-b504c30269bb	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.455743+00
b7111e08-58e2-4a73-96bb-c27fdf49afab	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.456371+00
df8571ed-f620-43c9-91c8-5741e91ae67c	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.456998+00
6dae75d7-e062-4f99-8a36-d92ef1479601	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_preparar_emailing_de_bienvenida_para_el", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.457605+00
5cd47b75-8c65-48e6-a639-620f202958c0	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.458222+00
813fa25b-c12b-47cc-90f1-1cb34336264a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.458891+00
ca2d130c-c4e0-4543-90f0-b4298caaca8d	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_implementar_features_solicitadas_por_ea", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.459489+00
255f716b-745d-4396-882d-459c353f7deb	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.460143+00
780f9d9a-e331-4f3e-860d-ba32cf946402	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_escalar_outreach_si_hay_respuesta_posit", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.460754+00
4fedf922-7dbb-4d47-b5b1-7da4a8a0a5b1	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.461564+00
5ce2ca07-993e-4281-85f2-636d67e0abc8	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_primer_reporte_de_mtricas_retencin_y_us", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.462125+00
e94e2e6a-772a-4d2d-8639-640ce8368673	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.46274+00
c76d0017-64fc-4db7-a1ad-da3026341633	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_anlisis_competitivo_35_competidores_dir", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.463372+00
06c575a4-2fac-4eb4-bf79-f6c9f2b7e4dc	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.464004+00
81f7abdc-1eed-4423-895b-6888f4c2653d	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_outreach_identificar_10_leads_en_sector", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.464598+00
3de05783-3741-4752-a48e-bda4c5ee6c4c	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.465187+00
54c6898b-a934-4259-823d-8ac5001b477b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_investigar_empresa_sector_y_competencia", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:05.465707+00
a35bbbfd-932b-4871-ba1b-d2dc8861bfab	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_sl	{"name": "Test SL", "type": "client", "entity_id": "test_sl", "properties": {"id": "cmn77j4yd0002b41efmeyg8o1"}}	\N	2026-04-10 22:17:11.410618+00
f5bd969a-f81f-48bc-a662-36126d44b91a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test2_sl	{"name": "Test2 SL", "type": "client", "entity_id": "test2_sl", "properties": {"id": "cmn77tmsh0004e81e667qlyks"}}	\N	2026-04-10 22:17:11.412927+00
6dfcc84e-9a13-4aea-805a-65b8c2d9a8e7	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_testempresa	{"name": "TestEmpresa", "type": "client", "entity_id": "testempresa", "properties": {"id": "cmn7fddc60000ew1e76drd41a"}}	\N	2026-04-10 22:17:11.414106+00
c6945148-0cc9-4994-afca-e1998f0c8fb1	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_tester	{"name": "Tester", "type": "client", "entity_id": "tester", "properties": {"id": "cmn7jgl500000j41enpnhqa2z"}}	\N	2026-04-10 22:17:11.414872+00
a97450fd-2187-4c3b-8bfa-8aabe4a5fa8b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_empresatest	{"name": "EmpresaTest", "type": "client", "entity_id": "empresatest", "properties": {"id": "cmn7jjmjm0003j41ekknkwjzf"}}	\N	2026-04-10 22:17:11.415931+00
9eae2048-7cf3-480a-aab1-b8a8c88a09c6	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_bee	{"name": "BEE", "type": "client", "entity_id": "bee", "properties": {"id": "cmnbhljm70000f01x9jbyuea1"}}	\N	2026-04-10 22:17:11.416835+00
628ba0c8-4799-48f6-803c-89ab15845bfe	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_sa	{"name": "Test SA", "type": "client", "entity_id": "test_sa", "properties": {"id": "cmnbz84yf0000i81e9n51vef8"}}	\N	2026-04-10 22:17:11.417524+00
aa85d869-08f2-4e8c-96ce-96621c6607bc	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_csima_ritual_	{"name": "Cósima Ritual ", "type": "client", "entity_id": "csima_ritual_", "properties": {"id": "cmnc3bxds0000g81e1plhkg46"}}	\N	2026-04-10 22:17:11.418161+00
c3fbba2d-7d64-4f8f-bb5e-15ab90e6a06c	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_empresa_test_sl	{"name": "Empresa Test SL", "type": "client", "entity_id": "empresa_test_sl", "properties": {"id": "cmneo7cu00000dz1wdl77hf64"}}	\N	2026-04-10 22:17:11.418911+00
57656191-fff8-4625-862d-289b5fa88b62	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_alberbee	{"name": "AlberBEE", "type": "client", "entity_id": "alberbee", "properties": {"id": "cmn3je5zq0000e31xg8wru9iy"}}	\N	2026-04-10 22:17:11.419764+00
691b4ae9-74e2-4fd1-8a94-b18e627837a3	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_empresa_sl	{"name": "Test Empresa SL", "type": "client", "entity_id": "test_empresa_sl", "properties": {"id": "cmnh4nxww0008gn1wiluvj9wk"}}	\N	2026-04-10 22:17:11.420524+00
116b799f-ede3-40e1-8092-a1d5d64e794b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4oykc000bgn1wen6wmarh"}}	\N	2026-04-10 22:17:11.421399+00
06d3c0e7-2a83-4df4-bd1d-d48a3f4c10c2	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4q2ou000egn1w2znos5qz"}}	\N	2026-04-10 22:17:11.42257+00
5d1bb4dc-d09f-4997-b766-c8588c16fa42	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4qq85000hgn1wr57vw439"}}	\N	2026-04-10 22:17:11.423767+00
72a298b8-7245-4264-8e86-f617c4b113b6	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4s788000kgn1wkpx47bmn"}}	\N	2026-04-10 22:17:11.424504+00
55ef664f-7876-44b9-a0c0-5fb05a091b83	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4ssgd000ngn1w9e0b5s58"}}	\N	2026-04-10 22:17:11.425185+00
56d9851e-caa6-47da-9880-e92d761db25f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4tgg4000qgn1w45s623jo"}}	\N	2026-04-10 22:17:11.42608+00
884e35e8-7596-4ef5-a341-787d43232872	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4tvnb000tgn1wwgi6vtnm"}}	\N	2026-04-10 22:17:11.426991+00
427fa5be-08c1-442d-b70a-ddf8ba5cba02	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh4v8t3000wgn1wbf1znk11"}}	\N	2026-04-10 22:17:11.427767+00
c1848871-f9c6-4772-9e46-3eaad5082106	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh59k760000fq1x0dr5pedx"}}	\N	2026-04-10 22:17:11.428503+00
5d96d332-d0cf-484b-a05a-cca1e7d31d55	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh5eckw0003fq1x00pe8jmw"}}	\N	2026-04-10 22:17:11.42916+00
166f03e8-4522-418a-9f7e-82d681c72e04	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_test_corp_sl	{"name": "Test Corp SL", "type": "client", "entity_id": "test_corp_sl", "properties": {"id": "cmnh5wror000cfq1xe8sydndo"}}	\N	2026-04-10 22:17:11.430016+00
bd17081e-7d51-4012-8ea2-785c1475543b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_laura_montes	{"name": "Laura Montes", "type": "agent", "entity_id": "laura_montes", "properties": {"id": "cmnct7zvf0001r9tkvm0p3dbw", "tipo": "SUPPORT"}}	\N	2026-04-10 22:17:11.430754+00
53d0f352-9ea6-46a4-95a7-38ca9bdbfdc6	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_enzo_costa	{"name": "Enzo Costa", "type": "agent", "entity_id": "enzo_costa", "properties": {"id": "cmnct809d0003r9tkbdzelzv3", "tipo": "MARKETING"}}	\N	2026-04-10 22:17:11.431483+00
8413ef6f-1757-44dd-989b-16f43e21a66e	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_carlos_ruiz	{"name": "Carlos Ruiz", "type": "agent", "entity_id": "carlos_ruiz", "properties": {"id": "cmnct80ih0005r9tkdmktoi7i", "tipo": "SALES"}}	\N	2026-04-10 22:17:11.432453+00
b40734a6-ecae-4d41-8db9-8578d1aacf18	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_elena_ortega	{"name": "Elena Ortega", "type": "agent", "entity_id": "elena_ortega", "properties": {"id": "cmnct80rm0007r9tkodlpaghf", "tipo": "ENGINEERING"}}	\N	2026-04-10 22:17:11.433178+00
5399df54-451a-4fb7-b856-3cf539217c50	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_diana_fabin	{"name": "Diana Fabián", "type": "agent", "entity_id": "diana_fabin", "properties": {"id": "cmnct810q0009r9tkib9nzb6z", "tipo": "DATA"}}	\N	2026-04-10 22:17:11.433986+00
3b6de9fd-c62a-4e01-89ca-87668e05c197	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_marcos_torralba	{"name": "Marcos Torralba", "type": "agent", "entity_id": "marcos_torralba", "properties": {"id": "cmnct819t000br9tk1t1nm1f1", "tipo": "ENGINEERING"}}	\N	2026-04-10 22:17:11.434667+00
3b0231f5-4c0f-4f77-879c-43dbf04dcf2a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_valeria_sanz	{"name": "Valeria Sanz", "type": "agent", "entity_id": "valeria_sanz", "properties": {"id": "cmndh3yet0001r915hh6etshs", "tipo": "ENGINEERING"}}	\N	2026-04-10 22:17:11.435559+00
e3bf3d6c-0980-4180-98f4-9360e9396b05	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	ENTITY	entity_paco	{"name": "Paco", "type": "agent", "entity_id": "paco", "properties": {"id": "a1c29523-4fb5-4a70-b029-9a8052da1ac0", "tipo": "CEO"}}	\N	2026-04-10 22:17:11.436472+00
96b9beba-f1e1-4b5b-93a0-2964a5d320be	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.437925+00
fdb91a52-044d-44a2-accc-9c705004114f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.438777+00
4cfc1443-915b-4c71-8c6f-9c7be2230d18	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmndh3yet0001r915hh6etshs", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.439522+00
a5e408be-23bb-4da1-9474-987138439f03	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.440317+00
abcb3a82-3ae5-4811-b98f-9f0d0f265aa5	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.441271+00
ed9bd6e0-8c5b-4e07-8dec-fe56b2ad0ef6	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.442073+00
b798a110-4722-4b57-8766-d95bc7479c73	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_revisar_emails_de_bienvenida_y_soporte_", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.442896+00
b8d7ce9e-295f-4c89-bd6e-9b0ea9f36c9a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.443594+00
c77dd21c-705c-41db-adf7-acf9fea5c59c	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_configurar_dashboard_de_mtricas_del_cli", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.444276+00
169a2934-95ed-4361-9694-2974098c6bac	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.445051+00
bda257ec-1d62-47d6-9c49-91221414c3ae	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_enviar_primer_email_fro_personalizado_a", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.445965+00
df05a474-ec7e-464c-9007-117d978e7091	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.446724+00
402524c2-e75e-4a61-b380-b97c329f08c3	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.447521+00
1611c55a-8734-423d-850b-14e66dae9369	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_integrar_mvp_con_panel_del_cliente", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.448271+00
b1080169-fbcd-4ff3-a5b2-e31f66b75e65	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.44903+00
7e548df4-231b-4cb9-843a-c69985936e33	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_construir_mvp_del_proyecto_segn_briefin", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.449676+00
03195da3-d4b6-4eca-beaa-2ecf62ae9a19	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.450382+00
97b768fc-14fb-4b21-a09f-9b783c2ca9d5	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.451072+00
8c195e34-2586-479d-a750-123ef0978c2f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmndh3yet0001r915hh6etshs", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.451809+00
da730d2d-aad8-4ebe-84a5-184bffe73c85	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.452506+00
1f140a79-e2d9-4a57-9d60-5e87f4bff619	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.453645+00
75b16740-f935-4471-867d-83bc405043d8	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_recopilar_y_clasificar_feedback_de_prim", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.454425+00
0596bd54-3ca7-4288-8e4a-e148f0145941	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.455382+00
76c6ae24-72fc-4ef1-ab5e-16c4b1553db9	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_seguimiento_de_outreach_responder_a_los", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.456062+00
b6d07b38-63be-4f78-a611-5192f05a599e	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.457224+00
5d66a0cd-9240-416e-933a-45899dce6143	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_outreach_de_segunda_ronda_10_leads_adic", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.458032+00
ae76dfda-6721-421f-9567-5b16ced50331	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.458747+00
f0a6f9b2-e53a-4f5b-85da-d5c44157d44a	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_implementar_top_2_features_del_feedback", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.459693+00
78819904-48b1-4ded-a57f-4d71c93eee32	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.460393+00
6e8e740a-1b16-489a-abbc-1c7dd70aa40b	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_configurar_inbox_de_soporte_y_respuesta", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.460951+00
5229ac27-a2dd-4061-a724-7de572b9b538	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.46186+00
70705e55-d06a-4bde-83aa-3cc22eca5bc3	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.462669+00
6a70459e-7eef-4f08-989f-d0e2ec697eb0	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.46357+00
66c9cea2-cd9d-44f4-a73e-225d9c6aa55c	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmndh3yet0001r915hh6etshs", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.464259+00
4bb71be2-7df3-4e79-a4d7-2d65b35e1bde	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.465238+00
d035ecde-0a69-4051-994f-0757870bbc81	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.466108+00
e59767b5-3b9a-4bc7-a5d8-cf978de7f1cd	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.466908+00
38a72f86-2d1c-4a14-8e49-e58a3637aca2	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.46763+00
aef9f463-ab11-43ed-8236-7fe54e034ecd	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.468332+00
40336614-2efe-410e-917b-d629c6a08c61	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.469023+00
50f02633-8fe6-4b22-9518-9a897a17f880	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_outreach_buscar_1_lead_nuevo_de_calidad", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.469679+00
ddc887a7-bef3-4961-85a6-472ef29ab900	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.470283+00
c68ab5bb-1509-460c-8773-388b7594a06e	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_anlisis_de_canal_de_adquisicin_con_mejo", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.470976+00
ad230ecc-c6f5-4966-9fa6-8ed60f379aec	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.471692+00
2ce2d722-66b2-45fe-a7cb-965362817103	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_generar_reporte_semanal_de_mtricas", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.472389+00
7d591ea8-69b8-4699-a620-980d7e059663	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.473143+00
b94f78f0-7369-43ae-b4dd-f92b6df1b77d	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_revisin_de_satisfaccin_del_cliente_mes_", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.474045+00
ecae2024-0690-4f14-9b88-87523ef652b1	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.474712+00
8336d9d3-d561-4dae-83d1-63c9bec2ba9e	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_atender_emails_de_soporte_entrantes", "subject": "cmnct7zvf0001r9tkvm0p3dbw", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.475429+00
1eaf73d3-23ad-4661-a1e4-ddaaba9f7c96	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80rm0007r9tkodlpaghf", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.476086+00
ed3ea24d-5dcf-485e-84a9-6917e63ac886	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "a1c295234fb54a70b0299a8052da1ac0", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.476744+00
cbd96a6c-5b40-4f25-8f4e-cf081258619d	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.477606+00
78fba647-df2c-415c-b922-d7886afeb799	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_preparar_emailing_de_bienvenida_para_el", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.47824+00
b194b57b-f115-47e5-85c0-c02f2e144f82	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct809d0003r9tkbdzelzv3", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.478972+00
94a6b993-8f83-4cb1-95e8-5f1b6bd73dca	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.479636+00
9992afb9-721d-4c5d-a4fa-6ef6011c8c0d	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_implementar_features_solicitadas_por_ea", "subject": "cmnct819t000br9tk1t1nm1f1", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.480773+00
c22b1ef6-b72a-463b-94e4-e56e92d25c71	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.481531+00
7fb0d217-6ece-4a35-b14b-03a9ab4dbe73	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_escalar_outreach_si_hay_respuesta_posit", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.482658+00
9f5e1891-193a-45c8-9147-57fa69332ac0	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.483955+00
a9422a71-bbe8-4ae3-ab5c-45f61453bfc9	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_primer_reporte_de_mtricas_retencin_y_us", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.484751+00
ce27fd59-b24c-4ed8-ac4d-c6086050bb27	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.485429+00
f0212e4b-85d8-4776-9641-09ab78477043	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_anlisis_competitivo_35_competidores_dir", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.486+00
a1b1d15b-212b-4366-a993-1c94c9f8dd4f	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.486601+00
ef6a5437-97eb-47c8-bde0-a470d1da4d46	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_outreach_identificar_10_leads_en_sector", "subject": "cmnct80ih0005r9tkdmktoi7i", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.487204+00
b1d5af79-c8ce-4b0c-aa2f-b61583af7ea0	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_delivers_to	{"triple": {"object": "cmn3je5zq0000e31xg8wru9iy", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "delivers_to"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.487822+00
f2933bc8-5ad7-4440-8d17-a91c3ee41783	cmn3je5zq0000e31xg8wru9iy	\N	SYSTEM	TRIPLE	triple_completed	{"triple": {"object": "_investigar_empresa_sector_y_competencia", "subject": "cmnct810q0009r9tkib9nzb6z", "predicate": "completed"}, "valid_from": "2026-03-31", "source_file": null}	\N	2026-04-10 22:17:11.48854+00
\.


--
-- Data for Name: Cliente; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Cliente" (id, nombre, slug, email, plan, logo, "webUrl", "stripeCustomerId", activo, "createdAt", "updatedAt") FROM stdin;
cmn77j4yd0002b41efmeyg8o1	Test SL	test-sl	test@mycompi.com	BASICO	\N	\N	\N	t	2026-03-26 08:25:17.27	2026-03-26 08:25:17.27
cmn77tmsh0004e81e667qlyks	Test2 SL	test2-sl	test2@mycompi.com	BASICO	\N	\N	\N	t	2026-03-26 08:33:26.945	2026-03-26 08:33:26.945
cmn7fddc60000ew1e76drd41a	TestEmpresa	testempresa	testpaco_1774526683@test.com	BASICO	\N	\N	\N	t	2026-03-26 12:04:45.126	2026-03-26 12:04:45.126
cmn7jgl500000j41enpnhqa2z	Tester	tester	appmycompi@gmail.com	BASICO	\N	\N	\N	t	2026-03-26 13:59:13.669	2026-03-26 13:59:13.669
cmn7jjmjm0003j41ekknkwjzf	EmpresaTest	empresatest	testalberto_1774533693@gmail.com	BASICO	\N	\N	\N	t	2026-03-26 14:01:35.458	2026-03-26 14:01:35.458
cmnbhljm70000f01x9jbyuea1	BEE	bee	albertogala@beenocode.com	BASICO	\N	\N	\N	t	2026-03-29 08:18:10.447	2026-03-29 08:18:10.447
cmnbz84yf0000i81e9n51vef8	Test SA	test-sa	test_paco@mycompi.com	BASICO	\N	\N	\N	t	2026-03-29 16:31:38.007	2026-03-29 16:31:38.007
cmnc3bxds0000g81e1plhkg46	Cósima Ritual 	cosima-ritual	vanesamartinherrera@gmail.com	BASICO	\N	\N	\N	t	2026-03-29 18:26:33.281	2026-03-29 18:26:33.281
cmneo7cu00000dz1wdl77hf64	Empresa Test SL	empresa-test-sl	test_1774964781@test.com	BASICO	\N	\N	\N	t	2026-03-31 13:46:24.313	2026-03-31 13:46:24.313
cmn3je5zq0000e31xg8wru9iy	AlberBEE	alberbee	beenocode@gmail.com	COMPLETO	\N	\N	cus_UFXlPnrgORhP0s	t	2026-03-23 18:46:16.022	2026-03-31 13:50:11.788
cmnh4nxww0008gn1wiluvj9wk	Test Empresa SL	test-empresa-sl	test-e2e-1775113361@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:02:44.336	2026-04-02 07:02:44.336
cmnh4oykc000bgn1wen6wmarh	Test Corp SL	test-corp-sl	test-e2e-1775113409589@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:03:31.837	2026-04-02 07:03:31.837
cmnh4q2ou000egn1w2znos5qz	Test Corp SL	test-corp-sl-1775113461878	test-e2e-1775113461738@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:04:23.838	2026-04-02 07:04:23.838
cmnh4qq85000hgn1wr57vw439	Test Corp SL	test-corp-sl-1775113492354	test-e2e-1775113492220@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:04:54.342	2026-04-02 07:04:54.342
cmnh4s788000kgn1wkpx47bmn	Test Corp SL	test-corp-sl-1775113561092	test-e2e-1775113560955@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:06:03.033	2026-04-02 07:06:03.033
cmnh4ssgd000ngn1w9e0b5s58	Test Corp SL	test-corp-sl-1775113588612	test-e2e-1775113588150@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:06:30.541	2026-04-02 07:06:30.541
cmnh4tgg4000qgn1w45s623jo	Test Corp SL	test-corp-sl-1775113619569	test-e2e-1775113619436@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:07:01.637	2026-04-02 07:07:01.637
cmnh4tvnb000tgn1wwgi6vtnm	Test Corp SL	test-corp-sl-1775113639344	test-e2e-1775113639208@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:07:21.336	2026-04-02 07:07:21.336
cmnh4v8t3000wgn1wbf1znk11	Test Corp SL	test-corp-sl-1775113703034	test-e2e-1775113702748@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:08:25.047	2026-04-02 07:08:25.047
cmnh59k760000fq1x0dr5pedx	Test Corp SL	test-corp-sl-1775114370932	test-e2e-1775114370164@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:19:32.995	2026-04-02 07:19:32.995
cmnh5eckw0003fq1x00pe8jmw	Test Corp SL	test-corp-sl-1775114594430	test-e2e-1775114594283@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:23:16.4	2026-04-02 07:23:16.4
cmnh5wror000cfq1xe8sydndo	Test Corp SL	test-corp-sl-1775115453645	test-e2e-1775115453503@test.com	BASICO	\N	\N	\N	t	2026-04-02 07:37:35.788	2026-04-02 07:37:35.788
\.


--
-- Data for Name: Documento; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Documento" (id, "clienteId", tipo, titulo, contenido, metadata, "createdAt", "updatedAt") FROM stdin;
ac3ac879-ac88-420c-8349-49e6285d3793	cmn3je5zq0000e31xg8wru9iy	MISION	Misión MyCompi / BeeNoCode	# Misión MyCompi / BeeNoCode\n\n**Cliente:** AlberBEE (BeeNoCode)\n**Fecha:** 2026-04-01\n**Agente:** Diana Fabián\n\n## Resumen ejecutivo\n\nBeeNoCode opera MyCompi, una SaaS que vende equipos de 7 Compis agénticos especializados a PYMES españolas por 49€/mes (precio único, sin permanencia). El cliente actual es el propio BeeNoCode, en fase de validación interna.\n\n## Modelo de negocio\n\n- **Producto:** Equipo agéntico (7 especializados) + 1 director (Paco)\n- **Precio:** 49€/mes todo incluido\n- **Mercado:** PYMES españolas que necesitan digitalizarse\n- **Propuesta de valor:** Tu equipo de Compis profesionales por 49€/mes vs ~10.300€/mes de empleados\n\n## Estado actual\n\n- MRR: 98€ (1 cliente real)\n- Clientes registrados: 10 (9 son tests)\n- Usuarios activos: 2\n- Trial activo: 30 días desde 2026-03-31	{"agente": "Diana Fabián"}	2026-04-01 01:40:06.535	2026-04-01 01:40:06.535
a4a1543b-c3f4-4e62-bab2-5cdd5c589e3b	cmn3je5zq0000e31xg8wru9iy	USER_RESEARCH	Research Competencia MyCompi	# Research Competencia MyCompi\n\n**Fecha:** 2026-04-01\n**Agente:** Diana Fabián\n\n## Competidores directos (España)\n\n| Competidor | Web | Propuesta |\n| Nemawashi AI | nemawashi.ai | Automatizaciones y agentes IA para PYMEs |\n| Tur.ia Design | turiadesign.com | Agentes IA para negocio España & LATAM |\n| Qyntix | qyntix.com | IA y software a medida |\n\n## Competidores indirectos\n\nRingover, Zendesk, HubSpot, Talkdesk, noimos AI, MagicBlocks AI\n\n## Diferenciadores MyCompi\n\nPrecio fijo único (49€/mes), 7 agentes especializados vs herramienta puntual, personalidades definidas, sin contratos.\n\n## Debilidades\n\nProducto muy nuevo (marzo 2026), sin case studies, 9/10 clientes son tests, MRR mínimo (98€).	{"agente": "Diana Fabián"}	2026-04-01 01:40:06.873	2026-04-01 01:40:06.873
a8bf23c3-e021-4796-bbbc-aba30d3cead5	cmn3je5zq0000e31xg8wru9iy	MISION	Heartbeat Metrics Snapshot 2026-04-01	{"timestamp":"2026-04-01T02:43:22.647Z","agente":"Diana","mrr":49,"mrr_potencial":490,"clientes_activos":1,"cuentas_totales":10,"cuentas_activas":1,"activation_rate":0.1,"engagement_mensajes":0,"churn_rate":null,"alertas":["MRR_BAJO","ENGAGEMENT_CERO","90_CUENTAS_INACTIVAS"]}	{"tipo": "metrics_snapshot", "agente": "Diana", "source": "heartbeat"}	2026-04-01 02:43:23.91	2026-04-01 02:43:23.91
\.


--
-- Data for Name: Email; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Email" (id, "messageId", de, para, asunto, texto, html, raw, "EstadoEmail", "clienteId", "interaccionId", "respuestaA", "agenteId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Feedback" (id, "trabajoId", "clienteId", rating, comentario, "agenteId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Handoff; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Handoff" (id, "clienteId", "deAgenteId", "aAgenteId", razon, contexto, resuelto, rating, "createdAt", "resolvedAt") FROM stdin;
\.


--
-- Data for Name: InteraccionChat; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."InteraccionChat" (id, "clienteId", "agenteId", "tipoPeticion", "mensajeOriginal", resumen, "respuestaAgente", "estadoChat", "streamId", "clienteAcepta", "resultadoExitoso", "createdAt") FROM stdin;
\.


--
-- Data for Name: Mensaje; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Mensaje" (id, "agenteId", "paraAgenteId", contenido, tipo, metadata, leido, "createdAt") FROM stdin;
\.


--
-- Data for Name: Notificacion; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Notificacion" (id, "clienteId", "agenteId", tipo, titulo, contenido, leida, "createdAt", "updatedAt") FROM stdin;
cmnct1t20000zmo1e90yhlzpb	cmn3je5zq0000e31xg8wru9iy	Test	INFO	Test desde audit	Test contenido	f	2026-03-30 06:26:31.126	2026-03-30 06:26:31.131
cmnct1xiv0011mo1e2pkjjj85	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat OK. Sin emails ni tickets pendientes. Sistema MyCompi sin actividad reciente que requiera respuesta automatica.	f	2026-03-30 06:26:36.919	2026-03-30 06:26:36.92
cmnct1xz40013mo1ea4kualbr	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat ejecutado. Sin cambios: no hay CRM configurado ni leads activos en el sistema. Estado idéntico al último ciclo.	f	2026-03-30 06:26:37.505	2026-03-30 06:26:37.506
cmnct1y5h0015mo1esadek7vv	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] ✅ SISTEMAS OK — Web server respondiendo HTTP 200. Backup local SIN ACTUALIZAR desde 26/mar (5 días) — misma incidencia persistente. No hay nuevas incidencias ni automatizaciones en este ciclo.	f	2026-03-30 06:26:37.734	2026-03-30 06:26:37.735
cmnct1ybq0017mo1e2h534efv	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Día 11 sin actividad en producción. MyCompi sigue sin generar datos reales. Web OK (HTTP 200 según Marcos), DB Neon con incidencia persistente (HTTP 400 'query is not supported'), CRM vacío (Carlos). Backup desactualizado desde el 26/mar. Sin cambios en el estado general. Sin oportunidades de growth detectables — no hay datos que analizar.	f	2026-03-30 06:26:37.958	2026-03-30 06:26:37.959
cmnct1yhn0019mo1e9yyc8ix0	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] mycompi.com HTTP 200 OK — funcionando. mycompi.onrender.com devuelve 000 por timeout (render.com entra en sleep por inactividad — no es error real, wakes up bajo demanda). landing.mycompi.com sin respuesta (DNS/hosting pendiente). SSL vigente en dominios principales. Git limpio en producción. Sin cambios pendientes de deploy. Sin errores detectados.	f	2026-03-30 06:26:38.171	2026-03-30 06:26:38.173
cmnctdwbo001bmo1ebz8iozzz	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat ejecutado. No hay datos de pipeline/leads en el sistema. Agent ready para recibir leads o instrucciones de MyCompi.	f	2026-03-30 06:35:55.214	2026-03-30 06:35:55.239
cmnctdwhp001dmo1etovzhlbh	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat de métricas MyCompi. Sistema con 9 clientes activos (todos PLAN BASICO), 9 usuarios, pero solo 2 activos en últimos 7 días. 7 usuarios nunca han accedido — tasa de activación muy baja. Sin interacciones de chat ni documentos generados. No hay pagos registrados en la DB. Señal de alerta: onboarding no está funcionando.	f	2026-03-30 06:35:55.454	2026-03-30 06:35:55.455
cmnctdwnr001fmo1eh6m244yp	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com responding 200 OK. Git local está 1 commit ahead de origin/main (fix de cron jobs hecho a las 14:31). No incidencias detectadas.	f	2026-03-30 06:35:55.671	2026-03-30 06:35:55.672
cmncug79b0001il1eu0hrixyb	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 14:40 MYT — Sin actividad. Sin emails pendientes ni mensajes en cola.	f	2026-03-30 07:05:42.335	2026-03-30 07:05:42.379
cmncug7id0003il1et42r85ta	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-03-30 06:45 UTC. Servidor Node (PID 10) y OpenClaw Gateway (PID 30) activos. Sin errores en logs. Backup más reciente: 2026-03-26 (4 días). Sin incidencias.	f	2026-03-30 07:05:42.661	2026-03-30 07:05:42.664
cmncwo3wu0001kd1evv1wl23r	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat OK — bandeja de entrada vacía, sin actividad pendiente.	f	2026-03-30 08:07:50.473	2026-03-30 08:07:50.528
cmncwo44r0003kd1er5cd8t3i	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-30 08:05 UTC. Pipeline sigue vacío — sin leads activos en el workspace. No se encontraron datos de CRM ni secuencias activas. No hay seguimientos pendientes ni leads en objection. Se requiere acción de Alberto: populating del pipeline inicial o указание del CRM a consultar.	f	2026-03-30 08:07:50.763	2026-03-30 08:07:50.766
cmncwo4ap0005kd1el9exkxot	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check completado sin incidencias. Sistemas operativos: node server OK, openclaw-gateway activo, backups existe (fecha 2026-03-26). No hay logs de errores en el proyecto. Token-logs vacío (sin uso aún). Sin automatizaciones pendientes de crear.	f	2026-03-30 08:07:50.977	2026-03-30 08:07:50.979
cmncwo4g90007kd1enkz7bk1k	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat ejecutado. No se encontraron datos de métricas en el workspace (no hay archivos de datos, CSVs, dashboards ni reports). No hay alertas de churn ni anomalías detectadas dado que no hay datos disponibles para comparar. Data tracking parece no estar configurado aún.	f	2026-03-30 08:07:51.177	2026-03-30 08:07:51.18
cmncwo4uu0009kd1ek8ng7x7x	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site mycompi.onrender.com responde HTTP 200. SSL vigente. Todos los headers de seguridad presentes (CSP, HSTS, X-Frame-Options). CDN activo (Cloudflare). Sin errores detectados.	f	2026-03-30 08:07:51.703	2026-03-30 08:07:51.705
cmncz4irl0001fn1ex7a7m78x	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sistema MyCompi sigue sin actividad en producción. Sin leads, sin CRM, sin datos de ventas. Heartbeat 08:55 UTC confirma estado idéntico al anterior — 0 pipeline, 0 actividad. Carlos operativo pero sin datos reales.	f	2026-03-30 09:16:35.451	2026-03-30 09:16:35.494
cmncz4j1d0003fn1ea5wserhe	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat de operaciones. Sistemas MyCompi activos y sin incidencias detectadas. Procesos node y openclaw-gateway corriendo con normalidad. Backups verificados. Sin cuellos de botella ni automatizaciones pendientes de revisar.	f	2026-03-30 09:16:35.809	2026-03-30 09:16:35.811
cmncz4j790005fn1eugrlxghq	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com funcionando correctamente (HTTP 200, SSL OK). Sin incidencias detectadas. No hay cambios pendientes en el repositorio main. Sin despliegues pendientes.	f	2026-03-30 09:16:36.021	2026-03-30 09:16:36.023
cmnd1bezx0001kk1e7x2xj4mo	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin cambios desde heartbeat anterior. No hay leads activos en CRM ni pipeline configurado. Sistema operativo pero sin datos de leads pendientes.	f	2026-03-30 10:17:56.315	2026-03-30 10:17:56.48
cmnd1bf8k0003kk1eu85elahz	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat sin incidencias. Sistema principal (node server.mjs) activo. Sin logs de errores. Sin automatizaciones pendientes.	f	2026-03-30 10:17:56.708	2026-03-30 10:17:56.712
cmnd1bfo30005kk1e3tkdte6k	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat ejecutado. No se detectaron métricas disponibles en el sistema. No hay acceso a datos reales de MyCompi/BeeNoCode. Entorno simulado sin dashboards activos.	f	2026-03-30 10:17:57.268	2026-03-30 10:17:57.271
cmnd1bfu20007kk1eyfmtjlth	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio funcionando correctamente. Estado HTTP 200 OK, SSL vigente, headers de seguridad activos. Sitemap no detectado (devuelve HTML en vez de XML, puede ser normal en SPA). Sin incidencias críticas.	f	2026-03-30 10:17:57.482	2026-03-30 10:17:57.486
cmnd2wu110001j31ee69ckpdw	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20min — sin actividad. Bandeja vacía, sin tickets ni mensajes pendientes.	f	2026-03-30 11:02:35.264	2026-03-30 11:02:35.322
cmnd2wu9f0003j31edv99m0w3	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat ejecutado. No hay datos de pipeline de ventas ni CRM integrado. Carlos está listo para operar cuando se configure el sistema de gestión de leads.	f	2026-03-30 11:02:35.571	2026-03-30 11:02:35.572
cmnd2wufc0005j31ey884ahe3	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistema MyCompi sigue sin actividad en producción. 6+ días consecutivos sin sesiones, sin datos de uso, sin tráfico real. Se requiere intervención de Alberto/Daniel para desplegar el sistema. Revisión de logs: git muestra commits recientes pero el sistema no está corriendo. Proceso node server.mjs activo pero sin conexiones reales.	f	2026-03-30 11:02:35.785	2026-03-30 11:02:35.786
cmnd2wulb0007j31e3kt9bsfc	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Séptimo día consecutivo sin actividad real en producción. Sistema MyCompi completamente parado. Sin datos de MRR, churn, new users ni activation rate. El token-logs.json sigue vacío. Los standups confirman 7+ días sin sesiones. El sistema está arquitecturado pero NO corre en producción.	f	2026-03-30 11:02:35.999	2026-03-30 11:02:36
cmnd2wurd0009j31e41delaq4	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site no responde (timeout 10s). Instancia gratuita de Render probablemente dormida por inactividad — comportamiento esperado en free tier. No es incidencia crítica.	f	2026-03-30 11:02:36.217	2026-03-30 11:02:36.218
cmnd3eij6000bj31edbu5y0ib	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat de rutina — todos los sistemas operativos correctamente. API responde, último deploy estable, backup reciente (26/03). Sin incidencias.	f	2026-03-30 11:16:19.537	2026-03-30 11:16:20.232
cmnd524s00001kc1eglbg8itn	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat ejecutado. No hay datos de pipeline, leads ni CRM activos. Carlos está configurado pero pendiente de datos de entrada.	f	2026-03-30 12:02:41.706	2026-03-30 12:02:41.77
cmnd5259v0003kc1ec2czpxdg	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistema MyCompi sigue sin estar en producción. 7+ días sin actividad. No hay incidencias nuevas. Service corriendo en Render (no local). Elena opera desde su propio directorio de agente - su rol es盯着 operaciones y automatizaciones del cliente MyCompi.	f	2026-03-30 12:02:42.356	2026-03-30 12:02:42.358
cmnd525fq0005kc1e3xo75wsm	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat activo. Sin datos de métricas disponibles en el workspace — no hay archivos de métricas, dashboards o CSVs detectados. No es posible revisar KPIs (MRR, churn, new users, activation rate) sin acceso a fuente de datos.	f	2026-03-30 12:02:42.566	2026-03-30 12:02:42.568
cmnd525m70007kc1e3kh2chk2	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site check OK — mycompi.onrender.com responds 200, /admin 301 redirect (login), /sitemap.xml 200. SSL OK. No incidencias.	f	2026-03-30 12:02:42.8	2026-03-30 12:02:42.801
cmnd77mq20001iw1ei2fq1m87	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-30 12:36 UTC. Sin leads ni CRM activos. Pipeline vacio, necesita datos de entrada para comenzar actividad de ventas.	f	2026-03-30 13:02:57.482	2026-03-30 13:02:57.538
cmnd77myk0003iw1e5lvyunb8	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Todos los sistemas operativos. Servidor node activo (uptime 26min), OpenClaw gateway activo, Cloudinary reachable. No hay incidencias detectadas. 22 agentes presentes en workspace.	f	2026-03-30 13:02:57.789	2026-03-30 13:02:57.79
cmnd77n4g0005iw1emxz4wb9f	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat de métricas. Estado: SIN DATOS DE NEGOCIO. MRR = €0, 0 pagos registrados, 0 interacciones de chat, 0 usuarios activos (ultimoAcceso = null en todos). 9 clientes registrados pero la mayoría parecen cuentas de test. Sin crecimiento real detectado.	f	2026-03-30 13:02:58.001	2026-03-30 13:02:58.002
cmnd77nab0007iw1e38r0g3gg	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando (200 OK). SSL OK. Issues menores: sitemap.xml y robots.txt devuelven HTML en vez de contenido estático (SPA routing en Render). 1 commit local pendiente de push a origin/main. No hay tareas de desarrollo pendientes detectadas. No hay memoria de heartbeats anteriores.	f	2026-03-30 13:02:58.211	2026-03-30 13:02:58.212
cmnd9c8mz0001kg1edr46fhh6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. Bandeja vacía, sin tickets pendientes. Sistema sin correr en prod (7+ días). Sin acciones pendientes.	f	2026-03-30 14:02:31.734	2026-03-30 14:02:31.806
cmnd9c8wa0003kg1e360uewk0	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin datos de pipeline. No hay leads activos en el sistema CRM/Notion. Sin accionables pendientes.	f	2026-03-30 14:02:32.074	2026-03-30 14:02:32.076
cmnd9c92g0005kg1euvbhjcms	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-03-30 21:45 MYT. API operativa. Git 1 commit ahead. Backup 4 días. sistemas monitorizados: API Express/Render OK, PostgreSQL Neon OK, Stripe OK, Resend OK. ERRORES DETECTADOS: 4 cron jobs fallando por Telegram @heartbeat no existe — chat not found (diana, marcos, carlos, compi-backup-gitpush). Job alerta-excepciones-telegram en timeout.	f	2026-03-30 14:02:32.297	2026-03-30 14:02:32.298
cmnd9c9820007kg1e0soig8b3	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat sin anomalias. No hay datos de metricas en el sistema (token-logs vacio, sin metricas de negocio). Base de datos PostgreSQL detectada pero metricas de negocio no diponibles via queries directas.	f	2026-03-30 14:02:32.498	2026-03-30 14:02:32.5
cmnd9c9dy0009kg1eeq04jwwt	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check completado. Web funcionando correctamente. SSL vigente (expira 13 Jun 2026). Sitemap accesible. Sin errores detectados.	f	2026-03-30 14:02:32.711	2026-03-30 14:02:32.713
cmndbheen0001k11e2wk5jorm	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat executed. No leads ni emails en el sistema. CRM vacío - no hay pipeline activo. Carlos necesita que se configure el CRM con datos de leads o que llegue el primer lead inbound.	f	2026-03-30 15:02:31.722	2026-03-30 15:02:31.793
cmndbhenp0003k11eaohwidhx	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat activo. Sin incidencias detectadas. Sin acceso a logs en tiempo real de MyCompi desde este contexto de cron.	f	2026-03-30 15:02:32.053	2026-03-30 15:02:32.054
cmndbhf430005k11ejmzxsy63	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Séptimo día sin actividad real. Sistema MyCompi no corre en producción. Sin datos de usuarios, MRR, churn ni signups. No hay anomalías porque no hay métricas - el problema es la ausencia total de datos.	f	2026-03-30 15:02:32.643	2026-03-30 15:02:32.644
cmndbhf9y0007k11el29z21m2	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com funcionando correctamente — HTTP 200, SSL OK, sitemap.xml accesible, robots.txt OK. No hay cambios pendientes en git. Sin incidencias detectadas.	f	2026-03-30 15:02:32.855	2026-03-30 15:02:32.856
cmnddmjcx0001j41ed9zccyov	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat automático. Sin bandeja de entrada configurada, sin tickets ni mensajes pendientes.	f	2026-03-30 16:02:30.658	2026-03-30 16:02:30.719
cmnddmjlh0003j41ej0ct1ej1	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin actividad esta pasada. No hay leads pendientes ni seguimientosprogramados. Pipeline vacio - sin datos de CRM disponibles.	f	2026-03-30 16:02:30.965	2026-03-30 16:02:30.966
cmnddmjr50005j41edf81ftuy	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Octavo día sin actividad real. Sistema MyCompi no corre en producción. Sin incidencias nuevas. token-logs.json vacío (sin uso de tokens). Último backup sigue siendo del 26/03. Sin nuevos commits desde el fix de cron jobs (15:45 UTC). Sin automatización nueva.	f	2026-03-30 16:02:31.169	2026-03-30 16:02:31.17
cmnddmjxf0007j41ezel7me2d	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Día 7+ sin actividad real. Sistema MyCompi sigue sin correr en producción. Sin datos de usuarios, MRR, churn ni sesiones. Standups confirman patrón: los agentes no están despertando. Arquitectura hub-and-spoke definida pero inactiva. No se detectan anomalías nuevas respecto al estado ya conocido.	f	2026-03-30 16:02:31.395	2026-03-30 16:02:31.396
cmnddmk3e0009j41ek1ia7w1r	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com funcionando (200 OK). SSL vigente. Admin y chat-panel accesibles. Sin cambios pendientes en el repo. Sin deuda técnica urgente. Sin deploys pendientes.	f	2026-03-30 16:02:31.611	2026-03-30 16:02:31.612
cmndfrtm00001i91e0yifwwtx	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad nueva. Bandeja vacia, sin tickets pendientes ni mensajes pendientes de respuesta.	f	2026-03-30 17:02:36.451	2026-03-30 17:02:36.527
cmndfrtun0003i91e4fnnvasx	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin datos de pipeline. Sistema MyCompi no está corriendo en producción (confirmado por standups 6+ días sin actividad). No hay leads, no hay CRM activo, no hay secuencias outbound. Pipeline vacío.	f	2026-03-30 17:02:36.768	2026-03-30 17:02:36.769
cmndfru0f0005i91ef4cn0jpz	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat activo. Procesos OK: node server.mjs (PID 10), openclaw (PID 23), openclaw-gateway (PID 30). MyCompi v3 cron jobs activos. Ninguna incidencia detectada.	f	2026-03-30 17:02:36.975	2026-03-30 17:02:36.976
cmndfru690007i91e9hnpj9ej	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat activo. No hay métricas en el workspace (data/ y dashboards vacíos). Proyecto MyCompi/BeeNoCode detectado pero sin datos de métricas en este entorno. No se pueden evaluar KPIs (MRR, churn, new_users, activation rate) sin acceso a base de datos o dashboards.	f	2026-03-30 17:02:37.186	2026-03-30 17:02:37.187
cmndhwhs00001ip1wycx9d3x5	cmn3je5zq0000e31xg8wru9iy	TestDeploy	INFO	Test — deploy verification	Deploy funcionando correctamente	f	2026-03-30 18:02:13.627	2026-03-30 18:02:13.718
cmndhwu2d0003ip1wh06z3795	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 17:40 UTC. Revision completada. No hay emails, tickets ni mensajes pendientes en el sistema. Proyecto en fase de desarrollo (app/admin panel). Todo en calma.	f	2026-03-30 18:02:29.551	2026-03-30 18:02:29.558
cmndhwu8d0005ip1wf22t6zhw	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin datos de pipeline disponibles. Sistema MyComPi no activo en producción (7+ días sin actividad). No hay leads, CRM ni datos de ventas que procesar. Sin seguimientos pendientes.	f	2026-03-30 18:02:29.773	2026-03-30 18:02:29.774
cmndhwue50007ip1wktz4xgy3	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 01:45 AM MYT. Sin incidencias. Revisión de procesos, logs y sistemas operativos — todo en orden. Sin automatizaciones pendientes ni incidencias detectadas. Madrugada KL — monitorización pasiva.	f	2026-03-30 18:02:29.982	2026-03-30 18:02:29.983
cmndhwuuy0009ip1w0ajrvoej	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat activo — métricas sin cambios. Sistema MyCompi sin actividad real hace 7+ días. 9 clientes en DB (todos BASICO), 0 MRR, 0 trabajos completados, 0 chats. Servidor parece no estar corriendo.	f	2026-03-30 18:02:30.586	2026-03-30 18:02:30.587
cmndhwv0u000bip1w02rvw94k	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Backend up en mycompi.onrender.com (200 OK). Dominio mycompi.es responde 000 — posible problema DNS o dominio caído. Último deploy: 29 mar 2026. No hay errores críticos en el health check del servidor.	f	2026-03-30 18:02:30.799	2026-03-30 18:02:30.799
cmndk203g0009ix1eeck85o3s	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20min — Sin bandeja de entrada configurada localmente. Sin mensajes pendientes. Estado: OK.	f	2026-03-30 19:02:29.191	2026-03-30 19:02:29.936
cmndk20bl000bix1est5xnp5p	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check automático — MyCompi server (puerto 3000) no está corriendo. Solo el gateway de OpenClaw está activo. Sin incidencias críticas nuevas detectadas. El sistema sigue en el mismo estado: 7+ días sin actividad en producción.	f	2026-03-30 19:02:30.178	2026-03-30 19:02:30.179
cmndk20hj000dix1ejnolx8hv	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-30 18:38 UTC. Sin anomalías detectadas. Datos de métricas vacíos (token-logs sin entradas). Sistema en fase inicial sin tracking activo. Confirmo actividad normal.	f	2026-03-30 19:02:30.391	2026-03-30 19:02:30.392
cmndk20ng000fix1e7mkxow2t	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200, SSL OK). Meta tags SEO correctos. sitemap.xml accesible. Sin incidencias ni tareas pendientes de deploy. Research de trends 2026 realizado.	f	2026-03-30 19:02:30.604	2026-03-30 19:02:30.605
cmndm767a0001gm1x7yd4g6m9	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 03:20 MYT. Revisada bandeja de entrada — sin emails pendientes, sin tickets, sin mensajes encolados. Sistema operativo con normalidad.	f	2026-03-30 20:02:30.305	2026-03-30 20:02:30.361
cmndm76f40003gm1xda7iadud	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat nocturno 03:45 MYT — sin incidencias. Sistemas sin logs de error. Sprint backlog vacío. Strategy proposals: Carlos tiene 3 proposals activas (ventas/CRM/outbound). Todo en orden.	f	2026-03-30 20:02:30.592	2026-03-30 20:02:30.593
cmndm76l70005gm1x61olnb6m	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-30 19:34 UTC. Sistema en fase early stage: 9 clientes (todos BASICO), 0 pagos, 0 trabajos, 0 mensajes. 8/9 clientes creados en últimos 7 días — launches/recientes. Sin anomalías de datos. Sin Oportunidades de growth urgentes. Sin research pendiente esta semana (próxima: semana misma fecha).	f	2026-03-30 20:02:30.812	2026-03-30 20:02:30.812
cmndm76r90007gm1x9dx2aos9	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com respondiendo correctamente (HTTP 200). SSL OK. Sin errores detectados. Solo 1 cambio pendiente en git (carlos heartbeat). Sin deploys pendientes.	f	2026-03-30 20:02:31.029	2026-03-30 20:02:31.03
cmndoce4y0001hm1e6daf9fti	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat nocturno (20:40 UTC). Sin actividad. Hora local: 04:40 KL — madrugada. Bandeja vacía.	f	2026-03-30 21:02:33.099	2026-03-30 21:02:33.166
cmndocedj0003hm1e963cjf4u	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check OK. App ejecutándose correctamente, sin incidencias. Revisión operativa limpia.	f	2026-03-30 21:02:33.416	2026-03-30 21:02:33.417
cmndocetn0005hm1enfzfwhng	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (200), SSL activo, sitemap accesible. Últimos commits: MINIMAX_API_KEY para Paco chat, fix MiniMax API directa. Sin incidencias pendientes.	f	2026-03-30 21:02:33.996	2026-03-30 21:02:33.997
cmndqhici0001is1ellxb4xsq	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 05:40 MYT — Sin actividad. Bandeja vacía, sin tickets pendientes ni mensajes nuevos.	f	2026-03-30 22:02:31.068	2026-03-30 22:02:31.143
cmndqhil00003is1e0ro7gxar	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalías. No hay campañas activas documentadas ni leads nuevos. Sprint backlog vacío. Strategy proposals actualizadas con 3 proposals de Carlos y 1 de Enzo para semana 2026-03-31.	f	2026-03-30 22:02:31.38	2026-03-30 22:02:31.381
cmndqhiqt0005is1eswa67lf1	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sin incidencias críticas. openclaw-gateway activo (PID 30). MyCompi server no está corriendo en puerto 3000 (esperado si está en Render). Proceso zombie sh (PID 2210) detectado — probable residuo de cron job, sin impacto. Sistemas externos (DB Neon, Resend) no verificables desde este contexto. Todo verde.	f	2026-03-30 22:02:31.589	2026-03-30 22:02:31.59
cmndqhiwe0007is1eznx4jf5d	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Día 8 sin actividad real. Servidor caído, 0 interacciones, 0 pagos. Solo 9 clientes BASICo de prueba. Sin anomalías sobre el patrón conocido.	f	2026-03-30 22:02:31.791	2026-03-30 22:02:31.792
cmndqhj200009is1e9v9w8img	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 2026-03-30. Landing build OK. Añadido FAQPage schema markup (11 Q&A) para SEO y featured snippets. Gap crítico: no existe sitemap.xml en landing. También detectada discrepancia tipografía: SPEC.md dice Poppins pero index.html usa Unbounded+PlusJakartaSans.	f	2026-03-30 22:02:31.992	2026-03-30 22:02:31.993
cmnduu2hn0001h51eqrarxz93	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalías. Research competidores actualizado: TypingMind (20k+ users, lifetime pricing, MCP integrations) y Chatbase (10k+ businesses, smart escalation, WhatsApp integration). MyCompi bien posicionado vs ambos por precio y concepto compi.	f	2026-03-31 00:04:15.511	2026-03-31 00:04:15.592
cmnduu2qq0003h51exu3bzspw	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-31 07:55 UTC. Sin cambios respecto al anterior (06:31 UTC). No hay datos de pipeline - CRM no integrado. Sistema sigue sin correr en producción. Sin leads activos no hay qualificación ni seguimientos posibles. Research proposals ya actualizados (Proposals 5-7).	f	2026-03-31 00:04:15.842	2026-03-31 00:04:15.843
cmnduu2wk0005h51eojas43cq	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Todo OK. Sin incidencias ni errores detectados. Sin actividad nueva desde último heartbeat.	f	2026-03-31 00:04:16.052	2026-03-31 00:04:16.053
cmnduu3bw0007h51esszbvzi7	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-31 07:41 KL. Sin anomalías en métricas. Gap crítico persiste: PostgreSQL Neon inaccessible desde el workspace — no hay pipeline de métricas activo. Carlos ha publicado 3 proposals nuevos (Loom video prospecting, AI personalization, secuencias cortas). Diana añade primer proposal semanal sobre data & growth trends 2026.	f	2026-03-31 00:04:16.604	2026-03-31 00:04:16.605
cmnduu3hm0009h51e5h7naicm	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcional. SSL OK. Issue SEO técnico: sitemap.xml y robots.txt devuelven HTML en vez de contenido estático (probable fallback SPA). Admin panel ya no da 301. Hay cambios locales sin commitear en landing, public y strategy-proposals.	f	2026-03-31 00:04:16.811	2026-03-31 00:04:16.812
cmndwx0zc0001gj1e0hhvzz8w	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat de verificación. Sin acceso a CRM/pipeline real de MyCompi. Research semanal ya cubierto con 4 proposals (semana 2026-03-31). No hay acciones pendientes de ventas.	f	2026-03-31 01:02:32.755	2026-03-31 01:02:32.836
cmndwx17y0003gj1ed1dh3l0r	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat OK. Sin incidencias detectadas. Script heartbeat-notifications.js presente y configurado correctamente (envía notificaciones hourly a /api/notificaciones/interna). Sprint backlog vacío aún pendiente de definir objetivos de semana. Strategy proposals: sección Elena vacía esta semana — Carlos y Diana ya tienen proposals activos.	f	2026-03-31 01:02:33.07	2026-03-31 01:02:33.072
cmndwx1e20005gj1eje1ywh1x	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente. SSL OK, /health returns 200, landing accesible. Issues detectados: (1) sitemap.xml no existe - solo hay referencia en código, (2) canonical apunta a mycompi.onrender.com en lugar de mycompi.com, (3) Hay páginas en src/pages sin sitemap dinámico. Propuesta: generar sitemap.xml estático o dinámico para SEO.	f	2026-03-31 01:02:33.29	2026-03-31 01:02:33.292
cmndz27xq0001dq1eznvnmdbs	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat activo. Revisada bandeja de entrada y sistema de tickets. Sin actividad nueva. Sin tickets pendientes ni mensajes pendientes. Todo en calma.	f	2026-03-31 02:02:34.285	2026-03-31 02:02:34.317
cmndz284t0003dq1eleh4jcsi	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío sin actividad. No hay leads activos ni seguimientos en curso. CRM sigue en sistema externo no accesible desde este nodo. Research semanal ya completo (3 proposals en strategy-proposals.md). Sin acción urgente.	f	2026-03-31 02:02:34.542	2026-03-31 02:02:34.543
cmndz28ao0005dq1el5kg6vn6	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat Martes 31 — Sin incidencias nuevas. Sistema MyCompi sigue sin actividad en producción (confirmado 7+ días sin sesiones). Elena ya hizo research semanal la semana del 24/03. Sin automatizaciones activas que revisar porque el sistema no está corriendo. Systems: all_green (sin datos = sin errores detectables).	f	2026-03-31 02:02:34.753	2026-03-31 02:02:34.754
cmndz28h50007dq1eema8alqj	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat de métricas. MRR = €0 (0 pagos completados). 9 clientes activos en BD, ninguno ha pagado aún. Activation rate = 0%. Posible issue con Stripe webhook o clientes en fase de prueba. Sin datos suficientes para churn/retention (mínimo 7 días necesarios).	f	2026-03-31 02:02:34.985	2026-03-31 02:02:34.986
cmndz28mv0009dq1eg5bhg3qp	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200). Sitemap accesible. SSL vigente. Cambios locales pendientes de deploy: FAQ schema markup (+98 líneas en landing/index.html y public/index.html). No hay errores detectados.	f	2026-03-31 02:02:35.191	2026-03-31 02:02:35.192
cmne17dol0001ds1enjgl911i	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat verificado. Sin actividad pendiente en bandeja de entrada, tickets o mensajes.	f	2026-03-31 03:02:34.24	2026-03-31 03:02:34.299
cmne17dx80003ds1e8wa7agku	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat Tuesday 10:55 MYT — Research semanal ejecutado. 3 proposals nuevos añadidos a strategy-proposals.md: (8) LinkedIn Video Prospecting, (9) Política de Descuentos data-driven, (10) Apollo vs Smartlead recomendación. Pipeline sigue a 0,0,0 — no hay datos CRM/leads en workspace. Sprint backlog y weekly report siguen vacíos (plantillas). Onboarding completo disponible.	f	2026-03-31 03:02:34.556	2026-03-31 03:02:34.557
cmne17e3e0005ds1eqr3fhylj	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat inicial. Sistemas OK, sin incidencias. Compi operando normalmente en producción.	f	2026-03-31 03:02:34.778	2026-03-31 03:02:34.779
cmne17e9i0007ds1e12wiphyk	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Día 8 sin actividad de pago. 9 usuarios registrados, 0 pagos, 1 acceso real (Alberto). Sin anomalías graves — la situación es expected para producto en validación. No hay experimentos activos ni datos de onboarding.	f	2026-03-31 03:02:34.998	2026-03-31 03:02:34.999
cmne17efe0009ds1ed2wkktnx	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente. SSL vigente. Health endpoint devuelve 200. Meta tags SEO OK. Canonical URL apunta a onrender.com (inconsistencia menor). Landing tiene cambios pendientes de commit: FAQ schema markup añadido. No hay sitemap.xml en producción ni robots.txt visible. SSL OK hasta Jun 2026.	f	2026-03-31 03:02:35.211	2026-03-31 03:02:35.212
cmne3cis4000dds1ebyoem00q	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin cambios. APIs de marketing sin configurar. Todo tranquilo.	f	2026-03-31 04:02:32.685	2026-03-31 04:02:33.417
cmne3cj06000fds1e273fhf5k	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat de mantenimiento. Pipeline vacío confirmado — Carlos en standby esperando setup de CRM y primeros leads. 10 proposals activos cubriendo outbound B2B 2026 (video prospecting, AI personalization, secuencias short-range, LinkedIn TL Ads, Instantly/Smartlead/Apollo). No hay leads en el sistema. Siguiente paso: setup CRM y primers outbound.	f	2026-03-31 04:02:33.655	2026-03-31 04:02:33.655
cmne3cj5q000hds1es0t19y9a	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat matutino — sin incidencias. mycompi.com responde 200. Git actualizado (último commit: MINIMAX_API_KEY + fix chat Paco). Última estrategia proposals activa con 3 proposals Elena. Sin automatizaciones pendientes ni incidencias detectadas.	f	2026-03-31 04:02:33.854	2026-03-31 04:02:33.855
cmne3cjbe000jds1ekui8lkpb	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Sistema MyCompi sin actividad real detectada. 7+ días consecutivos sin sesiones, sin métricas, sin logs de uso. El proyecto está arquitecturado (16 agentes, schema Prisma, landing/admin panels completos) pero no hay datos de uso en Neon. Los daily standups de los últimos días confirman el mismo patrón: $0 costo, 0 sesiones. No hay anomalías de datos porque no hay datos - es una ausencia total de tracking.	f	2026-03-31 04:02:34.059	2026-03-31 04:02:34.06
cmne3cjgy000lds1e3ifhbx68	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200, SSL OK). Hay cambios sin commit en landing/index.html y public/index.html (FAQ Schema markup). Ninguna incidencia crítica.	f	2026-03-31 04:02:34.258	2026-03-31 04:02:34.259
cmne5hpzl0001fa1ewc0ns6ql	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 12:20 MYT — Sin actividad. Bandeja vacía, sin tickets pendientes ni mensajes urgentes.	f	2026-03-31 05:02:35.213	2026-03-31 05:02:35.293
cmne5hq840003fa1esz75x8f0	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalías en campañas - todas las APIs de marketing siguen sin conectar. Propuesta Enzo creada: short-form video strategy para MyCompi (orgánico, sin coste, inmediato).	f	2026-03-31 05:02:35.525	2026-03-31 05:02:35.525
cmne5hqdv0005fa1ekdl3cfq1	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-31 04:55 UTC. Carlos activo. Nada nuevo que reportar — pipeline sigue vacío (sin CRM ni leads). Research semanal ya ejecutado en heartbeat anterior. Urgente: necesita setup de CRM y definición de ICP/leads para poder hacer qualificar y seguimiento real. Mientras tanto, proposals actualizados y listos.	f	2026-03-31 05:02:35.732	2026-03-31 05:02:35.732
cmne5hqjm0007fa1e0z2icpgw	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Servidor respondiendo correctamente (HTTP 200). Endpoints /api/health y /api/healthcheck no encontrados (posible ruta diferente). Sin logs de error nuevos detectados. Sistema base operativo.	f	2026-03-31 05:02:35.939	2026-03-31 05:02:35.939
cmne5hqpi0009fa1e7ctm5za4	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat ejecutado. MRR = 0€, solo 2/9 usuarios activos en 7 días.平台上还没有收入，所有客户都在BASICO计划。激活率和留存率是主要问题。	f	2026-03-31 05:02:36.15	2026-03-31 05:02:36.151
cmne5hquz000bfa1etqje952t	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Todo OK. Landing build exitoso, FAQ schema markup en producción. Sin incidencias. Branch al día con origin. Sin deploys pendientes.	f	2026-03-31 05:02:36.348	2026-03-31 05:02:36.348
cmne7muqz000ffa1elgrol66a	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 2026-03-31 05:20 UTC. Sin actividad: no hay acceso a bandeja de entrada (himalaya requiere TTY), no hay tickets pendientes en el workspace, no hay mensajes pendientes.	f	2026-03-31 06:02:33.285	2026-03-31 06:02:33.951
cmne7muyv000hfa1erzh08q6w	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío sin cambios. Sin leads activos ni CRM configurado. Strategy proposals al día (11 proposals). Sin acción requerida.	f	2026-03-31 06:02:34.184	2026-03-31 06:02:34.186
cmne7mv4k000jfa1ebnlvrrc3	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK: node server.mjs activo (PID 10), openclaw-gateway activo (PID 30). No hay logs de errores disponibles ni incidencias. Procesos estables desde última revisión.	f	2026-03-31 06:02:34.388	2026-03-31 06:02:34.39
cmne7mva7000lfa1e9zev7hmi	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Octavo día consecutivosin actividad real. Sistema MyCompi sigue sin correr en producción. token-logs.json = []. Sin métricas disponibles. Los proposals de strategy están actualizados (Carlos, Elena) pero no hay datos de uso reales.	f	2026-03-31 06:02:34.592	2026-03-31 06:02:34.593
cmne7mvr3000nfa1e0fvpuagg	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200, SSL OK, CloudFlare). Git tiene cambios pendientes de commit: FAQ Schema markup añadido a landing/index.html y public/index.html (mejora SEO). Tests: 0 suites (no hay tests todavía). Issues encontrados: (1) sitemap.xml NO existe ni en landing ni en public — oportunidad SEO importante, (2) robots.txt no existe en el proyecto. SSL y headers CSP OK.	f	2026-03-31 06:02:35.199	2026-03-31 06:02:35.201
cmne9sij90001h51ec4il07is	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay emails, tickets ni mensajes pendientes. Sistema tranquilo.	f	2026-03-31 07:02:57.237	2026-03-31 07:02:57.28
cmne9sit70003h51efzto991s	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-31 06:55 UTC. Pipeline vacío (hot:0, warm:0, cold:0). No hay seguimientos activos, no hay secuencias en curso. 3 proposals activos cubriendo las priorities de la semana (video outreach, AI personalization, secuencias cortas 3-touch). Carlos sigue sin leads para trabajar — requiere intervención de Paco o MyCompi para obtener inbound leads o aprobar inicio de outbound.	f	2026-03-31 07:02:57.595	2026-03-31 07:02:57.596
cmne9siyy0005h51e96iv7yv9	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK. Git muestra cambios en landing (FAQ schema markup añadido a landing/index.html y public/index.html — parece mejora SEO propuesta por Valeria). Agent Diana eliminado. Sin logs de error, sin incidencias de integraciones de terceros.	f	2026-03-31 07:02:57.802	2026-03-31 07:02:57.803
cmne9sj500007h51eky035hxw	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.com funcionando correctamente (200 OK). SSL vigente. Landing y /contratacion accesibles. Git tiene cambios unstaged en landing/index.html y public/index.html (FAQ Schema markup). Sin incidencias críticas.	f	2026-03-31 07:02:58.02	2026-03-31 07:02:58.021
cmnebxrbf0001f21e3abo7zb5	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay emails, tickets ni mensajes pendientes en este heartbeat.	f	2026-03-31 08:03:01.131	2026-03-31 08:03:01.197
cmnebxrk00003f21euzg6iu9g	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío — sin leads activos ni seguimientos pendientes. Sin cambios respecto al heartbeat anterior. Carlos continúa en standby.	f	2026-03-31 08:03:01.44	2026-03-31 08:03:01.442
cmnebxrq70005f21e2us7wqfd	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat rutinario. Estado idéntico al anterior: servidor principal Node.js activo, paneles no levantados (puertos cerrados). Sin incidencias nuevas. Proposal MCP y auto-documentation siguen pendientes de implementación.	f	2026-03-31 08:03:01.664	2026-03-31 08:03:01.665
cmnebxrwb0007f21e2mmx3l80	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat ejecutado. No hay datos de métricas disponibles en data/. El archivo token-logs.json está vacío. No hay CSVs ni fuentes de métricas activas.	f	2026-03-31 08:03:01.884	2026-03-31 08:03:01.885
cmnebxs250009f21enrvwbxcc	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Landing funcional en mycompi.onrender.com (200 OK). mycompi.es redirige a 'defaultsite' — dominio no apunta correctamente. FAQ schema ya implementado. Falta sitemap.xml. SSL OK en Render.	f	2026-03-31 08:03:02.093	2026-03-31 08:03:02.095
cmnee2ael0007eq1wfhu2itlb	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin actividad real de ventas. Sistema MyCompi lleva 7+ días sin correr en producción. Sin CRM, sin leads, sin pipeline activo. Research semanal completado: proposals 8-11 añadidas a strategy-proposals.md (video prospecting, descuentos, Apollo vs Smartlead, human-in-the-loop AI). Pipeline real: 0 hot, 0 warm, 0 cold.	f	2026-03-31 09:02:31.723	2026-03-31 09:02:31.729
cmnee2akx0009eq1wtsuvz6p0	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check completado. Sin incidencias. Node server y gateway activos. Backups: último del 26/03. Token logs vacíos (sin incidencias de uso). Estrategia: propuesta video prospecting activa. Sistemas operativos sin errores.	f	2026-03-31 09:02:31.953	2026-03-31 09:02:31.955
cmnee2ar1000beq1wwnvnaiiy	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente. SSL OK, sitemap y robots.txt accesibles. Build compila sin errores. Changes pendientes: FAQ schema markup (+98 líneas) ya en landing/index.html listo para commit+deploy cuando Paco lo autorice.	f	2026-03-31 09:02:32.173	2026-03-31 09:02:32.175
cmneg7jft0001bz1ecukve0c3	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad nueva. Sistema MyCompi sin actividad real (8 dias consecutivos). No hay emails, tickets ni mensajes pendientes. Todo en espera de deploy en produccion.	f	2026-03-31 10:02:35.86	2026-03-31 10:02:36.045
cmneg7jqo0003bz1ebou4w4nf	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío (sin CRM activo). Sin leads nuevos ni seguimientos. Proposals 5-11 de hoy siguen vigentes. Sin cambios respecto al heartbeat anterior de 09:33 UTC. Carlos sigue en standby hasta que MyCompi configure integración CRM (Apollo/Instantly/Smartlead). weekly research ya realizado (proposals actualizados hoy).	f	2026-03-31 10:02:36.337	2026-03-31 10:02:36.338
680130a4-d47c-422d-9259-32274a4e4224	cmn77j4yd0002b41efmeyg8o1	Laura	INFO	Cliente FRIO: Test SL	15 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.595	2026-04-10 18:54:13.595
cmneg7jwn0005bz1emzbk3ah4	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check completo — todos los sistemas OK. Última actualización del codebase: hace ~9h (fix SSE parser + Stripe). Backups verificados (backup_2026-03-26). No hay incidencias activas ni procesos fallando. Stack: Node.js + Express + Prisma/Neon + Stripe + Resend. Puertos y servicios sin anomalías.	f	2026-03-31 10:02:36.551	2026-03-31 10:02:36.553
cmneg7k2q0007bz1e3r85egt2	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana - 9 clientes activos, 9 usuarios, 7 agentes. MRR = 0€ (SIN PAGOS COMPLETADOS). 7/9 usuarios sin acceso reciente (>7 días). Sistema sin trabajos activos ni interacciones de chat esta semana. Revisar: la mayoría de clientes parecen cuentas de test (TestEmpresa, Test SL, etc.)	f	2026-03-31 10:02:36.77	2026-03-31 10:02:36.772
cmneg7k8q0009bz1e1xxh8c0g	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check completo. beenocode.com → 301 redirect a beenocode.framer.website (funcionando correctamente). SSL válido hasta May 28 2026. sitemap.xml disponible (200). Sin incidencias.	f	2026-03-31 10:02:36.986	2026-03-31 10:02:36.988
cmneicl3k0003ha1wy7my2t6c	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20min — revisión de bandeja y tickets: sin actividad. Sistema vacío, sin tickets pendientes ni emails.	f	2026-03-31 11:02:30.608	2026-03-31 11:02:30.615
cmneicl9r0005ha1wi2jhclqv	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin cambios desde último heartbeat. No hay datos de pipeline ni CRM integrado en el workspace. Sin leads activos, seguimientos pendientes ni nueva actividad. Strategy proposals ya actualizados con 11 proposals de Carlos. Este heartbeat se ejecuta ~24min después del anterior sin nuevos datos.	f	2026-03-31 11:02:30.832	2026-03-31 11:02:30.833
cmneiclfj0007ha1wz48as6cc	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat inicial. Revisión de sistemas: todo OK. Sin automatizaciones pendientes, sin incidencias. Proyecto MyCompi/BeeNoCode operativo.	f	2026-03-31 11:02:31.039	2026-03-31 11:02:31.041
cmneicllh0009ha1w7q4tbw1z	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat de Diana activo. Sin acceso directo a métricas live (Neon DB, dashboards). Proyecto en estado de desarrollo active con múltiples agents trabajando. Sin anomalías detectadas en archivos locales. No hay métricas highs/lows esta semana.	f	2026-03-31 11:02:31.253	2026-03-31 11:02:31.254
cmneiclrc000bha1wwalg3soz	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.com UP (200), SSL OK. Git muestra cambios sin desplegar: landing/index.html (+FAQ schema markup), public/index.html, y assets de admin/chat. IMPORTANTE: /sitemap.xml devuelve HTML en vez de XML — error SEO crítico. Despliegue pendiente.	f	2026-03-31 11:02:31.464	2026-03-31 11:02:31.465
cmnekkrda0001e81e7590fx03	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay emails, tickets ni mensajes pendientes en el sistema.	f	2026-03-31 12:04:50.574	2026-03-31 12:04:51.27
cmnekkrlp0003e81ef9k4kqyk	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sistema sin actividad real 8+ días. Sin campañas activas. Research tendencias 2026: short-form video domina, Thought Leader Ads LinkedIn 2-3x mejor engagement, social = search engine para B2B buyers, employee advocacy > brand handles, AI disclosures obligatorios. Proposals activos de Carlos, Elena, Diana en archivo compartido.	f	2026-03-31 12:04:51.517	2026-03-31 12:04:51.518
cmnekkrre0005e81ee6x4rq83	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 19:55 KL (11:55 UTC). Pipeline vacío — sin leads, sin CRM activo, sin datos de ventas. Research semanal ya completado hoy a las 12:31 UTC (4 proposals nuevas añadidas a strategy-proposals.md). Sistema MyCompi sigue sin actividad real. Sin cambios en pipeline ni necesidad de seguimientos. Todo en standby hasta que el producto esté deployado.	f	2026-03-31 12:04:51.723	2026-03-31 12:04:51.723
cmnekkrx90007e81ey1n9xmwn	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas MyCompi en estado normal. Sin incidencias. Git limpio, último backup 5 días atrás (sin cambios). Elena disponible para automatizaciones y ops.	f	2026-03-31 12:04:51.934	2026-03-31 12:04:51.934
cmnekks2z0009e81ehiz7t3sf	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat inicial de Diana. Sistema en fase temprana con 9 usuarios y 9 clientes (todos plan BASICO). Sin pagos registrados ni trabajos activos. Agentes dados de alta (Laura, Enzo, Carlos, Elena, Diana Fabián, Marcos, Valeria) pero sin uso todavía. Churn: 0% (no hay bajas). Sin datos suficientes para análisis de tendencias (min 7 días).	f	2026-03-31 12:04:52.139	2026-03-31 12:04:52.14
cmnekks8p000be81eky65yvnv	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio principal mycompi.es no responde. Landing sin build reciente (dist missing). ISSUES: (1) Site unreachable - puede ser DNS, dominio mal configurado o Render pausado. (2) Canonical URL wrong - apunta a onrender.com en vez de dominio real. (3) Falta HowTo schema y sitemap.xml para SEO. (4) git diff pendiente de revisar.	f	2026-03-31 12:04:52.345	2026-03-31 12:04:52.346
cmnemmx200001gs1eknkyouif	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat de verificacion. No hay emails, tickets ni mensajes pendientes en el sistema. Todo tranquilo.	f	2026-03-31 13:02:31.123	2026-03-31 13:02:31.201
cmnemmxaj0003gs1e8gsev7b6	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat de mantenimiento. Pipeline vacío, sin CRM ni leads cargados. Sin cambios desde último heartbeat. Sin urgencia.	f	2026-03-31 13:02:31.435	2026-03-31 13:02:31.443
cmnemmxgn0005gs1emv9nk8kt	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas ok. MyCompi corriendo en producción (Docker + Render). Stack completo: Node server, Prisma/Neon, Resend emails, JWT auth. Última backup 2026-03-26 (5 días — verificar si debe ser más frecuente). Git limpio, últimos commits: sync MINIMAX_API_KEY, fix chat SSE. Sin incidencias nuevas. incidencias.md aún no creado (proposal Elena de la semana pasada pendiente).	f	2026-03-31 13:02:31.656	2026-03-31 13:02:31.664
cmnemmxmh0007gs1earo4z6jx	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-31 20:32 MYT. Sistema en fase temprana: 9 clientes BASIC0, solo 1 activo (AlberBEE con 7 agentes). Sin pagos registrados, sin emails, sin chats. 8/9 clientes sin activar (0 agentes). Gaps críticos de tracking detectados.	f	2026-03-31 13:02:31.865	2026-03-31 13:02:31.873
cmnemmy2d0009gs1etg7nzggy	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (200, SSL OK). Git tiene cambios locales pendientes: landing/index.html +98l, public/admin assets eliminados, strategy-proposals.md actualizado. No hay backup reciente (último backup: 2026-03-26). No hay incidencias. Research semanal no aplicable hoy (último research: semana 2026-03-24 a 2026-03-30, aplica la semana que viene).	f	2026-03-31 13:02:32.438	2026-03-31 13:02:32.446
cmneos6lb0001e91xfo460agb	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat verificado. himalaya no tiene acceso configurado (sin TTY/config). Sin emails ni tickets pendientes visibles desde el workspace. Todo tranquilo.	f	2026-03-31 14:02:35.999	2026-03-31 14:02:36.05
cmneos7330003e91xg8sdhbrr	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin cambios vs heartbeat anterior. Pipeline sigue vacío (hot:0, warm:0, cold:0). CRM no integrado. Research semanal ya ejecutado (Proposals 12 y 13 en strategy-proposals.md). Sin leads pendientes ni seguimientos. Todo tranquilo.	f	2026-03-31 14:02:36.639	2026-03-31 14:02:36.641
cmneos7930005e91xjh89eei5	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sin incidencias. Todo tranquilo. Última alerta: recomendación Sentry aún pendiente (del heartbeat anterior). Sin cambios en el estado del sistema.	f	2026-03-31 14:02:36.855	2026-03-31 14:02:36.856
cmneos7eu0007e91xak2ijahx	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana 2026-03-31. Sin acceso directo a métricas live de Neon DB desde este contexto. Research: benchmarks SaaS 2026 muestran NRR medio 106%, churn 5-7% anual B2B <$10K ARPU. Sin anomalías detectadas. Sin acceso a datos de uso, login events, o feature adoption para generar alertas.	f	2026-03-31 14:02:37.062	2026-03-31 14:02:37.063
cmneos7ki0009e91xnzck9oty	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web operativa. SSL OK. Detectados 2 issues SEO técnicos: (1) sitemap.xml y robots.txt no existen como estáticos — el servidor sirve HTML (fallback SPA), lo que impide que Google indexe correctamente. (2) FAQ tiene contenido pero no tiene schema.org/FAQPage markup. Tareas rápidas de bajo esfuerzo con impacto SEO directo.	f	2026-03-31 14:02:37.267	2026-03-31 14:02:37.268
cmneqxzvh0001er1eyxukythm	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20min — Sin bandeja de entrada configurada ni tickets pendientes. Sistema de email (himalaya) no disponible en este nodo.	f	2026-03-31 15:03:06.461	2026-03-31 15:03:06.514
cmneqy03s0003er1eo9wy9r2y	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sistema MyCompi sin cambios. Investigación actualizada: Thought Leader Ads LinkedIn y GEO como oportunidades viables. Competencia consolidada (Cursor, Copilot).	f	2026-03-31 15:03:06.761	2026-03-31 15:03:06.762
cmneqy0jg0005er1e37dla2hv	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío (0 leads). CRM sin datos. Research semanal ya documentado (proposals 12-13). Outbound MyCompi aún en fase de estrategia. No hay urgências ni seguimientos pendientes.	f	2026-03-31 15:03:07.325	2026-03-31 15:03:07.325
cmneqy0pg0007er1efsbdkn30	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Todo estable. El endpoint de mycompi.onrender.com/health responde con 200 (la última vez estaba caído con timeout). No hay nuevos logs ni incidencias. Sistemas en verde.	f	2026-03-31 15:03:07.54	2026-03-31 15:03:07.541
cmneqy0v70009er1ehjkq84j1	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Noveno día sin actividad real. Sin métricas disponibles - el sistema MyCompi no está corriendo en producción. El standup del 31/03 confirma 0 sesiones registradas y $0 en costs. La base de datos Neon tiene estructura pero no hay datos de uso real. La propuesta de Churn Prediction está en strategy-proposals.md pero requiere datos que no existen aún.	f	2026-03-31 15:03:07.747	2026-03-31 15:03:07.748
cmneqy120000ber1e5f0mmyg5	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check: mycompi.com UP (HTTP 200). SSL vigente. /admin y /chat devuelven 301 (redirect a login, normal). Sin errores 5xx detectados. Última actividad en código: feat Paco onboarding automático (commit 9c1e151). No hay alertas pendientes ni incidencias.	f	2026-03-31 15:03:07.992	2026-03-31 15:03:07.993
cmnet2hjv0001gp1ecy9xyhvh	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay inbox, tickets ni mensajes pendientes en el sistema.	f	2026-03-31 16:02:35.227	2026-03-31 16:02:35.292
cmnet2hsa0003gp1ekdmab2w5	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sistema MyCompi sin cambios. Sin campañas activas ni leads. Todo sigue bloqueado por falta de deploy.	f	2026-03-31 16:02:35.53	2026-03-31 16:02:35.531
cmnet2hxt0005gp1eu0w0nn3x	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin cambios — Carlos continúa sin pipeline ni datos de CRM. No hay leads, secuencias activas ni archivos de CRM en el workspace. Research semanal ya completado hoy a las 13:05 UTC (Proposal 12 video prospecting + Proposal 13 Instantly.ai). Strategy-proposals.md tiene 13 proposals activos. Carlos necesita setup de CRM y carga de pipeline antes de poder ejecutar outbound.	f	2026-03-31 16:02:35.729	2026-03-31 16:02:35.731
cmnet2i3i0007gp1e6wn2u2uu	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK — node server.mjs activo (PID 10), openclaw-gateway activo (PID 30). Sin incidencias detectadas. Sin logs de errores. Health check completado sin problemas.	f	2026-03-31 16:02:35.935	2026-03-31 16:02:35.936
cmnet2i9f0009gp1eh4w05xvn	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] 8vo día consecutivo sin actividad real. Sistema MyCompi sigue sin correr en producción. No hay métricas, no hay sesiones, no hay uso. El producto está construido pero no deployed. token-logs.json = []. Database Neon conectada pero vacía. Agentes siguen en modo espera.	f	2026-03-31 16:02:36.148	2026-03-31 16:02:36.149
cmnet2if8000bgp1eyb6f0uti	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio activo (mycompi.onrender.com). SSL vigente hasta Jun 2026. Landing con FAQ schema markup OK. Meta tags y OG correctos. Falta sitemap.xml. No hay errores detectados. Última versión en git: feat: Paco onboarding automático. Research semanal añadido a strategy-proposals.md.	f	2026-03-31 16:02:36.356	2026-03-31 16:02:36.357
8b6ea343-d0a1-4fc1-874f-7f6bcd1b2258	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	INFO	✅ Trabajo aprobado: 📢 Testear canal de adquisición: LinkedIn o email	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:23.822	2026-03-31 19:35:23.822
cmnev7lnk0001bb1es440kdw6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad de soporte en este ciclo. Elena reporta server OK, PM2 activo, DB Neon conectada; Carlos sin pipeline activo. Sin incidencias críticas ni casos urgentes detectados. Todo en calma.	f	2026-03-31 17:02:33.056	2026-03-31 17:02:33.067
cmnev7ltv0003bb1eqpu99s1k	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sistema MyCompi sin actividad real. Sin pipeline ni datos de ventas. 11° día consecutivo sin outreach posible. Producto inactivo según último registro. Sin cambios en el estado. Research semanal no realizado por ser mismo día UTC.	f	2026-03-31 17:02:33.283	2026-03-31 17:02:33.285
cmnev7lzt0005bb1e5by55b9s	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK: node server activo (PID 10), PM2 no corriendo (sin problemas, el proceso node va directo). mycompi.es sigue sin responder (000/error). Git 5 commits nuevos desde último heartbeat. Strategy-proposals actualizado por Carlos. Sin incidencias críticas.	f	2026-03-31 17:02:33.497	2026-03-31 17:02:33.499
cmnev7m5g0007bb1erv4sivr6	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana 2026-03-31 16:33 UTC. Sistema MyCompi sin actividad real en producción desde hace 8+ días. No hay datos de métricas (MRR, churn, new users) dado que el producto no está deployado. Proposal activo: Churn prediction model (Proposal 1, Diana, semana 2026-03-31). Sin anomalías detectadas.	f	2026-03-31 17:02:33.701	2026-03-31 17:02:33.702
cmnev7mb50009bb1e8rn4ix8w	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando en mycompi.onrender.com (200 OK). DNS mycompi.es no resuelve — podría estar caído o mal configurado.SSL no comprobable sin dominio. Sitemap accesible. Research Web Dev Trends 2026 ya publicado por Marcos en proposals de esta semana.	f	2026-03-31 17:02:33.905	2026-03-31 17:02:33.916
cmnexcq350001e61wztm9im3t	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat realizado a las 01:40 MYT. Sistema activo. No hay bandeja de entrada, tickets ni mensajes pendientes. Agente en espera.	f	2026-03-31 18:02:31.313	2026-03-31 18:02:31.37
cmnexcqb70003e61w59mgglsi	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-03-31T17:45Z. Sin incidencias. Proyecto sin logs activos todavía. No hay PM2 ni servicio local corriendo en este host.	f	2026-03-31 18:02:31.604	2026-03-31 18:02:31.605
cmnexcqgr0005e61w9oklt4z0	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana activo. Sistema MyCompi lleva 8 días sin actividad real. No hay datos de métricas (Neon DB no accesible desde aquí, sin producto en producción). Sin anomalías detectadas en métricas porque no hay datos que analizar. Growth opportunities documentadas en strategy-proposals.md.	f	2026-03-31 18:02:31.804	2026-03-31 18:02:31.808
6aa26495-0f89-42f7-9712-59a2d4c60a07	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	INFO	✅ Trabajo aprobado: 🔍 Investigar empresa, sector y competencia	Aprobado con nota: OK test	f	2026-03-31 18:58:34.943	2026-03-31 18:58:34.943
cmnezigc10001hz1wy1ra4276	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat de rutina. No hay cuenta mycompi configurada en himalaya. Sin emails nuevos, tickets pendientes o mensajes de chat que requieran respuesta. Revisados archivos shared/memory — todo OK.	f	2026-03-31 19:02:57.841	2026-03-31 19:02:57.915
cmnezigk10003hz1wlkolmm02	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 18:55 UTC / 02:55 MYT — Sistema MyCompi sigue inactivo. Pipeline vacío (0 hot, 0 warm, 0 cold). Sin leads nuevos ni seguimientos. Research semanal vigente del 2026-03-31. Sin cambios desde último heartbeat. Sistema necesita datos CRM para operar.	f	2026-03-31 19:02:58.13	2026-03-31 19:02:58.131
cmnezigpo0005hz1wmwb0d79g	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-03-31T18:45Z. Sin incidencias. Sin procesos PM2 activos, sin logs de errores, sin automatizaciones corriendo en este host. Todo tranquilo.	f	2026-03-31 19:02:58.332	2026-03-31 19:02:58.334
cmnezigve0007hz1wuqre7r67	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana activo. Sistema MyCompi sigue dormant (sin actividad en producción). Sin cambios desde último heartbeat. No hay acceso a Neon DB - métricas no disponibles. Sin anomalías detectadas. Strategy proposals actualizadas con proposal de churn prediction para Carlos.	f	2026-03-31 19:02:58.539	2026-03-31 19:02:58.54
cmnezihas0009hz1wd0bpenkr	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 02:35 AM — Ambos endpoints responding 200. SSL vigente. sitemap.xml sigue devolviendo HTML en lugar de XML (el servidor no tiene un sitemap real, solo es served como fallback). Build dist sigue en .gitignore. Sin cambios en landing/. Sitio estable, sin incidencias.	f	2026-03-31 19:02:59.092	2026-03-31 19:02:59.094
a9510021-4514-45fe-8053-8dc1f1d2f1bb	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	INFO	✅ Trabajo aprobado: 📧 Preparar emailing de bienvenida para el cliente	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:21.09	2026-03-31 19:35:21.09
2e2c808f-0675-410a-ba49-5bb88c534d99	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	INFO	✅ Trabajo aprobado: 🎯 Outreach: identificar 10 leads en sector del cl	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:21.582	2026-03-31 19:35:21.582
80c342d1-9bb5-4afc-a4a5-e23f1b298050	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	INFO	✅ Trabajo aprobado: 📊 Análisis competitivo: 3-5 competidores directos	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:22.048	2026-03-31 19:35:22.048
2489d9a3-fab9-4206-b5c7-7a8221a98c92	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	INFO	✅ Trabajo aprobado: 🤖 Implementar primera automatización de proceso	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:22.864	2026-03-31 19:35:22.864
2f228a1e-bfec-4268-b404-2b74260ed79b	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	INFO	✅ Trabajo aprobado: 📈 Primer reporte de métricas: retención y uso	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:23.344	2026-03-31 19:35:23.344
9b95fd1c-8aec-47cd-bcd0-6da477acdc07	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	INFO	✅ Trabajo aprobado: 🎯 Escalar outreach si hay respuesta positiva	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:24.288	2026-03-31 19:35:24.288
cmnf1n2u70001et1e06bf0wgd	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada. 5 trabajos disponibles. Ningún trabajo ejecutable en heartbeat 20min sin инструменты adicionales. Siguiente: bandeja de entrada si hay emails.	f	2026-03-31 20:02:32.858	2026-03-31 20:02:32.923
cmnf1n32y0003et1eogfmdn8f	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin actividad. No hay campanas ni leads en sistema. Todo tranquilo.	f	2026-03-31 20:02:33.179	2026-03-31 20:02:33.18
cmnf3s6y20007et1e87h27nee	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Heartbeat 04:10 KL. Sin anomalías. Sin APIs de marketing conectadas — sin visibilidad en campañas/leads.	f	2026-03-31 21:02:30.013	2026-03-31 21:02:30.79
cmnf3s7740009et1eer5vqa7p	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Leads B2B identificados: Clínicas dentales, e-commerce, despachos jurídicos, agencias digitales, centros estéticos, restaurantes, academia, consultoría RRHH, veterinaria. Email bienvenida listo. Outreach pendiente de ejecutar.	f	2026-03-31 21:02:31.025	2026-03-31 21:02:31.026
cmnf5xtfg0001d01eumkp2tg6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat rutinario #21:43 UTC. Cola con 5 trabajos disponibles (3 Alta, 2 Media). Sin actividad en bandeja de entrada, tickets ni chat. Sin feedback nuevo que clasificar. Situación sin cambios — pendiente de integración real de sistemas de soporte.	f	2026-03-31 22:02:52.348	2026-03-31 22:02:52.368
cmnf5xtm30003d01ehu8bo5li	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Heartbeat matutino (5:44 KL). Sin datos de campañas/leads/competencia en workspace. Todo OK, sin urgencia. Sugerencia: integrar métricas de ads con workspace para heartbeats más útiles.	f	2026-03-31 22:02:52.587	2026-03-31 22:02:52.588
cmnf84xfe0001bg1ekgyok61f	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola revisada. Job CRITICA 'Investigar empresa' ya completado en heartbeat anterior. Siguiente en prioridad: análisis competitivo (3-5 competidores directos) y primer reporte de métricas. Sin anomalías detectadas en métricas — solo 2 pagos de 10 registros (tasa conversión 20%), lo cual es已知 y en investigación.	f	2026-03-31 23:04:23.354	2026-03-31 23:04:23.408
cmnfadnsa0001do1e7hp4sk8w	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 01/04/2026 07:55 KL. Jobs email fríos siguen BLOQUEADOS sin herramienta outbound. Investigación de sectores: encontrados 2 leads nuevos en sector consultoría/servicios B2B (HIKE & FOXTER - Barcelona, y ASENTA - Bilbao/Barcelona/Madrid). Sectores manufacture, financiera, construcción siguen sin cubrir. Lead nuevo guardado en output/new-leads-sectors-2026-04-01.md.	f	2026-04-01 00:07:09.994	2026-04-01 00:07:10.021
cmnfadnz00003do1evlw9ur40	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Diana despierta con 6 trabajos disponibles. Ejecutado análisis competitivo profundo de 5 competidores (Freshdesk, Zendesk, Intercom, eesel, Crisp). Insight clave: MyCompi se diferencia por 7 agentes especializados por €49/mes flat — ningún competidor ofrece esto. Positioning recomendado: MyCompi compite con 'equipo de empleados virtuales', no con 'soporte AI'.	f	2026-04-01 00:07:10.237	2026-04-01 00:07:10.237
cmnfado4u0005do1e8kcnxw05	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola con 4 tareas ALTA de desarrollo MVP. Site mycompi.es no responde. Landing no construida (sin dist/). Producto no está en producción. Sistema inactivo desde hace 9 días. Los jobs disponibles son tareas de desarrollo que requieren contextocollaboración con Alberto/Paco, no ejecutables enlatados en heartbeat.	f	2026-04-01 00:07:10.446	2026-04-01 00:07:10.446
cmnfccv7s0001fc1ep1z52vhj	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola leída: 5 trabajos disponibles. Script feedback (ID 2b5d684d) tiene error de esquema: columna 'ejecutor' no existe en tabla Trabajo. No ejecuto db push --accept-data-loss. Escalo a Paco.	f	2026-04-01 01:02:32.195	2026-04-01 01:02:32.25
cmnfccvfh0003fc1enmk9rckc	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin métricas de campañas en tiempo real. APIs de ads no conectadas. Competidores: TypingMind ($39 one-time), Chatbase/SiteGPT. MyCompi tiene diferenciador claro con personaje compi.	f	2026-04-01 01:02:32.477	2026-04-01 01:02:32.478
cmnfccvl60005fc1eirirgn6g	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline activo con 5 leads verificados listos para outreach y 10 leads adicionales identificados en work/. Job CRITICA#1 se activará cuando haya métricas de respuesta. Jobs ALTA#1 y ALTA#2 bloqueados por dependencias y credenciales. El trabajo más inmediato es configurar acceso a email del cliente para poder ejecutar email frío personalizado. Research de trends B2B 2026 actualizado en strategy-proposals.md.	f	2026-04-01 01:02:32.682	2026-04-01 01:02:32.684
cmnfccvqp0007fc1efea0rrui	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Tarea CRITICA «email automático de bienvenida a nuevos leads» ya está implementada en handleCheckoutCompleted() de stripe.js — disparada por webhook de Stripe. No requiere trabajo adicional. Automatización operativa.	f	2026-04-01 01:02:32.882	2026-04-01 01:02:32.883
cmnfccwaj0009fc1eqgwl8mh3	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola con 6 trabajos disponibles. Trabajos críticos de investigación ya completados en latidos anteriores. Solo 1 cliente paying (AlberBEE) con MRR €98. Tasa conversión 20% (2/10). 8 registros nuevos en ~1 semana pero no activan pago. Problema de activación confirmado.	f	2026-04-01 01:02:33.595	2026-04-01 01:02:33.597
cmnfccwh6000bfc1e2xf3w6u8	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 2026-04-01 08:38 MYT. Web funcionando. Cola con 4 trabajos disponibles (tag #semana-1 #dia-2 MVP). Research web dev trends 2026 ya registrado en strategy-proposals.md (Elena propuso MCP, Diana propuso churn model, Marcos propuso 7 proposals). Site: 200 OK.	f	2026-04-01 01:02:33.835	2026-04-01 01:02:33.836
cmnfeiiyl0001fg1eto108xyz	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Ejecutado el job de feedback. No existen registros de Feedback ni Emails en el sistema todavía (MyCompi en fase inicial). Job marcado como COMPLETED.	f	2026-04-01 02:02:55.48	2026-04-01 02:02:55.535
cmnfeij6j0003fg1eft35facx	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 09:55 UTC. Leads pendientes verificados: Uhaitz (❌ DNS fail), Peter Lead (❌ DNS fail), IOMarketing (✅ activo Madrid). Pipeline actualizado a 8 leads verificados. Preparados 8 emails personalizados para outreach. ConTesta eliminado. Ballou PR descartado.	f	2026-04-01 02:02:55.772	2026-04-01 02:02:55.773
cmnfeijcd0005fg1eod83jbs8	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat matutino (miércoles 9:45 AM MYT). Cola con 5 trabajos disponibles. Trabajo CRITICA prioritario: primera automatización de proceso (welcome email a leads). Sin incidencias en sistemas. Sin automatizaciones nuevas creadas.	f	2026-04-01 02:02:55.982	2026-04-01 02:02:55.983
cmnfeijtr0007fg1e93evmvl2	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Completado trabajo CRITICA de investigación de empresa/sector/competencia. Detectadas 2 alarmas críticas: (1) 9/10 clientes son tests sin pago real, MRR real de solo 98€; (2) solo 2 usuarios activos de 10 registrados. Documentos MISION y USER_RESEARCH guardados en BD.	f	2026-04-01 02:02:56.607	2026-04-01 02:02:56.609
cmnfeijzk0009fg1ecf84xd1x	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola con 4 trabajos ALTA disponibles. Web del cliente NO RESPONDE (curl error 6 - connection refused). SSL y site caídos. Incidencia crítica detectada.	f	2026-04-01 02:02:56.816	2026-04-01 02:02:56.817
cmnfgn8hf0001fw1e6zxq3nhp	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta prioridad, 3 media). Sin actividad previa que continuar. Siguiente latido: 20 min.	f	2026-04-01 03:02:34.414	2026-04-01 03:02:34.473
cmnfgn8rv0003fw1eeh9asi92	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola con 5 trabajos. Emails outreach ya preparados para 8 leads (Digital Hamster, Nostos, LaMagnética, ELEVAM, Rload, IOMarketing, HIKE & FOXTER, ASENTA). 10 leads adicionales enriquecidos y 10 más identificados esperando outreach. El trabajo CRITICA requiere monitorizar respuesta >5% para escalar. Los trabajos ALTA/MEDIA requieren ejecución externa (email/LinkedIn API) no disponible en este canal.	f	2026-04-01 03:02:34.795	2026-04-01 03:02:34.796
cmnfgn8ye0005fw1eg5sxje0j	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Ejecutados 2 trabajos CRITICA. Análisis competitivo: MyCompi priced at €49 vs $89-195 competencia, 7 agents vs 1. Reporte métricas: MRR €49 real, 10 cuentas (9 tests), engagement cero, activation ~10%, sin histórico para churn. Alertas: MRR crítico, engagement zero, 90% cuentas inactivas.	f	2026-04-01 03:02:35.031	2026-04-01 03:02:35.032
cmnfgn94q0007fw1e1xej0hk2	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web up (200). 4 jobs ALTA en cola — todas tareas de desarrollo MVP y features. Sin docs de briefing visibles en workspace. Git activo con commits recientes de agent-queue-reader y approval system. Site funcional.	f	2026-04-01 03:02:35.258	2026-04-01 03:02:35.26
cmnfi9qby0001fu1ezo39k1r4	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 11:20 AM MYT. Cola revisada: 4 trabajos disponibles (3 MEDIA, 1 ALTA). Trabajo ALTA es 'Atender emails de soporte entrantes' pero no hay bandeja de entrada configurada (Himalaya sin configurar). Sin emails pendientes ni tickets concretos detectados. Sin acción requerida.	f	2026-04-01 03:48:03.599	2026-04-01 03:48:03.604
cmnfi9qi00003fu1e40qpmmeq	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 11:31 MYT. 10 emails fríos personalizados preparados para los leads del pipeline (Dental Sonría, NaturVital, LEX25, MakeWeb, BellaLua, El Rinconcito, UniPrep, TechZone, HR Simple, VetMascota). Lead #11 nuevo identificado: IOMarketing (Madrid) — agencia marketing 360º, ángulo diferenciado. Job CRITICA no se activa (sin datos de respuesta >5% aún). Pipeline: 2 HOT, 5 WARM, 0 cold. Outreach emails listos para envío (pendiente integración email tool).	f	2026-04-01 03:48:03.817	2026-04-01 03:48:03.817
cmnfi9qnq0005fu1eeqhtjdoa	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Completado trabajo ALTA de configurar dashboard de métricas del cliente. Creado BusinessMetricsTab.jsx con KPIs de negocio (MRR, signups, activation, engagement, churn) y métricas de funnel. El tab actual está listo para conectar a endpoint /api/admin/metrics/business real. Trabajo marcado COMPLETED en BD.	f	2026-04-01 03:48:04.023	2026-04-01 03:48:04.024
cmnfi9qtg0007fu1eddvcjwrb	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Landing OK (HTTP 200). Hay 4 trabajos en cola, todas ALTA prioridad. No hay incidencia técnica ni en producción. Sin briefing específico no puedo tomar el primero — necesito contexto del cliente. Propuesta técnica: FAQ schema markup (fácil, 1-2h) y Cloudflare CDN proxy (30min, free).	f	2026-04-01 03:48:04.228	2026-04-01 03:48:04.23
cmnfisbml0009fu1el190yac6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola disponible: 4 trabajos pendientes (1 alta, 3 media). No hay mensajes de clientes ni tickets urgentes. Revisado estado de bandeja.	f	2026-04-01 04:02:30.315	2026-04-01 04:02:31.057
cmnfisbv9000bfu1eyjfhqrk1	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 11:55 MYT. Seguimiento de outreach marcado completado. 5 trabajos disponibles en cola. CRITICA (escalado si respuesta>5%) no ejecutable sin métricas de respuesta. ALTA (email frío a 10 leads) no ejecutable - hay leads PREPARADOS pero sin email ni API de envío configurada. Leads verificados (8) tienen LinkedIn como contacto principal, no emails directos. Necesario: approval del cliente para usar Resend o integrar herramienta de cold email (Smartlead/Instantly). Leads sin contacto directo válido para outreach email requieren enrichment adicional.	f	2026-04-01 04:02:31.317	2026-04-01 04:02:31.318
cmnfkxz780001c81ekr1ob1ba	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Email sin configurar en himalaya (error TTY). Agenda: Alta prioridad - atender emails soporte. Media - revisar emails bienvenida, configurar inbox respuestas automáticas, survey satisfacción.	f	2026-04-01 05:02:54.068	2026-04-01 05:02:54.118
cmnhq3ayw0001ep1efaqzexll	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin cambios. 4 trabajos bloqueados por falta de email processor (misma situación). No hay accion nueva disponible. Sin bandeja de entrada que revisar.	f	2026-04-02 17:02:33.026	2026-04-02 17:02:33.1
cmnfkxzfh0003c81erpxjllsb	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola con 2 trabajos: CRITICA (escalar outreach si respuesta >5%) y MEDIA (10 leads adicionales). Emails fríos preparados pero aún no enviados (sin integración email API). Pipeline caliente con 8 leads verificados. Pendiente: integración email para poder ejecutar outreach real.	f	2026-04-01 05:02:54.366	2026-04-01 05:02:54.367
cmnfkxzl90005c81euykxkc1n	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Ejecutados 2 trabajos: análisis de canales de adquisición y reporte semanal. MyCompi sin sistema de tracking de acquisition. 1 cliente real (AlberBEE) con €49 MRR. Engagement cero. Trial de 29 días activo.	f	2026-04-01 05:02:54.573	2026-04-01 05:02:54.574
cmnfkxzuu0007c81elkhe6ghy	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site UP (200 OK). La landing sirve contenido estático desde public/ correctamente. Admin y chat panels funcionan. Jobs en cola no tienen contexto de cliente real ni briefing — Marcos no puede ejecutar feature work sin eso. No hay errores críticos.	f	2026-04-01 05:02:54.918	2026-04-01 05:02:54.919
cmnfn2r140001do1eeyeydl0z	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos (1 alta, 3 media). Sin acceso funcional a email ni tickets - same blocker since yesterday. No se puede ejecutar trabajos de soporte real.	f	2026-04-01 06:02:35.987	2026-04-01 06:02:36.055
cmnfn2r9q0003do1ev6hff1u3	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 05:31 UTC. Job CRITICA sigue NO_EJECUTABLE (emails PREPARADO no enviados, sin datos reply rate). Job MEDIA en EN_PROCESO - leads segunda ronda identificados. Pipeline: 8 leads verificados (2 hot, 5 warm, 1 medium). ⚠️ 48h+ sin respuesta en primera ronda → protocolo indica pivotar a LinkedIn/teléfono para leads sin respuesta. Pendiente: integración herramienta de email para envío real.	f	2026-04-01 06:02:36.302	2026-04-01 06:02:36.304
cmnfn2rfb0005do1ef3yu2ksa	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas sin cambios vs reporte de esta mañana: MRR €49, 1 cliente real (AlberBEE) en trial de 30 días (fin ~2026-04-30), 9/10 cuentas son test/seed. Sin engagement real aún (0 mensajes, 0 interacciones). Activation rate ~10%. Sin anomalías nuevas detectadas.	f	2026-04-01 06:02:36.504	2026-04-01 06:02:36.506
cmnfn2rkv0007do1e7rxktmoj	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola leída: 4 trabajos ALTA disponibles. Web UP (HTTP 200, SSL OK). Job #1 (Construir MVP) requiere briefing validado por Paco — no disponible en sesión actual. Jobs #2-4 también pendientes. Site funcionando correctamente.	f	2026-04-01 06:02:36.704	2026-04-01 06:02:36.706
cmnfrdjw30001c11e8xenuq4s	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta prioridad - emails soporte, 3 media). Sin acceso real a email/tickets/chat - no hay processor configurado. Sin acción requerida.	f	2026-04-01 08:02:58.419	2026-04-01 08:02:58.478
cmnfrdkhx0003c11ehw1hdiza	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 15:55 MYT. Cola: 2 jobs disponibles. Job CRITICA (escalada outreach >5% reply rate) NO EJECUTABLE — 0 emails enviados, 10 emails PREPARADOS pero sin envío real (pendiente integración Resend). Job MEDIA (segunda ronda 10 leads) EN PROCESO — leads identificados, mismo bloqueo de envío. Resend API key configurada pero scripts de envío no implementados. Pendiente: pipeline de envío real para medir reply rates.	f	2026-04-01 08:02:59.205	2026-04-01 08:02:59.206
cmnfxsyf60001d61e4avrdgnp	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola de soporte vacía. No hay emails, tickets ni chats pendientes. Todo en orden.	f	2026-04-01 11:02:54.787	2026-04-01 11:02:54.817
cmnfxsyvw0003d61espo4rx71	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 16:31 UTC. Emails fríos aún no enviados (estado PREPARADO). No hay métricas de reply rate. Escalation job no ejecutable sin datos de envío. Segunda ronda leads identificados pero bloqueada por falta de respuesta round 1. Pipeline: hot=2, warm=5, medium=1, total=8. Leads enriquecidos verificados: Digital Hamster, Nostos Marketing, LaMagnética, ELEVAM, Rload Studio, Ballou PR.	f	2026-04-01 11:02:55.388	2026-04-01 11:02:55.39
cmnfxsz1q0005d61eeu0x0kuv	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sistema MyCompi inactivo — 9 días sin actividad en producción. No hay métricas de usuario, ni dashboards activos, ni datos de Neon/analytics disponibles. Sin anomalías detectadas ni oportunidades de growth sin datos.	f	2026-04-01 11:02:55.599	2026-04-01 11:02:55.6
cmnfxsz7p0007d61e9cp89azh	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site DOWN (mycompi.onrender.com no responde). Landing sin build (no existe dist/). 3 commits locales sin pushear a origin/main. Todas las tareas de la cola están bloqueadas — producto no deployado. Es necesario push + verificar build en Render.	f	2026-04-01 11:02:55.813	2026-04-01 11:02:55.815
cmnfzzoyj0001fb1emvhev2gz	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 ALTA: emails soporte). Sin emails nuevos, tickets ni chats pendientes. IMPORTANTE: Site mycompi.onrender.com está CAÍDO según notificación de Marcos (11:02 UTC). Landing sin build (no existe dist/). 3 commits locales sin pushear. Esto bloquea todo el producto. También: Carlos tiene emails fríos listos para enviar pero sin Resend configurado. Diana reporta 9 días sin actividad en producción.	f	2026-04-01 12:04:08.342	2026-04-01 12:04:08.401
cmnfzzp6q0003fb1e5r8nx5jb	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Job CRITICA (escalada outreach) sigue en estado NO_EJECUTABLE — emails siguen en PREPARADO, no hay datos de envío real. Job MEDIA (segunda ronda 10 leads) completado en latido anterior. Pipeline confirmado: 2 hot, 5 warm, 1 cold = 8 leads. Sin emails enviados no hay métricas de reply rate para escalar outreach.	f	2026-04-01 12:04:08.642	2026-04-01 12:04:08.643
cmnfzzpc90005fb1edcik2zom	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas de prueba: 10 clientes (9 BASIC, 1 COMPLETO), 44 trabajos (31 TODO, 12 COMPLETED, 1 IN_PROGRESS). Sin anomalías. Sin datos de MRR/churn/reales — todos los clientes activos son cuentas de test/setup.	f	2026-04-01 12:04:08.842	2026-04-01 12:04:08.843
cmnfzzpid0007fb1e329x2m7r	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site up (200). Sitemap up (200). 4 trabajos ALTA en cola sin aprobaciones pendientes. No hay incidencias técnicas detectadas. Los 4 trabajos disponibles requieren contexto de briefing del cliente para ejecutarse — apropiado para sesión de trabajo dedicada.	f	2026-04-01 12:04:09.061	2026-04-01 12:04:09.063
cmng23c7s0001df1esmejvcff	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada — 4 trabajos disponibles. Prioridad alta: atender emails de soporte (fe8072aa). No se pudo ejecutar por no tener acceso email configurado en himalaya. Notificado a Paco.	f	2026-04-01 13:02:57.688	2026-04-01 13:02:57.735
cmng23cgb0003df1emp7d5rar	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola MyCompi vacía. Pipeline sin cambios - 0 disponibles, 0 pendientes aprobación. Estrategia proposals ya actualizadas (semana 2026-03-31). Sin acciones urgentes.	f	2026-04-01 13:02:57.996	2026-04-01 13:02:57.997
cmng23clv0005df1e49ejswz2	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola activa con 5 trabajos. Ninguna incidencia detectada. Tarea CRITICA disponible (primera automatización) pero requiere contexto adicional del cliente para ejecución.	f	2026-04-01 13:02:58.195	2026-04-01 13:02:58.197
cmng23crn0007df1eiimi72wg	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacia. Sin trabajos pendientes. MRR estable en 98€ (2 suscripciones BeeNoCode test). Sin anomalias detectadas. Producto en fase de validacion interna.	f	2026-04-01 13:02:58.403	2026-04-01 13:02:58.405
cmng23cxf0009df1ea97wrl3n	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat activo. Web mycompi.onrender.com funcionando (HTTP 200). SSL ok. 4 trabajos en cola (ALTA) pero ninguno requiere acción inmediata — son tareas de desarrollo general sin briefing técnico específico adjunto. Site sin errores detectados.	f	2026-04-01 13:02:58.612	2026-04-01 13:02:58.614
cmng48ga70001bw1e3vz5e2vc	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Sin bandeja de entrada accesible (himalaya sin configurar). Sin emails ni tickets pendientes visibles.	f	2026-04-01 14:02:55.471	2026-04-01 14:02:55.532
cmng48gsa0003bw1erqwdb4l1	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola de trabajo vacía. Sin trabajos pendientes ni disponibles. No hay acceso a datos de pipeline/CRM en este heartbeat. Todo listo.	f	2026-04-01 14:02:56.123	2026-04-01 14:02:56.125
cmng48gxx0005bw1e8cnhn3jt	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada: 5 trabajos disponibles. Prioridad CRITICA detectada: primera automatización de proceso. Sin incidencias en sistemas. Sin automatizaciones activas aún.	f	2026-04-01 14:02:56.325	2026-04-01 14:02:56.327
cmng48h420007bw1edsnncnsu	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas sin cambios respecto al último report (2026-04-01). Situación crítica: MRR €49, 1 cliente real, engagement cero. No hay anomalías nuevas detectadas.	f	2026-04-01 14:02:56.547	2026-04-01 14:02:56.549
cmng48h9r0009bw1erajckpqe	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check OK: landing 200, admin 200, chat 200, SSL vigente (expira Jun 2026). 4 trabajos ALTA disponibles. Sitio funcionando. Sin incidencias detectadas.	f	2026-04-01 14:02:56.752	2026-04-01 14:02:56.753
cmng6d4fs0001ew1eeijztt7u	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] 4 trabajos en cola (1 ALTA: emails soporte, 3 MEDIA). Sistema de email de MyCompi procesa inbound emails automáticamente via webhook Resend + OpenClaw (Paco). Bandeja de entrada no requiere intervención manual de Laura en este flujo. Sin emails pendientes de atención manual. Sin tickets nuevos.	f	2026-04-01 15:02:32.627	2026-04-01 15:02:32.697
cmng6d4oi0003ew1ev8oecsgx	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline intacto: 8 leads (2 hot, 5 warm, 1 cold). Sin trabajos pendientes de ejecución. Bloqueo activo: integración cold email tool sigue pendiente (jobs CRITICA y MEDIA en espera de resolución).	f	2026-04-01 15:02:32.946	2026-04-01 15:02:32.947
cmng6d4uc0005ew1efqso0u5e	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat completado. Web mycompi.onrender.com UP (200). 4 trabajos disponibles en cola, todos ALTA. Sin incidencias detectadas.	f	2026-04-01 15:02:33.157	2026-04-01 15:02:33.158
cmnganfav00019h1e7gpwm3ma	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos disponibles. Alta prioridad (fe8072aa) sobre atender emails de soporte bloqueado por falta de integración email. Trabajos de media prioridad (configurar inbox, survey satisfacción) también requieren acceso a plataforma de email o credenciales. Sin acceso a email processor, Laura no puede ejecutar su trabajo principal.	f	2026-04-01 17:02:31.735	2026-04-01 17:02:31.79
cmnganfjn00039h1e3nbxmk3s	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Sin leads en pipeline visible (CRM no conectado). Sin cambios de estado.	f	2026-04-01 17:02:32.051	2026-04-01 17:02:32.053
cmnganfp400059h1elcdytle2	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas sin cambios — MRR €49, 1 cliente real AlberBEE en trial (29 días restantes). Sin anomalías detectadas. Engagement sigue en 0, sin mensajes ni interacciones. Sin nuevos insights que requieran acción inmediata.	f	2026-04-01 17:02:32.249	2026-04-01 17:02:32.25
cmnganfv100079h1exllluq6r	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 2026-04-01 16:34 UTC. Web mycompi.onrender.com NO responde (HTTP 000). Cola tiene 4 trabajos ALTA pero no procedo hasta resolver caida. Incidencia crITICA: web inaccesible desde exterior. Posibles causas: Render service down, timeout, o problema de red. Requiero investigacion.	f	2026-04-01 17:02:32.461	2026-04-01 17:02:32.463
cmngcskq70001a41ejjkynmvt	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos activos (1 ALTA: atender emails soporte, 3 MEDIA). Sistema email procesa inbound automáticamente via webhook Resend+OpenClaw. Sin acceso a bandeja himalaya (sin config TTY). Sin emails ni tickets pendientes que requieran acción manual.	f	2026-04-01 18:02:31.273	2026-04-01 18:02:31.345
cmngcskys0003a41e1uz23scq	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline intacto: 8 leads (2 hot, 5 warm, 1 cold). Sin cambios desde último heartbeat. Todo en orden. Bloqueo principal sigue siendo la integración cold email tool (Resend/Smartlead/Instantly).	f	2026-04-01 18:02:31.588	2026-04-01 18:02:31.589
cmngcsl4p0005a41egh75mz2f	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacia. Sin trabajos pendientes. Datos sin cambios desde ayer: MRR €49, 1 cliente real (AlberBEE trial 29 dias), 9/10 cuentas test, engagement cero, sin acquisition tracking. Sin anomalias detectadas.	f	2026-04-01 18:02:31.802	2026-04-01 18:02:31.803
cmngcslau0007a41ek30ao9ja	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site mycompi.onrender.com OK (HTTP 200, SSL OK). Cola: 4 trabajos disponibles pero sin contexto de proyecto activo — no ejecutados. Sprint backlog vacío.	f	2026-04-01 18:02:32.023	2026-04-01 18:02:32.024
cmngexqvw0001cb1ezv86yjc3	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola leída: 4 trabajos disponibles. Sin bandeja de entrada activa ni emails pendientes detectable. Carpeta inbox no existe aún en filesystem — probablemente la crea el cliente al configurar soporte. Siguiente heartbeat en 20 min.	f	2026-04-01 19:02:31.767	2026-04-01 19:02:31.85
cmngexr4i0003cb1etk39tt67	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Heartbeat nocturno activo. No hay campañas activas detectadas en el workspace ni datos de leads nuevos. Workspace sin datos de campañas en este momento.	f	2026-04-01 19:02:32.083	2026-04-01 19:02:32.084
cmngexrah0005cb1e2abt4aws	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos disponibles ni pendientes de aprobación. 2:55am MYT — horario fuera de negocio. Pipeline sin cambios. Sin urgencia. Próxima ventana activa: miércoles 02/04 9am MYT.	f	2026-04-01 19:02:32.298	2026-04-01 19:02:32.299
cmngexrg40007cb1esi4f6wpc	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Sin métricas nuevas disponibles en archivos locales. Heartbeat de madrugada — sin anomalías detectadas.	f	2026-04-01 19:02:32.5	2026-04-01 19:02:32.502
cmngexrls0009cb1ehzielz9o	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] mycompi.es CAÍDO por problema SSL/TLS. El sitio funciona en https://mycompi.onrender.com (health ok). Dominio mycompi.es apunta a 217.160.0.182 (1&1/IONOS) y da error SSL. 4 trabajos en cola sin ejecutar.	f	2026-04-01 19:02:32.705	2026-04-01 19:02:32.706
cmngh2wsm0001a51e0pyzclpi	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] 4 trabajos disponibles en cola (soporte, emails bienvenida, automatización, feedback). No hay emails pendientes en bandeja (sin configuración himalaya activa). Cola procesada sin incidencias.	f	2026-04-01 20:02:31.943	2026-04-01 20:02:31.978
cmngh2xa80003a51edc1ybu8f	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. No hay trabajos pendientes. Pipeline/CRM no disponible en schema actual.	f	2026-04-01 20:02:32.576	2026-04-01 20:02:32.577
cmngh2xg80005a51ed8y45yov	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas sin cambios desde último reporte (2026-04-01). MRR sigue en €49, 1 cliente real (AlberBEE), trial de 30 días activo hasta 2026-04-30. Sin anomalías nuevas detectadas.	f	2026-04-01 20:02:32.793	2026-04-01 20:02:32.794
cmngh2xm40007a51etebd5a8q	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat inicial. 4 trabajos disponibles en cola de alta prioridad. Ningún trabajo pendiente de aprobación. Web no verificada en este latido (3:35 AM).	f	2026-04-01 20:02:33.005	2026-04-01 20:02:33.006
cmngj82yu00018t1eliqljtlw	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 urgente, 3 medios). Bandeja de entrada vacía a las 4:40 AM — fuera de horario de atención. Sin acción requerida.	f	2026-04-01 21:02:32.447	2026-04-01 21:02:32.528
cmngj837g00038t1e68c5zvxc	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. No hay pipeline data disponible para revisar a esta hora.	f	2026-04-01 21:02:32.764	2026-04-01 21:02:32.765
cmngj83mz00058t1eksyb4muv	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. 5 trabajos disponibles. Tarea CRITICA identificada: primera automatización de proceso. Se requiere sesión interactiva para implementación.	f	2026-04-01 21:02:33.324	2026-04-01 21:02:33.325
cmngld8pf0001b71eq8mw6kr4	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos disponibles pero todos bloqueados por falta de acceso a email/inbox. Jobs de alta y media prioridad (fe8072aa, 1fda9348, 8c0d58b9, 3186358b) requieren credenciales IMAP/SMTP o integración de tickets. Sin bandeja de entrada configurada no hay acción posible para Laura. Incidencias y strategy proposals revisados - todo en orden. Actualizado heartbeat-state.json.	f	2026-04-01 22:02:32.397	2026-04-01 22:02:32.47
cmngniess0001cc1edj88a2eo	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta prioridad - emails de soporte, 3 media). Sin acceso a bandeja de entrada - IMAP/SMTP no configurado. Sin incidencias nuevas.	f	2026-04-01 23:02:32.807	2026-04-01 23:02:32.878
cmngnifbc0003cc1eogwx919h	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-04-01 22:15 UTC. Cola con 5 trabajos disponibles. Prioridad CRITICA: primera automatización de proceso (email bienvenida leads). No hay incidencias en sistemas. Strategy proposals actualizado con trends 2026.	f	2026-04-01 23:02:33.481	2026-04-01 23:02:33.482
cmngnifh50005cc1ezrvnvz41	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat ejecutado. 4 trabajos HIGH disponibles en cola (semana 1-4). Sites no accesibles desde este entorno sandbox (red restringida). No hay incidencias críticas detectadas.Primera ejecución - sin heartbeat previo.	f	2026-04-01 23:02:33.689	2026-04-01 23:02:33.691
3d70b08b-6fb1-4284-8013-5220af6cce9a	cmn77tmsh0004e81e667qlyks	Laura	INFO	Cliente FRIO: Test2 SL	15 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.605	2026-04-10 18:54:13.605
cmngpqcry0001bo1ekayy6ho5	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas sin cambios vs reporte semanal 2026-04-01: MRR €49, 1 cliente real, engagement cero, sin acquisition tracking activo. No hay trabajos pendientes ni anomalías. Estado estable — producto en validación temprana.	f	2026-04-02 00:04:42.67	2026-04-02 00:04:42.733
cmngrt85u00019w1evk2ri4e0	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 00:40 UTC. Cola con 4 trabajos disponibles, todos bloqueados por falta de acceso a bandeja de entrada / sistema de tickets. Sin acción posible en este momento. Detectado gap de ~3h desde último heartbeat (21:40 UTC). Bloqueador principal: credenciales IMAP/SMTP o integración tickets no configuradas.	f	2026-04-02 01:02:55.891	2026-04-02 01:02:55.949
cmngrt8e800039w1ej8jiupos	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable. Bloqueo principal: integración cold email tool (Resend/Smartlead/Instantly) pendiente de approval de MyCompi. Sin seguimientos pendientes de más de 24h.	f	2026-04-02 01:02:56.192	2026-04-02 01:02:56.193
cmngrt8u000059w1e3dp3ddwj	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. Trabajo CRITICA (follow-up leads) sigue pendiente de approval - no se puede ejecutar aún. Resto de trabajos son MEDIA/planificación. Sin incidencias operativas. Research semanal ya en strategy-proposals.md.	f	2026-04-02 01:02:56.761	2026-04-02 01:02:56.761
cmngrt8zs00079w1eq3gpmwpy	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-04-02 00:33 UTC. Cola vacía. Revisados últimos reports (01-abril): MRR €49 real, 1 cliente pagador (AlberBEE), 9/10 cuentas inactivas/test, activation rate ~10%, engagement 0. Sin anomalías nuevas detectadas. Producto en fase temprana — sin suficiente histórico para análisis de tendencias (mínimo 7 días necesarios). Sin trabajos pendientes en cola.	f	2026-04-02 01:02:56.968	2026-04-02 01:02:56.969
cmngrt95a00099w1eap7fxjxs	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat ejecutado. Web mycompi.onrender.com UP. 4 tareas ALTA en cola (MVP + integraciones) - requieren contexto adicional para ejecución. robots.txt returning HTML en vez de texto (posible 404). Sin incidencias nuevas.	f	2026-04-02 01:02:57.166	2026-04-02 01:02:57.167
cmngsfu2a000d9w1elgyftv26	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. 10 leads del job anterior (5717edc9) siguen en work/ sin outreach realizado (pendiente de validación de empresas y personalización). No hay datos de pipeline en CRM accesible desde este heartbeat. Próximo paso recomendado: validar las 10 empresas (web + LinkedIn) y empezar outreach priorizando los 7 leads ALTA.	f	2026-04-02 01:20:30.68	2026-04-02 01:20:30.714
cmngtycsc0001ae1edjnu4jfa	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Prioridad alta: atender emails de soporte entrantes (#recurrente #diario). Sin herramientas de bandeja de entrada configuradas en este latido. Siguiente paso: ejecutar trabajo fe8072aa-4831-48ba-af6b-a05d7cd6ddfd.	f	2026-04-02 02:02:54.396	2026-04-02 02:02:54.342
cmngtydab0003ae1e00qbsiap	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos disponibles. Sin jobs en base. Ninguna acción de outreach ejecutada. Siguiente paso: revisar pipeline manualmente si hay leads pendientes de cualificación o seguimiento.	f	2026-04-02 02:02:55.043	2026-04-02 02:02:54.931
cmngtydga0005ae1exot725h5	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía, sin trabajos pendientes. Revisión de métricas yesterday: MRR €49, 1 cliente real (AlberBEE trial 29 días restantes), sin anomalías nuevas vs reporte 2026-04-01. Sin datos de engagement nuevos. Research proposals: Churn prediction ( Proposal 1) sigue vigente como oportunidad prioritaria cuando haya más datos.	f	2026-04-02 02:02:55.259	2026-04-02 02:02:55.147
cmngtydls0007ae1ezi09s4qp	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio OK. 4 trabajos ALTA en cola (dia-2 MVP, integraciones, features). SSL, sitemap y web funcionando. No hay incidencias. Pendiente: tomar primer trabajo disponible.	f	2026-04-02 02:02:55.457	2026-04-02 02:02:55.345
cmngw38tc0001701ex6hdecfn	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta, 3 media). Sin cambios en el estado. Bandeja de entrada vacía. Sin acción posible sin integración IMAP/SMTP o sistema de tickets. Bloqueos ya reportados a Paco.	f	2026-04-02 03:02:41.755	2026-04-02 03:02:41.804
cmngw390z0003701egub678o7	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas revisadas: MRR €98 (solo AlberBEE ha pagado), 10 clientes activos en plan BASIC, 30 trabajos pendientes en estado TODO (fecha 2026-03-31, obsoletos). 9 nuevos usuarios esta semana — buena señal de acquisition. Sin datos de churn. ALERTA: trabajos pendientes old + MRR muy bajo sugieren que MyCompi está en fase early/trial sin conversión clara.	f	2026-04-02 03:02:42.036	2026-04-02 03:02:42.038
cmngw396v0005701etgbcpzw4	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com OK. 4 trabajos ALTA en cola: bbbb8ae1 (MVP briefing), 7186e55d (integración), 2d7f1390 (features early adopters), 5a012266 (top 2 feedback). Semana 1 día 2. No hay briefing concreto disponible — necesito contexto de Paco para empezar el MVP.	f	2026-04-02 03:02:42.248	2026-04-02 03:02:42.25
cmngy88x30001aa1ec1mvazj6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 03:44 UTC. 4 trabajos en cola (3 email, 1 feedback). Sin cambios en el gap de acceso — todas las tareas de email siguen bloqueadas por no tener acceso a bandeja de entrada ni integración de tickets. Misma situación que hace 24 min. Ninguna acción posible sin credenciales o integración.	f	2026-04-02 04:02:34.407	2026-04-02 04:02:34.465
cmngy89550003aa1ef6h6ivij	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline sin cambios (hot=0, warm=0, cold=0). CRM/leads no implementado en BD. Sin acciones pendientes.	f	2026-04-02 04:02:34.698	2026-04-02 04:02:34.701
cmngy89b40005aa1eyiv353yg	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. 5 trabajos disponibles. La automatización CRITICA (follow-up leads) requiere aprobación de Paco/Alberto antes de implementar. Sin incidencias en sistemas.	f	2026-04-02 04:02:34.913	2026-04-02 04:02:34.916
cmngy89h00007aa1e87g0quqp	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas: MRR €49 confirmado (1 pago COMPLETED trial), 10 clientes registrados (mayoría tests), 2 usuarios activos en 7d. Sin mensajes ni interacciones chat 7d. Trial de beenocode@gmail.com termina ~2026-04-30.	f	2026-04-02 04:02:35.124	2026-04-02 04:02:35.127
cmngy89mr0009aa1ehgz7wrvr	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site mycompi.es UP (HTTP 200), SSL OK. 4 jobs en cola sin briefing válido para ejecutarlos. Site funcionando correctamente.	f	2026-04-02 04:02:35.331	2026-04-02 04:02:35.334
cmnh0dd1v00019r1eqyl69vls	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable con 8 leads (2 hot, 5 warm, 1 cold). Emails preparados bloqueados por falta de integración cold email tool. Sin acción urgente.	f	2026-04-02 05:02:32.269	2026-04-02 05:02:32.34
cmnh0ddjv00039r1ekmcjo2g9	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada: 5 trabajos disponibles. Trabajo CRITICA en curso (follow-up leads) - diseño listo, pendiente implementación N8N. Sistemas de email (Resend) operativos. Sin incidencias.	f	2026-04-02 05:02:32.923	2026-04-02 05:02:32.924
cmnh0ddq400059r1egavmcb17	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes ni anomalías detectadas en el heartbeat de las 12:34 UTC. Métricas generales no disponibles en storage local (sin acceso a PostgreSQL de métricas en este entorno). Se recomienda revisar panel de métricas cuando estén disponibles.	f	2026-04-02 05:02:33.148	2026-04-02 05:02:33.149
cmnh0ddvu00079r1ejgo7nijc	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat OK. Web up (HTTP 200). SSL vigente. 4 tareas ALTA en cola pendientes de ejecución por Marcos. sitemap.xml y robots.txt sirviendo correctamente.	f	2026-04-02 05:02:33.355	2026-04-02 05:02:33.355
cmnh2ik9f000b9r1e02cg6i9b	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Laura revisó su cola: 4 trabajos disponibles. El prioritario (#ALTA) es atender emails de soporte entrantes. Email no configurable en este entorno (himalaya sin config). Detectado: necesita cuenta email configurada para ejecutar tareas de soporte.	f	2026-04-02 06:02:33.394	2026-04-02 06:02:34.193
cmnh2ikhs000d9r1egoh1xl3t	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Pipeline sin cambios - no hay leads activos en el sistema CRM. Sin actividad nueva desde el último ciclo. Todo tranquilo.	f	2026-04-02 06:02:34.432	2026-04-02 06:02:34.433
cmnh2ikne000f9r1eojur2tc8	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. Automatización de onboarding email sequence (CRITICA) ya estaba implementada en heartbeat anterior (integrada en /api/auth/activar + cron hourly). Sistema看起来 OK. No hay incidencias nuevas. Meta Ads evaluation y process mapping son trabajos pendientes disponibles en cola.	f	2026-04-02 06:02:34.634	2026-04-02 06:02:34.635
cmnh2il1w000h9r1efsntirh7	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. BD MyCompi sin datos operativos: 10 usuarios total (sin patrón), 0 trabajos, 0 interacciones, 0 pagos, 0 token usage. Cliente en fase temprana sin métricas suficientes para análisis de cohort o churn. Sin anomalías detectadas.	f	2026-04-02 06:02:35.156	2026-04-02 06:02:35.157
cmnh2il7h000j9r1eo0avdie1	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web UP (HTTP 200, SSL OK). 4 trabajos ALTA disponibles. Job bbbb8ae1 (top) requiere briefing de Paco que NO está en BD — webUrl del cliente es null, sugiere que MVP podría ser crear web para AlberBEE. Solicitar briefing a Paco antes de ejecutar. Ninguna incidencia técnica detectada.	f	2026-04-02 06:02:35.357	2026-04-02 06:02:35.358
cmnh4noiz0001gn1whlu0kyrw	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Pipeline vacío (sin leads aún). Sin seguimientos urgentes.	f	2026-04-02 07:02:32.171	2026-04-02 07:02:32.178
cmnh4norg0003gn1wv7ahyyqk	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-04-02 14:34 MYT. Cola vacía. No hay trabajos pendientes ni anomalías detectadas en métricas. MRR sigue en €49, 1 cliente real (AlberBEE), 1 trial activo (fin ~2026-04-30). Sin cambios significativos desde último reporte. Cola vacía, sin action items.	f	2026-04-02 07:02:32.477	2026-04-02 07:02:32.479
cmnh4noxc0005gn1whhuf5rpw	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola con 4 trabajos disponibles de alta prioridad (semana 1-4). Site funcionando correctamente (200). Sin incidencias. Job #1 (MVP briefing) necesita briefing del cliente — sin datos de briefing en workspace.	f	2026-04-02 07:02:32.689	2026-04-02 07:02:32.691
cmnh7g4gq0001fr1e9ago9uch	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin cambios. 4 trabajos en cola, todos bloqueados por falta de acceso a bandeja de entrada/email processor (IMAP/SMTP). Última actualización de estado hace 3h20min. Sin nuevos emails ni tickets. Situación sin resolución.	f	2026-04-02 08:20:38.426	2026-04-02 08:20:38.436
cmnh7g4mt0003fr1e9mufucwq	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. No hay trabajos pendientes ni trabajos disponibles. Pipeline sin cambios (hot: 0, warm: 0, cold: 0). Research semanal ya ejecutado (Proposal 14 - GTM Playbook 2026). Sin incidencias. Sin leads activos en el sistema.	f	2026-04-02 08:20:38.645	2026-04-02 08:20:38.648
cmnh7g4sp0005fr1e3jcq4x3o	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. Job CRITICA (Onboarding Email Sequence) ya está implementado, solo pendiente verificación en producción (tabla OnboardingSequence y RESEND_API_KEY). Budget alerts OK. Sin incidencias en sistemas.	f	2026-04-02 08:20:38.857	2026-04-02 08:20:38.86
cmnh7g4yr0007fr1eg90p3jcm	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat executed. Cola vacía, sin trabajos pendientes. Métricas sin cambios significativos vs yesterday: MRR €49 (crítico), 1 cliente real activo (AlberBEE trial día 2/30), activation rate ~10%, 9/10 cuentas inactivas (test/seed). Engagement cero detectado en report anterior persiste. No hay anomalías nuevas. No es día de research semanal (último research: 2026-03-31). Próximo research: 2026-04-07.	f	2026-04-02 08:20:39.076	2026-04-02 08:20:39.079
cmnh7g54a0009fr1ej1drrwg3	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com UP (HTTP 200, SSL OK). DB: error P2022 columna 'Trabajo.ejecutor' no existe en BD produccion - necesita migracion. Cola: 4 trabajos ALTA disponibles.	f	2026-04-02 08:20:39.275	2026-04-02 08:20:39.277
cmnhb3rr60001fu1emfgwncdy	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 09:20 UTC. 4 trabajos en cola (fe8072aa, 1fda9348, 8c0d58b9, 3186358b). Sin acceso a bandeja de entrada. Sin cambios respecto a latidos anteriores. Situación sin resolver desde hace ~6h.	f	2026-04-02 10:03:00.547	2026-04-02 10:03:00.605
cmnhb3s760003fu1e578dm6ei	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 09:55 UTC. Cola vacía. Sin trabajos pendientes. Sin cambios en pipeline (CRM no integrado). Research ya realizado esta semana (GTM Playbook 2026 propuesto 2026-04-02). Sin acciones urgentes.	f	2026-04-02 10:03:01.122	2026-04-02 10:03:01.124
cmnhb3soz0005fu1et7pghh5x	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat ejecutado. Cola vacía. No hay trabajos pendientes ni anomalías detectadas. Métricas de BD inaccesibles desde este contexto (Neon PostgreSQL requiere auth externa). Strategy proposals actualizadas por otros agentes. Sin cambios en KPIs — no hay datos locales disponibles para comparar.	f	2026-04-02 10:03:01.763	2026-04-02 10:03:01.765
cmnhb3sv00007fu1e3fjy6m72	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola revisada: 4 trabajos ALTA disponibles, todos pendientes de contexto/adicional de Paco — no actionable sin input. Sitio mycompi.onrender.com sigue sin estar accesible desde sandbox (posiblemente solo accesible vía cloudflare/dominio). Research semanal activo: Elena propuso MCP+n8n, Carlos propuso GTM playbook 2026 y video prospecting. Propuestas de development en strategy-proposals.md incluyen Cloudflare CDN proxy, auditoría PageSpeed, y smoke tests Playwright. Nada actionable sin acceso al repo o approval de Paco para los trabajos en cola.	f	2026-04-02 10:03:01.98	2026-04-02 10:03:01.983
cmnhd8bvn0001g81ee92dfgvo	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola disponible: 4 trabajos de soporte listos. Sin embargo, NO hay script de integración de email configurado para Laura. Los trabajos de soporte requieren acceso a bandeja de entrada de emails. Necesito que Paco configure la integración email o me indique qué cuenta revisar.	f	2026-04-02 11:02:32.478	2026-04-02 11:02:32.526
cmnhd8c470003g81ebfmhbgkj	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola de ventas vacía. 14 proposals activos en strategy-proposals.md (Proposal 14 añadido hoy — GTM Playbook 2026 con 3 tácticas prioritarias). CRM sigue sin integrar — sin datos de pipeline. Research semanal de ventas hecho (Proposal 14, 2026-04-02). Sin incidencias activas. Sin trabajos pendientes.	f	2026-04-02 11:02:32.791	2026-04-02 11:02:32.792
cmnhd8dat0005g81ek5d57r45	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin métricas reales de MyCompi en el sistema (Neon/BD no conectada a agent). Research: activation rate SaaS promedio 36-37.5%, buen benchmark 45-55%. Sin anomalías detectadas.	f	2026-04-02 11:02:34.325	2026-04-02 11:02:34.325
cmnhd8dpo0007g81edg4nlzfs	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check OK — mycompi.es respondiendo HTTP 200 con SSL válido. Cola con 4 trabajos ALTA pendientes. Ninguna incidencia detectada.	f	2026-04-02 11:02:34.86	2026-04-02 11:02:34.861
cmnhfpmuj0001ge1di6fneyrl	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin cambios. 4 trabajos bloqueados por falta de email processor. Misma situación que heartbeat anterior. Sin acción nueva disponible.	f	2026-04-02 12:11:59.083	2026-04-02 12:11:59.093
cmnhfpn220003ge1dx4yww417	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline sin cambios (8 leads). Bloqueo crítico sigue igual: herramienta cold email (Resend/Smartlead/Instantly) no configurada — 10 emails preparados listos para envío en cuanto se active tool.	f	2026-04-02 12:11:59.354	2026-04-02 12:11:59.355
cmni5r5su0003i01emdmehd6u	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes ni disponibles. Pipeline no accesible directamente — CRM integrado no disponible en este heartbeat.	f	2026-04-03 00:21:00.315	2026-04-03 00:21:00.32
cmnhfpn8q0005ge1dj49hey2y	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola con 5 trabajos disponibles. CRITICA (follow-up leads) requiere aprobación de Paco — marcada como pendiente. Sistemas看起来 bien: 3 cron jobs activos (night shift 8AM, micro ciclo 10min, onboarding hourly). Onboarding sequence implementada. Revisando agentWorker y onboarding-sequence.js — sin incidencias detectadas.	f	2026-04-02 12:11:59.594	2026-04-02 12:11:59.595
cmnhfpnel0007ge1dok646d68	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes ni anomalías detectadas en este heartbeat.	f	2026-04-02 12:11:59.805	2026-04-02 12:11:59.806
cmnhfpnka0009ge1dahb5jst7	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web operativa (HTTP 200, SSL OK). 4 trabajos ALTA en cola. Sin incidencias. Sin despliegues pendientes. Jobs requieren briefing/context que debe confirmar Paco antes de ejecutar.	f	2026-04-02 12:12:00.011	2026-04-02 12:12:00.011
cmnhhjehj0001dr1ec95ytbkk	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable — mismo estado desde 12:31Z. Sin jobs pendientes ni cambios de estado. 8 leads cualificados listos para contacto frío, bloqueados por espera de integración cold email tool (Resend/Smartlead/Instantly). Sin actividad nueva en este ciclo.	f	2026-04-02 13:03:07.543	2026-04-02 13:03:07.606
cmnhhjeq20003dr1ejy478csi	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana — Cola vacía. Sistema MyCompi sin actividad real hace 9+ días. Sin datos de métricas (MRR, churn, signups) disponibles. Producto no deployado,sin trabajos pendientes en cola.	f	2026-04-02 13:03:07.851	2026-04-02 13:03:07.852
cmnhhjew40005dr1eepumojhw	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola con 4 tareas ALTA disponibles (todas de desarrollo). Sitio mycompi.es no responde — SSL/tiempo agotado. Posible incidencia de conectividad o dominio expirado. Requiere revisión.	f	2026-04-02 13:03:08.068	2026-04-02 13:03:08.069
cmnhjox6h0001ep1e00psi2ux	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20:40 UTC. Sistema verificado. 4 trabajos en cola (3 MEDIA, 1 ALTA). Email no accesible sin configuración interactiva. Job fe8072aa puesto en proceso y liberado.	f	2026-04-02 14:03:24.281	2026-04-02 14:03:24.286
cmnhjoxel0003ep1ea3sajnvh	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos disponibles. Research semanal actualizado hoy (Proposal 14: GTM Playbook 2026). Sin cambios en pipeline. Pipeline sigue vacío (sin CRM activo). Sin seguimientos pendientes.	f	2026-04-02 14:03:24.573	2026-04-02 14:03:24.574
cmnhjoxkk0005ep1e0sf7iqol	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes ni señales de alarma. Sin anomalías detectadas en el heartbeat de las 21:34 MYT.	f	2026-04-02 14:03:24.788	2026-04-02 14:03:24.789
cmnhjoxqs0007ep1ewzzjza0h	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio mycompi.onrender.com UP (200), backend health ok. Cola con 4 trabajos ALTA (mvp/integación) disponibles pero sin briefing activo ni dirección del cliente. Sin incidencias detectadas.	f	2026-04-02 14:03:25.013	2026-04-02 14:03:25.014
cmnhltowy0001dx1en9vespmx	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía — sin trabajos pendientes. Pipeline sin actividad nueva. Sin acciones de sales requeridas en este ciclo.	f	2026-04-02 15:03:06.077	2026-04-02 15:03:06.17
cmnhltp6y0003dx1ecz1xau7r	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía — sin trabajos pendientes. Research semanal realizado: 2 trends nuevos detectados (onboarding optimization + pricing model selector). Proposal #2 añadida a strategy-proposals.md.	f	2026-04-02 15:03:06.443	2026-04-02 15:03:06.444
cmnhltpdn0005dx1ecai2fkjo	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat automático. Web mycompi.onrender.com ✅ (HTTP 200). Cola con 4 trabajos ALTA pendientes de coordinación con Paco (el agente de cola los asignará según prioridad). Semana 1 en curso.	f	2026-04-02 15:03:06.683	2026-04-02 15:03:06.684
cmnho03l90001fo1e0y3hk3h0	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin cambios. 4 trabajos bloqueados por falta de email processor (sin acceso IMAP/SMTP ni integración tickets). Misma situación que heartbeat anterior. Sin acción nueva disponible.	f	2026-04-02 16:04:04.263	2026-04-02 16:04:04.337
cmnho044y0003fo1e7hgdlm62	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía, no hay trabajos pendientes ni pipeline activo. Todo en orden, esperando nuevos leads o instrucciones.	f	2026-04-02 16:04:04.978	2026-04-02 16:04:04.98
cmnho04af0005fo1erhdq6mpf	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas: 22 clientes (21 BASIC, 1 COMPLETO), 0 churn, 16 nuevos clientes en 7d, spike de 12 clientes el 2026-04-02. 27 trabajos pendientes, 3 en curso, 14 completados. Sin incidencias.	f	2026-04-02 16:04:05.176	2026-04-02 16:04:05.177
cmnho04ft0007fo1ejcnlrbrh	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola revisada — 4 trabajos ALTA disponibles. Web caída (timeout). Error en take-job.js con enum EstadoTrabajo — necesita fix. Incidencia: web no responde, puede ser cold start de Render o servicio caído.	f	2026-04-02 16:04:05.369	2026-04-02 16:04:05.371
ff5c6adf-4d4e-409b-be9a-878147e89172	cmn7fddc60000ew1e76drd41a	Laura	INFO	Cliente FRIO: TestEmpresa	15 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.607	2026-04-10 18:54:13.607
cmnhq3bgx0003ep1eo1c603ix	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Pipeline estable (2 hot, 5 warm, 1 cold). Sin actividad nueva en el último ciclo. Cold email tool sigue pendiente de integración (Resend/Smartlead/Instantly). Leads preparados pero sin contacto real enviado. Research semanal próximo 2026-04-07. Sin urgente.	f	2026-04-02 17:02:33.682	2026-04-02 17:02:33.683
cmnhq3bma0005ep1eauxzgbot	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas sin cambios significativos desde último report (2026-04-01). Situación estable: 1 cliente real (AlberBEE), 1 trial activo (beenocode, trial hasta 2026-04-30). Sin nuevos datos de tracking disponibles.	f	2026-04-02 17:02:33.875	2026-04-02 17:02:33.876
cmnhsoues0001dv1e2o3kst4e	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (3 de configuración, 1 diario de soporte). Acceso email no disponible (sin config himalaya). Sin mensajes pendientes ni tickets de clientes.	f	2026-04-02 18:15:17.231	2026-04-02 18:15:17.289
cmnhsoun50003dv1ev433x1wi	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Pipeline sin leads activos en sistema.	f	2026-04-02 18:15:17.538	2026-04-02 18:15:17.544
cmnhsoutf0005dv1eu0rrye1y	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas analizadas: MRR 98€ (1 cliente paying), 22 usuarios total (todos activos, nuevos), 0% churn (todos <30d). 44 jobs totales (26 TODO, 15 COMPLETED, 3 IN_PROGRESS). No hay anomalías detectadas.	f	2026-04-02 18:15:17.764	2026-04-02 18:15:17.771
cmnhsouzq0007dv1e2psgqqha	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web MyCompi up (HTTP 200), SSL vigente, sin errores críticos detectados. 3 trabajos en cola pendientes de ejecución.	f	2026-04-02 18:15:17.991	2026-04-02 18:15:17.998
cmnhumtdl0001dw1ef1l0iwqp	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat nocturno. Cola con 3 trabajos ALTA disponibles. No hay script job-executor.js para tomar trabajos automáticamente. Requerir orientación a Paco sobre cómo ejecutar trabajos.	f	2026-04-02 19:09:41.817	2026-04-02 19:09:41.855
cmnhwpttg0001hw1emi4mg88k	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola de trabajos leída (4 trabajos disponibles). Sin acceso a bandeja de entrada emails (sin config himalaya para este agente). Sin tickets abiertos detectados. Heartbeat completado sin acciones requeridas.	f	2026-04-02 20:08:01.589	2026-04-02 20:08:01.621
cmnhyuksb0001h21erqksiboy	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Bandeja de correo vacía (0 emails, 0 chats). Sin actividad pendiente.	f	2026-04-02 21:07:42.389	2026-04-02 21:07:42.497
cmnhyulbs0003h21er2ykpwsv	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacia, sin trabajos pendientes. Sin dashboards ni metricas disponibles en workspace (sin anomalias detectadas). Sin incidencias.	f	2026-04-02 21:07:43.096	2026-04-02 21:07:43.098
cmni09ttl0005h21ex60lfwd0	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Job fe8072aa marcado IN_PROGRESS pero no ejecutable. Mismo bloqueo de 17+ horas: sin email processor (IMAP/SMTP no configurado). Los 4 trabajos de Laura requieren acceso a bandeja de entrada que no existe. Gap detectado desde 2026-04-02T03:20Z. Sin acción nueva disponible sin credenciales de email.	f	2026-04-02 21:47:33.537	2026-04-02 21:47:33.566
cmni09tzr0007h21egldiky4g	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas: MRR 98€, 22 usuarios (22 nuevos en 30d), 8 activos en 7d. Solo 1 cliente real (AlberBEE). Sin trabajos pendientes.	f	2026-04-02 21:47:33.783	2026-04-02 21:47:33.784
cmni11tli000bh21e27r4qsxb	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-04-02 21:46 UTC. Cola con 5 trabajos, 1 CRITICA en curso. Sin incidencias en sistemas. Job CRITICA (automatización proceso) sigue en progreso.	f	2026-04-02 22:09:18.906	2026-04-02 22:09:19.677
cmni34ggf0001ji1euiudl7yu	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada. 4 trabajos disponibles, ninguno urgente. Inbox de soporte vacío en este momento. Sin patrones de problema detectados. Siguiente atención: bandeja de email en próximo ciclo.	f	2026-04-02 23:07:21.807	2026-04-02 23:07:21.852
cmni34gxw0003ji1ecbbn039w	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola disponible: 5 trabajos (1 CRITICA, 4 MEDIA). Sin incidencias detectadas. Procesos y automatizaciones sin alertas.	f	2026-04-02 23:07:22.436	2026-04-02 23:07:22.437
cmni34h3k0005ji1ekzeapezj	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacia. Sin trabajos pendientes ni anomalías en métricas. Crecimiento notable de usuarios nuevos (16 vs 6 semana pasada). Solo 1 cliente con suscripción activa (AlberBee, plan COMPLETO €49/mes MRR). Sin churn ni alarms.	f	2026-04-02 23:07:22.64	2026-04-02 23:07:22.641
cmni5oi750001i01e3bro30p5	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin cambios significativos en métricas desde último reporte (2026-04-01). MRR €49, trial AlberBEE 29 días restantes. Sin anomalías detectadas.	f	2026-04-03 00:18:56.418	2026-04-03 00:18:56.46
cmni7knuq0001gg1e2j1q972t	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (recurrentes/periódicos). No hay mensajes nuevos ni tickets pendientes en este ciclo. Sistema operativo normal.	f	2026-04-03 01:11:56.354	2026-04-03 01:11:56.385
cmni7ko1q0003gg1erclhpvi7	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalías. 0 campañas activas. Pipeline de Carlos (8 leads) sigue bloqueado esperando cold email tool. APIs de ads no conectadas. Todo en pausa.	f	2026-04-03 01:11:56.606	2026-04-03 01:11:56.607
cmni7ko7h0005gg1eqw1ccrp6	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Sin alertas de pipeline en este heartbeat.	f	2026-04-03 01:11:56.813	2026-04-03 01:11:56.815
cmni7kodi0007gg1eny2wjbxv	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin jobs pendientes. Sistema MyCompi lleva ~9 días sin actividad real. No hay acceso a PostgreSQL de Neon para métricas en vivo (MRR, churn, signups). Investigación growth/analytics semanal ya completada y documentada en strategy-proposals.md (2026-04-02). Sin anomalías detectadas.	f	2026-04-03 01:11:57.031	2026-04-03 01:11:57.032
cmni7kos60009gg1etkvcbvc4	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com UP (HTTP 200). 2 trabajos ALTA en cola, ambos requieren feedback de early adopters. No hay feedback disponible aún en el sistema. Schema Prisma desincronizado con BD (db push pendiente con --accept-data-loss). Site funcionando correctamente.	f	2026-04-03 01:11:57.559	2026-04-03 01:11:57.56
cmni9fpxj0001jp1e231f15eb	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada. 4 trabajos disponibles, todos bloqueados por falta de acceso a bandeja de soporte. Sin acceso email — himalaya no configurado, sin credenciales IMAP. Todos los trabajos de Laura requieren acceso al inbox.	f	2026-04-03 02:04:04.999	2026-04-03 02:04:05.053
cmni9fq670003jp1eavty6g7g	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Heartbeat Enzo 2026-04-03. Sin anomalías. APIs de ads no conectadas. Paperclip con errores 503/401 (agente pendiente aprobación). Oportunidades pendientes: LinkedIn Ads y short-form video strategy. Sin campañas activas visibles.	f	2026-04-03 02:04:05.311	2026-04-03 02:04:05.312
cmni9fqca0005jp1ezqp887do	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin nuevos trabajos pendientes. Métricas sin cambios desde último reporte (2026-04-01): MRR €49, 1 cliente real activo, trial de AlberBEE termina ~2026-04-29. Sin anomalías detectadas.	f	2026-04-03 02:04:05.53	2026-04-03 02:04:05.531
cmni9fqiz0007jp1eqhi36m06	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 2026-04-03 01:36 UTC. 2 trabajos ALTA disponibles en cola. No se pudo verificar estado de web (DNS no disponible desde el contenedor Docker). Site: unknown. Errors: 0. Deploys: 0.	f	2026-04-03 02:04:05.771	2026-04-03 02:04:05.772
cmni9fqp20009jp1ex6fibqt8	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente en cola. Sprint backlog vacío (formato template sin tareas activas). Carlos tiene 10 leads enriquecidos listos para outreach pero bloqueados por falta de integración cold email tool (Resend/Smartlead/Instantly). Enzo tiene proposals pendientes de approval (LinkedIn Ads 113% ROAS, short-form video). No hay entregables formales nuevos esperando revisión en este ciclo. Seguiré vigilando la cola — si Carlos o Enzo entregan algo nuevo, lo reviso en el próximo heartbeat.	f	2026-04-03 02:04:05.991	2026-04-03 02:04:05.992
cmnibupuo0001l21eq0a0x9dq	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Trabajo principal [ALTA] 'Atender emails de soporte' requiere acceso a inbox de email que no está configurado (himalaya sin config, sin cuenta configurada). Jobs restantes: revisar emails bienvenida, configurar respuestas automáticas, survey satisfacción.	f	2026-04-03 03:11:43.963	2026-04-03 03:11:44.017
cmnibuq2q0003l21e27h94jcv	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable (8 leads: 2 hot, 5 warm, 1 cold). Sin actividad nueva. Bloqueo principal sigue: cold email tool (Resend/Smartlead/Instantly) sin integrar. 10 leads enriquecidos preparados para outreach. Research semanal próxima ventana 2026-04-07.	f	2026-04-03 03:11:44.258	2026-04-03 03:11:44.259
cmnibuq8v0005l21espxi1p6o	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Negocio early-stage: 22 clientes, MRR ~98€/mes (2 pagos), 59% usuarios inactivos (riesgo churn alto). TokenUsage vacío — agentes aún sin uso en prod. Recommend: focus en activation y reducir churn early.	f	2026-04-03 03:11:44.479	2026-04-03 03:11:44.48
cmnibuqep0007l21e4udrzxr9	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] 2 trabajos ALTA pendientes en cola (implementar features early adopters). Sitio MyCompi no responde — free tier de Render en sleep mode (comportamiento normal tras inactividad). Status page de Render: todos los componentes operativos. Ningún error crítico detectado.	f	2026-04-03 03:11:44.69	2026-04-03 03:11:44.691
cmnibuqkl0009l21elhupdhi8	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajos pendientes en cola. Sprint backlog vacío (plantilla sin填充). No hay deliverable pendientes de revisión. Revisión de shared/sprint-backlog.md confirma estructura SCRUM-lite sin tareas activas. Sistema de cola y backlog aún está por activar cuando otros agentes empiecen a entregar.	f	2026-04-03 03:11:44.901	2026-04-03 03:11:44.902
cmnifwvis0001cu1fwlowu4j8	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable con 8 leads (2 hot, 5 warm, 1 cold). 10 leads enriquecidos listos para outreach. Bloqueo principal: cold email tool (Resend/Smartlead/Instantly) sin integrar — 0 emails enviados. Research semanal hecho 2026-03-31, próxima ventana 2026-04-07.	f	2026-04-03 05:05:23.087	2026-04-03 05:05:23.159
cmnifwvr30003cu1f0hhxpi7o	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Research semanal completado: insights sobre activation rate (3x conversión con well-defined activation metrics), time-to-value, y churn prediction (empezar con scoring simple, no ML). Sin nuevas métricas — el cliente sigue en fase muy temprana (1 cliente real, sin tracking de eventos implementado). Proposal añadido a strategy-proposals.md.	f	2026-04-03 05:05:23.392	2026-04-03 05:05:23.393
cmnifwvwy0005cu1fc85ooa3y	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola con 2 trabajos ALTA disponibles. Marcos debe tomar y ejecutar. No hay incidencias detectadas. Web status: no checked (heartbeat only). Research strategy proposals actualizado.	f	2026-04-03 05:05:23.602	2026-04-03 05:05:23.604
cmnifww370007cu1f5uzd89h8	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-03 03:15 UTC. Cola vacía — ningún deliverable pendiente de revisión. Sin trabajo nuevo recibido. Reviews al día. Alertas activas sin resolución. Bloqueos estructurales (email tools) siguen pendientes.	f	2026-04-03 05:05:23.827	2026-04-03 05:05:23.828
1300f2b0-11ae-4d48-8756-38a3662ee285	cmn7jgl500000j41enpnhqa2z	Laura	INFO	Cliente FRIO: Tester	15 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.608	2026-04-10 18:54:13.608
cmnihz5r00001l51eeyx0bdwe	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin cambios. 4 trabajos bloqueados por falta de email processor. himalaya sin configurar. Situación igual al heartbeat anterior.	f	2026-04-03 06:03:08.887	2026-04-03 06:03:08.978
cmnihz6070003l51egtr8afwl	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. No hay trabajos pendientes. Pipeline no disponible en este momento (sin acceso directo a CRM). Strategy proposals actualizadas a semana 2026-03-31 con 4 proposals activos.	f	2026-04-03 06:03:09.224	2026-04-03 06:03:09.225
cmnihz6690005l51ex2lsm40g	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas sin cambios: MRR €49 (1 cliente real), 1 trial (AlberBEE, ~27 días restantes). Dashboard configurado pero sin datos reales (sin event tracking). Sin anomalías detectadas. Todo alineado con propuestas ya documentadas.	f	2026-04-03 06:03:09.441	2026-04-03 06:03:09.443
cmnihz6lc0007l51ejgslvsel	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat ejecutado. Cola con 2 trabajos ALTA disponibles (#desarrollo #features). Site health no verificado (necesito credenciales UptimeRobot/status page). Sin incidencias registradas. Próximo paso: revisar feedback de early adopters para implementar features.	f	2026-04-03 06:03:09.984	2026-04-03 06:03:09.985
cmnihz6rb0009l51ew559pytn	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-03 05:49 UTC. Cola de revisión vacía. Sprint backlog sin tareas activas. Alertas estructurales (email tools) sin cambios. Sin deliverables pendientes de revisión.	f	2026-04-03 06:03:10.2	2026-04-03 06:03:10.201
cmnik9qeg0001fy1e6ncv3c9u	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin cambios. 4 trabajos bloqueados por falta de email processor. Sin acción nueva disponible.	f	2026-04-03 07:07:21.448	2026-04-03 07:07:21.483
cmnik9qll0003fy1e2h7yrjoj	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes ni disponibles. Pipeline sin actividad nueva desde último heartbeat. Sin incidencias. Estrategia al día (actualizada 2026-04-02).	f	2026-04-03 07:07:21.705	2026-04-03 07:07:21.707
cmnik9qr90005fy1ej8svr6m0	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana - Semana 2026-04-03. Cola vacía. Cliente en fase muy temprana (1 cliente real, MRR €49, 9/10 cuentas test). No hay nuevas métricas desde el último reporte (2026-04-01). Sin anomalías detectadas. Sin trabajos pendientes de aprobación.	f	2026-04-03 07:07:21.91	2026-04-03 07:07:21.911
cmnik9qx20007fy1e9d8o38xt	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site returning 404 on all endpoints. Cola: 2 trabajos ALTA disponibles (implementar features early adopters). Incidencia creada.	f	2026-04-03 07:07:22.118	2026-04-03 07:07:22.12
cmnik9r350009fy1egc5tyfml	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-03 06:56 UTC. Cola vacía — ningún deliverable pendiente de revisión. Reviews al día (Carlos email-bienvenida WITH_CONDITIONS, Diana x2 APPROVED). Alerta nueva: Sitio MyCompi en producción devuelve 404 (Marcos reported 06:35 UTC) — incidencia abierta en shared/incidencias.md. Resto de alertas activas sin cambios. Sin trabajo nuevo recibido en este ciclo.	f	2026-04-03 07:07:22.337	2026-04-03 07:07:22.339
cmnimmn050001hf1evo4ar8rf	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola disponible: 4 trabajos (1 ALTA, 3 MEDIA). No se pudieron tomar trabajos: error de enum en take-job.js (usa 'en_proceso' en vez de 'IN_PROGRESS'). Reportado a Paco.	f	2026-04-03 08:13:22.799	2026-04-03 08:13:22.834
cmnimmn7f0003hf1e8r0gxa5d	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin pipeline CRM activo — el esquema actual de MyCompi no tiene modelo de leads/prospects. Paperclip API sigue con errores de auth (tokens expirados). Research semanal ya cubierto por Marcos ayer.	f	2026-04-03 08:13:23.067	2026-04-03 08:13:23.067
cmnimmndn0005hf1efl8lc1ku	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. MRR €98 (2 pagos €49). 22 clientes en BD, mayoría tests E2E. Agentes OK (8 activos). No hay tracking de activation ni onboarding sequences en BD. MyCompi en fase muy temprana.	f	2026-04-03 08:13:23.292	2026-04-03 08:13:23.292
cmnimmnjv0007hf1egb0yuj7y	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.beenocode.com sigue caída (DNS failure). Incidencia ya documentada en shared/incidencias.md. Cola de trabajos con 2 tareas ALTA disponibles (features early adopters). Sin acceso a Render dashboard para resolver.	f	2026-04-03 08:13:23.515	2026-04-03 08:13:23.516
cmnimmnpe0009hf1es1l2950r	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverables pendientes de revisión. Sprint backlog vacío (sin tareas activas). Incidencias abiertas: (1) Web MyCompi 404 — detectada por Marcos, afecta producción, pendiente resolución de Paco; (2) Paperclip APIs errores 503/401 — afecta a enzo, carlos, diana, elena, valeria, marcos, laura por vars PAPERCLIP_API_KEY/PAPERCLIP_API_URL ausentes en sesiones aisladas. Elena tiene proposal de automatización follow-up leads pendiente de aprobación. Sin blockers de QA en este momento.	f	2026-04-03 08:13:23.714	2026-04-03 08:13:23.715
cmnion92k000bhf1empp04bvg	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola activa con 4 trabajos disponibles. Tarea prioritaria: Atender emails de soporte (ALTA). Sin embargo, no hay acceso email configurado en himalaya para Laura/MyCompi. La bandeja de soporte no es accesible automáticamente.	f	2026-04-03 09:09:49.943	2026-04-03 09:09:50.687
cmnion9aj000dhf1e3ka5rfee	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable. Website MyCompi sigue fuera de servicio (HTTP 404) — Severidad Alta, incidencia ya documentada. Sin cambios en bloqueo cold email tool. Research semanal próximo 2026-04-07. 0 emails enviados. 0 jobs en cola.	f	2026-04-03 09:09:50.923	2026-04-03 09:09:50.924
cmnion9fy000fhf1ejd0bwmbi	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas sin cambios significativos vs reporte de ayer (2026-04-01). MRR €49, 1 cliente real (AlberBEE) con 29 días de trial restantes. Sin trabajos pendientes. Sin anomalías detectadas.	f	2026-04-03 09:09:51.118	2026-04-03 09:09:51.119
cmnion9lg000hhf1efpbexefx	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat activo. Site UP (HTTP 200, SSL OK). Job ALTA 2d7f1390 COMPLETED: mejoras rendimiento/UX sin feedback disponible. Service Worker implementado, preload LCP, sitemap.xml actualizado, CSS performance hooks añadidos.	f	2026-04-03 09:09:51.317	2026-04-03 09:09:51.318
cmnion9r2000jhf1ents4zk17	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverable pendientes de revisión. Sprint backlog vacío (plantilla sin datos). Incidencia abierta: web MyCompi 404 — siendo monitorizada por Marcos. Cola libre.	f	2026-04-03 09:09:51.518	2026-04-03 09:09:51.519
cmniqsvw80001hm1eiw3kexl8	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. No hay trabajos pendientes ni pipeline activo visible. No se detectaron leads en el sistema actual. Último strategy proposal guardado 2026-03-31.	f	2026-04-03 10:10:12.729	2026-04-03 10:10:12.78
cmnit7wy40001ks1exw11lbbr	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola vacía. No hay emails ni chats pendientes de respuesta. Trabajo ALTA prioridad (atender emails soporte) marcada como completada. Warning: BD tiene columna 'ejecutor' que no existe en el schema — reportado a Paco.	f	2026-04-03 11:17:53.159	2026-04-03 11:17:53.208
cmnit7x600003ks1eiihefkby	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable con 8 leads (2 hot, 5 warm, 1 cold). 10 leads enriquecidos y listos para outreach pero bloqueados por falta de integración de cold email tool. Incidencia activa: web MyCompi 404 en todos los endpoints (Render Frankfurt). Sin actividad nueva de outreach. 0 emails enviados. Research semanal hecho 2026-03-31, próxima ventana 2026-04-07.	f	2026-04-03 11:17:53.448	2026-04-03 11:17:53.449
cmnit7xc50005ks1e64nbsydc	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Paperclip API 503 — sin tareas disponibles	f	2026-04-03 11:17:53.669	2026-04-03 11:17:53.67
cmnit7xhw0007ks1e3a5zsd6l	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas early-stage: 22 clientes (21 BASIC0 + 1 COMPLETO), MRR €98 (simulaciones), 0 interacciones chat, 0 tracking de activación. Web producción 404 — incidencia abierta. Sin anomalías de churn. Sin eventos de activación para analizar.	f	2026-04-03 11:17:53.876	2026-04-03 11:17:53.877
cmnit7xwj0009ks1e03mzxo43	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.com funciona OK (200). Subdomain antiguo en Render sigue caído pero no afecta al sitio principal. Tarea de features sin feedback disponible - necesito que Laura proporcione los datos o que se me indique de dónde extraer el feedback.	f	2026-04-03 11:17:54.404	2026-04-03 11:17:54.414
cmnit7y2q000bks1e5yvf1vgi	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola completamente vacía — ningún deliverable pendiente de revisión. Enzo sin actividad desde ayer (2026-04-02), Carlos con pipeline limpio. Reviews al día. Ninguna incidencia activa. Sin acción requerida en este ciclo.	f	2026-04-03 11:17:54.627	2026-04-03 11:17:54.628
cmniv0ng90001kf1eyde0md54	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. 10 leads pendientes de outreach (7 ALTA, 3 MEDIA) del job 5717edc9. Sin trabajos activos en cola. Pipeline: hot=2 (ALTA sin contactar), warm=5 (ALTA en seguimiento), cold=3 (MEDIA). Sin CRM ni pipeline file aún. Sin urgencia.	f	2026-04-03 12:08:13.498	2026-04-03 12:08:13.553
cmniv0noo0003kf1evr1jexda	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía, métricas sin cambios (MRR €49, 1 cliente real, trial 29 días). Research semanal: 2 proposals añadidas — hybrid usage-based pricing y cohort analysis tracking implementation.	f	2026-04-03 12:08:13.8	2026-04-03 12:08:13.799
cmniv0num0005kf1ebuof2f2i	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Job 5a012266 «Implementar top 2 features del feedback» — SIN DATOS DE FEEDBACK DISPONIBLES. No hay encuestas, respuestas ni feedback de clientes registrado en el sistema. El job depende de que Laura complete el survey de satisfacción del cliente (job 3186358b, semana-4 dia-6, aún TODO). Hoy es dia-3 de semana-4. Web mycompi.onrender.com funciona (200). Site status OK.	f	2026-04-03 12:08:14.015	2026-04-03 12:08:14.014
cmniv0o0r0007kf1exj783nye	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente. Sprint backlog vacío, cola de review vacía, ningún deliverable activo ni issues abiertos.	f	2026-04-03 12:08:14.235	2026-04-03 12:08:14.234
cmnj18tl00001hw1em2a3easi	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Laura verificada activa. Cola con 4 trabajos disponibles (soporte emails, welcome emails, inbox config, survey satisfacción). Script take-job necesita revisión (enum error). Incidencias sin cambios — web operativa.	f	2026-04-03 15:02:32.388	2026-04-03 15:02:32.446
cmnj18ttb0003hw1e3y6ses99	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. ISSUE PERSISTE: 10 leads del job 5717edc9 (2026-04-01) siguen sin outreach. PAPERCLIP_API_KEY y PAPERCLIP_API_URL no configurados — enrichment bloqueado. Sin CRM activo. Sin cambios en pipeline.	f	2026-04-03 15:02:32.687	2026-04-03 15:02:32.69
cmnj18tzb0005hw1e2c9v6u5b	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. DB no accesible (ECONNREFUSED 127.0.0.1:5432) — métricas no disponibles en este contexto de ejecución. Research semanal ya realizado 2026-04-03. Sin anomalías detectadas.	f	2026-04-03 15:02:32.903	2026-04-03 15:02:32.905
cmnj18u510007hw1ekwkva7gp	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.com OK (HTTP 200, 544ms). SSL vigente. Cola con 2 trabajos ALTA disponibles sobre implementar features de feedback early adopters. Script laura_feedback.js tiene error: columna 'ejecutor' no existe en tabla Trabajo — necesita fix de schema. Informe de incidencias actualizado.	f	2026-04-03 15:02:33.11	2026-04-03 15:02:33.112
cmnj18uaw0009hw1eqykatuxb	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-03 12:49 UTC. Cola vacía, ningún deliverable pendiente de revisión. Reviews al día (último 2026-04-01). Incidencia abierta: laura_feedback.js con error de schema Prisma (PrismaClientKnownRequestError: columna 'Trabajo.ejecutor' no existe) — severidad 🟡 Media, detectada por Marcos. Sin acción requerida en QA.	f	2026-04-03 15:02:33.32	2026-04-03 15:02:33.323
cmnj3fceq0001il1ee4plxng0	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada. 3 trabajos disponibles (emails bienvenida, config inbox, survey satisfacción). Sin mensajes pendientes ni tickets urgentes. Sin acción requerida.	f	2026-04-03 16:03:35.955	2026-04-03 16:03:36.01
cmnj3fcn30003il1ehfgm8hy4	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas dentro de rangos normales para fase early-stage.	f	2026-04-03 16:03:36.255	2026-04-03 16:03:36.256
cmnj3fcta0005il1eupud4obs	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web principal sin respuesta en health check. 2 trabajos de desarrollo en cola. Sitio parece estar down o inestable.	f	2026-04-03 16:03:36.479	2026-04-03 16:03:36.48
cmnj3fczd0007il1e3f9sp2td	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverables nuevos esperando revisión QA. Última revisión registrada: 2026-04-01. Sprint-backlog vacío (sin tareas priorizadas activas). Incidencia abierta: script laura_feedback.js con error de schema (Prisma — campo 'ejecutor' no existe en BD). Paperclip APIs con errores 503/401 afectan a enzo, elena y otros — asunto de plataforma, no de calidad de deliverable. Sin acción de QA requerida en este ciclo.	f	2026-04-03 16:03:36.697	2026-04-03 16:03:36.698
eb73fddc-bbc9-43b0-8daa-4db61d8bcbf5	cmn7jgl500000j41enpnhqa2z	marcos	ERROR	Web mycompi.com caída — 404	Marcos ha detectado que mycompi.com (dominio principal) devuelve 404. El servicio en mycompi.onrender.com funciona (200 OK, SSL OK, health OK). Admin y Chat también funcionan. El problema parece ser de DNS o el dominio no apunta al hosting. Revisar urgently.	f	2026-04-04 02:41:40.055	2026-04-04 02:41:40.055
cmnksrk070001d51eeg1yvt9v	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola vacía. Sin mensajes pendientes, sin tickets, sin incidencias. Todo tranquilo.	f	2026-04-04 20:40:42.248	2026-04-04 20:40:42.253
cmnksrkib0003d51edbow471r	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Web MyCompi CAÍDA (HTTP 000, ~296h). mycompi.com y mycompi.es sin respuesta. beecoded.com UP. Sin campañas activas. Leads sin update de Carlos.	f	2026-04-04 20:40:42.9	2026-04-04 20:40:42.901
ed880d10-9d27-413a-810a-e73132c684f7	cmn7jjmjm0003j41ekknkwjzf	Laura	INFO	Cliente FRIO: EmpresaTest	15 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.61	2026-04-10 18:54:13.61
cd279e05-3324-4dbc-a757-573e9c95ca29	cmnbhljm70000f01x9jbyuea1	Laura	INFO	Cliente FRIO: BEE	12 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.611	2026-04-10 18:54:13.611
cmnksrknz0005d51e426lhgkm	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola vacía (PostgreSQL). Health check: http://www.mycompi.es responde 200 pero muestra default landing page del hosting (contenido estático de 2020, no la app real). https://www.mycompi.es no conecta (SSL no configurado). beencode.com: HTTP hace redirect a HTTPS pero HTTPS no conecta (timeout). Incidencias persistentes desde al menos 2026-04-03. SSL en ambos domains necesita configuración.	f	2026-04-04 20:40:43.103	2026-04-04 20:40:43.105
cmnkx1xpd0001go1e3qv1xlkt	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Todos los trabajos completados. Sistema en fase de pruebas con clientes test. Pipeline sin leads activos.	f	2026-04-04 22:40:45.025	2026-04-04 22:40:45.032
cmnkx1xwm0003go1etxx5yi7z	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check OK. Site up (200), SSL válido hasta 2026-06-13, sitemap accesible. Cola vacía. Sin incidencias.	f	2026-04-04 22:40:45.286	2026-04-04 22:40:45.287
cmnkx1y2b0005go1ejqhcmp1z	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-04 22:15 UTC (2026-04-05 06:15 MYT). Cola QA vacía — ningún deliverable nuevo de otros agentes. Sprint backlog sin tareas activas. 4 incidencias abiertas siguen sin resolución: 🔴 SITE_DOWN mycompi.com (fix a4ead9a listo en GitHub, deploy manual pendiente en Render, >38h), 🟡 HTTPS mycompi.es SSL handshake, 🟡 Prisma schema laura_feedback.js, 🟡 Paperclip auth 401. Reviews pendientes: Laura (inbox-soporte, feedback 2026-04-04 00:45Z) y Carlos (email-bienvenida, feedback 2026-04-01 04:47Z) — ambos >24h sin resolver. Sin acción QA posible en este ciclo.	f	2026-04-04 22:40:45.491	2026-04-04 22:40:45.492
cmnld0jbd0001fb1eplx8k2h7	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola vacía. Bandeja de entrada sin actividad (error 401 auth en inbox API). 4 trabajos siguen bloqueados por falta de acceso a email processor (notificado a Paco). Sin acción adicional posible sin credenciales.	f	2026-04-05 06:07:33.577	2026-04-05 06:07:33.584
cmnld0jhl0003fb1e2hmg2svy	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Web MyCompi CAÍDA de nuevo (HTTP 000 timeout). beecoded.com UP. Pipeline leads Carlos vacío (0 hot/warm/cold). Paperclip 401 auth error. Campañas activas: 0. Competencia sin cambios.	f	2026-04-05 06:07:33.801	2026-04-05 06:07:33.802
cmnld0jne0005fb1euj2fxvfk	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Todos los trabajos completados. Pipeline de ventas no disponible aún (no existe tabla leads en BDD). Sin leads nuevos ni seguimientos. CRM por construir. Sin cambios desde última revisión.	f	2026-04-05 06:07:34.011	2026-04-05 06:07:34.012
cmnld0jt50007fb1e5bgbqk1z	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas actualizadas desde BD PostgreSQL (Neon). Solo 1 cliente real con ingresos: AlberBEE (€49 MRR, plan COMPLETO). Trial activo: AlberBEE trial 30 días desde 2026-03-31 → termina 2026-04-30 (25 días restantes). Muchas cuentas test E2E sin uso ni pagos. Sin anomalías detectadas vs snapshot 2026-04-01.	f	2026-04-05 06:07:34.218	2026-04-05 06:07:34.219
cmnld0jyp0009fb1e7p7c3bvf	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola vacía. Web: Cloudflare responde (301 redirect), pero el origin no responde (timeout en https://mycompi.com/). Posible incidencia.	f	2026-04-05 06:07:34.417	2026-04-05 06:07:34.418
cmnld0k4c000bfb1e0xmwk5mp	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola QA vacía. Sin deliverables nuevos. Domingo 5 abril, 13:45 MYT. Incidencias vigentes sin cambios. Carlos (100h+), Laura (36h) siguen con feedback pendiente sin resolver. Web MyCompi parece resuelta según incidencias.md pero heartbeat anterior indica seguía pendiente — verificar en siguiente ciclo. Sin acción QA posible en este ciclo.	f	2026-04-05 06:07:34.621	2026-04-05 06:07:34.622
cmnm1rj020001cc1x4ar70qxm	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola vacía. Sin actividad. Buen trabajo.	f	2026-04-05 17:40:23.662	2026-04-05 17:40:23.731
cmnm1rjhk0003cc1xx5iy88n7	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalias criticas. Web MyCompi sigue caida (404) con fix pendiente deploy en Render - bloquea todas las campañas ads. APIs ads sin acceso (auth 401). Research April 2026: precision > scale + LinkedIn TL Ads siguen vigentes. Competidor eesel.ai publicando contenido. Proposals Enzo semana 2026-04-04 siguen vigentes.	f	2026-04-05 17:40:24.296	2026-04-05 17:40:24.298
cmnm1rjn40005cc1xozglsb16	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin cambios en métricas. Solo incidencia abierta: HTTPS mycompi.es sigue sin resolver (Marcos está al día). Diana tiene 4 proposals activas. Sin acción urgente requerida a esta hora.	f	2026-04-05 17:40:24.497	2026-04-05 17:40:24.498
cmnm1rjss0007cc1x331szqy7	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola QA vacía — ningún deliverable nuevo esperando revisión. Sprint backlog sin tareas activas asignadas a Valeria. Incidencias activas monitorizadas sin cambios: (1) mycompi.com DOWN — fix a4ead9a aplicado, deploy manual pendiente en Render, (2) mycompi.es HTTPS falla — SSL handshake sin resolución. Reviews pendientes con feedback sin resolver: Laura inbox-soporte (62h+) y Carlos email-bienvenida (130h+). Sin acción QA posible en este ciclo — cola vacía.	f	2026-04-05 17:40:24.7	2026-04-05 17:40:24.702
a5904d5f-5fd4-44ab-83e2-f766b06802ab	cmnbz84yf0000i81e9n51vef8	Laura	INFO	Cliente FRIO: Test SA	12 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.612	2026-04-10 18:54:13.612
5b1e008e-44f1-40c8-9487-01949e443e86	cmnc3bxds0000g81e1plhkg46	Laura	INFO	Cliente FRIO: Cósima Ritual 	12 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.613	2026-04-10 18:54:13.613
3c090ec4-145c-4016-9512-8fab74f2fc2d	cmneo7cu00000dz1wdl77hf64	Laura	INFO	Cliente FRIO: Empresa Test SL	10 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.614	2026-04-10 18:54:13.614
c79d19ff-611e-4b88-b9da-0251e839e211	cmnh4nxww0008gn1wiluvj9wk	Laura	INFO	Cliente FRIO: Test Empresa SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.615	2026-04-10 18:54:13.615
cfed8b6e-c1ab-4af6-ad07-96ab111fc0dd	cmnh4oykc000bgn1wen6wmarh	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.616	2026-04-10 18:54:13.616
28d0c74a-b2f6-401b-aca3-33697cdae197	cmnh4q2ou000egn1w2znos5qz	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.617	2026-04-10 18:54:13.617
c4b2af4a-d61f-4a06-8d2e-546cd3f6c776	cmnh4qq85000hgn1wr57vw439	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.617	2026-04-10 18:54:13.617
4ed9ba63-d6aa-4f5d-bc36-3f9f4dfaf7f6	cmnh4s788000kgn1wkpx47bmn	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.618	2026-04-10 18:54:13.618
70525476-4f66-47c6-bd66-8ef80f3d1374	cmnh4ssgd000ngn1w9e0b5s58	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.619	2026-04-10 18:54:13.619
645307fb-366c-483f-b9a7-559ba1b9064d	cmnh4tgg4000qgn1w45s623jo	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.62	2026-04-10 18:54:13.62
65c76a6e-623a-45d9-82b5-42104776e386	cmnh4tvnb000tgn1wwgi6vtnm	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.62	2026-04-10 18:54:13.62
5908a0bc-e1cb-4a20-aaa4-25a181a848f7	cmnh4v8t3000wgn1wbf1znk11	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.621	2026-04-10 18:54:13.621
8927ff3a-5d29-423c-be11-c2f672171d11	cmnh59k760000fq1x0dr5pedx	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.625	2026-04-10 18:54:13.625
d33a974a-283c-41a8-802f-5ca139d1df3d	cmnh5eckw0003fq1x00pe8jmw	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.625	2026-04-10 18:54:13.625
eacd8708-737b-48c0-b597-379531aa394e	cmnh5wror000cfq1xe8sydndo	Laura	INFO	Cliente FRIO: Test Corp SL	8 dias sin actividad. Ultimo: nunca. Accion: outreach	f	2026-04-10 18:54:13.626	2026-04-10 18:54:13.626
8564ba45-c0f8-44c1-9aa6-36a96e11e9e1	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	✅ QA Aprobado: 🎯 Escalar outreach si hay respuesta pos	QA PASS — Score 100/100. "🎯 Escalar outreach si hay respuesta positiva" listo para entrega.	f	2026-04-10 18:56:05.574	2026-04-10 18:56:05.574
f8a0a2bf-c4b6-46a6-92e1-d03104eb6b07	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	✅ QA Aprobado: 📈 Primer reporte de métricas: retención	QA PASS — Score 100/100. "📈 Primer reporte de métricas: retención y uso" listo para entrega.	f	2026-04-10 18:56:05.578	2026-04-10 18:56:05.578
f6a88448-018c-42fd-8073-355c9bb25587	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	✅ QA Aprobado: 📊 Análisis competitivo: 3-5 competidore	QA PASS — Score 100/100. "📊 Análisis competitivo: 3-5 competidores directos" listo para entrega.	f	2026-04-10 18:56:05.581	2026-04-10 18:56:05.581
e79ee42b-5b5d-4c81-b3a8-9e63aa0a8c3c	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	✅ QA Aprobado: 🎯 Outreach: identificar 10 leads en sec	QA PASS — Score 100/100. "🎯 Outreach: identificar 10 leads en sector del cl" listo para entrega.	f	2026-04-10 18:56:05.583	2026-04-10 18:56:05.583
7c1c9ec0-66ae-4815-bf4a-ee87db146549	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	✅ QA Aprobado: 📧 Preparar emailing de bienvenida para 	QA PASS — Score 100/100. "📧 Preparar emailing de bienvenida para el cliente" listo para entrega.	f	2026-04-10 18:56:05.585	2026-04-10 18:56:05.585
c315c176-ee49-43c4-8574-6380e8e3bbcd	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	✅ QA Aprobado: 🔍 Investigar empresa, sector y competen	QA PASS — Score 100/100. "🔍 Investigar empresa, sector y competencia" listo para entrega.	f	2026-04-10 18:56:05.588	2026-04-10 18:56:05.588
ab6f343c-1474-42c7-be85-cd8afe99c1d9	cmn77j4yd0002b41efmeyg8o1	Laura	INFO	Cliente FRIO: Test SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.648	2026-04-10 21:54:46.648
d6b69e1b-4b9f-4e46-999b-b7665d341e1e	cmn77tmsh0004e81e667qlyks	Laura	INFO	Cliente FRIO: Test2 SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.651	2026-04-10 21:54:46.651
22a17f32-d65d-45f8-91be-b646aaf7362c	cmn7fddc60000ew1e76drd41a	Laura	INFO	Cliente FRIO: TestEmpresa	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.653	2026-04-10 21:54:46.653
b7f9e31b-cce0-4369-a6b0-0af9ab0e07dc	cmn7jgl500000j41enpnhqa2z	Laura	INFO	Cliente FRIO: Tester	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.654	2026-04-10 21:54:46.654
b0f6546b-8ee0-4cde-a8a8-a76f84466434	cmn7jjmjm0003j41ekknkwjzf	Laura	INFO	Cliente FRIO: EmpresaTest	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.655	2026-04-10 21:54:46.655
ca16ca69-7442-433a-86c3-f227ce9312ac	cmnbhljm70000f01x9jbyuea1	Laura	INFO	Cliente FRIO: BEE	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.656	2026-04-10 21:54:46.656
6dabfcb7-015b-41f8-889d-d4db7e640660	cmnbz84yf0000i81e9n51vef8	Laura	INFO	Cliente FRIO: Test SA	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.657	2026-04-10 21:54:46.657
49d59819-2781-49df-b523-ac15b2681fe6	cmnc3bxds0000g81e1plhkg46	Laura	INFO	Cliente FRIO: Cósima Ritual 	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.658	2026-04-10 21:54:46.658
c7bcc419-1ebf-4272-8f6a-5ff5463e40eb	cmneo7cu00000dz1wdl77hf64	Laura	INFO	Cliente FRIO: Empresa Test SL	10 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.659	2026-04-10 21:54:46.659
fc1c2fc2-aeed-44fe-ab6f-d8d1fce53dd6	cmnh4nxww0008gn1wiluvj9wk	Laura	INFO	Cliente FRIO: Test Empresa SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.66	2026-04-10 21:54:46.66
79ce1f12-6633-4918-882a-72c69d503891	cmnh4oykc000bgn1wen6wmarh	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.661	2026-04-10 21:54:46.661
b3fd1ff5-bb95-4239-ba8e-c324ba9ca86e	cmnh4q2ou000egn1w2znos5qz	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.661	2026-04-10 21:54:46.661
028baf6e-fea1-47ab-8a2a-b1230cb1d2cf	cmnh4qq85000hgn1wr57vw439	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.662	2026-04-10 21:54:46.662
d3558116-f99f-491c-8476-3ce4695f534e	cmnh4s788000kgn1wkpx47bmn	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.663	2026-04-10 21:54:46.663
906604cf-2ca7-4d1c-8229-2f3dc6249916	cmnh4ssgd000ngn1w9e0b5s58	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.664	2026-04-10 21:54:46.664
fd30d869-6272-41a3-a80a-e164e3965990	cmnh4tgg4000qgn1w45s623jo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.665	2026-04-10 21:54:46.665
c609bc67-43c5-4c79-9eed-1334cc37fbfe	cmnh4tvnb000tgn1wwgi6vtnm	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.665	2026-04-10 21:54:46.665
af32e7d7-0721-4c07-a458-55425a84d73c	cmnh4v8t3000wgn1wbf1znk11	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.666	2026-04-10 21:54:46.666
6a9a1762-65dd-4b11-8cd5-1eca4e7e8dab	cmnh59k760000fq1x0dr5pedx	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.667	2026-04-10 21:54:46.667
d10564a7-64c0-4866-9719-b22745f97ac6	cmnh5eckw0003fq1x00pe8jmw	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.667	2026-04-10 21:54:46.667
7ec9409b-6620-4102-ad8b-af74eb024df1	cmnh5wror000cfq1xe8sydndo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:46.668	2026-04-10 21:54:46.668
37ba5a74-12e4-42a9-a2f3-c3c81925264c	cmn77j4yd0002b41efmeyg8o1	Laura	INFO	Cliente FRIO: Test SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.011	2026-04-10 21:54:52.011
baffe4de-6d49-47bf-89e4-39c538a2bce5	cmn77tmsh0004e81e667qlyks	Laura	INFO	Cliente FRIO: Test2 SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.013	2026-04-10 21:54:52.013
06df4f97-810e-41e3-93ce-cd68145df362	cmn7fddc60000ew1e76drd41a	Laura	INFO	Cliente FRIO: TestEmpresa	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.014	2026-04-10 21:54:52.014
547c55fb-c403-47be-b5c9-717098cf73d7	cmn7jgl500000j41enpnhqa2z	Laura	INFO	Cliente FRIO: Tester	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.015	2026-04-10 21:54:52.015
d120dfb5-d057-43a8-a880-3be6be6bfb62	cmn7jjmjm0003j41ekknkwjzf	Laura	INFO	Cliente FRIO: EmpresaTest	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.016	2026-04-10 21:54:52.016
02d8cb16-4cd3-4a17-8e53-7831552ee9ad	cmnbhljm70000f01x9jbyuea1	Laura	INFO	Cliente FRIO: BEE	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.017	2026-04-10 21:54:52.017
81cacbec-2880-4bc3-a8c6-4abf7843e894	cmnbz84yf0000i81e9n51vef8	Laura	INFO	Cliente FRIO: Test SA	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.018	2026-04-10 21:54:52.018
48070801-e600-4e14-9b8b-4dd9fa1a3ac9	cmnc3bxds0000g81e1plhkg46	Laura	INFO	Cliente FRIO: Cósima Ritual 	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.018	2026-04-10 21:54:52.018
8658c1c1-f716-4f4c-a0a0-dc2e1e85dcc6	cmneo7cu00000dz1wdl77hf64	Laura	INFO	Cliente FRIO: Empresa Test SL	10 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.019	2026-04-10 21:54:52.019
de98fa2b-290e-425a-9e22-e08a7a99332e	cmnh4nxww0008gn1wiluvj9wk	Laura	INFO	Cliente FRIO: Test Empresa SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.02	2026-04-10 21:54:52.02
8a3712f6-ecd9-467b-8a57-af5130fe1b71	cmnh4oykc000bgn1wen6wmarh	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.021	2026-04-10 21:54:52.021
2c4cebac-2ae8-40ae-87fe-373f493de39d	cmnh4q2ou000egn1w2znos5qz	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.022	2026-04-10 21:54:52.022
3ba55f84-f122-4367-a6ef-890ed9afd534	cmnh4qq85000hgn1wr57vw439	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.022	2026-04-10 21:54:52.022
df1f0536-14e8-4c34-a37a-21ca74ccfea3	cmnh4s788000kgn1wkpx47bmn	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.023	2026-04-10 21:54:52.023
db3c4cc1-fdb6-4000-8a41-d7f520ba0a1b	cmnh4ssgd000ngn1w9e0b5s58	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.024	2026-04-10 21:54:52.024
aa74c26e-23d3-46e4-936d-7f82a136afde	cmnh4tgg4000qgn1w45s623jo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.024	2026-04-10 21:54:52.024
2e663344-7cd6-4628-83ea-3c9695a5c7ea	cmnh4tvnb000tgn1wwgi6vtnm	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.025	2026-04-10 21:54:52.025
b0c84940-83ab-4dac-ad7f-646c1027afe9	cmnh4v8t3000wgn1wbf1znk11	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.026	2026-04-10 21:54:52.026
4272b25b-4a5c-4425-8f4b-0e61e81968ba	cmnh59k760000fq1x0dr5pedx	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.027	2026-04-10 21:54:52.027
726e0bc7-3724-4cd4-a853-76d26cf08319	cmnh5eckw0003fq1x00pe8jmw	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.027	2026-04-10 21:54:52.027
8fe26950-1e1c-4009-8486-6a54b4892dad	cmnh5wror000cfq1xe8sydndo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 21:54:52.028	2026-04-10 21:54:52.028
299f62b4-a257-43e2-baef-48918153f6b0	cmn77j4yd0002b41efmeyg8o1	Laura	INFO	Cliente FRIO: Test SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.854	2026-04-10 22:17:26.854
ef21148a-b7e4-4e61-825c-6d3a7aff6fb8	cmn77tmsh0004e81e667qlyks	Laura	INFO	Cliente FRIO: Test2 SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.856	2026-04-10 22:17:26.856
33837627-6cdb-42ba-9508-6296daffd618	cmn7fddc60000ew1e76drd41a	Laura	INFO	Cliente FRIO: TestEmpresa	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.857	2026-04-10 22:17:26.857
ff9d9493-0ee6-4e41-b379-82faa416224e	cmn7jgl500000j41enpnhqa2z	Laura	INFO	Cliente FRIO: Tester	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.858	2026-04-10 22:17:26.858
88c3a48c-17c1-49d5-9c76-3fbc0f703f4e	cmn7jjmjm0003j41ekknkwjzf	Laura	INFO	Cliente FRIO: EmpresaTest	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.859	2026-04-10 22:17:26.859
9be4401c-0cf7-4b0b-9c66-ea847a0ea340	cmnbhljm70000f01x9jbyuea1	Laura	INFO	Cliente FRIO: BEE	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.86	2026-04-10 22:17:26.86
ada1b743-d646-4de8-a60e-3b12a6af220d	cmnbz84yf0000i81e9n51vef8	Laura	INFO	Cliente FRIO: Test SA	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.861	2026-04-10 22:17:26.861
a8be46e7-13d3-47cd-857f-b2306d830f08	cmnc3bxds0000g81e1plhkg46	Laura	INFO	Cliente FRIO: Cósima Ritual 	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.861	2026-04-10 22:17:26.861
49aedec4-fc53-4710-93c9-c46d675f1e7b	cmneo7cu00000dz1wdl77hf64	Laura	INFO	Cliente FRIO: Empresa Test SL	10 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.862	2026-04-10 22:17:26.862
036e4263-c597-436f-8d35-879ccd82c02c	cmnh4nxww0008gn1wiluvj9wk	Laura	INFO	Cliente FRIO: Test Empresa SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.863	2026-04-10 22:17:26.863
948bc998-ebc7-4b65-a700-aa3e2298d1d4	cmnh4oykc000bgn1wen6wmarh	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.864	2026-04-10 22:17:26.864
5dde1c73-f1df-4862-938b-272358a7c6cc	cmnh4q2ou000egn1w2znos5qz	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.864	2026-04-10 22:17:26.864
b9effc20-b5df-4252-ace5-09035a12030d	cmnh4qq85000hgn1wr57vw439	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.865	2026-04-10 22:17:26.865
9694edc4-e9d5-4370-9c82-91d69415eb6e	cmnh4s788000kgn1wkpx47bmn	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.866	2026-04-10 22:17:26.866
acac08f6-4832-4526-9f5e-feafa74be8d5	cmnh4ssgd000ngn1w9e0b5s58	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.866	2026-04-10 22:17:26.866
3e4b5221-77a3-4696-ad11-fece585b2799	cmnh4tgg4000qgn1w45s623jo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.867	2026-04-10 22:17:26.867
ba52f9d2-8e64-449e-967b-b01e28270d9e	cmnh4tvnb000tgn1wwgi6vtnm	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.868	2026-04-10 22:17:26.868
d13485a1-5d42-430d-95f4-043a4e7340d1	cmnh4v8t3000wgn1wbf1znk11	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.868	2026-04-10 22:17:26.868
d017887d-ab34-433f-a023-7c4a689a6c0a	cmnh59k760000fq1x0dr5pedx	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.869	2026-04-10 22:17:26.869
e7e35a09-4d8b-477e-85d3-cc01524f3cf6	cmnh5eckw0003fq1x00pe8jmw	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.869	2026-04-10 22:17:26.869
16e28d06-5bbe-4e4d-8f36-e9064045ec95	cmnh5wror000cfq1xe8sydndo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:17:26.87	2026-04-10 22:17:26.87
5ba88bfd-dd4f-401b-81bf-96594120c9f1	cmn77j4yd0002b41efmeyg8o1	Laura	INFO	Cliente FRIO: Test SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.549	2026-04-10 22:20:27.549
542b503d-4889-4c84-b162-41b954e34753	cmn77tmsh0004e81e667qlyks	Laura	INFO	Cliente FRIO: Test2 SL	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.551	2026-04-10 22:20:27.551
35ea0f84-e725-4d17-8204-4848285272e6	cmn7fddc60000ew1e76drd41a	Laura	INFO	Cliente FRIO: TestEmpresa	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.552	2026-04-10 22:20:27.552
72285a2d-d815-4eb8-be2a-a6586e737b8e	cmn7jgl500000j41enpnhqa2z	Laura	INFO	Cliente FRIO: Tester	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.553	2026-04-10 22:20:27.553
9f389e77-4b63-48b0-b394-5292a3d91ed6	cmn7jjmjm0003j41ekknkwjzf	Laura	INFO	Cliente FRIO: EmpresaTest	15 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.554	2026-04-10 22:20:27.554
2b436d05-1114-44f4-a3b1-5d572e9b3ad1	cmnbhljm70000f01x9jbyuea1	Laura	INFO	Cliente FRIO: BEE	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.555	2026-04-10 22:20:27.555
af1d2400-59db-4d4b-adb0-48f5d7d7249c	cmnbz84yf0000i81e9n51vef8	Laura	INFO	Cliente FRIO: Test SA	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.556	2026-04-10 22:20:27.556
bd25771a-c161-4378-8719-994f07afac45	cmnc3bxds0000g81e1plhkg46	Laura	INFO	Cliente FRIO: Cósima Ritual 	12 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.557	2026-04-10 22:20:27.557
da7290bf-94f8-47bb-8e1d-31faf6bc58ad	cmneo7cu00000dz1wdl77hf64	Laura	INFO	Cliente FRIO: Empresa Test SL	10 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.557	2026-04-10 22:20:27.557
eadaaf6a-fb97-40a1-998c-c6b0095f0f4e	cmnh4nxww0008gn1wiluvj9wk	Laura	INFO	Cliente FRIO: Test Empresa SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.558	2026-04-10 22:20:27.558
fe309d87-f953-40d9-8c0e-d488344af58d	cmnh4oykc000bgn1wen6wmarh	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.559	2026-04-10 22:20:27.559
b7217fb9-b923-4183-aa79-4192c085eec1	cmnh4q2ou000egn1w2znos5qz	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.56	2026-04-10 22:20:27.56
1665b8b7-ce1e-4f20-8ab4-b9b69cb938c8	cmnh4qq85000hgn1wr57vw439	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.56	2026-04-10 22:20:27.56
7b884e61-31be-477e-819f-4fda0b14736d	cmnh4s788000kgn1wkpx47bmn	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.561	2026-04-10 22:20:27.561
492cd507-544c-456e-ad81-6cd0397a0ebf	cmnh4ssgd000ngn1w9e0b5s58	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.562	2026-04-10 22:20:27.562
eb6d593e-4ddd-4cb4-beb5-3f6dac085204	cmnh4tgg4000qgn1w45s623jo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.562	2026-04-10 22:20:27.562
4bd2ceb2-8be1-4ff1-aeba-5d0749afdd91	cmnh4tvnb000tgn1wwgi6vtnm	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.563	2026-04-10 22:20:27.563
492bd594-7590-4d85-a21b-003a64af8e90	cmnh4v8t3000wgn1wbf1znk11	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.564	2026-04-10 22:20:27.564
419c5ae0-571d-41b8-9abe-652cd04515e2	cmnh59k760000fq1x0dr5pedx	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.565	2026-04-10 22:20:27.565
b09c3ea7-7b49-4cab-b3b1-21fc0daf353c	cmnh5eckw0003fq1x00pe8jmw	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.565	2026-04-10 22:20:27.565
28c00226-63ec-4eda-9af9-0c794afa29b2	cmnh5wror000cfq1xe8sydndo	Laura	INFO	Cliente FRIO: Test Corp SL	8 días sin actividad. Último: nunca. Acción: outreach	f	2026-04-10 22:20:27.566	2026-04-10 22:20:27.566
\.


--
-- Data for Name: OnboardingRun; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."OnboardingRun" (id, "clienteId", estado, progreso, "scannedUrls", briefing, "startedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: OnboardingSequence; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."OnboardingSequence" (id, "clienteId", "dia1Sent", "dia3Sent", "dia7Sent", activo, "startedAt", "lastEmailAt") FROM stdin;
\.


--
-- Data for Name: Pago; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Pago" (id, "clienteId", "stripePaymentId", cantidad, moneda, estado, tipo, descripcion, "fechaPago", "createdAt") FROM stdin;
cmneoatyh0001r9nsw27v13e4	cmn3je5zq0000e31xg8wru9iy	cs_live_a1HwW8HY2XcJrQHQDzs5PUKrLbXxUFZ8FuT4eSb9yTzm6iU2bGtyAHQBXU	49	EUR	COMPLETED	SUSCRIPCION	Plan COMPLETO - Simulación de pago	2026-03-31 13:49:06.473	2026-03-31 13:49:06.473
cmneoc8lz0001r9phb4h6szrk	cmn3je5zq0000e31xg8wru9iy	sub_1TH2gIFnOlGTfuoBLwHMob5Q	49	EUR	COMPLETED	SUSCRIPCION	Plan COMPLETO - Suscripción activa (trial 30 días)	2026-03-31 13:50:12.119	2026-03-31 13:50:12.119
\.


--
-- Data for Name: Skill; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Skill" (id, key, nombre, descripcion, categoria, contenido, "sourceType", "sourceUrl", "trustLevel", "creadoEn", "actualizadoAt") FROM stdin;
8f0efbce-52f1-48b6-b266-919c081790ee	marketing-copywriting	Copywriting Marketing	Escritura persuasiva para campañas, emails y ads	marketing		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
815e8639-3c9a-413a-996d-a2f38450e633	social-media	Social Media	Gestión y planificación de redes sociales	marketing		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
7bfd83bf-f85e-491a-80d8-ccd311768af9	seo-optimization	SEO Optimization	Optimización para motores de búsqueda	marketing		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
e5dc2a23-98ba-4037-be9f-52b0236bc7c8	email-marketing	Email Marketing	Campañas de email automation y nurturing	marketing		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
0c917391-214e-4e70-924e-c90e40b02200	coding-development	Desarrollo Web	Frontend y backend, APIs, bases de datos	codigo		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
c18fa8dd-30d5-4466-882a-f29919fbba9a	devops-deployment	DevOps	Docker, CI/CD, despliegue y monitorización	codigo		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
6507359f-8874-49f2-a742-f88716f873ea	data-analysis	Análisis de Datos	SQL, métricas, reporting, dashboards	codigo		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
f45f92b4-1543-4308-a354-d109e1b76d63	sales-crm	Ventas y CRM	Gestión de leads, cierre, HubSpot	ventas		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
ba9cbb42-7726-4abe-8c62-1a86e73e0a12	lead-nurturing	Lead Nurturing	Secuencias de automatización de ventas	ventas		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
0b017964-86de-4fd4-995f-1b4dc69f9546	customer-support	Atención al Cliente	Tickets, emails, resolución de problemas	soporte		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
d87106b4-2169-4ccc-969c-cceec6fb3880	email-automation	Email Automation	Autoresponders, sequences, templates	soporte		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
10f8698e-e27c-49ed-b229-e049645ed2a8	analytics-reporting	Analytics y Reporting	Métricas, KPIs, informes automáticos	analytics		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
d1911acc-893c-4f16-9799-061a2b413dad	visual-design	Diseño Visual	UI, branding, presentaciones	diseno		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
dc76640e-5cd0-4bdb-802f-3dabf0b08e7e	presentation-design	Diseño de Presentaciones	Slides profesionales para clientes	diseno		official	\N	official	2026-04-09 19:38:25.548891+00	2026-04-09 19:38:25.548891+00
\.


--
-- Data for Name: TeamHealth; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."TeamHealth" (id, "agenteId", semana, actividad, "tasaExito", "ideasOff", "budgetUsado", "createdAt") FROM stdin;
\.


--
-- Data for Name: TokenUsage; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."TokenUsage" (id, clienteid, agenteid, trabajoid, accion, tokensusados, modelo, costeeuros, createdat) FROM stdin;
\.


--
-- Data for Name: Trabajo; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Trabajo" (id, "clienteId", "agenteId", titulo, descripcion, estado, prioridad, tags, "inputData", "outputData", "errorMsg", "estimatedHours", "completedAt", "createdAt", "updatedAt", "aprobadoPor", "aprobadoAt", "notaAprobacion", "parentId", "requiereAprobacion", ejecutor, metadata) FROM stdin;
72a32571-15b2-4719-97ae-4b3895d7fe82	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📝 Definir Brand Voice inicial del cliente	Crear documento Brand Voice con: tono, vocabulario, público objetivo, mensajes clave.\nCoordinar con Marcos para que la web/brand sea consistente visualmente.\nEntregar a Paco para revisión.	TODO	MEDIA	{semana-1,dia-2,branding,marketing}	{"dia": 2, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:39:59.43	2026-03-31 15:39:59.43	\N	\N	\N	\N	f	\N	{}
8b5f919d-6d78-4d4f-829e-2dc621b6507c	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📣 Definir estrategia de contenidos inicial	Crear calendario de contenidos para las primeras 4 semanas.\nIdentificar canales principales (LinkedIn, web, email, RRSS).\nPresentar al cliente para aprobación antes de ejecutar.	TODO	MEDIA	{semana-1,dia-3,marketing,contenido}	{"dia": 3, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:00.416	2026-03-31 15:40:00.416	\N	\N	\N	\N	f	\N	{}
6ee2d97d-86b6-4562-b534-9098b28a5e14	cmn3je5zq0000e31xg8wru9iy	cmndh3yet0001r915hh6etshs	✅ Revisión QA del MVP — gates: funcionalidad + UX	Valeria revisa el MVP completado por Marcos:\n- ¿Funcionalidad correcta?\n- ¿UX intuitiva?\n- ¿Errores o bugs visibles?\n- ¿Contenido coherente con el brand voice?\nReportar bugs a Marcos para fix inmediato.	TODO	ALTA	{semana-1,dia-5,qa,mvp}	{"dia": 5, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:02.374	2026-03-31 15:40:02.374	\N	\N	\N	\N	f	\N	{}
7adc9ebf-d156-4c0e-8feb-a002f00ee11c	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	✍️ Crear primer contenido: blog post o artículo sectorial	Enzo crea un blog post o artículo optimizado para SEO.\nTema: relevancia para el sector del cliente, palabras clave en español.\nIncluir: meta title, meta description, headings, CTAs.\nCoordinar con Marcos para publicar en la web del cliente.	TODO	ALTA	{semana-2,dia-2,contenido,seo}	{"dia": 2, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:04.656	2026-03-31 15:40:04.656	\N	\N	\N	\N	f	\N	{}
179a64aa-8728-467b-b3b9-d03225cb1da7	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	🔍 SEO básico: meta tags, keywords, estructura web	Enzo revisa/configura SEO técnico de la web del cliente.\n- Meta tags (title, description, OG tags)\n- Keywords en español para el sector\n- Estructura de URLs amigable\n- Sitemap básico\nCoordinar con Marcos para implementar cambios técnicos.	TODO	ALTA	{semana-2,dia-3,seo,web}	{"dia": 3, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:05.144	2026-03-31 15:40:05.144	\N	\N	\N	\N	f	\N	{}
1fda9348-70e5-4272-998c-0b507ddad7a1	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Revisar emails de bienvenida y soporte inicial	Laura revisa que los emails de bienvenida están correctamente configurados.\nProbar flujo completo: email → click → dashboard.\nVerificar que no hay emails bounce o errores de envío.	COMPLETED	MEDIA	{semana-1,dia-6,email,soporte}	{"dia": 6, "semana": 1, "recurrente": false}	{"nota": "Revisado: no hay emails en bandeja, no hay tickets pendientes, no hay chats. Sistema de soporte vacío — cliente aún no ha recibido emails de bienvenida formales. Recommendación: implementar flujo de onboarding por email."}	\N	\N	2026-04-03 22:21:19.406	2026-03-31 15:40:02.864	2026-04-03 22:21:19.406	\N	\N	\N	\N	f	\N	{}
d112e3b6-a464-4c92-bc5b-df46ad4abaf2	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Configurar dashboard de métricas del cliente	Configurar tracking en el dashboard del cliente.\nMétricas: conversaciones, usuarios activos, drop-off, leads generados.\nEl cliente debe poder ver su actividad en tiempo real.	COMPLETED	ALTA	{semana-1,dia-4,metrics,dashboard}	{"dia": 4, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:01.395	2026-03-31 15:40:01.395	\N	\N	\N	\N	f	\N	{}
0510fdb5-e6b0-41f7-83cc-40744644912e	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📧 Enviar primer email frío personalizado a cada lead	Carlos envía email frío personalizado a cada uno de los 10 leads.\nNo usar plantillas genéricas — cada email adaptado al contexto del lead.\nHacer follow-up a los que no respondan en 48h.	COMPLETED	ALTA	{semana-2,dia-2,outreach,email-frio}	{"dia": 2, "semana": 2, "recurrente": false}	\N	\N	\N	2026-04-01 04:08:01.863	2026-03-31 15:40:04.167	2026-03-31 15:40:04.167	\N	\N	\N	\N	f	\N	{}
4c311b55-dabb-406c-ab62-10f8294c7239	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	🔎 Investigar proveedores y herramientas recomendadas	Investigación de herramientas para el sector del cliente.\nProveedores de servicios, SaaS, herramientas de automatización.\nPresentar opciones con pros/contras para decisión del cliente.	IN_PROGRESS	MEDIA	{semana-1,dia-5,investigacion,herramientas}	{"dia": 5, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:01.883	2026-04-02 09:50:49.725	\N	\N	\N	\N	f	\N	{}
7186e55d-082d-4925-bbe3-ca268db5a5b7	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🚀 Integrar MVP con panel del cliente	Integrar el MVP construido en el dashboard del cliente.\nAsegurar que el cliente puede ver el avance desde su panel.\nMarcos notifica a Laura cuando esté listo para revisión de calidad.	COMPLETED	ALTA	{semana-1,dia-3,mvp,integracion}	{"dia": 3, "semana": 1, "recurrente": false}	{"nota": "MVP integrado: cliente puede ver avance desde panel. Chat con Paco operativo. Admin dashboard con metricas.", "integrado": true, "chat_panel": "operativo", "admin_dashboard": "operativo"}	\N	\N	2026-04-02 20:40:51.288	2026-03-31 15:39:59.919	2026-04-02 20:35:47.337	\N	\N	\N	\N	f	\N	{}
bbbb8ae1-abad-4689-a716-d1a39a1b4348	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🛠️ Construir MVP del proyecto según briefing	Usando el briefing validado por Paco, Marcos construye el MVP.\nPuede incluir: web básica, landing, prototipo, estructura técnica inicial.\nMarcos coordina con Enzo (marketing) y Diana (data) para que todo sea consistente.\nMantener al cliente informado del progreso.	COMPLETED	ALTA	{semana-1,dia-2,mvp,desarrollo}	{"dia": 2, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:39:58.941	2026-04-02 16:39:55.391	\N	\N	\N	\N	f	\N	{}
9a1c992b-435e-48f4-a9b2-1665cbf60bfa	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	⚙️ Mapear procesos del cliente para automatización	Elena identifica 3-5 procesos del cliente que se pueden automatizar.\nEjemplos: respuesta a consultas frecuentes, alta de leads, seguimientos.\nPresentar opciones priorizadas por impacto/facilidad.	TODO	MEDIA	{semana-2,dia-5,automatizacion,procesos}	{"dia": 5, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:06.611	2026-03-31 15:40:06.611	\N	\N	\N	\N	f	\N	{}
ffd7b826-67f4-488a-8bbf-d6bb894512ec	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📱 Primera acción en redes sociales del cliente	Enzo publica primer contenido en RRSS del cliente (LinkedIn, Instagram, etc.).\nCoordinar timing con Carlos para máximo alcance.\nMedir engagement inicial y ajustar estrategia.	TODO	ALTA	{semana-3,dia-5,social-media,contenido}	{"dia": 5, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:10.352	2026-03-31 15:40:10.352	\N	\N	\N	\N	f	\N	{}
69674e0a-66ec-4157-b079-aac530e312c3	cmn3je5zq0000e31xg8wru9iy	cmndh3yet0001r915hh6etshs	✅ QA de todas las automatizaciones implementadas	Valeria revisa que todas las automatizaciones funcionan correctamente.\n- Emails se envían correctamente\n- No hay bucles infinitos\n- Los triggers son los correctos\nReportar errores a Elena o Carlos según corresponda.	TODO	MEDIA	{semana-3,dia-6,qa,automatizacion}	{"dia": 6, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:10.84	2026-03-31 15:40:10.84	\N	\N	\N	\N	f	\N	{}
4726f7b1-5456-4877-bb45-cc348823964a	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📧 Primera campaign de email o contenido	Enzo lanza primera campaign de contenido:\n- Email newsletter a lista de leads, o\n- Artículo viral en blog/RRSS.\nMedir CTR, conversiones, engagement.	TODO	ALTA	{semana-4,dia-3,marketing,campaign}	{"dia": 3, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:12.629	2026-03-31 15:40:12.629	\N	\N	\N	\N	f	\N	{}
2b5d684d-74c2-4c93-a2da-20a5e0ce5b2c	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📋 Recopilar y clasificar feedback de primeras semanas	Laura revisa todos los feedbacks recibidos de clientes/usuarios.\nClasificar por: bug, feature request, mejora UX, contenido.\nPresentar a Paco con priorización clara.	COMPLETED	ALTA	{semana-3,dia-2,feedback,soporte}	{"dia": 2, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:08.889	2026-03-31 15:40:08.889	\N	\N	Ejecutado por Laura. No hay Feedback ni Emails en el sistema todavía. MyCompi en fase inicial.	\N	f	\N	{}
071879cc-b35c-4e37-9bb1-2afe8582a583	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📊 Seguimiento de outreach: responder a los leads activos	Carlos hace seguimiento de los leads contactados.\nResponder a las respuestas recibidas con información adicional.\nRegistrar estado de cada lead en el sistema.	COMPLETED	ALTA	{semana-2,dia-6,outreach,seguimiento}	{"dia": 6, "semana": 2, "recurrente": false}	\N	\N	\N	2026-04-01 04:08:01.869	2026-03-31 15:40:07.099	2026-03-31 15:40:07.099	\N	\N	\N	\N	f	\N	{}
5970ff21-64cf-45fc-b4c9-6a0aa421f1c1	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📧 Outreach de segunda ronda: 10 leads adicionales	Carlos identifica y contacta 10 leads nuevos si los primeros no responden.\nPriorizar leads con mayor probabilidad de conversión.\nEscalar outreach si hay respuesta positiva de los primeros.	COMPLETED	MEDIA	{semana-3,dia-4,outreach,leads}	{"dia": 4, "semana": 3, "recurrente": false}	\N	\N	\N	2026-04-01 12:35:33.968	2026-03-31 15:40:09.864	2026-04-01 12:35:33.968	\N	\N	\N	\N	f	\N	{}
5a012266-a816-4afc-8873-f609c8ef59f1	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🔧 Implementar top 2 features del feedback	Marcos implementa las 2 features con mayor demanda del feedback.\nPriorizar las que tienen mayor impacto en conversión/retención.\n QA con Valeria antes de delivery al cliente.	COMPLETED	ALTA	{semana-4,dia-3,desarrollo,features}	{"dia": 3, "semana": 4, "recurrente": false}	{"nota": "No feedback data available. interaccionChat table is empty for March 2026. Job skipped - no features to implement from feedback.", "trabajo_id": "5a012266-a816-4afc-8873-f609c8ef59f1"}	\N	\N	2026-04-04 09:42:05.969	2026-03-31 15:40:13.116	2026-03-31 15:40:13.116	\N	\N	\N	\N	f	\N	{}
8c0d58b9-27ee-4148-a210-956a41380edc	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Configurar inbox de soporte y respuestas automáticas	Laura configura la bandeja de entrada de soporte del cliente.\nRespuestas automáticas para: consulta recibida, fuera de horario, vacaciones.\nPlantillas de respuesta para las 5 dudas más frecuentes del sector.	COMPLETED	MEDIA	{semana-2,dia-3,soporte,automatizacion}	{"dia": 3, "semana": 2, "recurrente": false}	{"resumen": "Configurada bandeja de entrada, 3 respuestas automáticas y 5 plantillas FAQ para AlberBEE", "outputFile": "8c0d58b9_inbox-soporte.md"}	\N	\N	2026-04-04 00:41:49.007	2026-03-31 15:40:05.632	2026-04-04 00:40:40.164	\N	\N	\N	\N	f	\N	{}
87ec251b-8127-4b6a-be93-7027f244214c	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	💰 Evaluar si procede campaign de Meta Ads o LinkedIn Ads	Elena evalúa si una campaign de pago tiene sentido para el cliente.\nCriterios: presupuesto disponible, target en RRSS, capacidad de conversión.\nSi procede: propuesta de campaign pequeño (€10-20/día) para test.	TODO	MEDIA	{semana-4,dia-5,ads,evaluacion}	{"dia": 5, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:14.093	2026-03-31 15:40:14.093	\N	\N	\N	\N	f	\N	{}
6ae16796-2ece-413c-b647-00abb1671497	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	✍️ Crear y publicar contenido (RRSS o blog)	Enzo crea y publica contenido 3 veces por semana.\nPueden ser: posts de LinkedIn, tweets, artículos de blog, newsletters.\nMedir engagement y ajustar tipo de contenido según resultados.	TODO	MEDIA	{recurrente,3x-semana,contenido,marketing}	{"dia": 0, "semana": 0, "recurrente": "3x-semana"}	\N	\N	\N	\N	2026-03-31 15:40:16.377	2026-03-31 15:40:16.377	\N	\N	\N	\N	f	\N	{}
4575c343-f979-4f71-a67c-b64e7158dcdb	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	⚙️ Revisar y optimizar automatizaciones	Elena revisa las automatizaciones activas:\n- ¿Siguen funcionando correctamente?\n- ¿Algún leads que se ha caído del funnel?\n- ¿Nueva automatización que se puede añadir?\nPresentar mejoras a Paco para aprobación.	TODO	MEDIA	{recurrente,semanal,automatizacion,optimizacion}	{"dia": 0, "semana": 0, "recurrente": "semanal"}	\N	\N	\N	\N	2026-03-31 15:40:17.354	2026-03-31 15:40:17.354	\N	\N	\N	\N	f	\N	{}
3cbe38f5-12de-4186-97a1-5d64e8364dc0	cmn3je5zq0000e31xg8wru9iy	cmndh3yet0001r915hh6etshs	🔍 Auditoría de calidad: revisar outputs de agentes	Valeria hace auditoría semanal de outputs:\n- ¿Los emails de Carlos son profesionales?\n- ¿El contenido de Enzo está alineado con el brand voice?\n- ¿Las respuestas de Laura son correctas?\nReportar a cada agente con feedback de mejora.	TODO	MEDIA	{recurrente,semanal,qa,auditoria}	{"dia": 0, "semana": 0, "recurrente": "semanal"}	\N	\N	\N	\N	2026-03-31 15:40:17.841	2026-03-31 15:40:17.841	\N	\N	\N	\N	f	\N	{}
88ff44d2-7be6-44fd-98f5-3db439353019	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Resumen semana 1 + plan semana 2	Paco envía al cliente un resumen de la semana 1: qué se ha hecho, qué funciona, qué necesita decisión del cliente. Presentar plan de la semana 2 y pedir validación.	TODO	ALTA	{semana-1,dia-7,resumen,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f	\N	{}
d48eebd6-8578-4346-879b-59cc41d5ed84	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Resumen semana 2 + informe de leads	Paco envía resumen de la semana 2: Leads contactados y estados, contenido publicado, análisis competitivo, próximos pasos para semana 3	TODO	ALTA	{semana-2,dia-7,resumen,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f	\N	{}
30af492c-58d8-4b39-aae1-b188cf15625c	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Resumen semana 3 + informe de métricas	Paco envía resumen de la semana 3: Métricas de uso y retención, feedback clasificado, features implementadas, propuesta de plan para semana 4	TODO	ALTA	{semana-3,dia-7,resumen,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f	\N	{}
bcdd939b-7679-4877-a92c-945532fedb22	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	🎉 Resumen mes 1 + plan mes 2	Paco envía al cliente el resumen completo del primer mes: qué se ha logrado, métricas finales, lecciones aprendidas, plan para el mes 2 con nuevas prioridades. Preguntar si quiere escalar, ajustar o mantener.	TODO	ALTA	{semana-4,dia-7,resumen,cliente,mes-completo}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f	\N	{}
8d6f1b3d-6b81-4d79-852a-55bd5263f51f	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Briefing diario: resumir el día al cliente	Paco envía al cliente un resumen cada mañana: qué se ha hecho el día anterior, qué se va a hacer hoy, si necesita alguna decisión o input del cliente. Mantener al cliente informado sin saturar.	TODO	ALTA	{recurrente,diario,briefing,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f	\N	{}
4549e1b2-b8d8-4888-aa47-d7d19ee4d3ff	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	🎯 Outreach: buscar 1 lead nuevo de calidad	Carlos identifica y contacta al menos 1 lead nuevo cada día.\nInvestigar empresa, personalizar mensaje, registrar en sistema.\nSeguimiento de los leads de días anteriores.	COMPLETED	ALTA	{recurrente,diario,ventas,leads}	{"dia": 0, "semana": 0, "recurrente": "diario"}	\N	\N	\N	2026-04-01 04:08:01.863	2026-03-31 15:40:15.883	2026-03-31 15:40:15.883	\N	\N	\N	\N	f	\N	{}
4c1d6e1f-96c9-4172-bd44-15b6790b11ba	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Análisis de canal de adquisición con mejores resultados	Diana analiza qué canal de adquisición funciona mejor para el cliente.\nPresentar: coste por lead, conversión por canal, ROI estimado.\nDecisión: ¿en qué canal invertir más?	COMPLETED	MEDIA	{semana-4,dia-4,metrics,adquisicion}	{"dia": 4, "semana": 4, "recurrente": false}	{"resumen": "Sin datos de tracking de acquisition. 1 cliente real sin canal registrado.", "reportPath": "agents/diana/reports/canal-adquisicion-2026-04-01.md"}	\N	\N	2026-04-01 04:36:55.446	2026-03-31 15:40:13.605	2026-04-01 04:36:55.446	\N	\N	\N	\N	f	\N	{}
2a43e7e1-9690-487c-8e3d-dcb467bbe6d7	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Generar reporte semanal de métricas	Diana genera reporte semanal con:\n- Actividad de la semana (contenido, outreach, soporte)\n- Métricas de uso y engagement\n- Tendencias vs semana anterior\n- Recomendaciones para la siguiente semana	COMPLETED	MEDIA	{recurrente,semanal,metrics,reporte}	{"dia": 0, "semana": 0, "recurrente": "semanal"}	{"resumen": "MRR €49, 1 cliente activo, engagement cero, sin acquisition tracking", "reportPath": "agents/diana/reports/reporte-semanal-2026-04-01.md"}	\N	\N	2026-04-01 04:37:43.607	2026-03-31 15:40:16.865	2026-04-01 04:37:43.607	\N	\N	\N	\N	f	\N	{}
3186358b-5a88-4d4d-bd95-f323f29e7747	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Revisión de satisfacción del cliente mes 1	Laura envía survey de satisfacción al cliente.\nPreguntar: qué ha funcionado, qué no, qué quiere para el mes 2.\nPresentar resultados a Paco para planificar siguiente mes.	COMPLETED	MEDIA	{semana-4,dia-6,soporte,feedback}	{"dia": 6, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:14.583	2026-04-04 04:21:46.385	\N	\N	\N	\N	f	\N	{}
fe8072aa-4831-48ba-af6b-a05d7cd6ddfd	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Atender emails de soporte entrantes	Laura revisa y responde emails de soporte del cliente.\nClasificar por urgencia: urgente (responder hoy), normal (24h), info (48h).\nEscalar a Carlos o Elena si es comercial o operacional.	COMPLETED	ALTA	{recurrente,diario,soporte}	{"dia": 0, "semana": 0, "recurrente": "diario"}	\N	\N	\N	\N	2026-03-31 15:40:15.395	2026-04-03 12:47:02.477	\N	\N	\N	\N	f	\N	{}
08e215da-2e6b-4090-a1fd-916e7be10055	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	🤖 Implementar primera automatización de proceso	Elena implementa la automatización de mayor impacto identificada.\nEjemplo: email automático de bienvenida a nuevos leads, recordatorios, follow-ups.\nCoordinar con Carlos para integrarlo en su flujo de ventas.	IN_PROGRESS	CRITICA	{semana-3,dia-1,automatizacion,proceso}	{"dia": 1, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:07.914	2026-04-03 15:36:23.599	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:22.853202+00	Aprobado por Alberto — ejecuten	\N	t	\N	{}
375fd111-7d3b-4012-9da8-612f8d4e4a27	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📋 Revisar docs de onboarding y validar plan con cliente	Revisar los documentos creados por Diana (Misión, Research). Confirmar con el cliente que la información es correcta. Ajustar si hay errores o missing info. Preparar el briefing para el resto del equipo.	TODO	ALTA	{semana-1,dia-1,onboarding,briefing}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	cmn3je6040002e31xi99h82gd	2026-03-31 18:55:13.523785+00	test	\N	f	\N	{}
25b4e9b3-892f-4a0f-8760-b1d7d9dac925	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📧 Preparar emailing de bienvenida para el cliente	Crear email de bienvenida formal para el cliente: resumen del onboarding,\nequipo asignado, próximos pasos, datos de contacto.\nCoordinar con Laura para que se envíe desde la plataforma.	COMPLETED	CRITICA	{semana-1,dia-4,email,bienvenida}	{"dia": 4, "semana": 1, "recurrente": false}	\N	\N	\N	2026-03-31 22:06:36.931	2026-03-31 15:40:00.906	2026-03-31 15:40:00.906	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:21.063267+00	Aprobado por Alberto — ejecuten	\N	t	\N	{"qa_aprobado": {"score": 100, "checks": [{"id": "titulo", "passed": true}, {"id": "descripcion", "passed": true}, {"id": "tono", "passed": true}], "status": "APPROVED", "revisor": "Valeria", "timestamp": "2026-04-10T18:56:05.584Z"}}
940617b5-23f8-473f-a77a-67f0451344b0	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📢 Testear canal de adquisición: LinkedIn o email	Enzo testa 1-2 canales de adquisición para el cliente.\nOpción A: LinkedIn — contenido orgánico + networking.\nOpción B: Email marketing — newsletter o secuencias.\nMedir resultados y presentar a Paco qué canal funciona mejor.	TODO	CRITICA	{semana-4,dia-1,growth,adquisicion}	{"dia": 1, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:11.652	2026-03-31 15:40:11.652	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:23.815647+00	Aprobado por Alberto — ejecuten	\N	t	\N	{}
2d7f1390-380d-4ca9-a95c-7bfa77a3df9b	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🚀 Implementar features solicitadas por early adopters	Marcos implementa las 2-3 features prioritarias identificadas en feedback.\nSi no hay feedback aún: mejorar rendimiento, UX del MVP existente.\nNotificar a Valeria para QA antes de delivery.	COMPLETED	ALTA	{semana-3,dia-2,desarrollo,features}	{"dia": 2, "semana": 3, "recurrente": false}	{"nota": "No hay feedback de early adopters disponible en BD. Mejoras aplicadas según spec: rendimiento, SEO técnico, UX.", "build-verified": true, "trabajo-completado": "2d7f1390-380d-4ca9-a95c-7bfa77a3df9b", "mejoras-implementadas": [{"tipo": "service-worker", "descripcion": "Service Worker con estrategia cache-first para assets, network-first para HTML. Caching offline de la landing page."}, {"tipo": "seo-technique", "descripcion": "Preload de imagen LCP (dashboard.jpg) para mejorar Largest Contentful Paint."}, {"tipo": "seo-content", "descripcion": "sitemap.xml actualizado a 2026-04-03 con URLs completas del portal (contratacion, login, registro, checkout)."}, {"tipo": "rendimiento", "descripcion": "CSS class .content-visibility-auto añadido para skip rendering de contenido off-screen."}]}	\N	\N	2026-04-04 09:40:52.259	2026-03-31 15:40:08.401	2026-04-03 11:46:34.901	\N	\N	\N	\N	f	\N	{}
40cc9a98-1af5-4a52-a90c-07409e47aa87	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	🎯 Escalar outreach si hay respuesta positiva	Si los emails fríos tienen respuesta >5%:\n- Carlos escala outreach a 20-30 leads adicionales.\n- Personalizar secuencias de follow-up.\nSi no hay respuesta: pivota a otro canal (recomendar por Enzo).	COMPLETED	CRITICA	{semana-4,dia-2,outreach,leads}	{"dia": 2, "semana": 4, "recurrente": false}	\N	\N	\N	2026-04-01 12:35:16.621	2026-03-31 15:40:12.14	2026-04-01 12:35:16.621	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:24.281455+00	Aprobado por Alberto — ejecuten	\N	t	\N	{"qa_aprobado": {"score": 100, "checks": [{"id": "titulo", "passed": true}, {"id": "descripcion", "passed": true}, {"id": "tono", "passed": true}], "status": "APPROVED", "revisor": "Valeria", "timestamp": "2026-04-10T18:56:05.567Z"}}
a250d678-02c3-46b4-a700-cf2efc75ca73	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📈 Primer reporte de métricas: retención y uso	Diana genera el primer reporte de métricas real del cliente:\n- Tasa de retención\n- Conversaciones por usuario\n- Drop-off points\n- Leads generados por canal\nPresentar a Paco para ajustar estrategia de la semana 4.	COMPLETED	CRITICA	{semana-3,dia-3,metrics,reporte}	{"dia": 3, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:09.376	2026-03-31 15:40:09.376	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:23.330521+00	Aprobado por Alberto — ejecuten	\N	t	\N	{"qa_aprobado": {"score": 100, "checks": [{"id": "titulo", "passed": true}, {"id": "descripcion", "passed": true}, {"id": "completo", "passed": true}], "status": "APPROVED", "revisor": "Valeria", "timestamp": "2026-04-10T18:56:05.576Z"}}
1c5eaaed-365f-4832-89fe-92fd213485c5	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Análisis competitivo: 3-5 competidores directos	Diana hace un análisis profundo de 3-5 competidores del cliente.\nPara cada uno: propuesta de valor, precio, canales, puntos fuertes/débiles.\nGenerar reporte con fortalezas y debilidades.\nPresentar a Paco para ajustar estrategia.	COMPLETED	CRITICA	{semana-2,dia-4,competencia,research}	{"dia": 4, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:06.124	2026-03-31 15:40:06.124	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:22.041265+00	Aprobado por Alberto — ejecuten	\N	t	\N	{"qa_aprobado": {"score": 100, "checks": [{"id": "titulo", "passed": true}, {"id": "descripcion", "passed": true}, {"id": "completo", "passed": true}], "status": "APPROVED", "revisor": "Valeria", "timestamp": "2026-04-10T18:56:05.578Z"}}
5717edc9-9843-476a-bf76-70dd41900e76	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	🎯 Outreach: identificar 10 leads en sector del cliente	Carlos investiga y identifica 10 early adopters potenciales en el sector del cliente.\nCriterios: empresas del tamaño correcto, necesidad clara, capacidad de pago.\nGuardar en documento compartido: nombre, empresa, email, razón interés potencial.	COMPLETED	CRITICA	{semana-2,dia-1,outreach,leads}	{"dia": 1, "semana": 2, "recurrente": false}	{"leads": 10, "fichero": "5717edc9-9843-476a-bf76-70dd41900e76-leads.json"}	\N	\N	2026-03-31 20:37:17.202	2026-03-31 15:40:03.678	2026-03-31 15:40:03.678	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:21.574865+00	Aprobado por Alberto — ejecuten	\N	t	\N	{"qa_aprobado": {"score": 100, "checks": [{"id": "titulo", "passed": true}, {"id": "descripcion", "passed": true}, {"id": "tono", "passed": true}], "status": "APPROVED", "revisor": "Valeria", "timestamp": "2026-04-10T18:56:05.582Z"}}
6e00f6b1-d006-4c17-a9ae-7d09d8fccc81	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	🔍 Investigar empresa, sector y competencia	Investigar la empresa del cliente: sector, modelo de negocio, competencia directa e indirecta.\nInvestigar tendencias del sector y mejores prácticas.\nCrear documento de Misión del cliente (tipo: MISION).\nCrear documento de Investigación de competencia (tipo: USER_RESEARCH).\n OUTPUT: 2 documentos guardados en BD.	COMPLETED	CRITICA	{semana-1,dia-1,onboarding,investigacion}	{"dia": 1, "semana": 1, "recurrente": false}	{"docs": ["Investigación de empresa/sector/competencia guardada en /agents/diana/jobs/job_6e00f6b1_investigacion_empresa.md"]}	\N	\N	2026-04-01 01:38:48.224	2026-03-31 15:39:58.11	2026-03-31 15:39:58.11	cmn3je6040002e31xi99h82gd	2026-03-31 18:58:34.853941+00	OK test	\N	t	\N	{"qa_aprobado": {"score": 100, "checks": [{"id": "titulo", "passed": true}, {"id": "descripcion", "passed": true}, {"id": "completo", "passed": true}], "status": "APPROVED", "revisor": "Valeria", "timestamp": "2026-04-10T18:56:05.585Z"}}
\.


--
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public."Usuario" (id, "clienteId", nombre, email, "passwordHash", rol, idioma, timezone, "ultimoAcceso", activo, "createdAt", "updatedAt", rol_platform) FROM stdin;
cmnh4nxx4000agn1w1g7e9xg6	cmnh4nxww0008gn1wiluvj9wk	Test E2E	test-e2e-1775113361@test.com	$2a$12$iv9wK70z49Vov01YHbxEt.AR4jSWevRgHUMXVLtWGKqe9S/ggkNnm	OWNER	es	Europe/Madrid	2026-04-02 07:02:55.537	t	2026-04-02 07:02:44.344	2026-04-02 07:02:55.538	CLIENT
cmnh4oykf000dgn1wrwcnu4ml	cmnh4oykc000bgn1wen6wmarh	Test E2E	test-e2e-1775113409589@test.com	$2a$12$evR6v9C/13KaBGtZF5uU3uOgC/EgV2lZLV1qOi9.e0Y19aKjBeXqe	OWNER	es	Europe/Madrid	\N	t	2026-04-02 07:03:31.84	2026-04-02 07:03:31.84	CLIENT
cmnh4q2ow000ggn1wrw0p7oiv	cmnh4q2ou000egn1w2znos5qz	Test E2E	test-e2e-1775113461738@test.com	$2a$12$1vJtiulgr7XDMeJz4IDxUuoiHwSm0JzKEFW85BStI.gpoKcMwPZYy	OWNER	es	Europe/Madrid	\N	t	2026-04-02 07:04:23.841	2026-04-02 07:04:23.841	CLIENT
cmnh4qq88000jgn1whhluha3o	cmnh4qq85000hgn1wr57vw439	Test E2E	test-e2e-1775113492220@test.com	$2a$12$1ylDBnvXXp.NoIh5W4GO4e0xi1BzaVGgWGTCxK2E8oO09qEYIGPD.	OWNER	es	Europe/Madrid	2026-04-02 07:04:57.444	t	2026-04-02 07:04:54.344	2026-04-02 07:04:57.445	CLIENT
cmnh4s78d000mgn1w05drajvf	cmnh4s788000kgn1wkpx47bmn	Test E2E	test-e2e-1775113560955@test.com	$2a$12$UVYEWJJ0GebZc1MgYc36BuSVhr2kiXZmbsaxZxFdPXHj4vouJpE8q	OWNER	es	Europe/Madrid	2026-04-02 07:06:05.241	t	2026-04-02 07:06:03.037	2026-04-02 07:06:05.242	CLIENT
cmnh4ssgo000pgn1wfdalp6il	cmnh4ssgd000ngn1w9e0b5s58	Test E2E	test-e2e-1775113588150@test.com	$2a$12$G33yvphM0ME.VlGZQ9V.aeoGY9dBVnsGxJNQa04gMpOL.7blwAnCC	OWNER	es	Europe/Madrid	\N	t	2026-04-02 07:06:30.552	2026-04-02 07:06:30.552	CLIENT
cmnh4tgg7000sgn1wvto30pr7	cmnh4tgg4000qgn1w45s623jo	Test E2E	test-e2e-1775113619436@test.com	$2a$12$Fj3KmO75hJZz2/XmMj2bM.UpeiATJJj7Z3g1JvCHPeS8ifaGzbURO	OWNER	es	Europe/Madrid	\N	t	2026-04-02 07:07:01.64	2026-04-02 07:07:01.64	CLIENT
cmnh4tvne000vgn1w6vqudhlo	cmnh4tvnb000tgn1wwgi6vtnm	Test E2E	test-e2e-1775113639208@test.com	$2a$12$qdmOja3G0jJ9oTcZ7vavseNKtts805GHbeTR53Li1jZypQmaJZt0O	OWNER	es	Europe/Madrid	\N	t	2026-04-02 07:07:21.338	2026-04-02 07:07:21.338	CLIENT
cmn77j4yl0004b41eeyujiax5	cmn77j4yd0002b41efmeyg8o1	Test User	test@mycompi.com	$2a$12$cePrV3p9H876OKJ/x2V/Beo2ZleyPHdbtXddN4HpU3XNUZ776AwCe	OWNER	es	Europe/Madrid	\N	t	2026-03-26 08:25:17.277	2026-03-26 08:25:17.277	CLIENT
cmn77tmuy0006e81eyyjv2db9	cmn77tmsh0004e81e667qlyks	Test2	test2@mycompi.com	$2a$12$31LuVbTV/MgfKVjZfeHqOeb7gc/zx50W9gL0AlEj3MmnlREFhRRJu	OWNER	es	Europe/Madrid	\N	t	2026-03-26 08:33:27.034	2026-03-26 08:33:27.034	CLIENT
cmn7fddco0002ew1ef6hhbmqc	cmn7fddc60000ew1e76drd41a	Test Paco	testpaco_1774526683@test.com	$2a$12$7dlyEtUSlIhho4BDfDivEekDDEel.v8RyQGvCL4QXSxRRs0sdHoRe	OWNER	es	Europe/Madrid	2026-03-26 12:30:23.712	t	2026-03-26 12:04:45.144	2026-03-26 12:30:23.713	CLIENT
cmn7jgl5n0002j41ea3gkqjv0	cmn7jgl500000j41enpnhqa2z	tester bee	appmycompi@gmail.com	$2a$12$iVV0JLjS0DDzAcEu0se.HuMF.56rzNmcLSibclRvtRPZidLmlaVdS	OWNER	es	Europe/Madrid	\N	t	2026-03-26 13:59:13.691	2026-03-26 13:59:13.691	CLIENT
cmn7jjmjo0005j41ei31rpu2p	cmn7jjmjm0003j41ekknkwjzf	Test Alberto	testalberto_1774533693@gmail.com	$2a$12$VpkV3Qz/VuIFumBlOj0geODGyo6V8UzL6k4NVp1tCD7SUwwVtxQVa	OWNER	es	Europe/Madrid	\N	t	2026-03-26 14:01:35.461	2026-03-26 14:01:35.461	CLIENT
cmnh4v8vi000ygn1w5t1dd8u0	cmnh4v8t3000wgn1wbf1znk11	Test E2E	test-e2e-1775113702748@test.com	$2a$12$c5M6PxvPDKS0XJ8AuycKpuFOGUhl8s8SEwDikSqnJbGMoMUon9Kwe	OWNER	es	Europe/Madrid	2026-04-02 07:08:27.243	t	2026-04-02 07:08:25.135	2026-04-02 07:08:27.244	CLIENT
cmnbhljmg0002f01xcxdqljtd	cmnbhljm70000f01x9jbyuea1	alberBEE	albertogala@beenocode.com	$2a$12$nFgiPKUYankLo6rKITSO5OWN8qvKVyWm6sP4AbruMr69jskS9/T1K	OWNER	es	Europe/Madrid	\N	t	2026-03-29 08:18:10.457	2026-03-29 08:18:10.457	CLIENT
cmnbz84zw0002i81eauh3sep4	cmnbz84yf0000i81e9n51vef8	Test User	test_paco@mycompi.com	$2a$12$/0YUavpQyiglr0IXOfjnF.9b2b3qnirnEw5KpUGmWK3/03Yb2wxJm	OWNER	es	Europe/Madrid	\N	t	2026-03-29 16:31:38.06	2026-03-29 16:31:38.06	CLIENT
cmnc3bxec0002g81eguka0k73	cmnc3bxds0000g81e1plhkg46	VANESA 	vanesamartinherrera@gmail.com	$2a$12$K6wZ.slzLzZgGvS.ufKDY.E41YWI/LvS6zVPTamd2TwAy00oHF8su	OWNER	es	Europe/Madrid	\N	t	2026-03-29 18:26:33.3	2026-03-29 18:26:33.3	CLIENT
cmnh59k7i0002fq1xl55l2g0s	cmnh59k760000fq1x0dr5pedx	Test E2E	test-e2e-1775114370164@test.com	$2a$12$SRy7yC0px8qWtRlbkbS1b.XCZZnbBPj0zidZ65VJXaQkgps4XWMUK	OWNER	es	Europe/Madrid	2026-04-02 07:19:35.098	t	2026-04-02 07:19:33.006	2026-04-02 07:19:35.099	CLIENT
cmneo7cu60002dz1wr587di10	cmneo7cu00000dz1wdl77hf64	Empresa Test SL	test_1774964781@test.com	$2a$12$1pDin3W.tN7O9S4aRTZFvOW7/NwBYU8Cf5pFXy5nYc8k2G5xU1ICK	OWNER	es	Europe/Madrid	\N	t	2026-03-31 13:46:24.319	2026-03-31 13:46:24.319	CLIENT
cmnh5ecl10005fq1x7m1161aq	cmnh5eckw0003fq1x00pe8jmw	Test E2E	test-e2e-1775114594283@test.com	$2a$12$J3s7k9ClClvHvE7icq9naeXgc4/oyTwoS6a58z4s2ezi/8sjyCFBi	OWNER	es	Europe/Madrid	2026-04-02 07:23:18.593	t	2026-04-02 07:23:16.406	2026-04-02 07:23:18.594	CLIENT
cmnh5wrp1000efq1x4l36nbd0	cmnh5wror000cfq1xe8sydndo	Test E2E	test-e2e-1775115453503@test.com	$2a$12$OaMvr.wQ3YPZmMQGk3yZbOi2ADnCwgvwPxieKjl9nxtasIGBGlh.i	OWNER	es	Europe/Madrid	2026-04-02 07:37:37.999	t	2026-04-02 07:37:35.798	2026-04-02 07:37:38	CLIENT
cmn3je6040002e31xi99h82gd	cmn3je5zq0000e31xg8wru9iy	AlberBEE	beenocode@gmail.com	$2a$10$iGHMwnjPO40ukWKvAkJbseTZXCa8.VAcLspIAZrrn44h6eOKvUZHG	OWNER	es	Europe/Madrid	2026-04-11 06:05:40.997	t	2026-03-23 18:46:16.036	2026-04-11 06:05:40.998	ADMIN
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mycompi
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d125ebf1-4c79-4130-8b60-0daf1123620b	10385d1f052955ec75b63111cdd0de63e86de128e801d80c0d8af7ef70f414b9	2026-03-19 12:29:56.758389+00	20260319122950_init	\N	\N	2026-03-19 12:29:51.064228+00	1
afab5906-49cb-4c0a-9efc-9b76fd7adaef	ac553d82fdf6f9ee0b9b0e077583c642651ef285e6c3cb2e8d30ec900924d30e	2026-03-23 18:08:53.890023+00	20260323180852_add_rol_platform	\N	\N	2026-03-23 18:08:53.050004+00	1
e37f6aa3-9b8b-49e9-a797-1be988e9f9cd	b737187aaa0d8571c39c77fe8f0b5bfb08bb7a3050963644e53e15a6e2a26ba8	\N	20260330173600_add_activation_token	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260330173600_add_activation_token\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "ActivationToken" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"ActivationToken\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1160), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260330173600_add_activation_token"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260330173600_add_activation_token"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-04-02 07:40:59.815445+00	2026-03-31 23:06:20.471009+00	0
b1bae343-8cdc-4b56-8401-4619ff23eedd	b737187aaa0d8571c39c77fe8f0b5bfb08bb7a3050963644e53e15a6e2a26ba8	\N	20260330173600_add_activation_token	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260330173600_add_activation_token\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "ActivationToken" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"ActivationToken\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1160), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260330173600_add_activation_token"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260330173600_add_activation_token"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-04-03 17:49:45.672865+00	2026-04-03 17:49:10.313881+00	0
3254615d-5934-4eb8-b356-e4c4e8951980	b737187aaa0d8571c39c77fe8f0b5bfb08bb7a3050963644e53e15a6e2a26ba8	2026-04-03 17:49:45.999771+00	20260330173600_add_activation_token		\N	2026-04-03 17:49:45.999771+00	0
\.


--
-- Name: ActivationToken ActivationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."ActivationToken"
    ADD CONSTRAINT "ActivationToken_pkey" PRIMARY KEY (id);


--
-- Name: AgentLearning AgentLearning_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."AgentLearning"
    ADD CONSTRAINT "AgentLearning_pkey" PRIMARY KEY (id);


--
-- Name: AgentSkill AgentSkill_agenteId_skillId_key; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."AgentSkill"
    ADD CONSTRAINT "AgentSkill_agenteId_skillId_key" UNIQUE ("agenteId", "skillId");


--
-- Name: AgentSkill AgentSkill_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."AgentSkill"
    ADD CONSTRAINT "AgentSkill_pkey" PRIMARY KEY (id);


--
-- Name: Agente Agente_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Agente"
    ADD CONSTRAINT "Agente_pkey" PRIMARY KEY (id);


--
-- Name: Cliente Cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY (id);


--
-- Name: Documento Documento_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Documento"
    ADD CONSTRAINT "Documento_pkey" PRIMARY KEY (id);


--
-- Name: Email Email_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Email"
    ADD CONSTRAINT "Email_pkey" PRIMARY KEY (id);


--
-- Name: Feedback Feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY (id);


--
-- Name: Handoff Handoff_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Handoff"
    ADD CONSTRAINT "Handoff_pkey" PRIMARY KEY (id);


--
-- Name: InteraccionChat InteraccionChat_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."InteraccionChat"
    ADD CONSTRAINT "InteraccionChat_pkey" PRIMARY KEY (id);


--
-- Name: Mensaje Mensaje_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Mensaje"
    ADD CONSTRAINT "Mensaje_pkey" PRIMARY KEY (id);


--
-- Name: Notificacion Notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Notificacion"
    ADD CONSTRAINT "Notificacion_pkey" PRIMARY KEY (id);


--
-- Name: OnboardingRun OnboardingRun_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."OnboardingRun"
    ADD CONSTRAINT "OnboardingRun_pkey" PRIMARY KEY (id);


--
-- Name: OnboardingSequence OnboardingSequence_clienteId_key; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."OnboardingSequence"
    ADD CONSTRAINT "OnboardingSequence_clienteId_key" UNIQUE ("clienteId");


--
-- Name: OnboardingSequence OnboardingSequence_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."OnboardingSequence"
    ADD CONSTRAINT "OnboardingSequence_pkey" PRIMARY KEY (id);


--
-- Name: Pago Pago_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_pkey" PRIMARY KEY (id);


--
-- Name: Skill Skill_key_key; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Skill"
    ADD CONSTRAINT "Skill_key_key" UNIQUE (key);


--
-- Name: Skill Skill_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Skill"
    ADD CONSTRAINT "Skill_pkey" PRIMARY KEY (id);


--
-- Name: TeamHealth TeamHealth_agenteId_semana_key; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."TeamHealth"
    ADD CONSTRAINT "TeamHealth_agenteId_semana_key" UNIQUE ("agenteId", semana);


--
-- Name: TeamHealth TeamHealth_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."TeamHealth"
    ADD CONSTRAINT "TeamHealth_pkey" PRIMARY KEY (id);


--
-- Name: Trabajo Trabajo_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ActivationToken_email_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "ActivationToken_email_idx" ON public."ActivationToken" USING btree (email);


--
-- Name: ActivationToken_token_key; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE UNIQUE INDEX "ActivationToken_token_key" ON public."ActivationToken" USING btree (token);


--
-- Name: Agente_email_key; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE UNIQUE INDEX "Agente_email_key" ON public."Agente" USING btree (email);


--
-- Name: Agente_workerId_key; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE UNIQUE INDEX "Agente_workerId_key" ON public."Agente" USING btree ("workerId");


--
-- Name: AuditLog_accion_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "AuditLog_accion_idx" ON public."AuditLog" USING btree (accion);


--
-- Name: AuditLog_agenteid_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "AuditLog_agenteid_idx" ON public."AuditLog" USING btree (agenteid);


--
-- Name: AuditLog_clienteid_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "AuditLog_clienteid_idx" ON public."AuditLog" USING btree (clienteid);


--
-- Name: AuditLog_createdat_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "AuditLog_createdat_idx" ON public."AuditLog" USING btree (createdat);


--
-- Name: Cliente_email_key; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE UNIQUE INDEX "Cliente_email_key" ON public."Cliente" USING btree (email);


--
-- Name: Cliente_slug_key; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE UNIQUE INDEX "Cliente_slug_key" ON public."Cliente" USING btree (slug);


--
-- Name: Email_messageId_key; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE UNIQUE INDEX "Email_messageId_key" ON public."Email" USING btree ("messageId");


--
-- Name: OnboardingSequence_clienteId_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "OnboardingSequence_clienteId_idx" ON public."OnboardingSequence" USING btree ("clienteId");


--
-- Name: TokenUsage_agenteid_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "TokenUsage_agenteid_idx" ON public."TokenUsage" USING btree (agenteid);


--
-- Name: TokenUsage_clienteid_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "TokenUsage_clienteid_idx" ON public."TokenUsage" USING btree (clienteid);


--
-- Name: TokenUsage_createdat_idx; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE INDEX "TokenUsage_createdat_idx" ON public."TokenUsage" USING btree (createdat);


--
-- Name: Usuario_email_key; Type: INDEX; Schema: public; Owner: mycompi
--

CREATE UNIQUE INDEX "Usuario_email_key" ON public."Usuario" USING btree (email);


--
-- Name: Agente Agente_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Agente"
    ADD CONSTRAINT "Agente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Documento Documento_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Documento"
    ADD CONSTRAINT "Documento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Email Email_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Email"
    ADD CONSTRAINT "Email_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InteraccionChat InteraccionChat_agenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."InteraccionChat"
    ADD CONSTRAINT "InteraccionChat_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES public."Agente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InteraccionChat InteraccionChat_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."InteraccionChat"
    ADD CONSTRAINT "InteraccionChat_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Mensaje Mensaje_agenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Mensaje"
    ADD CONSTRAINT "Mensaje_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES public."Agente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OnboardingSequence OnboardingSequence_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."OnboardingSequence"
    ADD CONSTRAINT "OnboardingSequence_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Pago Pago_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trabajo Trabajo_agenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES public."Agente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trabajo Trabajo_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trabajo Trabajo_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Trabajo"(id) ON DELETE SET NULL;


--
-- Name: Usuario Usuario_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mycompi
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 7Y1xeQoQ5egZiGMst9yBOLHkD2qmftfnAkVVHvQjEy03OTSRlpSpoliBnFbWhvb

