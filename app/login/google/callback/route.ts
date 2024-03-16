import { google, lucia } from "@/lib/lucia/auth";
import prisma from "@/lib/prismaClient";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { redirect } from "next/navigation";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }
  const savedCodeVerifier = cookies().get("codeVerifer")?.value;
  if (!savedCodeVerifier) {
    return new Response(null, {
      status: 400,
    });
  }
  try {
    const { accessToken, idToken, refreshToken, accessTokenExpiresAt } =
      await google.validateAuthorizationCode(code, savedCodeVerifier);
    const googleUserResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo ",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const googleUser: GoogleUser = await googleUserResponse.json();
    // console.log(googleUser);

    // Check existing user in prisma
    const existingUser = await prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const userId = generateId(15);

    // create new user
    await prisma.user.create({
      data: {
        id: userId,
        github_id: parseInt(userId),
        google_id: googleUser.id,
        username: googleUser.name,
        email: googleUser.email,
        image: googleUser.picture,
        name: googleUser.name,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect("/userdashboard");
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    console.error(e);
    return new Response(null, {
      status: 500,
    });
  }
}

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  picture: string;
  locale: string;
  username: string;
}
