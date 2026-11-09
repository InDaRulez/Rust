import "./style.css";
import { invoke } from "@tauri-apps/api/core";
const native = !!window.__TAURI_INTERNALS__;
const demo = "https://media.w3.org/2010/05/bunny/movie.mp4";
const catalog = [
  [
    "bunny",
    "Big Buck Bunny",
    "2008",
    "Animation",
    "Un après-midi paisible prend une tournure inattendue pour un grand lapin au cœur tendre. Un court métrage de la Blender Foundation.",
    "photo-1470071459604-3b5ec3a7fe05",
  ],
  [
    "sintel",
    "Sintel",
    "2010",
    "Fantastique",
    "Une jeune voyageuse part à la recherche de son compagnon, un petit dragon.",
    "photo-1464822759023-fed622ff2c3b",
  ],
  [
    "steel",
    "Tears of Steel",
    "2012",
    "Science-fiction",
    "Dans un Amsterdam futuriste, une équipe tente de sauver le monde.",
    "photo-1519608487953-e999c86e7455",
  ],
  [
    "dream",
    "Elephants Dream",
    "2006",
    "Animation",
    "Deux personnages explorent une étrange machine et les limites de leur imagination.",
    "photo-1446776811953-b23d57bd21aa",
  ],
].map(([id, name, year, genre, description, photo], i) => ({
  id,
  name,
  year,
  genre,
  description,
  type: "movie",
  poster: `/images/${id}.jpg`,
  url: [
    demo,
    "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "https://download.blender.org/demo/movies/ToS/tears_of_steel_720p.mov",
    "/media/elephantsdream_teaser.mp4",
  ][i],
}));
let library = { favorites: [], progress: {}, addons: [] },
  page = "Découvrir",
  query = "",
  filter = "Tous",
  items = [...catalog],
  selected = null,
  saveQueue = Promise.resolve();
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const safe = (u) => {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:"
      ? parsed.href
          .replace(/'/g, "%27")
          .replace(/\(/g, "%28")
          .replace(/\)/g, "%29")
      : "";
  } catch {
    return "";
  }
};
const mediaUrl = (u) =>
  u === "/media/elephantsdream_teaser.mp4" ? u : safe(u);
const photo = (m) =>
  /^\/images\/(bunny|sintel|steel|dream)\.jpg$/.test(m.poster)
    ? m.poster
    : safe(m.poster) || catalog[0].poster;
const app = document.querySelector("#app");
function toast(message) {
  document.querySelector("#toast").textContent = message;
  document.querySelector("#toast").classList.add("show");
  setTimeout(
    () => document.querySelector("#toast")?.classList.remove("show"),
    4000,
  );
}
function save() {
  const snapshot = JSON.parse(JSON.stringify(library));
  saveQueue = saveQueue
    .catch(() => {})
    .then(() =>
      native
        ? invoke("save_library", { library: snapshot })
        : localStorage.setItem("astral-library", JSON.stringify(snapshot)),
    )
    .catch((e) => toast("Enregistrement impossible : " + e));
  return saveQueue;
}
function toggle(id) {
  library.favorites = library.favorites.includes(id)
    ? library.favorites.filter((x) => x !== id)
    : [...library.favorites, id];
  save();
  render();
}
function card(m) {
  return `<button class="card" data-open="${esc(m.id)}"><div class="poster" style="background-image:url('${esc(photo(m))}')"><span class="tag">${esc(m.genre || m.type)}</span><span class="play-circle">▶</span>${library.favorites.includes(m.id) ? '<span class="saved">♥</span>' : ""}<div class="poster-title">${esc(m.name)}</div></div><strong>${esc(m.name)}</strong><small>${esc(m.year || "Extension")} <span>•</span> ${esc(m.genre || m.type)}</small>${library.progress[m.id] ? '<div class="progress"><i></i></div>' : ""}</button>`;
}
function render() {
  const visible = items.filter(
    (m) =>
      (page !== "Bibliothèque" || library.favorites.includes(m.id)) &&
      (filter === "Tous" || m.genre === filter || m.type === filter) &&
      m.name.toLowerCase().includes(query.toLowerCase()),
  );
  app.innerHTML = `<aside><a class="brand" href="#">◈ <b>astral<span> ✦</span></b></a><div class="nav-caption">VOTRE ESPACE</div><nav>${[
    ["Découvrir", "◉"],
    ["Bibliothèque", "▤"],
    ["Extensions", "⊞"],
  ]
    .map(
      ([n, i]) =>
        `<button data-page="${n}" aria-label="${n}" class="${page === n ? "active" : ""}"><span>${i}</span>${n}</button>`,
    )
    .join(
      "",
    )}</nav><div class="sidebar-bottom"><span class="status-dot"></span>${native ? "Application native" : "Aperçu navigateur"}<small>Un univers à explorer.</small></div></aside><main><header><div class="breadcrumb">Votre cinéma, partout <span> / ${esc(page)}</span></div><label class="search">⌕ <input aria-label="Rechercher un titre" placeholder="Rechercher un film, une série…" value="${esc(query)}"></label><div class="avatar">A</div></header>${
    page === "Extensions"
      ? extensions()
      : `${page === "Découvrir" && !query ? `<section class="hero" style="background-image:linear-gradient(90deg,#101116 0%,#10111699 48%,#10111610),linear-gradient(0deg,#101116,transparent 55%),url('${catalog[0].poster}')"><div class="hero-copy"><div class="eyebrow">LA SÉLECTION ASTRAL <span>•</span> COURT MÉTRAGE</div><h1>Les grandes histoires<br>commencent ici.</h1><p>${catalog[0].description}</p><div class="hero-meta">2008 <span>•</span> Animation <span>•</span> 10 min <em>HD</em></div><div class="actions"><button class="primary" data-open="bunny">▶ &nbsp; Regarder</button><button class="secondary" id="hero-save">${library.favorites.includes("bunny") ? "✓ Ajouté" : "＋ Ma bibliothèque"}</button></div></div><div class="hero-index">01 <span>/ 04</span><i></i></div></section>` : ""}<section class="catalog"><div class="section-heading"><div><div class="eyebrow">${page === "Bibliothèque" ? "VOTRE COLLECTION" : "À DÉCOUVRIR"}</div><h2>${query ? "Résultats de recherche" : page === "Bibliothèque" ? "Ma bibliothèque" : "Une autre idée du cinéma"}</h2></div><span class="count">${visible.length} titres</span></div><div class="filters">${["Tous", "Animation", "Fantastique", "Science-fiction"].map((n) => `<button data-filter="${n}" class="${filter === n ? "chosen" : ""}">${n}</button>`).join("")}</div><div class="grid">${visible.map(card).join("") || '<div class="empty">Aucun titre ici pour le moment. Explorez le catalogue ou ajoutez une extension.</div>'}</div>${
          Object.keys(library.progress).length && page === "Découvrir"
            ? `<h2 class="resume-title">Reprendre l’exploration</h2><div class="resume">${items
                .filter((m) => library.progress[m.id] > 0)
                .map(
                  (m) =>
                    `<button data-open="${esc(m.id)}"><img src="${esc(photo(m))}" alt=""><div><strong>${esc(m.name)}</strong><small>Reprendre à ${Math.floor(library.progress[m.id] / 60)}:${String(Math.floor(library.progress[m.id] % 60)).padStart(2, "0")}</small></div><span>▶</span></button>`,
                )
                .join("")}</div>`
            : ""
        }<footer>Le cinéma en toute liberté.<span>ASTRAL · VERSION 0.1</span></footer></section>`
  }</main><div id="toast" role="status"></div><dialog id="detail"></dialog>`;
  app.querySelectorAll("[data-page]").forEach(
    (b) =>
      (b.onclick = () => {
        page = b.dataset.page;
        query = "";
        filter = "Tous";
        render();
      }),
  );
  app
    .querySelectorAll("[data-open]")
    .forEach((b) => (b.onclick = () => open(b.dataset.open)));
  app.querySelectorAll("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        render();
      }),
  );
  app.querySelector("input[aria-label]").oninput = (e) => {
    const pos = e.target.selectionStart;
    query = e.target.value;
    render();
    const input = app.querySelector("input[aria-label]");
    input.focus();
    input.setSelectionRange(pos, pos);
  };
  app
    .querySelector("#hero-save")
    ?.addEventListener("click", () => toggle("bunny"));
  app.querySelector("#addon-form")?.addEventListener("submit", install);
  app.querySelectorAll("[data-remove]").forEach(
    (b) =>
      (b.onclick = () => {
        library.addons = library.addons.filter((x) => x !== b.dataset.remove);
        items = items.filter((x) => x.addon !== b.dataset.remove);
        save();
        render();
      }),
  );
}
function extensions() {
  return `<section class="catalog extensions"><div class="eyebrow">ÉLARGISSEZ VOTRE UNIVERS</div><h1>Vos sources.<br>Votre cinéma.</h1><p>Connectez une extension compatible Stremio pour découvrir ses catalogues et ses sources vidéo HTTPS.</p><form id="addon-form"><label for="manifest">Adresse du manifeste</label><div><input id="manifest" type="url" required placeholder="https://exemple.org/manifest.json"><button class="primary" ${!native ? "disabled" : ""}>Ajouter</button></div></form>${!native ? '<p class="notice">L’installation d’extensions est disponible dans l’application Tauri. Cet aperçu utilise le catalogue de démonstration.</p>' : ""}<h2>Extensions installées</h2><div class="addon-row"><div class="addon-icon">◈</div><div><strong>Blender Open Movies</strong><p>4 courts métrages · Catalogue de démonstration</p></div><span class="pill">Inclus</span></div>${library.addons.map((u) => `<div class="addon-row"><div class="addon-icon">⊞</div><div><strong>${esc(new URL(u).hostname)}</strong><p>${esc(u)}</p></div><button data-remove="${esc(u)}" class="secondary">Retirer</button></div>`).join("")}</section>`;
}
async function addon(url, resource) {
  return invoke("addon_request", {
    manifestUrl: url,
    resource: resource ?? null,
  });
}
async function hydrate(url) {
  const m = await addon(url);
  if (!m.id || !m.name || !Array.isArray(m.catalogs))
    throw Error("Manifeste incompatible");
  for (const c of m.catalogs.slice(0, 6)) {
    if (!["movie", "series"].includes(c.type)) continue;
    const data = await addon(
      url,
      `catalog/${encodeURIComponent(c.type)}/${encodeURIComponent(c.id)}.json`,
    );
    for (const t of (data.metas || []).slice(0, 100)) {
      if (!t.id || !t.name) continue;
      const id = url + "|" + t.id;
      if (!items.some((x) => x.id === id))
        items.push({
          ...t,
          id,
          remoteId: t.id,
          addon: url,
          year: t.releaseInfo,
          genre: t.type,
        });
    }
  }
}
async function install(e) {
  e.preventDefault();
  const u = document.querySelector("#manifest").value.trim();
  const button = e.submitter;
  button.disabled = true;
  try {
    await hydrate(u);
    if (!library.addons.includes(u)) library.addons.push(u);
    await save();
    render();
    toast("Extension ajoutée. Son catalogue est disponible.");
  } catch (e) {
    toast("Extension indisponible : " + e);
  } finally {
    button.disabled = false;
  }
}
async function open(id) {
  selected = items.find((m) => m.id === id);
  if (!selected) return;
  const m = selected,
    d = document.querySelector("#detail");
  d.innerHTML = `<button class="close" aria-label="Fermer">×</button><div class="detail-art" style="background-image:url('${esc(photo(m))}')"></div><div class="detail-content"><div class="eyebrow">${esc(m.genre || m.type)} · ${esc(m.year || "")}</div><h2>${esc(m.name)}</h2><p>${esc(m.description || "Sélectionnez une source pour lancer la lecture.")}</p><div class="actions"><button class="primary" id="watch">▶ ${library.progress[m.id] ? "Reprendre" : "Lire le film"}</button><button class="secondary" id="favorite">${library.favorites.includes(id) ? "♥ Retirer" : "＋ Bibliothèque"}</button></div><div id="sources"></div><div id="player"></div><p class="notice">${m.addon ? "La compatibilité dépend du format et des codecs du flux." : ["sintel", "dream"].includes(m.id) ? "Bande-annonce de démonstration · Blender Foundation" : "Film de démonstration · Blender Foundation"}</p></div>`;
  d.showModal();
  d.querySelector(".close").onclick = () => {
    d.querySelector("video")?.pause();
    d.close();
    render();
  };
  d.oncancel = () => {
    d.querySelector("video")?.pause();
    setTimeout(render, 0);
  };
  d.querySelector("#favorite").onclick = () => {
    library.favorites = library.favorites.includes(id)
      ? library.favorites.filter((x) => x !== id)
      : [...library.favorites, id];
    save();
    d.querySelector("#favorite").textContent = library.favorites.includes(id)
      ? "♥ Retirer"
      : "＋ Bibliothèque";
  };
  d.querySelector("#watch").onclick = async () => {
    if (m.url) return play(m.url, m);
    const box = d.querySelector("#sources");
    box.textContent = "Recherche des sources…";
    try {
      const data = await addon(
        m.addon,
        `stream/${encodeURIComponent(m.type)}/${encodeURIComponent(m.remoteId)}.json`,
      );
      const streams = (data.streams || []).filter((s) => safe(s.url));
      box.innerHTML =
        streams
          .map(
            (s, i) =>
              `<button class="source secondary" data-stream="${i}">${esc(s.name || s.title || "Source " + (i + 1))}</button>`,
          )
          .join("") ||
        "Aucune source HTTPS directement lisible. Les torrents, DRM et liens externes ne sont pas pris en charge.";
      box
        .querySelectorAll("[data-stream]")
        .forEach(
          (b) =>
            (b.onclick = () => play(streams[Number(b.dataset.stream)].url, m)),
        );
    } catch (e) {
      box.textContent = "Sources indisponibles : " + e;
    }
  };
}
function play(url, m) {
  const box = document.querySelector("#player");
  box.innerHTML = `<video controls playsinline autoplay src="${esc(mediaUrl(url))}"></video><p id="playback-error" role="status"></p>`;
  const v = box.querySelector("video");
  v.onloadedmetadata = () => {
    if (library.progress[m.id] < v.duration - 5)
      v.currentTime = library.progress[m.id] || 0;
  };
  let last = 0;
  v.ontimeupdate = () => {
    if (Math.abs(v.currentTime - last) > 5) {
      last = v.currentTime;
      library.progress[m.id] = v.currentTime;
      save();
    }
  };
  v.onpause = () => {
    if (!v.ended) {
      library.progress[m.id] = v.currentTime;
      save();
    }
  };
  v.onended = () => {
    delete library.progress[m.id];
    save();
  };
  v.onerror = () =>
    (box.querySelector("#playback-error").textContent =
      "Lecture impossible. Vérifiez votre connexion ou choisissez un flux compatible avec cet appareil.");
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
async function init() {
  try {
    library =
      (native
        ? await invoke("load_library")
        : JSON.parse(localStorage.getItem("astral-library") || "null")) ||
      library;
    if (
      !Array.isArray(library.favorites) ||
      !library.progress ||
      !Array.isArray(library.addons)
    )
      throw Error("Données invalides");
  } catch (e) {
    library = { favorites: [], progress: {}, addons: [] };
    console.error(e);
  }
  render();
  if (native)
    for (const u of library.addons) {
      try {
        await hydrate(u);
        render();
      } catch (e) {
        toast("Catalogue indisponible : " + e);
      }
    }
}
init();
