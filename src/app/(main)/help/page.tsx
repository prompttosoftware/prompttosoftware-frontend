import { CodeExample, Paragraph, SectionHeading, StyledLink, StyledList, SubHeading } from '@/components/ui/presentation';
import HelpContentDisplay from './HelpContentDisplay';

interface ContentBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'list' | 'custom';
  content: any; // The data for the block (string, string[], object, etc.)
  key?: string; // Optional unique key for complex content
}

const HelpSectionRenderer = ({ contentBlocks }: { contentBlocks: ContentBlock[] }) => {
  return (
    <div className="space-y-4">
      {contentBlocks.map((block, index) => {
        const key = block.key || index;
        switch (block.type) {
          case 'heading':
            return <SectionHeading key={key}>{block.content}</SectionHeading>;
          case 'subheading':
            return <SubHeading key={key}>{block.content}</SubHeading>;
          case 'paragraph':
            return <Paragraph key={key}>{block.content}</Paragraph>;
          case 'list':
            return <StyledList key={key} items={block.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

interface HelpMenuItem {
  name: string;
  content: ContentBlock[];
}

const helpMenuItems: HelpMenuItem[] = [
  {
    name: 'About',
    content: [
      { type: 'heading', content: 'About PromptToSoftware' },
      { type: 'paragraph', content: 'PromptToSoftware is a fully automated, hands-free AI software development system. Our mission is to free up developers\' time by handling the entire development lifecycle, from initial concept to a functional codebase.' },
      { type: 'paragraph', content: 'You provide a description, and our autonomous AI system will design the architecture, write the code, run tests, and deliver a complete project directly to your GitHub repository. It can start from scratch, continue work on existing projects, or even fix bugs.' },
      { type: 'paragraph', content: 'This is an experimental development tool undergoing continuous improvement. AI-generated results can vary and may require human oversight. We encourage you to review the generated code to understand its structure and logic.' },
    ],
  },
  {
    name: 'Project Creation',
    content: [
      { type: 'heading', content: 'Creating a New Project' },
      { type: 'paragraph', content: 'Here is a detailed guide to each field in the project creation form, along with tips for getting the best results.' },
      { type: 'list', content: [
          <><strong>Project Description:</strong> This is the core instruction for the AI. It can be a detailed specification or a vague idea. The AI will attempt to follow detailed instructions while filling in any gaps with best practices. If the description is vague, the AI will design an interesting and useful application based on the concept. It is recommended to describe the project rather than posing a question or prompt. <strong>Do not paste code here;</strong> add code to a GitHub repository and select it instead.</>,
          <><strong>Max Runtime:</strong> A safety limit measured in hours. The project will automatically stop once this duration is reached. You can edit this value at any time while the project is running.</>,
          <><strong>Max Budget:</strong> A cost-based safety limit in USD. The project will automatically stop when its total cost reaches this amount. This can also be edited while the project is running.</>,
          <><strong>Repositories:</strong> You can link existing GitHub repositories or create new ones for the project. If no repositories are provided, the AI will determine what is needed and create them in your account. If you provide repositories, the AI will work exclusively within them and will not create others. For new repositories, you can start from a template, fork another repository, or start from scratch.</>,
      ]},
      { type: 'subheading', content: 'Advanced Options' },
      { type: 'list', content: [
        <><strong>AI Model Selection:</strong> Different tasks use different "intelligence levels" to optimize for cost and performance. While the default models are recommended, you can customize them.
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Recommendation:</strong> Use models with at least a 120k token context window for Medium, High, and Super levels.</li>
                <li><strong>Warning:</strong> The "Medium" intelligence level does the vast majority of the work (approx. 75%). Using a slow model here will significantly increase project runtime and cost.</li>
                <li><strong>Backup Model:</strong> If the primary models get stuck, the system can "escalate" intelligence. Medium becomes High, High becomes Super, and Super becomes the Backup model. This can happen up to two times so at most the Backup model can be used for High intelligence.</li>
                <li><strong>Multiple Models:</strong> Selecting multiple models for one intelligence level (e.g., three different models for "Medium") allows the system to randomly pick one for each request. This enhances knowledge diversity, can help avoid getting stuck, and may increase your effective rate limits if the models are from different providers.</li>
            </ul>
        </>,
        <><strong>Approximate Model Usage Breakdown:</strong>
            <ul className="list-disc list-inside ml-4 mt-2 text-muted-foreground">
                <li><strong>Utility:</strong> ~1%</li>
                <li><strong>Low:</strong> ~4%</li>
                <li><strong>Medium:</strong> ~75%</li>
                <li><strong>High:</strong> ~5%</li>
                <li><strong>Super:</strong> ~15%</li>
                <li><strong>Backup:</strong> Only used on failure.</li>
            </ul>
        </>,
        <><strong>Installations:</strong> You can select packages from a predefined list to ensure they are installed in the project's container. The AI will automatically determine and install necessary packages, but this option guarantees a specific tool is available.</>,
        <><strong>Jira Integration:</strong> Enable this to have the project managed via Jira issues. <strong>Important:</strong> Due to Jira's authentication method, only one active project can be linked to your Jira account at a time.</>,
      ]}
    ]
  },
  {
    name: 'GitHub',
    content: [
      { type: 'heading', content: 'Integrating with GitHub' },
      { type: 'subheading', content: 'What is GitHub?' },
      { type: 'paragraph', content: "GitHub is a platform for hosting and collaborating on code using the Git version control system. It's where your project's code will live and be managed." },
      { type: 'subheading', content: 'How PromptToSoftware Uses GitHub' },
      { type: 'list', content: [
          <><strong>Your Code, Your Account:</strong> All repositories, whether new or existing, are located directly in your connected GitHub account. You have full ownership and control.</>,
          <><strong>Pull Requests for Tasks:</strong> As the AI completes tasks (often corresponding to a Jira issue), it will create and automatically merge a pull request in the relevant repository. This provides a clear history of changes.</>,
          <><strong>Linked to Jira:</strong> If you are using Jira, pull request titles will be formatted as `{"\"{Issue Key}: {Issue summary}\""}` (e.g., `PROJ-123: Implement user authentication`), creating a direct link between the task and the code.</>,
          <><strong>The Single Source of Truth:</strong> The code generated by the AI is only saved in your GitHub repositories. <strong>Warning:</strong> If you delete or rename a repository on GitHub that a project is using, that code will be lost or disconnected and the project will fail.</>,
      ]},
      { type: 'subheading', content: 'Core Concepts & Learning Resources' },
      { type: 'list', content: [
          <><strong>Creating an Account:</strong> You need a GitHub account to use our service. You can sign up at <StyledLink href="https://github.com/join">github.com</StyledLink>.</>,
          <><strong>Repositories:</strong> A repository (or "repo") is a folder for your project, containing all its files and their revision history.</>,
          <><strong>Cloning a Repository:</strong> To work on the code on your local machine, you "clone" it from GitHub.</>,
          <><strong>Pushing Changes:</strong> "Pushing" sends changes from your local machine back up to the repository on GitHub.</>,
          <><StyledLink href="https://docs.github.com/en/get-started">GitHub's Official "Getting Started" Guide</StyledLink></>,
      ]},
    ],
  },
  {
    name: 'Jira',
    content: [
      { type: 'heading', content: 'Integrating with Jira' },
      { type: 'subheading', content: 'What is Jira?' },
      { type: 'paragraph', content: "Jira is a project management tool by Atlassian, widely used for issue tracking and agile development. It helps organize tasks, track progress, and manage workflows." },
      { type: 'subheading', content: 'How PromptToSoftware Uses Jira' },
      { type: 'list', content: [
          <><strong>Automatic Issue Generation:</strong> At the start of a new project, the AI analyzes the description and creates a full set of issues (tasks, stories, bugs) in your chosen Jira project.</>,
          <><strong>Use Existing Issues:</strong> If you start a project and link an existing Jira project that already contains issues, the AI will skip the generation step and begin working on the issues already present.</>,
          <><strong>Workflow Automation:</strong> As the AI works on an issue, it will automatically transition it through the workflow. It moves issues directly to your board's "Done" column category. Intermediate columns (like "In Review") will be skipped. Issues in these columns will be ignored by the AI.</>,
          <><strong>Dynamic Updates:</strong> The AI may edit or delete issues as the project's requirements evolve or are better understood during development.</>,
          <><strong>User Collaboration:</strong> You can freely add, edit, and transition issues in the Jira project alongside the AI. It's a collaborative environment.</>,
          <><strong>Important Limitation:</strong> You can only have <strong>one active project</strong> linked to Jira at any given time. This is due to the nature of Jira's OAuth authentication tokens.</>,
      ]},
      { type: 'subheading', content: 'Core Concepts & Learning Resources' },
      { type: 'list', content: [
        <><strong>Account, Site, and Project:</strong> You need an Atlassian account, a Jira site (e.g., `your-company.atlassian.net`), and optionally a project within that site.</>,
        <><strong>Issues:</strong> The fundamental units of work in Jira (e.g., a bug, a task, a story).</>,
        <><StyledLink href="https://www.atlassian.com/software/jira/guides/getting-started/introduction#what-is-jira-software">Atlassian's "What is Jira?" Guide</StyledLink></>,
      ]}
    ]
  },
  {
    name: 'Billing',
    content: [
      { type: 'heading', content: 'Understanding Billing and Costs' },
      { type: 'paragraph', content: 'Funds are deducted from your account balance only while a project is actively running. Costs are broken down into two distinct categories.' },
      { type: 'subheading', content: 'Cost Components' },
      { type: 'list', content: [
          <><strong>Runtime Cost:</strong> This is a flat rate charged for the time a project is running, measured in hours. It covers the computational resources required to operate the AI agent.</>,
          <><strong>Inference Cost:</strong> This is the cost associated with making requests to AI models via OpenRouter. The cost varies depending on the specific model used and the number of tokens in the request and response. These charges are tracked and deducted from your balance periodically as the project runs.</>,
      ]},
      { type: 'subheading', content: 'Using Your Own API Keys' },
      { type: 'paragraph', content: 'If you provide your own API key for a provider (e.g., OpenAI, Anthropic), the Inference Cost for any intelligence level using a model from that provider will be $0.00. You will be billed directly by your API key provider. The Runtime Cost will still apply.' },
      { type: 'subheading', content: 'What Happens When Funds Run Out?' },
      { type: 'paragraph', content: <>If your account balance reaches zero while one or more projects are running, <strong>all active projects will be stopped immediately.</strong> You can add more funds and restart the projects at any time.</> },
    ],
  },
];

export default function HelpPage() {
  const itemsWithRenderedContent = helpMenuItems.map(item => ({
    ...item,
    content: <HelpSectionRenderer contentBlocks={item.content} />,
  }));

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <HelpContentDisplay
        initialSelectedItemName={itemsWithRenderedContent[0].name}
        helpMenuItems={itemsWithRenderedContent}
      />
    </div>
  );
}
