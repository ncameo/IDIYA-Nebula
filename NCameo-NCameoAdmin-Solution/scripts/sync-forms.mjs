// Adds, updates or deletes NCameo datasources, forms and the menu through /api/Datasource, /api/Forms and /api/Menu.
//
//   node scripts/sync-forms.mjs push [formId ...]   add or update datasources, forms (all {formId}.json when none given) and the menu
//   node scripts/sync-forms.mjs datasources [id ...] add or update datasources only (ncameo/{idx}dataconnections/{id}.json)
//   node scripts/sync-forms.mjs forms [formId ...]  add or update forms only
//   node scripts/sync-forms.mjs menu                add or update menu.json only
//   node scripts/sync-forms.mjs delete <id> ...     delete forms by id
//   add --dry-run to print the requests without sending them
//
// Environment:
//   NCAMEO_API_BASE_URL  API host (default: app-spec.json apiBaseUrl)
//   NCAMEO_TOKEN         bearer token sent as Authorization header (optional)
//   NCAMEO_IDX           tenant idx (default: quzlglsembkgyxy)
import { readFileSync, readdirSync, existsSync } from "node:fs";

const FORMS_DIR = "/Users/arunyadav/MyProjects/nebula-products/ncameo/quzlglsembkgyxy";
// Datasource records ({id}.json) live next to the forms folder; binding-profile.json there is skipped.
const DATASOURCES_DIR = `${FORMS_DIR}dataconnections`;
const FORM_FILE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.json$/i;

const appSpec = JSON.parse(readFileSync(new URL("../app-spec.json", import.meta.url), "utf8"));
const BASE_URL = (process.env.NCAMEO_API_BASE_URL || appSpec.apiBaseUrl).replace(/\/+$/, "");
const IDX = process.env.NCAMEO_IDX || appSpec.idx || "quzlglsembkgyxy";
const TOKEN = process.env.NCAMEO_TOKEN || appSpec.token || null;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const [command, ...ids] = args.filter((a) => a !== "--dry-run");

const readJson = (file, dir = FORMS_DIR) => JSON.parse(readFileSync(`${dir}/${file}`, "utf8"));

async function request(method, path, query, body) {
  const url = `${BASE_URL}${path}?${new URLSearchParams(query)}`;
  if (dryRun && method !== "GET") {
    console.log(`[dry-run] ${method} ${url}`);
    return null;
  }
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${text.slice(0, 300)}`);
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// ApiResponse wraps the record in "data"; an empty/null data means it does not exist yet.
function hasData(response) {
  if (!response || typeof response !== "object") return false;
  const data = response.data ?? response.Data;
  return Array.isArray(data) ? data.length > 0 : data != null && data !== "";
}

async function exists(path, query) {
  try {
    return hasData(await request("GET", path, query));
  } catch (err) {
    if (/-> 404/.test(err.message)) return false;
    throw err;
  }
}

async function upsertForm(id) {
  const file = `${id}.json`;
  if (!existsSync(`${FORMS_DIR}/${file}`)) throw new Error(`${file} not found in ${FORMS_DIR}`);
  const form = readJson(file);
  const formId = form.Id || form.id || id;
  const found = await exists("/api/Forms", { id: formId, idx: IDX });
  await request(found ? "PUT" : "POST", "/api/Forms", { idx: IDX }, form);
  console.log(`${found ? "updated" : "added"}  form ${formId} (${form.Formname || form.FormName || ""})`);
}

async function upsertDatasource(id) {
  const file = `${id}.json`;
  if (!existsSync(`${DATASOURCES_DIR}/${file}`)) throw new Error(`${file} not found in ${DATASOURCES_DIR}`);
  const datasource = readJson(file, DATASOURCES_DIR);
  const datasourceId = datasource.id || datasource.Id || id;
  const found = await exists("/api/Datasource", { id: datasourceId, idx: IDX });
  await request(found ? "PUT" : "POST", "/api/Datasource", { idx: IDX }, datasource);
  console.log(`${found ? "updated" : "added"}  datasource ${datasourceId} (${datasource.name || ""})`);
}

async function upsertMenu() {
  const menu = readJson("menu.json");
  const found = await exists("/api/Menu", { idx: IDX });
  await request(found ? "PUT" : "POST", "/api/Menu", { idx: IDX }, menu);
  console.log(`${found ? "updated" : "added"}  menu.json`);
}

async function deleteForm(id) {
  await request("DELETE", "/api/Forms", { id });
  console.log(`deleted  form ${id}`);
}

const idsIn = (dir) => (existsSync(dir) ? readdirSync(dir) : []).filter((f) => FORM_FILE.test(f)).map((f) => f.replace(/\.json$/, ""));
const allFormIds = () => idsIn(FORMS_DIR);
const allDatasourceIds = () => idsIn(DATASOURCES_DIR);

async function main() {
  console.log(`${dryRun ? "[dry-run] " : ""}${BASE_URL}  idx=${IDX}`);
  switch (command) {
    case "push":
      // Datasources first: forms reference them through getconnection.
      for (const id of allDatasourceIds()) await upsertDatasource(id);
      for (const id of ids.length ? ids : allFormIds()) await upsertForm(id);
      await upsertMenu();
      break;
    case "datasources":
      for (const id of ids.length ? ids : allDatasourceIds()) await upsertDatasource(id);
      break;
    case "forms":
      for (const id of ids.length ? ids : allFormIds()) await upsertForm(id);
      break;
    case "menu":
      await upsertMenu();
      break;
    case "delete":
      if (!ids.length) throw new Error("delete needs at least one form id");
      for (const id of ids) await deleteForm(id);
      break;
    default:
      throw new Error("usage: sync-forms.mjs <push|datasources|forms|menu|delete> [ids...] [--dry-run]");
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
