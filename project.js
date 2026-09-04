const projects = {
  lunapill: {
    name: "Lunapill",
    year: "2026",
    summary: "A care navigator that helps newcomers find providers who match the way they need to be cared for.",
    tags: ["Python", "React", "FastAPI", "pgvector"],
    purpose: "Finding a doctor is already difficult. Language barriers, insurance uncertainty, immigration concerns, and cultural context make it harder. I built Lunapill to turn those needs into transparent search criteria instead of asking patients to decode a healthcare system that was not designed around them.",
    challenge: "Combining incomplete public provider records with patient preferences without presenting uncertain data as fact. The system keeps reported facts, inferred matches, and missing information visibly separate.",
    learning: "Trust is part of the technical design. A useful ranking needs evidence, explanations, and a clear path for people to verify details before relying on a result.",
    flow: [
      ["Collect", "Translate language, coverage, location, and access needs into structured preferences."],
      ["Rank", "Filter provider records, score relevant matches, and retain the evidence behind each score."],
      ["Explain", "Show why each provider appears and which details still need confirmation."],
    ],
    demo: "lunapill",
    next: "lionplan",
  },
  lionplan: {
    name: "LionPlan",
    year: "2026",
    summary: "A guided planner for building Columbia schedules now and mapping degree progress across future semesters.",
    tags: ["TypeScript", "Node.js", "Ollama", "Python", "AWS"],
    purpose: "Course planning usually means bouncing between catalogs, requirement pages, reviews, and a spreadsheet. LionPlan brings those decisions into one workspace so students can test schedules, notice conflicts, and understand how one semester affects the rest of their degree.",
    challenge: "Representing prerequisites, time conflicts, requirements, and personal preferences together while keeping the interface responsive enough for rapid schedule changes.",
    learning: "Planning tools should support exploration, not make decisions for the user. The best suggestions expose constraints and tradeoffs while leaving the final choice legible and reversible.",
    flow: [
      ["Parse", "Normalize course listings, meeting times, prerequisites, and degree requirements."],
      ["Compose", "Let students combine courses and catch conflicts as the schedule changes."],
      ["Project", "Carry completed and planned classes forward to reveal future requirement gaps."],
    ],
    demo: "lionplan",
    next: "northstar",
  },
  northstar: {
    name: "NorthStar",
    year: "2025",
    summary: "A retrieval and verification pipeline that makes answers from community knowledge easier to inspect and trust.",
    tags: ["Python", "Next.js", "Pinecone RAG", "NLI", "Ollama"],
    purpose: "Crowdsourced knowledge is often useful because it is specific and current, but it can also be contradictory or weakly sourced. NorthStar retrieves relevant claims, weighs source quality, checks agreement, and attaches citations so an answer can be evaluated instead of merely accepted.",
    challenge: "Separating relevance from reliability. A highly similar passage is not necessarily strong evidence, so retrieval, source weighting, and contradiction checks have to remain distinct stages.",
    learning: "Good RAG systems are evidence systems first. Model choice matters less when retrieval quality, conflict handling, and citation boundaries are weak.",
    flow: [
      ["Retrieve", "Search embedded community data for passages related to the question."],
      ["Verify", "Compare claims for support, contradiction, source quality, and recency."],
      ["Answer", "Generate a concise response with ranked citations and visible uncertainty."],
    ],
    demo: "northstar",
    next: "chordcare",
  },
  chordcare: {
    name: "ChordCare",
    year: "2024",
    summary: "A music therapy recommender that learns from a patient's listening profile and therapeutic responses.",
    tags: ["Python", "Spotify API", "CNN / RF", "React"],
    purpose: "Music therapy is personal, but recommendations can become generic when they ignore a patient's existing relationship with music. ChordCare uses listening patterns and response labels to identify tracks that fit both musical preference and a chosen therapeutic direction.",
    challenge: "Turning noisy, highly individual listening histories into features that a model can learn from without reducing a patient's taste to genre alone.",
    learning: "Personalization needs a feedback loop. Offline accuracy is useful, but the system becomes meaningful only when recommendations can adapt to an individual patient's response over time.",
    flow: [
      ["Profile", "Collect audio features and listening patterns from a patient's selected tracks."],
      ["Predict", "Combine learned song representations with therapeutic response labels."],
      ["Adapt", "Use new feedback to improve the next recommendation set for that patient."],
    ],
    demo: "chordcare",
    next: "lunapill",
  },
};

const requestedProject = new URLSearchParams(window.location.search).get("project");
const projectKey = projects[requestedProject] ? requestedProject : "lunapill";
const project = projects[projectKey];

document.title = `${project.name} | Kyle Zhou`;
document.querySelector('meta[name="description"]').content = project.summary;
document.querySelector("[data-project-year]").textContent = project.year;
document.querySelector("[data-project-name]").textContent = project.name;
document.querySelector("[data-project-summary]").textContent = project.summary;
document.querySelector("[data-project-purpose]").textContent = project.purpose;
document.querySelector("[data-project-challenge]").textContent = project.challenge;
document.querySelector("[data-project-learning]").textContent = project.learning;
document.querySelector("[data-project-tags]").innerHTML = project.tags
  .map((tag) => `<span>${tag}</span>`)
  .join("");
document.querySelector("[data-project-flow]").innerHTML = project.flow
  .map(([title, detail]) => `<article class="build-step"><strong>${title}</strong><p>${detail}</p></article>`)
  .join("");

const next = projects[project.next];
const nextLink = document.querySelector("[data-next-link]");
nextLink.href = `project.html?project=${project.next}`;
document.querySelector("[data-next-name]").textContent = next.name;

const demoRoot = document.querySelector("[data-project-demo]");

const demos = {
  lunapill: () => {
    demoRoot.innerHTML = `
      <div class="demo-layout">
        <form class="demo-controls" data-demo-form>
          <h3>Find a sample match</h3>
          <label>Preferred language
            <select name="language"><option>Spanish</option><option>Mandarin</option><option>Arabic</option></select>
          </label>
          <label>Primary need
            <select name="need"><option>Primary care</option><option>Mental health</option><option>Women's health</option></select>
          </label>
          <button class="demo-button" type="submit">Find match</button>
        </form>
        <div class="demo-output" data-demo-output><p class="demo-empty">Choose what matters to see how Lunapill explains a match.</p></div>
      </div>`;

    const matches = {
      Spanish: ["Dr. Elena Ruiz", "Spanish reported by clinic", "Primary care, sliding-scale options, Queens"],
      Mandarin: ["Dr. Vivian Lin", "Mandarin reported by clinic", "Primary care, public insurance reported, Manhattan"],
      Arabic: ["Dr. Samira Haddad", "Arabic reported by clinic", "Primary care, interpreter support reported, Brooklyn"],
    };
    demoRoot.querySelector("[data-demo-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const [name, reason, details] = matches[form.get("language")];
      demoRoot.querySelector("[data-demo-output]").innerHTML = `
        <h3>Top sample result</h3>
        <div class="demo-result"><strong>${name}</strong><span>${form.get("need")}</span><small>${reason}. ${details}. Call to confirm current availability and coverage.</small></div>`;
    });
  },
  lionplan: () => {
    const courses = ["COMS 3134", "COMS 3157", "STAT 4203", "PSYC 1001"];
    demoRoot.innerHTML = `
      <div class="demo-layout">
        <div class="demo-controls">
          <h3>Build a sample week</h3>
          <p class="demo-empty">Add courses to see the schedule update and catch a conflict.</p>
          <div class="course-list">${courses.map((course) => `<button class="course-chip" type="button" aria-pressed="false">${course}</button>`).join("")}</div>
        </div>
        <div class="demo-output">
          <h3>Week view</h3>
          <div class="schedule-grid" data-schedule></div>
          <p class="demo-empty" data-schedule-note>Select a course to begin.</p>
        </div>
      </div>`;
    const render = () => {
      const selected = [...demoRoot.querySelectorAll('.course-chip[aria-pressed="true"]')].map((item) => item.textContent);
      const slots = ["Time", "Mon", "Wed", "Fri", "10:10", selected[0] || "", selected[0] || "", selected[0] || "", "1:10", selected[1] || "", selected[2] || "", selected[1] || ""];
      demoRoot.querySelector("[data-schedule]").innerHTML = slots.map((slot, index) => `<span class="${index > 3 && slot ? "scheduled" : ""}">${slot}</span>`).join("");
      const hasConflict = selected.includes("COMS 3157") && selected.includes("STAT 4203");
      demoRoot.querySelector("[data-schedule-note]").textContent = hasConflict ? "Conflict found: two selected courses overlap on Wednesday." : selected.length ? `${selected.length} course${selected.length === 1 ? "" : "s"} planned. No visible conflict.` : "Select a course to begin.";
    };
    demoRoot.querySelectorAll(".course-chip").forEach((button) => button.addEventListener("click", () => {
      button.setAttribute("aria-pressed", button.getAttribute("aria-pressed") === "true" ? "false" : "true");
      render();
    }));
    render();
  },
  northstar: () => {
    demoRoot.innerHTML = `
      <div class="demo-layout">
        <form class="demo-controls" data-demo-form>
          <h3>Trace an answer</h3>
          <label>Sample question
            <select name="question"><option>Is the library open late?</option><option>Where can I find tutoring?</option><option>Is the dining hall allergy-friendly?</option></select>
          </label>
          <button class="demo-button" type="submit">Check evidence</button>
        </form>
        <div class="demo-output" data-demo-output><p class="demo-empty">Run a sample question through retrieval, ranking, and verification.</p></div>
      </div>`;
    const answers = {
      "Is the library open late?": ["Usually, but hours vary by day.", ["Official hours page", "Student update", "Campus directory"]],
      "Where can I find tutoring?": ["The help room and peer tutoring program are the strongest matches.", ["Department guide", "Student handbook", "Peer recommendation"]],
      "Is the dining hall allergy-friendly?": ["Allergen labels are available, but cross-contact needs direct confirmation.", ["Dining policy", "Menu guidance", "Student report"]],
    };
    demoRoot.querySelector("[data-demo-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const question = new FormData(event.currentTarget).get("question");
      const [answer, sources] = answers[question];
      demoRoot.querySelector("[data-demo-output]").innerHTML = `<h3>${answer}</h3><div class="evidence-list">${sources.map((source, index) => `<div class="evidence-item"><strong>${source}</strong><span>${index === 0 ? "supports" : index === 1 ? "corroborates" : "adds context"}</span></div>`).join("")}</div>`;
    });
  },
  chordcare: () => {
    demoRoot.innerHTML = `
      <div class="demo-layout">
        <form class="demo-controls" data-demo-form>
          <h3>Shape a session</h3>
          <label>Therapeutic direction
            <select name="goal"><option>Settle</option><option>Focus</option><option>Energize</option></select>
          </label>
          <label>Energy <input name="energy" type="range" min="1" max="5" value="3" /></label>
          <button class="demo-button" type="submit">Recommend</button>
        </form>
        <div class="demo-output" data-demo-output><p class="demo-empty">Adjust the session goal to see a sample recommendation set.</p></div>
      </div>`;
    const songs = {
      Settle: ["Low tempo", "Soft dynamics", "Familiar acoustic profile"],
      Focus: ["Steady pulse", "Moderate energy", "Low lyrical density"],
      Energize: ["Strong rhythm", "Rising energy", "High positive valence"],
    };
    demoRoot.querySelector("[data-demo-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const goal = form.get("goal");
      demoRoot.querySelector("[data-demo-output]").innerHTML = `<h3>${goal} session</h3><div class="song-list">${songs[goal].map((song, index) => `<div class="song-item"><strong>${song}</strong><span>match ${index + 1}</span></div>`).join("")}</div><p class="demo-empty">The full system reranks tracks using the patient's listening profile and recorded responses.</p>`;
    });
  },
};

demos[project.demo]();

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
