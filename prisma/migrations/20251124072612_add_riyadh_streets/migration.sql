-- CreateTable
CREATE TABLE "RiyadhSector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiyadhSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiyadhDistrict" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiyadhDistrict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiyadhStreet" (
    "id" TEXT NOT NULL,
    "streetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "lanes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "lighting" BOOLEAN NOT NULL DEFAULT true,
    "sidewalks" BOOLEAN NOT NULL DEFAULT true,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "hasSpecialRegulation" BOOLEAN NOT NULL DEFAULT false,
    "regulationDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiyadhStreet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiyadhSector_name_key" ON "RiyadhSector"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RiyadhDistrict_name_key" ON "RiyadhDistrict"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RiyadhStreet_streetCode_key" ON "RiyadhStreet"("streetCode");

-- CreateIndex
CREATE INDEX "RiyadhStreet_sectorId_idx" ON "RiyadhStreet"("sectorId");

-- CreateIndex
CREATE INDEX "RiyadhStreet_districtId_idx" ON "RiyadhStreet"("districtId");

-- AddForeignKey
ALTER TABLE "RiyadhStreet" ADD CONSTRAINT "RiyadhStreet_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "RiyadhSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiyadhStreet" ADD CONSTRAINT "RiyadhStreet_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "RiyadhDistrict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
