import { useEffect } from "react";
import { Link } from "react-router-dom";
import { actions, useGame } from "@/lib/gameState";

/**
 * Business details the owner must confirm. Every statement below the config is
 * verified against the code; these values are not. Links to /privacy stay hidden
 * until PRIVACY_READY is true.
 */
export const PRIVACY = {
  effectiveDate: "September 28, 2026",
  legalName: "Origami Escape LLC",
  contactEmail: "hello@origamiescape.com",
  address: "Seattle, Washington, USA",
  retentionEmail: "kept until you unsubscribe and ask us to delete it. We do not currently delete signup records automatically.",
  retentionFeedback: "kept until you ask us to delete them. We do not currently delete them automatically.",
  retentionAnalytics: "gameplay events are kept indefinitely and are not deleted automatically. Technical logs and backups are kept by our hosting provider under its own retention schedule.",
  audience: "The game is intended for players aged 14 and older. The companion is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us information, contact us and we will delete it.",
  saleStatement: "We do not sell personal information. The companion site does not share information for targeted advertising. Subscriber records held in our Shopify store are also processed by Shopify under its own privacy policy.",
  international: "We are based in Seattle, Washington, USA. Our backend stores gameplay events and the signup list on servers in Ireland (EU). Shopify and Google may process information in the United States and other countries. If you are in the EEA or UK, we rely on your consent for email updates (which you can withdraw at any time) and on our legitimate interest in operating and improving the game for gameplay events.",
};
export const PRIVACY_READY = Object.values(PRIVACY).every((v) => v.trim() !== "");

const T = ({ v, label }: { v: string; label: string }) =>
  v ? <>{v}</> : <mark className="bg-rule/20 text-ink px-1">[{label}]</mark>;

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-sm uppercase tracking-[0.2em] text-rule-text mt-8 mb-2">{children}</h2>
);
const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-display text-base font-medium text-ink mt-4 mb-1">{children}</h3>
);

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy — Echoes of the Market";
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = PRIVACY_READY ? "index,follow" : "noindex";
    return () => { robots?.remove(); };
  }, []);

  const email = <T v={PRIVACY.contactEmail} label="privacy contact email" />;
  const view = useGame((s) => s.view);
  // "/" restores the saved screen, so a player who opened the policy from a
  // puzzle would land back on that puzzle. Send them to the Market Log instead
  // (but don't disturb the welcome or finished screens).
  const returnToLog = () => { if (typeof view === "object") actions.go("log"); };

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <article className="mx-auto max-w-[680px] text-ink text-[17px] leading-relaxed [&_p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-2 [&_li]:mt-1">
        <Link to="/" className="font-display text-xs uppercase tracking-[0.2em] text-rule-text underline-offset-4 hover:underline inline-flex min-h-[44px] items-center">← Return to Market Log</Link>
        <h1 tabIndex={-1} className="font-display text-3xl font-medium tracking-[0.1em] mt-4">Privacy Policy</h1>
        <p><strong>Effective date: <T v={PRIVACY.effectiveDate} label="date" /></strong></p>

        <p>This Privacy Policy explains how <T v={PRIVACY.legalName} label="legal name, trading as Origami Escape" /> (“we,” “us,” or “our”) handles information when you use the Echoes of the Market companion at guide.echoesofthemarket.com.</p>
        <p>For privacy questions or requests, contact <strong>{email}</strong>.</p>

        <H2>Information we collect and how we use it</H2>
        <H3>Your Market Log</H3>
        <p>The companion saves your game in your browser so you can return to your journey: completed stalls, revealed hints, wrong-attempt counts, timer state, your current place in the game, your optional reaction, and whether you have signed up for updates. This saved game is not sent to us.</p>
        <p>Separately, the companion sends us gameplay events so we can see how the puzzles are working. These include when you start and finish, which puzzles you open, which hints you reveal, whether you reveal a solution, <strong>the text of each answer you submit</strong> and whether it was correct or close, your optional reaction, and which sharing, review, and feedback buttons you tap. Each event includes a random session ID (reset when you close the tab), your browser’s user-agent string, the page address, and the referring page. These events are not linked to your name or email.</p>
        <p>We use this information to operate the companion, maintain your game progress, and improve the puzzles and hints.</p>

        <H3>Email updates</H3>
        <p>If you subscribe to updates, we collect your email address to send news about Origami Escape games and upcoming adventures. Your email is stored in our own signup list and is also sent to our Shopify store (origamiescape.com) to be added as a subscriber.</p>
        <p>We have not yet chosen a service to send our emails. Before we begin sending, we will update this policy to name it and explain whether it measures email opens or clicks.</p>
        <p>Signing up is optional. You can unsubscribe using the link in our emails or by contacting us at the address above; we will then update both our Shopify store and our own signup list.</p>

        <H3>Messages and feedback</H3>
        <p>If you contact us or send feedback, we receive the information you choose to include, such as your email address and message. We use it to respond, provide support, and improve the game.</p>

        <H3>Technical information</H3>
        <p>When your browser loads the companion and communicates with our servers, our hosting and backend providers receive standard request information such as your IP address, browser and device information, the pages and resources requested, and timestamps. This is used to deliver the site, keep it secure, and diagnose errors. The page’s fonts are loaded from Google Fonts, so Google also receives your IP address and browser information when fonts load.</p>

        <H2>Browser storage, cookies, and tracking</H2>
        <p>The companion uses your browser’s local storage to remember your saved game, your optional reaction, and your signup status, and session storage to hold the random analytics session ID. Player pages do not set cookies.</p>
        <p>You can clear browser-stored information through your browser settings or with “Reset Game” in the menu. “Reset Game” removes your saved progress, timer, reaction, and signup status from this browser; it does not delete information already sent to us — email us for that.</p>
        <p>We do not use advertising cookies, tracking pixels, or third-party analytics services. The gameplay events described above are collected by us for our own use. We do not currently respond differently to Do Not Track signals. Apart from Google Fonts and our service providers listed below, we do not allow third parties to collect information about you on the companion.</p>

        <H2>When we share information</H2>
        <p>We use service providers to help operate the companion and communicate with players:</p>
        <ul>
          <li><strong>Website hosting and backend:</strong> Lovable, which hosts the site and stores gameplay events and the signup list.</li>
          <li><strong>Email subscriptions:</strong> Shopify (email address and subscription status).</li>
          <li><strong>Fonts:</strong> Google Fonts (IP address and browser information when fonts load).</li>
        </ul>
        <p><T v={PRIVACY.saleStatement} label="sale / sharing / targeted-advertising statement" /></p>
        <p>We may also disclose information when required by law or when reasonably necessary to protect our users, services, or legal rights.</p>

        <H2>Sharing your completion card</H2>
        <p>The companion lets you create a completion card containing your final time and game artwork. The card is created on your device and contains no answers, hints, or personal information.</p>
        <p>When you choose to share a card or link through another app or service, that service handles the information under its own privacy policy. Please review the card and your chosen destination before sharing.</p>

        <H2>How long we keep information</H2>
        <ul>
          <li><strong>Game information stored in your browser:</strong> kept until you choose “Reset Game” or clear your browser’s storage. The analytics session ID is removed when you close the tab.</li>
          <li><strong>Email subscription information:</strong> <T v={PRIVACY.retentionEmail} label="retention period" /></li>
          <li><strong>Support messages and feedback:</strong> <T v={PRIVACY.retentionFeedback} label="retention period" /></li>
          <li><strong>Gameplay events and technical logs:</strong> <T v={PRIVACY.retentionAnalytics} label="retention period" /></li>
        </ul>

        <H2>Your choices and privacy rights</H2>
        <p>You can unsubscribe from marketing emails, clear information stored in your browser, and contact us with questions about your information.</p>
        <p>Depending on where you live and the laws that apply, you may also have rights to access, correct, delete, or receive a copy of your personal information, or to object to or restrict certain uses.</p>
        <p>To make a request, email <strong>{email}</strong>. We may need to verify your identity before fulfilling a request. We will respond as required by applicable law.</p>

        <H2>Children’s privacy</H2>
        <p><T v={PRIVACY.audience} label="intended age group and practices" /></p>

        <H2>International visitors</H2>
        <p><T v={PRIVACY.international} label="where you are based, where data is processed, and any EEA/UK details" /></p>

        <H2>Other websites</H2>
        <p>The companion may link to our store, social profiles, or other websites. Their privacy practices may differ. This policy covers the companion site; please review the policy provided by any other service you use.</p>

        <H2>Changes to this policy</H2>
        <p>We may update this policy as our services or information practices change. We will post the revised version here and update the effective date. Where required, we will provide additional notice or request consent.</p>

        <H2>Contact</H2>
        <p><strong><T v={PRIVACY.legalName} label="legal name / Origami Escape" /></strong><br />
          Email: {email}<br />
          Business contact address: <T v={PRIVACY.address} label="address" /></p>
      </article>
    </main>
  );
};

export default Privacy;
