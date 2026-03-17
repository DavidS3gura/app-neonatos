-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'investigador');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'investigador',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Neonato" (
    "id" TEXT NOT NULL,
    "codigo_rn" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "eg_semanas" INTEGER NOT NULL,
    "eg_dias" INTEGER NOT NULL,
    "peso_nacer" DOUBLE PRECISION NOT NULL,
    "diagnostico_principal" TEXT NOT NULL,
    "dias_estancia" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Neonato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observacion" (
    "id" TEXT NOT NULL,
    "neonato_id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "observador" TEXT NOT NULL,
    "posicion_comoda" INTEGER NOT NULL,
    "spo2" INTEGER NOT NULL,
    "fr" INTEGER NOT NULL,
    "fc" INTEGER NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Observacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Neonato_codigo_rn_key" ON "Neonato"("codigo_rn");

-- AddForeignKey
ALTER TABLE "Observacion" ADD CONSTRAINT "Observacion_neonato_id_fkey" FOREIGN KEY ("neonato_id") REFERENCES "Neonato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
