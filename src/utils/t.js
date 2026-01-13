const { initI18n, i18next } = require("./i18n");
const { getGuildLocale } = require("./getGuildLocale");

/**
 * Traduit une clé i18n en fonction de la langue du serveur.
 * @param {import('discord.js').BaseInteraction | { guildId?: string }} target
 * @param {string} key
 * @param {Record<string, any>} [vars]
 */
async function t(target, key, vars = {}) {
  await initI18n();

  const lng = await getGuildLocale({
    guildId: target?.guildId,
    interaction: target,
  });

  return i18next.t(key, {
    lng,
    ...vars,
  });
}

/**
 * Attache un helper `interaction.t(key, vars)`.
 */
function attachT(interaction) {
  if (!interaction || typeof interaction !== "object") return;
  if (interaction.t) return;

  Object.defineProperty(interaction, "t", {
    enumerable: false,
    configurable: false,
    value: (key, vars) => t(interaction, key, vars),
  });
}

module.exports = {
  t,
  attachT,
};

