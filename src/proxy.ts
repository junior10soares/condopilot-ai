import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/residents/:path*",
    "/reservations/:path*",
    "/agent/:path*",
    "/security/:path*",
    "/quality/:path*",
    "/settings/:path*",
  ],
};
