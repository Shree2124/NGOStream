import { fetchData } from "./fetchData";
import { formatData } from "./formatData";
import { generatePDF } from "./generatePDF";
import { generateWord } from "./generateWord";
import { generateExcel } from "./generateExcel";
import path from "path";

export const generateReport = async (
  ids: string[],
  type: "event" | "donor",
  format: "pdf" | "word" | "excel"
) => {
  try {
    const rawData = await fetchData(ids, type);
    const formattedData = formatData(rawData, type);
    let generatedFilePath: any;
    console.log("raw data:", rawData);

    const filePath = path.join(
      __dirname,
      `../../../public/temp/${type}-report.${
        format === "pdf" ? "pdf" : format === "word" ? "docx" : "xlsx"
      }`
    );
    console.log(filePath);

    switch (format) {
      case "pdf":
        generatedFilePath = await generatePDF(rawData, type, filePath);
        break;
        23;
      case "word":
        generatedFilePath = await generateWord(formattedData, type, filePath);
        break;
      case "excel":
        generatedFilePath = await generateExcel(rawData, type, filePath);
        break;
      default:
        throw new Error("Invalid format");
    }

    console.log(`Report generated: ${generatedFilePath}`);
    return generatedFilePath;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
