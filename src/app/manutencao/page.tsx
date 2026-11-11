import type { Metadata } from "next";
import Image from "next/image";
import maintenanceAnimation from "@/logo/manutencao.gif";
import logoMaior from "@/logo/logoMaior.png";

export const metadata: Metadata = {
  title: "Manutenção — World Pixel",
  description: "O World Pixel está passando por uma manutenção programada.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="maintenance-page">
      <div className="maintenance-glow" aria-hidden="true" />
      <section className="maintenance-card" aria-labelledby="maintenance-title">
        <Image className="maintenance-logo" src={logoMaior} alt="World Pixel" priority />
        <div className="maintenance-animation-wrap">
          <Image
            className="maintenance-animation"
            src={maintenanceAnimation}
            alt="Personagem trabalhando na manutenção do World Pixel"
            priority
            unoptimized
          />
        </div>
        <span className="eyebrow">AJUSTANDO ALGUNS PIXELS</span>
        <h1 id="maintenance-title">Voltamos em breve.</h1>
        <p>Estamos fazendo melhorias para deixar o World Pixel mais estável e divertido. Tente novamente daqui a pouco.</p>
        <div
          className="maintenance-progress"
          role="progressbar"
          aria-label="Manutenção em andamento"
          aria-valuetext="Em andamento"
        >
          <span />
        </div>
        <small>Você não precisa atualizar sem parar — estaremos de volta assim que tudo estiver pronto.</small>
      </section>
    </main>
  );
}
