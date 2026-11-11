"use client";

import Image from "next/image";
import maintenanceAnimation from "@/logo/manutencao.gif";
import logoMaior from "@/logo/logoMaior.png";
import { useI18n } from "@/lib/i18n";

export function MaintenanceContent() {
  const { t } = useI18n();
  return <main className="maintenance-page"><div className="maintenance-glow" aria-hidden="true" /><section className="maintenance-card" aria-labelledby="maintenance-title"><Image className="maintenance-logo" src={logoMaior} alt="World Pixel" priority /><div className="maintenance-animation-wrap"><Image className="maintenance-animation" src={maintenanceAnimation} alt={t("maintenance.alt")} priority unoptimized /></div><span className="eyebrow">{t("maintenance.eyebrow")}</span><h1 id="maintenance-title">{t("maintenance.title")}</h1><p>{t("maintenance.description")}</p><div className="maintenance-progress" role="progressbar" aria-label={t("maintenance.progress")} aria-valuetext={t("maintenance.inProgress")}><span /></div><small>{t("maintenance.note")}</small></section></main>;
}
