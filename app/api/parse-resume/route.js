// Resume import: extract text from an uploaded PDF/DOCX, then split the work
// by field type instead of a rules-first/LLM-fallback cascade —
// deterministic regex for the handful of fields that have an unambiguous
// format (email, GitHub, LinkedIn), and the LLM for everything that requires
// actually understanding unstructured prose (experience, projects, etc.).
// Regex can't reliably do the latter regardless of how "clean" the resume
// looks, so there's no real fallback decision to make.

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function extractContactInfo(text) {
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "";
  const github = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i)?.[0] || "";
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i)?.[0] || "";
  return { email, github, linkedin };
}

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    role: { type: Type.STRING, description: "Current or most recent job title" },
    bio: {
      type: Type.STRING,
      description: "2-3 sentence first-person professional summary, based only on what's in the resume",
    },
    website: {
      type: Type.STRING,
      description: "Personal website or portfolio URL, if present. Empty string if none — do not guess.",
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    codingProfiles: {
      type: Type.ARRAY,
      description: "Competitive programming / coding profiles, e.g. LeetCode, Codeforces, HackerRank, Kaggle",
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          url: { type: Type.STRING },
        },
        required: ["platform", "url"],
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          start: { type: Type.STRING },
          end: { type: Type.STRING, description: "Use 'Present' for the current role" },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["company", "role"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          start: { type: Type.STRING },
          end: { type: Type.STRING },
        },
        required: ["school"],
      },
    },
    achievements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Awards, certifications, publications, or other notable recognitions",
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Technologies used" },
          link: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name"],
      },
    },
  },
  required: ["name", "skills", "codingProfiles", "experience", "education", "achievements", "projects"],
};

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Resume import isn't set up yet — the server is missing a GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("resume");
  if (!file || typeof file === "string") {
    return Response.json({ error: "No resume file was uploaded." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json({ error: "That file is too large — please upload a resume under 5MB." }, { status: 400 });
  }

  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  let text = "";
  try {
    if (fileName.endsWith(".pdf")) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      text = result.text;
    } else if (fileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return Response.json(
        { error: "Unsupported file type — please upload a PDF or DOCX resume." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("resume text extraction failed:", err);
    return Response.json(
      { error: "Couldn't read that file — it may be corrupted or password-protected." },
      { status: 400 }
    );
  }

  if (!text || text.trim().length < 40) {
    return Response.json(
      {
        error:
          "Couldn't find readable text in that file — if it's a scanned image rather than a text-based resume, this won't work.",
      },
      { status: 400 }
    );
  }

  const contact = extractContactInfo(text);

  let extracted;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract structured portfolio data from this resume text. Only use information actually present in the text — never invent companies, dates, numbers, or achievements. Leave a field as an empty string or empty array if the resume doesn't contain it.\n\n---\n${text}\n---`,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
      },
    });
    extracted = JSON.parse(response.text);
  } catch {
    return Response.json(
      { error: "The resume parser is temporarily unavailable — please try again in a moment." },
      { status: 502 }
    );
  }

  const data = {
    name: extracted.name || "",
    role: extracted.role || "",
    bio: extracted.bio || "",
    email: contact.email,
    links: {
      github: contact.github,
      linkedin: contact.linkedin,
      website: extracted.website || "",
    },
    skills: extracted.skills || [],
    codingProfiles: (extracted.codingProfiles || []).map((profile) => ({
      platform: profile.platform || "",
      url: profile.url || "",
    })),
    experience: (extracted.experience || []).map((job) => ({
      company: job.company || "",
      role: job.role || "",
      start: job.start || "",
      end: job.end || "",
      bullets: job.bullets || [],
    })),
    education: (extracted.education || []).map((edu) => ({
      school: edu.school || "",
      degree: edu.degree || "",
      start: edu.start || "",
      end: edu.end || "",
    })),
    achievements: extracted.achievements || [],
    projects: (extracted.projects || []).map((project) => ({
      name: project.name || "",
      version: "",
      status: "Active",
      image: "",
      description: project.description || "",
      tags: project.tags || [],
      link: project.link || "",
      demo: "",
      highlights: project.highlights || [],
    })),
  };

  return Response.json({ data });
}
