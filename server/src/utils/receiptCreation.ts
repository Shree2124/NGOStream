import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePDFReceipt = async (donation: any, donor: any) => {
  return new Promise((resolve, reject) => {
    const receiptPath = path.join(
      __dirname,
      `../../public/temp/${donation._id}-${donor.name}.pdf`
    );
    console.log("Generated PDF path:", receiptPath);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(receiptPath);
    doc.pipe(writeStream);

    // Add content to the PDF
    doc.fontSize(20).text("Thank You for Your Donation!", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Receipt ID: ${donation._id}`);
    doc.text(`Date: ${new Date(donation.createdAt).toLocaleString()}`);
    doc.moveDown();
    doc.text(`Donor Name: ${donor.name}`);
    doc.text(`Email: ${donor.email}`);
    doc.text(`Phone: ${donor.phone}`);
    doc.text(`Address: ${donor.address}`);
    doc.moveDown();
    doc.text(`Donation Type: ${donation.donationType}`);
    if (donation.donationType === "Monetary") {
      doc.text(
        `Amount: ${donation.monetaryDetails.amount} ${donation.monetaryDetails.currency}`
      );
      doc.text(`Payment Method: ${donation.monetaryDetails.paymentMethod}`);
      doc.text(`Payment Status: ${donation.monetaryDetails.paymentStatus}`);
    } else if (donation.donationType === "In-Kind") {
      doc.text(`Item: ${donation.inKindDetails.itemName}`);
      doc.text(`Quantity: ${donation.inKindDetails.quantity}`);
      doc.text(`Estimated Value: ${donation.inKindDetails.estimatedValue}`);
    }

    doc.moveDown(2);
    doc.fontSize(16).text("We appreciate your generosity!", { align: "center" });

    doc.end();

    writeStream.on("finish", () => resolve(receiptPath));
    writeStream.on("error", (error) => reject(error));
  });
};
