// Regenerates app-spec.json "screens" from the NCameo menu.json; other top-level fields are kept.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FORMS_DIR = "/Users/arunyadav/MyProjects/nebula-products/ncameo/quzlglsembkgyxy";
const specPath = fileURLToPath(new URL("../app-spec.json", import.meta.url));

const menu = JSON.parse(readFileSync(`${FORMS_DIR}/menu.json`, "utf8"));
const formlist = JSON.parse(readFileSync(`${FORMS_DIR}/formlist.json`, "utf8"));
const current = existsSync(specPath) ? JSON.parse(readFileSync(specPath, "utf8")) : {};

const keyOf = (nav) => nav.Url.split("/").filter(Boolean).pop();
const pascal = (key) => key.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

function toScreens(navs, parent = null) {
  return navs.flatMap((nav) => {
    const key = keyOf(nav);
    const content = (nav.Layout && nav.Layout.Content) || [];
    const form = formlist.find((f) => f.Id === (content[0] && content[0].formid));
    const screen = {
      name: nav.Title,
      pluginName: pascal(key),
      key,
      title: nav.Title,
      formId: content[0] ? content[0].formid : null,
      modelName: form ? form.ModelName : "",
      icon: nav.WebIcon || "",
      description: nav.description || "",
      order: nav.order,
      showinmenu: nav.showinmenu !== false,
      parent,
      navParams: (nav.Params || []).map((p) => ({ key: p.name, value: p.value ?? "" })),
      roles: nav.roles || []
    };
    return [screen, ...toScreens(nav.children || [], key)];
  });
}

const spec = {
  ...current,
  appName: (formlist[0] && formlist[0].AppName) || current.appName,
  roles: current.roles || [],
  screens: toScreens(menu.Nav || [])
};
writeFileSync(specPath, JSON.stringify(spec, null, 2) + "\n");
console.log(`app-spec.json: ${spec.screens.length} screens from ${FORMS_DIR}/menu.json`);
