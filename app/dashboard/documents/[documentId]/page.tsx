import DocumentPageClient from "./documentPage";

export default async function DocumentPage({
  params,
}: {
  params: { documentId: string };
}) {
  const { documentId } = await params;
  return <DocumentPageClient documentId={documentId} />;
}
