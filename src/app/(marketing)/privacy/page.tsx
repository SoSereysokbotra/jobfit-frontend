// src/app/(marketing)/privacy/page.tsx
//
// Structured to the Legal Decision Framework (jobfit-backend, root
// JOBFIT_LEGAL_DECISION_FRAMEWORK.md): D2 (AI boundary), D3 (governing standard), D4
// (employer relationship), D5 (retention), D6 (deletion), D7 (consent), D9 (extension),
// D20 (training rights). Section numbers referenced in that document are kept here so a
// deliverable like "Privacy Policy §3.4" points at something.
//
// EVERY TECHNICAL CLAIM ON THIS PAGE WAS CHECKED AGAINST CODE before it was written, and
// where the code does not yet do what the policy commits to, the page says "on request"
// or "being added" rather than describing a button that does not exist. A privacy policy
// that describes the product you wish you had is the single easiest way to make a false
// statement to every user at once.

import React from "react";
import Link from "next/link";
import { LegalPage, LegalSection, SITE_URL, SUPPORT_EMAIL } from "@/features/marketing/components/legal-page";

export const metadata = {
  title: "Privacy Policy | JobFits",
  description:
    "How JobFits collects, processes, stores and deletes your data — including exactly which AI providers see what.",
};

const TOC = [
  { id: "scope", label: "Who this policy covers" },
  { id: "collect", label: "What we collect" },
  { id: "ai", label: "How AI processes your data — and where" },
  { id: "use", label: "What we use your data for" },
  { id: "sharing", label: "Who we share it with" },
  { id: "retention", label: "How long we keep it" },
  { id: "deletion", label: "Deleting your account" },
  { id: "rights", label: "Your rights" },
  { id: "extension", label: "The browser extension" },
  { id: "security", label: "Security" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="JobFits is a job-matching platform. To match you with roles, we have to read your résumé and profile — so this document is specific about what we hold, which computers process it, and when it is deleted. Where a provider outside JobFits sees any of your data, it is named here by name."
      toc={TOC}
    >
      <LegalSection id="scope" title="1. Who this policy covers">
        <p>
          This policy applies to <strong>job seekers</strong> using the JobFits web
          application and browser extension, and to <strong>employer users</strong> who
          post roles and review applicants. Employers receive additional terms in the{" "}
          <Link href="/terms#employers" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>
          .
        </p>
        <p id="s1-2">
          <strong>§1.2 Governing standard.</strong> This policy is written to a single
          baseline of transparent consent, secure storage, and the right to withdraw and
          delete, applied to every user regardless of location. Users in the EEA, the United
          Kingdom and Singapore have additional statutory rights, set out in{" "}
          <em>Schedule 1</em> below.
        </p>
      </LegalSection>

      <LegalSection id="collect" title="2. What we collect">
        <p><strong>Account:</strong> email address, password (stored only as a hash), name, role (job seeker or employer), and subscription tier.</p>
        <p><strong>Profile:</strong> headline, city and country, preferred work arrangement, employment types and job levels, salary expectations, desired industries, and social links you choose to add.</p>
        <p><strong>Résumé:</strong> the PDF, Word or image files you upload; the text extracted from them (by OCR, on our own servers, when the file is a photo or a scan); and the structured data our parser derives (experience, education, skills).</p>
        <p><strong>Derived data:</strong> a numerical vector (an &ldquo;embedding&rdquo;) generated from your profile and résumé text, which is what the matching engine compares against jobs. It is derived from your personal data and is treated as personal data.</p>
        <p><strong>Activity:</strong> applications you submit, jobs you save or dismiss, match feedback you give, and jobs you track privately.</p>
        <p><strong>Consent record:</strong> when you accept these terms, we store the time, the version accepted, and the IP address the acceptance came from. See §7.</p>
        <p><strong>Security logs:</strong> login attempts, lockouts and similar events, used to protect your account.</p>
      </LegalSection>

      <LegalSection id="ai" title="3. How AI processes your data — and where">
        <p>
          JobFits uses two kinds of AI, and they see different things. This distinction is
          the most important fact on this page.
        </p>
        <p>
          <strong>§3.1 Your résumé and profile stay on infrastructure we operate.</strong>{" "}
          Résumé parsing, profile embeddings, cover-letter and résumé generation, and match
          scoring run on language models hosted on JobFits-controlled servers. Your résumé
          text, your profile, and the embedding derived from them are{" "}
          <strong>not sent to any third-party AI provider</strong>.
        </p>
        <p>
          <strong>§3.2 Some public job text is sent to DeepSeek.</strong> For two tasks —
          extracting requirements from an employer&rsquo;s job description, and generating
          practice interview questions — we send the <em>job posting text</em> to DeepSeek
          (DeepSeek AI, servers located in the People&rsquo;s Republic of China). This is
          text the employer has published. Your résumé, name, profile and application
          materials are not included in those requests.
        </p>
        <p>
          <strong>§3.3 Scores are similarity measures, not judgements.</strong> A match
          score reflects how closely the wording of your profile and résumé overlaps with a
          job posting, combined with how well the posting fits the preferences you stated.
          It does not measure your competence and does not predict whether you will be
          hired. See{" "}
          <Link href="/terms#scores" className="text-primary-600 hover:underline">
            Terms §6.1
          </Link>
          .
        </p>
        <p id="s3-4">
          <strong>§3.4 We do not sell your résumé and do not train public AI on it.</strong>{" "}
          JobFits does not sell résumé or profile data, and does not use your résumé text
          to train public generative AI models. We may use de-identified, aggregated
          interaction data — for example, whether users rated a match as good or bad — to
          measure and improve the quality of the matching algorithm.
        </p>
      </LegalSection>

      <LegalSection id="use" title="4. What we use your data for">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Matching you with job postings and explaining each match.</li>
          <li>Letting employers on JobFits review applications you choose to submit to them.</li>
          <li>Generating drafts (cover letters, résumé sections, interview practice) when you ask for them.</li>
          <li>Keeping your account secure and preventing abuse.</li>
          <li>Sending you transactional email (verification codes, password resets, application updates).</li>
          <li>Measuring whether the matching works, using de-identified data as described in §3.4.</li>
        </ul>
      </LegalSection>

      <LegalSection id="sharing" title="5. Who we share it with">
        <p>
          <strong>Employers.</strong> When you apply to a role posted on JobFits, that
          employer can see your application, your profile, and your résumé. Each employer
          is an <strong>independent controller</strong> of the data you send them: they
          decide how they handle it under their own policies and obligations, and JobFits
          does not control what an employer does with an application once received.
        </p>
        <p>
          <strong>External job sites.</strong> Many jobs on JobFits are listed from other
          sites (for example BongThom, JobNet, TheMuse). When you apply to one of these, you
          are sent to that site to apply there. JobFits does not send your data to that
          site; anything you enter there is governed by their policy, not this one.
        </p>
        <p>
          <strong>Service providers.</strong> Our database and file storage are hosted on
          Supabase in the Tokyo region (Japan); our application servers run on Google Cloud
          Run, also in Tokyo. DeepSeek receives the job text described in §3.2. Email is
          delivered through a transactional email provider. These providers process data
          only to provide their service to us.
        </p>
        <p>
          <strong>Nobody else.</strong> We do not sell personal data and do not share it
          with advertisers or data brokers.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="6. How long we keep it">
        <p id="s6-1">
          <strong>§6.1 Retention schedule.</strong>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-border rounded-lg">
            <thead>
              <tr className="bg-card text-left">
                <th className="p-3 font-bold">Data</th>
                <th className="p-3 font-bold">Kept for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="p-3">Account and profile</td><td className="p-3">While your account is active, plus 30 days after a closure request</td></tr>
              <tr><td className="p-3">Uploaded résumé files</td><td className="p-3">While your account is active; purged 30 days after deactivation</td></tr>
              <tr><td className="p-3">Parsed résumé text and embeddings</td><td className="p-3">Tied to the résumé; removed when it is replaced or the account is deleted</td></tr>
              <tr><td className="p-3">Submitted applications</td><td className="p-3">2 years after the application closes, then anonymised</td></tr>
              <tr><td className="p-3">Security and audit logs</td><td className="p-3">1 year, rolling</td></tr>
              <tr><td className="p-3">Saved external jobs</td><td className="p-3">Until you delete them, or 1 year of inactivity</td></tr>
              <tr><td className="p-3">De-identified match-quality data</td><td className="p-3">Retained in anonymised form for algorithm evaluation</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Inactive accounts.</strong> If you stop using JobFits, we will email you a
          reminder at 11 months of inactivity, move your data to cold storage at 12 months,
          and fully anonymise it at 36 months.
        </p>
      </LegalSection>

      <LegalSection id="deletion" title="7. Deleting your account">
        <p>
          You can ask us to delete your account at any time. Deletion is carried out in two
          stages: your account is immediately closed and your email address released so it
          can be reused; then, within 30 days, your uploaded files are purged from storage
          and your remaining records are anonymised.
        </p>
        <p>
          <strong>How to request it today:</strong> contact us at the address in §12.
          A self-service &ldquo;Delete account&rdquo; control in Settings is being added; until
          it ships, deletion is handled on request.
        </p>
        <p>
          <strong>Consent record.</strong> When you register, we store the time you
          accepted these terms, the version you accepted (shown at the top of this page),
          and the IP address the acceptance came from. This exists so we can show, if it is
          ever disputed, exactly which text you agreed to. It is not used for anything else.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="8. Your rights">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Access and correction</strong> — your profile, résumés and preferences are editable in the app.</li>
          <li><strong>Export</strong> — a copy of the data we hold about you, in a structured format, on request. A self-service download is being added.</li>
          <li><strong>Deletion</strong> — as described in §7.</li>
          <li><strong>Withdrawal</strong> — you may withdraw consent by deleting your account; this does not affect processing that already happened.</li>
        </ul>
        <p id="schedule-1" className="pt-2">
          <strong>Schedule 1 — EEA, UK and Singapore users.</strong> In addition to the
          above, you have the rights granted by the GDPR (EEA), UK GDPR, or Singapore&rsquo;s
          PDPA as applicable, including the right to object to processing, to restrict
          processing, to data portability, and to lodge a complaint with your supervisory
          authority. Our lawful basis for processing is the performance of our contract
          with you (matching you with jobs you asked to be matched with) and, for security
          logging, our legitimate interest in protecting accounts. JobFits is not
          established in the EEA, the UK or Singapore. International transfers to our
          Tokyo-hosted infrastructure and to DeepSeek (§3.2) are made on the basis of your{" "}
          <strong>explicit consent</strong>, given when you accept these terms having been told
          exactly where your data goes; and, where a provider offers them, on standard
          contractual clauses in that provider&rsquo;s data-processing agreement. You may
          withdraw that consent at any time by deleting your account (§7).
        </p>
      </LegalSection>

      <LegalSection id="extension" title="9. The browser extension">
        <p>
          The JobFits browser extension is a <strong>user-directed assistant</strong>. It
          acts only on the page you are currently viewing, only when you click it, and only
          on job-listing pages of supported sites. It does not browse, crawl or collect
          pages in the background.
        </p>
        <p>
          When you use it, the text of the job listing you are looking at is sent to
          JobFits to be scored against your profile. Saving a job stores a bookmark to it.
          The extension does not read your messages, contacts, or any page other than the
          one you invoke it on. This section is the extension&rsquo;s privacy notice; its
          public address is{" "}
          <a href={`${SITE_URL}/privacy#extension`} className="text-primary-600 hover:underline">
            {SITE_URL.replace(/^https?:\/\//, "")}/privacy#extension
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="security" title="10. Security">
        <p>
          Passwords are stored as salted hashes and are never readable by us. Sessions use
          short-lived tokens with rotation. Repeated failed logins lock the account
          temporarily. Résumé files are stored in private storage and served only through
          short-lived signed links. Employers can download an applicant&rsquo;s résumé only
          for applications made to their own postings.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes to this policy">
        <p>
          Each version of this policy carries a version label and effective date at the top.
          If we make a material change, we will notify you by email or in the app before it
          takes effect. Your consent record (§7) always names the version you accepted.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p>
          Privacy requests and questions:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-600 hover:underline">
            {SUPPORT_EMAIL}
          </a>
          . Operator: <strong>So Sereysokbotra</strong>, an individual operator based in Phnom
          Penh, Cambodia. JobFits is not yet incorporated.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
