const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    const plans = await prisma.plan.findMany();
    fs.writeFileSync("/tmp/plans-test.txt", JSON.stringify(plans, null, 2));
    console.log("Plans found:", plans.length);
  } catch (error) {
    fs.writeFileSync("/tmp/plans-error.txt", error.message);
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
