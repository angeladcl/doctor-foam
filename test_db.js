const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
// Testing direct URL on port 5432
      url: "postgresql://postgres.zntxnswlsahvcjrycjtl:Manchasycaramelo@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("SUCCESS: Connected to Supabase DB directly!");
  } catch (error) {
    console.error("FAILED TO CONNECT:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
