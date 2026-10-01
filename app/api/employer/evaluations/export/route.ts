import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const destination = new URL(
    `/api/employer/export${new URL(request.url).search}`,
    request.url,
  )
  return NextResponse.redirect(destination)
}
