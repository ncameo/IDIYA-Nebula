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
      accesstoken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1KeW5lRnJRT09HUVZBc3BDbkxhMzQ5a1VPMCJ9.eyJhdWQiOiI2ZDMxZTE0OS0wMjljLTRiNjEtYTYxMS05NzBmODdiOTExM2YiLCJpc3MiOiJodHRwczovL2Y5ZWVlMmFkLWQyNzgtNGI0OC05N2NjLWU3NTRmNTA5N2RmOS5jaWFtbG9naW4uY29tL2Y5ZWVlMmFkLWQyNzgtNGI0OC05N2NjLWU3NTRmNTA5N2RmOS92Mi4wIiwiaWF0IjoxNzkxMjg3OTU5LCJuYmYiOjE3OTEyODc5NTksImV4cCI6MTc5MTI5MjgwMSwiYWlvIjoiQVZRQXEvOGVBQUFBYTBpeDZuOFFjaHRGOHdBT0RldVFzWUpyV0Q2aXZrMStmcGhwSm8yYko0Szc4YzlsakxYamZCTzdBMnZZejUrNFhGWDZzK1VjeG5TRDloMzJzSmRWeURWLzlnNjdqamdnSWUxNWlqOFFRZkk9IiwiYXV0aF90aW1lIjoxNzkxMjg4MjUyLCJhenAiOiI2ZDMxZTE0OS0wMjljLTRiNjEtYTYxMS05NzBmODdiOTExM2YiLCJhenBhY3IiOiIwIiwiZW1haWwiOiJyYmJmdW5kaXFAeW9wbWFpbC5jb20iLCJmYW1pbHlfbmFtZSI6IkZ1bmRpUSIsImdpdmVuX25hbWUiOiJSQkIiLCJuYW1lIjoiUkJCIEZ1bmRpUSIsIm9pZCI6ImZhOTdiZDMxLTU2ZjktNDI2ZS1iZWRhLWJhNzQxYTVlOTQzZiIsInByZWZlcnJlZF91c2VybmFtZSI6InJiYmZ1bmRpcUB5b3BtYWlsLmNvbSIsInJoIjoiMS5BYmdBcmVMdS1YalNTRXVYek9kVTlRbDktVW5oTVcyY0FtRkxwaEdYRDRlNUVUOEFBSVc0QUEuIiwic2NwIjoiQWNjZXNzX2FzX3VzZXIgVXNlci5yZWFkIFVzZXIud3JpdGUiLCJzaWQiOiIwMDk5ODhjYS05OGJkLWUwNWMtYjZkZS02NjViNjE3NDMyMjciLCJzdWIiOiJfSE5HN0l0VExhYi1JcEZack5QbXhOVWxQRGxIczh6WnJEZjNvZEFrbUFJIiwidGlkIjoiZjllZWUyYWQtZDI3OC00YjQ4LTk3Y2MtZTc1NGY1MDk3ZGY5IiwidXBuIjoiZmE5N2JkMzEtNTZmOS00MjZlLWJlZGEtYmE3NDFhNWU5NDNmQHJiYmZ1bmRpcS5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJLRGxoeWF2ZnBFcWo5eTJYVGFjQkFBIiwidmVyIjoiMi4wIiwieG1zX2Z0ZCI6InVvWlBhVzd0bUZTSGhLZnd5VDZRRlh2SmU1ZFh6V09NTzU5anp3dUVSRk1CZFhOdWIzSjBhQzFrYzIxeiIsInVzZXJyb2xlIjoiW1xuICBcIkFkbWluaXN0cmF0b3JcIixcbiAgXCJEZXZlbG9wZXJcIlxuXSIsIlRlbmFudE5hbWUiOiJuY2FtZW8ifQ.IBtjdLbnyFkmGQhZ3w62p2-eWYx0HYzj3I_xC2ufxvHhqzz1JswVYhUSp2syUUOh2z6bIanMItAIQwGEg4EffqyaNyqgASnKfn7tZx_t0o-06mOzRmWzeJyrx-KNq6po6LVtRysu7d8qFRCYl-Lfz9BFxZaDURnWOiFA3B18ApC0JdghCdOHK9AO67M10f69zVop-QC4p0X0dNkGVvX5trgM4wZcFibwx_98vPRmHrSdgNd9L04ezKk4hiWGjzBo-OzhmLy7pyMuE22gQSyZMFbZnAcO-jVkS3s_zhTiwYYcOYgUDA3i-GtE8bh_QaVejNf_29pyWoGgaWigAwkjNw",
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
