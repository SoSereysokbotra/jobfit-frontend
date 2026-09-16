// src/app/(marketing)/terms/page.tsx
//
// Structured to the Legal Decision Framework (jobfit-backend, root
// JOBFIT_LEGAL_DECISION_FRAMEWORK.md). Section numbers the framework's deliverables
// reference — Candidate §6.1 and §7.3, Employer §4.2, §4.3, §5.1, §6.4, Platform §9.3 —
// are the section numbers used here, so a deliverable points at a real paragraph.
//
// D11 (billing) and D12 (refunds) are answered by a fact, not a policy: there is no
// payments backend (payment.api.ts, "the Stripe webhook route is a stub"), so the page
// states that nothing is charged and that billing/refund terms will be published and
// re-accepted before any charge is ever taken. D16 takes the framework's own engineering
// recommendation (Cambodian law, Phnom Penh, English authoritative).

import React from "react";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/features/marketing/components/legal-page";

export const metadata = {
  title: "Terms of Service | JobFits",
  description:
    "The terms for job seekers and employers using JobFits — what match scores mean, what AI drafts are, and what each side is responsible for.",
};

const TOC = [
  { id: "agreement", label: "The agreement" },
  { id: "accounts", label: "Accounts" },
  { id: "seekers", label: "Job seekers — what JobFits is and is not" },
  { id: "scores", label: "Match scores (§6)" },
  { id: "ai-drafts", label: "AI-generated drafts (§7)" },
  { id: "external", label: "External job listings and takedowns (§9)" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "employers", label: "Employers — additional terms (§4–§6)" },
  { id: "prohibited", label: "Annex A — prohibited listings and practices" },
  { id: "liability", label: "Liability" },
  { id: "law", label: "Governing law and language" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms govern your use of JobFits — the web application, the browser extension, and the employer tools. Job seekers and employers have different obligations; the employer section is marked. Please read the parts on match scores and AI drafts: they describe what the product is, and what it is not."
      toc={TOC}
    >
      <LegalSection id="agreement" title="1. The agreement">
        <p>
          By creating an account you agree to these terms and to the{" "}
          <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
          We record the time, version and originating IP address of your acceptance. The
          version you accepted is the one shown at the top of this page at that time.
        </p>
        <p>
          JobFits is operated by <strong>So Sereysokbotra</strong>, an individual operator
          based in Phnom Penh, Cambodia (&ldquo;JobFits&rdquo;, &ldquo;we&rdquo;). JobFits is
          not yet incorporated; if it is transferred to a company, that company will assume
          these terms and this page will be updated. You must be at least 18, or the age of
          majority where you live, to use it.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="2. Accounts">
        <p>
          You are responsible for keeping your credentials private and for everything done
          under your account. Repeated failed logins will lock the account temporarily. You
          may close your account at any time as described in the Privacy Policy §7.
        </p>
        <p>
          Employer accounts are created only after JobFits has reviewed and approved an
          employer request. See §8.
        </p>
      </LegalSection>

      <LegalSection id="seekers" title="3. Job seekers — what JobFits is and is not">
        <p>
          JobFits is a <strong>career-navigation tool for you</strong>. It reads the résumé
          and preferences you give it, finds job postings that appear to fit, explains why,
          and helps you prepare applications. It is decision <em>support</em>: it informs
          your choices and, where an employer uses JobFits, informs theirs.
        </p>
        <p>
          JobFits is <strong>not an employment agency</strong>, does not employ you, does not
          hire on anyone&rsquo;s behalf, and does not guarantee that any application will
          result in an interview, an offer, or a job.
        </p>
        <p>
          <strong>Safety.</strong> Employers on JobFits are reviewed before they can post,
          but JobFits cannot verify every representation an employer makes. Never send
          money, bank details, identity documents or passwords to an employer as a
          condition of applying. A legitimate employer will not ask. Report any posting that
          does.
        </p>
      </LegalSection>

      <LegalSection id="scores" title="4. Match scores (Candidate Terms §6)">
        <p id="s6-1">
          <strong>§6.1 What a score is.</strong> A match percentage is an algorithmic
          approximation of how closely the wording of your profile and résumé overlaps with a
          job posting (&ldquo;role fit&rdquo;), combined with how well the posting fits the
          preferences you told us — location, work arrangement, employment type, level and
          salary (&ldquo;preference fit&rdquo;). It reflects <strong>semantic overlap between
          two documents</strong>. It does not measure your ability, does not rank you against
          other people, and does not predict hiring outcomes.
        </p>
        <p>
          <strong>§6.2 No guarantee.</strong> A high score is not a promise of an interview or
          employment. A low score is not a judgement of you; it most often means the
          posting conflicts with a preference you stated, and the explanation will say so.
        </p>
        <p>
          <strong>§6.3 Not calibrated.</strong> Scores are not a validated assessment. The
          number is designed to order your recommendations usefully; the confidence band
          (strong / possible / weak) is what we stand behind.
        </p>
      </LegalSection>

      <LegalSection id="ai-drafts" title="5. AI-generated drafts (Candidate Terms §7)">
        <p id="s7-3">
          <strong>§7.3 Drafts are drafts.</strong> Cover letters, résumé sections, interview
          practice and similar output are generated by language models and are{" "}
          <strong>experimental drafting aids</strong>. They can contain inaccuracies —
          wrong dates, invented skills, misstated experience. You are responsible for
          reviewing, editing and verifying every statement before you send it to anyone.
          Submitting an unreviewed draft to an employer is your submission, not ours.
        </p>
        <p>
          <strong>§7.4 Your content.</strong> You own what you upload. You grant JobFits the
          licence needed to store it, parse it, match it and generate drafts from it for you.
          We do not use your résumé to train public AI models — see Privacy Policy §3.4.
        </p>
      </LegalSection>

      <LegalSection id="external" title="6. External job listings and takedowns (§9)">
        <p>
          <strong>§9.1 Listings from other sites.</strong> Many postings on JobFits are
          collected from public job boards and employer sites, or saved by you through the
          browser extension. JobFits shows them so you can be matched and sent to the source.
          Applying to such a job happens on the original site under its terms. JobFits is not
          a party to that application and does not represent that any external listing is
          accurate or still open.
        </p>
        <p>
          <strong>§9.2 The browser extension</strong> acts only on the page you are viewing,
          only when you invoke it. Use it in line with the terms of the site you are on; you
          are responsible for that compliance.
        </p>
        <p id="s9-3">
          <strong>§9.3 Takedown.</strong> If you are the publisher or subject of an external
          listing shown on JobFits and want it removed — because it is expired, inaccurate,
          or you did not authorise its display — contact us at the address in §12 with the
          listing URL. We will de-index a verified request within{" "}
          <strong>48 business hours</strong>.
        </p>
      </LegalSection>

      <LegalSection id="subscriptions" title="7. Subscriptions">
        <p>
          JobFits offers a free tier and paid tiers with additional features. Tier names,
          prices and what each includes are shown on the{" "}
          <Link href="/pricing" className="text-primary-600 hover:underline">pricing page</Link>.
        </p>
        <p>
          <strong>Beta — no charges.</strong> JobFits is in beta and <strong>does not
          currently take payment for anything</strong>. Paid tiers shown on the pricing page
          describe planned features and are not yet available for purchase. Every feature
          currently offered is provided free of charge.
        </p>
        <p>
          <strong>Before we charge.</strong> Before any payment is ever taken, we will
          publish billing terms and a refund and cancellation policy, and ask you to accept
          them explicitly. Nothing in this version of the terms authorises a charge.
        </p>
      </LegalSection>

      <LegalSection id="employers" title="8. Employers — additional terms (Employer Terms §4–§6)">
        <p>
          These sections apply to employer accounts in addition to everything above.
        </p>
        <p id="s4-2">
          <strong>§4.2 Human review is mandatory.</strong> You agree to review every
          application with a human decision-maker. Match scores shown to you are heuristic
          indicators to assist that review. You covenant that <strong>a JobFits score will
          not be the sole criterion</strong> for rejecting, filtering out, or declining to
          consider any applicant, and that you will not configure any automated process to
          take an adverse action on the basis of a JobFits score.
        </p>
        <p id="s4-3">
          <strong>§4.3 Scores are not aptitude tests.</strong> JobFits scores are not
          calibrated assessments and are not validated for any statutory or occupational
          purpose. You must not use them as a cut-off, threshold, or test result in any
          employment decision.
        </p>
        <p id="s5-1">
          <strong>§5.1 What screening output is.</strong> Any screening summary, requirement
          coverage, or comparison JobFits provides for an application is a{" "}
          <strong>document-comparison summary</strong> — a statement about how a
          candidate&rsquo;s submitted materials relate to your posting. JobFits makes no
          employment recommendation and no screening decision.
        </p>
        <p id="s6-4">
          <strong>§6.4 Candidate materials are unverified.</strong> JobFits does not verify
          the truthfulness of résumés, cover letters, or other materials candidates submit,
          including material drafted with JobFits&rsquo; AI tools. Verification is your
          responsibility.
        </p>
        <p>
          <strong>§6.5 Candidate data.</strong> When a candidate applies to your posting, you
          become an independent controller of the application data you receive. You agree
          to handle it lawfully, to use it only for the recruitment it was submitted for, and
          to delete it when that purpose ends.
        </p>
        <p>
          <strong>§6.6 Fees.</strong> Core job-posting features are currently provided
          without charge during beta. JobFits reserves the right to introduce paid listing
          tiers, promoted postings, or candidate-search fees on advance written notice.
        </p>
        <p>
          <strong>§6.7 Verification.</strong> To post, you must represent a legitimate legal
          entity and be authorised to recruit on its behalf. JobFits reviews employer
          requests before approval and may ask for evidence of business registration or a
          corporate email domain. You warrant that everything in your request and your
          postings is true.
        </p>
      </LegalSection>

      <LegalSection id="prohibited" title="9. Annex A — prohibited listings and practices">
        <p>
          The following may not be posted on JobFits. A posting or account in breach may be
          removed or suspended <strong>immediately and without notice</strong>.
        </p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Postings requiring candidates to pay upfront application, training, equipment or placement fees.</li>
          <li>Multi-level marketing, pyramid schemes, or speculative commission-only roles.</li>
          <li>Postings involving illegal activity, unlicensed gambling, adult entertainment, or human trafficking.</li>
          <li>&ldquo;Ghost jobs&rdquo; — postings intended to harvest résumés or contact details with no active hiring intent.</li>
          <li>Discriminatory listings that restrict applicants by gender, age, marital status, race or religion, except where a genuine occupational qualification recognised by law applies.</li>
          <li>Postings with deliberately false, misleading or deceptive compensation terms.</li>
        </ol>
      </LegalSection>

      <LegalSection id="liability" title="10. Liability">
        <p>
          JobFits is provided as is. To the fullest extent permitted by law, JobFits is not
          liable for hiring outcomes, for the conduct of employers or candidates, for the
          accuracy of external listings, or for the content of AI-generated drafts you choose
          to use. Nothing in these terms limits liability that cannot lawfully be limited.
        </p>
        <p>
          <strong>Cap.</strong> To the extent permitted by law, JobFits&rsquo; total liability
          to you for all claims arising from the service is limited to the amount you paid
          JobFits in the twelve months before the claim arose. While the service is free,
          that amount is zero. JobFits is not liable for indirect, consequential, or
          lost-opportunity damages, including a job not obtained.
        </p>
      </LegalSection>

      <LegalSection id="law" title="11. Governing law and language">
        <p>
          These terms are governed by the laws of the <strong>Kingdom of Cambodia</strong>.
          Any dispute that cannot be resolved between us will be brought before the competent
          courts of <strong>Phnom Penh</strong>. These terms are written in English; the
          English text is authoritative. A Khmer translation will be provided for
          convenience, and if the two differ, the English text governs.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p>
          Questions, takedown requests (§9.3) and reports of prohibited postings (Annex A):{" "}
          <a href="mailto:support@jobfits.io" className="text-primary-600 hover:underline">
            support@jobfits.io
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
