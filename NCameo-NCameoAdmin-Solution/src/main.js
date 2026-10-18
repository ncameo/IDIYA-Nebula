import "./style.css";
import appSpec from "../app-spec.json";
import navigationJson from "@ncameo-forms/menu.json";

// Each form ({formId}.json) is split into its own chunk and loaded when its menu item is opened.
const formModules = import.meta.glob("@ncameo-forms/*-*-*-*-*.json", { import: "default" });

window.token = {
  user: {}
};

// ncameo.js is loaded with a classic defer script before this module, so NCameo is already defined.
const cameo = new window.NCameo();

// NCameoAdmin-Plugins-Solution/output is Vite's publicDir, so plugins are served from the site root.
const PLUGIN_BASE_URL = location.origin;

// Point every uiextension control at the locally built plugin instead of the blob copy.
// Works on a copy so the cached form module stays untouched.
function useLocalPlugins(formui, pluginName) {
  const form = structuredClone(formui);
  const pluginUrl = `${PLUGIN_BASE_URL}/${pluginName.toLowerCase()}`;
  (form.controls || [])
    .filter((c) => c.type === "uiextension")
    .forEach((c) => {
      c.pluginsrc = `${pluginUrl}/ncameo.js`;
      c.plugincss = `${pluginUrl}/main.css`;
    });
  return form;
}

// app-spec.json "apiConnection" ({ id, name, baseurl }) is the NCameo HTTP connection every form's
// getconnection points at; add it (or override the same id) so on-load APIs hit the real API host.
function withAppConnection(list) {
  const c = appSpec.apiConnection;
  if (!c || !c.id) return list;
  const entry = { datasourcetype: "http", datasource: "http", authentication: "loginauth", enablecors: true, ...c };
  return [...list.filter((x) => x.id !== c.id), { ...(list.find((x) => x.id === c.id) || {}), ...entry }];
}

function buildParam(formui, pageparams) {
  return {
    cameoid: "",
    dataid: "",
    formui: formui,
    datamodel: null,
    access: "write",
    pageparams: pageparams || {},
    settings: {
      login_service: "azureb2c",
      BaseApiUrl: "https://ncameosaasdev.azurewebsites.net/",
      // Plugins receive this as props.token.AzureFunctionEndpoint (their API base URL).
      AzureFunctionEndpoint: appSpec.apiBaseUrl || "https://adminncameodevapi.azurewebsites.net",
      accesstoken: "eyJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiI4OGI4ZjRiYi0xMjQwLTQyMjEtYjVmNS1mMWU4NWE0YmJhZWYiLCJpc3MiOiJodHRwczovL25jYW1lb2IyYy5iMmNsb2dpbi5jb20vYzI1N2JkMjYtNWU0Zi00MGE3LTliMDYtNDA3YWUxNzYwZjBhL3YyLjAvIiwiZXhwIjoxNzkyMjMwODkzLCJuYmYiOjE3OTIxNDQ0OTMsIm9pZCI6ImFiMzY0NGUyLWFkMDQtNDE3Zi04OTc0LTQ1NTgyYTRlZGEwYyIsInN1YiI6ImFiMzY0NGUyLWFkMDQtNDE3Zi04OTc0LTQ1NTgyYTRlZGEwYyIsIm5hbWUiOiJOQ0FNRU8gQWRtaW4iLCJnaXZlbl9uYW1lIjoiTkNBTUVPIiwiZXh0ZW5zaW9uX3JvbGVzIjoiW1xyXG4gIFwiRGV2ZWxvcGVyXCIsXHJcbiAgXCJBZG1pbmlzdHJhdG9yXCIsXHJcbiAgXCJOQ0FNRU9cIlxyXG5dIiwiZmFtaWx5X25hbWUiOiJBZG1pbiIsImV4dGVuc2lvbl9TY2hvb2xJZCI6IjAiLCJleHRlbnNpb25fVGVuYW50TmFtZSI6Im5jYW1lbyIsImV4dGVuc2lvbl9UZW5hbnRJZCI6IjAzNTYyZTEwLTJkYzctNDgyYi1iODM1LWQ5OWRlMTNmNWQyZSIsImVtYWlscyI6WyJhZG1pbkBuY2FtZW8uY29tIl0sInRmcCI6IkIyQ18xX1VzZXIiLCJub25jZSI6IjAxYTE0NDIyLThlMDAtNzQ2ZS1hNzkyLWU1YWJjZGY5OGFlZiIsInNjcCI6InVzZXIucmVhZCBwcm9maWxlIG9mZmxpbmVfYWNjZXNzIiwiYXpwIjoiODhiOGY0YmItMTI0MC00MjIxLWI1ZjUtZjFlODVhNGJiYWVmIiwidmVyIjoiMS4wIiwiaWF0IjoxNzkyMTQ0NDkzfQ.qEpG2XCldz4A8JDFiFG2IAtXt0vG8qqHN0215tHVzZjGYEiCGOXPO56j9wHaWZbXhZMWAj_VfsK5rq3oqXrDVaJdpKrFQrh1KbBPR-7Jzz24h-LZ59LLh2tmvar_c6XtKNA_2_uP7iu5HnQDxZVQNsH8M0tNgRL0u4h1vo7rkpyCtbQUiSuHYh9JuDyDuWjMfbVwEabEyzFQ9GHIWUZfyTPEmmbqvQhDtazs-6a53uMRt1W_V7GZEsfWGbzIEqX1dfFok4VL6pm1MqDzbU2dckR2wjQd0ebtmg04nhhgh6lOGIkmyv7xaONzYh0Zd2Fp4I3KEeJawCUvykdAMBFgsw",
      menu: navigationJson,
      // Form on-load APIs resolve against dataconnection[getconnection].baseurl.
      dataconnection: withAppConnection([
        {
          datasourcetype: "http",
          baseurl: "https://adminncameodevfunction.azurewebsites.net",
          authentication: "loginauth",
          datasource: "http",
          name: "NCAMEO Test API",
          logo: "https://adminncameostorage.blob.core.windows.net/ncameo/ncameofiles/ncameo.png",
          enablecors: true,
          description: "NCAMEO Rest API",
          logo_name: "ncameo.png",
          logo_url: "https://adminncameostorage.blob.core.windows.net/ncameo/ncameofiles/ncameo.png",
          id: "7c4b6649-ccb7-4bdd-ae6a-75c4eb900221",
          CreateDate: "2022-01-25T10:47:44.4097272+00:00",
          UpdateDate: "2022-02-28T13:26:20.5728582+00:00"
        }
      ]),
      app: {
        name: appSpec.appName,
        database: appSpec.appId || appSpec.appName.replace(/\s+/g, "").toLowerCase()
      }
    }
  };
}

function loadForm(formId) {
  const loader = Object.entries(formModules).find(([path]) => path.endsWith(`/${formId}.json`));
  if (!loader) return Promise.reject(new Error(`form ${formId}.json not found`));
  return loader[1]();
}

function menuLink(screen) {
  return `<a href="#/${screen.key}" data-key="${screen.key}"><i class="${screen.icon || ""}"></i> ${screen.title}</a>`;
}

// Top-level screens with their children; screens with showinmenu:false stay routable but hidden.
function renderMenu() {
  const visible = appSpec.screens.filter((s) => s.showinmenu !== false);
  document.getElementById("app-menu").innerHTML = visible
    .filter((s) => !s.parent)
    .map((s) => {
      const children = visible.filter((c) => c.parent === s.key);
      const childList = children.length
        ? `<ul>${children.map((c) => `<li>${menuLink(c)}</li>`).join("")}</ul>`
        : "";
      return `<li>${menuLink(s)}${childList}</li>`;
    })
    .join("");
}

// Route format: #/<screen key>?param=value
function parseRoute() {
  const [key, query] = location.hash.replace(/^#\/?/, "").split("?");
  const pageparams = {};
  new URLSearchParams(query || "").forEach((v, k) => {
    pageparams[k] = v;
  });
  return { key, pageparams };
}

function loadScreen() {
  const route = parseRoute();
  const screen =
    appSpec.screens.find((s) => s.key === route.key) ||
    appSpec.screens.find((s) => s.showinmenu !== false);

  (screen.navParams || []).forEach((p) => {
    if (!(p.key in route.pageparams)) route.pageparams[p.key] = p.value;
  });

  document.querySelectorAll("#app-menu a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-key") === screen.key);
  });
  document.title = `${screen.title} - ${appSpec.appName}`;

  const container = document.getElementById("ncameo");
  loadForm(screen.formId)
    .then((formui) => {
      cameo.unmountComponent(container);
      const param = buildParam(useLocalPlugins(formui, screen.pluginName), route.pageparams);
      console.log(`Rendering form for "${screen.name}" with pageparams:`, param);
      cameo.form(param, container);
    })
    .catch((err) => {
      cameo.unmountComponent(container);
      container.innerHTML = `<div class="app-message">Unable to load form for "${screen.name}": ${err.message}</div>`;
    });
}

// Pushes every datasource, form and menu.json to /api/Datasource, /api/Forms and /api/Menu via the dev server's /__sync endpoint.
function syncForms() {
  const btn = document.getElementById("sync-btn");
  const status = document.getElementById("sync-status");
  if (!confirm("Add/update all datasources, forms and the menu on the NCameo API?")) return;
  btn.disabled = true;
  status.className = "";
  status.textContent = "Syncing...";
  fetch("/__sync", { method: "POST" })
    .then((res) => {
      if (!res.ok) throw new Error(`Sync is only available on the dev server (HTTP ${res.status})`);
      return res.json();
    })
    .then((result) => {
      status.className = result.ok ? "" : "error";
      status.textContent = result.output || (result.ok ? "Done" : "Sync failed");
    })
    .catch((err) => {
      status.className = "error";
      status.textContent = err.message;
    })
    .finally(() => {
      btn.disabled = false;
    });
}

// Wait for the deferred plugin scripts in <head> to run before rendering the first screen.
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("app-title").textContent = appSpec.appName;
  renderMenu();
  document.getElementById("sync-btn").addEventListener("click", syncForms);
  window.addEventListener("hashchange", loadScreen);
  loadScreen();
});
