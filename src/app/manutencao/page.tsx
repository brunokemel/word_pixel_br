import type { Metadata } from "next";
import { MaintenanceContent } from "./maintenance-content";

export const metadata: Metadata = {
  title: "Manutenção — World Pixel",
  description: "O World Pixel está passando por uma manutenção programada.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return <MaintenanceContent />;
}
