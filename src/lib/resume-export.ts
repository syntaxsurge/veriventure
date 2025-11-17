import { jsPDF } from "jspdf";
import type { ResumeSection } from "@/types/document";

type ResumeExportPayload = {
  fullName: string;
  headline: string;
  summary: string;
  sections: ResumeSection[];
  skills: string[];
  focus?: string;
  photoDataUrl?: string | null;
};

export async function exportResumeAsPdf(payload: ResumeExportPayload) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56;
  const marginY = 64;
  const contentWidth = pageWidth - marginX * 2;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  const headerHeight = 100;
  const headerX = marginX;
  const headerY = marginY;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(headerX, headerY, contentWidth, headerHeight, 10, 10, "F");

  const fullName = payload.fullName || "Resume";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(fullName, headerX + 20, headerY + 36, {
    maxWidth: contentWidth - 160,
  });

  if (payload.headline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(payload.headline, headerX + 20, headerY + 58, {
      maxWidth: contentWidth - 180,
    });
  }

  if (payload.focus) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(99, 102, 241);
    doc.text(
      payload.focus.toUpperCase(),
      headerX + 20,
      headerY + headerHeight - 18,
      {
        maxWidth: contentWidth - 180,
      },
    );
  }

  const photoSize = 82;
  if (payload.photoDataUrl) {
    const photoX = headerX + contentWidth - photoSize - 20;
    const photoY = headerY + (headerHeight - photoSize) / 2;
    try {
      const format = payload.photoDataUrl.startsWith("data:image/png")
        ? "PNG"
        : "JPEG";
      const props = doc.getImageProperties(payload.photoDataUrl);
      const scale = Math.min(
        photoSize / props.width,
        photoSize / props.height,
      );
      const width = props.width * scale;
      const height = props.height * scale;
      const imageX = photoX + (photoSize - width) / 2;
      const imageY = photoY + (photoSize - height) / 2;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.roundedRect(photoX, photoY, photoSize, photoSize, 10, 10, "S");
      doc.addImage(payload.photoDataUrl, format, imageX, imageY, width, height);
    } catch {
      // Ignore image errors and continue rendering the PDF.
    }
  }

  const summaryTop = headerY + headerHeight + 26;
  const sectionLabelColor: [number, number, number] = [100, 116, 139];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...sectionLabelColor);
  doc.text("PROFILE", headerX, summaryTop);

  const summary = payload.summary || "";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const summaryLines = doc.splitTextToSize(summary, contentWidth);
  const summaryLineHeight = 15;
  doc.text(summaryLines, headerX, summaryTop + 18, {
    maxWidth: contentWidth,
    lineHeightFactor: 1.4,
  });

  let contentTop = summaryTop + 18 + summaryLines.length * summaryLineHeight;
  contentTop += 18;

  const columnGap = 26;
  const leftWidth = Math.min(190, (contentWidth - columnGap) * 0.36);
  const rightWidth = contentWidth - leftWidth - columnGap;
  const leftX = headerX;
  const rightX = headerX + leftWidth + columnGap;
  const columnHeight = pageHeight - marginY - contentTop - 30;

  let leftY = contentTop;
  const maxLeftY = contentTop + columnHeight;

  if (payload.skills.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...sectionLabelColor);
    doc.text("KEY SKILLS", leftX, leftY);
    leftY += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const maxSkills = payload.skills.slice(0, 20);
    for (const skill of maxSkills) {
      if (leftY > maxLeftY - 20) break;
      const lines = doc.splitTextToSize(skill, leftWidth - 14);
      const blockHeight = lines.length * 12;
      doc.circle(leftX + 2.5, leftY - 3, 1.2, "F");
      doc.text(lines, leftX + 10, leftY, {
        maxWidth: leftWidth - 14,
        lineHeightFactor: 1.4,
      });
      leftY += blockHeight + 4;
    }

    leftY += 10;
  }

  if (payload.focus && leftY <= maxLeftY - 30) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...sectionLabelColor);
    doc.text("FOCUS AREAS", leftX, leftY);
    leftY += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const focusLines = doc.splitTextToSize(payload.focus, leftWidth - 4);
    doc.text(focusLines, leftX, leftY, {
      maxWidth: leftWidth,
      lineHeightFactor: 1.4,
    });
  }

  let rightY = contentTop;
  const maxRightY = contentTop + columnHeight;

  for (const section of payload.sections) {
    if (rightY > maxRightY - 32) break;

    const heading = section.heading || "Section";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...sectionLabelColor);
    doc.text(heading.toUpperCase(), rightX, rightY);
    rightY += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    for (const bullet of section.bullets) {
      const lines = doc.splitTextToSize(bullet, rightWidth - 14);
      const blockHeight = lines.length * 13;
      if (rightY + blockHeight > maxRightY) {
        rightY = maxRightY;
        break;
      }
      doc.circle(rightX + 2.5, rightY - 3, 1.3, "F");
      doc.text(lines, rightX + 10, rightY, {
        maxWidth: rightWidth - 14,
        lineHeightFactor: 1.4,
      });
      rightY += blockHeight + 4;
    }

    rightY += 10;
  }

  const baseName =
    payload.fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "veriventure-resume";

  doc.save(`${baseName}.pdf`);
}

