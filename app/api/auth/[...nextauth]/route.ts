import { authOptions } from "@/lib/auth/config";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

// Handle both GET and POST requests
export { handler as GET, handler as POST };
