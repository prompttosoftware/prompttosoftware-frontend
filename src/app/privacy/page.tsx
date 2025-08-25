// src/app/privacy/page.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

const markdown = `

### **Privacy Policy for PromptToSoftware**

**Last Updated:** October 26, 2023

Welcome to PromptToSoftware. Your privacy is critically important to us. This Privacy Policy document outlines the types of personal information that is received and collected by \`prompttosoftware.com\` and how it is used.

This policy applies to all information collected through our website and services (the "Service"), operated by PromptToSoftware, LLC.

#### **1. Information We Collect**

We collect information in a few different ways to provide and improve our Service.

**A. Information You Provide Directly**

*   **Account Information (via GitHub):** When you sign up for our Service using your GitHub account, we receive certain profile information. This is required for the core functionality of our Service. This includes:
    *   Your **GitHub ID**, **Name**, **Email Address**, and **Avatar URL**.
    *   A **GitHub Authentication Token**, which is necessary to interact with your repositories and perform actions on your behalf as authorized by you within our application.

*   **Optional Integrations and API Keys:** You have the option to provide additional information to enhance your experience. This data is entirely optional.
    *   **Third-Party API Keys (e.g., OpenAI):** If you choose to connect a third-party service, we will securely store the API key you provide. This key is used solely to make requests to that service on your behalf.
    *   **Jira Integration:** If you choose to link your Jira account, we store authentication tokens (\`accessToken\`, \`refreshToken\`) and your Jira \`cloudId\` to enable a seamless integration.

*   **Payment Information:** When you purchase a subscription or credits, we use a third-party payment processor (Stripe). We do not store your full credit card details on our servers. We only store a **Stripe Customer ID** to manage your account and billing.

**B. Information We Collect Automatically**

*   **Service Usage Data:** As you use our Service, we generate data about your activity, including:
    *   Your current **balance** of credits or usage.
    *   A list of **projects you have starred**.
    *   Your general **account status** (e.g., "healthy").
    *   Standard timestamps for when your account was created and last updated.

**C. Information We Use Temporarily (But Do Not Store)**

*   **Jira Account ID:** When creating a project through our Jira integration, we retrieve your Jira account ID to assign project ownership correctly. This identifier is used for that single action and is **never saved** to our database.

#### **2. How We Use Your Information**

We use the information we collect for the following purposes:

*   **To Provide and Maintain the Service:** To create and manage your account, provide core features, and enable integrations.
*   **To Process Transactions:** To manage payments and billing through our payment processor.
*   **To Personalize Your Experience:** To remember your settings and preferences, such as starred projects.
*   **To Communicate With You:** To respond to your support requests, send important service updates, and provide information about your account.
*   **To Improve Our Service:** To understand how users interact with our platform so we can make it better.

#### **3. Data Security**

We take the security of your data seriously. We implement reasonable administrative, technical, and physical security measures to protect your personal information from unauthorized access, use, or disclosure. Sensitive information like API Keys and authentication tokens are stored securely.

#### **4. Your Control and Data Rights**

You are in control of your personal data.

*   **Access and Update:** You can review and update your basic account information through your account settings.
*   **Deleting Optional Data:**
    *   **API Keys:** You can delete any third-party API keys you have provided at any time from your account settings.
    *   **Jira Integration:** You can unlink your Jira account at any time. Doing so will permanently delete your Jira \`cloudId\` and authentication tokens from our system.
*   **Account Deletion:** You can request to delete your entire account. Upon deletion, all your personal information, including your GitHub details, tokens, and usage data, will be permanently removed from our production databases. To request account deletion, please contact us at the email below.

#### **5. Third-Party Services**

We may share your information with third-party service providers who perform services on our behalf, such as:

*   **Stripe:** For payment processing.
*   **Hosting and Infrastructure Providers:** To run our servers and database.

We only share the minimum information necessary for them to perform their functions and require them to protect your information.

#### **6. Changes to This Privacy Policy**

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. We encourage you to review this Privacy Policy periodically for any changes.

#### **7. Contact Us**

If you have any questions about this Privacy Policy, please contact us at:

**contact@prompttosoftware.com**
`;

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
