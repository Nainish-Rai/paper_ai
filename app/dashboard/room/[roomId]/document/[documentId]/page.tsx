import DocumentPageClient from "./documentPage";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ roomId: string; documentId: string }>;
}) {
  const { roomId, documentId } = await params;
  return <DocumentPageClient roomId={roomId} documentId={documentId} />;
}
