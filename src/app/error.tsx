"use client";

import { FullPageError } from "@/components/error-ui";
import { toErrorUi } from "@/lib/error-ux";
import { ApiError } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const error = toErrorUi(new ApiError("INTERNAL_ERROR", "render error"), { page: true });
  return <FullPageError error={error} onRetry={reset} onBack={() => router.push("/")} />;
}
