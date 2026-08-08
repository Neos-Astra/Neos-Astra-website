// src/lib/receiptTemplate.ts
import fs from "fs";
import path from "path";

let logoDataUri = "";
try {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    const b64 = fs.readFileSync(logoPath).toString("base64");
    logoDataUri = `data:image/png;base64,${b64}`;
  }
} catch (e) {}

export interface ReceiptData {
  registrationNo: string;
  studentName: string;
  courseTitle: string;
  admissionFee: string;
  kitPrice: string;
  total: string;
  date?: string;
  paymentMode?: string;
}

export function generateOfficialFeeReceiptHTML(data: ReceiptData): string {
  const dateStr = data.date || new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const receiptNo = data.registrationNo;

  const renderSingleReceipt = (
    feeTypeTitle: string,
    amountStr: string,
    copyType: "STUDENT COPY" | "OFFICE COPY"
  ) => `
    <div class="receipt-box">
      <!-- Top Brand Header -->
      <div class="receipt-header">
        <div class="header-left">
          <div class="brand-title">NEOS ASTRA</div>
          <div class="brand-subtitle">SCHOOL OF INNOVATION</div>
          <div class="brand-web">www.neosastra.com | +91 9348059284</div>
        </div>
        <div class="header-center">
          ${
            logoDataUri
              ? `<img src="${logoDataUri}" alt="Neos Astra Logo" style="height: 60px; max-width: 120px; object-fit: contain;" />`
              : `<div class="logo-circle">
                  <svg width="55" height="55" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="46" stroke="#000" stroke-width="2.5" fill="#fff"/>
                    <path d="M25 65 C 25 35, 75 35, 75 65" stroke="#000" stroke-width="2.5" fill="none"/>
                    <circle cx="38" cy="48" r="6" fill="#000"/>
                    <circle cx="62" cy="48" r="6" fill="#000"/>
                    <text x="50" y="78" text-anchor="middle" font-family="Times New Roman, serif" font-size="14" font-weight="bold" fill="#000">Neos Astra</text>
                  </svg>
                </div>`
          }
        </div>
        <div class="header-right">
          <div class="receipt-badge">FEE RECEIPT</div>
          <div class="copy-badge">(${copyType})</div>
        </div>
      </div>

      <!-- Info Table 1 (Receipt No, Date, Student Name, Course) -->
      <table class="grid-table">
        <tr>
          <td style="width: 55%;"><strong>RECEIPT NO.:</strong> ${receiptNo}</td>
          <td style="width: 45%;"><strong>DATE:</strong> ${dateStr}</td>
        </tr>
        <tr>
          <td style="width: 55%;"><strong>STUDENT NAME:</strong> ${data.studentName}</td>
          <td style="width: 45%;"><strong>COURSE:</strong> ${data.courseTitle}</td>
        </tr>
      </table>

      <!-- Amount Table -->
      <table class="grid-table amount-table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th style="width: 160px; text-align: right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${feeTypeTitle}</td>
            <td style="text-align: right;">${amountStr}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total Paid</strong></td>
            <td style="text-align: right;"><strong>${amountStr}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Payment Mode -->
      <div class="payment-mode-line">
        <strong>Payment Mode:</strong> ☐ Cash / ☑ UPI / ☐ Card / ☐ Bank Transfer
      </div>

      <!-- Signatures -->
      <div class="signatures-row">
        <div class="sig-col">
          <div class="sig-line"></div>
          <div>Student Signature</div>
        </div>
        <div class="sig-col text-right">
          <div class="sig-line margin-left-auto"></div>
          <div>Authorized Signature</div>
        </div>
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Neos Astra Fee Receipt — ${receiptNo}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif, 'Inter', sans-serif; color: #000; background: #fff; line-height: 1.3; }

    .page { page-break-after: always; padding: 8px 0; }
    .page:last-child { page-break-after: avoid; }

    .receipt-box { width: 100%; border: 1.5px solid #000; padding: 14px 18px; background: #fff; position: relative; }

    .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .header-left { width: 42%; font-family: 'Times New Roman', serif; }
    .brand-title { font-size: 15px; font-weight: bold; letter-spacing: 0.5px; }
    .brand-subtitle { font-size: 10.5px; font-weight: bold; margin-top: 2px; }
    .brand-web { font-size: 10px; margin-top: 2px; text-decoration: underline; }

    .header-center { width: 16%; text-align: center; }

    .header-right { width: 42%; text-align: right; font-family: 'Times New Roman', serif; }
    .receipt-badge { font-size: 15px; font-weight: bold; text-transform: uppercase; }
    .copy-badge { font-size: 10.5px; font-weight: bold; margin-top: 2px; }

    .grid-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1.5px solid #000; font-size: 11px; }
    .grid-table td, .grid-table th { border: 1.5px solid #000; padding: 5px 8px; vertical-align: middle; }
    .grid-table th { background: #f4f4f4; text-transform: uppercase; font-weight: bold; text-align: left; }
    .total-row td { font-weight: bold; background: #f9f9f9; }

    .payment-mode-line { margin-top: 8px; font-size: 10.5px; }

    .signatures-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-bottom: 4px; font-size: 10.5px; font-weight: bold; }
    .sig-col { width: 180px; }
    .text-right { text-align: right; }
    .sig-line { border-top: 1px solid #000; margin-bottom: 4px; width: 160px; }
    .margin-left-auto { margin-left: auto; }

    .dotted-divider { border-bottom: 2px dashed #000; margin: 18px 0; position: relative; }
    .divider-text { position: absolute; top: -9px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 10px; font-size: 9px; font-family: sans-serif; color: #444; }

    @media print {
      body { padding: 0; }
      .page { padding: 0; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: Course Fee Receipt (Student Copy & Office Copy) -->
  <div class="page">
    ${renderSingleReceipt("Course Fee", data.admissionFee || "₹ 2,000.00", "STUDENT COPY")}

    <div class="dotted-divider">
      <span class="divider-text">✂ CUT HERE FOR OFFICE COPY</span>
    </div>

    ${renderSingleReceipt("Course Fee", data.admissionFee || "₹ 2,000.00", "OFFICE COPY")}
  </div>

  <!-- PAGE 2: Innovators Starter Kit Fee Receipt (Student Copy & Office Copy) -->
  <div class="page">
    ${renderSingleReceipt("Innovators Starter Kit Fee", data.kitPrice || "₹ 1,100.00", "STUDENT COPY")}

    <div class="dotted-divider">
      <span class="divider-text">✂ CUT HERE FOR OFFICE COPY</span>
    </div>

    ${renderSingleReceipt("Innovators Starter Kit Fee", data.kitPrice || "₹ 1,100.00", "OFFICE COPY")}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;
}
