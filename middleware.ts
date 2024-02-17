import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Customize your auth middleware configuration here if needed
  publicRoutes: ["/sign-in", "/sign-up", "/api/(.*)", "/"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
