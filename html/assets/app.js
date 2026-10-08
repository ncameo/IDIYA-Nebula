(function () {
  "use strict";
  var SPEC = {
    version: "1.1",
    endpoints: {"EP-001": "POST /api/products", "EP-002": "PATCH /api/products/ProductId/{ProductId}", "EP-003": "GET /api/products/ProductId/{ProductId}", "EP-004": "GET /api/products", "EP-005": "GET /api/customers", "EP-006": "GET /api/customers/CustomerId/{CustomerId}", "EP-007": "PATCH /api/customers/CustomerId/{CustomerId}"},
    files: {"S-01": "S-01-products.html", "S-02": "S-02-edit-product.html", "S-03": "S-03-customers.html", "S-04": "S-04-de-activate-customer.html"},
    fields: {"Name": {"id": "F-01.01", "type": "string", "required": true, "name": "Name"}, "Category": {"id": "F-01.02", "type": "enum", "required": true, "name": "Category"}, "PartnerCode": {"id": "F-01.03", "type": "string", "required": false, "name": "Partner code"}, "NoOfAppsAllowed": {"id": "F-01.04", "type": "number", "required": true, "name": "No. of apps allowed"}, "Visibility": {"id": "F-01.05", "type": "enum", "required": true, "name": "Visibility"}, "BillingType": {"id": "F-01.06", "type": "enum", "required": true, "name": "Billing type"}, "MonthlyStripePrice": {"id": "F-01.07", "type": "string", "required": false, "name": "Monthly Stripe price"}, "MonthlyPriceUsd": {"id": "F-01.08", "type": "number", "required": false, "name": "Monthly price (USD)"}, "YearlyStripePrice": {"id": "F-01.09", "type": "string", "required": false, "name": "Yearly Stripe price"}, "YearlyPriceUsd": {"id": "F-01.10", "type": "number", "required": false, "name": "Yearly price (USD)"}, "ShortDescription": {"id": "F-01.11", "type": "longtext", "required": false, "name": "Short description"}, "ScriptAzure": {"id": "F-01.12", "type": "longtext", "required": false, "name": "Script (Azure)"}, "ScriptAws": {"id": "F-01.13", "type": "string", "required": false, "name": "Script (AWS)"}, "OneTimePriceUsd": {"id": "F-01.14", "type": "number", "required": false, "name": "One-time price (USD)"}, "ProductId": {"id": "F-01.15", "type": "guid", "required": true, "name": "Product Id"}},
    cfields: {"CustomerId": {"id": "F-02.01", "type": "guid", "required": true, "name": "Customer Id"}, "Name": {"id": "F-02.02", "type": "string", "required": true, "name": "Name"}, "ContactName": {"id": "F-02.03", "type": "string", "required": false, "name": "Contact name"}, "Email": {"id": "F-02.04", "type": "email", "required": false, "name": "Email"}, "Phone": {"id": "F-02.05", "type": "phone", "required": false, "name": "Phone"}, "StripeCustomerId": {"id": "F-02.06", "type": "string", "required": false, "name": "Stripe customer ID"}, "Status": {"id": "F-02.07", "type": "enum", "required": true, "name": "Status"}, "CustomerSince": {"id": "F-02.08", "type": "date", "required": false, "name": "Customer since"}, "DeactivationReason": {"id": "F-02.09", "type": "string", "required": false, "name": "Deactivation reason"}, "DeactivationNote": {"id": "F-02.10", "type": "longtext", "required": false, "name": "Deactivation note"}},
    stateGuard: { T01: { from: "Active", to: "Inactive", refuse: "Customer is already inactive." } }
  };
  var SEED = [{"ProductId": "6513270e-269e-4d37-b2a7-4de452e6b438", "Name": "Sample Starter Platform", "Category": "PaaS", "PartnerCode": "SAMPLE-01", "NoOfAppsAllowed": 5, "Visibility": "Public", "BillingType": "Recurring", "ShortDescription": "Synthetic sample product for the prototype.", "ScriptAzure": "", "ScriptAws": "", "MonthlyStripePrice": "price_sample_m0", "MonthlyPriceUsd": 49, "YearlyStripePrice": "price_sample_y0", "YearlyPriceUsd": 490}, {"ProductId": "d23f0824-128b-4f33-8c5c-7fd0a6a3a450", "Name": "Sample Growth Platform", "Category": "PaaS", "PartnerCode": "SAMPLE-02", "NoOfAppsAllowed": 10, "Visibility": "Public", "BillingType": "Recurring", "ShortDescription": "Synthetic sample product for the prototype.", "ScriptAzure": "", "ScriptAws": "", "MonthlyStripePrice": "price_sample_m1", "MonthlyPriceUsd": 98, "YearlyStripePrice": "price_sample_y1", "YearlyPriceUsd": 980}, {"ProductId": "9531985d-5d9d-49f8-9818-e811892f902b", "Name": "Sample Managed Essentials", "Category": "Managed", "PartnerCode": "SAMPLE-03", "NoOfAppsAllowed": 15, "Visibility": "Public", "BillingType": "Recurring", "ShortDescription": "Synthetic sample product for the prototype.", "ScriptAzure": "", "ScriptAws": "", "MonthlyStripePrice": "price_sample_m2", "MonthlyPriceUsd": 147, "YearlyStripePrice": "price_sample_y2", "YearlyPriceUsd": 1470}, {"ProductId": "36f675cc-81e7-4ef5-a8e2-5d940ed90475", "Name": "Sample Managed Plus", "Category": "Managed", "PartnerCode": "SAMPLE-04", "NoOfAppsAllowed": 20, "Visibility": "Private", "BillingType": "One time", "ShortDescription": "Synthetic sample product for the prototype.", "ScriptAzure": "", "ScriptAws": "", "OneTimePriceUsd": 796}, {"ProductId": "6b0d549b-6f03-475a-9600-a35a099950d8", "Name": "Sample Enterprise Platform", "Category": "PaaS", "PartnerCode": "SAMPLE-05", "NoOfAppsAllowed": 25, "Visibility": "Draft", "BillingType": "One time", "ShortDescription": "Synthetic sample product for the prototype.", "ScriptAzure": "", "ScriptAws": "", "OneTimePriceUsd": 995}];
  var CSEED = [{"CustomerId": "8d116ece-1738-47d9-bd9c-172411e20b8f", "Name": "Sample Customer RB", "ContactName": "Sample Contact 1", "Email": "contact1@example.com", "Phone": "+00 000 000 0001", "StripeCustomerId": "cus_sample001", "Status": "Active", "CustomerSince": "2026-01-15"}, {"CustomerId": "90c192cf-d3ac-44af-8f21-ddb66cad4a26", "Name": "Sample Customer Alpha", "ContactName": "Sample Contact 2", "Email": "contact2@example.com", "Phone": "+00 000 000 0002", "StripeCustomerId": "cus_sample002", "Status": "Active", "CustomerSince": "2025-11-02"}, {"CustomerId": "a170b338-3926-4059-b28c-105d1fb17c23", "Name": "Sample Customer Beta", "ContactName": "Sample Contact 3", "Email": "contact3@example.com", "Phone": "+00 000 000 0003", "StripeCustomerId": "cus_sample003", "Status": "Inactive", "CustomerSince": "2025-06-20"}, {"CustomerId": "0fd630f1-f29d-4da9-953f-48f1a09f76b5", "Name": "Sample Customer Gamma", "ContactName": "Sample Contact 4", "Email": "contact4@example.com", "Phone": "+00 000 000 0004", "StripeCustomerId": "cus_sample004", "Status": "Active", "CustomerSince": "2026-03-08"}];
  var PREVIEW = !!window.__PREVIEW__;
  var store = SEED.map(function (r) { return Object.assign({}, r); });
  var cstore = CSEED.map(function (r) { return Object.assign({}, r); });
  try {
    if (!PREVIEW && window.sessionStorage) {
      var saved = window.sessionStorage.getItem("nebula-products:store");
      if (saved) store = JSON.parse(saved);
      var csaved = window.sessionStorage.getItem("nebula-products:customers");
      if (csaved) cstore = JSON.parse(csaved);
    }
  } catch (e) {}
  function persist() { try { if (!PREVIEW && window.sessionStorage) { window.sessionStorage.setItem("nebula-products:store", JSON.stringify(store)); window.sessionStorage.setItem("nebula-products:customers", JSON.stringify(cstore)); } } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function trace(line) { var t = $("trace"); if (t) t.textContent += line + "\n"; }
  function notice(msg, kind) { var n = $("notice"); if (n) { n.textContent = msg; n.className = "notice" + (kind ? " " + kind : ""); } }
  function guid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); });
  }
  function clone(o) { return Object.assign({}, o); }

  // ---- Mock tools: one function per agent.tools[], named exactly ----
  var tools = {
    np_create_product: function (rec) {
      var row = clone(rec); row.ProductId = guid(); store.push(row); persist();
      trace("A-01 -> np_create_product -> EP-001 " + SPEC.endpoints["EP-001"] + "  => " + row.ProductId);
      return row;
    },
    np_get_product: function (id) {
      var row = store.filter(function (r) { return r.ProductId === id; })[0] || null;
      trace("A-02 -> np_get_product -> EP-003 " + SPEC.endpoints["EP-003"].replace("{ProductId}", id) + "  => " + (row ? row.Name : "not found"));
      return row ? clone(row) : null;
    },
    np_list_product: function (filter) {
      filter = filter || {};
      var rows = store.filter(function (r) {
        if (filter.Name && r.Name.toLowerCase().indexOf(filter.Name.toLowerCase()) < 0) return false;
        if (filter.Category && r.Category !== filter.Category) return false;
        if (filter.Visibility && r.Visibility !== filter.Visibility) return false;
        return true;
      });
      trace("A-03 -> np_list_product -> EP-004 " + SPEC.endpoints["EP-004"] + "  filter=" + JSON.stringify(filter) + "  => " + rows.length + " record(s)");
      return rows.map(clone);
    },
    np_update_product: function (id, changes) {
      var row = store.filter(function (r) { return r.ProductId === id; })[0];
      if (!row) throw new Error("Product not found.");
      Object.assign(row, changes); persist();
      trace("A-04 -> np_update_product -> EP-002 " + SPEC.endpoints["EP-002"].replace("{ProductId}", id) + "  => saved");
      return clone(row);
    }
  };
  tools.np_list_customer = function (filter) {
    filter = filter || {};
    var rows = cstore.filter(function (r) {
      if (filter.Name && r.Name.toLowerCase().indexOf(filter.Name.toLowerCase()) < 0) return false;
      if (filter.Status && r.Status !== filter.Status) return false;
      return true;
    });
    trace("A-07 -> np_list_customer -> EP-005 " + SPEC.endpoints["EP-005"] + "  filter=" + JSON.stringify(filter) + "  => " + rows.length + " record(s)");
    return rows.map(clone);
  };
  tools.np_get_customer = function (id) {
    var row = cstore.filter(function (r) { return r.CustomerId === id; })[0] || null;
    trace("A-08 -> np_get_customer -> EP-006 " + SPEC.endpoints["EP-006"].replace("{CustomerId}", id) + "  => " + (row ? row.Name : "not found"));
    return row ? clone(row) : null;
  };
  tools.np_update_customer = function (id, changes) {
    var row = cstore.filter(function (r) { return r.CustomerId === id; })[0];
    if (!row) throw new Error("Customer not found.");
    var g = SPEC.stateGuard.T01;
    if (changes.Status === g.to) {
      if (row.Status !== g.from) { trace("A-09 -> np_update_customer -> EP-007 refused (T-01 guard): " + g.refuse); throw new Error(g.refuse); }
    }
    Object.assign(row, changes); persist();
    trace("A-09 -> np_update_customer -> EP-007 " + SPEC.endpoints["EP-007"].replace("{CustomerId}", id) + "  T-01 Active->Inactive  => saved");
    return clone(row);
  };
  window.NebulaMock = { tools: tools, spec: SPEC };

  // ---- Router ----
  function go(screen, params) {
    var q = Object.keys(params || {}).filter(function (k) { return params[k]; }).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); }).join("&");
    if (PREVIEW) { location.hash = "#/" + screen + (q ? "?" + q : ""); }
    else { location.href = SPEC.files[screen] + (q ? "?" + q : ""); }
  }
  function parseQuery(s) { var o = {}; (s || "").replace(/^\?/, "").split("&").forEach(function (p) { if (p) { var kv = p.split("="); o[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ""); } }); return o; }
  function route() {
    var h = (location.hash || "").replace(/^#\/?/, "");
    var parts = h.split("?"); var sid = parts[0] || window.__FIRST__;
    var wraps = document.querySelectorAll("[data-screen-wrap]");
    var found = false;
    Array.prototype.forEach.call(wraps, function (w) { var on = w.getAttribute("data-screen-wrap") === sid; w.hidden = !on; if (on) found = true; });
    if (!found) { sid = window.__FIRST__; wraps[0].hidden = false; Array.prototype.forEach.call(wraps, function (w, i) { w.hidden = w.getAttribute("data-screen-wrap") !== sid; }); }
    var sw = $("screenSwitch"); if (sw) sw.value = sid;
    Array.prototype.forEach.call(document.querySelectorAll(".sidebar .nav-item"), function (a) { var nv = { "S-02": "S-01", "S-04": "S-03" }[sid] || sid; a.classList.toggle("active", a.getAttribute("data-nav-screen") === nv); });
    var main = document.querySelector('[data-screen-wrap="' + sid + '"] main');
    bind(main, parseQuery(parts[1]));
  }

  // ---- Screen binding ----
  function bind(main, params) {
    if (!main) return;
    var sid = main.getAttribute("data-screen");
    notice("Prototype - mock data only.");
    if (sid === "S-01") bindList(main); else if (sid === "S-02") bindForm(main, params);
    else if (sid === "S-03") bindCustomers(main, params);
    else if (sid === "S-04") bindDeactivate(main, params);
  }
  function priceText(r) {
    if (r.BillingType === "Recurring") return "$" + (r.MonthlyPriceUsd == null || r.MonthlyPriceUsd === "" ? "-" : r.MonthlyPriceUsd) + " / month";
    return "$" + (r.OneTimePriceUsd == null || r.OneTimePriceUsd === "" ? "-" : r.OneTimePriceUsd) + " one time";
  }
  function bindList(main) {
    var $ = function (id) { return main.querySelector("#" + id); };
    var grid = $("productsGrid"), tpl = $("cardTemplate"), empty = $("emptyState");
    function render() {
      var rows = tools.np_list_product({ Name: $("Name").value.trim(), Category: $("Category").value, Visibility: $("Visibility").value });
      Array.prototype.slice.call(grid.querySelectorAll(".pcard")).forEach(function (n) { n.remove(); });
      rows.sort(function (a, b) { return a.Name.localeCompare(b.Name); }).forEach(function (r) {
        var node = tpl.content.firstElementChild.cloneNode(true);
        ["Name", "Category", "Visibility", "BillingType"].forEach(function (k) { var el = node.querySelector('[data-bind="' + k + '"]'); el.textContent = r[k]; if (k === "Visibility") el.setAttribute("data-v", r[k]); });
        node.querySelector('[data-bind="price"]').textContent = priceText(r);
        node.querySelector("button").onclick = function () { go("S-02", { ProductId: r.ProductId }); };
        grid.appendChild(node);
      });
      empty.hidden = rows.length > 0;
      notice(rows.length + " product(s) shown.");
    }
    ["Name", "Category", "Visibility"].forEach(function (id) { var el = $(id); el.oninput = render; el.onchange = render; });
    $("addProduct").onclick = function () { go("S-02", {}); };
    render();
  }

  function initials(n) { var w = String(n || "").trim().split(/\s+/).filter(Boolean); return ((w[0] || "")[0] || "") + ((w[1] || "")[0] || ""); }
  function monthYear(d) { if (!d) return ""; var t = new Date(d + "T00:00:00"); return isNaN(t) ? d : "Customer since " + t.toLocaleDateString("en-US", { month: "short", year: "numeric" }); }
  function fillBinds(root, rec) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-bind]"), function (el) {
      var k = el.getAttribute("data-bind"); var v = rec ? rec[k] : "";
      el.textContent = k === "CustomerSince" ? monthYear(v) : (v == null ? "" : v);
      if (k === "Status") el.setAttribute("data-v", v || "");
      if (k === "initials") el.textContent = initials(rec && rec.Name);
    });
  }
  function bindCustomers(main, params) {
    var $ = function (id) { return main.querySelector("#" + id); };
    var items = $("customerItems"), tpl = $("customerItemTemplate"), empty = $("customerEmpty"), detail = $("customerDetail");
    var selected = params.CustomerId || null;
    function show(id) {
      var rec = id ? tools.np_get_customer(id) : null;
      selected = rec ? rec.CustomerId : null;
      fillBinds(detail, rec);
      var d = $("deactivateCustomer"); d.disabled = !rec || rec.Status !== "Active"; d.title = d.disabled && rec ? "Customer is already inactive." : "";
      Array.prototype.forEach.call(items.querySelectorAll(".list-card"), function (n) { n.classList.toggle("active-card", n.getAttribute("data-id") === selected); });
    }
    function render() {
      var rows = tools.np_list_customer({ Name: $("customerSearch").value.trim(), Status: $("activeOnly").checked ? "Active" : "" });
      Array.prototype.slice.call(items.querySelectorAll(".left-card-col")).forEach(function (n) { n.remove(); });
      rows.sort(function (a, b) { return a.Name.localeCompare(b.Name); }).forEach(function (r) {
        var node = tpl.content.firstElementChild.cloneNode(true);
        var card = node.querySelector(".list-card");
        card.setAttribute("data-id", r.CustomerId); fillBinds(node, r);
        card.onclick = function () { show(r.CustomerId); };
        card.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(r.CustomerId); } };
        items.appendChild(node);
      });
      empty.hidden = rows.length > 0;
      var ids = rows.map(function (r) { return r.CustomerId; });
      if (!selected || ids.indexOf(selected) < 0) selected = ids[0] || null;
      show(selected);
      notice(rows.length + " customer(s) shown.");
    }
    $("customerSearch").oninput = render; $("activeOnly").onchange = render;
    $("deactivateCustomer").onclick = function () { if (selected) go("S-04", { CustomerId: selected }); };
    render();
  }
  function bindDeactivate(main, params) {
    var $ = function (id) { return main.querySelector("#" + id); };
    if (!params.CustomerId && cstore.length) params = { CustomerId: cstore[0].CustomerId };
    var rec = params.CustomerId ? tools.np_get_customer(params.CustomerId) : null;
    fillBinds(main, rec); $("CustomerId").value = rec ? rec.CustomerId : "";
    $("DeactivationReason").value = ""; $("DeactivationNote").value = ""; $("promoCode").value = ""; $("deactivateError").textContent = "";
    if (!rec) notice("Customer not found.", "err");
    $("cancelDeactivate").onclick = function () { go("S-03", { CustomerId: params.CustomerId }); };
    $("deactivateForm").onsubmit = function (ev) {
      ev.preventDefault();
      try {
        var ch = { Status: "Inactive" }, r = $("DeactivationReason").value, n = $("DeactivationNote").value;
        if (r) ch.DeactivationReason = r; if (n) ch.DeactivationNote = n;
        tools.np_update_customer($("CustomerId").value, ch);
        notice("Customer de-activated.", "ok");
        setTimeout(function () { go("S-03", { CustomerId: $("CustomerId").value }); }, 600);
      } catch (e) { $("deactivateError").textContent = e.message; notice(e.message, "err"); }
    };
  }

  function bindForm(main, params) {
    var $ = function (id) { return main.querySelector("#" + id); };
    var form = $("productForm"), save = $("saveProduct");
    var keys = Object.keys(SPEC.fields);
    function el(k) { return $(k); }
    function toggle() {
      Array.prototype.forEach.call(form.querySelectorAll("[data-visible-field]"), function (s) {
        s.hidden = el(s.getAttribute("data-visible-field")).value !== s.getAttribute("data-visible-equals");
      });
    }
    keys.forEach(function (k) { var e = el(k); if (e && k !== "ProductId") { e.value = ""; var er = form.querySelector('[data-error-for="' + k + '"]'); if (er) er.textContent = ""; } });
    $("ProductId").value = "";
    var editing = false;
    if (params.ProductId) {
      var rec = tools.np_get_product(params.ProductId);
      if (rec) { editing = true; keys.forEach(function (k) { var e = el(k); if (e && rec[k] != null) e.value = rec[k]; }); }
      else notice("Product not found.", "err");
    }
    $("BillingType").onchange = toggle; toggle();
    $("closeProduct").onclick = function () { go("S-01", {}); };
    $("cancelProduct").onclick = function () { go("S-01", {}); };
    form.onsubmit = function (ev) {
      ev.preventDefault();
      var ok = true, data = {};
      keys.forEach(function (k) {
        var e = el(k); if (!e || k === "ProductId") return;
        var sec = e.closest("[data-visible-field]");
        var er = form.querySelector('[data-error-for="' + k + '"]'); if (er) er.textContent = "";
        if (sec && sec.hidden) return;
        var v = e.value, f = SPEC.fields[k];
        if (f.required && v === "") { if (er) er.textContent = f.name + " is required."; ok = false; return; }
        if (f.type === "number" && v !== "") { if (isNaN(Number(v))) { if (er) er.textContent = f.name + " must be a number."; ok = false; return; } v = Number(v); }
        data[k] = v;
      });
      if (!ok) { notice("Fix the highlighted fields.", "err"); return; }
      try {
        if (editing) tools.np_update_product($("ProductId").value || params.ProductId, data);
        else tools.np_create_product(data);
        notice("Product saved.", "ok");
        setTimeout(function () { go("S-01", {}); }, 600);
      } catch (e) { notice(e.message, "err"); }
    };
  }

  // ---- Boot ----
  if (PREVIEW) {
    window.addEventListener("hashchange", route);
    var sw = $("screenSwitch"); if (sw) sw.onchange = function () { go(sw.value, {}); };
    route();
  } else {
    var m = document.querySelector("main[data-screen]");
    bind(m, parseQuery(location.search));
  }
})();
