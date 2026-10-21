// Seed data awal e-SOP Sawit
// Jalankan: npx prisma db seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { code: "PN", name: "Panen", description: "SOP panen TBS: cut & keep, ripe standard, kualitas buah masak" },
  { code: "PM", name: "Pemupukan", description: "SOP pemupukan: dosis, metode aplikasi lingkar & band" },
  { code: "SP", name: "Spraying", description: "SOP penyemprotan gulma & pengendalian hama ulat api" },
  { code: "IR", name: "Irigasi", description: "SOP operasional irigasi, pompa, dan distribusi air" },
  { code: "QM", name: "Quality Management", description: "SOP mutu: rekap kualitas panen, inspeksi blok" },
  { code: "K3", name: "Keselamatan & Kesehatan Kerja", description: "SOP K3: APD, kerja di ketinggian, penanganan pestisida" },
];

async function main() {
  console.log("Seeding kategori SOP...");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  console.log("Seeding user awal...");
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { nik: "admin" },
    update: {},
    create: { nik: "admin", name: "Administrator Pusat", password: hash, role: "SUPERADMIN", estate: "Kantor Pusat" },
  });

  const managerPass = await bcrypt.hash("manager123", 10);
  await prisma.user.upsert({
    where: { nik: "manager01" },
    update: {},
    create: { nik: "manager01", name: "Manager Afdeling I", password: managerPass, role: "MANAGER", division: "Panen", estate: "Afd. I" },
  });

  console.log("Seed selesai. Login: admin/admin123, manager01/manager123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
