import sendEmail from "@/app/actions/sendEmail";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export const config = {
  runtime: "edge",
};

export async function POST(request: NextRequest) {
  try {
    // const ip =
    //   request.headers.get("x-forwarded-for") ||
    //   request.headers.get("x-real-ip") ||
    //   "unknown";

    const ip = request.ip ?? "127.0.0.1";

    console.log("ip: ", ip);

    // Check the rate limit
    const { limit, reset, remaining } = await ratelimit.limit(ip);

    if (remaining === 0) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const data = await request.json();

    // await sendEmail(data);
    console.log("dataxxx: ", data);
    return NextResponse.json({ hello: "post" });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}