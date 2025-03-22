import DocumentPageClient from "./documentPage";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return <DocumentPageClient documentId={documentId} />;
}
