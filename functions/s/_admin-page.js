/**
 * 管理控制台页面（单个 HTML，不引任何外部依赖）
 *
 * 口令只存在浏览器 localStorage，每次请求带 Authorization: Bearer <token>；
 * 页面本身不含任何秘密，打开也只是看到登录框。
 */

const escapeHtml = (s) =>
	String(s ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

export function renderAdminPage(env = {}, basePath = "") {
	const siteName = escapeHtml(env.SITE_NAME || "短链服务");
	const homeUrl = escapeHtml(env.HOME_URL || "https://blog.xieea.top");
	// basePath 形如 "/s"：接口、短链都要带上前缀（独立 Worker 版传空串）
	const prefix = String(basePath || "").replace(/\/+$/, "");

	// 注意：下面 <script> 里一律用字符串拼接，不用模板字符串，
	// 否则会和本文件的模板字符串互相打架。
	return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="data:,">
<title>${siteName} · 控制台</title>
<style>
  :root {
    color-scheme: light dark;
    --accent: oklch(0.70 0.14 250);
    --accent-weak: oklch(0.95 0.03 250);
    --bg: #f7f7fa;
    --card: #ffffff;
    --line: #e6e6ee;
    --text: #1c1c22;
    --muted: #6b6b7b;
    --danger: #d64545;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --accent: oklch(0.75 0.14 250);
      --accent-weak: oklch(0.30 0.05 250);
      --bg: #16161c; --card: #1f1f27; --line: #2c2c38;
      --text: #e8e8ee; --muted: #9a9aab; --danger: #ff6b6b;
    }
  }
  * { box-sizing: border-box }
  body {
    margin: 0; padding: 2rem 1.25rem 4rem;
    font: 15px/1.6 system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    background: var(--bg); color: var(--text);
  }
  .wrap { max-width: 62rem; margin: 0 auto }
  h1 { font-size: 1.35rem; margin: 0 0 .25rem; letter-spacing: .01em }
  .sub { color: var(--muted); font-size: .875rem; margin: 0 0 1.5rem }
  .card {
    background: var(--card); border: 1px solid var(--line); border-radius: 1rem;
    padding: 1.25rem 1.35rem; margin-bottom: 1.25rem;
    box-shadow: 0 6px 24px rgb(0 0 0 / .04);
  }
  label { display: block; font-size: .8rem; color: var(--muted); margin-bottom: .3rem }
  input {
    width: 100%; padding: .6rem .75rem; border-radius: .6rem;
    border: 1px solid var(--line); background: transparent; color: var(--text);
    font: inherit; outline: none;
  }
  input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-weak) }
  .row { display: grid; gap: .75rem; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: end }
  @media (max-width: 780px) { .row { grid-template-columns: 1fr } }
  button {
    font: inherit; font-weight: 600; cursor: pointer;
    padding: .6rem 1rem; border-radius: .6rem; border: 1px solid transparent;
    background: var(--accent); color: #fff; transition: filter .15s;
  }
  button:hover { filter: brightness(1.06) }
  button:disabled { opacity: .55; cursor: not-allowed }
  button.ghost { background: transparent; color: var(--accent); border-color: var(--line) }
  button.danger { background: transparent; color: var(--danger); border-color: var(--line) }
  table { width: 100%; border-collapse: collapse; font-size: .875rem }
  th, td { text-align: left; padding: .6rem .5rem; border-bottom: 1px solid var(--line); vertical-align: top }
  th { color: var(--muted); font-weight: 600; font-size: .78rem; text-transform: uppercase; letter-spacing: .04em }
  td.slug { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600 }
  td.slug a { color: var(--accent); text-decoration: none }
  td.slug a:hover { text-decoration: underline }
  .target { color: var(--muted); word-break: break-all; max-width: 26rem; display: block }
  .note { color: var(--muted); font-size: .78rem }
  .hits { font-variant-numeric: tabular-nums }
  .actions { display: flex; gap: .4rem; flex-wrap: wrap }
  .actions button { padding: .3rem .55rem; font-size: .78rem; font-weight: 500 }
  .empty, .hint { color: var(--muted); font-size: .875rem }
  .toast {
    position: fixed; left: 50%; bottom: 1.5rem; transform: translateX(-50%) translateY(140%);
    background: var(--card); border: 1px solid var(--line); border-radius: .75rem;
    padding: .6rem 1rem; font-size: .875rem; box-shadow: 0 10px 30px rgb(0 0 0 / .16);
    transition: transform .22s ease; z-index: 20;
  }
  .toast.show { transform: translateX(-50%) translateY(0) }
  .toast.err { border-color: var(--danger); color: var(--danger) }
  .hidden { display: none !important }
  /* 手机上表格太窄：藏掉「创建时间」这一列，先保住短码/目标/点击/操作 */
  @media (max-width: 640px) {
    th:nth-child(4), td:nth-child(4) { display: none }
    th, td { padding: .5rem .35rem }
    td.slug { font-size: .8rem }
    .target { max-width: none }
    .actions button { padding: .28rem .45rem; font-size: .74rem }
    body { padding: 1.25rem .75rem 3rem }
  }
  .topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap }
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <div>
      <h1>${siteName}</h1>
      <p class="sub">短链控制台 · <a href="${homeUrl}" style="color:var(--accent);text-decoration:none">回博客</a></p>
    </div>
    <button class="ghost hidden" id="logout">退出登录</button>
  </div>

  <!-- 登录 -->
  <div class="card" id="login-card">
    <label for="token">管理口令（ADMIN_TOKEN）</label>
    <div class="row" style="grid-template-columns: 1fr auto">
      <input id="token" type="password" autocomplete="current-password" placeholder="粘贴 wrangler secret 里设的口令">
      <button id="login">进入</button>
    </div>
    <p class="hint" style="margin:.75rem 0 0">口令只存在这台浏览器的 localStorage，不会写进页面。</p>
  </div>

  <!-- 主界面 -->
  <div id="app" class="hidden">
    <div class="card">
      <label>新建短链（短码留空自动生成 5 位）</label>
      <div class="row">
        <input id="url" type="url" placeholder="https://example.com/很长的地址...">
        <input id="slug" type="text" placeholder="短码（可空）">
        <input id="note" type="text" placeholder="备注（可空）">
        <input id="days" type="number" min="1" placeholder="有效天数（可空=永久）">
      </div>
      <div style="margin-top:.85rem; display:flex; gap:.5rem">
        <button id="create">生成短链</button>
      </div>
    </div>

    <div class="card">
      <div class="topbar" style="margin-bottom:.5rem">
        <label style="margin:0">已有短链 <span class="hint" id="count"></span></label>
        <div class="actions">
          <button class="ghost" id="refresh">刷新</button>
          <button class="ghost hidden" id="more">加载更多</button>
        </div>
      </div>
      <table>
        <thead><tr><th>短码</th><th>目标</th><th class="hits">点击</th><th>创建</th><th>操作</th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
      <p class="empty" id="empty">还没有短链，上面建一条试试。</p>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
(function () {
  var BASE = ${JSON.stringify(prefix)};
  var STORE_KEY = "shortlink-admin-token";
  var token = localStorage.getItem(STORE_KEY) || "";
  var cursor = null;
  var toastTimer = null;

  var $ = function (id) { return document.getElementById(id); };

  function toast(msg, isError) {
    var el = $("toast");
    el.textContent = msg;
    el.className = "toast show" + (isError ? " err" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = "toast"; }, 2600);
  }

  function api(path, options) {
    var opts = options || {};
    var headers = { "authorization": "Bearer " + token };
    if (opts.body) headers["content-type"] = "application/json";
    return fetch(BASE + "/api" + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var msg = data && data.error ? data.error : ("HTTP " + res.status);
          var err = new Error(msg);
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  function fmtDate(iso) {
    if (!iso) return "-";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function showUrl(value) {
    try {
      return decodeURI(value);
    } catch (e) {
      return value;
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    var ta = document.createElement("textarea");
    ta.value = value;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function renderRow(item) {
    var tr = document.createElement("tr");

    var tdSlug = document.createElement("td");
    tdSlug.className = "slug";
    var a = document.createElement("a");
    a.href = BASE + "/" + item.slug;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = item.slug;
    tdSlug.appendChild(a);
    tr.appendChild(tdSlug);

    var tdTarget = document.createElement("td");
    var span = document.createElement("span");
    span.className = "target";
    span.textContent = showUrl(item.url);
    tdTarget.appendChild(span);
    if (item.note) {
      var note = document.createElement("span");
      note.className = "note";
      note.textContent = item.note;
      tdTarget.appendChild(note);
    }
    tr.appendChild(tdTarget);

    var tdHits = document.createElement("td");
    tdHits.className = "hits";
    tdHits.textContent = String(item.hits || 0);
    tr.appendChild(tdHits);

    var tdDate = document.createElement("td");
    tdDate.textContent = fmtDate(item.createdAt) + (item.expiresAt ? " · 到期 " + fmtDate(item.expiresAt) : "");
    tr.appendChild(tdDate);

    var tdOps = document.createElement("td");
    var wrap = document.createElement("div");
    wrap.className = "actions";

    var btnCopy = document.createElement("button");
    btnCopy.className = "ghost";
    btnCopy.textContent = "复制";
    btnCopy.onclick = function () {
      copyText(item.shortUrl).then(function () { toast("已复制 " + item.shortUrl); },
        function () { toast("复制失败，手动选中吧", true); });
    };
    wrap.appendChild(btnCopy);

    var btnEdit = document.createElement("button");
    btnEdit.className = "ghost";
    btnEdit.textContent = "改目标";
    btnEdit.onclick = function () {
      var next = window.prompt("新的目标地址：", item.url);
      if (!next || next === item.url) return;
      api("/links/" + encodeURIComponent(item.slug), { method: "PATCH", body: { url: next } })
        .then(function () { toast("已更新"); load(true); })
        .catch(function (e) { toast(e.message, true); });
    };
    wrap.appendChild(btnEdit);

    var btnDel = document.createElement("button");
    btnDel.className = "danger";
    btnDel.textContent = "删除";
    btnDel.onclick = function () {
      if (!window.confirm("删除短链 " + item.slug + " ？删掉后原链接会 404。")) return;
      api("/links/" + encodeURIComponent(item.slug), { method: "DELETE" })
        .then(function () { toast("已删除"); load(true); })
        .catch(function (e) { toast(e.message, true); });
    };
    wrap.appendChild(btnDel);

    tdOps.appendChild(wrap);
    tr.appendChild(tdOps);
    return tr;
  }

  function load(reset) {
    if (reset) { cursor = null; $("rows").innerHTML = ""; }
    var query = "?limit=50" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : "");
    return api("/links" + query).then(function (data) {
      var rows = $("rows");
      (data.items || []).forEach(function (item) { rows.appendChild(renderRow(item)); });
      cursor = data.cursor;
      $("more").classList.toggle("hidden", !cursor);
      var total = rows.children.length;
      $("count").textContent = "（已加载 " + total + " 条" + (cursor ? "，还有更多" : "") + "）";
      $("empty").classList.toggle("hidden", total > 0);
      return data;
    });
  }

  function enterApp() {
    $("login-card").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("logout").classList.remove("hidden");
    load(true).catch(function (e) {
      if (e.status === 401 || e.status === 500) { leaveApp(); }
      toast(e.message, true);
    });
  }

  function leaveApp() {
    token = "";
    localStorage.removeItem(STORE_KEY);
    $("login-card").classList.remove("hidden");
    $("app").classList.add("hidden");
    $("logout").classList.add("hidden");
    $("rows").innerHTML = "";
    $("count").textContent = "";
  }

  function login() {
    var value = $("token").value.trim();
    if (!value) { toast("先填口令", true); return; }
    token = value;
    localStorage.setItem(STORE_KEY, token);
    enterApp();
  }

  $("login").onclick = login;
  $("token").onkeydown = function (e) { if (e.key === "Enter") login(); };
  $("logout").onclick = leaveApp;
  $("refresh").onclick = function () { load(true).then(function () { toast("已刷新"); }).catch(function (e) { toast(e.message, true); }); };
  $("more").onclick = function () { load(false).catch(function (e) { toast(e.message, true); }); };

  $("create").onclick = function () {
    var url = $("url").value.trim();
    if (!url) { toast("先填目标地址", true); return; }
    var body = { url: url };
    var slug = $("slug").value.trim();
    var note = $("note").value.trim();
    var days = $("days").value.trim();
    if (slug) body.slug = slug;
    if (note) body.note = note;
    if (days) body.expiresInDays = Number(days);

    var btn = $("create");
    btn.disabled = true;
    api("/links", { method: "POST", body: body })
      .then(function (item) {
        $("url").value = ""; $("slug").value = ""; $("note").value = ""; $("days").value = "";
        toast("已生成 " + item.shortUrl);
        copyText(item.shortUrl).catch(function () {});
        load(true);
      })
      .catch(function (e) { toast(e.message, true); })
      .finally(function () { btn.disabled = false; });
  };

  if (token) enterApp();
})();
</script>
</body>
</html>`;
}
