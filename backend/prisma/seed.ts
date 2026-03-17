import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@hamacaterapia.local';
  const adminPassword = 'Admin12345';

  const hash = await bcrypt.hash(adminPassword, 12);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nombre: 'Administrador',
      email: adminEmail,
      password_hash: hash,
      rol: 'admin',
      activo: true,
    },
  });

  console.log(`✅ Admin seed listo: ${adminEmail} / ${adminPassword}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Error ejecutando seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });