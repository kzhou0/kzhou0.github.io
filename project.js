const projects = {
  lunapill: {
    name: "Lunapill",
    year: "2026",
    summary: "A care navigator that helps newcomers find providers who match the way they need to be cared for.",
    tags: ["JavaScript", "Node.js", "Playwright", "Public APIs"],
    purpose: "Finding a doctor is already difficult. Language barriers, insurance uncertainty, immigration concerns, and cultural context make it harder. I built Lunapill to turn those needs into transparent search criteria instead of asking patients to decode a healthcare system that was not designed around them.",
    implementation: "I built Lunapill as a multi-page static application with semantic HTML, CSS, and framework-free browser JavaScript, backed by ECMAScript modules running in Node.js 18 or newer. Source-specific adapters ingest NYSDOH Provider Network Data, NPPES, HRSA health-center records, CMS Doctors and Clinicians data, and New York State OMH programs. The import scripts stream or fetch each source, normalize clinician and program records into a shared JSON contract, validate required fields and HTTPS source URLs, deduplicate with Maps and Sets, and assign stable location-aware IDs. They atomically publish a complete provider module plus a smaller browser-search projection containing 14,468 NYC records.\n\nThe matching pipeline redacts email addresses, phone numbers, and Social Security number patterns from free text, constrains interpretation to allowlisted languages, insurance plans, visit types, and access preferences, applies hard filters, and ranks remaining providers with deterministic evidence scores. An optional HTTP LLM parser can convert natural-language queries into that schema, but its output is sanitized against the same vocabularies and falls back to the local parser on failure.\n\nI wrote the local API with Node's built-in HTTP and filesystem modules, capped request bodies at 16 KB, and kept a browser-side matching fallback for static hosting. The production build gzip-compresses the generated indexes and embeds them in a static worker bundle. Node's native test runner covers matching, scope controls, validation, and atomic data writes; Playwright exercises the complete search and profile flows. The only runtime UI dependency is Phosphor Icons.",
    challenge: "Combining incomplete public provider records with patient preferences without presenting uncertain data as fact. The system keeps reported facts, inferred matches, and missing information visibly separate.",
    learning: "Trust is part of the technical design. A useful ranking needs evidence, explanations, and a clear path for people to verify details before relying on a result.",
  },
  lionplan: {
    name: "LionPlan",
    year: "2026",
    summary: "A guided planner for building Columbia schedules now and mapping degree progress across future semesters.",
    tags: ["Python", "SQLite / FTS5", "Ollama", "Playwright"],
    purpose: "Course planning usually means bouncing between catalogs, requirement pages, reviews, and a spreadsheet. LionPlan brings those decisions into one workspace so students can test schedules, notice conflicts, and understand how one semester affects the rest of their degree.",
    implementation: "I organized LionPlan as an installable Python 3.9 package with a src layout, setuptools build configuration, and a liongraph command-line entry point. The runtime intentionally uses the Python standard library with no required third-party packages. Dataclasses model courses, sections, meetings, instructors, evaluations, and reviews, while a normalized SQLite database runs in WAL mode and stores source snapshots, course offerings, teaching assignments, program requirements, retrieval documents, review tasks, and evaluation runs. SQLite FTS5 with porter and Unicode tokenization powers full-text retrieval. Separate adapters collect the public Columbia Directory of Classes, undergraduate Bulletins, and CULPA material through allowlisted hosts, robots.txt checks, disk caching, rate limits, request budgets, content hashes, and provenance records.\n\nThe schedule engine normalizes meeting times into integer minutes, expands day aliases, generates section combinations with itertools.product, rejects pairwise interval overlaps, and ranks viable schedules by availability and remaining capacity. The degree-plan engine evaluates reviewed JSON rules with course, all_of, any_of, choose_n, choose_pattern, min_credits, exclusion, nullification, category, and double-counting operators across as many as twelve terms.\n\nA deterministic intent router limits retrieval to relevant compact records before an optional Ollama-hosted llama3.2:3b model explains the structured result. The model receives at most twelve retrieved documents, returns structured JSON with packet-local citations, and is rejected if it cites an unknown source or names an ungrounded course. The browser UI is static HTML, CSS, and JavaScript served by the Python application; the eight-semester plan remains browser-local. Unittest covers ingestion, requirements, schedule generation, and planning, with Playwright and pytest available as optional development dependencies.",
    challenge: "Representing prerequisites, time conflicts, requirements, and personal preferences together while keeping the interface responsive enough for rapid schedule changes.",
    learning: "Planning tools should support exploration, not make decisions for the user. The best suggestions expose constraints and tradeoffs while leaving the final choice legible and reversible.",
  },
  northstar: {
    name: "NorthStar",
    year: "2025",
    summary: "A retrieval and verification pipeline that makes answers from community knowledge easier to inspect and trust.",
    tags: ["Next.js", "FastAPI", "PostgreSQL / pgvector", "NLI", "Ollama"],
    purpose: "Crowdsourced knowledge is often useful because it is specific and current, but it can also be contradictory or weakly sourced. NorthStar retrieves relevant claims, weighs source quality, checks agreement, and attaches citations so an answer can be evaluated instead of merely accepted.",
    implementation: "I designed NorthStar as a source-grounded RAG prototype with a Next.js client, a FastAPI orchestration API, PostgreSQL as the system of record, and pgvector for semantic retrieval and cache lookup. The source-neutral evidence ledger links immutable Reddit thread and comment snapshots to exact character spans, extracted assertions, canonical entities, generated claims, and verifier decisions. A request is rewritten into three to five query variants, searches at most fifteen threads, fetches up to 2,000 comments with eight concurrent source requests, and processes extraction batches of no more than twenty comments.\n\nNear-duplicate grouping excludes reposts, repeated authors, and reply cascades from independent-support counts. Aggregation combines capped log-scaled vote weight, recency decay, and cross-thread corroboration while retaining conflicting claims instead of flattening them into one answer. The generation adapter is designed for a lightweight Qwen-class model through Ollama and must return structured atomic claims with authorized evidence IDs rather than free-form citation markers. A local NLI verifier records entailment, neutral, and contradiction scores for each claim; unsupported claims are removed before a completed answer is released.\n\nVersioned JSON endpoints separate message creation from server-sent progress events for rewriting, retrieval, extraction, verification, completion, and failure. UUIDv7 records, per-user idempotency keys, transactional answer and evidence writes, row-level tenant isolation, bounded worker pools, schema validation, retry budgets, and explicit token and request limits make the evidence path reproducible.",
    challenge: "Separating relevance from reliability. A highly similar passage is not necessarily strong evidence, so retrieval, source weighting, and contradiction checks have to remain distinct stages.",
    learning: "Good RAG systems are evidence systems first. Model choice matters less when retrieval quality, conflict handling, and citation boundaries are weak.",
  },
  chordcare: {
    name: "ChordCare",
    year: "2024",
    summary: "A music therapy recommender that learns from a patient's listening profile and therapeutic responses.",
    tags: ["Python", "Spotify API", "CNN / RF", "React", "Jupyter"],
    purpose: "Music therapy is personal, but recommendations can become generic when they ignore a patient's existing relationship with music. ChordCare uses listening patterns and response labels to identify tracks that fit both musical preference and a chosen therapeutic direction.",
    implementation: "I used Python notebooks in Jupyter to build the training and evaluation pipeline and the Spotify Web API to collect each patient's selected-song profile and track-level audio information. The modeling workflow converts those records into numerical feature tensors, pairs them with labels representing positive therapeutic outcomes, and separates training and evaluation data so architecture changes can be compared consistently.\n\nI trained a convolutional neural network to learn combinations of listening and song features, used a random forest as a second model and baseline, and tuned the network architecture and hyperparameters against held-out performance. The strongest configuration reached 94% accuracy when predicting songs associated with positive therapeutic responses. A React interface, supported by standard HTML and CSS, collects the user's music profile and presents the ranked recommendations returned by the Python model workflow. I kept the recommendation loop patient-specific: new response labels can be appended to that person's history and used in later model evaluation rather than treating genre popularity as a universal therapy signal.",
    challenge: "Turning noisy, highly individual listening histories into features that a model can learn from without reducing a patient's taste to genre alone.",
    learning: "Personalization needs a feedback loop. Offline accuracy is useful, but the system becomes meaningful only when recommendations can adapt to an individual patient's response over time.",
  },
};

const requestedProject = new URLSearchParams(window.location.search).get("project");
const project = projects[requestedProject] || projects.lunapill;

document.title = `${project.name} | Kyle Zhou`;
document.querySelector('meta[name="description"]').content = project.summary;
document.querySelector("[data-project-year]").textContent = project.year;
document.querySelector("[data-project-name]").textContent = project.name;
document.querySelector("[data-project-summary]").textContent = project.summary;
document.querySelector("[data-project-purpose]").textContent = project.purpose;
document.querySelector("[data-project-implementation]").textContent = project.implementation;
document.querySelector("[data-project-challenge]").textContent = project.challenge;
document.querySelector("[data-project-learning]").textContent = project.learning;
document.querySelector("[data-project-tags]").innerHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");

const themeToggle = document.querySelector(".theme-toggle");
document.documentElement.dataset.theme = localStorage.getItem("theme") || "light";

const renderIcons = () => {
  if (window.lucide) lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
};

const updateTheme = () => {
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  themeToggle.setAttribute("title", `Switch to ${isDark ? "light" : "dark"} theme`);
  themeToggle.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}">${isDark ? "light" : "dark"}</i>`;
  renderIcons();
};

themeToggle.addEventListener("click", () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", document.documentElement.dataset.theme);
  updateTheme();
});

updateTheme();
renderIcons();
