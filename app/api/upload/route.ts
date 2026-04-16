// Vercel Blob client-upload token endpoint.
// The browser uploads directly to Blob (bypasses server memory limits).
// Docs: https://vercel.com/docs/vercel-blob/client-upload

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "video/x-msvideo",
        ],
        maximumSizeInBytes: 1024 * 1024 * 1024, // 1 GB
      }),
      onUploadCompleted: async ({ blob }: { blob: { url: string; pathname: string; size?: number } }) => {
        console.log(`[atlas/upload] complete path=${blob.pathname} size=${blob.size ?? "?"} ms=${Date.now() - start}`);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`[atlas/upload] error ms=${Date.now() - start}`, msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
