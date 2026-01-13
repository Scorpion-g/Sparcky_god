const getLocalCommands = require("../src/utils/getLocalCommands");

const name = process.argv[2];
if (!name) {
  console.log("Usage: node scripts/debug-command-localizations.js <commandName>");
  process.exit(1);
}

const localCommands = getLocalCommands();
const cmd = localCommands.find((c) => c.data?.name === name || c.data?.toJSON?.().name === name);

if (!cmd) {
  console.log(`Command not found: ${name}`);
  process.exit(1);
}

const json = cmd.data.toJSON();
console.log(JSON.stringify(json, null, 2));

