require("dotenv").config();
const { initI18n, i18next } = require("../src/utils/i18n");

(async () => {
  await initI18n();

  console.log("i18next.language:", i18next.language);
  console.log("i18next.languages:", i18next.languages);
  console.log("hasResourceBundle(fr):", i18next.hasResourceBundle("fr", "translation"));
  console.log("hasResourceBundle(en):", i18next.hasResourceBundle("en", "translation"));

  console.log("t() default:", i18next.t("ERRORS.COMMAND_FAILED"));
  console.log("t() lng=en:", i18next.t("ERRORS.COMMAND_FAILED", { lng: "en" }));
  console.log("t() lng=fr:", i18next.t("ERRORS.COMMAND_FAILED", { lng: "fr" }));
})();

