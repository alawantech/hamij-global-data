require("dotenv").config();
const { encrypt, decrypt } = require("../src/utils/crypto");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

const KIRU_BASIC_B64 = "a2lydWRhdGE6a2lydWRhdGE0NjMySmVAIyQmKz0=";
const HAMIJ_BASIC_B64 = Buffer.from("hamij:sxkkJ@4XQ#KK6B4").toString("base64");
const EMPTY_KEYS = new Set(["paystack_public_key","paystack_secret_key","aspfiyApiKey","aspfiyBaseUrl","aspfiyWebhookSecret"]);

const RAW = fs.readFileSync("/tmp/kiru_configs_decrypted.txt", "utf8");

(async () => {
  const lines = RAW.split("\n").filter(Boolean);
  let n = 0;
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const name = line.slice(0, eq);
    let value = line.slice(eq + 1);
    if (value.startsWith("ENC->")) value = value.slice(5);
    if (EMPTY_KEYS.has(name)) value = "";
    if (value === KIRU_BASIC_B64) value = HAMIJ_BASIC_B64;
    if (value === "(empty)") value = "";
    const stored = value ? encrypt(value) : "";
    await prisma.apiConfig.upsert({ where: { name }, update: { value: stored }, create: { name, value: stored } });
    n++;
  }
  console.log("api_configs upserted:", n);

  const provs = await prisma.dataProvider.findMany();
  for (const p of provs) {
    const isMbc = p.slug === "mbc-data";
    const plain = p.apiUrl ? HAMIJ_BASIC_B64 : "";
    await prisma.dataProvider.update({
      where: { id: p.id },
      data: {
        apiKey: plain ? encrypt(plain) : "",
        ...(isMbc ? { apiUrl: "https://mbcdata.com/api/data", authType: "basic", status: "On" } : {}),
      },
    });
    console.log("provider fixed:", p.slug || p.name);
  }

  const s = await prisma.siteSetting.findFirst();
  await prisma.siteSetting.update({
    where: { id: s.id },
    data: {
      sitename: "Hamij Global Data",
      siteurl: "https://hamijglobaldata.com",
      faviconUrl: "",
      logoUrl: "",
      email: "info@hamijglobaldata.com",
      phone: "",
      whatsapp: "",
      accountName: "",
      accountNo: "",
      bankName: "",
      atcMtnNumber: "",
      atcAirtelNumber: "",
    },
  });
  console.log("site_settings rebranded");

  const chk = await prisma.apiConfig.findFirst({ where: { name: "mtnVtuApi" } });
  console.log("verify mtnVtuApi ->", decrypt(chk.value) === HAMIJ_BASIC_B64 ? "hamij Basic OK" : "MISMATCH: " + decrypt(chk.value));
  const mbc = await prisma.dataProvider.findFirst({ where: { slug: "mbc-data" } });
  console.log("verify mbc-data ->", decrypt(mbc.apiKey) === HAMIJ_BASIC_B64 ? "hamij Basic OK, url " + mbc.apiUrl : "MISMATCH");
  await prisma.$disconnect();
})().catch(e => { console.error("FAIL:", e.message); process.exit(1); });
