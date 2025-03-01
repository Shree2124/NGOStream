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

const generateEventReportExcel = async (
  workbook: ExcelJS.Workbook,
  data: any[]
) => {
  console.log(data)
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
      totalParticipants: event.totalParticipants || 0, // Aggregated field
      totalMonetaryDonations:
        event.totalMonetaryDonations?.toLocaleString() || "0",
      totalInKindDonations: event.totalInKindDonations?.toLocaleString() || "0",
      donationCount: event.donationCount || 0, // Aggregated field
    });
  });

  return sheet;
};

const generateDonorReportExcel = async (
  workbook: ExcelJS.Workbook,
  data: any[]
) => {
  const sheet = workbook.addWorksheet("Donor Report");

  // Define columns
  sheet.columns = [
    { header: "Donor Name", key: "name", width: 25 },
    { header: "Amount (₹)", key: "amount", width: 15 },
    { header: "Type", key: "type", width: 15 },
    { header: "Date", key: "date", width: 15 },
  ];

  // Add rows
  data.forEach((donation) => {
    sheet.addRow({
      name: donation.name,
      amount: donation.amount,
      type: donation.type,
      date: formatDate(donation.date),
    });
  });

  return sheet;
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

    try {
      if (reportType === "event") {
        await generateEventReportExcel(workbook, data);
      } else if (reportType === "donor") {
        await generateDonorReportExcel(workbook, data);
      } else {
        return reject("Invalid report type.");
      }

      await workbook.xlsx.writeFile(filePath);
      resolve(filePath);
    } catch (error) {
      reject(`Error generating Excel file: ${error}`);
    }
  });
};
