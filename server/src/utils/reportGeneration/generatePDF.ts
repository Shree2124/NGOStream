import PDFDocument from "pdfkit";
import fs from "fs";
import moment from "moment";

const colors = {
  primary: "#1E5F8C",
  text: "#333333",
  border: "#E4E7EB",
  footer: "#666666",
  cardBg: "#FFFFFF",
};

const styles = {
  title: { font: "Helvetica-Bold", size: 24, color: colors.primary },
  subtitle: { font: "Helvetica", size: 14, color: colors.primary },
  header: { font: "Helvetica-Bold", size: 16, color: colors.primary },
  label: { font: "Helvetica-Bold", size: 12, color: colors.text },
  value: { font: "Helvetica", size: 12, color: colors.text },
  footer: { font: "Helvetica", size: 10, color: colors.footer },
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

const applyStyle = (doc: PDFKit.PDFDocument, style: any) => {
  doc.font(style.font).fontSize(style.size).fillColor(style.color);
};

const generateDonationReport = (doc: PDFKit.PDFDocument, data: any[]) => {
  console.log(data.forEach((i) => i.donations));
  applyStyle(doc, styles.title);
  doc.text("Donation Report", { align: "center" });

  if (data.length === 0) {
    applyStyle(doc, styles.subtitle);
    doc.text("No donations recorded.", 50, 85, { align: "center" });
    return;
  }

  doc.moveDown(2);
  applyStyle(doc, styles.subtitle);
  doc.text("Summary of donations and contributors", { align: "center" });

  data.forEach((donor, index) => {
    if (index > 0) doc.addPage();

    applyStyle(doc, styles.header);
    doc.text(donor.donorName || "Anonymous", 50, 100);

    const leftCol = 50;
    const rightCol = 320;
    let currentY = 130;
    const lineHeight = 20;

    const addText = (label: string, value: any, x: number, y: number) => {
      if (value) {
        applyStyle(doc, styles.label);
        doc.text(label, x, y);
        applyStyle(doc, styles.value);
        doc.text(value, x, y + lineHeight);
        return y + lineHeight * 2;
      }
      return y;
    };

    currentY = addText("Email:", donor.donorEmail, leftCol, currentY);
    currentY = addText("Phone:", donor.donorPhone, rightCol, currentY);
    currentY = addText("Address:", donor.donorAddress, leftCol, currentY);
    currentY = addText(
      "Total Monetary Donations:",
      `₹${donor.totalMonetaryDonations.toLocaleString()}`,
      rightCol,
      currentY
    );
    currentY = addText(
      "Total In-Kind Donations:",
      `₹${donor.totalInKindDonations.toLocaleString()}`,
      rightCol,
      currentY
    );

    currentY += lineHeight;

    if (donor.donations && donor.donations.length > 0) {
      applyStyle(doc, styles.header);
      doc.text("Donation Details", leftCol, currentY);
      currentY += lineHeight;

      doc
        .moveTo(leftCol, currentY)
        .lineTo(doc.page.width - 50, currentY)
        .strokeColor(colors.border)
        .stroke();
      currentY += 5;

      const colX = [leftCol, leftCol + 150, leftCol + 300, leftCol + 450];
      const rowHeight = 25;

      applyStyle(doc, styles.label);
      doc.text("Amount", colX[0], currentY);
      doc.text("Type", colX[1], currentY);
      doc.text("Date", colX[2], currentY);

      doc
        .moveTo(leftCol, currentY + rowHeight - 5)
        .lineTo(doc.page.width - 50, currentY + rowHeight - 5)
        .strokeColor(colors.border)
        .stroke();
      currentY += rowHeight;

      donor.donations.forEach((donation: any) => {
        applyStyle(doc, styles.value);

        // Ensure the date is properly formatted
        let formattedDate = "N/A";
        if (donation.date) {
          const parsedDate = moment(donation.date);
          formattedDate = parsedDate.isValid()
            ? parsedDate.format("DD MMM YYYY")
            : "Invalid Date";
        }

        doc.text(
          donation.amount ? `₹${donation.amount}` : "N/A",
          colX[0],
          currentY
        );
        doc.text(donation.type || "Unknown", colX[1], currentY);
        doc.text(formattedDate, colX[2], currentY);

        currentY += rowHeight;
      });
    }

    applyStyle(doc, styles.footer);
    doc.text(
      "Your contributions help us create a better world.",
      50,
      doc.page.height - 70,
      { align: "center" }
    );
  });
};

const generateMemberReport = (doc: PDFKit.PDFDocument, data: any[]) => {
  data?.forEach((member, index) => {
    if (index > 0) doc.addPage();

    applyStyle(doc, styles.title);
    doc.text("Member Report", 50, 50, { align: "center" });

    applyStyle(doc, styles.subtitle);
    doc.text(
      "Detailed information about members and their participation history",
      50,
      85,
      { align: "center" }
    );

    doc.roundedRect(50, 130, doc.page.width - 100, 400, 10).fill(colors.cardBg);

    applyStyle(doc, styles.header);
    doc.text(member.fullName, 70, 150);

    applyStyle(doc, styles.value);
    doc.font("Helvetica-Oblique").text(member.bio || "No bio provided", 70, 180, {
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

    applyStyle(doc, styles.label);
    doc.text("Gender:", leftCol, startY);
    applyStyle(doc, styles.value);
    doc.text(member?.gender, leftCol, startY + lineHeight);

    applyStyle(doc, styles.label);
    doc.text("Age:", leftCol, startY + lineHeight * 2);
    applyStyle(doc, styles.value);
    doc.text(member?.age.toString(), leftCol, startY + lineHeight * 3);

    applyStyle(doc, styles.label);
    doc.text("Email:", rightCol, startY);
    applyStyle(doc, styles.value);
    doc.text(member?.email, rightCol, startY + lineHeight);

    applyStyle(doc, styles.label);
    doc.text("Phone:", rightCol, startY + lineHeight * 2);
    applyStyle(doc, styles.value);
    doc.text(member?.phone, rightCol, startY + lineHeight * 3);

    applyStyle(doc, styles.label);
    doc.text("Address:", leftCol, startY + lineHeight * 4);
    applyStyle(doc, styles.value);
    doc.text(member?.address, leftCol, startY + lineHeight * 5, {
      width: doc.page.width - 140,
    });

    applyStyle(doc, styles.label);
    doc.text("Role:", rightCol, startY + lineHeight * 4);
    applyStyle(doc, styles.value);
    doc.text(member?.role, rightCol, startY + lineHeight * 5);


    applyStyle(doc, styles.footer);
    doc.text(
      "Thank you for being a valued member of our community.",
      50,
      doc.page.height - 70,
      { align: "center" }
    );
  });
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
    }  else if (reportType === "member") {
      generateMemberReport(doc, data);
    } else {
      reject("Invalid report type");
      return;
    }

    doc.end();
    stream.on("finish", () => resolve(filePath));
  });
};
