/**
 * =============================================================================
 * MEREL — Promptbibliotheek
 * Gemeente Leiden · IT & Digitalisering · Intern gebruik
 * =============================================================================
 *
 * Bestand:  app.js
 * Doel:     Alle applicatielogica voor de promptbibliotheek.
 *
 * Structuur:
 *   1.  Constanten (opslagsleutels)
 *   2.  Standaardprompts (DEFAULT_PROMPTS)
 *   3.  Applicatiestatus (state)
 *   4.  localStorage-wrapper (lsGet / lsSet)
 *   5.  Data laden & opslaan (loadData / saveData)
 *   6.  Instellingen (loadSettings / saveSettings / getApiKey)
 *   7.  Externe prompts laden (loadExternalPrompts / mapCategory)
 *   8.  Initialisatie (init)
 *   9.  Renderen (renderPrompts / renderCard)
 *  10.  Tellers bijwerken (updateCounts / updateStats)
 *  11.  Filters (filterCategory / filterModel)
 *  12.  Detailmodal (openDetail / copyPrompt / copyById)
 *  13.  Vertaalfunctie (setTargetLang / translatePrompt / copyTranslation)
 *  14.  Nieuw/bewerk-modal (openNewModal / openEditModal / savePrompt)
 *  15.  Export & import (exportPrompts / importPrompts)
 *  16.  Modals & hulpfuncties (openModal / closeModal / showToast)
 *  17.  Event listeners (overlay sluiten bij klik buiten modal)
 *  18.  Opstarten
 * =============================================================================
 */


/* =============================================================================
   1. CONSTANTEN
   Sleutelnamen voor localStorage; centraal gedefinieerd zodat ze consistent zijn.
   ============================================================================= */
const STORAGE_KEY  = 'gemeente_Leiden_prompts';
const SETTINGS_KEY = 'gemeente_Leiden_settings';


/* =============================================================================
   2. STANDAARDPROMPTS
   Worden geladen als er nog geen opgeslagen data in localStorage staat.
   Elke prompt heeft: id, featured, title, category, model, author, date, usage, prompt.
   ============================================================================= */
const DEFAULT_PROMPTS = [
  {
    id: 1, featured: true,
    title: "Technisch ontwerpdocument opstellen",
    category: "documentatie",
    model: "Beide",
    author: "IT-team",
    date: "2025-03-01",
    usage: "Gebruik bij het opstellen van architectuur- of ontwerpdocumenten voor IT-projecten.",
    prompt: "Jij bent een ervaren IT-architect bij een Nederlandse gemeente. Schrijf een technisch ontwerpdocument voor [naam systeem/project].\n\nHet document moet de volgende secties bevatten:\n1. Samenvatting en doelstelling\n2. Huidige situatie (as-is)\n3. Gewenste situatie (to-be)\n4. Technische architectuur en componenten\n5. Afhankelijkheden en risico's\n6. Beveiligingsoverwegingen (AVG/BIO)\n7. Implementatieplan en fasering\n8. Beheersaspecten na go-live\n\nSchrijf in formeel Nederlands, passend bij gemeentelijke standaarden. Gebruik duidelijke koppen en opsommingen."
  },
  {
    id: 2, featured: false,
    title: "Code review feedback geven",
    category: "code",
    model: "Claude",
    author: "Dev",
    date: "2025-03-05",
    usage: "Voor gestructureerde code review feedback aan collega-ontwikkelaars.",
    prompt: "Voer een grondige code review uit op de volgende [programmeertaal] code. Beoordeel op:\n\n1. **Correctheid** — Werkt de code zoals bedoeld?\n2. **Leesbaarheid** — Is de code begrijpelijk en goed gedocumenteerd?\n3. **Veiligheid** — Zijn er beveiligingskwetsbaarheden (o.a. input validatie, SQL-injectie)?\n4. **Prestaties** — Zijn er bottlenecks of inefficiënties?\n5. **Onderhoudbaarheid** — Volgt de code de afgesproken patronen en conventies?\n\nGeef je feedback constructief en concreet. Markeer kritieke issues apart. Stel verbeteringen voor met voorbeeldcode waar relevant.\n\n[Plak hier de code]"
  },
  {
    id: 3, featured: false,
    title: "Projectstatusmail schrijven",
    category: "communicatie",
    model: "Beide",
    author: "PM",
    date: "2025-03-08",
    usage: "Wekelijkse of tweewekelijkse projectstatusupdate naar stakeholders.",
    prompt: "Schrijf een professionele projectstatusmail voor [projectnaam] gericht aan [doelgroep: management/opdrachtgever/team].\n\nContext:\n- Projectfase: [fase]\n- Rapportageperiode: [van datum] t/m [tot datum]\n- Overall status: [groen/oranje/rood]\n\nBehandel de volgende punten:\n1. Samenvatting van de huidige status (2-3 zinnen)\n2. Wat is bereikt in deze periode?\n3. Wat staat er gepland voor de komende periode?\n4. Risico's en aandachtspunten\n5. Gevraagde beslissingen of acties van ontvanger\n\nToon: formeel maar toegankelijk. Gebruik opsommingen voor leesbaarheid. Maximaal één A4."
  },
  {
    id: 4, featured: true,
    title: "Vergaderverslag samenvatten",
    category: "vergadering",
    model: "ChatGPT",
    author: "Secretariaat",
    date: "2025-03-10",
    usage: "Zet ruwe vergadernotities om naar een gestructureerd verslag.",
    prompt: "Zet de onderstaande ruwe vergadernotities om naar een gestructureerd vergaderverslag voor een gemeentelijke IT-vergadering.\n\nGebruik dit format:\n**Vergaderverslag [naam vergadering]**\nDatum: | Aanwezig: | Voorzitter: | Notulist:\n\n**1. Opening en mededelingen**\n**2. Bespreking agendapunten**\n   [Per agendapunt: onderwerp, discussie, besluit]\n**3. Actiepunten**\n   | Actie | Verantwoordelijke | Deadline |\n**4. Rondvraag en sluiting**\n**5. Datum volgende vergadering**\n\nSchrijf helder en zakelijk. Actiepunten moeten SMART geformuleerd zijn.\n\n[Plak hier de ruwe notities]"
  },
  {
    id: 5, featured: false,
    title: "IT-risicoanalyse uitvoeren",
    category: "risico",
    model: "Claude",
    author: "CISO",
    date: "2025-03-12",
    usage: "Gestructureerde risicoanalyse conform BIO/ISO27001 voor IT-projecten of wijzigingen.",
    prompt: "Voer een IT-risicoanalyse uit voor [naam project/systeem/wijziging] bij Gemeente Leiden.\n\nGebruik de BIO (Baseline Informatiebeveiliging Overheid) als referentiekader.\n\nAnalyseer de volgende risicogebieden:\n1. Beschikbaarheid — Wat zijn de gevolgen van uitval?\n2. Integriteit — Welke risico's zijn er voor datakwaliteit?\n3. Vertrouwelijkheid — Zijn er privacyrisico's (AVG)?\n4. Continuïteit — Hoe herstelbaar is het systeem?\n\nPer risico:\n- Beschrijving van het risico\n- Kans (1-5) × Impact (1-5) = Risicoscore\n- Huidige beheersmaatregelen\n- Aanbevolen aanvullende maatregelen\n- Restrisico\n\nSluit af met een risicokaart en aanbeveling voor go/no-go."
  },
  {
    id: 6, featured: false,
    title: "Beleidsnotitie AI-gebruik opstellen",
    category: "beleid",
    model: "Beide",
    author: "Beleid",
    date: "2025-03-15",
    usage: "Intern beleidsdocument over verantwoord AI-gebruik binnen de gemeente.",
    prompt: "Schrijf een beleidsnotitie over verantwoord gebruik van AI-tools (zoals ChatGPT en Claude) binnen Gemeente Leiden, gericht aan [doelgroep: medewerkers/management/college].\n\nDe notitie moet omvatten:\n1. Aanleiding en doelstelling\n2. Scope (welke tools, welke medewerkers)\n3. Kaders en uitgangspunten (AVG, BIO, ethiek)\n4. Wat mag wel — concrete toepassingen\n5. Wat mag niet — verboden gebruik (bijv. persoonsgegevens, vertrouwelijke info)\n6. Verantwoordelijkheden\n7. Meld- en escalatieprocedure\n8. Evaluatie en herziening\n\nSchrijf in formeel bestuurlijk Nederlands. Maximaal 3 A4."
  }
];


/* =============================================================================
   3. APPLICATIESTATUS (STATE)
   Centrale variabelen die de huidige staat van de applicatie bijhouden.
   ============================================================================= */

/** @type {Array}   Alle geladen prompts (standaard + lokaal opgeslagen) */
let prompts = [];

/**
 * Actief filter object.
 * - category: 'alle' of een categoriesleutel (bijv. 'code', 'beleid')
 * - model:    'alle-modellen', 'ChatGPT', 'Claude' of 'Beide'
 */
let currentFilter = { category: 'alle', model: 'alle-modellen' };

/** @type {number|null}  ID van de prompt die momenteel in het detailmodal open staat */
let currentPromptId = null;

/** @type {string}  Taalcode voor de vertaalfunctie ('en', 'de', 'fr', 'ar') */
let targetLang = 'en';

/** @type {number}  Bijgehouden aantal vertaalsessies (persisteert via instellingen) */
let translationCount = 0;

/** @type {boolean}  True als het nieuwe-prompt-modal in bewerkingsmodus staat */
let editMode = false;


/* =============================================================================
   4. LOCALSTORAGE-WRAPPER
   Vangt uitzonderingen op in omgevingen waar localStorage geblokkeerd is
   (bijv. SharePoint iframe-sandbox). Valt terug op een in-memory object.
   ============================================================================= */

/** In-memory fallback als localStorage niet beschikbaar is */
let _store = {};

/**
 * Leest een waarde uit localStorage, of uit de fallback-opslag.
 * @param {string} key - Opslagsleutel
 * @returns {string|null}
 */
function lsGet(key) {
  try { return localStorage.getItem(key); } catch(e) { return _store[key] || null; }
}

/**
 * Schrijft een waarde naar localStorage, of naar de fallback-opslag.
 * @param {string} key - Opslagsleutel
 * @param {string} val - Te bewaren waarde (altijd als string)
 */
function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch(e) { _store[key] = val; }
}


/* =============================================================================
   5. DATA LADEN & OPSLAAN
   ============================================================================= */

/**
 * Laadt prompts uit localStorage.
 * Valt terug op DEFAULT_PROMPTS als er nog niets is opgeslagen.
 */
function loadData() {
  try {
    const saved = lsGet(STORAGE_KEY);
    prompts = saved ? JSON.parse(saved) : [...DEFAULT_PROMPTS];
  } catch(e) {
    prompts = [...DEFAULT_PROMPTS];
  }
}

/**
 * Schrijft de huidige prompts-array naar localStorage.
 */
function saveData() {
  try { lsSet(STORAGE_KEY, JSON.stringify(prompts)); } catch(e) {}
}


/* =============================================================================
   6. INSTELLINGEN
   ============================================================================= */

/**
 * Laadt de opgeslagen instellingen (API-sleutel, vertaalteller).
 * Verbergt de API-sleutelbanner als er al een sleutel is.
 */
function loadSettings() {
  try {
    const s = lsGet(SETTINGS_KEY);
    if (s) {
      const settings = JSON.parse(s);
      if (settings.apiKey) {
        document.getElementById('api-key-input').value = settings.apiKey;
        document.getElementById('api-banner').style.display = 'none';
      }
      if (settings.translationCount) translationCount = settings.translationCount;
    }
  } catch(e) {}
}

/**
 * Slaat de ingevoerde API-sleutel en de vertaalteller op in localStorage.
 * Sluit het instellingenmodal en toont een bevestiging.
 */
function saveSettings() {
  const apiKey = document.getElementById('api-key-input').value.trim();
  const settings = { apiKey, translationCount };
  try { lsSet(SETTINGS_KEY, JSON.stringify(settings)); } catch(e) {}
  if (apiKey) document.getElementById('api-banner').style.display = 'none';
  closeModal('settings-modal');
  showToast('Instellingen opgeslagen', 'success');
}

/**
 * Geeft de opgeslagen Claude API-sleutel terug, of null als die er niet is.
 * @returns {string|null}
 */
function getApiKey() {
  try {
    const s = lsGet(SETTINGS_KEY);
    if (!s) return null;
    return JSON.parse(s).apiKey || null;
  } catch(e) { return null; }
}


/* =============================================================================
   7. EXTERNE PROMPTS LADEN
   Haalt aanvullende prompts op van een externe JSON-bron (prompts.chat).
   Wordt aangeroepen bij initialisatie; fouten worden stil afgehandeld.
   ============================================================================= */

/**
 * Categoriekleuren per sleutelwoord (gebruikt in renderCard voor gekleurde tags).
 * @type {Object.<string, string>}
 */
const CAT_COLORS = {
  documentatie: '#1A6B3C',
  code:         '#7C3AED',
  communicatie: '#0369A1',
  vergadering:  '#B45309',
  risico:       '#B91C1C',
  beleid:       '#0F766E'
};

/**
 * Leesbare labels per categorienaam.
 * @type {Object.<string, string>}
 */
const CAT_LABELS = {
  documentatie: 'Technische documentatie',
  code:         'Code review',
  communicatie: 'Projectcommunicatie',
  vergadering:  'Vergaderverslagen',
  risico:       'Risicoanalyses',
  beleid:       'Beleidsnotities'
};

/**
 * Vertaalt de tags van een extern prompt-object naar een interne categorienaam.
 * Valt terug op 'documentatie' als er geen overeenkomst is.
 * @param {Object} p - Extern promptobject met optionele tags-array
 * @returns {string} - Interne categorienaam
 */
function mapCategory(p) {
  if (!p.tags) return 'documentatie';
  if (p.tags.includes('dev'))      return 'code';
  if (p.tags.includes('writing'))  return 'communicatie';
  if (p.tags.includes('analysis')) return 'risico';
  return 'documentatie';
}

/**
 * Haalt externe prompts op en voegt ze toe aan de prompts-array.
 * IDs worden opgehoogd om botsingen met bestaande IDs te voorkomen.
 */
async function loadExternalPrompts() {
  try {
    const res  = await fetch('https://gemeente-leiden.github.io/prompt-bibliotheek/data/prompts-chat.json');
    const data = await res.json();

    const maxId = Math.max(0, ...prompts.map(p => p.id));

    const mapped = data.map((p, i) => ({
      id:       maxId + i + 1,
      featured: false,
      title:    p.title || 'Untitled prompt',
      category: mapCategory(p),
      model:    'ChatGPT',
      author:   'prompts.chat',
      date:     new Date().toISOString().substring(0, 10),
      usage:    'Extern ingeladen prompt',
      prompt:   p.prompt
    }));

    prompts = [...prompts, ...mapped];

  } catch (e) {
    console.error('Fout bij laden externe prompts', e);
  }
}


/* =============================================================================
   8. INITIALISATIE
   Wordt aangeroepen zodra de pagina geladen is (onderaan dit bestand).
   ============================================================================= */

/**
 * Start de applicatie:
 * 1. Laadt lokale data en instellingen
 * 2. Haalt externe prompts op
 * 3. Rendert de UI
 */
async function init() {
  loadData();
  loadSettings();
  await loadExternalPrompts();
  renderPrompts();
  updateStats();
  updateCounts();
}


/* =============================================================================
   9. RENDEREN
   ============================================================================= */

/**
 * Filtert en rendert de promptkaartjes in het grid.
 * Past ook de resultaatteller rechtsboven aan.
 */
function renderPrompts() {
  const grid = document.getElementById('prompt-grid');

  // Zoekterm live uitlezen uit het inputveld
  const searchTerm = document.getElementById('search-input')
    ? document.getElementById('search-input').value
    : '';

  // Filteren op categorie, model en zoekterm
  const filtered = prompts.filter(p => {
    if (currentFilter.category !== 'alle' && p.category !== currentFilter.category) return false;
    if (currentFilter.model !== 'alle-modellen' && p.model !== currentFilter.model && p.model !== 'Beide') return false;
    if (searchTerm && !(
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  });

  // Uitgelichte prompts bovenaan sorteren
  const sorted = filtered.sort((a, b) => (b.featured === true) - (a.featured === true));

  // Kaartjes direct in het grid renderen (geen extra wrapper-div)
  grid.innerHTML = sorted.map(p => renderCard(p)).join('');

  // Resultaatteller bijwerken
  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = `${sorted.length} prompts`;
}

/**
 * Genereert de HTML-string voor één promptkaart.
 * @param {Object} p - Promptobject
 * @returns {string} - HTML-string
 */
function renderCard(p) {
  const color    = CAT_COLORS[p.category] || '#888';
  const label    = CAT_LABELS[p.category] || p.category;
  const preview  = p.prompt.substring(0, 200); // Eerste 200 tekens als preview
  const featured = p.featured ? ' featured' : '';

  return (
    '<div class="prompt-card' + featured + '">' +
      '<div class="card-top">' +
        '<div class="card-title">' + p.title + '</div>' +
        '<div class="card-actions">' +
          '<button class="icon-btn" title="Kopieer" onclick="copyById(' + p.id + ')">' +
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
              '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
              '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
            '</svg>' +
          '</button>' +
          '<button class="icon-btn" title="Bekijk details" onclick="openDetail(' + p.id + ')">' +
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
              '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
              '<circle cx="12" cy="12" r="3"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="card-prompt-preview">' + preview + '</div>' +
      '<div class="card-meta">' +
        '<span class="tag tag-cat" style="background:' + color + '15;color:' + color + ';border-color:' + color + '40;">' + label + '</span>' +
        '<span class="tag tag-model">' + p.model + '</span>' +
        (p.featured ? '<span class="tag tag-new">Uitgelicht</span>' : '') +
        (p.author === 'prompts.chat' ? '<span class="tag">Extern</span>' : '') +
      '</div>' +
      '<div class="card-footer">' +
        '<div class="card-author">' +
          '<div class="author-avatar">' + (p.author || '?').substring(0, 2).toUpperCase() + '</div>' +
          (p.author || 'Onbekend') + ' \u00b7 ' + (p.date || '') +
        '</div>' +
        '<button class="card-btn-use" onclick="openDetail(' + p.id + ')">Gebruik prompt \u2192</button>' +
      '</div>' +
    '</div>'
  );
}


/* =============================================================================
   10. TELLERS BIJWERKEN
   ============================================================================= */

/**
 * Werkt de tellers in de sidebar bij per categorie en voor alle prompts samen.
 */
function updateCounts() {
  const cats = ['documentatie', 'code', 'communicatie', 'vergadering', 'risico', 'beleid'];
  document.getElementById('count-alle').textContent = prompts.length;
  cats.forEach(c => {
    const el = document.getElementById('count-' + c);
    if (el) el.textContent = prompts.filter(p => p.category === c).length;
  });
}

/**
 * Werkt de statistiekenkaartjes bovenaan de pagina bij (totaal & vertalingen).
 */
function updateStats() {
  document.getElementById('stat-total').textContent        = prompts.length;
  document.getElementById('stat-translations').textContent = translationCount;
}


/* =============================================================================
   11. FILTERS
   ============================================================================= */

/**
 * Filtert het grid op categorie en markeert het actieve sidebar-item.
 * @param {string} cat - Categorienaam ('alle' of een categorienaam)
 * @param {HTMLElement} btn - Het aangeklikte sidebar-item
 */
function filterCategory(cat, btn) {
  currentFilter.category = cat;
  document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('section-title').textContent =
    cat === 'alle' ? 'Alle prompts' : (CAT_LABELS[cat] || cat);
  renderPrompts();
}

/**
 * Filtert het grid op AI-model.
 * @param {string} model - Modelnaam ('alle-modellen', 'ChatGPT', 'Claude', 'Beide')
 * @param {HTMLElement} btn - Het aangeklikte sidebar-item (ongebruikt maar symmetrisch)
 */
function filterModel(model, btn) {
  currentFilter.model = model;
  renderPrompts();
}


/* =============================================================================
   12. DETAILMODAL
   ============================================================================= */

/**
 * Opent het detailmodal voor een specifieke prompt.
 * Vult alle velden in en reset het vertaalpaneel.
 * @param {number} id - Prompt-ID
 */
function openDetail(id) {
  currentPromptId = id;
  const p = prompts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('detail-title').textContent      = p.title;
  document.getElementById('detail-prompt-text').textContent = p.prompt;
  document.getElementById('detail-usage').textContent       = p.usage || '—';

  const color = CAT_COLORS[p.category] || '#888';
  document.getElementById('detail-tags').innerHTML =
    '<span class="tag tag-cat" style="background:' + color + '15;color:' + color + ';border-color:' + color + '40;">' +
      (CAT_LABELS[p.category] || p.category) +
    '</span>' +
    '<span class="tag tag-model">' + p.model + '</span>' +
    '<span style="font-size:12px;color:var(--tekst-muted);margin-left:4px;">Auteur: ' + (p.author || '\u2014') + '</span>';

  // Vertaalpaneel resetten naar beginstatus
  document.getElementById('translate-output').innerHTML =
    '<span class="translate-loading">Klik op "Vertaal" om de prompt te vertalen via de Claude API.</span>';
  document.getElementById('btn-copy-translation').style.display = 'none';

  openModal('detail-modal');
}

/**
 * Kopieert de prompttekst van de huidig geopende prompt naar het klembord.
 */
function copyPrompt() {
  const p = prompts.find(x => x.id === currentPromptId);
  if (!p) return;
  navigator.clipboard.writeText(p.prompt).then(() => showToast('Prompt gekopieerd!', 'success'));
}

/**
 * Kopieert de prompttekst van een prompt op basis van ID.
 * Wordt aangeroepen via de kopieerknop op de kaart.
 * @param {number} id - Prompt-ID
 */
function copyById(id) {
  const p = prompts.find(x => x.id === id);
  if (!p) return;
  navigator.clipboard.writeText(p.prompt).then(() => showToast('Prompt gekopieerd!', 'success'));
}


/* =============================================================================
   13. VERTAALFUNCTIE
   Stuurt de prompttekst naar de Claude API en toont de vertaling.
   Vereist een geldige API-sleutel in de instellingen.
   ============================================================================= */

/** Leesbare namen voor de taalcodes in de UI */
const LANG_NAMES = { en: 'Engels', de: 'Duits', fr: 'Frans', ar: 'Arabisch' };

/**
 * Stelt de doeltaal in voor de vertaalfunctie.
 * Markeert de geselecteerde taalknop als actief.
 * @param {string} lang - Taalcode ('en', 'de', 'fr', 'ar')
 * @param {HTMLElement} btn - De aangeklikte taalknop
 */
function setTargetLang(lang, btn) {
  targetLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/**
 * Verstuurt de huidige prompt naar de Claude API voor vertaling.
 * Toont de vertaling in het vertaalvenster en verhoogt de teller.
 *
 * Opmerking: de API-sleutel wordt opgeslagen in localStorage.
 * Dit is voldoende voor intern gebruik, maar niet geschikt voor publieke omgevingen.
 */
async function translatePrompt() {
  const p = prompts.find(x => x.id === currentPromptId);
  if (!p) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    showToast('Geen API-sleutel ingesteld. Ga naar Instellingen.', 'error');
    openSettings();
    return;
  }

  const output = document.getElementById('translate-output');
  output.innerHTML = '<span class="translate-loading">Vertaling wordt gemaakt via Claude API\u2026</span>';
  document.getElementById('btn-copy-translation').style.display = 'none';

  const langName = LANG_NAMES[targetLang] || targetLang;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content:
            'Vertaal de volgende AI-prompt van Nederlands naar ' + langName +
            '. Behoud de structuur, opmaak en variabelen tussen [haakjes] exact.' +
            ' Geef alleen de vertaalde prompt terug, zonder uitleg of aanvullende tekst.' +
            '\n\nNederlandse prompt:\n' + p.prompt
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API-fout: ' + response.status);
    }

    const data       = await response.json();
    const translated = data.content?.[0]?.text || '';

    output.style.whiteSpace = 'pre-wrap';
    output.textContent = translated;
    document.getElementById('btn-copy-translation').style.display = 'inline-flex';

    // Teller ophogen en opslaan
    translationCount++;
    document.getElementById('stat-translations').textContent = translationCount;
    try {
      const settings = JSON.parse(lsGet(SETTINGS_KEY) || '{}');
      settings.translationCount = translationCount;
      lsSet(SETTINGS_KEY, JSON.stringify(settings));
    } catch(e) {}

    showToast('Vertaald naar ' + langName + '!', 'success');

  } catch (err) {
    output.innerHTML =
      '<span style="color:var(--rood);font-family:var(--font-sans,sans-serif);font-size:13px;">Fout: ' +
      err.message + '</span>';
    showToast('Vertaling mislukt: ' + err.message, 'error');
  }
}

/**
 * Kopieert de vertaalde tekst uit het vertaalvenster naar het klembord.
 */
function copyTranslation() {
  const text = document.getElementById('translate-output').textContent;
  navigator.clipboard.writeText(text).then(() => showToast('Vertaling gekopieerd!', 'success'));
}


/* =============================================================================
   14. NIEUW / BEWERK MODAL
   ============================================================================= */

/**
 * Opent het formuliermodal voor een nieuwe prompt.
 * Wist alle velden en zet de modus op 'nieuw'.
 */
function openNewModal() {
  editMode = false;
  document.getElementById('new-modal-title').textContent = 'Nieuwe prompt toevoegen';
  document.getElementById('edit-id').value = '';
  ['title', 'category', 'model', 'prompt', 'usage', 'author'].forEach(f => {
    const el = document.getElementById('form-' + f);
    if (el) el.value = f === 'model' ? 'Beide' : '';
  });
  openModal('new-modal');
}

/**
 * Opent het formuliermodal voor het bewerken van de huidig geopende prompt.
 * Vult alle velden in met de bestaande waarden.
 */
function openEditModal() {
  const p = prompts.find(x => x.id === currentPromptId);
  if (!p) return;
  editMode = true;
  document.getElementById('new-modal-title').textContent = 'Prompt bewerken';
  document.getElementById('edit-id').value               = p.id;
  document.getElementById('form-title').value            = p.title;
  document.getElementById('form-category').value         = p.category;
  document.getElementById('form-model').value            = p.model;
  document.getElementById('form-prompt').value           = p.prompt;
  document.getElementById('form-usage').value            = p.usage || '';
  document.getElementById('form-author').value           = p.author || '';
  closeModal('detail-modal');
  openModal('new-modal');
}

/**
 * Slaat een nieuwe of bewerkte prompt op.
 * Valideert verplichte velden (titel, categorie, prompttekst).
 * Werkt daarna de UI bij.
 */
function savePrompt() {
  const title    = document.getElementById('form-title').value.trim();
  const category = document.getElementById('form-category').value;
  const prompt   = document.getElementById('form-prompt').value.trim();

  if (!title || !category || !prompt) {
    showToast('Vul minimaal titel, categorie en prompttekst in.', 'error');
    return;
  }

  const editId = document.getElementById('edit-id').value;

  if (editId) {
    // Bestaande prompt bijwerken
    const idx = prompts.findIndex(p => p.id == editId);
    if (idx > -1) {
      prompts[idx] = {
        ...prompts[idx],
        title,
        category,
        model:  document.getElementById('form-model').value,
        prompt,
        usage:  document.getElementById('form-usage').value.trim(),
        author: document.getElementById('form-author').value.trim()
      };
    }
    showToast('Prompt bijgewerkt!', 'success');
  } else {
    // Nieuwe prompt toevoegen met een uniek opgehoogd ID
    const newId = Math.max(0, ...prompts.map(p => p.id)) + 1;
    prompts.push({
      id:       newId,
      featured: false,
      title,
      category,
      model:    document.getElementById('form-model').value,
      author:   document.getElementById('form-author').value.trim() || 'IT-team',
      date:     new Date().toISOString().substring(0, 10),
      usage:    document.getElementById('form-usage').value.trim(),
      prompt
    });
    showToast('Prompt toegevoegd!', 'success');
  }

  saveData();
  closeModal('new-modal');
  renderPrompts();
  updateStats();
  updateCounts();
}


/* =============================================================================
   15. EXPORT & IMPORT
   ============================================================================= */

/**
 * Exporteert alle huidige prompts als een JSON-bestand (download).
 */
function exportPrompts() {
  const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'gemeente-prompts-export.json';
  a.click();
  showToast('Export gedownload!', 'success');
}

/**
 * Importeert prompts vanuit een JSON-bestand.
 * Voegt de geïmporteerde prompts toe aan de bestaande lijst (geen vervanging).
 * IDs worden opgehoogd om botsingen te voorkomen.
 * @param {Event} event - Bestandsselectie-event van het file-input element
 */
function importPrompts(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        const maxId = Math.max(0, ...prompts.map(p => p.id));
        imported.forEach((p, i) => { p.id = maxId + i + 1; });
        prompts = [...prompts, ...imported];
        saveData();
        renderPrompts();
        updateStats();
        updateCounts();
        showToast(imported.length + ' prompts geïmporteerd!', 'success');
      }
    } catch {
      showToast('Ongeldig JSON-bestand.', 'error');
    }
  };
  reader.readAsText(file);
}


/* =============================================================================
   16. MODALS & HULPFUNCTIES
   ============================================================================= */

/**
 * Maakt een modal zichtbaar door de klasse 'open' toe te voegen.
 * @param {string} id - ID van de modal-overlay
 */
function openModal(id) { document.getElementById(id).classList.add('open'); }

/**
 * Verbergt een modal door de klasse 'open' te verwijderen.
 * @param {string} id - ID van de modal-overlay
 */
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/**
 * Opent het instellingenmodal.
 * Aparte functie zodat het ook vanuit de API-banner aangeroepen kan worden.
 */
function openSettings() { openModal('settings-modal'); }

/**
 * Toont een tijdelijke toast-notificatie rechtsonder in beeld.
 * Verdwijnt automatisch na 3 seconden.
 * @param {string} msg  - Te tonen tekst
 * @param {string} type - Optioneel: 'success' of 'error' (bepaalt de kleur)
 */
let toastTimeout;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
}


/* =============================================================================
   17. EVENT LISTENERS
   Klik buiten een geopend modal sluit het modal.
   Geregistreerd op alle overlay-elementen.
   ============================================================================= */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});


/* =============================================================================
   18. OPSTARTEN
   Roept init() aan zodra het script is geladen.
   Het script staat onderaan de HTML (voor </body>), dus de DOM is al gereed.
   ============================================================================= */
init();
