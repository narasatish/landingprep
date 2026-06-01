export type TestEntry = {
  id: string;
  title: string;
  exam: string;
  section?: string;
  type: "full" | "section";
  durationSeconds: number;
  questionCount?: number;
  sectionCount?: number;
  file: string;
  version: number;
};

export async function loadManifest() {
  const res = await fetch("/content/manifest.json");
  if (!res.ok) throw new Error("Unable to load question-bank manifest");
  return res.json();
}

export async function loadTest(file: string) {
  const res = await fetch(`/content/${file}`);
  if (!res.ok) throw new Error(`Unable to load test: ${file}`);
  return res.json();
}
