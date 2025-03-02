import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import moment from "moment";

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const formatDate = (date: string) =>
  moment(date).format("DD MMM YYYY, hh:mm A");

const generateEventReportExcel = async (data: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Events Report");

  // Define columns
  sheet.columns = [
    { header: "Event Name", key: "name", width: 25 },
    { header: "Description", key: "description", width: 40 },
    { header: "Start Date", key: "startDate", width: 20 },
    { header: "End Date", key: "endDate", width: 20 },
    { header: "Location", key: "location", width: 20 },
    { header: "Type", key: "eventType", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Total Participants", key: "totalParticipants", width: 20 },
    {
      header: "Monetary Donations (₹)",
      key: "totalMonetaryDonations",
      width: 25,
    },
    { header: "In-Kind Donations (₹)", key: "totalInKindDonations", width: 25 },
    { header: "Total Donations Received", key: "donationCount", width: 20 },
  ];

  // Add rows
  data.forEach((event) => {
    sheet.addRow({
      name: event.name,
      description: event.description,
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
      location: event.location,
      eventType: event.eventType,
      status: event.status,
      totalParticipants: event.totalParticipants || 0,
      totalMonetaryDonations:
        event.totalMonetaryDonations?.toLocaleString() || "0",
      totalInKindDonations: event.totalInKindDonations?.toLocaleString() || "0",
      donationCount: event.donationCount || 0,
    });
  });

  // ✅ Ensure the `public/temp` directory exists
  const tempDir = path.join(__dirname, "../../../public/temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // ✅ Define the file path
  const filePath = path.join(tempDir, `${Date.now()}.xlsx`);

  try {
    // ✅ Remove existing file if needed
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    // ✅ Save the workbook to the defined file path
    await workbook.xlsx.writeFile(filePath);
    console.log("✅ Excel file created successfully:", filePath);

    return filePath;
  } catch (error) {
    console.error("❌ Error generating Excel file:", error);
    throw new Error("Failed to generate event report.");
  }
};

const generateDonorReportExcel = async (data: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Donor Report");

  // Define column headers
  sheet.columns = [
    { header: "Donor Name", key: "donorName", width: 25 },
    { header: "Email", key: "donorEmail", width: 30 },
    { header: "Phone", key: "donorPhone", width: 15 },
    { header: "Address", key: "donorAddress", width: 40 },
    {
      header: "Total Monetary Donations (₹)",
      key: "totalMonetaryDonations",
      width: 25,
    },
    {
      header: "Total In-Kind Donations (₹)",
      key: "totalInKindDonations",
      width: 25,
    },
    { header: "Donation Amount (₹)", key: "amount", width: 20 },
    { header: "Donation Type", key: "type", width: 20 },
    { header: "Donation Date", key: "date", width: 20 },
  ];

  // Add rows: Loop through donors and their donations
  data.forEach((donor) => {
    if (donor.donations.length === 0) {
      sheet.addRow({
        donorName: donor.donorName || "Anonymous",
        donorEmail: donor.donorEmail || "N/A",
        donorPhone: donor.donorPhone || "N/A",
        donorAddress: donor.donorAddress || "N/A",
        totalMonetaryDonations: `₹${donor.totalMonetaryDonations.toLocaleString()}`,
        totalInKindDonations: `₹${donor.totalInKindDonations.toLocaleString()}`,
        amount: "N/A",
        type: "N/A",
        date: "N/A",
      });
    } else {
      donor.donations.forEach((donation: any) => {
        sheet.addRow({
          donorName: donor.donorName || "Anonymous",
          donorEmail: donor.donorEmail || "N/A",
          donorPhone: donor.donorPhone || "N/A",
          donorAddress: donor.donorAddress || "N/A",
          totalMonetaryDonations: `₹${donor.totalMonetaryDonations.toLocaleString()}`,
          totalInKindDonations: `₹${donor.totalInKindDonations.toLocaleString()}`,
          amount: donation.amount
            ? `₹${donation.amount.toLocaleString()}`
            : "N/A",
          date: donation.createdAt
            ? new Date(donation.createdAt).toLocaleDateString()
            : "N/A",
        });
      });
    }
  });

  // ✅ Ensure the `public/temp` directory exists
  const filePath = path.join(
    __dirname,
    `../../../public/temp/${Date.now()}.xlsx`
  );

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath); // Delete the previous file safely
    }

    await workbook.xlsx.writeFile(filePath);
    console.log("✅ Excel file created successfully:", filePath);
    return filePath;
  } catch (error) {
    console.error("❌ Error generating Excel file:", error);
    throw new Error("Failed to generate report.");
  }
};

export const generateExcel = async (
  data: any[],
  reportType: string,
  filePath: string
) => {
  return new Promise(async (resolve, reject) => {
    // if (!data || data.length === 0) {
    //   return reject("No data available for report generation.");
    // }

    const workbook = new ExcelJS.Workbook();
    ensureDirectoryExists(path.dirname(filePath));
    let generatedFilePath: string | null = null;

    try {
      if (reportType === "event") {
        generatedFilePath = await generateEventReportExcel(data);
      } else if (reportType === "donor") {
        generatedFilePath = await generateDonorReportExcel(data);
      } else {
        return reject("Invalid report type.");
      }

      resolve(generatedFilePath);
    } catch (error) {
      reject(`Error generating Excel file: ${error}`);
    }
  });
};
