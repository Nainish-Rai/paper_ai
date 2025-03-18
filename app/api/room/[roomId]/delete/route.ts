import { z } from "zod";
import prisma from "@/lib/prismaClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Get room and associated documents
    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: {
        documents: true,
      },
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    if (room.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Only room owner can delete the room" },
        { status: 403 }
      );
    }

    // Delete all documents in the room
    await prisma.document.deleteMany({
      where: { roomId: params.roomId },
    });

    // Delete the room
    await prisma.room.delete({
      where: { id: params.roomId },
    });

    // Delete room from LiveBlocks
    await fetch(`https://api.liveblocks.io/v2/rooms/${params.roomId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET}`,
      },
    });

    // Also delete LiveBlocks rooms for each document (they have format roomId:documentId)
    for (const document of room.documents) {
      await fetch(
        `https://api.liveblocks.io/v2/rooms/${params.roomId}:${document.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET}`,
          },
        }
      ).catch(console.error); // Don't fail if a document room doesn't exist
    }

    return NextResponse.json(
      {
        message: "Room and all associated documents deleted successfully",
        deletedDocuments: room.documents.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ROOM_DELETE]", error);
    return NextResponse.json(
      {
        message: "Failed to delete room",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
