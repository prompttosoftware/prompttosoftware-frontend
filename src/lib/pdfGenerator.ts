import jsPDF from 'jspdf';
import { Analysis, Node } from '@/types/analysis';
import { format } from 'date-fns';

interface IssueTotals {
    potentialBugs: number;
    styleIssues: number;
    securityConcerns: number;
    incompleteCode: number;
    performanceConcerns: number;
}

// --- PDF Layout Constants ---
const MARGIN = 36; // ~0.5 inch (standard for reports)
const FONT_SIZES = {
  h1: 20, // main section title
  h2: 16, // subsection
  h3: 12, // minor section / caption
  body: 10, // standard paragraph text
  code: 8,  // preformatted text
};
const LINE_SPACING = 5; // ~1.3x body size
const SECTION_SPACING = 14; // vertical gap between sections
const TOP_MARGIN = MARGIN + 24;

const fileIcon = new Image();
fileIcon.src = '/file.png';

/**
 * Manages the Y-cursor position and adds new pages as needed.
 */
class PdfContext {
  doc: jsPDF;
  cursorY: number;
  pageWidth: number;
  pageHeight: number;

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.cursorY = TOP_MARGIN;
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
  }

  // Ensures there's enough space for the next element, adding a page if not.
  checkPageBreak(requiredHeight: number) {
    // Check against the page height, leaving space for the footer.
    if (this.cursorY + requiredHeight > this.pageHeight - MARGIN) {
      this.doc.addPage();
      this.cursorY = TOP_MARGIN;
    }
  }

  // Adds a text block and moves the cursor down.
  addText(text: string | string[], options: any = {}, additionalSpacing = LINE_SPACING) {
    const lines = Array.isArray(text)
        ? text
        : this.doc.splitTextToSize(text, this.pageWidth - MARGIN * 2);
    const textHeight = lines.length * (this.doc.getFontSize() * 0.35);
    this.checkPageBreak(textHeight + additionalSpacing);
    this.doc.text(lines, MARGIN, this.cursorY, options);
    this.cursorY += textHeight + additionalSpacing;
   }

    // Adds a new page and resets the cursor position.
    addPage() {
        this.doc.addPage();
        this.cursorY = TOP_MARGIN;
    }

    // Adds a formatted code block that can span multiple pages with continuous borders.
    addCodeBlock(text?: string) {
    const innerPadding = 4;
    if (!text?.trim()) {
        this.doc.setFont('helvetica', 'italic').setFontSize(FONT_SIZES.body);
        this.addText('Not available.');
        this.doc.setFont('helvetica', 'normal');
        return;
    }

    this.doc.setFont('courier', 'normal').setFontSize(FONT_SIZES.code);
    const lines = this.doc.splitTextToSize(
        text,
        this.pageWidth - MARGIN * 2 - innerPadding * 2
    );
    const lineHeight = FONT_SIZES.code * 0.4;
    const usablePageHeight = this.pageHeight - MARGIN * 2;
    const availableHeight = () => usablePageHeight - (this.cursorY - MARGIN);

    let startLine = 0;
    while (startLine < lines.length) {
        const linesThatFit = Math.floor(
        (availableHeight() - innerPadding * 2 - LINE_SPACING) / lineHeight
        );

        if (linesThatFit <= 0) {
        this.addPage();
        continue;
        }

        const endLine = Math.min(startLine + linesThatFit, lines.length);
        const chunk = lines.slice(startLine, endLine);
        const boxHeight = chunk.length * lineHeight + innerPadding * 2;
        const x = MARGIN;
        const y = this.cursorY;
        const boxWidth = this.pageWidth - MARGIN * 2;

        // Background fill
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(x, y, boxWidth, boxHeight, 'F');

        // Borders
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.2);
        // Always draw side borders
        this.doc.line(x, y, x, y + boxHeight); // left
        this.doc.line(x + boxWidth, y, x + boxWidth, y + boxHeight); // right
        // Top border only for the first chunk
        if (startLine === 0) this.doc.line(x, y, x + boxWidth, y);
        // Bottom border only for the last chunk
        if (endLine === lines.length) this.doc.line(x, y + boxHeight, x + boxWidth, y + boxHeight);

        // Text
        this.doc.setTextColor(50, 50, 50);
        this.doc.text(
        chunk,
        x + innerPadding,
        y + innerPadding + lineHeight / 2
        );

        this.cursorY += boxHeight + SECTION_SPACING / 2;
        startLine = endLine;

        if (startLine < lines.length && availableHeight() < lineHeight * 2) {
        this.addPage();
        }
    }

    this.doc.setFont('helvetica', 'normal').setTextColor(0, 0, 0);
    }

}

// --- PDF Section Renderers ---

const addTitlePage = (ctx: PdfContext, analysis: Analysis) => {
    const repoName = analysis.repository.split('/').slice(-2).join('/');
    ctx.doc.setFontSize(FONT_SIZES.h1).setFont('helvetica', 'bold');
    ctx.addText('Code Analysis Report', {}, SECTION_SPACING / 2);
    ctx.doc.setFontSize(FONT_SIZES.h3).setFont('helvetica', 'normal');
    ctx.addText(repoName, {}, LINE_SPACING);
    ctx.doc.setFontSize(FONT_SIZES.body);
    ctx.addText(`Generated on: ${format(new Date(), 'MMM d, yyyy, p')}`, {});
    ctx.cursorY += SECTION_SPACING;
};

const addIssueSummary = (ctx: PdfContext, issueTotals: IssueTotals | null) => {
  if (!issueTotals) return;
  ctx.cursorY += SECTION_SPACING / 2;
  ctx.doc.setFontSize(FONT_SIZES.h2).setFont('helvetica', 'bold');
  ctx.addText('Issue Summary', {});

  const totalIssues = Object.values(issueTotals).reduce((sum, count) => sum + count, 0);
  const data = [
    { label: 'Potential Bugs', value: issueTotals.potentialBugs },
    { label: 'Style Issues', value: issueTotals.styleIssues },
    { label: 'Security Concerns', value: issueTotals.securityConcerns },
    { label: 'Incomplete Code', value: issueTotals.incompleteCode },
    { label: 'Performance Concerns', value: issueTotals.performanceConcerns },
  ];

  const rowHeight = 8;
  const valueColumnX = ctx.pageWidth - MARGIN - 50; // X position for the right-aligned numbers
  const rightEdgeX = ctx.pageWidth - MARGIN;

  ctx.doc.setFontSize(FONT_SIZES.body).setFont('helvetica', 'normal');

  data.forEach(item => {
    ctx.checkPageBreak(rowHeight);
    ctx.doc.text(item.label, MARGIN, ctx.cursorY);
    ctx.doc.text(String(item.value), rightEdgeX, ctx.cursorY, { align: 'right' });
    ctx.cursorY += rowHeight;
  });

  ctx.cursorY += 4; // Add a small gap before the total

  // Separator line
  ctx.doc.setDrawColor(200, 200, 200);
  ctx.doc.setLineWidth(0.2);
  ctx.doc.line(MARGIN, ctx.cursorY, rightEdgeX, ctx.cursorY);
  ctx.cursorY += rowHeight;

  // Total row
  ctx.checkPageBreak(rowHeight);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.text('Total Issues', MARGIN, ctx.cursorY);
  ctx.doc.text(String(totalIssues), rightEdgeX, ctx.cursorY, { align: 'right' });
  
  ctx.cursorY += rowHeight + SECTION_SPACING;
  ctx.doc.setFont('helvetica', 'normal'); // Reset font
};


const addReports = (ctx: PdfContext, analysis: Analysis) => {
    ctx.cursorY += SECTION_SPACING / 2;   
    ctx.doc.setFontSize(FONT_SIZES.h2).setFont('helvetica', 'bold');    
    ctx.addText('Reports', {});

    const renderReport = (title: string, content: string | undefined) => {
        ctx.doc.setFontSize(FONT_SIZES.h3).setFont('helvetica', 'bold');
        ctx.addText(title, {});
        ctx.addCodeBlock(content);
        ctx.cursorY += 6;
    };

    renderReport('Build Report', analysis.buildReport?.content);
    renderReport('Test Report', analysis.testReport?.content);
    renderReport('Run Report', analysis.runReport?.content);
    ctx.cursorY += SECTION_SPACING;
};

const addFileDescriptions = (ctx: PdfContext, nodes: Node[]) => {
  const renderNode = (node: Node, level: number) => {
    const indent = ' '.repeat(level * 4);
    const xOffset = MARGIN + level * 10;

    ctx.checkPageBreak(25);

    // --- File Name ---
    ctx.doc.setFontSize(FONT_SIZES.h3).setFont('helvetica', 'bold');
    ctx.addText(`${indent}${node.name}`, { xOffset }, 6);
    
    // --- File Description ---
    ctx.doc.setFont('helvetica', 'normal').setFontSize(FONT_SIZES.body);

    if (node.description?.trim()) {
      const descLines = ctx.doc.splitTextToSize(
        `${indent}${node.description}`,
        ctx.pageWidth - MARGIN * 2
      );
      ctx.addText(descLines, { xOffset }, 2);
    }

    // --- File Issues ---
    const addIssueList = (title: string, items?: string[]) => {
      if (!items || items.length === 0) return;
      ctx.doc.setFontSize(FONT_SIZES.body).setFont('helvetica', 'bold');
      ctx.addText(`${indent}  • ${title}:`, { xOffset }, 2);
      ctx.doc.setFont('helvetica', 'normal');
      items.forEach(item => {
        const itemLines = ctx.doc.splitTextToSize(
          `${indent}      - ${item}`,
          ctx.pageWidth - MARGIN * 2
        );
        ctx.addText(itemLines, { xOffset }, 1);
      });
    };

    addIssueList('Potential Bugs', node.potentialBugs);
    addIssueList('Style Issues', node.styleIssues);
    addIssueList('Security Concerns', node.securityConcerns);
    addIssueList('Incomplete Code', node.incompleteCode);
    addIssueList('Performance Concerns', node.performanceConcerns);

    // --- Handle Empty File ---
    const hasData =
      node.description?.trim() ||
      (node.potentialBugs?.length ||
        node.styleIssues?.length ||
        node.securityConcerns?.length ||
        node.incompleteCode?.length ||
        node.performanceConcerns?.length);

    if (!hasData) {
      ctx.doc.setFont('helvetica', 'italic');
      ctx.addText(`${indent}  No data available.`, { xOffset }, 2);
    }

    ctx.cursorY += 8;

    // --- Recurse on children ---
    if (node.isContainer && node.children) {
      node.children.forEach(child => renderNode(child, level + 1));
    }
  };

  // --- Section Header ---
  ctx.cursorY += SECTION_SPACING / 2;
  ctx.doc.setFontSize(FONT_SIZES.h2).setFont('helvetica', 'bold');
  ctx.addText('File Descriptions & Issues', {});
  ctx.cursorY += 6;

  // --- Render Each Node ---
  nodes.forEach(node => renderNode(node, 0));

  ctx.cursorY += SECTION_SPACING;
};

const addHeaderAndFooter = (doc: jsPDF, repoName: string) => {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8).setTextColor(150);
    // Header
    doc.text(repoName, MARGIN, 10);
    // Footer
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - MARGIN, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }
};

/**
 * Main function to generate and download the analysis PDF.
 */
export const generateAnalysisPdf = (analysis: Analysis, issueTotals: IssueTotals | null) => {
  const doc = new jsPDF();
  const ctx = new PdfContext(doc);
  const repoName = analysis.repository.split('/').slice(-2).join('/');
  
  // --- Build PDF Content ---
  addTitlePage(ctx, analysis);
  addIssueSummary(ctx, issueTotals);
  addReports(ctx, analysis);

  // Per requirements, file descriptions are last.
  if (analysis.descriptions && analysis.descriptions.length > 0) {
    addFileDescriptions(ctx, analysis.descriptions);
  }
  
  // --- Finalize ---
  addHeaderAndFooter(doc, repoName);
  doc.save(`analysis-report-${repoName.replace('/', '_')}.pdf`);
};
