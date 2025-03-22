"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BlockNoteEditor } from "@blocknote/core";
import {
  DOCXExporter,
  docxDefaultSchemaMappings,
} from "@blocknote/xl-docx-exporter";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import * as ReactPDF from "@react-pdf/renderer";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  editor: BlockNoteEditor;
  documentId: string;
}

export const ExportButton: FC<ExportButtonProps> = ({ editor, documentId }) => {
  const handleDocxExport = async () => {
    try {
      // Type assertion for the entire export process
      type ExporterType = {
        new (schema: any, mappings: any): {
          toDocxJsDocument: (doc: any) => Promise<any>;
        };
      };

      // Cast DOCXExporter to a more flexible type
      const TypeSafeExporter = DOCXExporter as ExporterType;

      // Create the exporter with type assertions
      const exporter = new TypeSafeExporter(
        editor.schema,
        docxDefaultSchemaMappings
      );

      // Convert the blocks to a docxjs document
      const docxDocument = await exporter.toDocxJsDocument(editor.document);

      // Generate the DOCX file
      const buffer = await Packer.toBuffer(docxDocument);

      // Convert buffer to blob
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Use file-saver to download the file
      saveAs(blob, `document-${documentId}.docx`);
    } catch (error) {
      console.error("Failed to export DOCX:", error);
    }
  };

  const handlePdfExport = async () => {
    try {
      // Create the PDF exporter
      const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

      // Convert the blocks to a react-pdf document
      const pdfDocument = await exporter.toReactPDFDocument(editor.document);

      // Generate PDF blob
      const blob = await ReactPDF.pdf(pdfDocument).toBlob();

      // Use file-saver to download the file
      saveAs(blob, `document-${documentId}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDocxExport}>
          Export as DOCX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePdfExport}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
