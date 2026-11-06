/**
 * API integration tests - Node's built-in test runner, no extra dependencies.
 *
 *   npm run test:api
 *
 * Runs the real Express app in-process against a SEPARATE database named
 * `agency_portfolio_test` on the cluster from `mongoDbUrl` (override with
 * MONGODB_DB_NAME, which must end in "_test"). The suite refuses to run
 * against any other database and only ever clears that test database, so the
 * real website content is never touched.
 *
 * Requests carry the internal key plus a varying `x-client-ip` (documentation
 * IP range), exactly like the Next.js proxy, so per-visitor rate limits can be
 * tested deliberately without tests throttling each other.
 */
import assert from "node:assert/strict";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { after, before, describe, test } from "node:test";

// Environment must be prepared before the app (and its config) is loaded.
process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "agency_portfolio_test";
process.env.INTERNAL_API_KEY = `test-${randomBytes(16).toString("hex")}`;
process.env.CLIENT_ORIGINS = "http://localhost:3000";
process.env.NODE_ENV = "test";
// Never send real e-mail from tests
process.env.SMTP_HOST = "";
process.env.DATA_ENCRYPTION_KEY = `test-${randomBytes(16).toString("hex")}`;

const require = createRequire(import.meta.url);
const mongoose = require("mongoose");
const app = require("../dist/app.js").default;
const { connectDatabase, disconnectDatabase } = require("../dist/app/config/db.js");
const { AdminServices } = require("../dist/app/modules/Admin/admin.service.js");

const ORIGIN = "http://localhost:3000";
const ADMIN_EMAIL = "owner@example.test";
const ADMIN_PASSWORD = `Test-${randomBytes(9).toString("hex")}-9`;
const LOCK_EMAIL = "locked@example.test";
const LOCK_PASSWORD = `Lock-${randomBytes(9).toString("hex")}-7`;

let server;
let BASE;
let ipCounter = 0;
// 198.51.100.0/24 and 203.0.113.0/24 are reserved for documentation
const nextIp = () => {
  ipCounter += 1;
  return `198.51.${100 + Math.floor(ipCounter / 250)}.${(ipCounter % 250) + 1}`;
};

const request = async (method, path, { body, cookie, origin = ORIGIN, ip, headers = {} } = {}) => {
  const response = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...(origin ? { origin } : {}),
      ...(cookie ? { cookie } : {}),
      "x-internal-key": process.env.INTERNAL_API_KEY,
      "x-client-ip": ip || nextIp(),
      ...headers,
    },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: response.status, headers: response.headers, text, json };
};

const cookieFrom = (response) =>
  response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");

const login = async (email = ADMIN_EMAIL, password = ADMIN_PASSWORD) => {
  const response = await request("POST", "/admin/auth/login", { body: { email, password } });
  assert.equal(response.status, 200, response.text);
  return cookieFrom(response);
};

// No stack traces or internal error objects in any response
const assertNoLeak = (response) => {
  assert.ok(!/"stack"|\bat .+\.(js|ts):\d+/.test(response.text), `internal details leaked: ${response.text.slice(0, 300)}`);
};

before(async () => {
  await connectDatabase();
  const dbName = mongoose.connection.db.databaseName;
  assert.match(dbName, /_test$/, `Refusing to run against database "${dbName}" - tests only use a *_test database`);
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) await collection.deleteMany({});

  await AdminServices.createAdmin({ name: "Test Owner", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "owner" });
  await AdminServices.createAdmin({ name: "Lock Test", email: LOCK_EMAIL, password: LOCK_PASSWORD, role: "editor" });

  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  BASE = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
  await disconnectDatabase();
});

describe("public API", () => {
  test("settings expose only public fields", async () => {
    const response = await request("GET", "/public/settings");
    assert.equal(response.status, 200);
    assert.ok(response.json.data.brand?.name);
    assert.deepEqual(Object.keys(response.json.data.inquiry), ["budgetRanges"]);
    assert.ok(!response.text.includes("notificationEmail"));
  });

  test("unknown project slug is a 404 without internals", async () => {
    const response = await request("GET", "/public/projects/does-not-exist");
    assert.equal(response.status, 404);
    assert.equal(response.json.success, false);
    assertNoLeak(response);
  });

  test("unknown API route is a 404", async () => {
    const response = await request("GET", "/public/nothing-here");
    assert.equal(response.status, 404);
  });

  test("malformed JSON is rejected cleanly", async () => {
    const response = await request("POST", "/public/inquiries", { body: "{not json" });
    assert.equal(response.status, 400);
    assertNoLeak(response);
  });

  test("query operators are not interpreted (NoSQL injection)", async () => {
    for (const query of ["category[$ne]=x", "type[$ne]=website", "searchTerm[$regex]=.*", "sort[$where]=1"]) {
      const response = await request("GET", `/public/projects?${query}`);
      assert.ok([200, 400].includes(response.status), `${query} -> ${response.status}`);
      assertNoLeak(response);
    }
  });
});

describe("admin authentication", () => {
  test("every admin area requires a session", async () => {
    const endpoints = [
      ["GET", "/admin/auth/me"],
      ["GET", "/admin/dashboard"],
      ["GET", "/admin/projects"],
      ["POST", "/admin/projects"],
      ["GET", "/admin/categories"],
      ["GET", "/admin/services"],
      ["GET", "/admin/profile"],
      ["GET", "/admin/settings"],
      ["PATCH", "/admin/settings"],
      ["GET", "/admin/media"],
      ["GET", "/admin/inquiries"],
      ["POST", "/admin/auth/logout-all"],
    ];
    for (const [method, path] of endpoints) {
      const response = await request(method, path, { body: method === "GET" ? undefined : {} });
      assert.equal(response.status, 401, `${method} ${path} -> ${response.status}`);
    }
  });

  test("forged or garbage session cookies are rejected", async () => {
    const response = await request("GET", "/admin/auth/me", { cookie: "shds_session=eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0." });
    assert.equal(response.status, 401);
  });

  test("wrong password and unknown email get the same answer", async () => {
    const wrong = await request("POST", "/admin/auth/login", { body: { email: ADMIN_EMAIL, password: "not-the-password-1" } });
    const unknown = await request("POST", "/admin/auth/login", { body: { email: "nobody@example.test", password: "not-the-password-1" } });
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, 401);
    assert.equal(wrong.json.message, unknown.json.message);
  });

  test("operator objects in the login body are rejected", async () => {
    const response = await request("POST", "/admin/auth/login", { body: { email: { $ne: null }, password: { $ne: null } } });
    assert.equal(response.status, 400);
    assert.ok(!response.headers.getSetCookie().length);
  });

  test("requests from a foreign origin are refused", async () => {
    const response = await request("POST", "/admin/auth/login", {
      origin: "https://attacker.example",
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    assert.equal(response.status, 403);
  });

  test("successful sign-in sets a hardened cookie and returns no secrets", async () => {
    const response = await request("POST", "/admin/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    assert.equal(response.status, 200);
    const [cookie] = response.headers.getSetCookie();
    assert.match(cookie, /^shds_session=/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Strict/i);
    assert.deepEqual(Object.keys(response.json.data).sort(), ["email", "id", "lastLoginAt", "name", "role"]);
    assert.ok(!/password|hash|tokenVersion|failedLogin|lockUntil/i.test(response.text));
  });

  test("the account locks after repeated failures, even with the right password", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await request("POST", "/admin/auth/login", { body: { email: LOCK_EMAIL, password: `wrong-guess-${attempt}x` } });
      assert.equal(response.status, 401);
    }
    const locked = await request("POST", "/admin/auth/login", { body: { email: LOCK_EMAIL, password: LOCK_PASSWORD } });
    assert.equal(locked.status, 429);
    assert.ok(!locked.headers.getSetCookie().length);
  });

  test("sign-in attempts are rate limited per visitor IP", async () => {
    const ip = "203.0.113.10";
    const statuses = [];
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const response = await request("POST", "/admin/auth/login", { ip, body: { email: "nobody@example.test", password: "irrelevant-123" } });
      statuses.push(response.status);
    }
    assert.deepEqual(statuses.slice(0, 10), Array(10).fill(401));
    assert.equal(statuses[10], 429);
  });

  test("'sign out everywhere' revokes every session", async () => {
    const first = await login();
    const second = await login();
    assert.equal((await request("GET", "/admin/auth/me", { cookie: second })).status, 200);
    assert.equal((await request("POST", "/admin/auth/logout-all", { cookie: first })).status, 200);
    assert.equal((await request("GET", "/admin/auth/me", { cookie: first })).status, 401);
    assert.equal((await request("GET", "/admin/auth/me", { cookie: second })).status, 401);
  });

  test("changing the password keeps this session and ends the others", async () => {
    const current = await login();
    const other = await login();
    const newPassword = `New-${randomBytes(9).toString("hex")}-5`;

    const weak = await request("PATCH", "/admin/auth/password", { cookie: current, body: { currentPassword: ADMIN_PASSWORD, newPassword: "short1" } });
    assert.equal(weak.status, 400);

    const changed = await request("PATCH", "/admin/auth/password", { cookie: current, body: { currentPassword: ADMIN_PASSWORD, newPassword } });
    assert.equal(changed.status, 200, changed.text);
    const renewed = cookieFrom(changed);
    assert.equal((await request("GET", "/admin/auth/me", { cookie: renewed })).status, 200);
    assert.equal((await request("GET", "/admin/auth/me", { cookie: other })).status, 401);
    assert.equal((await request("POST", "/admin/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })).status, 401);

    // restore for the remaining tests
    const restored = await request("PATCH", "/admin/auth/password", { cookie: renewed, body: { currentPassword: newPassword, newPassword: ADMIN_PASSWORD } });
    assert.equal(restored.status, 200, restored.text);
  });
});

describe("content management and publishing", () => {
  let cookie;
  let categoryId;
  let projectId;
  const SECRET_NOTE = `internal-note-${randomBytes(6).toString("hex")}`;
  const DEMO_PASSWORD = `demo-pass-${randomBytes(6).toString("hex")}`;

  before(async () => {
    cookie = await login();
  });

  test("categories can be created", async () => {
    const response = await request("POST", "/admin/categories", {
      cookie,
      body: { name: "Test Restaurants", slug: "test-restaurants", status: "published" },
    });
    assert.equal(response.status, 201, response.text);
    categoryId = response.json.data._id;
  });

  test("invalid projects are rejected with field errors", async () => {
    const response = await request("POST", "/admin/projects", { cookie, body: { title: "X", projectType: "spaceship" } });
    assert.equal(response.status, 400);
    const paths = response.json.errorSources.map((source) => String(source.path));
    assert.ok(paths.includes("title") && paths.includes("projectType"), JSON.stringify(paths));
  });

  test("embeds must use https", async () => {
    const response = await request("POST", "/admin/projects", {
      cookie,
      body: {
        title: "Embed test",
        projectType: "website",
        contentBlocks: [{ type: "embed", data: { title: "Demo video", url: "http://video.example/embed/1" } }],
      },
    });
    assert.equal(response.status, 400);
  });

  test("a draft project with private fields is created; protected fields cannot be mass-assigned", async () => {
    const response = await request("POST", "/admin/projects", {
      cookie,
      body: {
        title: "Test Bistro",
        slug: "test-bistro",
        projectType: "website",
        summary: "A concept website used by the automated tests.",
        categories: [categoryId],
        publishStatus: "draft",
        internalNotes: SECRET_NOTE,
        demoAccess: { enabled: true, username: "demo@example.test", password: DEMO_PASSWORD, instructions: "Use the demo account." },
        // not accepted from clients:
        previousSlugs: ["hijacked-slug"],
        createdAt: "2000-01-01T00:00:00.000Z",
      },
    });
    assert.equal(response.status, 201, response.text);
    projectId = response.json.data._id;

    const stored = await request("GET", `/admin/projects/${projectId}`, { cookie });
    assert.equal(stored.json.data.internalNotes, SECRET_NOTE);
    assert.deepEqual(stored.json.data.previousSlugs || [], []);
    assert.notEqual(new Date(stored.json.data.createdAt).getFullYear(), 2000);
  });

  test("drafts are invisible publicly", async () => {
    assert.equal((await request("GET", "/public/projects/test-bistro")).status, 404);
    const list = await request("GET", "/public/projects");
    assert.ok(!list.text.includes("test-bistro"));
  });

  test("published projects never expose internal notes", async () => {
    const published = await request("PATCH", `/admin/projects/${projectId}`, { cookie, body: { publishStatus: "published" } });
    assert.equal(published.status, 200, published.text);

    const response = await request("GET", "/public/projects/test-bistro");
    assert.equal(response.status, 200);
    assert.equal(response.json.data.title, "Test Bistro");
    assert.ok(!response.text.includes(SECRET_NOTE));
    assert.ok(!response.text.includes("internalNotes"));
    // the demo panel is enabled, so its (intentionally public) credentials are shown
    assert.equal(response.json.data.demoAccess.username, "demo@example.test");

    const list = await request("GET", "/public/projects");
    assert.ok(list.json.data.result.some((project) => project.slug === "test-bistro"));
  });

  test("disabled demo credentials are never public", async () => {
    const response = await request("PATCH", `/admin/projects/${projectId}`, {
      cookie,
      body: { demoAccess: { enabled: false, username: "demo@example.test", password: DEMO_PASSWORD } },
    });
    assert.equal(response.status, 200, response.text);
    const detail = await request("GET", "/public/projects/test-bistro");
    assert.equal(detail.json.data.demoAccess, undefined);
    assert.ok(!detail.text.includes(DEMO_PASSWORD));
    const list = await request("GET", "/public/projects");
    assert.ok(!list.text.includes(DEMO_PASSWORD));
  });

  test("changing the slug keeps the old URL working", async () => {
    const response = await request("PATCH", `/admin/projects/${projectId}`, { cookie, body: { slug: "test-bistro-renamed" } });
    assert.equal(response.status, 200, response.text);
    const old = await request("GET", "/public/projects/test-bistro");
    assert.equal(old.status, 200);
    assert.deepEqual(old.json.data, { redirectSlug: "test-bistro-renamed" });
  });

  test("unlisted projects are reachable by link but not listed", async () => {
    await request("PATCH", `/admin/projects/${projectId}`, { cookie, body: { visibility: "unlisted" } });
    assert.equal((await request("GET", "/public/projects/test-bistro-renamed")).status, 200);
    const list = await request("GET", "/public/projects");
    assert.ok(!list.text.includes("test-bistro-renamed"));
    await request("PATCH", `/admin/projects/${projectId}`, { cookie, body: { visibility: "listed" } });
  });

  test("archived projects disappear publicly", async () => {
    await request("PATCH", `/admin/projects/${projectId}`, { cookie, body: { publishStatus: "archived" } });
    assert.equal((await request("GET", "/public/projects/test-bistro-renamed")).status, 404);
  });

  test("deleted projects are gone", async () => {
    const response = await request("DELETE", `/admin/projects/${projectId}`, { cookie });
    assert.equal(response.status, 200, response.text);
    assert.equal((await request("GET", `/admin/projects/${projectId}`, { cookie })).status, 404);
    assert.equal((await request("GET", "/public/projects/test-bistro-renamed")).status, 404);
  });

  test("settings can be saved section by section", async () => {
    const before = await request("GET", "/admin/settings", { cookie });
    const headline = before.json.data.home.heroHeadline;

    const saved = await request("PATCH", "/admin/settings", {
      cookie,
      body: { contact: { email: "studio@example.test" }, inquiry: { notificationEmail: "private-inbox@example.test" } },
    });
    assert.equal(saved.status, 200, saved.text);
    assert.equal(saved.json.data.home.heroHeadline, headline);

    const publicSettings = await request("GET", "/public/settings");
    assert.equal(publicSettings.json.data.contact.email, "studio@example.test");
    assert.ok(!publicSettings.text.includes("private-inbox@example.test"));

    const invalid = await request("PATCH", "/admin/settings", { cookie, body: { theme: { accent: "red; background:url(x)" } } });
    assert.equal(invalid.status, 400);
  });

  test("the legal pages' 'last updated' date only moves when their text changes", async () => {
    const first = await request("PATCH", "/admin/settings", { cookie, body: { legal: { terms: "## Terms\n\nVersion one." } } });
    assert.equal(first.status, 200, first.text);
    const updatedAt = first.json.data.legal.updatedAt;
    assert.ok(updatedAt);

    // Saving the same text (as the settings screen does on every save) keeps the date
    const same = await request("PATCH", "/admin/settings", {
      cookie,
      body: { legal: { terms: "## Terms\n\nVersion one." }, announcement: { enabled: false } },
    });
    assert.equal(same.json.data.legal.updatedAt, updatedAt);

    const changed = await request("PATCH", "/admin/settings", { cookie, body: { legal: { terms: "## Terms\n\nVersion two." } } });
    assert.notEqual(changed.json.data.legal.updatedAt, updatedAt);
  });
});

describe("inquiries", () => {
  let cookie;
  const valid = (overrides = {}) => ({
    name: "Test Visitor",
    email: "visitor@example.test",
    message: "We would like a new website for our restaurant with online reservations.",
    preferredContact: "email",
    consent: true,
    fillMs: 15000,
    ...overrides,
  });
  const storedCount = async (email) => {
    const response = await request("GET", `/admin/inquiries?searchTerm=${encodeURIComponent(email)}`, { cookie });
    assert.equal(response.status, 200, response.text);
    return response.json.data.result.filter((item) => item.email === email).length;
  };

  before(async () => {
    cookie = await login();
  });

  test("a valid inquiry is stored and the reply makes no e-mail claims", async () => {
    const response = await request("POST", "/public/inquiries", { body: valid() });
    assert.equal(response.status, 201, response.text);
    assert.ok(!/e-?mail(ed)? (was )?sent/i.test(response.json.message));
    assert.equal(await storedCount("visitor@example.test"), 1);

    const list = await request("GET", "/admin/inquiries", { cookie });
    assert.ok(!list.text.includes("ipHash"));
  });

  test("consent is required", async () => {
    const response = await request("POST", "/public/inquiries", { body: valid({ consent: false, email: "noconsent@example.test" }) });
    assert.equal(response.status, 400);
  });

  test("honeypot and too-fast submissions look successful but are not stored", async () => {
    const honeypot = await request("POST", "/public/inquiries", { body: valid({ email: "bot1@example.test", homepage: "http://spam.example" }) });
    const tooFast = await request("POST", "/public/inquiries", { body: valid({ email: "bot2@example.test", fillMs: 400 }) });
    assert.equal(honeypot.status, 201);
    assert.equal(tooFast.status, 201);
    assert.equal(await storedCount("bot1@example.test"), 0);
    assert.equal(await storedCount("bot2@example.test"), 0);
  });

  test("one e-mail address can send at most 3 inquiries a day", async () => {
    const email = "eager@example.test";
    const statuses = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      statuses.push((await request("POST", "/public/inquiries", { body: valid({ email }) })).status);
    }
    assert.deepEqual(statuses, [201, 201, 201, 429]);
  });

  test("one visitor IP can send at most 5 inquiries an hour", async () => {
    const ip = "203.0.113.20";
    const statuses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      statuses.push((await request("POST", "/public/inquiries", { ip, body: valid({ email: `ip-${attempt}@example.test` }) })).status);
    }
    assert.deepEqual(statuses, [201, 201, 201, 201, 201, 429]);
  });
});

describe("client projects (private tracker)", () => {
  const isoDay = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
  const project = () => ({
    name: "Tracker Test Project",
    client: { name: "Test Client", email: "client@example.test" },
    links: [{ kind: "live", url: "https://example.test" }],
    accounts: [{ provider: "Vercel", login: "deploy@example.test" }],
    renewals: [
      { title: "Hosting fee", kind: "hosting", direction: "receivable", amount: 20, currency: "USD", cycle: "monthly", paidUntil: isoDay(5), remindDaysBefore: 14 },
      { title: "Domain", kind: "domain", direction: "payable", cycle: "yearly", paidUntil: isoDay(-2), remindDaysBefore: 30 },
      { title: "Server", kind: "server", cycle: "monthly", active: false },
    ],
    checklist: [{ text: "Protect main branch" }],
    ledger: [{ month: "2026-10", exchangeRate: 131, carriedOver: 9282, income: [{ kind: "fund", amount: 106217 }], costs: [{ label: "AWS", category: "storage", amount: 449, usage: "1,802 GB" }] }],
  });

  test("every client endpoint requires a session", async () => {
    for (const [method, path] of [["GET", "/admin/clients"], ["POST", "/admin/clients"], ["GET", "/admin/clients/000000000000000000000000"]]) {
      const response = await request(method, path, { body: method === "POST" ? project() : undefined });
      assert.equal(response.status, 401, `${method} ${path}`);
    }
  });

  test("create, alert, record payment, save without changes", async () => {
    const cookie = await login();
    const created = await request("POST", "/admin/clients", { cookie, body: { ...project(), injected: "x", renewals: project().renewals } });
    assert.equal(created.status, 201, created.text);
    const doc = created.json.data;
    assert.equal(doc.injected, undefined);
    assert.equal(doc.renewals.length, 3);
    assert.equal(doc.ledger[0].costs[0].usage, "1,802 GB");
    assert.equal(doc.ledger[0].income[0].currency, "BDT");

    const dashboard = await request("GET", "/admin/dashboard", { cookie });
    const titles = dashboard.json.data.renewals.items.filter((item) => item.projectId === doc._id).map((item) => item.title);
    assert.deepEqual(titles, ["Domain", "Hosting fee"], "overdue first, inactive excluded");
    assert.ok(dashboard.json.data.renewals.overdue >= 1);

    const muted = await request("PATCH", `/admin/clients/${doc._id}`, { cookie, body: { ...doc, muteAlerts: true } });
    assert.equal(muted.status, 200, muted.text);
    const quiet = await request("GET", "/admin/dashboard", { cookie });
    assert.ok(!quiet.json.data.renewals.items.some((item) => item.projectId === doc._id), "muted projects raise no alerts");
    await request("PATCH", `/admin/clients/${doc._id}`, { cookie, body: { ...doc, muteAlerts: false } });

    const hosting = doc.renewals.find((item) => item.title === "Hosting fee");
    const paid = await request("POST", `/admin/clients/${doc._id}/renewals/${hosting._id}/payments`, {
      cookie,
      body: { paidOn: isoDay(0), cycles: 6, exchangeRate: 126 },
    });
    assert.equal(paid.status, 200, paid.text);
    const after = paid.json.data.renewals.find((item) => item._id === hosting._id);
    const expected = new Date(hosting.paidUntil);
    expected.setUTCMonth(expected.getUTCMonth() + 6);
    assert.equal(after.paidUntil.slice(0, 10), expected.toISOString().slice(0, 10), "due date moves 6 months from the old due date");
    assert.equal(after.payments.length, 1);
    assert.equal(after.payments[0].amount, 120);

    const saved = await request("PATCH", `/admin/clients/${doc._id}`, { cookie, body: paid.json.data });
    assert.equal(saved.status, 200, saved.text);
    const savedHosting = saved.json.data.renewals.find((item) => item._id === hosting._id);
    assert.equal(savedHosting.payments[0]._id, after.payments[0]._id, "ids survive a full save");

    const removed = await request("DELETE", `/admin/clients/${doc._id}`, { cookie });
    assert.equal(removed.status, 200);
  });

  test("env values are encrypted at rest and never listed", async () => {
    const cookie = await login();
    const secret = "mongodb+srv://user:pa55@example.test/db";
    const created = await request("POST", "/admin/clients", {
      cookie,
      body: { ...project(), name: "Env Test", envSets: [{ label: "Server", content: `# db\nMONGO_URL=${secret}\n` }] },
    });
    assert.equal(created.status, 201, created.text);
    assert.ok(created.json.data.envSets[0].content.includes(secret));
    const raw = await mongoose.connection.db.collection("clientprojects").findOne({ name: "Env Test" });
    assert.match(raw.envSets[0].content, /^enc:v1:/);
    assert.ok(!JSON.stringify(raw).includes("pa55"), "plain value stored");
    const list = await request("GET", "/admin/clients", { cookie });
    assert.ok(!list.text.includes("pa55") && !list.text.includes("enc:v1"), "list leaks env");
    const saved = await request("PATCH", `/admin/clients/${created.json.data._id}`, { cookie, body: created.json.data });
    assert.equal(saved.json.data.envSets[0].content, created.json.data.envSets[0].content, "survives a full save");
    assert.equal(saved.json.data.envSets[0]._id, created.json.data.envSets[0]._id);
    await request("DELETE", `/admin/clients/${created.json.data._id}`, { cookie });
  });

  test("invalid links and dates are rejected", async () => {
    const cookie = await login();
    const bad = await request("POST", "/admin/clients", { cookie, body: { ...project(), links: [{ kind: "live", url: "javascript:alert(1)" }] } });
    assert.equal(bad.status, 400);
    const badDate = await request("POST", "/admin/clients", { cookie, body: { ...project(), startDate: "not-a-date" } });
    assert.equal(badDate.status, 400);
    const month = project().ledger[0];
    const twice = await request("POST", "/admin/clients", { cookie, body: { ...project(), ledger: [month, month] } });
    assert.equal(twice.status, 400, "a month can only appear once");
    assertNoLeak(badDate);
  });

  test("nothing from the tracker appears in public responses", async () => {
    for (const path of ["/public/settings", "/public/home", "/public/sitemap", "/public/projects"]) {
      const response = await request("GET", path);
      assert.ok(!response.text.includes("Tracker Test Project") && !response.text.includes("client@example.test"), path);
    }
  });
});
