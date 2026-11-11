"use client";

import { FullPageError } from "@/components/error-ui";
import { toErrorUi } from "@/lib/error-ux";
import { ApiError } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return <FullPageError error={toErrorUi(new ApiError("NOT_FOUND", "not found", undefined, 404), { page: true })} onBack={() => router.push("/")} />;
}
