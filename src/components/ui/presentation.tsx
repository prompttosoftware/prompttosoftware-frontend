const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold mb-4">{children}</h2>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>
);

const Paragraph = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-card-foreground leading-relaxed ${className}`}>{children}</p>
);

const StyledList = ({ items }: { items: (React.ReactNode | string)[] }) => (
  <ul className="list-disc list-inside space-y-2 text-card-foreground ml-4">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const StyledLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline dark:text-blue-400"
  >
    {children}
  </a>
);

const CodeExample = ({ command, description }: { command: string; description: string }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm mt-2">
    <p className="font-mono text-gray-800 dark:text-gray-200">
      <span className="font-bold text-blue-600 dark:text-blue-400">Example:</span>{' '}
      <code className="text-sm">{command}</code>
    </p>
    <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
  </div>
);

export { StyledLink, SectionHeading, CodeExample, StyledList, SubHeading, Paragraph };
