import { Template } from "@prisma/client";

export interface DefaultTemplate {
  name: string;
  description: string;
  content: string;
  categories: string[];
}

export const defaultTemplates: DefaultTemplate[] = [
  {
    name: "Blank Document",
    description: "Start with a clean slate",
    content: "",
    categories: ["basic"],
  },
  {
    name: "Meeting Notes",
    description: "Template for meeting minutes",
    content:
      "# Meeting Notes\n\n## Date:\n\n## Attendees:\n\n## Agenda:\n\n## Discussion Points:\n\n## Action Items:\n",
    categories: ["business", "notes"],
  },
];

/**
 * Merges database templates with default templates
 * Prioritizes user templates over defaults if names conflict
 */
export function mergeWithDefaultTemplates(
  dbTemplates: Template[]
): (Template | DefaultTemplate)[] {
  const dbTemplateNames = new Set(dbTemplates.map((t) => t.name));
  const filteredDefaults = defaultTemplates.filter(
    (t) => !dbTemplateNames.has(t.name)
  );
  return [...dbTemplates, ...filteredDefaults];
}
