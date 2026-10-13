CREATE TABLE "auditoria" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" text,
	"acao" text NOT NULL,
	"caso_id" text,
	"detalhe" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "casos" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"idade" integer,
	"email" text DEFAULT '' NOT NULL,
	"telefone" text DEFAULT '' NOT NULL,
	"motivo" text DEFAULT '' NOT NULL,
	"disponibilidade" text DEFAULT '' NOT NULL,
	"publico" text NOT NULL,
	"status" text DEFAULT 'acolhimento' NOT NULL,
	"status_desde" timestamp with time zone NOT NULL,
	"recebido_em" timestamp with time zone NOT NULL,
	"risco" boolean DEFAULT false NOT NULL,
	"terapeuta_id" text,
	"encaminhado_em" timestamp with time zone,
	"termo_ok" boolean DEFAULT false NOT NULL,
	"repasse_ok" boolean DEFAULT false NOT NULL,
	"primeiro_ok" boolean DEFAULT false NOT NULL,
	"boas_vindas_em" timestamp with time zone,
	"motivo_desligamento" text,
	"termo_token" text NOT NULL,
	"aceite_nome" text,
	"aceite_menor" text,
	"aceite_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "casos_termo_token_unique" UNIQUE("termo_token")
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"para" text NOT NULL,
	"assunto" text NOT NULL,
	"corpo" text NOT NULL,
	"caso_id" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retornos" (
	"id" serial PRIMARY KEY NOT NULL,
	"caso_id" text NOT NULL,
	"terapeuta_nome" text NOT NULL,
	"motivo" text NOT NULL,
	"observacao" text DEFAULT '' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"id" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"expira" timestamp with time zone NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terapeutas" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"publico" jsonb NOT NULL,
	"disponibilidade" text NOT NULL,
	"vagas" integer NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text,
	"status" text DEFAULT 'convite' NOT NULL,
	"convite_token" text,
	"convite_expira" timestamp with time zone,
	"ultimo_acesso" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email"),
	CONSTRAINT "usuarios_convite_token_unique" UNIQUE("convite_token")
);
--> statement-breakpoint
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casos" ADD CONSTRAINT "casos_terapeuta_id_terapeutas_id_fk" FOREIGN KEY ("terapeuta_id") REFERENCES "public"."terapeutas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retornos" ADD CONSTRAINT "retornos_caso_id_casos_id_fk" FOREIGN KEY ("caso_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditoria_caso_idx" ON "auditoria" USING btree ("caso_id");--> statement-breakpoint
CREATE INDEX "casos_status_idx" ON "casos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "casos_terapeuta_idx" ON "casos" USING btree ("terapeuta_id");--> statement-breakpoint
CREATE INDEX "retornos_caso_idx" ON "retornos" USING btree ("caso_id");--> statement-breakpoint
CREATE INDEX "sessoes_usuario_idx" ON "sessoes" USING btree ("usuario_id");