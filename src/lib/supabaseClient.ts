import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bxzagqaxmcahrcorvxco.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4emFncWF4bWNhaHJjb3J2eGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzE1MjcsImV4cCI6MjEwMjI0NzUyN30.k6xVxclf1NypkY_5rb2nvL5md5Etp85uGpJpGvwCgBw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
