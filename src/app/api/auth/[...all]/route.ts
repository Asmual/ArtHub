import { auth } from "@/lib/auth"; 
import { toNextJsHandler } from "better-auth/next-js";

// Correct: Only export server-side GET and POST handlers
export const { POST, GET } = toNextJsHandler(auth);