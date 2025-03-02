import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";

export const generateWord = async (data: any[], reportType: string, filePath: string) => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: `${reportType.toUpperCase()} REPORT`, bold: true })],
          }),
          ...data.map((item) =>
            new Paragraph({
              children: Object.keys(item).map(
                (key) => new TextRun(`${key}: ${item[key]}\n`)
              ),
            })
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
};
