import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

// Get the correct upload path based on environment
function getUploadBasePath(): string {
  if (process.env.UPLOAD_PATH) {
    return process.env.UPLOAD_PATH;
  }
  
  if (process.env.NODE_ENV === "production") {
    const cwd = process.cwd();
    if (cwd.includes("/nodejs")) {
      return cwd.replace("/nodejs", "/public_html");
    }
    return join(cwd, "public");
  }
  
  return join(process.cwd(), "public");
}

export async function GET() {
  const basePath = getUploadBasePath();
  const uploadsPath = join(basePath, "uploads");
  const imagesPath = join(basePath, "uploads", "images");
  
  const checks = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      UPLOAD_PATH: process.env.UPLOAD_PATH || "not set",
    },
    cwd: process.cwd(),
    paths: {
      basePath,
      uploadsPath,
      imagesPath,
      baseExists: existsSync(basePath),
      uploadsExists: existsSync(uploadsPath),
      imagesExists: existsSync(imagesPath),
    },
    supabase: {
      connected: false,
      error: null as string | null,
    },
    testPost: {
      found: false,
      error: null as string | null,
    },
  };

  // Test Supabase connection
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug")
      .limit(1)
      .single();

    if (error) {
      checks.supabase.error = error.message;
    } else {
      checks.supabase.connected = true;
      checks.testPost.found = !!data;
    }
  } catch (err) {
    checks.supabase.error = err instanceof Error ? err.message : "Unknown error";
  }

  // Test specific post query (the one from the URL)
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        slug,
        creator:creators!inner (
          id,
          username
        )
      `)
      .eq("slug", "heres-a-clear-breakdown-of-cloudflare-r2-object-storage-pric")
      .single();

    if (error) {
      checks.testPost.error = error.message;
    } else {
      checks.testPost.found = !!data;
    }
  } catch (err) {
    checks.testPost.error = err instanceof Error ? err.message : "Unknown error";
  }

  return NextResponse.json(checks, { status: 200 });
}
