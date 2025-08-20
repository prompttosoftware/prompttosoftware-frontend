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
  content: ContentBlock[]; // We now use our new structured content type
}

const helpMenuItems: HelpMenuItem[] = [
  {
    name: 'About',
    content: [
      { type: 'heading', content: 'About This Application' },
      { type: 'paragraph', content: 'This application is designed to help you generate software projects from simple text prompts. It leverages advanced AI models to interpret your requirements and produce functional codebases, boilerplate, and project structures. Our goal is to streamline the development process and make it accessible to everyone, regardless of their coding expertise.' },
      { type: 'paragraph', content: 'We are constantly working to improve our services, add new features, and expand the range of technologies we support. Your feedback is invaluable in helping us achieve this.' },
    ],
  },
  {
    name: 'GitHub',
    content: [
      { type: 'heading', content: 'Understanding GitHub & Its Use in Our Application' },
      { type: 'paragraph', content: "GitHub is a web-based platform that uses Git for version control. It's widely used by developers to host and review code, manage projects, and build software alongside millions of other developers. Think of it as a central hub where code lives, gets tracked, and is collaboratively improved." },
      { type: 'paragraph', content: 'In our application, GitHub serves as the primary way to receive and manage the code projects you generate. Once a project is created, you have the option to connect your GitHub account and push the generated codebase directly to a new or existing repository in your GitHub account. This streamlines your workflow by making your generated code immediately available in a version-controlled environment.' },
      { type: 'subheading', content: 'Key GitHub Concepts:' },
      { type: 'list', content: [
          <><strong>Repository (Repo):</strong> A repository is the most basic element of GitHub. It's like a folder for your project. A repo contains all of your project's files (including documentation, images, and other assets), and stores each revision of every file.</>,
          <><strong>Cloning:</strong> When you "clone" a repository, you are making a complete copy of it from GitHub to your local machine. This allows you to work on the code using your preferred local development environment.
             <CodeExample command="git clone [repository-url]" description='(Replace [repository-url] with the actual URL of your GitHub repository.)' />
          </>,
          <><strong>Committing:</strong> A commit is a snapshot of your repository at a specific point in time. Each commit represents a set of changes you've made to the code.</>,
          <><strong>Pushing:</strong> "Pushing" sends your committed changes from your local repository up to the remote repository on GitHub, making them available to others (and keeping your GitHub repo updated).</>
      ]},
      { type: 'subheading', content: 'Where to Learn More:' },
      { type: 'list', content: [
          <><StyledLink href="https://docs.github.com/en/get-started">GitHub Docs: Getting Started</StyledLink> - The official documentation for beginners.</>,
          <><StyledLink href="https://guides.github.com/">GitHub Guides</StyledLink> - Short, helpful guides on specific GitHub features.</>,
          <><StyledLink href="https://try.github.io/">Try Git (Codecademy)</StyledLink> - An interactive tutorial to learn Git basics.</>,
      ]},
      { type: 'paragraph', content: 'By leveraging GitHub, you can effectively manage versions of your generated code, collaborate with teams, and integrate seamlessly with your existing development workflows.' },
    ],
  },
  {
    name: 'Jira',
    content: [
      { type: 'heading', content: 'Understanding Jira & Its Use in Our Application' },
      { type: 'paragraph', content: "Jira is a powerful work management tool that we use for planning, tracking, and releasing software. It's central to our agile development process, helping us manage everything from large feature epics to individual tasks and bug fixes." },
      { type: 'paragraph', content: "Within our application's context, understanding Jira is crucial for collaborating on generated projects. While direct integration for creating Jira tickets from our platform is a future enhancement, all project-related tasks, bugs, and feature developments are currently managed and tracked within our Jira instance." },
      { type: 'subheading', content: 'Key Jira Concepts:' },
      { type: 'list', content: [
          "Issues: The fundamental building block in Jira. An issue can represent a task, a bug, a story, an epic, or any other piece of work that needs to be tracked.",
          "Workflows: Issues in Jira move through a defined workflow (e.g., To Do, In Progress, In Review, Done). These workflows are customized to our team's process and help visualize progress.",
          "Boards: We primarily use Scrum and Kanban boards in Jira to visualize our team's workflow, manage sprint backlogs, and track progress during iterations.",
          <><strong>Epics, Stories, and Tasks:</strong>
            <ul className="list-circle list-inside ml-4 text-gray-600 dark:text-gray-400">
              <li><strong>Epics:</strong> Large bodies of work that can be broken down into a number of stories.</li>
              <li><strong>Stories:</strong> User-centric descriptions of functionality that will be implemented.</li>
              <li><strong>Tasks:</strong> Smaller, actionable items required to complete a story or larger piece of work.</li>
            </ul>
          </>,
          "Integrations: Jira integrates with many other tools, including GitHub, to link code commits and pull requests directly to Jira issues, providing seamless traceability."
      ]},
      { type: 'subheading', content: 'Where to Learn More:' },
      { type: 'heading', content: 'Understanding Project Billing' },
      { type: 'paragraph', content: 'Project costs are primarily calculated based on the complexity and resource intensity required to generate your desired software. This includes factors such as:' },
      { type: 'list', content: [
          "Lines of Code Generated: More extensive projects with a higher volume of generated code will incur higher costs.",
          'Addons Utilized: Specific addons (e.g., Android Build Support, Unity Engine Integration) add to the base cost due to their specialized requirements and additional processing. You can find more details in the "Addons" section.',
          "AI Model Usage: The complexity of the AI models employed to fulfill your prompt and the computational resources consumed during the generation process."
      ]},
      { type: 'subheading', content: 'When Funds Are Taken Out:' },
      { type: 'paragraph', content: 'Funds for project generation are deducted from your account balance *before* the generation process begins. This ensures that you have sufficient funds for the requested project. A clear cost breakdown will always be presented to you for confirmation prior to initiation.' },
      { type: 'subheading', content: 'Adding Funds Through Ads:' },
      { type: 'paragraph', content: "We offer an option to earn credits towards your project generations by watching short advertisements. Simply navigate to your 'Account' or 'Billing' settings, and look for the 'Watch Ads for Credits' option. The value of credits earned per ad will be clearly displayed. These credits are automatically applied to your account balance and can be used for any future project generation." },
      { type: 'paragraph', content: 'This feature provides a flexible way to fund your projects, especially for smaller tasks or when experimenting with new ideas.' },
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
