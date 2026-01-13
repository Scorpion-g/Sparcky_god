require("dotenv").config();
const mongoose = require("mongoose");
const { initI18n } = require("../src/utils/i18n");
const { t } = require("../src/utils/t");

(async () => {
  const guildId = process.argv[2];
  if (!guildId) {
    console.log("Usage: node scripts/smoke-ticket-i18n.js <guildId>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await initI18n();

  console.log("TICKET.NOT_CONFIGURED:", await t({ guildId }, "TICKET.NOT_CONFIGURED"));
  console.log("TICKET.PANEL.TITLE:", await t({ guildId }, "TICKET.PANEL.TITLE"));
  console.log(
    "TICKET.CHANNEL.TITLE:",
    await t({ guildId }, "TICKET.CHANNEL.TITLE", { type: "Support" }),
  );
  console.log(
    "TICKET.CONFIGURED:",
    await t({ guildId }, "TICKET.CONFIGURED", { channel: "#tickets" }),
  );

  await mongoose.disconnect();
})();

