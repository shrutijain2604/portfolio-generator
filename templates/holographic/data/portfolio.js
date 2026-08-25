// THIS FILE IS YOUR PORTFOLIO. Everything on your site comes from here.
//
// Edit it, commit, and your site rebuilds itself a minute later. Text goes in
// "quotes", every list item ends with a comma, and an empty list hides that
// section. GitHub's History button keeps every previous version, so a bad edit
// is always undoable. Full guide: README.md

const portfolio = {
  name: "Ada Lovelace",
  role: "Full-Stack Engineer",
  bio: "I build fast, accessible web apps and occasionally write an algorithm a century ahead of the hardware it needs.",
  email: "ada@example.com",

  links: {
    github: "github.com/ada",
    linkedin: "linkedin.com/in/ada",
    website: "ada.dev",
  },

  // The order your sections appear in, top to bottom. Rearrange these lines
  // to rearrange the page. Anything you leave out gets added back at the end,
  // so a section can never go missing by accident.
  sectionOrder: ["skills", "codingProfiles", "experience", "education", "achievements", "projects"],

  skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Python"],

  codingProfiles: [
    { platform: "LeetCode", url: "leetcode.com/ada" },
    { platform: "Codeforces", url: "codeforces.com/profile/ada" },
  ],

  experience: [
    {
      company: "Analytical Engines Inc.",
      role: "Senior Engineer",
      start: "2023",
      end: "Present",
      bullets: [
        "Led migration to a distributed job scheduler, cutting batch runtime 40%",
        "Mentored 3 junior engineers through their first production incidents",
      ],
    },
    {
      company: "Babbage Systems",
      role: "Software Engineer",
      start: "2021",
      end: "2023",
      bullets: [
        "Built the first punched-card CI pipeline",
        "Shipped the internal design system used by 6 product teams",
      ],
    },
  ],

  education: [
    {
      school: "Stanford University",
      degree: "BSc Computer Science",
      start: "2015",
      end: "2019",
    },
  ],

  achievements: [
    "Speaker, Analytical Engines Conf 2024: \"Scheduling at Scale\"",
    "Runner-up, National Collegiate Programming Contest, 2018",
  ],

  projects: [
    {
      name: "notation-engine",
      version: "2.4.0",
      status: "Active",
      description:
        "A DSL for describing computational sequences, with a compiler that targets both JS and WASM.",
      tags: ["typescript", "compilers", "wasm"],
      link: "github.com/ada/notation-engine",
      demo: "notation-engine.dev",
      highlights: [
        "Custom parser and AST, no external parser-generator dependency",
        "WASM backend cut execution time 12x versus the JS interpreter",
      ],
    },
    {
      name: "diff-viewer",
      version: "1.0.3",
      status: "Active",
      description: "Lightweight side-by-side diff viewer for the browser, embeddable in 5 minutes.",
      tags: ["react", "dom"],
      link: "github.com/ada/diff-viewer",
      demo: "diff-viewer.ada.dev",
      highlights: ["Zero-dependency core, renders diffs for files up to 50k lines"],
    },
  ],
};

export default portfolio;
