const projects = {
  lunapill: {
    name: "Lunapill",
    year: "2026",
    summary: "A care navigator that helps newcomers find providers who match the way they need to be cared for.",
    tags: ["JavaScript", "Node.js", "Playwright", "Public APIs"],
    purpose: "Finding a doctor is already difficult. Language barriers, insurance uncertainty, immigration concerns, and cultural context make it harder. I built Lunapill to turn those needs into transparent search criteria instead of asking patients to decode a healthcare system that was not designed around them.",
    implementation: [
      {
        label: "Architecture",
        text: "I built the product as a multi-page static application using semantic HTML, CSS custom properties, and framework-free browser JavaScript. Shared behavior is split into ECMAScript modules for query parsing, matching, validation, presentation, and data access, all running on Node.js 18 or newer during development and data generation. The runtime source of truth is a pair of generated JavaScript modules: a complete provider index for profile pages and a smaller search projection for the browser. This avoids shipping an application database or collecting user accounts, health details, or appointment data. A local server built with node:http and node:fs serves the pages and exposes POST /api/rag/match, while the static deployment runs the same deterministic matcher directly in the browser when no API route exists.",
      },
      {
        label: "Core pipeline",
        text: "Source adapters ingest NYSDOH Provider Network Data, NPPES, HRSA health-center records, CMS Doctors and Clinicians data, and New York State OMH programs. Importers use native fetch, streaming file reads, Maps, and Sets to normalize clinician locations and care programs into one JSON contract, merge exact NPIs, deduplicate source rows, validate required fields and HTTPS URLs, and assign stable source-aware IDs. The current generated index contains 14,468 NYC records. runRagMatch first truncates and redacts free text, removing email addresses, phone numbers, and Social Security number patterns. parseQueryLocally then maps the request into closed vocabularies for language, insurance, visit type, provider type, and access preferences. matchProviders applies hard filters before calculating a deterministic evidence score, drops results below the minimum score, sorts by score and stored distance, and attaches source labels, URLs, and checked dates. An optional HTTP LLM gateway can produce the same structured interpretation, but sanitizeInterpretation rejects values outside the allowlists and falls back to local parsing whenever the gateway fails.",
      },
      {
        label: "Reliability and delivery",
        text: "The API limits JSON request bodies to 16 KB, returns stable error envelopes for malformed or out-of-scope requests, sets Cache-Control to no-store, and never persists query bodies. Rendering helpers escape untrusted text and allow only https: and tel: handoff URLs. Data writers stage the full index, portable JSON export, and browser projection in temporary files, then rename them together so a failed build cannot leave mismatched artifacts. The production build uses node:zlib to gzip the large provider modules, enforces raw and compressed payload budgets, base64-embeds the assets into a static worker, and lazy-loads the search projection only when a search begins. Tests use node:test and node:assert for matching, scope guards, parser fallback, schema validation, URL safety, and atomic index rollback. Playwright covers mobile and desktop search, repeated filtering, profile navigation, light and dark themes, and the no-booking boundary. Phosphor Icons is the only runtime UI dependency.",
      },
    ],
    challenge: "Combining incomplete public provider records with patient preferences without presenting uncertain data as fact. The system keeps reported facts, inferred matches, and missing information visibly separate.",
    learning: "Trust is part of the technical design. A useful ranking needs evidence, explanations, and a clear path for people to verify details before relying on a result.",
  },
  lionplan: {
    name: "LionPlan",
    year: "2026",
    summary: "A guided planner for building Columbia schedules now and mapping degree progress across future semesters.",
    tags: ["Python", "SQLite / FTS5", "Ollama", "Playwright"],
    purpose: "Course planning usually means bouncing between catalogs, requirement pages, reviews, and a spreadsheet. LionPlan brings those decisions into one workspace so students can test schedules, notice conflicts, and understand how one semester affects the rest of their degree.",
    implementation: [
      {
        label: "Architecture",
        text: "I organized LionPlan as an installable Python 3.9 package using a src layout, setuptools build metadata, and a liongraph command-line entry point. The production runtime intentionally has no required third-party Python packages. Dataclasses define typed course, section, meeting, instructor, evaluation, and review records; pathlib, json, hashlib, urllib, html.parser, sqlite3, and http.server provide storage, networking, parsing, and serving. A normalized SQLite database runs with foreign keys and WAL journaling. Its schema separates crawl jobs, staging records, immutable source records, courses, term offerings, sections, meetings, instructors, evaluations, reviews, degree programs, reviewed requirement rules, retrieval documents, advisor runs, and human review tasks. SQLite FTS5 uses porter stemming and Unicode tokenization to index course descriptions, Bulletin language, and advising evidence without an external search service.",
      },
      {
        label: "Core pipeline",
        text: "Adapter classes collect the public Columbia Directory of Classes, undergraduate Bulletins, and CULPA data behind a shared source interface. The HTTP layer allowlists hosts, checks robots.txt, writes response caches to disk, records parser versions and content hashes, enforces three-to-five-second delays with randomized jitter, caps pages per run, and stops immediately on 401, 403, or 429 responses. The schedule engine converts meeting times to integer minutes, normalizes day aliases, expands one candidate list per requested course, and uses itertools.product to enumerate section combinations. A pairwise interval-overlap check removes conflicts before schedules are ranked by open-section count and remaining capacity. The degree engine reads reviewed JSON rules supporting course, all_of, any_of, choose_n, choose_pattern, and min_credits operators plus exclusions, nullification, categories, and double-count limits. It audits up to twelve planned terms, catches duplicates, calculates credits, and keeps source-only Bulletin text separate from approved deterministic rules.",
      },
      {
        label: "Reliability and delivery",
        text: "A deterministic router classifies course lookup, professor, requirement, schedule, semester, comparison, and four-year planning requests before retrieval, so the language model never performs open-ended database access. The retrieval service supplies at most twelve compact records to an optional Ollama-hosted llama3.2:3b model. The model must return structured JSON and packet-local citations such as S1; a validator rejects unknown citations, unsupported course IDs, and explanations that exceed the retrieved evidence. The structured planner still works when Ollama is offline because the model only explains results produced by the rule and schedule engines. The browser interface is plain HTML, CSS, and JavaScript served by Python, with the eight-semester draft stored locally in the browser. unittest exercises importers, identity normalization, schedule conflicts, rule evaluation, plan audits, routing, answerability, and grounding. pytest and Playwright are optional development dependencies for broader unit and end-to-end coverage.",
      },
    ],
    challenge: "Representing prerequisites, time conflicts, requirements, and personal preferences together while keeping the interface responsive enough for rapid schedule changes.",
    learning: "Planning tools should support exploration, not make decisions for the user. The best suggestions expose constraints and tradeoffs while leaving the final choice legible and reversible.",
  },
  northstar: {
    name: "NorthStar",
    year: "2025",
    summary: "A retrieval and verification pipeline that makes answers from community knowledge easier to inspect and trust.",
    tags: ["Next.js", "FastAPI", "PostgreSQL / pgvector", "NLI", "Ollama"],
    purpose: "Crowdsourced knowledge is often useful because it is specific and current, but it can also be contradictory or weakly sourced. NorthStar retrieves relevant claims, weighs source quality, checks agreement, and attaches citations so an answer can be evaluated instead of merely accepted.",
    implementation: [
      {
        label: "Architecture",
        text: "I designed NorthStar as a typed Next.js and TypeScript client backed by a Python FastAPI service. Pydantic schemas validate every request, provider response, extracted assertion, and completed answer. SQLAlchemy repositories and Alembic migrations manage PostgreSQL, with pgvector storing semantic embeddings beside normal relational records. The schema treats provenance as first-class data: immutable source_snapshot rows connect through extracted_assertion and entity_mention records to canonical_entity, answer_claim, claim_evidence, and verification_result tables. Chat and memory rows are tenant-scoped, while source snapshots can be reused only through an authorized answer relationship. The browser creates a message with a versioned JSON endpoint and follows a server-sent event stream that reports rewriting, retrieving, extracting, verifying, completed, or failed without exposing unverified answer text.",
      },
      {
        label: "Core pipeline",
        text: "An async Reddit connector built around Async PRAW and httpx rewrites each question into three to five search variants, retrieves at most fifteen threads, and fetches no more than 2,000 comments with an asyncio semaphore limiting concurrency to eight. Sentence Transformers produces dense embeddings for pgvector cosine search and the thirty-day semantic cache. Extraction runs in batches of twenty comments, validates exact evidence spans, and groups near-duplicates using normalized hashes and embedding similarity. Entity aggregation excludes the same author, crossposts, duplicate text, and reply cascades from independent-support counts, then combines capped log-scaled votes, recency decay, and cross-thread corroboration into reproducible ranking components. A Qwen2.5 model served through Ollama receives only the bounded aggregation packet and emits atomic JSON claims with entity and evidence IDs. A DeBERTa-v3 MNLI verifier loaded through Hugging Face Transformers and PyTorch scores entailment, neutrality, and contradiction for every claim against its cited spans. Unsupported claims are deleted before rendering, while opposing entailed claims remain visible as conflicts.",
      },
      {
        label: "Reliability and delivery",
        text: "UUIDv7 identifiers preserve sortable record identity, and client request IDs provide per-user idempotency so retries cannot create a second paid pipeline run. PostgreSQL transactions commit the rendered answer, atomic claims, evidence links, and verifier decisions together; failed or timed-out runs cannot become cache candidates. Retrieval text is treated as untrusted data, wrapped in delimited prompt fields, stripped of active markup, and never given tools or credentials. Row-level security, explicit memory consent, deletion timestamps, per-user concurrency limits, thirty-request hourly quotas, forty-five-second deadlines, bounded token budgets, exponential backoff, and connector allowlists define the trust boundary. pytest covers ranking, citation authorization, cache reuse, transaction rollback, tenant isolation, and prompt-injection fixtures. Playwright verifies source drawers, conflict displays, memory deletion, request reconnection, and terminal error states. Docker Compose provides matching PostgreSQL and API environments for local integration tests, while the Next.js client can deploy independently from the FastAPI worker.",
      },
    ],
    challenge: "Separating relevance from reliability. A highly similar passage is not necessarily strong evidence, so retrieval, source weighting, and contradiction checks have to remain distinct stages.",
    learning: "Good RAG systems are evidence systems first. Model choice matters less when retrieval quality, conflict handling, and citation boundaries are weak.",
  },
  chordcare: {
    name: "ChordCare",
    year: "2024",
    summary: "A music therapy recommender that learns from a patient's listening profile and therapeutic responses.",
    tags: ["PyTorch", "scikit-learn", "Spotify API", "React", "FastAPI"],
    purpose: "Music therapy is personal, but recommendations can become generic when they ignore a patient's existing relationship with music. ChordCare uses listening patterns and response labels to identify tracks that fit both musical preference and a chosen therapeutic direction.",
    implementation: [
      {
        label: "Architecture",
        text: "I split ChordCare into a React client, a FastAPI inference service, and a reproducible Python training workspace in Jupyter. The client uses Vite for development and bundling, the Spotify Authorization Code flow for scoped account access, and the Spotify Web API through Spotipy on the server so refresh tokens never enter the browser bundle. Pydantic request models define patient profiles, candidate tracks, therapy goals, and feedback events. pandas loads tabular listening and outcome data, NumPy handles feature arrays, and a versioned preprocessing pipeline stores track IDs separately from derived model features. Trained artifacts include a PyTorch state dictionary, a scikit-learn preprocessing pipeline, a random-forest baseline serialized with joblib, the class mapping, and a JSON manifest containing the feature order and model version.",
      },
      {
        label: "Core pipeline",
        text: "The ingestion job converts Spotify listening history and track metadata into one row per patient-track interaction, removes duplicate track IDs, imputes missing numerical values, one-hot encodes bounded categorical fields, and standardizes continuous features with scikit-learn's ColumnTransformer and StandardScaler. GroupShuffleSplit keeps the same patient's interactions from leaking across training and evaluation partitions. The PyTorch model uses one-dimensional convolution blocks with BatchNorm, ReLU, dropout, and adaptive pooling to learn local combinations across the ordered feature vector, followed by dense layers that estimate the probability of a positive therapeutic response. A RandomForestClassifier provides a nonlinear baseline and a second ranking signal. Optuna searches convolution widths, hidden dimensions, dropout, learning rate, batch size, and tree parameters; early stopping tracks held-out loss and restores the strongest checkpoint. The selected configuration reached 94% accuracy on the evaluation split, and ranking combines calibrated model probability with a small familiarity prior from the patient's listening profile.",
      },
      {
        label: "Reliability and delivery",
        text: "FastAPI loads the preprocessing and model artifacts once at process startup, validates that their manifest versions and feature orders match, and exposes separate recommendation and feedback endpoints. Inference runs under torch.inference_mode, batches candidate tracks, and returns track IDs, confidence values, and plain-language recommendation factors rather than raw tensors. The React interface keeps account authorization, profile selection, recommendation review, and feedback as explicit states; failed Spotify refreshes or empty candidate pools render recoverable errors instead of stale results. Feedback is appended as a new labeled interaction and enters later training runs rather than mutating the deployed model during a request. pytest checks preprocessing determinism, patient-level split isolation, artifact compatibility, and API schemas. PyTorch seed controls, pinned requirements, saved Optuna studies, and MLflow experiment metadata make model comparisons reproducible, while React Testing Library covers the profile and feedback flow.",
      },
    ],
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
document.querySelector("[data-project-challenge]").textContent = project.challenge;
document.querySelector("[data-project-learning]").textContent = project.learning;
document.querySelector("[data-project-tags]").replaceChildren(...project.tags.map((tag) => {
  const item = document.createElement("span");
  item.textContent = tag;
  return item;
}));

document.querySelector("[data-project-implementation]").replaceChildren(...project.implementation.map(({ label, text }) => {
  const part = document.createElement("span");
  const heading = document.createElement("b");
  part.className = "technical-part";
  heading.textContent = `${label}. `;
  part.append(heading, document.createTextNode(text));
  return part;
}));

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
