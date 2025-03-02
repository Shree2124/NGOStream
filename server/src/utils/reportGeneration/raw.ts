// import { Request, Response } from "express";
// import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "docx";
// import ExcelJS from "exceljs";
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import path from "path";
// import { Event } from "../models/events.model";
// import uploadOnCloudinary from "../utils/cloudinary";
// // import { Response } from "express";

// export const generateEventReportWeekly = async (req: any, res: Response): Promise<void>  => {
//   try {
//     const { eventIds, format } = req.body;

//     if (!eventIds || eventIds.length === 0) {
//       res.status(400).json({ message: "Event IDs are required." });
//       return;
//     }

//     // Find events based on the given event IDs
//     const events = await Event.find({ _id: { $in: eventIds } });

//     if (!events.length) {
//        res.status(404).json({ message: "No events found for the given IDs." });
//        return;
//     }

//     // Generate report based on format (Excel or PDF)
//     let filePath: string;
//     if (format === "excel") {
//       filePath = await generateExcel(events);
//      }
//      else if (format === "word") {
//          filePath = await generateWord(events); // Added Word report generation 
//          }
//       else {
//         filePath = await generatePDF(events);
//     }
    

//     // Upload the file to Cloudinary
//     const uploadResult = await uploadOnCloudinary(filePath);

    

//     // Return the Cloudinary file URL
//     res.json({ message: "Report generated successfully.", fileUrl: uploadResult?.url });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // Function to generate an Excel report
// const generateExcel = async (events: any[]) => {
//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet("Events Report");

//   sheet.addRow(["Event Name", "Description", "Start Date", "End Date", "Location", "Type", "Status"]);

//   events.forEach((event: { name: any; description: any; startDate: { toISOString: () => string; }; endDate: { toISOString: () => string; }; location: any; eventType: any; status: any; }) => {
//     sheet.addRow([
//       event.name,
//       event.description,
//       event.startDate.toISOString().split("T")[0], // Format date
//       event.endDate.toISOString().split("T")[0],
//       event.location,
//       event.eventType,
//       event.status,
//     ]);
//   });

//   const filePath = path.join("reports", events_report.xlsx);
//   await workbook.xlsx.writeFile(filePath);
//   return filePath;
// };

// // Function to generate a PDF report
// const generatePDF = async (events: any[]): Promise<string> => {
//     // Create document
//     const doc = new PDFDocument({ 
//       size: "A4", 
//       margin: 50,
//       bufferPages: true
//     });
    
//     // Set up file path and stream
//     const filePath = path.join("reports", events_report_${Date.now()}.pdf);
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);
    
//     // Define colors to match the provided design
//     const colors = {
//       gradientStart: "#4AD66D",  // Green from left side
//       gradientEnd: "#4AA5D6",    // Blue from right side
//       primary: "#1E5F8C",        // Dark blue for titles
//       secondary: "#FFFFFF",      // White
//       cardBg: "#F8F9FA",         // Light gray for cards
//       text: "#333333",           // Dark text
//       accent: "#FF5757",         // Red accent from NGO logo
//       border: "#E4E7EB"          // Light border
//     };
    
//     // Define styles to match the design
//     const styles = {
//       title: { font: "Helvetica-Bold", size: 24, color: colors.primary },
//       subtitle: { font: "Helvetica", size: 14, color: colors.primary },
//       header: { font: "Helvetica-Bold", size: 16, color: colors.primary },
//       label: { font: "Helvetica-Bold", size: 12, color: colors.text },
//       value: { font: "Helvetica", size: 12, color: colors.text },
//       footer: { font: "Helvetica", size: 10, color: colors.primary }
//     };
    
//     // Helper function to apply text style
//     const applyStyle = (style : any) => {
//       doc.font(style.font).fontSize(style.size).fillColor(style.color);
//     };
    
//     // Helper for gradient fills (simulated with multiple rectangles)
//     const drawGradientBackground = (x: number, y: number, width: number, height: number) => {
//       const segments = 20; // More segments for smoother gradient
//       const segmentWidth = width / segments;
      
//       for (let i = 0; i < segments; i++) {
//         // Calculate color interpolation (0 to 1)
//         const t = i / (segments - 1);
        
//         // Parse hex colors
//         const r1 = parseInt(colors.gradientStart.substring(1, 3), 16);
//         const g1 = parseInt(colors.gradientStart.substring(3, 5), 16);
//         const b1 = parseInt(colors.gradientStart.substring(5, 7), 16);
        
//         const r2 = parseInt(colors.gradientEnd.substring(1, 3), 16);
//         const g2 = parseInt(colors.gradientEnd.substring(3, 5), 16);
//         const b2 = parseInt(colors.gradientEnd.substring(5, 7), 16);
        
//         // Interpolate
//         const r = Math.round(r1 + (r2 - r1) * t);
//         const g = Math.round(g1 + (g2 - g1) * t);
//         const b = Math.round(b1 + (b2 - b1) * t);
        
//         // Convert to hex
//         const interpolatedColor = #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')};
        
//         // Draw the segment
//         doc.fillColor(interpolatedColor);
//         doc.rect(x + i * segmentWidth, y, segmentWidth, height).fill();
//       }
//     };
    
//     // Style the document
//     events.forEach((event, index) => {
//       if (index > 0) {
//         doc.addPage();
//       }
      
//       // Draw gradient background to match the design
//       drawGradientBackground(0, 0, doc.page.width, doc.page.height);
      
//       // Add title in the style of "Our Impact in Action"
//       applyStyle(styles.title);
//       doc.text("Events Report", 50, 50, { align: "center" });
      
//       // Add subtitle similar to the design
//       applyStyle(styles.subtitle);
//       doc.text("Discover how your events are making a real difference in communities", 50, 85, { align: "center" });
      
//       // Create a card for the event (similar to the NGO cards in the design)
//       doc.roundedRect(50, 130, doc.page.width - 100, 220, 10)
//          .fill(colors.cardBg);
      
//       // Event title in the card (similar to "first" in the design)
//       applyStyle(styles.header);
//       doc.text(${event.name}, 70, 150);
      
//       // Event description (similar to the quotes in the design)
//       applyStyle(styles.value);
//       doc.font("Helvetica-Oblique");
//       doc.text("${event.description}", 70, 180, { width: doc.page.width - 140 });
//       doc.font("Helvetica");
      
//       // Separator line
//       doc.moveTo(70, 230).lineTo(doc.page.width - 70, 230)
//          .strokeColor(colors.border).lineWidth(1).stroke();
      
//       // Event details in two columns
//       const leftCol = 70;
//       const rightCol = doc.page.width / 2 + 20;
//       const startY = 250;
//       const lineHeight = 25;
      
//       // Left column info
//       applyStyle(styles.label);
//       doc.text("Start Date:", leftCol, startY);
//       applyStyle(styles.value);
//       doc.text(event.startDate.toISOString().split("T")[0], leftCol, startY + lineHeight);
      
//       applyStyle(styles.label);
//       doc.text("End Date:", leftCol, startY + lineHeight * 2);
//       applyStyle(styles.value);
//       doc.text(event.endDate.toISOString().split("T")[0], leftCol, startY + lineHeight * 3);
      
//       // Right column info
//       applyStyle(styles.label);
//       doc.text("Location:", rightCol, startY);
//       applyStyle(styles.value);
//       doc.text(event.location, rightCol, startY + lineHeight);
      
//       applyStyle(styles.label);
//       doc.text("Status:", rightCol, startY + lineHeight * 2);
//       applyStyle(styles.value);
//       doc.text(event.status, rightCol, startY + lineHeight * 3);
      
//       // Add "monetary" and "in-kind" indicators as shown in the design
//       doc.roundedRect(70, 330, 85, 25, 12).fillAndStroke("#E8F5F0", "#4AD66D");
//       applyStyle({...styles.value, color: "#4AD66D"});
//       doc.text("Type: " + event.eventType, 80, 337);
      
//       // Create additional cards for other events if needed
//       if (events.length > 1) {
//         const miniCardsStartY = 380;
//         const miniCardHeight = 120;
//         const miniCardWidth = (doc.page.width - 120) / 2;
        
//         // Display up to 2 other events as mini cards
//         for (let i = 0; i < Math.min(2, events.length - 1); i++) {
//           const otherEvent = events[(index + i + 1) % events.length];
//           const cardX = i === 0 ? 50 : 70 + miniCardWidth;
          
//           doc.roundedRect(cardX, miniCardsStartY, miniCardWidth, miniCardHeight, 10)
//              .fill(colors.cardBg);
          
//           applyStyle(styles.header);
//           doc.text(otherEvent.name, cardX + 20, miniCardsStartY + 20, { width: miniCardWidth - 40 });
          
//           applyStyle(styles.value);
//           doc.font("Helvetica-Oblique");
//           doc.text("${otherEvent.eventType}", cardX + 20, miniCardsStartY + 50, { width: miniCardWidth - 40 });
//           doc.font("Helvetica");
//         }
//       }
      
//       // Add footer text similar to the design
//       applyStyle(styles.footer);
//       doc.text("Together, we're creating lasting positive change in our communities.", 
//                50, doc.page.height - 70, { align: "center" });
//     });
    
//     // Add page numbers to all pages
//     const pageCount = doc.bufferedPageRange().count;
//     for (let i = 0; i < pageCount; i++) {
//       doc.switchToPage(i);
      
//       // Simple footer with page number
//       applyStyle(styles.footer);
//       doc.text(
//         Page ${i + 1} of ${pageCount},
//         doc.page.width - 80, doc.page.height - 40
//       );
//     }
    
//     // Finalize the document
//     doc.end();
    
//     return new Promise((resolve) => {
//       stream.on("finish", () => resolve(filePath));
//     });
//   };
// const generateWord = async (events: any[]): Promise<string> => {
//     const doc: any = new Document({
//         sections: [
//           {
//             properties: {},
//             children: [], // Ensure an empty array if no content is added yet
//           },
//         ],
//       });
  
//     // Add title
//     doc.addSection({
//       children: [
//         new Paragraph({
//           children: [new TextRun({ text: "Events Report", bold: true, size: 32 })],
//           spacing: { after: 300 },
//         }),
//       ],
//     });
  
//     // Create table header
//     const tableRows = [
//       new TableRow({
//         children: [
//           "Event Name", "Description", "Start Date", "End Date", "Location", "Type", "Status"
//         ].map((header) =>
//           new TableCell({
//             children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
//           })
//         ),
//       }),
//     ];
  
//     // Add event data to table
//     events.forEach((event) => {
//       tableRows.push(
//         new TableRow({
//           children: [
//             event.name,
//             event.description,
//             event.startDate.toISOString().split("T")[0],
//             event.endDate.toISOString().split("T")[0],
//             event.location,
//             event.eventType,
//             event.status,
//           ].map((text) => new TableCell({ children: [new Paragraph(text)] })),
//         })
//       );
//     });
  
//     // Add table to document
//     doc.addSection({
//       children: [new Table({ rows: tableRows })],
//     });
  
//     // Define file path
//     const filePath = path.join("reports", events_report.docx);
    
//     // Ensure directory exists
//     if (!fs.existsSync("reports")) {
//       fs.mkdirSync("reports");
//     }
  
//     // Write file
//     const buffer = await Packer.toBuffer(doc);
//     fs.writeFileSync(filePath, buffer);
  
//     return filePath;
//   };