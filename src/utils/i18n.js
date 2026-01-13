const path = require("path");
};
  initI18n,
  i18next,
module.exports = {

}
  return initPromise;

    });
      throw err;
      logger?.error?.("[i18n] Init failed:", err);
    .catch((err) => {
    })
      },
        logger?.warn?.(`[i18n] Missing key '${ns}:${key}' for ${lngs}`);
      missingKeyHandler(lngs, ns, key) {
      // Silence prod, utile en dev
      },
        loadPath: path.join(__dirname, "../../locales/{{lng}}/translation.json"),
      backend: {
      },
        escapeValue: false,
      interpolation: {
      defaultNS: "translation",
      ns: ["translation"],
      load: "languageOnly",
      supportedLngs: ["fr", "en"],
      fallbackLng: "fr",
    .init({
    .use(Backend)
  initPromise = i18next

  if (initPromise) return initPromise;
function initI18n() {
 */
 * Initialise i18next une seule fois.
/**

let initPromise;

const logger = require("./logger");
const Backend = require("i18next-fs-backend");
const i18next = require("i18next");

