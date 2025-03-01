import { fetchData } from "./fetchData";
import { formatData } from "./formatData";
import { generatePDF } from "./generatePDF";
import { generateWord } from "./generateWord";
import { generateExcel } from "./generateExcel";
import path from "path";

export const generateReport = async (
  ids: string[],
  type:  "event" | "donor",
  format: "pdf" | "word" | "excel"
) => {
  try {
    const rawData = await fetchData(ids, type);
    const formattedData = formatData(rawData, type);
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
        await generatePDF(rawData, type, filePath);
        break;23
      case "word":
        await generateWord(formattedData, type, filePath);
        break;
      case "excel":
        await generateExcel(rawData, type, filePath);
        break;
      default:
        throw new Error("Invalid format");
    }

    console.log(`Report generated: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
