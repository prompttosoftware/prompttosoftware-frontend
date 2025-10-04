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
const MARGIN = 15;
const FONT_SIZES = { h1: 22, h2: 16, h3: 12, body: 10, code: 8 };
const LINE_SPACING = 8;
const TOP_MARGIN = MARGIN + 15;


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
  addText(text: string | string[], options: any, additionalSpacing = LINE_SPACING) {
    const textHeight = (this.doc.getTextDimensions(text as string, options).h);
    this.checkPageBreak(textHeight);
    this.doc.text(text, MARGIN, this.cursorY, options);
    this.cursorY += textHeight + additionalSpacing;
  }
  
  // Adds a formatted code block.
  addCodeBlock(text: string | undefined) {
      if (!text || text.trim() === '') {
          this.doc.setFont('helvetica', 'italic').setFontSize(FONT_SIZES.body);
          this.addText('Not available.', {});
          this.doc.setFont('helvetica', 'normal');
          return;
      }
      this.doc.setFont('courier', 'normal').setFontSize(FONT_SIZES.code);
      const lines = this.doc.splitTextToSize(text, this.pageWidth - MARGIN * 2 - 8);
      const boxHeight = (lines.length * FONT_SIZES.code * 0.35) + 8;
      
      this.checkPageBreak(boxHeight);
      this.doc.setFillColor(240, 240, 240);
      this.doc.rect(MARGIN, this.cursorY, this.pageWidth - MARGIN * 2, boxHeight, 'F');
      this.doc.setTextColor(50, 50, 50);
      this.doc.text(lines, MARGIN + 4, this.cursorY + 5);

      this.cursorY += boxHeight + LINE_SPACING;
      this.doc.setFont('helvetica', 'normal').setTextColor(0, 0, 0); // Reset font and color
  }
}

// --- PDF Section Renderers ---

const addTitlePage = (ctx: PdfContext, analysis: Analysis) => {
  const repoName = analysis.repository.split('/').slice(-2).join('/');
  ctx.doc.setFontSize(FONT_SIZES.h1).setFont('helvetica', 'bold');
  ctx.addText('Code Analysis Report', {}, 10);
  ctx.doc.setFontSize(FONT_SIZES.h2).setFont('helvetica', 'normal');
  ctx.addText(repoName, {}, 8);
  ctx.doc.setFontSize(FONT_SIZES.body);
  ctx.addText(`Generated on: ${format(new Date(), 'MMM d, yyyy, p')}`, {});
  ctx.cursorY += 10;
};

const addIssueSummary = (ctx: PdfContext, issueTotals: IssueTotals | null) => {
  if (!issueTotals) return;
  ctx.doc.setFontSize(FONT_SIZES.h2).setFont('helvetica', 'bold');
  ctx.addText('Issue Summary', {});

  const totalIssues = Object.values(issueTotals).reduce((sum, count) => sum + count, 0);
  const head = [['Issue Type', 'Count']];
  const body = [
    ['Potential Bugs', issueTotals.potentialBugs],
    ['Style Issues', issueTotals.styleIssues],
    ['Security Concerns', issueTotals.securityConcerns],
    ['Incomplete Code', issueTotals.incompleteCode],
    ['Performance Concerns', issueTotals.performanceConcerns],
  ];
  const foot = [['Total Issues', totalIssues]];

  // --- Manually draw the table ---
  const tableStartY = ctx.cursorY;
  const rowHeight = 10;
  const cellPadding = 3;
  const tableWidth = ctx.pageWidth - MARGIN * 2;
  const col1Width = tableWidth * 0.75;
  const col2Width = tableWidth * 0.25;
  let currentY = tableStartY;

  const drawRow = (rowData: (string | number)[], isHeader: boolean, isFooter: boolean) => {
      ctx.checkPageBreak(rowHeight);

      // Set styles
      if (isHeader) {
          ctx.doc.setFillColor(40, 40, 40);
          ctx.doc.rect(MARGIN, currentY, tableWidth, rowHeight, 'F');
          ctx.doc.setFont('helvetica', 'bold');
          ctx.doc.setTextColor(255, 255, 255);
      } else {
          ctx.doc.setFont('helvetica', isFooter ? 'bold' : 'normal');
          ctx.doc.setTextColor(0, 0, 0);
      }

      // Draw text
      ctx.doc.text(String(rowData[0]), MARGIN + cellPadding, currentY + rowHeight / 2, { baseline: 'middle' });
      ctx.doc.text(String(rowData[1]), MARGIN + col1Width + cellPadding, currentY + rowHeight / 2, { baseline: 'middle' });
      
      // Draw bottom line
      ctx.doc.setDrawColor(200, 200, 200);
      ctx.doc.line(MARGIN, currentY + rowHeight, MARGIN + tableWidth, currentY + rowHeight);
      currentY += rowHeight;
  };

  // Draw Header
  drawRow(head[0], true, false);
  // Draw Body
  body.forEach(row => drawRow(row, false, false));
  // Draw Footer
  drawRow(foot[0], false, true);

  // Draw vertical lines
  ctx.doc.line(MARGIN, tableStartY, MARGIN, currentY); // Left border
  ctx.doc.line(MARGIN + col1Width, tableStartY, MARGIN + col1Width, currentY); // Middle divider
  ctx.doc.line(MARGIN + tableWidth, tableStartY, MARGIN + tableWidth, currentY); // Right border

  ctx.cursorY = currentY + LINE_SPACING;
  ctx.doc.setFont('helvetica', 'normal').setTextColor(0, 0, 0); // Reset styles
};


const addReports = (ctx: PdfContext, analysis: Analysis) => {
  ctx.doc.setFontSize(FONT_SIZES.h2).setFont('helvetica', 'bold');
  ctx.addText('Reports', {});

  const renderReport = (title: string, content: string | undefined) => {
    ctx.doc.setFontSize(FONT_SIZES.h3).setFont('helvetica', 'bold');
    ctx.addText(title, {});
    ctx.addCodeBlock(content);
  };

  renderReport('Build Report', analysis.buildReport?.content);
  renderReport('Test Report', analysis.testReport?.content);
  renderReport('Run Report', analysis.runReport?.content);
};

const addFileDescriptions = (ctx: PdfContext, nodes: Node[]) => {
  const renderNode = (node: Node, level: number) => {
    const indent = ' '.repeat(level * 4);
    
    ctx.checkPageBreak(20);
    ctx.doc.setFontSize(FONT_SIZES.h3).setFont('helvetica', 'bold');
    ctx.addText(`${indent}${node.name}`, {}, 4);

    ctx.doc.setFont('helvetica', 'normal').setFontSize(FONT_SIZES.body);
    if(node.description) {
      const descLines = ctx.doc.splitTextToSize(`${indent}${node.description}`, ctx.pageWidth - MARGIN * 2);
      ctx.addText(descLines, {});
    }

    const addIssueList = (title: string, items?: string[]) => {
      if (!items || items.length === 0) return;
      ctx.doc.setFontSize(FONT_SIZES.body).setFont('helvetica', 'bold');
      ctx.addText(`${indent}  - ${title}:`, {}, 2);
      ctx.doc.setFont('helvetica', 'normal');
      items.forEach(item => {
        const itemLines = ctx.doc.splitTextToSize(`${indent}    • ${item}`, ctx.pageWidth - MARGIN * 2);
        ctx.addText(itemLines, {}, 2);
      });
    };

    addIssueList('Potential Bugs', node.potentialBugs);
    addIssueList('Style Issues', node.styleIssues);
    addIssueList('Security Concerns', node.securityConcerns);
    addIssueList('Incomplete Code', node.incompleteCode);
    addIssueList('Performance Concerns', node.performanceConcerns);

    ctx.cursorY += 10;

    if (node.isContainer && node.children) {
      node.children.forEach(child => renderNode(child, level + 1));
    }
  };
  
  ctx.doc.setFontSize(FONT_SIZES.h2).setFont('helvetica', 'bold');
  ctx.addText('File Descriptions & Issues', {});

  nodes.forEach(node => renderNode(node, 0));
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
