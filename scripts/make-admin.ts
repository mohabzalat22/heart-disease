import { prisma } from '../lib/prisma';

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`\n[!] Error: No user found with email "${email}".\n[!] Please sign up in the application first, then run this script again.\n`);
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    
    console.log(`\n[✓] Success! User ${email} has been promoted to ADMIN.\n`);
  } catch (error) {
    console.error('\n[!] An unexpected error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('\nUsage: npx tsx scripts/make-admin.ts <email>\n');
  process.exit(1);
}

makeAdmin(email);
