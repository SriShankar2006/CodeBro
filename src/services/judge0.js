// src/services/judge0.js
import { supabase } from "./supabase";

export async function runCode({ sourceCode, language, stdin = "", idToken }) {
  if (!idToken) throw new Error("Your sign-in session expired. Please sign in again.");

  const { data, error } = await supabase.functions.invoke("jdoodle-runner", {
    body: { sourceCode, language, stdin },
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (error) {
    let message = error.message || "Code execution failed.";
    try {
      const response = await error.context?.json();
      message = response?.error || response?.message || message;
    } catch {
      // Keep the Functions client error when the response has no JSON body.
    }
    throw new Error(message);
  }
  if (!data) throw new Error("The compiler returned an empty response.");
  return data;
}
