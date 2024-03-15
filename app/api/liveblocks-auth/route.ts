import { validateRequest } from "@/lib/lucia/auth";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

// Authenticating your Liveblocks application
// https://liveblocks.io/docs/rooms/authentication/access-token-permissions/nextjs

const SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
});

export async function POST(request: NextRequest) {
  // Get the current user's unique id from your database
  const userId = Math.floor(Math.random() * 10000);
  const { user } = await validateRequest();

  // Create a session for the current user
  // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
  const session = liveblocks.prepareSession(`user-${userId}`, {
    userInfo: user
      ? {
          name: user.username,
          color:
            colorsArray[Math.floor((Math.random() * 10) % colorsArray.length)],
          picture:
            user.image ||
            `https://liveblocks.io/avatars/avatar-${Math.floor(
              Math.random() * 6
            )}.png`,
        }
      : USER_INFO[Math.floor(Math.random() * 10) % USER_INFO.length],
  });

  // Give the user access to the room
  const { room } = await request.json();
  session.allow(room, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { body, status } = await session.authorize();
  return new Response(body, { status });
}

const colorsArray = [
  "#EFCFE1", // Soft Lavender
  "#FFD3B5", // Peachy Coral
  "#BAD7EC", // Sky Blue
  "#F0E099", // Light Golden Yellow
  "#C7EAA1", // Minty Green
  "#D0D9CF", // Cool Grayish Lilac
  "#F6CBCA", // Blush Pink
  "#A6D099", // Pistachio
  "#CBF0F1", // Baby Blue
  "#FCD3D0", // Salmon Pink
  "#EC99AA", // Warm Rose
  "#BADAC4", // Seafoam Green
  "#FBB78F", // Soft Apricot
  "#9CDBD9", // Turquoise Tint
  "#C490E4", // Vibrant Lilac
  "#F6D398", // Buttery Yellow
  "#89B5AF", // Muted Teal
  "#D1BFE7", // Periwinkle
  "#FFE5CF", // Cream Peach
  "#E2B3B4", // Dusty Rose
  "#9DD4CF", // Faded Sky Blue
  "#E6D69D", // Sandy Yellow
  "#BFDED8", // Pale Aqua
  "#F0A7B5", // Soft Coral Pink
];

const USER_INFO = [
  {
    name: "Charlie Layne",
    color: "#D583F0",
    picture: "https://liveblocks.io/avatars/avatar-1.png",
  },
  {
    name: "Mislav Abha",
    color: "#F08385",
    picture: "https://liveblocks.io/avatars/avatar-2.png",
  },
  {
    name: "Tatum Paolo",
    color: "#F0D885",
    picture: "https://liveblocks.io/avatars/avatar-3.png",
  },
  {
    name: "Anjali Wanda",
    color: "#85EED6",
    picture: "https://liveblocks.io/avatars/avatar-4.png",
  },
  {
    name: "Jody Hekla",
    color: "#85BBF0",
    picture: "https://liveblocks.io/avatars/avatar-5.png",
  },
  {
    name: "Emil Joyce",
    color: "#8594F0",
    picture: "https://liveblocks.io/avatars/avatar-6.png",
  },
  {
    name: "Jory Quispe",
    color: "#85DBF0",
    picture: "https://liveblocks.io/avatars/avatar-7.png",
  },
  {
    name: "Quinn Elton",
    color: "#87EE85",
    picture: "https://liveblocks.io/avatars/avatar-8.png",
  },
];
