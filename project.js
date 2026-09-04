const projects = {
  lunapill: {
    name: "Lunapill",
    year: "2026",
    summary: "A care navigator that helps newcomers find providers who match the way they need to be cared for.",
    tags: ["Python", "React", "FastAPI", "pgvector"],
    purpose: "Finding a doctor is already difficult. Language barriers, insurance uncertainty, immigration concerns, and cultural context make it harder. I built Lunapill to turn those needs into transparent search criteria instead of asking patients to decode a healthcare system that was not designed around them.",
    implementation: "I normalized public provider records, translated patient needs into structured filters, and built a ranking layer around language, coverage, location, and access preferences. Each result preserves the evidence behind its score and distinguishes reported facts from inferred matches and missing information.",
    challenge: "Combining incomplete public provider records with patient preferences without presenting uncertain data as fact. The system keeps reported facts, inferred matches, and missing information visibly separate.",
    learning: "Trust is part of the technical design. A useful ranking needs evidence, explanations, and a clear path for people to verify details before relying on a result.",
  },
  lionplan: {
    name: "LionPlan",
    year: "2026",
    summary: "A guided planner for building Columbia schedules now and mapping degree progress across future semesters.",
    tags: ["TypeScript", "Node.js", "Ollama", "Python", "AWS"],
    purpose: "Course planning usually means bouncing between catalogs, requirement pages, reviews, and a spreadsheet. LionPlan brings those decisions into one workspace so students can test schedules, notice conflicts, and understand how one semester affects the rest of their degree.",
    implementation: "I normalized course listings, meeting times, prerequisites, and degree requirements into a shared data model. The planning interface checks conflicts as schedules change, while the recommendation layer uses those constraints and student preferences to suggest viable alternatives.",
    challenge: "Representing prerequisites, time conflicts, requirements, and personal preferences together while keeping the interface responsive enough for rapid schedule changes.",
    learning: "Planning tools should support exploration, not make decisions for the user. The best suggestions expose constraints and tradeoffs while leaving the final choice legible and reversible.",
  },
  northstar: {
    name: "NorthStar",
    year: "2025",
    summary: "A retrieval and verification pipeline that makes answers from community knowledge easier to inspect and trust.",
    tags: ["Python", "Next.js", "Pinecone RAG", "NLI", "Ollama"],
    purpose: "Crowdsourced knowledge is often useful because it is specific and current, but it can also be contradictory or weakly sourced. NorthStar retrieves relevant claims, weighs source quality, checks agreement, and attaches citations so an answer can be evaluated instead of merely accepted.",
    implementation: "I embedded and indexed community data in Pinecone, retrieved passages by semantic relevance, and passed them through source weighting and NLI-based contradiction checks. A lightweight Qwen model then produces a concise answer bounded by the ranked evidence and its citations.",
    challenge: "Separating relevance from reliability. A highly similar passage is not necessarily strong evidence, so retrieval, source weighting, and contradiction checks have to remain distinct stages.",
    learning: "Good RAG systems are evidence systems first. Model choice matters less when retrieval quality, conflict handling, and citation boundaries are weak.",
  },
  chordcare: {
    name: "ChordCare",
    year: "2024",
    summary: "A music therapy recommender that learns from a patient's listening profile and therapeutic responses.",
    tags: ["Python", "Spotify API", "CNN / RF", "React"],
    purpose: "Music therapy is personal, but recommendations can become generic when they ignore a patient's existing relationship with music. ChordCare uses listening patterns and response labels to identify tracks that fit both musical preference and a chosen therapeutic direction.",
    implementation: "I used the Spotify API to collect listening histories and audio features, then trained CNN and random forest models against therapeutic response labels. The React interface turns the ranked predictions into recommendations and feeds new patient responses back into later results.",
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
