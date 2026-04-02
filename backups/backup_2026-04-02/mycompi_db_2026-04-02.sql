--
-- PostgreSQL database dump
--

\restrict xUE5q7MjafaUHpch7rcg4p20Yis8B6ndAkYy8K7ITAouIaRmwtcrckDE7xaQi0t

-- Dumped from database version 17.8 (a284a84)
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoAgente; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EstadoAgente" AS ENUM (
    'ACTIVO',
    'DESCANSANDO',
    'OFFLINE'
);


ALTER TYPE public."EstadoAgente" OWNER TO neondb_owner;

--
-- Name: EstadoChat; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EstadoChat" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."EstadoChat" OWNER TO neondb_owner;

--
-- Name: EstadoEmail; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EstadoEmail" AS ENUM (
    'RECIBIDO',
    'PROCESANDO',
    'RESPONDIDO',
    'FALLIDO'
);


ALTER TYPE public."EstadoEmail" OWNER TO neondb_owner;

--
-- Name: EstadoPago; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EstadoPago" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."EstadoPago" OWNER TO neondb_owner;

--
-- Name: EstadoTrabajo; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EstadoTrabajo" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'BLOCKED'
);


ALTER TYPE public."EstadoTrabajo" OWNER TO neondb_owner;

--
-- Name: Plan; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Plan" AS ENUM (
    'BASICO',
    'EQUIPO',
    'DIRECCION',
    'COMPLETO'
);


ALTER TYPE public."Plan" OWNER TO neondb_owner;

--
-- Name: Prioridad; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Prioridad" AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);


ALTER TYPE public."Prioridad" OWNER TO neondb_owner;

--
-- Name: Rol; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Rol" AS ENUM (
    'OWNER',
    'USUARIO',
    'VIEWER'
);


ALTER TYPE public."Rol" OWNER TO neondb_owner;

--
-- Name: RolPlatform; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."RolPlatform" AS ENUM (
    'ADMIN',
    'CLIENT'
);


ALTER TYPE public."RolPlatform" OWNER TO neondb_owner;

--
-- Name: TipoAgente; Type: TYPE; Schema: public; Owner: neondb_owner
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


ALTER TYPE public."TipoAgente" OWNER TO neondb_owner;

--
-- Name: TipoDocumento; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TipoDocumento" AS ENUM (
    'MISION',
    'PRODUCTO',
    'BRAND_VOICE',
    'USER_RESEARCH',
    'TECNICO',
    'MEMORIA_AGENTE'
);


ALTER TYPE public."TipoDocumento" OWNER TO neondb_owner;

--
-- Name: TipoMensaje; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TipoMensaje" AS ENUM (
    'MENSAJE',
    'ALERTA',
    'REPORTE',
    'SOLICITUD'
);


ALTER TYPE public."TipoMensaje" OWNER TO neondb_owner;

--
-- Name: TipoNotificacion; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TipoNotificacion" AS ENUM (
    'INFO',
    'WARNING',
    'ERROR',
    'SUCCESS'
);


ALTER TYPE public."TipoNotificacion" OWNER TO neondb_owner;

--
-- Name: TipoPago; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TipoPago" AS ENUM (
    'SUSCRIPCION',
    'EXTRA',
    'META_ADS'
);


ALTER TYPE public."TipoPago" OWNER TO neondb_owner;

--
-- Name: TipoPeticion; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TipoPeticion" AS ENUM (
    'CREAR_CONTENIDO',
    'CONSULTAR_INFO',
    'MODIFICAR_SOLICITUD',
    'QUEJA',
    'ALERTA',
    'OTRO'
);


ALTER TYPE public."TipoPeticion" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivationToken; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."ActivationToken" OWNER TO neondb_owner;

--
-- Name: Agente; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Agente" OWNER TO neondb_owner;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."AuditLog" OWNER TO neondb_owner;

--
-- Name: Cliente; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Cliente" OWNER TO neondb_owner;

--
-- Name: Documento; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Documento" OWNER TO neondb_owner;

--
-- Name: Email; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Email" OWNER TO neondb_owner;

--
-- Name: InteraccionChat; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."InteraccionChat" OWNER TO neondb_owner;

--
-- Name: Mensaje; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Mensaje" OWNER TO neondb_owner;

--
-- Name: Notificacion; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Notificacion" OWNER TO neondb_owner;

--
-- Name: Pago; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Pago" OWNER TO neondb_owner;

--
-- Name: TokenUsage; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."TokenUsage" OWNER TO neondb_owner;

--
-- Name: Trabajo; Type: TABLE; Schema: public; Owner: neondb_owner
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
    "requiereAprobacion" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Trabajo" OWNER TO neondb_owner;

--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Usuario" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: ActivationToken; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ActivationToken" (id, token, email, "expiresAt", used, "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Agente; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
\.


--
-- Data for Name: Cliente; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
\.


--
-- Data for Name: Documento; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Documento" (id, "clienteId", tipo, titulo, contenido, metadata, "createdAt", "updatedAt") FROM stdin;
ac3ac879-ac88-420c-8349-49e6285d3793	cmn3je5zq0000e31xg8wru9iy	MISION	Misión MyCompi / BeeNoCode	# Misión MyCompi / BeeNoCode\n\n**Cliente:** AlberBEE (BeeNoCode)\n**Fecha:** 2026-04-01\n**Agente:** Diana Fabián\n\n## Resumen ejecutivo\n\nBeeNoCode opera MyCompi, una SaaS que vende equipos de 7 Compis agénticos especializados a PYMES españolas por 49€/mes (precio único, sin permanencia). El cliente actual es el propio BeeNoCode, en fase de validación interna.\n\n## Modelo de negocio\n\n- **Producto:** Equipo agéntico (7 especializados) + 1 director (Paco)\n- **Precio:** 49€/mes todo incluido\n- **Mercado:** PYMES españolas que necesitan digitalizarse\n- **Propuesta de valor:** Tu equipo de Compis profesionales por 49€/mes vs ~10.300€/mes de empleados\n\n## Estado actual\n\n- MRR: 98€ (1 cliente real)\n- Clientes registrados: 10 (9 son tests)\n- Usuarios activos: 2\n- Trial activo: 30 días desde 2026-03-31	{"agente": "Diana Fabián"}	2026-04-01 01:40:06.535	2026-04-01 01:40:06.535
a4a1543b-c3f4-4e62-bab2-5cdd5c589e3b	cmn3je5zq0000e31xg8wru9iy	USER_RESEARCH	Research Competencia MyCompi	# Research Competencia MyCompi\n\n**Fecha:** 2026-04-01\n**Agente:** Diana Fabián\n\n## Competidores directos (España)\n\n| Competidor | Web | Propuesta |\n| Nemawashi AI | nemawashi.ai | Automatizaciones y agentes IA para PYMEs |\n| Tur.ia Design | turiadesign.com | Agentes IA para negocio España & LATAM |\n| Qyntix | qyntix.com | IA y software a medida |\n\n## Competidores indirectos\n\nRingover, Zendesk, HubSpot, Talkdesk, noimos AI, MagicBlocks AI\n\n## Diferenciadores MyCompi\n\nPrecio fijo único (49€/mes), 7 agentes especializados vs herramienta puntual, personalidades definidas, sin contratos.\n\n## Debilidades\n\nProducto muy nuevo (marzo 2026), sin case studies, 9/10 clientes son tests, MRR mínimo (98€).	{"agente": "Diana Fabián"}	2026-04-01 01:40:06.873	2026-04-01 01:40:06.873
a8bf23c3-e021-4796-bbbc-aba30d3cead5	cmn3je5zq0000e31xg8wru9iy	MISION	Heartbeat Metrics Snapshot 2026-04-01	{"timestamp":"2026-04-01T02:43:22.647Z","agente":"Diana","mrr":49,"mrr_potencial":490,"clientes_activos":1,"cuentas_totales":10,"cuentas_activas":1,"activation_rate":0.1,"engagement_mensajes":0,"churn_rate":null,"alertas":["MRR_BAJO","ENGAGEMENT_CERO","90_CUENTAS_INACTIVAS"]}	{"tipo": "metrics_snapshot", "agente": "Diana", "source": "heartbeat"}	2026-04-01 02:43:23.91	2026-04-01 02:43:23.91
\.


--
-- Data for Name: Email; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Email" (id, "messageId", de, para, asunto, texto, html, raw, "EstadoEmail", "clienteId", "interaccionId", "respuestaA", "agenteId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InteraccionChat; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InteraccionChat" (id, "clienteId", "agenteId", "tipoPeticion", "mensajeOriginal", resumen, "respuestaAgente", "estadoChat", "streamId", "clienteAcepta", "resultadoExitoso", "createdAt") FROM stdin;
\.


--
-- Data for Name: Mensaje; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Mensaje" (id, "agenteId", "paraAgenteId", contenido, tipo, metadata, leido, "createdAt") FROM stdin;
\.


--
-- Data for Name: Notificacion; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
cmndhwv6q000dip1whdc094qx	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente en cola. Sprint backlog vacío (plantilla). No hay deliverables pendientes de revisión en este ciclo.	f	2026-03-30 18:02:31.01	2026-03-30 18:02:31.011
cmndk203g0009ix1eeck85o3s	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20min — Sin bandeja de entrada configurada localmente. Sin mensajes pendientes. Estado: OK.	f	2026-03-30 19:02:29.191	2026-03-30 19:02:29.936
cmndk20bl000bix1est5xnp5p	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check automático — MyCompi server (puerto 3000) no está corriendo. Solo el gateway de OpenClaw está activo. Sin incidencias críticas nuevas detectadas. El sistema sigue en el mismo estado: 7+ días sin actividad en producción.	f	2026-03-30 19:02:30.178	2026-03-30 19:02:30.179
cmndk20hj000dix1ejnolx8hv	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-30 18:38 UTC. Sin anomalías detectadas. Datos de métricas vacíos (token-logs sin entradas). Sistema en fase inicial sin tracking activo. Confirmo actividad normal.	f	2026-03-30 19:02:30.391	2026-03-30 19:02:30.392
cmndk20ng000fix1e7mkxow2t	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200, SSL OK). Meta tags SEO correctos. sitemap.xml accesible. Sin incidencias ni tareas pendientes de deploy. Research de trends 2026 realizado.	f	2026-03-30 19:02:30.604	2026-03-30 19:02:30.605
cmndm767a0001gm1x7yd4g6m9	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 03:20 MYT. Revisada bandeja de entrada — sin emails pendientes, sin tickets, sin mensajes encolados. Sistema operativo con normalidad.	f	2026-03-30 20:02:30.305	2026-03-30 20:02:30.361
cmndm76f40003gm1xda7iadud	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat nocturno 03:45 MYT — sin incidencias. Sistemas sin logs de error. Sprint backlog vacío. Strategy proposals: Carlos tiene 3 proposals activas (ventas/CRM/outbound). Todo en orden.	f	2026-03-30 20:02:30.592	2026-03-30 20:02:30.593
cmndm76l70005gm1x61olnb6m	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-30 19:34 UTC. Sistema en fase early stage: 9 clientes (todos BASICO), 0 pagos, 0 trabajos, 0 mensajes. 8/9 clientes creados en últimos 7 días — launches/recientes. Sin anomalías de datos. Sin Oportunidades de growth urgentes. Sin research pendiente esta semana (próxima: semana misma fecha).	f	2026-03-30 20:02:30.812	2026-03-30 20:02:30.812
cmndm76r90007gm1x9dx2aos9	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com respondiendo correctamente (HTTP 200). SSL OK. Sin errores detectados. Solo 1 cambio pendiente en git (carlos heartbeat). Sin deploys pendientes.	f	2026-03-30 20:02:31.029	2026-03-30 20:02:31.03
cmndm76x30009gm1x3vlznfou	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 030T1945Z. Sin trabajos pendientes en cola. Sprint backlog activo sin deliverable QA pendiente. Sin blockers. Agents activos sin acciones pendientes de revisión. Calidad OK.	f	2026-03-30 20:02:31.24	2026-03-30 20:02:31.241
cmndoce4y0001hm1e6daf9fti	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat nocturno (20:40 UTC). Sin actividad. Hora local: 04:40 KL — madrugada. Bandeja vacía.	f	2026-03-30 21:02:33.099	2026-03-30 21:02:33.166
cmndocedj0003hm1e963cjf4u	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check OK. App ejecutándose correctamente, sin incidencias. Revisión operativa limpia.	f	2026-03-30 21:02:33.416	2026-03-30 21:02:33.417
cmndocetn0005hm1enfzfwhng	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (200), SSL activo, sitemap accesible. Últimos commits: MINIMAX_API_KEY para Paco chat, fix MiniMax API directa. Sin incidencias pendientes.	f	2026-03-30 21:02:33.996	2026-03-30 21:02:33.997
cmndocezg0007hm1efzdnbh00	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-03-30 20:45 UTC (04:45 MYT). No hay deliverables en cola de revisión. Agentes activos: Enzo (marketing sin APIs conectadas), Carlos (CRM PostgreSQL), Elena (app OK). Sprint backlog vacío. Sin blockers ni issues abiertos. Research ejecutado: QA Trends 2026 añadidas a strategy-proposals.md.	f	2026-03-30 21:02:34.204	2026-03-30 21:02:34.205
cmndqhici0001is1ellxb4xsq	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 05:40 MYT — Sin actividad. Bandeja vacía, sin tickets pendientes ni mensajes nuevos.	f	2026-03-30 22:02:31.068	2026-03-30 22:02:31.143
cmndqhil00003is1e0ro7gxar	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalías. No hay campañas activas documentadas ni leads nuevos. Sprint backlog vacío. Strategy proposals actualizadas con 3 proposals de Carlos y 1 de Enzo para semana 2026-03-31.	f	2026-03-30 22:02:31.38	2026-03-30 22:02:31.381
cmndqhiqt0005is1eswa67lf1	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sin incidencias críticas. openclaw-gateway activo (PID 30). MyCompi server no está corriendo en puerto 3000 (esperado si está en Render). Proceso zombie sh (PID 2210) detectado — probable residuo de cron job, sin impacto. Sistemas externos (DB Neon, Resend) no verificables desde este contexto. Todo verde.	f	2026-03-30 22:02:31.589	2026-03-30 22:02:31.59
cmndqhiwe0007is1eznx4jf5d	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Día 8 sin actividad real. Servidor caído, 0 interacciones, 0 pagos. Solo 9 clientes BASICo de prueba. Sin anomalías sobre el patrón conocido.	f	2026-03-30 22:02:31.791	2026-03-30 22:02:31.792
cmndqhj200009is1e9v9w8img	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 2026-03-30. Landing build OK. Añadido FAQPage schema markup (11 Q&A) para SEO y featured snippets. Gap crítico: no existe sitemap.xml en landing. También detectada discrepancia tipografía: SPEC.md dice Poppins pero index.html usa Unbounded+PlusJakartaSans.	f	2026-03-30 22:02:31.992	2026-03-30 22:02:31.993
cmndqhj7x000bis1et68o2zmo	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente. Sprint backlog vacío, ningún deliverable en cola de revisión. Agentes Enzo, Carlos y Elena revisados — sin deliverables pendientes de QA. Heartbeat 2026-03-30 21:15 UTC.	f	2026-03-30 22:02:32.206	2026-03-30 22:02:32.207
cmnduu2hn0001h51eqrarxz93	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalías. Research competidores actualizado: TypingMind (20k+ users, lifetime pricing, MCP integrations) y Chatbase (10k+ businesses, smart escalation, WhatsApp integration). MyCompi bien posicionado vs ambos por precio y concepto compi.	f	2026-03-31 00:04:15.511	2026-03-31 00:04:15.592
cmnduu2qq0003h51exu3bzspw	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-31 07:55 UTC. Sin cambios respecto al anterior (06:31 UTC). No hay datos de pipeline - CRM no integrado. Sistema sigue sin correr en producción. Sin leads activos no hay qualificación ni seguimientos posibles. Research proposals ya actualizados (Proposals 5-7).	f	2026-03-31 00:04:15.842	2026-03-31 00:04:15.843
cmnduu2wk0005h51eojas43cq	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Todo OK. Sin incidencias ni errores detectados. Sin actividad nueva desde último heartbeat.	f	2026-03-31 00:04:16.052	2026-03-31 00:04:16.053
cmnduu3bw0007h51esszbvzi7	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-31 07:41 KL. Sin anomalías en métricas. Gap crítico persiste: PostgreSQL Neon inaccessible desde el workspace — no hay pipeline de métricas activo. Carlos ha publicado 3 proposals nuevos (Loom video prospecting, AI personalization, secuencias cortas). Diana añade primer proposal semanal sobre data & growth trends 2026.	f	2026-03-31 00:04:16.604	2026-03-31 00:04:16.605
cmnduu3hm0009h51e5h7naicm	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcional. SSL OK. Issue SEO técnico: sitemap.xml y robots.txt devuelven HTML en vez de contenido estático (probable fallback SPA). Admin panel ya no da 301. Hay cambios locales sin commitear en landing, public y strategy-proposals.	f	2026-03-31 00:04:16.811	2026-03-31 00:04:16.812
cmndwx0zc0001gj1e0hhvzz8w	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat de verificación. Sin acceso a CRM/pipeline real de MyCompi. Research semanal ya cubierto con 4 proposals (semana 2026-03-31). No hay acciones pendientes de ventas.	f	2026-03-31 01:02:32.755	2026-03-31 01:02:32.836
cmndwx17y0003gj1ed1dh3l0r	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat OK. Sin incidencias detectadas. Script heartbeat-notifications.js presente y configurado correctamente (envía notificaciones hourly a /api/notificaciones/interna). Sprint backlog vacío aún pendiente de definir objetivos de semana. Strategy proposals: sección Elena vacía esta semana — Carlos y Diana ya tienen proposals activos.	f	2026-03-31 01:02:33.07	2026-03-31 01:02:33.072
cmndwx1e20005gj1eje1ywh1x	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente. SSL OK, /health returns 200, landing accesible. Issues detectados: (1) sitemap.xml no existe - solo hay referencia en código, (2) canonical apunta a mycompi.onrender.com en lugar de mycompi.com, (3) Hay páginas en src/pages sin sitemap dinámico. Propuesta: generar sitemap.xml estático o dinámico para SEO.	f	2026-03-31 01:02:33.29	2026-03-31 01:02:33.292
cmndwx1jz0007gj1ekv2w4aql	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sprint backlog sin asignaciones activas. No hay deliverables en cola de revisión. Backlog vacío (plantilla sin rellenar). Agents en espera. Sin blockers activos.	f	2026-03-31 01:02:33.504	2026-03-31 01:02:33.505
cmndz27xq0001dq1eznvnmdbs	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat activo. Revisada bandeja de entrada y sistema de tickets. Sin actividad nueva. Sin tickets pendientes ni mensajes pendientes. Todo en calma.	f	2026-03-31 02:02:34.285	2026-03-31 02:02:34.317
cmndz284t0003dq1eleh4jcsi	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío sin actividad. No hay leads activos ni seguimientos en curso. CRM sigue en sistema externo no accesible desde este nodo. Research semanal ya completo (3 proposals en strategy-proposals.md). Sin acción urgente.	f	2026-03-31 02:02:34.542	2026-03-31 02:02:34.543
cmndz28ao0005dq1el5kg6vn6	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat Martes 31 — Sin incidencias nuevas. Sistema MyCompi sigue sin actividad en producción (confirmado 7+ días sin sesiones). Elena ya hizo research semanal la semana del 24/03. Sin automatizaciones activas que revisar porque el sistema no está corriendo. Systems: all_green (sin datos = sin errores detectables).	f	2026-03-31 02:02:34.753	2026-03-31 02:02:34.754
cmndz28h50007dq1eema8alqj	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat de métricas. MRR = €0 (0 pagos completados). 9 clientes activos en BD, ninguno ha pagado aún. Activation rate = 0%. Posible issue con Stripe webhook o clientes en fase de prueba. Sin datos suficientes para churn/retention (mínimo 7 días necesarios).	f	2026-03-31 02:02:34.985	2026-03-31 02:02:34.986
cmndz28mv0009dq1eg5bhg3qp	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200). Sitemap accesible. SSL vigente. Cambios locales pendientes de deploy: FAQ schema markup (+98 líneas en landing/index.html y public/index.html). No hay errores detectados.	f	2026-03-31 02:02:35.191	2026-03-31 02:02:35.192
cmndz28t0000bdq1eaxt0f1ou	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 09:46 MYT. Sprint-backlog vacío, no hay deliverables pendientes en cola de revisión. No hay issues abiertos ni blockers. Sistema operativo con normalidad.	f	2026-03-31 02:02:35.413	2026-03-31 02:02:35.416
cmne17dol0001ds1enjgl911i	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat verificado. Sin actividad pendiente en bandeja de entrada, tickets o mensajes.	f	2026-03-31 03:02:34.24	2026-03-31 03:02:34.299
cmne17dx80003ds1e8wa7agku	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat Tuesday 10:55 MYT — Research semanal ejecutado. 3 proposals nuevos añadidos a strategy-proposals.md: (8) LinkedIn Video Prospecting, (9) Política de Descuentos data-driven, (10) Apollo vs Smartlead recomendación. Pipeline sigue a 0,0,0 — no hay datos CRM/leads en workspace. Sprint backlog y weekly report siguen vacíos (plantillas). Onboarding completo disponible.	f	2026-03-31 03:02:34.556	2026-03-31 03:02:34.557
cmne17e3e0005ds1eqr3fhylj	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat inicial. Sistemas OK, sin incidencias. Compi operando normalmente en producción.	f	2026-03-31 03:02:34.778	2026-03-31 03:02:34.779
cmne17e9i0007ds1e12wiphyk	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Día 8 sin actividad de pago. 9 usuarios registrados, 0 pagos, 1 acceso real (Alberto). Sin anomalías graves — la situación es expected para producto en validación. No hay experimentos activos ni datos de onboarding.	f	2026-03-31 03:02:34.998	2026-03-31 03:02:34.999
cmne17efe0009ds1ed2wkktnx	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente. SSL vigente. Health endpoint devuelve 200. Meta tags SEO OK. Canonical URL apunta a onrender.com (inconsistencia menor). Landing tiene cambios pendientes de commit: FAQ schema markup añadido. No hay sitemap.xml en producción ni robots.txt visible. SSL OK hasta Jun 2026.	f	2026-03-31 03:02:35.211	2026-03-31 03:02:35.212
cmne17el2000bds1e03fhrf7l	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat activo. Sprint backlog vacío (plantilla sin filling), sin deliverable queues activos. No hay trabajos pendientes de revisión. Research done: añadidas 3 proposals de QA trends 2026 a strategy-proposals.md (AI test generation, observability-driven QA, shift-left testing). No se detectan blockers ni issues abiertos.	f	2026-03-31 03:02:35.414	2026-03-31 03:02:35.415
cmne3cis4000dds1ebyoem00q	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin cambios. APIs de marketing sin configurar. Todo tranquilo.	f	2026-03-31 04:02:32.685	2026-03-31 04:02:33.417
cmne3cj06000fds1e273fhf5k	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat de mantenimiento. Pipeline vacío confirmado — Carlos en standby esperando setup de CRM y primeros leads. 10 proposals activos cubriendo outbound B2B 2026 (video prospecting, AI personalization, secuencias short-range, LinkedIn TL Ads, Instantly/Smartlead/Apollo). No hay leads en el sistema. Siguiente paso: setup CRM y primers outbound.	f	2026-03-31 04:02:33.655	2026-03-31 04:02:33.655
cmne3cj5q000hds1es0t19y9a	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat matutino — sin incidencias. mycompi.com responde 200. Git actualizado (último commit: MINIMAX_API_KEY + fix chat Paco). Última estrategia proposals activa con 3 proposals Elena. Sin automatizaciones pendientes ni incidencias detectadas.	f	2026-03-31 04:02:33.854	2026-03-31 04:02:33.855
cmne3cjbe000jds1ekui8lkpb	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Sistema MyCompi sin actividad real detectada. 7+ días consecutivos sin sesiones, sin métricas, sin logs de uso. El proyecto está arquitecturado (16 agentes, schema Prisma, landing/admin panels completos) pero no hay datos de uso en Neon. Los daily standups de los últimos días confirman el mismo patrón: $0 costo, 0 sesiones. No hay anomalías de datos porque no hay datos - es una ausencia total de tracking.	f	2026-03-31 04:02:34.059	2026-03-31 04:02:34.06
cmne3cjgy000lds1e3ifhbx68	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200, SSL OK). Hay cambios sin commit en landing/index.html y public/index.html (FAQ Schema markup). Ninguna incidencia crítica.	f	2026-03-31 04:02:34.258	2026-03-31 04:02:34.259
cmne3cjmk000nds1eups0cn6z	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente de revisión. Sprint backlog vacío/generico. Reviews.json sin registros activos. Ningún deliverable en cola de revisión. Todos los agentes en modo standby o heartbeat de mantenimiento.	f	2026-03-31 04:02:34.461	2026-03-31 04:02:34.462
cmne5hpzl0001fa1ewc0ns6ql	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 12:20 MYT — Sin actividad. Bandeja vacía, sin tickets pendientes ni mensajes urgentes.	f	2026-03-31 05:02:35.213	2026-03-31 05:02:35.293
cmne5hq840003fa1esz75x8f0	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin anomalías en campañas - todas las APIs de marketing siguen sin conectar. Propuesta Enzo creada: short-form video strategy para MyCompi (orgánico, sin coste, inmediato).	f	2026-03-31 05:02:35.525	2026-03-31 05:02:35.525
cmne5hqdv0005fa1ekdl3cfq1	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-31 04:55 UTC. Carlos activo. Nada nuevo que reportar — pipeline sigue vacío (sin CRM ni leads). Research semanal ya ejecutado en heartbeat anterior. Urgente: necesita setup de CRM y definición de ICP/leads para poder hacer qualificar y seguimiento real. Mientras tanto, proposals actualizados y listos.	f	2026-03-31 05:02:35.732	2026-03-31 05:02:35.732
cmne5hqjm0007fa1e0z2icpgw	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Servidor respondiendo correctamente (HTTP 200). Endpoints /api/health y /api/healthcheck no encontrados (posible ruta diferente). Sin logs de error nuevos detectados. Sistema base operativo.	f	2026-03-31 05:02:35.939	2026-03-31 05:02:35.939
cmne5hqpi0009fa1e7ctm5za4	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat ejecutado. MRR = 0€, solo 2/9 usuarios activos en 7 días.平台上还没有收入，所有客户都在BASICO计划。激活率和留存率是主要问题。	f	2026-03-31 05:02:36.15	2026-03-31 05:02:36.151
cmne5hquz000bfa1etqje952t	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Todo OK. Landing build exitoso, FAQ schema markup en producción. Sin incidencias. Branch al día con origin. Sin deploys pendientes.	f	2026-03-31 05:02:36.348	2026-03-31 05:02:36.348
cmne5hr0y000dfa1e66mq0br6	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-03-31 04:46 UTC. Sin deliverable pendientes de revisión. Sprint backlog vacío (sin tareas activas). Enzo y Carlos tienen workstreams propios sin entregables QA pendientes. Agente activo y disponible.	f	2026-03-31 05:02:36.562	2026-03-31 05:02:36.562
cmne7muqz000ffa1elgrol66a	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 2026-03-31 05:20 UTC. Sin actividad: no hay acceso a bandeja de entrada (himalaya requiere TTY), no hay tickets pendientes en el workspace, no hay mensajes pendientes.	f	2026-03-31 06:02:33.285	2026-03-31 06:02:33.951
cmne7muyv000hfa1erzh08q6w	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío sin cambios. Sin leads activos ni CRM configurado. Strategy proposals al día (11 proposals). Sin acción requerida.	f	2026-03-31 06:02:34.184	2026-03-31 06:02:34.186
cmne7mv4k000jfa1ebnlvrrc3	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK: node server.mjs activo (PID 10), openclaw-gateway activo (PID 30). No hay logs de errores disponibles ni incidencias. Procesos estables desde última revisión.	f	2026-03-31 06:02:34.388	2026-03-31 06:02:34.39
cmne7mva7000lfa1e9zev7hmi	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Octavo día consecutivosin actividad real. Sistema MyCompi sigue sin correr en producción. token-logs.json = []. Sin métricas disponibles. Los proposals de strategy están actualizados (Carlos, Elena) pero no hay datos de uso reales.	f	2026-03-31 06:02:34.592	2026-03-31 06:02:34.593
cmne7mvr3000nfa1e0fvpuagg	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (HTTP 200, SSL OK, CloudFlare). Git tiene cambios pendientes de commit: FAQ Schema markup añadido a landing/index.html y public/index.html (mejora SEO). Tests: 0 suites (no hay tests todavía). Issues encontrados: (1) sitemap.xml NO existe ni en landing ni en public — oportunidad SEO importante, (2) robots.txt no existe en el proyecto. SSL y headers CSP OK.	f	2026-03-31 06:02:35.199	2026-03-31 06:02:35.201
cmne7mvxg000pfa1evqgy18kq	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente. Sprint backlog vacío (plantilla sin datos). No hay deliverables pendientes de revisión. No hay issues abiertos. Todo tranquilo.	f	2026-03-31 06:02:35.429	2026-03-31 06:02:35.431
cmne9sij90001h51ec4il07is	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay emails, tickets ni mensajes pendientes. Sistema tranquilo.	f	2026-03-31 07:02:57.237	2026-03-31 07:02:57.28
cmne9sit70003h51efzto991s	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-03-31 06:55 UTC. Pipeline vacío (hot:0, warm:0, cold:0). No hay seguimientos activos, no hay secuencias en curso. 3 proposals activos cubriendo las priorities de la semana (video outreach, AI personalization, secuencias cortas 3-touch). Carlos sigue sin leads para trabajar — requiere intervención de Paco o MyCompi para obtener inbound leads o aprobar inicio de outbound.	f	2026-03-31 07:02:57.595	2026-03-31 07:02:57.596
cmne9siyy0005h51e96iv7yv9	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK. Git muestra cambios en landing (FAQ schema markup añadido a landing/index.html y public/index.html — parece mejora SEO propuesta por Valeria). Agent Diana eliminado. Sin logs de error, sin incidencias de integraciones de terceros.	f	2026-03-31 07:02:57.802	2026-03-31 07:02:57.803
cmne9sj500007h51eky035hxw	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.com funcionando correctamente (200 OK). SSL vigente. Landing y /contratacion accesibles. Git tiene cambios unstaged en landing/index.html y public/index.html (FAQ Schema markup). Sin incidencias críticas.	f	2026-03-31 07:02:58.02	2026-03-31 07:02:58.021
cmne9sjlg0009h51enz80h7ss	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-03-31 06:46 UTC. No hay deliverable pendientes de revisión. Agentes activos (Enzo, Carlos, Elena, Laura, Marcos, Diana) no tienen work items pendientes de QA. Sprint-backlog vacío — sin tareas activas de Paco. Sin blockers detectados. Siguiente heartbeat en ~30 min.	f	2026-03-31 07:02:58.612	2026-03-31 07:02:58.613
cmnebxrbf0001f21e3abo7zb5	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay emails, tickets ni mensajes pendientes en este heartbeat.	f	2026-03-31 08:03:01.131	2026-03-31 08:03:01.197
cmnebxrk00003f21euzg6iu9g	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío — sin leads activos ni seguimientos pendientes. Sin cambios respecto al heartbeat anterior. Carlos continúa en standby.	f	2026-03-31 08:03:01.44	2026-03-31 08:03:01.442
cmnebxrq70005f21e2us7wqfd	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat rutinario. Estado idéntico al anterior: servidor principal Node.js activo, paneles no levantados (puertos cerrados). Sin incidencias nuevas. Proposal MCP y auto-documentation siguen pendientes de implementación.	f	2026-03-31 08:03:01.664	2026-03-31 08:03:01.665
cmnebxrwb0007f21e2mmx3l80	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat ejecutado. No hay datos de métricas disponibles en data/. El archivo token-logs.json está vacío. No hay CSVs ni fuentes de métricas activas.	f	2026-03-31 08:03:01.884	2026-03-31 08:03:01.885
cmnebxs250009f21enrvwbxcc	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Landing funcional en mycompi.onrender.com (200 OK). mycompi.es redirige a 'defaultsite' — dominio no apunta correctamente. FAQ schema ya implementado. Falta sitemap.xml. SSL OK en Render.	f	2026-03-31 08:03:02.093	2026-03-31 08:03:02.095
cmnebxs8f000bf21ez5njwb4s	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajos pendientes en cola. Sprint-backlog sigue vacío (plantilla sin rellenar por Paco). No hay deliverables de Enzo, Carlos, Diana ni otros agentes esperando revisión. Sin issues abiertos. Sin blockers. Todo en calma.	f	2026-03-31 08:03:02.32	2026-03-31 08:03:02.321
cmnee2ael0007eq1wfhu2itlb	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin actividad real de ventas. Sistema MyCompi lleva 7+ días sin correr en producción. Sin CRM, sin leads, sin pipeline activo. Research semanal completado: proposals 8-11 añadidas a strategy-proposals.md (video prospecting, descuentos, Apollo vs Smartlead, human-in-the-loop AI). Pipeline real: 0 hot, 0 warm, 0 cold.	f	2026-03-31 09:02:31.723	2026-03-31 09:02:31.729
cmnee2akx0009eq1wtsuvz6p0	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check completado. Sin incidencias. Node server y gateway activos. Backups: último del 26/03. Token logs vacíos (sin incidencias de uso). Estrategia: propuesta video prospecting activa. Sistemas operativos sin errores.	f	2026-03-31 09:02:31.953	2026-03-31 09:02:31.955
cmnee2ar1000beq1wwnvnaiiy	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente. SSL OK, sitemap y robots.txt accesibles. Build compila sin errores. Changes pendientes: FAQ schema markup (+98 líneas) ya en landing/index.html listo para commit+deploy cuando Paco lo autorice.	f	2026-03-31 09:02:32.173	2026-03-31 09:02:32.175
cmnee2ax2000deq1w70lzryef	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente en cola. Backlog vacío, sin deliverables pendientes de revisión. Sistema tranquilo.	f	2026-03-31 09:02:32.39	2026-03-31 09:02:32.392
cmneg7jft0001bz1ecukve0c3	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad nueva. Sistema MyCompi sin actividad real (8 dias consecutivos). No hay emails, tickets ni mensajes pendientes. Todo en espera de deploy en produccion.	f	2026-03-31 10:02:35.86	2026-03-31 10:02:36.045
cmneg7jqo0003bz1ebou4w4nf	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío (sin CRM activo). Sin leads nuevos ni seguimientos. Proposals 5-11 de hoy siguen vigentes. Sin cambios respecto al heartbeat anterior de 09:33 UTC. Carlos sigue en standby hasta que MyCompi configure integración CRM (Apollo/Instantly/Smartlead). weekly research ya realizado (proposals actualizados hoy).	f	2026-03-31 10:02:36.337	2026-03-31 10:02:36.338
cmneg7jwn0005bz1emzbk3ah4	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Health check completo — todos los sistemas OK. Última actualización del codebase: hace ~9h (fix SSE parser + Stripe). Backups verificados (backup_2026-03-26). No hay incidencias activas ni procesos fallando. Stack: Node.js + Express + Prisma/Neon + Stripe + Resend. Puertos y servicios sin anomalías.	f	2026-03-31 10:02:36.551	2026-03-31 10:02:36.553
cmneg7k2q0007bz1e3r85egt2	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana - 9 clientes activos, 9 usuarios, 7 agentes. MRR = 0€ (SIN PAGOS COMPLETADOS). 7/9 usuarios sin acceso reciente (>7 días). Sistema sin trabajos activos ni interacciones de chat esta semana. Revisar: la mayoría de clientes parecen cuentas de test (TestEmpresa, Test SL, etc.)	f	2026-03-31 10:02:36.77	2026-03-31 10:02:36.772
cmneg7k8q0009bz1e1xxh8c0g	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check completo. beenocode.com → 301 redirect a beenocode.framer.website (funcionando correctamente). SSL válido hasta May 28 2026. sitemap.xml disponible (200). Sin incidencias.	f	2026-03-31 10:02:36.986	2026-03-31 10:02:36.988
cmneg7kob000bbz1ebkrkva9w	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente. Sistema MyCompi inactivo (8 días consecutivos). Sprint backlog vacío — todos los agentes en wait mode. No hay deliverables de Enzo, Carlos ni ningún otro agente esperando revisión. Si Alberto reactiva el proyecto, estoy lista para revisar.	f	2026-03-31 10:02:37.548	2026-03-31 10:02:37.549
cmneicl3k0003ha1wy7my2t6c	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20min — revisión de bandeja y tickets: sin actividad. Sistema vacío, sin tickets pendientes ni emails.	f	2026-03-31 11:02:30.608	2026-03-31 11:02:30.615
cmneicl9r0005ha1wi2jhclqv	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin cambios desde último heartbeat. No hay datos de pipeline ni CRM integrado en el workspace. Sin leads activos, seguimientos pendientes ni nueva actividad. Strategy proposals ya actualizados con 11 proposals de Carlos. Este heartbeat se ejecuta ~24min después del anterior sin nuevos datos.	f	2026-03-31 11:02:30.832	2026-03-31 11:02:30.833
cmneiclfj0007ha1wz48as6cc	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat inicial. Revisión de sistemas: todo OK. Sin automatizaciones pendientes, sin incidencias. Proyecto MyCompi/BeeNoCode operativo.	f	2026-03-31 11:02:31.039	2026-03-31 11:02:31.041
cmneicllh0009ha1w7q4tbw1z	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat de Diana activo. Sin acceso directo a métricas live (Neon DB, dashboards). Proyecto en estado de desarrollo active con múltiples agents trabajando. Sin anomalías detectadas en archivos locales. No hay métricas highs/lows esta semana.	f	2026-03-31 11:02:31.253	2026-03-31 11:02:31.254
cmneiclrc000bha1wwalg3soz	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.com UP (200), SSL OK. Git muestra cambios sin desplegar: landing/index.html (+FAQ schema markup), public/index.html, y assets de admin/chat. IMPORTANTE: /sitemap.xml devuelve HTML en vez de XML — error SEO crítico. Despliegue pendiente.	f	2026-03-31 11:02:31.464	2026-03-31 11:02:31.465
cmneiclxe000dha1w6c0qrz7w	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverables pendientes. Cola vacía (sistema Prisma/Neon no hay trabajos en estado PENDING/IN_REVIEW). Backlog de sprint sin tareas activas. Quality gates y quality standards revisados — todo OK. Siguiente check en 30 min.	f	2026-03-31 11:02:31.682	2026-03-31 11:02:31.683
cmnekkrda0001e81e7590fx03	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay emails, tickets ni mensajes pendientes en el sistema.	f	2026-03-31 12:04:50.574	2026-03-31 12:04:51.27
cmnekkrlp0003e81ef9k4kqyk	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sistema sin actividad real 8+ días. Sin campañas activas. Research tendencias 2026: short-form video domina, Thought Leader Ads LinkedIn 2-3x mejor engagement, social = search engine para B2B buyers, employee advocacy > brand handles, AI disclosures obligatorios. Proposals activos de Carlos, Elena, Diana en archivo compartido.	f	2026-03-31 12:04:51.517	2026-03-31 12:04:51.518
cmnekkrre0005e81ee6x4rq83	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 19:55 KL (11:55 UTC). Pipeline vacío — sin leads, sin CRM activo, sin datos de ventas. Research semanal ya completado hoy a las 12:31 UTC (4 proposals nuevas añadidas a strategy-proposals.md). Sistema MyCompi sigue sin actividad real. Sin cambios en pipeline ni necesidad de seguimientos. Todo en standby hasta que el producto esté deployado.	f	2026-03-31 12:04:51.723	2026-03-31 12:04:51.723
cmnekkrx90007e81ey1n9xmwn	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas MyCompi en estado normal. Sin incidencias. Git limpio, último backup 5 días atrás (sin cambios). Elena disponible para automatizaciones y ops.	f	2026-03-31 12:04:51.934	2026-03-31 12:04:51.934
cmnekks2z0009e81ehiz7t3sf	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat inicial de Diana. Sistema en fase temprana con 9 usuarios y 9 clientes (todos plan BASICO). Sin pagos registrados ni trabajos activos. Agentes dados de alta (Laura, Enzo, Carlos, Elena, Diana Fabián, Marcos, Valeria) pero sin uso todavía. Churn: 0% (no hay bajas). Sin datos suficientes para análisis de tendencias (min 7 días).	f	2026-03-31 12:04:52.139	2026-03-31 12:04:52.14
cmnekks8p000be81eky65yvnv	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio principal mycompi.es no responde. Landing sin build reciente (dist missing). ISSUES: (1) Site unreachable - puede ser DNS, dominio mal configurado o Render pausado. (2) Canonical URL wrong - apunta a onrender.com en vez de dominio real. (3) Falta HowTo schema y sitemap.xml para SEO. (4) git diff pendiente de revisar.	f	2026-03-31 12:04:52.345	2026-03-31 12:04:52.346
cmnekksej000de81e698pfiu5	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverables pendientes en cola. Sprint backlog vacío (plantilla genérica sin fills). Sin blockers activos. Heartbeat 2026-03-31T11:45Z — check completo, nada que reportar.	f	2026-03-31 12:04:52.556	2026-03-31 12:04:52.56
cmnemmx200001gs1eknkyouif	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat de verificacion. No hay emails, tickets ni mensajes pendientes en el sistema. Todo tranquilo.	f	2026-03-31 13:02:31.123	2026-03-31 13:02:31.201
cmnemmxaj0003gs1e8gsev7b6	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat de mantenimiento. Pipeline vacío, sin CRM ni leads cargados. Sin cambios desde último heartbeat. Sin urgencia.	f	2026-03-31 13:02:31.435	2026-03-31 13:02:31.443
cmnemmxgn0005gs1emv9nk8kt	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas ok. MyCompi corriendo en producción (Docker + Render). Stack completo: Node server, Prisma/Neon, Resend emails, JWT auth. Última backup 2026-03-26 (5 días — verificar si debe ser más frecuente). Git limpio, últimos commits: sync MINIMAX_API_KEY, fix chat SSE. Sin incidencias nuevas. incidencias.md aún no creado (proposal Elena de la semana pasada pendiente).	f	2026-03-31 13:02:31.656	2026-03-31 13:02:31.664
cmnemmxmh0007gs1earo4z6jx	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-03-31 20:32 MYT. Sistema en fase temprana: 9 clientes BASIC0, solo 1 activo (AlberBEE con 7 agentes). Sin pagos registrados, sin emails, sin chats. 8/9 clientes sin activar (0 agentes). Gaps críticos de tracking detectados.	f	2026-03-31 13:02:31.865	2026-03-31 13:02:31.873
cmnemmy2d0009gs1etg7nzggy	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando correctamente (200, SSL OK). Git tiene cambios locales pendientes: landing/index.html +98l, public/admin assets eliminados, strategy-proposals.md actualizado. No hay backup reciente (último backup: 2026-03-26). No hay incidencias. Research semanal no aplicable hoy (último research: semana 2026-03-24 a 2026-03-30, aplica la semana que viene).	f	2026-03-31 13:02:32.438	2026-03-31 13:02:32.446
cmnemmy8k000bgs1exo42jax8	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-03-31 12:46 UTC. Sin cambios desde el último heartbeat — no hay deliverables pendientes de revisión, cola vacía, sprint backlog vacío. Todo tranquilo.	f	2026-03-31 13:02:32.661	2026-03-31 13:02:32.669
cmneos6lb0001e91xfo460agb	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat verificado. himalaya no tiene acceso configurado (sin TTY/config). Sin emails ni tickets pendientes visibles desde el workspace. Todo tranquilo.	f	2026-03-31 14:02:35.999	2026-03-31 14:02:36.05
cmneos7330003e91xg8sdhbrr	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin cambios vs heartbeat anterior. Pipeline sigue vacío (hot:0, warm:0, cold:0). CRM no integrado. Research semanal ya ejecutado (Proposals 12 y 13 en strategy-proposals.md). Sin leads pendientes ni seguimientos. Todo tranquilo.	f	2026-03-31 14:02:36.639	2026-03-31 14:02:36.641
cmneos7930005e91xjh89eei5	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sin incidencias. Todo tranquilo. Última alerta: recomendación Sentry aún pendiente (del heartbeat anterior). Sin cambios en el estado del sistema.	f	2026-03-31 14:02:36.855	2026-03-31 14:02:36.856
cmneos7eu0007e91xak2ijahx	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana 2026-03-31. Sin acceso directo a métricas live de Neon DB desde este contexto. Research: benchmarks SaaS 2026 muestran NRR medio 106%, churn 5-7% anual B2B <$10K ARPU. Sin anomalías detectadas. Sin acceso a datos de uso, login events, o feature adoption para generar alertas.	f	2026-03-31 14:02:37.062	2026-03-31 14:02:37.063
cmneos7ki0009e91xnzck9oty	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web operativa. SSL OK. Detectados 2 issues SEO técnicos: (1) sitemap.xml y robots.txt no existen como estáticos — el servidor sirve HTML (fallback SPA), lo que impide que Google indexe correctamente. (2) FAQ tiene contenido pero no tiene schema.org/FAQPage markup. Tareas rápidas de bajo esfuerzo con impacto SEO directo.	f	2026-03-31 14:02:37.267	2026-03-31 14:02:37.268
cmneos7qe000be91xuqqaovl0	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverables pendientes en cola de revisión. Equipo operativo y tranquilo. Marcos detectó 2 issues SEO técnicos (sitemap.xml/robots.txt no son estáticos + FAQ sin schema markup) — no requieren QA review per se pero están documentados. Research semanal ya ejecutado en heartbeat anterior (13:16 UTC). Todo en orden.	f	2026-03-31 14:02:37.478	2026-03-31 14:02:37.479
cmneqxzvh0001er1eyxukythm	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 20min — Sin bandeja de entrada configurada ni tickets pendientes. Sistema de email (himalaya) no disponible en este nodo.	f	2026-03-31 15:03:06.461	2026-03-31 15:03:06.514
cmneqy03s0003er1eo9wy9r2y	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sistema MyCompi sin cambios. Investigación actualizada: Thought Leader Ads LinkedIn y GEO como oportunidades viables. Competencia consolidada (Cursor, Copilot).	f	2026-03-31 15:03:06.761	2026-03-31 15:03:06.762
cmneqy0jg0005er1e37dla2hv	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline vacío (0 leads). CRM sin datos. Research semanal ya documentado (proposals 12-13). Outbound MyCompi aún en fase de estrategia. No hay urgências ni seguimientos pendientes.	f	2026-03-31 15:03:07.325	2026-03-31 15:03:07.325
cmneqy0pg0007er1efsbdkn30	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Todo estable. El endpoint de mycompi.onrender.com/health responde con 200 (la última vez estaba caído con timeout). No hay nuevos logs ni incidencias. Sistemas en verde.	f	2026-03-31 15:03:07.54	2026-03-31 15:03:07.541
cmneqy0v70009er1ehjkq84j1	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Noveno día sin actividad real. Sin métricas disponibles - el sistema MyCompi no está corriendo en producción. El standup del 31/03 confirma 0 sesiones registradas y $0 en costs. La base de datos Neon tiene estructura pero no hay datos de uso real. La propuesta de Churn Prediction está en strategy-proposals.md pero requiere datos que no existen aún.	f	2026-03-31 15:03:07.747	2026-03-31 15:03:07.748
cmneqy120000ber1e5f0mmyg5	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check: mycompi.com UP (HTTP 200). SSL vigente. /admin y /chat devuelven 301 (redirect a login, normal). Sin errores 5xx detectados. Última actividad en código: feat Paco onboarding automático (commit 9c1e151). No hay alertas pendientes ni incidencias.	f	2026-03-31 15:03:07.992	2026-03-31 15:03:07.993
cmneqy17u000der1epcstnw0q	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverable pendiente de revisión. Sistema UP. Todos los agentes en wait mode sin deliverables activos. Cola vacía.	f	2026-03-31 15:03:08.203	2026-03-31 15:03:08.203
cmnet2hjv0001gp1ecy9xyhvh	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad. No hay inbox, tickets ni mensajes pendientes en el sistema.	f	2026-03-31 16:02:35.227	2026-03-31 16:02:35.292
cmnet2hsa0003gp1ekdmab2w5	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sistema MyCompi sin cambios. Sin campañas activas ni leads. Todo sigue bloqueado por falta de deploy.	f	2026-03-31 16:02:35.53	2026-03-31 16:02:35.531
cmnet2hxt0005gp1eu0w0nn3x	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sin cambios — Carlos continúa sin pipeline ni datos de CRM. No hay leads, secuencias activas ni archivos de CRM en el workspace. Research semanal ya completado hoy a las 13:05 UTC (Proposal 12 video prospecting + Proposal 13 Instantly.ai). Strategy-proposals.md tiene 13 proposals activos. Carlos necesita setup de CRM y carga de pipeline antes de poder ejecutar outbound.	f	2026-03-31 16:02:35.729	2026-03-31 16:02:35.731
cmnet2i3i0007gp1e6wn2u2uu	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK — node server.mjs activo (PID 10), openclaw-gateway activo (PID 30). Sin incidencias detectadas. Sin logs de errores. Health check completado sin problemas.	f	2026-03-31 16:02:35.935	2026-03-31 16:02:35.936
cmnet2i9f0009gp1eh4w05xvn	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] 8vo día consecutivo sin actividad real. Sistema MyCompi sigue sin correr en producción. No hay métricas, no hay sesiones, no hay uso. El producto está construido pero no deployed. token-logs.json = []. Database Neon conectada pero vacía. Agentes siguen en modo espera.	f	2026-03-31 16:02:36.148	2026-03-31 16:02:36.149
cmnet2if8000bgp1eyb6f0uti	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio activo (mycompi.onrender.com). SSL vigente hasta Jun 2026. Landing con FAQ schema markup OK. Meta tags y OG correctos. Falta sitemap.xml. No hay errores detectados. Última versión en git: feat: Paco onboarding automático. Research semanal añadido a strategy-proposals.md.	f	2026-03-31 16:02:36.356	2026-03-31 16:02:36.357
8b6ea343-d0a1-4fc1-874f-7f6bcd1b2258	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	INFO	✅ Trabajo aprobado: 📢 Testear canal de adquisición: LinkedIn o email	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:23.822	2026-03-31 19:35:23.822
cmnet2il2000dgp1ecr2yxpm3	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente de revisión. Sprint backlog vacío (sin tareas activas). Carlos, Enzo, desarrollo y demás agentes sin deliverables esperando revisión. Strategy-proposals.md actualizado con trends QA 2026 (Playwright smoke tests ya proposto y aprobado por Marcos). Sistemas sin blockers. Siguiente revisión en 30 min.	f	2026-03-31 16:02:36.566	2026-03-31 16:02:36.567
cmnev7lnk0001bb1es440kdw6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Sin actividad de soporte en este ciclo. Elena reporta server OK, PM2 activo, DB Neon conectada; Carlos sin pipeline activo. Sin incidencias críticas ni casos urgentes detectados. Todo en calma.	f	2026-03-31 17:02:33.056	2026-03-31 17:02:33.067
cmnev7ltv0003bb1eqpu99s1k	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Sistema MyCompi sin actividad real. Sin pipeline ni datos de ventas. 11° día consecutivo sin outreach posible. Producto inactivo según último registro. Sin cambios en el estado. Research semanal no realizado por ser mismo día UTC.	f	2026-03-31 17:02:33.283	2026-03-31 17:02:33.285
cmnev7lzt0005bb1e5by55b9s	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Sistemas OK: node server activo (PID 10), PM2 no corriendo (sin problemas, el proceso node va directo). mycompi.es sigue sin responder (000/error). Git 5 commits nuevos desde último heartbeat. Strategy-proposals actualizado por Carlos. Sin incidencias críticas.	f	2026-03-31 17:02:33.497	2026-03-31 17:02:33.499
cmnev7m5g0007bb1erv4sivr6	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana 2026-03-31 16:33 UTC. Sistema MyCompi sin actividad real en producción desde hace 8+ días. No hay datos de métricas (MRR, churn, new users) dado que el producto no está deployado. Proposal activo: Churn prediction model (Proposal 1, Diana, semana 2026-03-31). Sin anomalías detectadas.	f	2026-03-31 17:02:33.701	2026-03-31 17:02:33.702
cmnev7mb50009bb1e8rn4ix8w	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web funcionando en mycompi.onrender.com (200 OK). DNS mycompi.es no resuelve — podría estar caído o mal configurado.SSL no comprobable sin dominio. Sitemap accesible. Research Web Dev Trends 2026 ya publicado por Marcos en proposals de esta semana.	f	2026-03-31 17:02:33.905	2026-03-31 17:02:33.916
cmnev7mr8000bbb1eezws5zb6	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sprint backlog vacío. Sin deliverables pendientes de revisión. Carlos reporta 0 actividad en pipeline (día 10 sin outreach posible). No hay issues abiertos ni blockers activos. En espera de nuevos entregables.	f	2026-03-31 17:02:34.485	2026-03-31 17:02:34.486
cmnexcq350001e61wztm9im3t	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat realizado a las 01:40 MYT. Sistema activo. No hay bandeja de entrada, tickets ni mensajes pendientes. Agente en espera.	f	2026-03-31 18:02:31.313	2026-03-31 18:02:31.37
cmnexcqb70003e61w59mgglsi	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-03-31T17:45Z. Sin incidencias. Proyecto sin logs activos todavía. No hay PM2 ni servicio local corriendo en este host.	f	2026-03-31 18:02:31.604	2026-03-31 18:02:31.605
cmnexcqgr0005e61w9oklt4z0	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana activo. Sistema MyCompi lleva 8 días sin actividad real. No hay datos de métricas (Neon DB no accesible desde aquí, sin producto en producción). Sin anomalías detectadas en métricas porque no hay datos que analizar. Growth opportunities documentadas en strategy-proposals.md.	f	2026-03-31 18:02:31.804	2026-03-31 18:02:31.808
cmnexcqn90007e61wtd42r9sx	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-03-31T17:45Z. Revisión de heartbeats del equipo: todos en standby. Sistema MyCompi sin actividad real (sin deliverable pendiente de revisión). Reviews.json aún no creado (sin entregas procesadas). Sprint backlog vacío. Sin blockers activos. Siguiente revisión en próximo heartbeat.	f	2026-03-31 18:02:32.038	2026-03-31 18:02:32.039
6aa26495-0f89-42f7-9712-59a2d4c60a07	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	INFO	✅ Trabajo aprobado: 🔍 Investigar empresa, sector y competencia	Aprobado con nota: OK test	f	2026-03-31 18:58:34.943	2026-03-31 18:58:34.943
cmnezigc10001hz1wy1ra4276	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat de rutina. No hay cuenta mycompi configurada en himalaya. Sin emails nuevos, tickets pendientes o mensajes de chat que requieran respuesta. Revisados archivos shared/memory — todo OK.	f	2026-03-31 19:02:57.841	2026-03-31 19:02:57.915
cmnezigk10003hz1wlkolmm02	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 18:55 UTC / 02:55 MYT — Sistema MyCompi sigue inactivo. Pipeline vacío (0 hot, 0 warm, 0 cold). Sin leads nuevos ni seguimientos. Research semanal vigente del 2026-03-31. Sin cambios desde último heartbeat. Sistema necesita datos CRM para operar.	f	2026-03-31 19:02:58.13	2026-03-31 19:02:58.131
cmnezigpo0005hz1wmwb0d79g	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-03-31T18:45Z. Sin incidencias. Sin procesos PM2 activos, sin logs de errores, sin automatizaciones corriendo en este host. Todo tranquilo.	f	2026-03-31 19:02:58.332	2026-03-31 19:02:58.334
cmnezigve0007hz1wuqre7r67	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat Diana activo. Sistema MyCompi sigue dormant (sin actividad en producción). Sin cambios desde último heartbeat. No hay acceso a Neon DB - métricas no disponibles. Sin anomalías detectadas. Strategy proposals actualizadas con proposal de churn prediction para Carlos.	f	2026-03-31 19:02:58.539	2026-03-31 19:02:58.54
cmnezihas0009hz1wd0bpenkr	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 02:35 AM — Ambos endpoints responding 200. SSL vigente. sitemap.xml sigue devolviendo HTML en lugar de XML (el servidor no tiene un sitemap real, solo es served como fallback). Build dist sigue en .gitignore. Sin cambios en landing/. Sitio estable, sin incidencias.	f	2026-03-31 19:02:59.092	2026-03-31 19:02:59.094
cmnezihgs000bhz1wzaqwbuiv	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-03-31T18:45Z. Sin trabajos pendientes en cola. Sprint backlog vacío (plantilla sin populate). Sin issues activos. Todo tranquilo.	f	2026-03-31 19:02:59.309	2026-03-31 19:02:59.312
a9510021-4514-45fe-8053-8dc1f1d2f1bb	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	INFO	✅ Trabajo aprobado: 📧 Preparar emailing de bienvenida para el cliente	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:21.09	2026-03-31 19:35:21.09
2e2c808f-0675-410a-ba49-5bb88c534d99	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	INFO	✅ Trabajo aprobado: 🎯 Outreach: identificar 10 leads en sector del cl	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:21.582	2026-03-31 19:35:21.582
80c342d1-9bb5-4afc-a4a5-e23f1b298050	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	INFO	✅ Trabajo aprobado: 📊 Análisis competitivo: 3-5 competidores directos	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:22.048	2026-03-31 19:35:22.048
2489d9a3-fab9-4206-b5c7-7a8221a98c92	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	INFO	✅ Trabajo aprobado: 🤖 Implementar primera automatización de proceso	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:22.864	2026-03-31 19:35:22.864
2f228a1e-bfec-4268-b404-2b74260ed79b	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	INFO	✅ Trabajo aprobado: 📈 Primer reporte de métricas: retención y uso	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:23.344	2026-03-31 19:35:23.344
9b95fd1c-8aec-47cd-bcd0-6da477acdc07	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	INFO	✅ Trabajo aprobado: 🎯 Escalar outreach si hay respuesta positiva	Aprobado con nota: Aprobado por Alberto — ejecuten	f	2026-03-31 19:35:24.288	2026-03-31 19:35:24.288
cmnf1n2u70001et1e06bf0wgd	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada. 5 trabajos disponibles. Ningún trabajo ejecutable en heartbeat 20min sin инструменты adicionales. Siguiente: bandeja de entrada si hay emails.	f	2026-03-31 20:02:32.858	2026-03-31 20:02:32.923
cmnf1n32y0003et1eogfmdn8f	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin actividad. No hay campanas ni leads en sistema. Todo tranquilo.	f	2026-03-31 20:02:33.179	2026-03-31 20:02:33.18
cmnf1n3930005et1ex92veroq	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sprint backlog vacío (plantilla sin datos activos). No hay deliverable pendientes en cola de revisión. Agentes en stand-by. Sin actividad detectada en el último ciclo. Heartbeat 03:47 KL — madrugada.	f	2026-03-31 20:02:33.399	2026-03-31 20:02:33.401
cmnf3s6y20007et1e87h27nee	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Heartbeat 04:10 KL. Sin anomalías. Sin APIs de marketing conectadas — sin visibilidad en campañas/leads.	f	2026-03-31 21:02:30.013	2026-03-31 21:02:30.79
cmnf3s7740009et1eer5vqa7p	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Leads B2B identificados: Clínicas dentales, e-commerce, despachos jurídicos, agencias digitales, centros estéticos, restaurantes, academia, consultoría RRHH, veterinaria. Email bienvenida listo. Outreach pendiente de ejecutar.	f	2026-03-31 21:02:31.025	2026-03-31 21:02:31.026
cmnf5xtfg0001d01eumkp2tg6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat rutinario #21:43 UTC. Cola con 5 trabajos disponibles (3 Alta, 2 Media). Sin actividad en bandeja de entrada, tickets ni chat. Sin feedback nuevo que clasificar. Situación sin cambios — pendiente de integración real de sistemas de soporte.	f	2026-03-31 22:02:52.348	2026-03-31 22:02:52.368
cmnf5xtm30003d01ehu8bo5li	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Heartbeat matutino (5:44 KL). Sin datos de campañas/leads/competencia en workspace. Todo OK, sin urgencia. Sugerencia: integrar métricas de ads con workspace para heartbeats más útiles.	f	2026-03-31 22:02:52.587	2026-03-31 22:02:52.588
cmnf84xfe0001bg1ekgyok61f	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola revisada. Job CRITICA 'Investigar empresa' ya completado en heartbeat anterior. Siguiente en prioridad: análisis competitivo (3-5 competidores directos) y primer reporte de métricas. Sin anomalías detectadas en métricas — solo 2 pagos de 10 registros (tasa conversión 20%), lo cual es已知 y en investigación.	f	2026-03-31 23:04:23.354	2026-03-31 23:04:23.408
cmnfadnsa0001do1e7hp4sk8w	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 01/04/2026 07:55 KL. Jobs email fríos siguen BLOQUEADOS sin herramienta outbound. Investigación de sectores: encontrados 2 leads nuevos en sector consultoría/servicios B2B (HIKE & FOXTER - Barcelona, y ASENTA - Bilbao/Barcelona/Madrid). Sectores manufacture, financiera, construcción siguen sin cubrir. Lead nuevo guardado en output/new-leads-sectors-2026-04-01.md.	f	2026-04-01 00:07:09.994	2026-04-01 00:07:10.021
cmnfadnz00003do1evlw9ur40	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Diana despierta con 6 trabajos disponibles. Ejecutado análisis competitivo profundo de 5 competidores (Freshdesk, Zendesk, Intercom, eesel, Crisp). Insight clave: MyCompi se diferencia por 7 agentes especializados por €49/mes flat — ningún competidor ofrece esto. Positioning recomendado: MyCompi compite con 'equipo de empleados virtuales', no con 'soporte AI'.	f	2026-04-01 00:07:10.237	2026-04-01 00:07:10.237
cmnfado4u0005do1e8kcnxw05	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola con 4 tareas ALTA de desarrollo MVP. Site mycompi.es no responde. Landing no construida (sin dist/). Producto no está en producción. Sistema inactivo desde hace 9 días. Los jobs disponibles son tareas de desarrollo que requieren contextocollaboración con Alberto/Paco, no ejecutables enlatados en heartbeat.	f	2026-04-01 00:07:10.446	2026-04-01 00:07:10.446
cmnfadoag0007do1eu6ivzd2n	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente en cola. Última revisión completa a las 04:47Z (Carlos leads + email bienvenida con condiciones, Diana competitor analysis APPROVED). Sin deliverables nuevos ni blockers abiertos. Sprint backlog vacío. Siguiente revisión en 30 min.	f	2026-04-01 00:07:10.649	2026-04-01 00:07:10.649
cmnfccv7s0001fc1ep1z52vhj	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola leída: 5 trabajos disponibles. Script feedback (ID 2b5d684d) tiene error de esquema: columna 'ejecutor' no existe en tabla Trabajo. No ejecuto db push --accept-data-loss. Escalo a Paco.	f	2026-04-01 01:02:32.195	2026-04-01 01:02:32.25
cmnfccvfh0003fc1enmk9rckc	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Sin métricas de campañas en tiempo real. APIs de ads no conectadas. Competidores: TypingMind ($39 one-time), Chatbase/SiteGPT. MyCompi tiene diferenciador claro con personaje compi.	f	2026-04-01 01:02:32.477	2026-04-01 01:02:32.478
cmnfccvl60005fc1eirirgn6g	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Pipeline activo con 5 leads verificados listos para outreach y 10 leads adicionales identificados en work/. Job CRITICA#1 se activará cuando haya métricas de respuesta. Jobs ALTA#1 y ALTA#2 bloqueados por dependencias y credenciales. El trabajo más inmediato es configurar acceso a email del cliente para poder ejecutar email frío personalizado. Research de trends B2B 2026 actualizado en strategy-proposals.md.	f	2026-04-01 01:02:32.682	2026-04-01 01:02:32.684
cmnfccvqp0007fc1efea0rrui	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Tarea CRITICA «email automático de bienvenida a nuevos leads» ya está implementada en handleCheckoutCompleted() de stripe.js — disparada por webhook de Stripe. No requiere trabajo adicional. Automatización operativa.	f	2026-04-01 01:02:32.882	2026-04-01 01:02:32.883
cmnfccwaj0009fc1eqgwl8mh3	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola con 6 trabajos disponibles. Trabajos críticos de investigación ya completados en latidos anteriores. Solo 1 cliente paying (AlberBEE) con MRR €98. Tasa conversión 20% (2/10). 8 registros nuevos en ~1 semana pero no activan pago. Problema de activación confirmado.	f	2026-04-01 01:02:33.595	2026-04-01 01:02:33.597
cmnfccwh6000bfc1e2xf3w6u8	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 2026-04-01 08:38 MYT. Web funcionando. Cola con 4 trabajos disponibles (tag #semana-1 #dia-2 MVP). Research web dev trends 2026 ya registrado en strategy-proposals.md (Elena propuso MCP, Diana propuso churn model, Marcos propuso 7 proposals). Site: 200 OK.	f	2026-04-01 01:02:33.835	2026-04-01 01:02:33.836
cmnfccwmz000dfc1et85aztl5	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverable nuevo que revisar. Cola vacía (no hay trabajos pendientes en /cola ni archivos nuevos en output/). Reviews activos: email-bienvenida.md (Carlos) sigue WITH_CONDITIONS — 3 issues 🟡 abiertos sin resolución del agente. Sprint backlog vacío (plantilla sin uso activo). Sin blockers activos. Sin anomalías detectadas. Esperando nuevos deliverable de Enzo/Carlos/Diana. Siguiente ciclo: 30 min.	f	2026-04-01 01:02:34.044	2026-04-01 01:02:34.045
cmnfeiiyl0001fg1eto108xyz	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Ejecutado el job de feedback. No existen registros de Feedback ni Emails en el sistema todavía (MyCompi en fase inicial). Job marcado como COMPLETED.	f	2026-04-01 02:02:55.48	2026-04-01 02:02:55.535
cmnfeij6j0003fg1eft35facx	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 09:55 UTC. Leads pendientes verificados: Uhaitz (❌ DNS fail), Peter Lead (❌ DNS fail), IOMarketing (✅ activo Madrid). Pipeline actualizado a 8 leads verificados. Preparados 8 emails personalizados para outreach. ConTesta eliminado. Ballou PR descartado.	f	2026-04-01 02:02:55.772	2026-04-01 02:02:55.773
cmnfeijcd0005fg1eod83jbs8	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat matutino (miércoles 9:45 AM MYT). Cola con 5 trabajos disponibles. Trabajo CRITICA prioritario: primera automatización de proceso (welcome email a leads). Sin incidencias en sistemas. Sin automatizaciones nuevas creadas.	f	2026-04-01 02:02:55.982	2026-04-01 02:02:55.983
cmnfeijtr0007fg1e93evmvl2	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Completado trabajo CRITICA de investigación de empresa/sector/competencia. Detectadas 2 alarmas críticas: (1) 9/10 clientes son tests sin pago real, MRR real de solo 98€; (2) solo 2 usuarios activos de 10 registrados. Documentos MISION y USER_RESEARCH guardados en BD.	f	2026-04-01 02:02:56.607	2026-04-01 02:02:56.609
cmnfeijzk0009fg1ecf84xd1x	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola con 4 trabajos ALTA disponibles. Web del cliente NO RESPONDE (curl error 6 - connection refused). SSL y site caídos. Incidencia crítica detectada.	f	2026-04-01 02:02:56.816	2026-04-01 02:02:56.817
cmnfeik5g000bfg1e03457f57	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-01 01:17 UTC. Sistema MyCompi sigue inactivo (9 días sin deploy activo según Marcos). Carlos tiene deliverables nuevos sin revisar (leads-verificados, new-leads-sectors). Estado general: todo el sistema en standby awaiting product deployment. No hay blockers activos de revisión previa. Research done: ninguna anomalía detectada.	f	2026-04-01 02:02:57.028	2026-04-01 02:02:57.029
cmnfgn8hf0001fw1e6zxq3nhp	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta prioridad, 3 media). Sin actividad previa que continuar. Siguiente latido: 20 min.	f	2026-04-01 03:02:34.414	2026-04-01 03:02:34.473
cmnfgn8rv0003fw1eeh9asi92	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola con 5 trabajos. Emails outreach ya preparados para 8 leads (Digital Hamster, Nostos, LaMagnética, ELEVAM, Rload, IOMarketing, HIKE & FOXTER, ASENTA). 10 leads adicionales enriquecidos y 10 más identificados esperando outreach. El trabajo CRITICA requiere monitorizar respuesta >5% para escalar. Los trabajos ALTA/MEDIA requieren ejecución externa (email/LinkedIn API) no disponible en este canal.	f	2026-04-01 03:02:34.795	2026-04-01 03:02:34.796
cmnfgn8ye0005fw1eg5sxje0j	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Ejecutados 2 trabajos CRITICA. Análisis competitivo: MyCompi priced at €49 vs $89-195 competencia, 7 agents vs 1. Reporte métricas: MRR €49 real, 10 cuentas (9 tests), engagement cero, activation ~10%, sin histórico para churn. Alertas: MRR crítico, engagement zero, 90% cuentas inactivas.	f	2026-04-01 03:02:35.031	2026-04-01 03:02:35.032
cmnfgn94q0007fw1e1xej0hk2	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web up (200). 4 jobs ALTA en cola — todas tareas de desarrollo MVP y features. Sin docs de briefing visibles en workspace. Git activo con commits recientes de agent-queue-reader y approval system. Site funcional.	f	2026-04-01 03:02:35.258	2026-04-01 03:02:35.26
cmnfgn9af0009fw1e2cl1lizd	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Dos reportes de Diana revisados y APPROVED. Metrics report: sólido para ser el primero, flags correctos de limitaciones de datos, JSON snapshot listo para dashboard. Competitor analysis: completo y bien estructurado, insight de pricing vs empleado real es el mensaje correcto. Sin blockers. Issues menores capturados en reviews.json.	f	2026-04-01 03:02:35.464	2026-04-01 03:02:35.465
cmnfi9qby0001fu1ezo39k1r4	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 11:20 AM MYT. Cola revisada: 4 trabajos disponibles (3 MEDIA, 1 ALTA). Trabajo ALTA es 'Atender emails de soporte entrantes' pero no hay bandeja de entrada configurada (Himalaya sin configurar). Sin emails pendientes ni tickets concretos detectados. Sin acción requerida.	f	2026-04-01 03:48:03.599	2026-04-01 03:48:03.604
cmnfi9qi00003fu1e40qpmmeq	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 11:31 MYT. 10 emails fríos personalizados preparados para los leads del pipeline (Dental Sonría, NaturVital, LEX25, MakeWeb, BellaLua, El Rinconcito, UniPrep, TechZone, HR Simple, VetMascota). Lead #11 nuevo identificado: IOMarketing (Madrid) — agencia marketing 360º, ángulo diferenciado. Job CRITICA no se activa (sin datos de respuesta >5% aún). Pipeline: 2 HOT, 5 WARM, 0 cold. Outreach emails listos para envío (pendiente integración email tool).	f	2026-04-01 03:48:03.817	2026-04-01 03:48:03.817
cmnfi9qnq0005fu1eeqhtjdoa	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Completado trabajo ALTA de configurar dashboard de métricas del cliente. Creado BusinessMetricsTab.jsx con KPIs de negocio (MRR, signups, activation, engagement, churn) y métricas de funnel. El tab actual está listo para conectar a endpoint /api/admin/metrics/business real. Trabajo marcado COMPLETED en BD.	f	2026-04-01 03:48:04.023	2026-04-01 03:48:04.024
cmnfi9qtg0007fu1eddvcjwrb	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Landing OK (HTTP 200). Hay 4 trabajos en cola, todas ALTA prioridad. No hay incidencia técnica ni en producción. Sin briefing específico no puedo tomar el primero — necesito contexto del cliente. Propuesta técnica: FAQ schema markup (fácil, 1-2h) y Cloudflare CDN proxy (30min, free).	f	2026-04-01 03:48:04.228	2026-04-01 03:48:04.23
cmnfisbml0009fu1el190yac6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola disponible: 4 trabajos pendientes (1 alta, 3 media). No hay mensajes de clientes ni tickets urgentes. Revisado estado de bandeja.	f	2026-04-01 04:02:30.315	2026-04-01 04:02:31.057
cmnfisbv9000bfu1eyjfhqrk1	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 11:55 MYT. Seguimiento de outreach marcado completado. 5 trabajos disponibles en cola. CRITICA (escalado si respuesta>5%) no ejecutable sin métricas de respuesta. ALTA (email frío a 10 leads) no ejecutable - hay leads PREPARADOS pero sin email ni API de envío configurada. Leads verificados (8) tienen LinkedIn como contacto principal, no emails directos. Necesario: approval del cliente para usar Resend o integrar herramienta de cold email (Smartlead/Instantly). Leads sin contacto directo válido para outreach email requieren enrichment adicional.	f	2026-04-01 04:02:31.317	2026-04-01 04:02:31.318
cmnfisc1u000dfu1ev4jr0fme	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajos pendientes en cola. Última revisión: Carlos (email-bienvenida - WITH_CONDITIONS, hace ~1h) y Diana (competitor-analysis - APPROVED, hace ~2h). No hay deliverable nuevo esperando revisión.	f	2026-04-01 04:02:31.554	2026-04-01 04:02:31.555
cmnfkxz780001c81ekr1ob1ba	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Email sin configurar en himalaya (error TTY). Agenda: Alta prioridad - atender emails soporte. Media - revisar emails bienvenida, configurar inbox respuestas automáticas, survey satisfacción.	f	2026-04-01 05:02:54.068	2026-04-01 05:02:54.118
cmnfkxzfh0003c81erpxjllsb	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola con 2 trabajos: CRITICA (escalar outreach si respuesta >5%) y MEDIA (10 leads adicionales). Emails fríos preparados pero aún no enviados (sin integración email API). Pipeline caliente con 8 leads verificados. Pendiente: integración email para poder ejecutar outreach real.	f	2026-04-01 05:02:54.366	2026-04-01 05:02:54.367
cmnfkxzl90005c81euykxkc1n	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Ejecutados 2 trabajos: análisis de canales de adquisición y reporte semanal. MyCompi sin sistema de tracking de acquisition. 1 cliente real (AlberBEE) con €49 MRR. Engagement cero. Trial de 29 días activo.	f	2026-04-01 05:02:54.573	2026-04-01 05:02:54.574
cmnfkxzuu0007c81elkhe6ghy	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site UP (200 OK). La landing sirve contenido estático desde public/ correctamente. Admin y chat panels funcionan. Jobs en cola no tienen contexto de cliente real ni briefing — Marcos no puede ejecutar feature work sin eso. No hay errores críticos.	f	2026-04-01 05:02:54.918	2026-04-01 05:02:54.919
cmnfky00b0009c81er9ufica6	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente. Sprint backlog vacío (plantilla). Reviews anteriores: 5 deliverables (Carlos, Diana). No hay deliverable nuevo desde última revisión. Cola limpia. Reporte semanal Diana revisado — sin action items QA. Research semanal ya realizado (2026-03-31). Todo en orden.	f	2026-04-01 05:02:55.115	2026-04-01 05:02:55.116
cmnfn2r140001do1eeyeydl0z	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos (1 alta, 3 media). Sin acceso funcional a email ni tickets - same blocker since yesterday. No se puede ejecutar trabajos de soporte real.	f	2026-04-01 06:02:35.987	2026-04-01 06:02:36.055
cmnfn2r9q0003do1ev6hff1u3	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 05:31 UTC. Job CRITICA sigue NO_EJECUTABLE (emails PREPARADO no enviados, sin datos reply rate). Job MEDIA en EN_PROCESO - leads segunda ronda identificados. Pipeline: 8 leads verificados (2 hot, 5 warm, 1 medium). ⚠️ 48h+ sin respuesta en primera ronda → protocolo indica pivotar a LinkedIn/teléfono para leads sin respuesta. Pendiente: integración herramienta de email para envío real.	f	2026-04-01 06:02:36.302	2026-04-01 06:02:36.304
cmnfn2rfb0005do1ef3yu2ksa	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas sin cambios vs reporte de esta mañana: MRR €49, 1 cliente real (AlberBEE) en trial de 30 días (fin ~2026-04-30), 9/10 cuentas son test/seed. Sin engagement real aún (0 mensajes, 0 interacciones). Activation rate ~10%. Sin anomalías nuevas detectadas.	f	2026-04-01 06:02:36.504	2026-04-01 06:02:36.506
cmnfn2rkv0007do1e7rxktmoj	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Cola leída: 4 trabajos ALTA disponibles. Web UP (HTTP 200, SSL OK). Job #1 (Construir MVP) requiere briefing validado por Paco — no disponible en sesión actual. Jobs #2-4 también pendientes. Site funcionando correctamente.	f	2026-04-01 06:02:36.704	2026-04-01 06:02:36.706
cmnfn2rqf0009do1e0526mmh3	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-01 05:45 UTC. Sin deliverables pendientes de revisión. Reviews.json al día — último trabajo: Carlos email-bienvenida (WITH_CONDITIONS, placeholders sin resolver) y leads-identificados (APPROVED). Diana: 2 reports APPROVED. Sprint backlog sin tareas activas. Sin blockers activos. Siguiente heartbeat ~06:15 UTC.	f	2026-04-01 06:02:36.903	2026-04-01 06:02:36.906
cmnfrdjw30001c11e8xenuq4s	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta prioridad - emails soporte, 3 media). Sin acceso real a email/tickets/chat - no hay processor configurado. Sin acción requerida.	f	2026-04-01 08:02:58.419	2026-04-01 08:02:58.478
cmnfrdkhx0003c11ehw1hdiza	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 15:55 MYT. Cola: 2 jobs disponibles. Job CRITICA (escalada outreach >5% reply rate) NO EJECUTABLE — 0 emails enviados, 10 emails PREPARADOS pero sin envío real (pendiente integración Resend). Job MEDIA (segunda ronda 10 leads) EN PROCESO — leads identificados, mismo bloqueo de envío. Resend API key configurada pero scripts de envío no implementados. Pendiente: pipeline de envío real para medir reply rates.	f	2026-04-01 08:02:59.205	2026-04-01 08:02:59.206
cmnfrdkoz0005c11effldlbxg	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola limpia — sin deliverables pendientes. Última actividad: revisión Carlos y Diana hace ~3h (04:47 UTC). Backlog vacío, sin issues abiertos, sin trabajo nuevo en output folders de Enzo, Carlos, Diana, Elena ni Marketing. Sin blockers activos.	f	2026-04-01 08:02:59.459	2026-04-01 08:02:59.46
cmnfxsyf60001d61e4avrdgnp	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola de soporte vacía. No hay emails, tickets ni chats pendientes. Todo en orden.	f	2026-04-01 11:02:54.787	2026-04-01 11:02:54.817
cmnfxsyvw0003d61espo4rx71	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Heartbeat 2026-04-01 16:31 UTC. Emails fríos aún no enviados (estado PREPARADO). No hay métricas de reply rate. Escalation job no ejecutable sin datos de envío. Segunda ronda leads identificados pero bloqueada por falta de respuesta round 1. Pipeline: hot=2, warm=5, medium=1, total=8. Leads enriquecidos verificados: Digital Hamster, Nostos Marketing, LaMagnética, ELEVAM, Rload Studio, Ballou PR.	f	2026-04-01 11:02:55.388	2026-04-01 11:02:55.39
cmnfxsz1q0005d61eeu0x0kuv	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sistema MyCompi inactivo — 9 días sin actividad en producción. No hay métricas de usuario, ni dashboards activos, ni datos de Neon/analytics disponibles. Sin anomalías detectadas ni oportunidades de growth sin datos.	f	2026-04-01 11:02:55.599	2026-04-01 11:02:55.6
cmnfxsz7p0007d61e9cp89azh	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site DOWN (mycompi.onrender.com no responde). Landing sin build (no existe dist/). 3 commits locales sin pushear a origin/main. Todas las tareas de la cola están bloqueadas — producto no deployado. Es necesario push + verificar build en Render.	f	2026-04-01 11:02:55.813	2026-04-01 11:02:55.815
cmnfxszde0009d61ejrjk5yd0	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverables pendientes de revisión. Carlos email-bienvenida sigue con 3 issues 🟡 pendientes (placeholders sin procesar, sección HTML vacía, subject line sin A/B testear). No hay nuevos entregables en cola desde el último heartbeat. Sprint-backlog = plantilla vacía. Enzo no tiene output todavía.	f	2026-04-01 11:02:56.018	2026-04-01 11:02:56.02
cmnfzzoyj0001fb1emvhev2gz	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 ALTA: emails soporte). Sin emails nuevos, tickets ni chats pendientes. IMPORTANTE: Site mycompi.onrender.com está CAÍDO según notificación de Marcos (11:02 UTC). Landing sin build (no existe dist/). 3 commits locales sin pushear. Esto bloquea todo el producto. También: Carlos tiene emails fríos listos para enviar pero sin Resend configurado. Diana reporta 9 días sin actividad en producción.	f	2026-04-01 12:04:08.342	2026-04-01 12:04:08.401
cmnfzzp6q0003fb1e5r8nx5jb	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Job CRITICA (escalada outreach) sigue en estado NO_EJECUTABLE — emails siguen en PREPARADO, no hay datos de envío real. Job MEDIA (segunda ronda 10 leads) completado en latido anterior. Pipeline confirmado: 2 hot, 5 warm, 1 cold = 8 leads. Sin emails enviados no hay métricas de reply rate para escalar outreach.	f	2026-04-01 12:04:08.642	2026-04-01 12:04:08.643
cmnfzzpc90005fb1edcik2zom	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas de prueba: 10 clientes (9 BASIC, 1 COMPLETO), 44 trabajos (31 TODO, 12 COMPLETED, 1 IN_PROGRESS). Sin anomalías. Sin datos de MRR/churn/reales — todos los clientes activos son cuentas de test/setup.	f	2026-04-01 12:04:08.842	2026-04-01 12:04:08.843
cmnfzzpid0007fb1e329x2m7r	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site up (200). Sitemap up (200). 4 trabajos ALTA en cola sin aprobaciones pendientes. No hay incidencias técnicas detectadas. Los 4 trabajos disponibles requieren contexto de briefing del cliente para ejecutarse — apropiado para sesión de trabajo dedicada.	f	2026-04-01 12:04:09.061	2026-04-01 12:04:09.063
cmnfzzpo10009fb1eegocxu0o	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola de deliverable vacía — no hay trabajos pendientes de revisión QA. Discrepancia detectada: Marcos reporta sitio UP (200 OK) pero Laura reporta CAÍDO (mycompi.onrender.com no responde, 3 commits sin pushear, landing sin build). Esto requiere resolución antes de cualquier entrega. Sprint backlog no tiene tareas activas definidas — solo plantilla.	f	2026-04-01 12:04:09.265	2026-04-01 12:04:09.267
cmng23c7s0001df1esmejvcff	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada — 4 trabajos disponibles. Prioridad alta: atender emails de soporte (fe8072aa). No se pudo ejecutar por no tener acceso email configurado en himalaya. Notificado a Paco.	f	2026-04-01 13:02:57.688	2026-04-01 13:02:57.735
cmng23cgb0003df1emp7d5rar	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola MyCompi vacía. Pipeline sin cambios - 0 disponibles, 0 pendientes aprobación. Estrategia proposals ya actualizadas (semana 2026-03-31). Sin acciones urgentes.	f	2026-04-01 13:02:57.996	2026-04-01 13:02:57.997
cmng23clv0005df1e49ejswz2	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola activa con 5 trabajos. Ninguna incidencia detectada. Tarea CRITICA disponible (primera automatización) pero requiere contexto adicional del cliente para ejecución.	f	2026-04-01 13:02:58.195	2026-04-01 13:02:58.197
cmng23crn0007df1eiimi72wg	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacia. Sin trabajos pendientes. MRR estable en 98€ (2 suscripciones BeeNoCode test). Sin anomalias detectadas. Producto en fase de validacion interna.	f	2026-04-01 13:02:58.403	2026-04-01 13:02:58.405
cmng23cxf0009df1ea97wrl3n	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat activo. Web mycompi.onrender.com funcionando (HTTP 200). SSL ok. 4 trabajos en cola (ALTA) pero ninguno requiere acción inmediata — son tareas de desarrollo general sin briefing técnico específico adjunto. Site sin errores detectados.	f	2026-04-01 13:02:58.612	2026-04-01 13:02:58.614
cmng23d3t000bdf1ecz35r4pd	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Backlog revisado — sin deliverables pendientes de QA. Carlos: emails siguen en estado PREPARADO (no enviados), pipeline intacto pero bloqueado por falta de integracion de envio. Diana: outputs de investigacion son research, no deliverables para review. Sin blockers activos. Siguiente check en 30 min.	f	2026-04-01 13:02:58.842	2026-04-01 13:02:58.844
cmng48ga70001bw1e3vz5e2vc	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Sin bandeja de entrada accesible (himalaya sin configurar). Sin emails ni tickets pendientes visibles.	f	2026-04-01 14:02:55.471	2026-04-01 14:02:55.532
cmng48gsa0003bw1erqwdb4l1	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola de trabajo vacía. Sin trabajos pendientes ni disponibles. No hay acceso a datos de pipeline/CRM en este heartbeat. Todo listo.	f	2026-04-01 14:02:56.123	2026-04-01 14:02:56.125
cmng48gxx0005bw1e8cnhn3jt	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada: 5 trabajos disponibles. Prioridad CRITICA detectada: primera automatización de proceso. Sin incidencias en sistemas. Sin automatizaciones activas aún.	f	2026-04-01 14:02:56.325	2026-04-01 14:02:56.327
cmng48h420007bw1edsnncnsu	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas sin cambios respecto al último report (2026-04-01). Situación crítica: MRR €49, 1 cliente real, engagement cero. No hay anomalías nuevas detectadas.	f	2026-04-01 14:02:56.547	2026-04-01 14:02:56.549
cmng48h9r0009bw1erajckpqe	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Health check OK: landing 200, admin 200, chat 200, SSL vigente (expira Jun 2026). 4 trabajos ALTA disponibles. Sitio funcionando. Sin incidencias detectadas.	f	2026-04-01 14:02:56.752	2026-04-01 14:02:56.753
cmng48hf8000bbw1elall6qkk	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-01 13:47 UTC. Sin trabajo pendiente en cola. Sprint backlog en formato template (sin datos activos). Última revisión: 04:47 UTC — 5 deliverables hoy (4 APPROVED, 1 WITH_CONDITIONS email-bienvenida Carlos). Sin blockers activos.	f	2026-04-01 14:02:56.948	2026-04-01 14:02:56.95
cmng6d4fs0001ew1eeijztt7u	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] 4 trabajos en cola (1 ALTA: emails soporte, 3 MEDIA). Sistema de email de MyCompi procesa inbound emails automáticamente via webhook Resend + OpenClaw (Paco). Bandeja de entrada no requiere intervención manual de Laura en este flujo. Sin emails pendientes de atención manual. Sin tickets nuevos.	f	2026-04-01 15:02:32.627	2026-04-01 15:02:32.697
cmng6d4oi0003ew1ev8oecsgx	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline intacto: 8 leads (2 hot, 5 warm, 1 cold). Sin trabajos pendientes de ejecución. Bloqueo activo: integración cold email tool sigue pendiente (jobs CRITICA y MEDIA en espera de resolución).	f	2026-04-01 15:02:32.946	2026-04-01 15:02:32.947
cmng6d4uc0005ew1efqso0u5e	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat completado. Web mycompi.onrender.com UP (200). 4 trabajos disponibles en cola, todos ALTA. Sin incidencias detectadas.	f	2026-04-01 15:02:33.157	2026-04-01 15:02:33.158
cmng6d50e0007ew1ezlt5yoqw	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola limpia. Sprint backlog vacío. No hay deliverables pendientes de revisión en este ciclo. Elena tiene propuesta de automatización en espera de APPROVAL de Paco/Alberto — no requiere QC hasta que sea implementación completada. Diana reports — no son deliverables de agente sino outputs de research, no aplican quality gates.	f	2026-04-01 15:02:33.374	2026-04-01 15:02:33.376
cmnganfav00019h1e7gpwm3ma	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos disponibles. Alta prioridad (fe8072aa) sobre atender emails de soporte bloqueado por falta de integración email. Trabajos de media prioridad (configurar inbox, survey satisfacción) también requieren acceso a plataforma de email o credenciales. Sin acceso a email processor, Laura no puede ejecutar su trabajo principal.	f	2026-04-01 17:02:31.735	2026-04-01 17:02:31.79
cmnganfjn00039h1e3nbxmk3s	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Sin leads en pipeline visible (CRM no conectado). Sin cambios de estado.	f	2026-04-01 17:02:32.051	2026-04-01 17:02:32.053
cmnganfp400059h1elcdytle2	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas sin cambios — MRR €49, 1 cliente real AlberBEE en trial (29 días restantes). Sin anomalías detectadas. Engagement sigue en 0, sin mensajes ni interacciones. Sin nuevos insights que requieran acción inmediata.	f	2026-04-01 17:02:32.249	2026-04-01 17:02:32.25
cmnganfv100079h1exllluq6r	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat 2026-04-01 16:34 UTC. Web mycompi.onrender.com NO responde (HTTP 000). Cola tiene 4 trabajos ALTA pero no procedo hasta resolver caida. Incidencia crITICA: web inaccesible desde exterior. Posibles causas: Render service down, timeout, o problema de red. Requiero investigacion.	f	2026-04-01 17:02:32.461	2026-04-01 17:02:32.463
cmngcskq70001a41ejjkynmvt	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos activos (1 ALTA: atender emails soporte, 3 MEDIA). Sistema email procesa inbound automáticamente via webhook Resend+OpenClaw. Sin acceso a bandeja himalaya (sin config TTY). Sin emails ni tickets pendientes que requieran acción manual.	f	2026-04-01 18:02:31.273	2026-04-01 18:02:31.345
cmngcskys0003a41e1uz23scq	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline intacto: 8 leads (2 hot, 5 warm, 1 cold). Sin cambios desde último heartbeat. Todo en orden. Bloqueo principal sigue siendo la integración cold email tool (Resend/Smartlead/Instantly).	f	2026-04-01 18:02:31.588	2026-04-01 18:02:31.589
cmngcsl4p0005a41egh75mz2f	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacia. Sin trabajos pendientes. Datos sin cambios desde ayer: MRR €49, 1 cliente real (AlberBEE trial 29 dias), 9/10 cuentas test, engagement cero, sin acquisition tracking. Sin anomalias detectadas.	f	2026-04-01 18:02:31.802	2026-04-01 18:02:31.803
cmngcslau0007a41ek30ao9ja	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site mycompi.onrender.com OK (HTTP 200, SSL OK). Cola: 4 trabajos disponibles pero sin contexto de proyecto activo — no ejecutados. Sprint backlog vacío.	f	2026-04-01 18:02:32.023	2026-04-01 18:02:32.024
cmngcslgo0009a41epu84l4hf	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente. Backlog vacío, ningún deliverable nuevo de Enzo, Carlos, Diana u otros agentes esperando revisión. Cola clara. Siguiente revisión en próximo heartbeat.	f	2026-04-01 18:02:32.232	2026-04-01 18:02:32.233
cmngexqvw0001cb1ezv86yjc3	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola leída: 4 trabajos disponibles. Sin bandeja de entrada activa ni emails pendientes detectable. Carpeta inbox no existe aún en filesystem — probablemente la crea el cliente al configurar soporte. Siguiente heartbeat en 20 min.	f	2026-04-01 19:02:31.767	2026-04-01 19:02:31.85
cmngexr4i0003cb1etk39tt67	cmn3je5zq0000e31xg8wru9iy	Enzo	INFO	Enzo — actividad	[Enzo] Heartbeat nocturno activo. No hay campañas activas detectadas en el workspace ni datos de leads nuevos. Workspace sin datos de campañas en este momento.	f	2026-04-01 19:02:32.083	2026-04-01 19:02:32.084
cmngexrah0005cb1e2abt4aws	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos disponibles ni pendientes de aprobación. 2:55am MYT — horario fuera de negocio. Pipeline sin cambios. Sin urgencia. Próxima ventana activa: miércoles 02/04 9am MYT.	f	2026-04-01 19:02:32.298	2026-04-01 19:02:32.299
cmngexrg40007cb1esi4f6wpc	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Sin métricas nuevas disponibles en archivos locales. Heartbeat de madrugada — sin anomalías detectadas.	f	2026-04-01 19:02:32.5	2026-04-01 19:02:32.502
cmngexrls0009cb1ehzielz9o	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] mycompi.es CAÍDO por problema SSL/TLS. El sitio funciona en https://mycompi.onrender.com (health ok). Dominio mycompi.es apunta a 217.160.0.182 (1&1/IONOS) y da error SSL. 4 trabajos en cola sin ejecutar.	f	2026-04-01 19:02:32.705	2026-04-01 19:02:32.706
cmngh2wsm0001a51e0pyzclpi	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] 4 trabajos disponibles en cola (soporte, emails bienvenida, automatización, feedback). No hay emails pendientes en bandeja (sin configuración himalaya activa). Cola procesada sin incidencias.	f	2026-04-01 20:02:31.943	2026-04-01 20:02:31.978
cmngh2xa80003a51edc1ybu8f	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. No hay trabajos pendientes. Pipeline/CRM no disponible en schema actual.	f	2026-04-01 20:02:32.576	2026-04-01 20:02:32.577
cmngh2xg80005a51ed8y45yov	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes. Métricas sin cambios desde último reporte (2026-04-01). MRR sigue en €49, 1 cliente real (AlberBEE), trial de 30 días activo hasta 2026-04-30. Sin anomalías nuevas detectadas.	f	2026-04-01 20:02:32.793	2026-04-01 20:02:32.794
cmngh2xm40007a51etebd5a8q	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat inicial. 4 trabajos disponibles en cola de alta prioridad. Ningún trabajo pendiente de aprobación. Web no verificada en este latido (3:35 AM).	f	2026-04-01 20:02:33.005	2026-04-01 20:02:33.006
cmngh2xsa0009a51e474jfvhw	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola vacía — no hay deliverables pendientes de revisión. No hay archivos nuevos modificados desde el último heartbeat. Backlog de sprint no disponible (sprint-backlog.md no tiene contenido activo). No hay issues activos ni blockers. Siguiente check en 30 min.	f	2026-04-01 20:02:33.226	2026-04-01 20:02:33.227
cmngj82yu00018t1eliqljtlw	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 urgente, 3 medios). Bandeja de entrada vacía a las 4:40 AM — fuera de horario de atención. Sin acción requerida.	f	2026-04-01 21:02:32.447	2026-04-01 21:02:32.528
cmngj837g00038t1e68c5zvxc	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. No hay pipeline data disponible para revisar a esta hora.	f	2026-04-01 21:02:32.764	2026-04-01 21:02:32.765
cmngj83mz00058t1eksyb4muv	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. 5 trabajos disponibles. Tarea CRITICA identificada: primera automatización de proceso. Se requiere sesión interactiva para implementación.	f	2026-04-01 21:02:33.324	2026-04-01 21:02:33.325
cmngld8pf0001b71eq8mw6kr4	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola con 4 trabajos disponibles pero todos bloqueados por falta de acceso a email/inbox. Jobs de alta y media prioridad (fe8072aa, 1fda9348, 8c0d58b9, 3186358b) requieren credenciales IMAP/SMTP o integración de tickets. Sin bandeja de entrada configurada no hay acción posible para Laura. Incidencias y strategy proposals revisados - todo en orden. Actualizado heartbeat-state.json.	f	2026-04-01 22:02:32.397	2026-04-01 22:02:32.47
cmngniess0001cc1edj88a2eo	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta prioridad - emails de soporte, 3 media). Sin acceso a bandeja de entrada - IMAP/SMTP no configurado. Sin incidencias nuevas.	f	2026-04-01 23:02:32.807	2026-04-01 23:02:32.878
cmngnifbc0003cc1eogwx919h	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Heartbeat 2026-04-01 22:15 UTC. Cola con 5 trabajos disponibles. Prioridad CRITICA: primera automatización de proceso (email bienvenida leads). No hay incidencias en sistemas. Strategy proposals actualizado con trends 2026.	f	2026-04-01 23:02:33.481	2026-04-01 23:02:33.482
cmngnifh50005cc1ezrvnvz41	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat ejecutado. 4 trabajos HIGH disponibles en cola (semana 1-4). Sites no accesibles desde este entorno sandbox (red restringida). No hay incidencias críticas detectadas.Primera ejecución - sin heartbeat previo.	f	2026-04-01 23:02:33.689	2026-04-01 23:02:33.691
cmngnifmk0007cc1euysq1ffg	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Cola de deliverables vacía. Backlog limpio. Sin blockers activos. Reviews al día (5 deliverables revisados enelas últimas 24h, 4 APPROVED, 1 WITH_CONDITIONS para Carlos email-bienvenida). Sin issues pendientes de seguimiento. Próximo heartbeat en 30 min.	f	2026-04-01 23:02:33.884	2026-04-01 23:02:33.885
cmngpqcry0001bo1ekayy6ho5	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas sin cambios vs reporte semanal 2026-04-01: MRR €49, 1 cliente real, engagement cero, sin acquisition tracking activo. No hay trabajos pendientes ni anomalías. Estado estable — producto en validación temprana.	f	2026-04-02 00:04:42.67	2026-04-02 00:04:42.733
cmngpqd0f0003bo1ekp3qgyk5	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin deliverables pendientes. Última revisión活跃: Carlos (email-bienvenida WITH_CONDITIONS) y Diana (2 APPROVED). Sprint backlog vacío. No hay trabajos pendientes en cola de revisión. Alertas activas en seguimiento: MRR €49 (crítico), engagement cero, sin tracking de acquisition. Todo en orden — sin trabajo nuevo disponible.	f	2026-04-02 00:04:42.975	2026-04-02 00:04:42.976
cmngrt85u00019w1evk2ri4e0	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 00:40 UTC. Cola con 4 trabajos disponibles, todos bloqueados por falta de acceso a bandeja de entrada / sistema de tickets. Sin acción posible en este momento. Detectado gap de ~3h desde último heartbeat (21:40 UTC). Bloqueador principal: credenciales IMAP/SMTP o integración tickets no configuradas.	f	2026-04-02 01:02:55.891	2026-04-02 01:02:55.949
cmngrt8e800039w1ej8jiupos	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable. Bloqueo principal: integración cold email tool (Resend/Smartlead/Instantly) pendiente de approval de MyCompi. Sin seguimientos pendientes de más de 24h.	f	2026-04-02 01:02:56.192	2026-04-02 01:02:56.193
cmngrt8u000059w1e3dp3ddwj	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. Trabajo CRITICA (follow-up leads) sigue pendiente de approval - no se puede ejecutar aún. Resto de trabajos son MEDIA/planificación. Sin incidencias operativas. Research semanal ya en strategy-proposals.md.	f	2026-04-02 01:02:56.761	2026-04-02 01:02:56.761
cmngrt8zs00079w1eq3gpmwpy	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Heartbeat 2026-04-02 00:33 UTC. Cola vacía. Revisados últimos reports (01-abril): MRR €49 real, 1 cliente pagador (AlberBEE), 9/10 cuentas inactivas/test, activation rate ~10%, engagement 0. Sin anomalías nuevas detectadas. Producto en fase temprana — sin suficiente histórico para análisis de tendencias (mínimo 7 días necesarios). Sin trabajos pendientes en cola.	f	2026-04-02 01:02:56.968	2026-04-02 01:02:56.969
cmngrt95a00099w1eap7fxjxs	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat ejecutado. Web mycompi.onrender.com UP. 4 tareas ALTA en cola (MVP + integraciones) - requieren contexto adicional para ejecución. robots.txt returning HTML en vez de texto (posible 404). Sin incidencias nuevas.	f	2026-04-02 01:02:57.166	2026-04-02 01:02:57.167
cmngrt9b3000b9w1e8skrfg6h	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-02 00:47 UTC. Sin deliverables pendientes de revisión. Reviews.json sin actualizaciones desde ayer (01-abril). Sprint backlog vacío. Elena tiene automation-followup-leads.md en estado PENDIENTE_APPROVAL — no requiere revisión QA hasta que Paco/Alberto lo aprueben. Sin blockers ni issues activos. Sistema operativo.	f	2026-04-02 01:02:57.375	2026-04-02 01:02:57.376
cmngsfu2a000d9w1elgyftv26	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. 10 leads del job anterior (5717edc9) siguen en work/ sin outreach realizado (pendiente de validación de empresas y personalización). No hay datos de pipeline en CRM accesible desde este heartbeat. Próximo paso recomendado: validar las 10 empresas (web + LinkedIn) y empezar outreach priorizando los 7 leads ALTA.	f	2026-04-02 01:20:30.68	2026-04-02 01:20:30.714
cmngsfu8f000f9w1effedhs8h	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente de revisión. Sprint backlog vacío. Carlos tiene 8 leads verificados en cola (5717edc9) pero aún sin outreach — pendiente de su propia validación empresa+LinkedIn. Enzo sin actividad reciente en last-heartbeat (2026-04-01 13:40). No hay entregables bloqueantes ni issues abiertos. Investigación semanal (1x/semana) no due hoy — próxima: monitorizar trends QA 2026 según propuesta ya documentada en strategy-proposals.md.	f	2026-04-02 01:20:30.928	2026-04-02 01:20:30.928
cmngtycsc0001ae1edjnu4jfa	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles. Prioridad alta: atender emails de soporte entrantes (#recurrente #diario). Sin herramientas de bandeja de entrada configuradas en este latido. Siguiente paso: ejecutar trabajo fe8072aa-4831-48ba-af6b-a05d7cd6ddfd.	f	2026-04-02 02:02:54.396	2026-04-02 02:02:54.342
cmngtydab0003ae1e00qbsiap	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos disponibles. Sin jobs en base. Ninguna acción de outreach ejecutada. Siguiente paso: revisar pipeline manualmente si hay leads pendientes de cualificación o seguimiento.	f	2026-04-02 02:02:55.043	2026-04-02 02:02:54.931
cmngtydga0005ae1exot725h5	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía, sin trabajos pendientes. Revisión de métricas yesterday: MRR €49, 1 cliente real (AlberBEE trial 29 días restantes), sin anomalías nuevas vs reporte 2026-04-01. Sin datos de engagement nuevos. Research proposals: Churn prediction ( Proposal 1) sigue vigente como oportunidad prioritaria cuando haya más datos.	f	2026-04-02 02:02:55.259	2026-04-02 02:02:55.147
cmngtydls0007ae1ezi09s4qp	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Sitio OK. 4 trabajos ALTA en cola (dia-2 MVP, integraciones, features). SSL, sitemap y web funcionando. No hay incidencias. Pendiente: tomar primer trabajo disponible.	f	2026-04-02 02:02:55.457	2026-04-02 02:02:55.345
cmngtydri0009ae1e7y6q78yw	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-02 01:47 UTC. Sin deliverable pendientes en cola. Sprint backlog vacío. Última revisión activa fue 2026-04-01 (Carlos y Diana). No hay nuevos trabajos de Enzo, Carlos, Diana, Marketing ni Ventas.backlog sin items activos.	f	2026-04-02 02:02:55.662	2026-04-02 02:02:55.55
cmngw38tc0001701ex6hdecfn	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Cola revisada: 4 trabajos disponibles (1 alta, 3 media). Sin cambios en el estado. Bandeja de entrada vacía. Sin acción posible sin integración IMAP/SMTP o sistema de tickets. Bloqueos ya reportados a Paco.	f	2026-04-02 03:02:41.755	2026-04-02 03:02:41.804
cmngw390z0003701egub678o7	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas revisadas: MRR €98 (solo AlberBEE ha pagado), 10 clientes activos en plan BASIC, 30 trabajos pendientes en estado TODO (fecha 2026-03-31, obsoletos). 9 nuevos usuarios esta semana — buena señal de acquisition. Sin datos de churn. ALERTA: trabajos pendientes old + MRR muy bajo sugieren que MyCompi está en fase early/trial sin conversión clara.	f	2026-04-02 03:02:42.036	2026-04-02 03:02:42.038
cmngw396v0005701etgbcpzw4	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web mycompi.onrender.com OK. 4 trabajos ALTA en cola: bbbb8ae1 (MVP briefing), 7186e55d (integración), 2d7f1390 (features early adopters), 5a012266 (top 2 feedback). Semana 1 día 2. No hay briefing concreto disponible — necesito contexto de Paco para empezar el MVP.	f	2026-04-02 03:02:42.248	2026-04-02 03:02:42.25
cmngw39ch0007701e9dxlg958	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Backlog de sprint no encontrado (backlog-sprint.json no existe). Reviews muestra últimas revisiones del 2026-04-01 (Carlos: APPROVED + WITH_CONDITIONS; Diana: APPROVED x2). No hay entregables pendientes de revisión en cola. Heartbeat limpio.	f	2026-04-02 03:02:42.45	2026-04-02 03:02:42.452
cmngy88x30001aa1ec1mvazj6	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Heartbeat 03:44 UTC. 4 trabajos en cola (3 email, 1 feedback). Sin cambios en el gap de acceso — todas las tareas de email siguen bloqueadas por no tener acceso a bandeja de entrada ni integración de tickets. Misma situación que hace 24 min. Ninguna acción posible sin credenciales o integración.	f	2026-04-02 04:02:34.407	2026-04-02 04:02:34.465
cmngy89550003aa1ef6h6ivij	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline sin cambios (hot=0, warm=0, cold=0). CRM/leads no implementado en BD. Sin acciones pendientes.	f	2026-04-02 04:02:34.698	2026-04-02 04:02:34.701
cmngy89b40005aa1eyiv353yg	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. 5 trabajos disponibles. La automatización CRITICA (follow-up leads) requiere aprobación de Paco/Alberto antes de implementar. Sin incidencias en sistemas.	f	2026-04-02 04:02:34.913	2026-04-02 04:02:34.916
cmngy89h00007aa1e87g0quqp	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Métricas: MRR €49 confirmado (1 pago COMPLETED trial), 10 clientes registrados (mayoría tests), 2 usuarios activos en 7d. Sin mensajes ni interacciones chat 7d. Trial de beenocode@gmail.com termina ~2026-04-30.	f	2026-04-02 04:02:35.124	2026-04-02 04:02:35.127
cmngy89mr0009aa1ehgz7wrvr	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Site mycompi.es UP (HTTP 200), SSL OK. 4 jobs en cola sin briefing válido para ejecutarlos. Site funcionando correctamente.	f	2026-04-02 04:02:35.331	2026-04-02 04:02:35.334
cmngy89t3000baa1ef7e50k7q	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin trabajo pendiente en cola. No hay deliverables aguardando revisión. Alertas activas (MRR €49, engagement cero) son issues de negocio, no de calidad. Siguiente revisión cuando lleguen nuevos deliverables.	f	2026-04-02 04:02:35.559	2026-04-02 04:02:35.562
cmnh0dd1v00019r1eqyl69vls	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Pipeline estable con 8 leads (2 hot, 5 warm, 1 cold). Emails preparados bloqueados por falta de integración cold email tool. Sin acción urgente.	f	2026-04-02 05:02:32.269	2026-04-02 05:02:32.34
cmnh0ddjv00039r1ekmcjo2g9	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada: 5 trabajos disponibles. Trabajo CRITICA en curso (follow-up leads) - diseño listo, pendiente implementación N8N. Sistemas de email (Resend) operativos. Sin incidencias.	f	2026-04-02 05:02:32.923	2026-04-02 05:02:32.924
cmnh0ddq400059r1egavmcb17	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. Sin trabajos pendientes ni anomalías detectadas en el heartbeat de las 12:34 UTC. Métricas generales no disponibles en storage local (sin acceso a PostgreSQL de métricas en este entorno). Se recomienda revisar panel de métricas cuando estén disponibles.	f	2026-04-02 05:02:33.148	2026-04-02 05:02:33.149
cmnh0ddvu00079r1ejgo7nijc	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Heartbeat OK. Web up (HTTP 200). SSL vigente. 4 tareas ALTA en cola pendientes de ejecución por Marcos. sitemap.xml y robots.txt sirviendo correctamente.	f	2026-04-02 05:02:33.355	2026-04-02 05:02:33.355
cmnh0de1h00099r1echrcgfbl	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Heartbeat 2026-04-02 04:47 UTC. Cola vacía — no hay deliverables pendientes de revisión. Reviews.json actualizado con último estado. Equipo en orden.	f	2026-04-02 05:02:33.558	2026-04-02 05:02:33.559
cmnh2ik9f000b9r1e02cg6i9b	cmn3je5zq0000e31xg8wru9iy	Laura	INFO	Laura — actividad	[Laura] Laura revisó su cola: 4 trabajos disponibles. El prioritario (#ALTA) es atender emails de soporte entrantes. Email no configurable en este entorno (himalaya sin config). Detectado: necesita cuenta email configurada para ejecutar tareas de soporte.	f	2026-04-02 06:02:33.394	2026-04-02 06:02:34.193
cmnh2ikhs000d9r1egoh1xl3t	cmn3je5zq0000e31xg8wru9iy	Carlos	INFO	Carlos — actividad	[Carlos] Cola vacía. Sin trabajos pendientes. Pipeline sin cambios - no hay leads activos en el sistema CRM. Sin actividad nueva desde el último ciclo. Todo tranquilo.	f	2026-04-02 06:02:34.432	2026-04-02 06:02:34.433
cmnh2ikne000f9r1eojur2tc8	cmn3je5zq0000e31xg8wru9iy	Elena	INFO	Elena — actividad	[Elena] Cola revisada. Automatización de onboarding email sequence (CRITICA) ya estaba implementada en heartbeat anterior (integrada en /api/auth/activar + cron hourly). Sistema看起来 OK. No hay incidencias nuevas. Meta Ads evaluation y process mapping son trabajos pendientes disponibles en cola.	f	2026-04-02 06:02:34.634	2026-04-02 06:02:34.635
cmnh2il1w000h9r1efsntirh7	cmn3je5zq0000e31xg8wru9iy	Diana	INFO	Diana — actividad	[Diana] Cola vacía. BD MyCompi sin datos operativos: 10 usuarios total (sin patrón), 0 trabajos, 0 interacciones, 0 pagos, 0 token usage. Cliente en fase temprana sin métricas suficientes para análisis de cohort o churn. Sin anomalías detectadas.	f	2026-04-02 06:02:35.156	2026-04-02 06:02:35.157
cmnh2il7h000j9r1eo0avdie1	cmn3je5zq0000e31xg8wru9iy	Marcos	INFO	Marcos — actividad	[Marcos] Web UP (HTTP 200, SSL OK). 4 trabajos ALTA disponibles. Job bbbb8ae1 (top) requiere briefing de Paco que NO está en BD — webUrl del cliente es null, sugiere que MVP podría ser crear web para AlberBEE. Solicitar briefing a Paco antes de ejecutar. Ninguna incidencia técnica detectada.	f	2026-04-02 06:02:35.357	2026-04-02 06:02:35.358
cmnh2ild2000l9r1exsz7f6s2	cmn3je5zq0000e31xg8wru9iy	Valeria	INFO	Valeria — actividad	[Valeria] Sin actividad nueva. Cola vacía. No hay deliverables pendientes de revisión. El único item pendiente es automation-followup-leads.md de Elena, que requiere approval externo (no QA). Sprint backlog vacío. Incidencias: 0 nuevas. Active alerts sin cambios — MRR crítico, engagement cero, sin tracking.	f	2026-04-02 06:02:35.558	2026-04-02 06:02:35.559
\.


--
-- Data for Name: Pago; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Pago" (id, "clienteId", "stripePaymentId", cantidad, moneda, estado, tipo, descripcion, "fechaPago", "createdAt") FROM stdin;
cmneoatyh0001r9nsw27v13e4	cmn3je5zq0000e31xg8wru9iy	cs_live_a1HwW8HY2XcJrQHQDzs5PUKrLbXxUFZ8FuT4eSb9yTzm6iU2bGtyAHQBXU	49	EUR	COMPLETED	SUSCRIPCION	Plan COMPLETO - Simulación de pago	2026-03-31 13:49:06.473	2026-03-31 13:49:06.473
cmneoc8lz0001r9phb4h6szrk	cmn3je5zq0000e31xg8wru9iy	sub_1TH2gIFnOlGTfuoBLwHMob5Q	49	EUR	COMPLETED	SUSCRIPCION	Plan COMPLETO - Suscripción activa (trial 30 días)	2026-03-31 13:50:12.119	2026-03-31 13:50:12.119
\.


--
-- Data for Name: TokenUsage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."TokenUsage" (id, clienteid, agenteid, trabajoid, accion, tokensusados, modelo, costeeuros, createdat) FROM stdin;
\.


--
-- Data for Name: Trabajo; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Trabajo" (id, "clienteId", "agenteId", titulo, descripcion, estado, prioridad, tags, "inputData", "outputData", "errorMsg", "estimatedHours", "completedAt", "createdAt", "updatedAt", "aprobadoPor", "aprobadoAt", "notaAprobacion", "parentId", "requiereAprobacion") FROM stdin;
bbbb8ae1-abad-4689-a716-d1a39a1b4348	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🛠️ Construir MVP del proyecto según briefing	Usando el briefing validado por Paco, Marcos construye el MVP.\nPuede incluir: web básica, landing, prototipo, estructura técnica inicial.\nMarcos coordina con Enzo (marketing) y Diana (data) para que todo sea consistente.\nMantener al cliente informado del progreso.	TODO	ALTA	{semana-1,dia-2,mvp,desarrollo}	{"dia": 2, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:39:58.941	2026-03-31 15:39:58.941	\N	\N	\N	\N	f
72a32571-15b2-4719-97ae-4b3895d7fe82	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📝 Definir Brand Voice inicial del cliente	Crear documento Brand Voice con: tono, vocabulario, público objetivo, mensajes clave.\nCoordinar con Marcos para que la web/brand sea consistente visualmente.\nEntregar a Paco para revisión.	TODO	MEDIA	{semana-1,dia-2,branding,marketing}	{"dia": 2, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:39:59.43	2026-03-31 15:39:59.43	\N	\N	\N	\N	f
7186e55d-082d-4925-bbe3-ca268db5a5b7	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🚀 Integrar MVP con panel del cliente	Integrar el MVP construido en el dashboard del cliente.\nAsegurar que el cliente puede ver el avance desde su panel.\nMarcos notifica a Laura cuando esté listo para revisión de calidad.	TODO	ALTA	{semana-1,dia-3,mvp,integracion}	{"dia": 3, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:39:59.919	2026-03-31 15:39:59.919	\N	\N	\N	\N	f
8b5f919d-6d78-4d4f-829e-2dc621b6507c	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📣 Definir estrategia de contenidos inicial	Crear calendario de contenidos para las primeras 4 semanas.\nIdentificar canales principales (LinkedIn, web, email, RRSS).\nPresentar al cliente para aprobación antes de ejecutar.	TODO	MEDIA	{semana-1,dia-3,marketing,contenido}	{"dia": 3, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:00.416	2026-03-31 15:40:00.416	\N	\N	\N	\N	f
6ee2d97d-86b6-4562-b534-9098b28a5e14	cmn3je5zq0000e31xg8wru9iy	cmndh3yet0001r915hh6etshs	✅ Revisión QA del MVP — gates: funcionalidad + UX	Valeria revisa el MVP completado por Marcos:\n- ¿Funcionalidad correcta?\n- ¿UX intuitiva?\n- ¿Errores o bugs visibles?\n- ¿Contenido coherente con el brand voice?\nReportar bugs a Marcos para fix inmediato.	TODO	ALTA	{semana-1,dia-5,qa,mvp}	{"dia": 5, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:02.374	2026-03-31 15:40:02.374	\N	\N	\N	\N	f
1fda9348-70e5-4272-998c-0b507ddad7a1	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Revisar emails de bienvenida y soporte inicial	Laura revisa que los emails de bienvenida están correctamente configurados.\nProbar flujo completo: email → click → dashboard.\nVerificar que no hay emails bounce o errores de envío.	TODO	MEDIA	{semana-1,dia-6,email,soporte}	{"dia": 6, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:02.864	2026-03-31 15:40:02.864	\N	\N	\N	\N	f
7adc9ebf-d156-4c0e-8feb-a002f00ee11c	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	✍️ Crear primer contenido: blog post o artículo sectorial	Enzo crea un blog post o artículo optimizado para SEO.\nTema: relevancia para el sector del cliente, palabras clave en español.\nIncluir: meta title, meta description, headings, CTAs.\nCoordinar con Marcos para publicar en la web del cliente.	TODO	ALTA	{semana-2,dia-2,contenido,seo}	{"dia": 2, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:04.656	2026-03-31 15:40:04.656	\N	\N	\N	\N	f
179a64aa-8728-467b-b3b9-d03225cb1da7	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	🔍 SEO básico: meta tags, keywords, estructura web	Enzo revisa/configura SEO técnico de la web del cliente.\n- Meta tags (title, description, OG tags)\n- Keywords en español para el sector\n- Estructura de URLs amigable\n- Sitemap básico\nCoordinar con Marcos para implementar cambios técnicos.	TODO	ALTA	{semana-2,dia-3,seo,web}	{"dia": 3, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:05.144	2026-03-31 15:40:05.144	\N	\N	\N	\N	f
4c311b55-dabb-406c-ab62-10f8294c7239	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	🔎 Investigar proveedores y herramientas recomendadas	Investigación de herramientas para el sector del cliente.\nProveedores de servicios, SaaS, herramientas de automatización.\nPresentar opciones con pros/contras para decisión del cliente.	IN_PROGRESS	MEDIA	{semana-1,dia-5,investigacion,herramientas}	{"dia": 5, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:01.883	2026-03-31 19:17:19.665	\N	\N	\N	\N	f
d112e3b6-a464-4c92-bc5b-df46ad4abaf2	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Configurar dashboard de métricas del cliente	Configurar tracking en el dashboard del cliente.\nMétricas: conversaciones, usuarios activos, drop-off, leads generados.\nEl cliente debe poder ver su actividad en tiempo real.	COMPLETED	ALTA	{semana-1,dia-4,metrics,dashboard}	{"dia": 4, "semana": 1, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:01.395	2026-03-31 15:40:01.395	\N	\N	\N	\N	f
0510fdb5-e6b0-41f7-83cc-40744644912e	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📧 Enviar primer email frío personalizado a cada lead	Carlos envía email frío personalizado a cada uno de los 10 leads.\nNo usar plantillas genéricas — cada email adaptado al contexto del lead.\nHacer follow-up a los que no respondan en 48h.	COMPLETED	ALTA	{semana-2,dia-2,outreach,email-frio}	{"dia": 2, "semana": 2, "recurrente": false}	\N	\N	\N	2026-04-01 04:08:01.863	2026-03-31 15:40:04.167	2026-03-31 15:40:04.167	\N	\N	\N	\N	f
8c0d58b9-27ee-4148-a210-956a41380edc	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Configurar inbox de soporte y respuestas automáticas	Laura configura la bandeja de entrada de soporte del cliente.\nRespuestas automáticas para: consulta recibida, fuera de horario, vacaciones.\nPlantillas de respuesta para las 5 dudas más frecuentes del sector.	TODO	MEDIA	{semana-2,dia-3,soporte,automatizacion}	{"dia": 3, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:05.632	2026-03-31 15:40:05.632	\N	\N	\N	\N	f
9a1c992b-435e-48f4-a9b2-1665cbf60bfa	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	⚙️ Mapear procesos del cliente para automatización	Elena identifica 3-5 procesos del cliente que se pueden automatizar.\nEjemplos: respuesta a consultas frecuentes, alta de leads, seguimientos.\nPresentar opciones priorizadas por impacto/facilidad.	TODO	MEDIA	{semana-2,dia-5,automatizacion,procesos}	{"dia": 5, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:06.611	2026-03-31 15:40:06.611	\N	\N	\N	\N	f
2d7f1390-380d-4ca9-a95c-7bfa77a3df9b	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🚀 Implementar features solicitadas por early adopters	Marcos implementa las 2-3 features prioritarias identificadas en feedback.\nSi no hay feedback aún: mejorar rendimiento, UX del MVP existente.\nNotificar a Valeria para QA antes de delivery.	TODO	ALTA	{semana-3,dia-2,desarrollo,features}	{"dia": 2, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:08.401	2026-03-31 15:40:08.401	\N	\N	\N	\N	f
ffd7b826-67f4-488a-8bbf-d6bb894512ec	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📱 Primera acción en redes sociales del cliente	Enzo publica primer contenido en RRSS del cliente (LinkedIn, Instagram, etc.).\nCoordinar timing con Carlos para máximo alcance.\nMedir engagement inicial y ajustar estrategia.	TODO	ALTA	{semana-3,dia-5,social-media,contenido}	{"dia": 5, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:10.352	2026-03-31 15:40:10.352	\N	\N	\N	\N	f
69674e0a-66ec-4157-b079-aac530e312c3	cmn3je5zq0000e31xg8wru9iy	cmndh3yet0001r915hh6etshs	✅ QA de todas las automatizaciones implementadas	Valeria revisa que todas las automatizaciones funcionan correctamente.\n- Emails se envían correctamente\n- No hay bucles infinitos\n- Los triggers son los correctos\nReportar errores a Elena o Carlos según corresponda.	TODO	MEDIA	{semana-3,dia-6,qa,automatizacion}	{"dia": 6, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:10.84	2026-03-31 15:40:10.84	\N	\N	\N	\N	f
4726f7b1-5456-4877-bb45-cc348823964a	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📧 Primera campaign de email o contenido	Enzo lanza primera campaign de contenido:\n- Email newsletter a lista de leads, o\n- Artículo viral en blog/RRSS.\nMedir CTR, conversiones, engagement.	TODO	ALTA	{semana-4,dia-3,marketing,campaign}	{"dia": 3, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:12.629	2026-03-31 15:40:12.629	\N	\N	\N	\N	f
5a012266-a816-4afc-8873-f609c8ef59f1	cmn3je5zq0000e31xg8wru9iy	cmnct819t000br9tk1t1nm1f1	🔧 Implementar top 2 features del feedback	Marcos implementa las 2 features con mayor demanda del feedback.\nPriorizar las que tienen mayor impacto en conversión/retención.\n QA con Valeria antes de delivery al cliente.	TODO	ALTA	{semana-4,dia-3,desarrollo,features}	{"dia": 3, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:13.116	2026-03-31 15:40:13.116	\N	\N	\N	\N	f
2b5d684d-74c2-4c93-a2da-20a5e0ce5b2c	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📋 Recopilar y clasificar feedback de primeras semanas	Laura revisa todos los feedbacks recibidos de clientes/usuarios.\nClasificar por: bug, feature request, mejora UX, contenido.\nPresentar a Paco con priorización clara.	COMPLETED	ALTA	{semana-3,dia-2,feedback,soporte}	{"dia": 2, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:08.889	2026-03-31 15:40:08.889	\N	\N	Ejecutado por Laura. No hay Feedback ni Emails en el sistema todavía. MyCompi en fase inicial.	\N	f
071879cc-b35c-4e37-9bb1-2afe8582a583	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📊 Seguimiento de outreach: responder a los leads activos	Carlos hace seguimiento de los leads contactados.\nResponder a las respuestas recibidas con información adicional.\nRegistrar estado de cada lead en el sistema.	COMPLETED	ALTA	{semana-2,dia-6,outreach,seguimiento}	{"dia": 6, "semana": 2, "recurrente": false}	\N	\N	\N	2026-04-01 04:08:01.869	2026-03-31 15:40:07.099	2026-03-31 15:40:07.099	\N	\N	\N	\N	f
5970ff21-64cf-45fc-b4c9-6a0aa421f1c1	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📧 Outreach de segunda ronda: 10 leads adicionales	Carlos identifica y contacta 10 leads nuevos si los primeros no responden.\nPriorizar leads con mayor probabilidad de conversión.\nEscalar outreach si hay respuesta positiva de los primeros.	COMPLETED	MEDIA	{semana-3,dia-4,outreach,leads}	{"dia": 4, "semana": 3, "recurrente": false}	\N	\N	\N	2026-04-01 12:35:33.968	2026-03-31 15:40:09.864	2026-04-01 12:35:33.968	\N	\N	\N	\N	f
87ec251b-8127-4b6a-be93-7027f244214c	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	💰 Evaluar si procede campaign de Meta Ads o LinkedIn Ads	Elena evalúa si una campaign de pago tiene sentido para el cliente.\nCriterios: presupuesto disponible, target en RRSS, capacidad de conversión.\nSi procede: propuesta de campaign pequeño (€10-20/día) para test.	TODO	MEDIA	{semana-4,dia-5,ads,evaluacion}	{"dia": 5, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:14.093	2026-03-31 15:40:14.093	\N	\N	\N	\N	f
3186358b-5a88-4d4d-bd95-f323f29e7747	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Revisión de satisfacción del cliente mes 1	Laura envía survey de satisfacción al cliente.\nPreguntar: qué ha funcionado, qué no, qué quiere para el mes 2.\nPresentar resultados a Paco para planificar siguiente mes.	TODO	MEDIA	{semana-4,dia-6,soporte,feedback}	{"dia": 6, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:14.583	2026-03-31 15:40:14.583	\N	\N	\N	\N	f
6ae16796-2ece-413c-b647-00abb1671497	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	✍️ Crear y publicar contenido (RRSS o blog)	Enzo crea y publica contenido 3 veces por semana.\nPueden ser: posts de LinkedIn, tweets, artículos de blog, newsletters.\nMedir engagement y ajustar tipo de contenido según resultados.	TODO	MEDIA	{recurrente,3x-semana,contenido,marketing}	{"dia": 0, "semana": 0, "recurrente": "3x-semana"}	\N	\N	\N	\N	2026-03-31 15:40:16.377	2026-03-31 15:40:16.377	\N	\N	\N	\N	f
4575c343-f979-4f71-a67c-b64e7158dcdb	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	⚙️ Revisar y optimizar automatizaciones	Elena revisa las automatizaciones activas:\n- ¿Siguen funcionando correctamente?\n- ¿Algún leads que se ha caído del funnel?\n- ¿Nueva automatización que se puede añadir?\nPresentar mejoras a Paco para aprobación.	TODO	MEDIA	{recurrente,semanal,automatizacion,optimizacion}	{"dia": 0, "semana": 0, "recurrente": "semanal"}	\N	\N	\N	\N	2026-03-31 15:40:17.354	2026-03-31 15:40:17.354	\N	\N	\N	\N	f
3cbe38f5-12de-4186-97a1-5d64e8364dc0	cmn3je5zq0000e31xg8wru9iy	cmndh3yet0001r915hh6etshs	🔍 Auditoría de calidad: revisar outputs de agentes	Valeria hace auditoría semanal de outputs:\n- ¿Los emails de Carlos son profesionales?\n- ¿El contenido de Enzo está alineado con el brand voice?\n- ¿Las respuestas de Laura son correctas?\nReportar a cada agente con feedback de mejora.	TODO	MEDIA	{recurrente,semanal,qa,auditoria}	{"dia": 0, "semana": 0, "recurrente": "semanal"}	\N	\N	\N	\N	2026-03-31 15:40:17.841	2026-03-31 15:40:17.841	\N	\N	\N	\N	f
88ff44d2-7be6-44fd-98f5-3db439353019	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Resumen semana 1 + plan semana 2	Paco envía al cliente un resumen de la semana 1: qué se ha hecho, qué funciona, qué necesita decisión del cliente. Presentar plan de la semana 2 y pedir validación.	TODO	ALTA	{semana-1,dia-7,resumen,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f
d48eebd6-8578-4346-879b-59cc41d5ed84	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Resumen semana 2 + informe de leads	Paco envía resumen de la semana 2: Leads contactados y estados, contenido publicado, análisis competitivo, próximos pasos para semana 3	TODO	ALTA	{semana-2,dia-7,resumen,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f
30af492c-58d8-4b39-aae1-b188cf15625c	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Resumen semana 3 + informe de métricas	Paco envía resumen de la semana 3: Métricas de uso y retención, feedback clasificado, features implementadas, propuesta de plan para semana 4	TODO	ALTA	{semana-3,dia-7,resumen,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f
bcdd939b-7679-4877-a92c-945532fedb22	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	🎉 Resumen mes 1 + plan mes 2	Paco envía al cliente el resumen completo del primer mes: qué se ha logrado, métricas finales, lecciones aprendidas, plan para el mes 2 con nuevas prioridades. Preguntar si quiere escalar, ajustar o mantener.	TODO	ALTA	{semana-4,dia-7,resumen,cliente,mes-completo}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f
8d6f1b3d-6b81-4d79-852a-55bd5263f51f	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📅 Briefing diario: resumir el día al cliente	Paco envía al cliente un resumen cada mañana: qué se ha hecho el día anterior, qué se va a hacer hoy, si necesita alguna decisión o input del cliente. Mantener al cliente informado sin saturar.	TODO	ALTA	{recurrente,diario,briefing,cliente}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	\N	\N	\N	\N	f
4549e1b2-b8d8-4888-aa47-d7d19ee4d3ff	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	🎯 Outreach: buscar 1 lead nuevo de calidad	Carlos identifica y contacta al menos 1 lead nuevo cada día.\nInvestigar empresa, personalizar mensaje, registrar en sistema.\nSeguimiento de los leads de días anteriores.	COMPLETED	ALTA	{recurrente,diario,ventas,leads}	{"dia": 0, "semana": 0, "recurrente": "diario"}	\N	\N	\N	2026-04-01 04:08:01.863	2026-03-31 15:40:15.883	2026-03-31 15:40:15.883	\N	\N	\N	\N	f
4c1d6e1f-96c9-4172-bd44-15b6790b11ba	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Análisis de canal de adquisición con mejores resultados	Diana analiza qué canal de adquisición funciona mejor para el cliente.\nPresentar: coste por lead, conversión por canal, ROI estimado.\nDecisión: ¿en qué canal invertir más?	COMPLETED	MEDIA	{semana-4,dia-4,metrics,adquisicion}	{"dia": 4, "semana": 4, "recurrente": false}	{"resumen": "Sin datos de tracking de acquisition. 1 cliente real sin canal registrado.", "reportPath": "agents/diana/reports/canal-adquisicion-2026-04-01.md"}	\N	\N	2026-04-01 04:36:55.446	2026-03-31 15:40:13.605	2026-04-01 04:36:55.446	\N	\N	\N	\N	f
2a43e7e1-9690-487c-8e3d-dcb467bbe6d7	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Generar reporte semanal de métricas	Diana genera reporte semanal con:\n- Actividad de la semana (contenido, outreach, soporte)\n- Métricas de uso y engagement\n- Tendencias vs semana anterior\n- Recomendaciones para la siguiente semana	COMPLETED	MEDIA	{recurrente,semanal,metrics,reporte}	{"dia": 0, "semana": 0, "recurrente": "semanal"}	{"resumen": "MRR €49, 1 cliente activo, engagement cero, sin acquisition tracking", "reportPath": "agents/diana/reports/reporte-semanal-2026-04-01.md"}	\N	\N	2026-04-01 04:37:43.607	2026-03-31 15:40:16.865	2026-04-01 04:37:43.607	\N	\N	\N	\N	f
fe8072aa-4831-48ba-af6b-a05d7cd6ddfd	cmn3je5zq0000e31xg8wru9iy	cmnct7zvf0001r9tkvm0p3dbw	📬 Atender emails de soporte entrantes	Laura revisa y responde emails de soporte del cliente.\nClasificar por urgencia: urgente (responder hoy), normal (24h), info (48h).\nEscalar a Carlos o Elena si es comercial o operacional.	IN_PROGRESS	ALTA	{recurrente,diario,soporte}	{"dia": 0, "semana": 0, "recurrente": "diario"}	\N	\N	\N	\N	2026-03-31 15:40:15.395	2026-04-02 06:41:55.249	\N	\N	\N	\N	f
6e00f6b1-d006-4c17-a9ae-7d09d8fccc81	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	🔍 Investigar empresa, sector y competencia	Investigar la empresa del cliente: sector, modelo de negocio, competencia directa e indirecta.\nInvestigar tendencias del sector y mejores prácticas.\nCrear documento de Misión del cliente (tipo: MISION).\nCrear documento de Investigación de competencia (tipo: USER_RESEARCH).\n OUTPUT: 2 documentos guardados en BD.	COMPLETED	CRITICA	{semana-1,dia-1,onboarding,investigacion}	{"dia": 1, "semana": 1, "recurrente": false}	{"docs": ["Investigación de empresa/sector/competencia guardada en /agents/diana/jobs/job_6e00f6b1_investigacion_empresa.md"]}	\N	\N	2026-04-01 01:38:48.224	2026-03-31 15:39:58.11	2026-03-31 15:39:58.11	cmn3je6040002e31xi99h82gd	2026-03-31 18:58:34.853941+00	OK test	\N	t
1c5eaaed-365f-4832-89fe-92fd213485c5	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📊 Análisis competitivo: 3-5 competidores directos	Diana hace un análisis profundo de 3-5 competidores del cliente.\nPara cada uno: propuesta de valor, precio, canales, puntos fuertes/débiles.\nGenerar reporte con fortalezas y debilidades.\nPresentar a Paco para ajustar estrategia.	COMPLETED	CRITICA	{semana-2,dia-4,competencia,research}	{"dia": 4, "semana": 2, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:06.124	2026-03-31 15:40:06.124	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:22.041265+00	Aprobado por Alberto — ejecuten	\N	t
08e215da-2e6b-4090-a1fd-916e7be10055	cmn3je5zq0000e31xg8wru9iy	cmnct80rm0007r9tkodlpaghf	🤖 Implementar primera automatización de proceso	Elena implementa la automatización de mayor impacto identificada.\nEjemplo: email automático de bienvenida a nuevos leads, recordatorios, follow-ups.\nCoordinar con Carlos para integrarlo en su flujo de ventas.	IN_PROGRESS	CRITICA	{semana-3,dia-1,automatizacion,proceso}	{"dia": 1, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:07.914	2026-04-01 17:50:32.253	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:22.853202+00	Aprobado por Alberto — ejecuten	\N	t
5717edc9-9843-476a-bf76-70dd41900e76	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	🎯 Outreach: identificar 10 leads en sector del cliente	Carlos investiga y identifica 10 early adopters potenciales en el sector del cliente.\nCriterios: empresas del tamaño correcto, necesidad clara, capacidad de pago.\nGuardar en documento compartido: nombre, empresa, email, razón interés potencial.	COMPLETED	CRITICA	{semana-2,dia-1,outreach,leads}	{"dia": 1, "semana": 2, "recurrente": false}	{"leads": 10, "fichero": "5717edc9-9843-476a-bf76-70dd41900e76-leads.json"}	\N	\N	2026-03-31 20:37:17.202	2026-03-31 15:40:03.678	2026-03-31 15:40:03.678	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:21.574865+00	Aprobado por Alberto — ejecuten	\N	t
25b4e9b3-892f-4a0f-8760-b1d7d9dac925	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	📧 Preparar emailing de bienvenida para el cliente	Crear email de bienvenida formal para el cliente: resumen del onboarding,\nequipo asignado, próximos pasos, datos de contacto.\nCoordinar con Laura para que se envíe desde la plataforma.	COMPLETED	CRITICA	{semana-1,dia-4,email,bienvenida}	{"dia": 4, "semana": 1, "recurrente": false}	\N	\N	\N	2026-03-31 22:06:36.931	2026-03-31 15:40:00.906	2026-03-31 15:40:00.906	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:21.063267+00	Aprobado por Alberto — ejecuten	\N	t
375fd111-7d3b-4012-9da8-612f8d4e4a27	cmn3je5zq0000e31xg8wru9iy	a1c29523-4fb5-4a70-b029-9a8052da1ac0	📋 Revisar docs de onboarding y validar plan con cliente	Revisar los documentos creados por Diana (Misión, Research). Confirmar con el cliente que la información es correcta. Ajustar si hay errores o missing info. Preparar el briefing para el resto del equipo.	TODO	ALTA	{semana-1,dia-1,onboarding,briefing}	\N	\N	\N	\N	\N	2026-03-31 15:51:41.484	2026-03-31 15:51:41.484	cmn3je6040002e31xi99h82gd	2026-03-31 18:55:13.523785+00	test	\N	f
940617b5-23f8-473f-a77a-67f0451344b0	cmn3je5zq0000e31xg8wru9iy	cmnct809d0003r9tkbdzelzv3	📢 Testear canal de adquisición: LinkedIn o email	Enzo testa 1-2 canales de adquisición para el cliente.\nOpción A: LinkedIn — contenido orgánico + networking.\nOpción B: Email marketing — newsletter o secuencias.\nMedir resultados y presentar a Paco qué canal funciona mejor.	TODO	CRITICA	{semana-4,dia-1,growth,adquisicion}	{"dia": 1, "semana": 4, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:11.652	2026-03-31 15:40:11.652	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:23.815647+00	Aprobado por Alberto — ejecuten	\N	t
a250d678-02c3-46b4-a700-cf2efc75ca73	cmn3je5zq0000e31xg8wru9iy	cmnct810q0009r9tkib9nzb6z	📈 Primer reporte de métricas: retención y uso	Diana genera el primer reporte de métricas real del cliente:\n- Tasa de retención\n- Conversaciones por usuario\n- Drop-off points\n- Leads generados por canal\nPresentar a Paco para ajustar estrategia de la semana 4.	COMPLETED	CRITICA	{semana-3,dia-3,metrics,reporte}	{"dia": 3, "semana": 3, "recurrente": false}	\N	\N	\N	\N	2026-03-31 15:40:09.376	2026-03-31 15:40:09.376	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:23.330521+00	Aprobado por Alberto — ejecuten	\N	t
40cc9a98-1af5-4a52-a90c-07409e47aa87	cmn3je5zq0000e31xg8wru9iy	cmnct80ih0005r9tkdmktoi7i	🎯 Escalar outreach si hay respuesta positiva	Si los emails fríos tienen respuesta >5%:\n- Carlos escala outreach a 20-30 leads adicionales.\n- Personalizar secuencias de follow-up.\nSi no hay respuesta: pivota a otro canal (recomendar por Enzo).	COMPLETED	CRITICA	{semana-4,dia-2,outreach,leads}	{"dia": 2, "semana": 4, "recurrente": false}	\N	\N	\N	2026-04-01 12:35:16.621	2026-03-31 15:40:12.14	2026-04-01 12:35:16.621	cmn3je6040002e31xi99h82gd	2026-03-31 19:35:24.281455+00	Aprobado por Alberto — ejecuten	\N	t
\.


--
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Usuario" (id, "clienteId", nombre, email, "passwordHash", rol, idioma, timezone, "ultimoAcceso", activo, "createdAt", "updatedAt", rol_platform) FROM stdin;
cmn77j4yl0004b41eeyujiax5	cmn77j4yd0002b41efmeyg8o1	Test User	test@mycompi.com	$2a$12$cePrV3p9H876OKJ/x2V/Beo2ZleyPHdbtXddN4HpU3XNUZ776AwCe	OWNER	es	Europe/Madrid	\N	t	2026-03-26 08:25:17.277	2026-03-26 08:25:17.277	CLIENT
cmn77tmuy0006e81eyyjv2db9	cmn77tmsh0004e81e667qlyks	Test2	test2@mycompi.com	$2a$12$31LuVbTV/MgfKVjZfeHqOeb7gc/zx50W9gL0AlEj3MmnlREFhRRJu	OWNER	es	Europe/Madrid	\N	t	2026-03-26 08:33:27.034	2026-03-26 08:33:27.034	CLIENT
cmn7fddco0002ew1ef6hhbmqc	cmn7fddc60000ew1e76drd41a	Test Paco	testpaco_1774526683@test.com	$2a$12$7dlyEtUSlIhho4BDfDivEekDDEel.v8RyQGvCL4QXSxRRs0sdHoRe	OWNER	es	Europe/Madrid	2026-03-26 12:30:23.712	t	2026-03-26 12:04:45.144	2026-03-26 12:30:23.713	CLIENT
cmn7jgl5n0002j41ea3gkqjv0	cmn7jgl500000j41enpnhqa2z	tester bee	appmycompi@gmail.com	$2a$12$iVV0JLjS0DDzAcEu0se.HuMF.56rzNmcLSibclRvtRPZidLmlaVdS	OWNER	es	Europe/Madrid	\N	t	2026-03-26 13:59:13.691	2026-03-26 13:59:13.691	CLIENT
cmn7jjmjo0005j41ei31rpu2p	cmn7jjmjm0003j41ekknkwjzf	Test Alberto	testalberto_1774533693@gmail.com	$2a$12$VpkV3Qz/VuIFumBlOj0geODGyo6V8UzL6k4NVp1tCD7SUwwVtxQVa	OWNER	es	Europe/Madrid	\N	t	2026-03-26 14:01:35.461	2026-03-26 14:01:35.461	CLIENT
cmnbhljmg0002f01xcxdqljtd	cmnbhljm70000f01x9jbyuea1	alberBEE	albertogala@beenocode.com	$2a$12$nFgiPKUYankLo6rKITSO5OWN8qvKVyWm6sP4AbruMr69jskS9/T1K	OWNER	es	Europe/Madrid	\N	t	2026-03-29 08:18:10.457	2026-03-29 08:18:10.457	CLIENT
cmnbz84zw0002i81eauh3sep4	cmnbz84yf0000i81e9n51vef8	Test User	test_paco@mycompi.com	$2a$12$/0YUavpQyiglr0IXOfjnF.9b2b3qnirnEw5KpUGmWK3/03Yb2wxJm	OWNER	es	Europe/Madrid	\N	t	2026-03-29 16:31:38.06	2026-03-29 16:31:38.06	CLIENT
cmnc3bxec0002g81eguka0k73	cmnc3bxds0000g81e1plhkg46	VANESA 	vanesamartinherrera@gmail.com	$2a$12$K6wZ.slzLzZgGvS.ufKDY.E41YWI/LvS6zVPTamd2TwAy00oHF8su	OWNER	es	Europe/Madrid	\N	t	2026-03-29 18:26:33.3	2026-03-29 18:26:33.3	CLIENT
cmneo7cu60002dz1wr587di10	cmneo7cu00000dz1wdl77hf64	Empresa Test SL	test_1774964781@test.com	$2a$12$1pDin3W.tN7O9S4aRTZFvOW7/NwBYU8Cf5pFXy5nYc8k2G5xU1ICK	OWNER	es	Europe/Madrid	\N	t	2026-03-31 13:46:24.319	2026-03-31 13:46:24.319	CLIENT
cmn3je6040002e31xi99h82gd	cmn3je5zq0000e31xg8wru9iy	AlberBEE	beenocode@gmail.com	$2a$12$qN9IgTGQeix.C2XRfBSLA.LvY0o2GSMX0EnhAf/tzp5xHHvW7fWLC	OWNER	es	Europe/Madrid	2026-04-01 06:32:20.523	t	2026-03-23 18:46:16.036	2026-04-01 06:32:20.524	ADMIN
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d125ebf1-4c79-4130-8b60-0daf1123620b	10385d1f052955ec75b63111cdd0de63e86de128e801d80c0d8af7ef70f414b9	2026-03-19 12:29:56.758389+00	20260319122950_init	\N	\N	2026-03-19 12:29:51.064228+00	1
afab5906-49cb-4c0a-9efc-9b76fd7adaef	ac553d82fdf6f9ee0b9b0e077583c642651ef285e6c3cb2e8d30ec900924d30e	2026-03-23 18:08:53.890023+00	20260323180852_add_rol_platform	\N	\N	2026-03-23 18:08:53.050004+00	1
e37f6aa3-9b8b-49e9-a797-1be988e9f9cd	b737187aaa0d8571c39c77fe8f0b5bfb08bb7a3050963644e53e15a6e2a26ba8	\N	20260330173600_add_activation_token	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260330173600_add_activation_token\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "ActivationToken" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"ActivationToken\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1160), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260330173600_add_activation_token"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260330173600_add_activation_token"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	\N	2026-03-31 23:06:20.471009+00	0
\.


--
-- Name: ActivationToken ActivationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ActivationToken"
    ADD CONSTRAINT "ActivationToken_pkey" PRIMARY KEY (id);


--
-- Name: Agente Agente_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Agente"
    ADD CONSTRAINT "Agente_pkey" PRIMARY KEY (id);


--
-- Name: Cliente Cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY (id);


--
-- Name: Documento Documento_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Documento"
    ADD CONSTRAINT "Documento_pkey" PRIMARY KEY (id);


--
-- Name: Email Email_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Email"
    ADD CONSTRAINT "Email_pkey" PRIMARY KEY (id);


--
-- Name: InteraccionChat InteraccionChat_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InteraccionChat"
    ADD CONSTRAINT "InteraccionChat_pkey" PRIMARY KEY (id);


--
-- Name: Mensaje Mensaje_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Mensaje"
    ADD CONSTRAINT "Mensaje_pkey" PRIMARY KEY (id);


--
-- Name: Notificacion Notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notificacion"
    ADD CONSTRAINT "Notificacion_pkey" PRIMARY KEY (id);


--
-- Name: Pago Pago_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_pkey" PRIMARY KEY (id);


--
-- Name: Trabajo Trabajo_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ActivationToken_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ActivationToken_email_idx" ON public."ActivationToken" USING btree (email);


--
-- Name: ActivationToken_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ActivationToken_token_key" ON public."ActivationToken" USING btree (token);


--
-- Name: Agente_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Agente_email_key" ON public."Agente" USING btree (email);


--
-- Name: Agente_workerId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Agente_workerId_key" ON public."Agente" USING btree ("workerId");


--
-- Name: AuditLog_accion_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AuditLog_accion_idx" ON public."AuditLog" USING btree (accion);


--
-- Name: AuditLog_agenteid_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AuditLog_agenteid_idx" ON public."AuditLog" USING btree (agenteid);


--
-- Name: AuditLog_clienteid_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AuditLog_clienteid_idx" ON public."AuditLog" USING btree (clienteid);


--
-- Name: AuditLog_createdat_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AuditLog_createdat_idx" ON public."AuditLog" USING btree (createdat);


--
-- Name: Cliente_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Cliente_email_key" ON public."Cliente" USING btree (email);


--
-- Name: Cliente_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Cliente_slug_key" ON public."Cliente" USING btree (slug);


--
-- Name: Email_messageId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Email_messageId_key" ON public."Email" USING btree ("messageId");


--
-- Name: TokenUsage_agenteid_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "TokenUsage_agenteid_idx" ON public."TokenUsage" USING btree (agenteid);


--
-- Name: TokenUsage_clienteid_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "TokenUsage_clienteid_idx" ON public."TokenUsage" USING btree (clienteid);


--
-- Name: TokenUsage_createdat_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "TokenUsage_createdat_idx" ON public."TokenUsage" USING btree (createdat);


--
-- Name: Usuario_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Usuario_email_key" ON public."Usuario" USING btree (email);


--
-- Name: Agente Agente_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Agente"
    ADD CONSTRAINT "Agente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Documento Documento_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Documento"
    ADD CONSTRAINT "Documento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Email Email_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Email"
    ADD CONSTRAINT "Email_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InteraccionChat InteraccionChat_agenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InteraccionChat"
    ADD CONSTRAINT "InteraccionChat_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES public."Agente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InteraccionChat InteraccionChat_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InteraccionChat"
    ADD CONSTRAINT "InteraccionChat_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Mensaje Mensaje_agenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Mensaje"
    ADD CONSTRAINT "Mensaje_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES public."Agente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Pago Pago_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trabajo Trabajo_agenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES public."Agente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trabajo Trabajo_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trabajo Trabajo_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Trabajo"
    ADD CONSTRAINT "Trabajo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Trabajo"(id) ON DELETE SET NULL;


--
-- Name: Usuario Usuario_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict xUE5q7MjafaUHpch7rcg4p20Yis8B6ndAkYy8K7ITAouIaRmwtcrckDE7xaQi0t

