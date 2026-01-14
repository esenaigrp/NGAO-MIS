import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const printIncidentPdf = (incident: any) => {
  const doc = new jsPDF();

  let cursorY = 20;

  /* =========================
     HEADER
  ========================== */
  doc.setFontSize(16);
  doc.text("Incident Report", 14, cursorY);

  cursorY += 6;
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, cursorY);

  cursorY += 10;

  /* =========================
     INCIDENT DETAILS
  ========================== */
  autoTable(doc, {
    startY: cursorY,
    theme: "grid",
    head: [["Field", "Value"]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [240, 240, 240] },
    body: [
      ["Title", incident.title || "—"],
      ["Description", incident.description || "—"],
      ["Incident Type", incident.incident_type || "—"],
      ["Reporter Name", incident.reporter_name || "—"],
      ["Reporter Email", incident.reporter_email || "—"],
      ["Reporter Phone", incident.reporter_phone || "—"],
      ["Reporter Statement", incident.reporter_statement || "—"],
      [
        "Date Reported",
        incident.date_reported
          ? new Date(incident.date_reported).toLocaleDateString()
          : "—",
      ],
      ["Location", incident.area?.name || "—"],
      ["Status", incident.status || "—"],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 10;

  /* =========================
     WITNESSES SECTION
  ========================== */
  doc.setFontSize(13);
  doc.text("Witnesses", 14, cursorY);

  cursorY += 4;

  if (incident.witnesses && incident.witnesses.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [240, 240, 240] },
      head: [["#", "Name", "Email", "Phone", "Statement"]],
      body: incident.witnesses.map((w: any, index: number) => [
        index + 1,
        w.name || "—",
        w.email || "—",
        w.phone || "—",
        w.statement || "—",
      ]),
    });

    cursorY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text("No witnesses recorded for this incident.", 14, cursorY + 4);
    cursorY += 12;
  }

  /* =========================
     FOOTER
  ========================== */
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.text(
    "This document is system-generated and valid without a signature.",
    14,
    pageHeight - 10
  );

  /* =========================
     SAVE
  ========================== */
  doc.save(`incident-${incident.id}.pdf`);
};
