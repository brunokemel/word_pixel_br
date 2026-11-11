import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import logoMaior from "@/logo/logoMaior.png";

export const metadata: Metadata = {
  title: "Sobre, termos e privacidade — World Pixel",
  description: "Conheça o World Pixel, as regras da comunidade, os termos de uso e como tratamos dados pessoais.",
};

const sections = [
  ["sobre", "Sobre"],
  ["termos", "Termos de uso"],
  ["comunidade", "Diretrizes da comunidade"],
  ["privacidade", "Privacidade"],
  ["denuncias", "Denúncias e direitos autorais"],
  ["menores", "Proteção de menores"],
] as const;

export default function AboutPage() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link href="/" aria-label="Voltar ao mapa"><Image src={logoMaior} alt="World Pixel" priority /></Link>
        <Link className="legal-back" href="/">Voltar ao mapa</Link>
      </header>

      <div className="legal-hero">
        <span className="eyebrow">UM MAPA · MILHÕES DE HISTÓRIAS</span>
        <h1>Um espaço global para criar com respeito.</h1>
        <p>Esta página reúne o propósito do World Pixel, as condições de uso, as regras da comunidade e nossos compromissos de privacidade.</p>
        <small>Última atualização: 10 de novembro de 2026</small>
      </div>

      <div className="legal-layout">
        <nav className="legal-nav" aria-label="Nesta página">
          <strong>Nesta página</strong>
          {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>

        <article className="legal-content">
          <aside className="legal-notice">
            <strong>Versão inicial</strong>
            <p>Estas regras formam a base pública do serviço. A identificação completa do responsável legal e o canal jurídico/privacidade devem ser inseridos antes do lançamento comercial.</p>
          </aside>

          <section id="sobre">
            <span className="legal-index">01</span>
            <h2>Sobre o World Pixel</h2>
            <p>O World Pixel é um mapa-múndi colaborativo. Visitantes podem explorar o mapa e pessoas autenticadas podem pintar células terrestres, acompanhar mudanças, denunciar conteúdo e, quando disponível, usar créditos para proteger áreas por prazo determinado.</p>
            <p>Nenhuma pessoa é proprietária de uma parte geográfica real por pintar ou proteger pixels. O mapa é uma obra digital comunitária e suas células podem mudar conforme as regras do produto.</p>
          </section>

          <section id="termos">
            <span className="legal-index">02</span>
            <h2>Termos de uso</h2>
            <h3>Conta e segurança</h3>
            <p>Você deve fornecer um e-mail ao qual tenha acesso, proteger seus códigos de autenticação e responder pelas atividades realizadas em sua conta. Não é permitido vender, transferir, automatizar ou compartilhar contas para contornar limites e sanções.</p>
            <h3>Conteúdo e licença</h3>
            <p>Você continua responsável pelo que cria. Ao publicar pixels, nomes ou outras contribuições, concede ao World Pixel uma licença mundial, não exclusiva e gratuita para armazenar, reproduzir, exibir, adaptar tecnicamente e moderar esse conteúdo apenas para operar, divulgar e proteger o serviço.</p>
            <h3>Créditos e proteções</h3>
            <p>Créditos são unidades de uso interno e não representam propriedade sobre território, investimento, depósito bancário ou moeda de curso legal. Preço, duração, disponibilidade, reembolso e regras aplicáveis devem ser mostrados antes de qualquer compra. Funcionalidades pagas só serão oferecidas quando o fluxo de pagamento estiver oficialmente habilitado.</p>
            <h3>Disponibilidade e alterações</h3>
            <p>Podemos corrigir falhas, limitar abusos, modificar funcionalidades e interromper partes do serviço por segurança ou manutenção. Faremos esforços razoáveis para preservar dados, mas não garantimos disponibilidade contínua nem permanência de uma pintura específica.</p>
            <h3>Lei aplicável</h3>
            <p>Estes termos têm como base as leis da República Federativa do Brasil. Essa escolha não elimina direitos obrigatórios de consumidores e titulares de dados previstos pela legislação aplicável no local onde o serviço for legalmente oferecido.</p>
          </section>

          <section id="comunidade">
            <span className="legal-index">03</span>
            <h2>Diretrizes da comunidade</h2>
            <p>Crie, colabore e dispute espaços sem atacar pessoas. É proibido publicar ou coordenar:</p>
            <ul>
              <li>conteúdo sexual explícito, especialmente qualquer material envolvendo menores;</li>
              <li>ódio, discriminação, extremismo, símbolos usados para intimidar ou desumanizar grupos;</li>
              <li>ameaças, assédio, exposição de dados pessoais ou incentivo à violência;</li>
              <li>fraudes, phishing, links maliciosos, spam ou tentativa de se passar por outra pessoa;</li>
              <li>violação de direitos autorais, marcas, imagem ou outros direitos de terceiros;</li>
              <li>bots, scripts, vandalismo coordenado ou exploração de falhas para obter vantagem;</li>
              <li>tentativas de evitar bloqueios, limites, moderação ou proteções ativas.</li>
            </ul>
            <p>Podemos remover conteúdo, desfazer ações, restringir recursos, suspender ou encerrar contas conforme gravidade, contexto e reincidência. Quando adequado, oferecemos oportunidade de contestação. A proteção de uma área não impede moderação.</p>
          </section>

          <section id="privacidade">
            <span className="legal-index">04</span>
            <h2>Política de privacidade</h2>
            <h3>Dados tratados</h3>
            <p>Podemos tratar e-mail, identificador de conta, nome de artista, avatar, endereço IP, dispositivo, idioma, registros de acesso, sessão, pinturas, proteções, saldo, transações internas, denúncias e comunicações de suporte.</p>
            <h3>Por que usamos esses dados</h3>
            <p>Usamos os dados para autenticar usuários, operar o mapa, manter segurança, prevenir fraude e abuso, processar solicitações, moderar conteúdo, cumprir obrigações legais e melhorar o serviço. Cada tratamento deve se apoiar em uma base legal adequada, incluindo execução do serviço, legítimo interesse, cumprimento legal ou consentimento quando exigido.</p>
            <h3>Fornecedores e transferências</h3>
            <p>Serviços como Supabase, Vercel e Render podem processar dados para autenticação, banco de dados, hospedagem e entrega do produto. Como esses fornecedores podem operar em outros países, dados podem ser transferidos internacionalmente com salvaguardas compatíveis com a legislação aplicável.</p>
            <h3>Retenção e segurança</h3>
            <p>Mantemos dados pelo tempo necessário às finalidades informadas, à segurança, à defesa de direitos e às obrigações legais. Adotamos controles técnicos e organizacionais proporcionais ao risco, mas nenhum sistema conectado à internet é absolutamente invulnerável.</p>
            <h3>Seus direitos</h3>
            <p>Conforme a lei aplicável, você pode pedir confirmação e acesso, correção, informações sobre compartilhamento, oposição, portabilidade, revisão de decisões automatizadas e eliminação ou anonimização quando cabível. Solicitações são gratuitas, mas poderemos confirmar a identidade do solicitante.</p>
            <h3>Cookies e armazenamento local</h3>
            <p>Podemos usar cookies ou armazenamento local estritamente necessários para sessão, segurança, preferência de idioma e funcionamento. Tecnologias de publicidade ou análise não essencial, se adotadas, serão informadas e submetidas a consentimento quando exigido.</p>
          </section>

          <section id="denuncias">
            <span className="legal-index">05</span>
            <h2>Denúncias e direitos autorais</h2>
            <p>Use a opção “Denunciar” no detalhe do pixel para informar conteúdo sexual, ódio, discriminação, assédio, ameaça, violência, spam, vandalismo ou outro problema. Descreva o motivo com boa-fé e detalhes suficientes para análise.</p>
            <p>Reclamações sobre direitos autorais ou marca devem identificar o titular, a obra ou direito protegido, o conteúdo contestado, sua localização no mapa, dados de contato e uma declaração de boa-fé. A pessoa afetada poderá apresentar contestação. Denúncias falsas, automatizadas ou abusivas também podem gerar restrições.</p>
            <p>Quando houver risco imediato à vida ou indício de crime, procure as autoridades competentes; o formulário de moderação não substitui serviços de emergência.</p>
          </section>

          <section id="menores">
            <span className="legal-index">06</span>
            <h2>Proteção de menores</h2>
            <p>O serviço não é destinado a menores de 13 anos. Usuários entre 13 anos e a maioridade aplicável devem utilizar o serviço com autorização e supervisão de responsável legal quando exigido. Não solicitamos intencionalmente dados sensíveis de crianças.</p>
            <p>Se recebermos informação confiável de uso indevido por criança ou de risco a um menor, poderemos remover conteúdo, limitar a conta e excluir dados, respeitando obrigações de preservação legal e proteção da pessoa envolvida.</p>
          </section>

          <section id="contato" className="legal-contact">
            <span className="legal-index">07</span>
            <h2>Contato e mudanças</h2>
            <p>Publicaremos aqui alterações relevantes e atualizaremos a data desta página. Mudanças materiais poderão ser comunicadas dentro do produto.</p>
            <p><strong>Pendente antes do lançamento comercial:</strong> informar nome ou razão social do controlador, país/endereço de referência e e-mail dedicado para suporte, privacidade, recursos e notificações jurídicas.</p>
          </section>
        </article>
      </div>

      <footer className="legal-footer">
        <span>World Pixel · feito para criar em conjunto</span>
        <Link href="/">Explorar o mapa</Link>
      </footer>
    </main>
  );
}
