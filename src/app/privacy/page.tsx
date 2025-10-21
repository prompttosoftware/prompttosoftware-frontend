// src/app/privacy/page.tsx
import React, { Suspense } from "react";
import LandingPageHeader from '../apps/components/LandingPageHeader';
import LandingPageFooter from '../apps/components/LandingPageFooter';

const AppPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

export default function Privacy() {
  return (
    <Suspense fallback={AppPageFallback}>
    <main>
    <LandingPageHeader textColor='dark' />
    <div className="min-h-screen bg-background text-foreground flex justify-center p-4 sm:p-8">
      <div className="prose dark:prose-invert max-w-4xl w-full py-12">
        {/* Main Title */}
        <h2 className="text-center">Privacy Policy for PromptToSoftware</h2>
        <p className="text-center text-muted-foreground">
          <strong>Last Updated:</strong> August 31, 2025
        </p>

        {/* Introduction */}
        <p>
          Welcome to PromptToSoftware ("we," "us," or "our"). Your privacy is
          critically important to us. This Privacy Policy document outlines the
          types of personal information that is received and collected by{" "}
          <code>prompttosoftware.com</code> and how it is used.
        </p>
        <p>
          This policy applies to all information collected through our website
          and associated services (collectively, the "Service"), operated by
          PromptToSoftware, LLC.
        </p>

        {/* Section 1 */}
        <h3>1. Information We Collect</h3>
        <p>
          We collect information in several ways to provide and improve our
          Service to you.
        </p>

        <h4>A. Information You Provide Directly</h4>
        <ul>
          <li>
            <strong>Account Information (via GitHub):</strong> When you register
            for our Service using your GitHub account, we receive certain
            profile information required for the core functionality of our
            Service. This includes:
            <ul>
              <li>
                Your GitHub ID, Name, Email Address, and Avatar URL.
              </li>
              <li>
                A GitHub Authentication Token, which is necessary to interact
                with your repositories and perform actions on your behalf as
                authorized by you.
              </li>
            </ul>
          </li>
          <li>
            <strong>Optional Integrations and API Keys:</strong> To enhance
            your experience, you may optionally provide additional information:
            <ul>
              <li>
                <strong>Third-Party API Keys (e.g., OpenAI):</strong> If you
                connect a third-party service, we will securely store the API
                key you provide. This key is used solely to make requests to
                that service on your behalf.
              </li>
              <li>
                <strong>Jira Integration:</strong> If you link your Jira
                account, we store authentication tokens (<code>accessToken</code>,{" "}
                <code>refreshToken</code>) and your Jira <code>cloudId</code> to
                enable the integration.
              </li>
            </ul>
          </li>
          <li>
            <strong>Payment Information:</strong> When you add funds to your account, we use a third-party payment processor (Stripe). We do
            not store your full credit card details. We only store a{" "}
            <strong>Stripe Customer ID</strong> to manage your transactions.
          </li>
        </ul>

        <h4>B. Information We Collect Automatically</h4>
        <ul>
          <li>
            <strong>Service Usage Data:</strong> As you use our Service, we
            collect data about your activity, including your current balance, a
            list of projects you have starred, and your general account status.
            We also store standard timestamps for account creation and updates.
          </li>
        </ul>

        <h4>C. Information We Use Temporarily</h4>
        <ul>
          <li>
            <strong>Jira Account ID:</strong> When creating a project via our
            Jira integration, we retrieve your Jira account ID to assign
            project ownership. This identifier is used for that single action
            and is <strong>never stored</strong> in our database.
          </li>
        </ul>

        {/* Section 2 */}
        <h3>2. How We Use Your Information</h3>
        <p>
          We use the information we collect for the following purposes:
        </p>
        <ul>
          <li>
            <strong>To Provide and Maintain the Service:</strong> To create and
            manage your account, deliver core features, and enable
            integrations.
          </li>
          <li>
            <strong>To Process Transactions:</strong> To manage payments and
            billing.
          </li>
          <li>
            <strong>To Personalize Your Experience:</strong> To remember your
            settings and preferences.
          </li>
          <li>
            <strong>To Communicate With You:</strong> To respond to support
            requests and send important service-related notices.
          </li>
          <li>
            <strong>To Improve Our Service:</strong> To understand user
            behavior and enhance our platform.
          </li>
        </ul>

        {/* Section 3 */}
        <h3>3. Data Security</h3>
        <p>
          We take the security of your data seriously. We implement reasonable
          administrative, technical, and physical security measures designed to
          protect your personal information from unauthorized access, use, or
          disclosure. Sensitive information like API Keys and authentication
          tokens are encrypted and stored securely.
        </p>

        {/* Section 4 */}
        <h3>4. Your Rights and Control Over Your Data</h3>
        <p>You have control over your personal data.</p>
        <ul>
          <li>
            <strong>Access and Update:</strong> You can review and update your
            basic account information through your account settings.
          </li>
          <li>
            <strong>Data Deletion:</strong>
            <ul>
              <li>
                You can delete optional data, such as third-party API keys and
                Jira integration tokens, at any time from your account settings.
                This action is permanent.
              </li>
              <li>
                You can request to delete your entire account by contacting us.
                Upon deletion, all your personal information will be permanently
                removed from our production systems.
              </li>
            </ul>
          </li>
        </ul>

        {/* Section 5 */}
        <h3>5. Third-Party Services</h3>
        <p>
          We may share your information with third-party service providers who
          perform services on our behalf, such as payment processing (Stripe)
          and cloud hosting. We share only the minimum information necessary and
          require them to protect your data.
        </p>

        {/* Section 6 */}
        <h3>6. Changes to This Privacy Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the "Last Updated" date. We encourage you to review this
          Privacy Policy periodically.
        </p>

        {/* Section 7 */}
        <h3>7. Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <p>
          <a
            href="mailto:contact@prompttosoftware.com"
            className="text-primary hover:underline"
          >
            <strong>contact@prompttosoftware.com</strong>
          </a>
        </p>
      </div>
    </div>
    <LandingPageFooter></LandingPageFooter>
    </main>
    </Suspense>
  );
}
