import PDFDocument from "pdfkit";
import fs from "fs";
import moment from "moment";

const colors = {
  gradientStart: "#4AD66D", // Green
  gradientEnd: "#4AA5D6", // Blue
  primary: "#1E5F8C", // Dark blue
  secondary: "#FFFFFF", // White
  cardBg: "#F8F9FA", // Light gray
  text: "#333333", // Dark text
  accent: "#FF5757", // Red accent
  border: "#E4E7EB", // Light border
};

const styles = {
  title: { font: "Helvetica-Bold", size: 24, color: colors.primary },
  subtitle: { font: "Helvetica", size: 14, color: colors.primary },
  header: { font: "Helvetica-Bold", size: 16, color: colors.primary },
  label: { font: "Helvetica-Bold", size: 12, color: colors.text },
  value: { font: "Helvetica", size: 12, color: colors.text },
  footer: { font: "Helvetica", size: 10, color: colors.primary },
};

const applyStyle = (doc: PDFKit.PDFDocument, style: any) => {
  doc.font(style.font).fontSize(style.size).fillColor(style.color);
};

const drawGradientBackground = (doc: PDFKit.PDFDocument) => {
  const segments = 20;
  const segmentWidth = doc.page.width / segments;

  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const r = Math.round(0x4a + (0x4a - 0x4a) * t);
    const g = Math.round(0xd6 + (0xa5 - 0xd6) * t);
    const b = Math.round(0x6d + (0xd6 - 0x6d) * t);

    doc.fillColor(`#${r.toString(16)}${g.toString(16)}${b.toString(16)}`);
    doc.rect(i * segmentWidth, 0, segmentWidth, doc.page.height).fill();
  }
};

const generateEventReport = (doc: PDFKit.PDFDocument, data: any[]) => {
  data?.forEach((event, index) => {
    if (index > 0) doc.addPage();

    applyStyle(doc, styles.title);
    doc.text("Events Report", 50, 50, { align: "center" });

    applyStyle(doc, styles.subtitle);
    doc.text(
      "Discover how your events are making a real difference in communities",
      50,
      85,
      { align: "center" }
    );

    doc.roundedRect(50, 130, doc.page.width - 100, 300, 10).fill(colors.cardBg);

    applyStyle(doc, styles.header);
    doc.text(event.name, 70, 150);

    applyStyle(doc, styles.value);
    doc.font("Helvetica-Oblique").text(event.description, 70, 180, {
      width: doc.page.width - 140,
    });
    doc.font("Helvetica");

    doc
      .moveTo(70, 230)
      .lineTo(doc.page.width - 70, 230)
      .strokeColor(colors.border)
      .stroke();

    const leftCol = 70;
    const rightCol = doc.page.width / 2 + 20;
    const startY = 250;
    const lineHeight = 25;

    const formattedStartDate = moment(event?.startDate).format(
      "DD MMM YYYY, hh:mm A"
    );
    const formattedEndDate = moment(event.endDate).format(
      "DD MMM YYYY, hh:mm A"
    );

    applyStyle(doc, styles.label);
    doc.text("Start Date:", leftCol, startY);
    applyStyle(doc, styles.value);
    doc.text(formattedStartDate, leftCol, startY + lineHeight);

    applyStyle(doc, styles.label);
    doc.text("End Date:", leftCol, startY + lineHeight * 2);
    applyStyle(doc, styles.value);
    doc.text(formattedEndDate, leftCol, startY + lineHeight * 3);

    applyStyle(doc, styles.label);
    doc.text("Location:", rightCol, startY);
    applyStyle(doc, styles.value);
    doc.text(event.location, rightCol, startY + lineHeight);

    applyStyle(doc, styles.label);
    doc.text("Status:", rightCol, startY + lineHeight * 2);
    applyStyle(doc, styles.value);
    doc.text(event.status, rightCol, startY + lineHeight * 3);

    
    const detailsStartY = startY + lineHeight * 5;

    applyStyle(doc, styles.label);
    doc.text("Total Participants:", leftCol, detailsStartY);
    applyStyle(doc, styles.value);
    doc.text(
      event.totalParticipants?.toString() || "0",
      leftCol,
      detailsStartY + lineHeight
    );

    applyStyle(doc, styles.label);
    doc.text(
      "Total Monetary Donations:",
      leftCol,
      detailsStartY + lineHeight * 2
    );
    applyStyle(doc, styles.value);
    doc.text(
      `₹${event.totalMonetaryDonations?.toLocaleString() || "0"}`,
      leftCol,
      detailsStartY + lineHeight * 3
    );

    applyStyle(doc, styles.label);
    doc.text("Total In-Kind Donations:", rightCol, detailsStartY);
    applyStyle(doc, styles.value);
    doc.text(
      `₹${event.totalInKindDonations?.toLocaleString() || "0"}`,
      rightCol,
      detailsStartY + lineHeight
    );

    applyStyle(doc, styles.label);
    doc.text(
      "Total Donations Received:",
      rightCol,
      detailsStartY + lineHeight * 2
    );
    applyStyle(doc, styles.value);
    doc.text(
      event.donationCount?.toString() || "0",
      rightCol,
      detailsStartY + lineHeight * 3
    );

    applyStyle(doc, styles.footer);
    doc.text(
      "Together, we're creating lasting positive change in our communities.",
      50,
      doc.page.height - 70,
      { align: "center" }
    );
  });
};

const generateDonationReport = (doc: PDFKit.PDFDocument, data: any[]) => {
  applyStyle(doc, styles.title);
  doc.text("Donor Report", 50, 50, { align: "center" });

  applyStyle(doc, styles.subtitle);
  doc.text("Summary of donations and contributors", 50, 85, {
    align: "center",
  });

  doc.moveDown(2);
  applyStyle(doc, styles.header);
  doc.text("Donations Summary", 50, 120);

  doc
    .moveTo(50, 140)
    .lineTo(doc.page.width - 50, 140)
    .strokeColor(colors.border)
    .stroke();
  doc.moveDown();

  const tableTop = 160;
  const colX = [50, 200, 350, 500];
  const rowHeight = 25;

  applyStyle(doc, styles.label);
  doc.text("Donor Name", colX[0], tableTop);
  doc.text("Amount", colX[1], tableTop);
  doc.text("Type", colX[2], tableTop);
  doc.text("Date", colX[3], tableTop);

  doc
    .moveTo(50, tableTop + rowHeight - 5)
    .lineTo(doc.page.width - 50, tableTop + rowHeight - 5)
    .strokeColor(colors.border)
    .stroke();

  data.forEach((donation, index) => {
    const y = tableTop + rowHeight * (index + 1);
    applyStyle(doc, styles.value);

    doc.text(donation.name, colX[0], y);
    doc.text(`₹${donation.amount}`, colX[1], y);
    doc.text(donation.type, colX[2], y);
    doc.text(donation.date, colX[3], y);
  });

  doc.moveDown();
  applyStyle(doc, styles.footer);
  doc.text(
    "Your contributions help us create a better world.",
    50,
    doc.page.height - 70,
    { align: "center" }
  );
};

export const generatePDF = async (
  data: any[],
  reportType: string,
  filePath: string
) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    if (reportType === "event") {
      generateEventReport(doc, data);
    } else if (reportType === "donor") {
      generateDonationReport(doc, data);
    } else {
      reject("Invalid report type");
      return;
    }

    doc.end();
    stream.on("finish", () => resolve(filePath));
  });
};
