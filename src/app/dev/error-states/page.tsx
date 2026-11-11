import { notFound } from "next/navigation";
import { ErrorStatesGallery } from "./error-states-gallery";

export default function ErrorStatesPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ErrorStatesGallery />;
}
