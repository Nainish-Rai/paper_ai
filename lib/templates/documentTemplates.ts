import { DefaultBlockSchema, PartialBlock } from "@blocknote/core";

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: PartialBlock<DefaultBlockSchema>[];
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "blank",
    name: "Blank Document",
    description: "Start with a clean slate",
    icon: "file",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "", styles: {} }],
      },
    ],
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Template for meeting minutes and action items",
    icon: "clipboard-list",
    content: [
      {
        type: "heading",
        content: [{ type: "text", text: "Meeting Notes - [Date]", styles: {} }],
        props: { level: 1 },
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Attendees", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "", styles: {} }],
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Agenda", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "", styles: {} }],
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Discussion Points", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "", styles: {} }],
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Action Items", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "checkListItem",
        content: [{ type: "text", text: "", styles: {} }],
      },
    ],
  },
  {
    id: "project-plan",
    name: "Project Plan",
    description: "Outline your project goals and milestones",
    icon: "target",
    content: [
      {
        type: "heading",
        content: [{ type: "text", text: "Project Plan", styles: {} }],
        props: { level: 1 },
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Overview", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "", styles: {} }],
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Goals", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "", styles: {} }],
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Milestones", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "", styles: {} }],
      },
      {
        type: "heading",
        content: [{ type: "text", text: "Timeline", styles: {} }],
        props: { level: 2 },
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "", styles: {} }],
      },
    ],
  },
];
