// src/lib/receiptTemplate.ts
import { RECEIPT_LOGO_DATA_URL } from "./receiptLogo";

export interface ReceiptData {
  registrationNo: string;
  studentName: string;
  courseTitle: string;
  admissionFee: string | number;
  kitPrice?: string | number;
  hasKit?: boolean;
  gstPercent?: number;
  total?: string | number;
  date?: string | Date;
  paymentMode?: string;
  emailOnly?: boolean;
}

// Parse numeric value from string (e.g. "₹2,006" or "2006" -> 2006)
export function parseAmt(val: string | number | undefined | null): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0;
}

// Format as in Word docx: ₹ 1700.00
export function fmtAmt(val: number): string {
  return `₹ ${val.toFixed(2)}`;
}

// Format date with ordinal suffix as in Word docx: 28th Aug, 2026
export function formatReceiptDate(val?: string | Date | null): string {
  if (!val) {
    val = new Date();
  }
  const d = typeof val === "string" ? new Date(val) : val;
  if (isNaN(d.getTime())) return String(val);

  const day = d.getDate();
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) suffix = "st";
  else if (day === 2 || day === 22) suffix = "nd";
  else if (day === 3 || day === 23) suffix = "rd";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${day}${suffix} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

export function generateOfficialFeeReceiptHTML(data: ReceiptData, emailOnly = false): string {
  const dateStr = formatReceiptDate(data.date);
  const receiptNo = data.registrationNo || "NA-2026-08-08-010";

  // Check if course has kit
  const isRobotics = Boolean(data.courseTitle?.toLowerCase().includes("robotics"));
  const rawKitNum = parseAmt(data.kitPrice);
  const hasKit = Boolean(data.hasKit === true || (isRobotics && rawKitNum > 0) || rawKitNum > 0);
  const kitFeeNum = rawKitNum > 0 ? rawKitNum : 1100;

  // Fee and GST calculation
  const rawAdmission = parseAmt(data.admissionFee);
  let courseFeeNum = 1700;
  let gstAmtNum = 306;
  let courseTotalNum = 2006;

  if (rawAdmission > 0) {
    if (rawAdmission === 2006) {
      courseFeeNum = 1700;
      gstAmtNum = 306;
      courseTotalNum = 2006;
    } else if (rawAdmission === 1700) {
      courseFeeNum = 1700;
      gstAmtNum = 306;
      courseTotalNum = 2006;
    } else if (data.gstPercent && data.gstPercent > 0) {
      courseFeeNum = rawAdmission;
      gstAmtNum = Math.round((courseFeeNum * data.gstPercent) / 100);
      courseTotalNum = courseFeeNum + gstAmtNum;
    } else {
      // Default standard 18% GST calculation as requested
      // If admission fee was inclusive of 18% GST:
      courseFeeNum = Math.round((rawAdmission / 1.18) * 100) / 100;
      gstAmtNum = Math.round((rawAdmission - courseFeeNum) * 100) / 100;
      courseTotalNum = rawAdmission;
    }
  }

  // Payment mode checkboxes matching Word document exactly:
  // Payment Mode:     Cash/    UPI /    Card /    Bank Transfer
  const renderPaymentMode = () => `
    <div class="payment-mode-line">
      Payment Mode: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>Cash/</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>UPI /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>Card /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>Bank Transfer</span>
    </div>
  `;

  // Signatures matching Word document exactly
  const renderSignatures = () => `
    <table class="signatures-table">
      <tr>
        <td style="width: 50%; text-align: left;">
          <div class="sig-line">____________________</div>
          <div class="sig-text">Student Signature</div>
        </td>
        <td style="width: 50%; text-align: right;">
          <div class="sig-line">____________________</div>
          <div class="sig-text">Authorized Signature</div>
        </td>
      </tr>
    </table>
  `;

  // Render Single Course Fee Unit (STUDENT COPY or OFFICE COPY)
  const renderCourseReceiptUnit = (copyType: "STUDENT COPY" | "OFFICE COPY") => `
    <div class="receipt-unit">
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td class="header-left">
            <div class="brand-title">NEOS ASTRA</div>
            <div class="brand-sub">SCHOOL OF INNOVATION</div>
            <div class="brand-web">www.neosastra.com | +91 9348059284</div>
          </td>
          <td class="header-center">
            <img src="${RECEIPT_LOGO_DATA_URL}" alt="Neos Astra" class="header-logo" />
          </td>
          <td class="header-right">
            <div class="badge-title">FEE RECEIPT</div>
            <div class="badge-copy">(${copyType})</div>
          </td>
        </tr>
      </table>

      <!-- Info Table (Bordered) -->
      <table class="grid-table">
        <tr>
          <td style="width: 50%;">RECEIPT NO: ${receiptNo}</td>
          <td style="width: 50%;">DATE: ${dateStr}</td>
        </tr>
        <tr>
          <td style="width: 50%;">STUDENT NAME: ${data.studentName}</td>
          <td style="width: 50%;">COURSE: ${data.courseTitle}</td>
        </tr>
      </table>

      <!-- Amount Table (Bordered) -->
      <table class="grid-table amount-table">
        <tr>
          <th style="width: 50%;">DESCRIPTION</th>
          <th style="width: 50%;">AMOUNT</th>
        </tr>
        <tr>
          <td>Course Fee</td>
          <td>${fmtAmt(courseFeeNum)}</td>
        </tr>
        <tr>
          <td>GST (18%)</td>
          <td>${fmtAmt(gstAmtNum)}</td>
        </tr>
        <tr>
          <td>Total Paid</td>
          <td>${fmtAmt(courseTotalNum)}</td>
        </tr>
      </table>

      <!-- Payment Mode -->
      ${renderPaymentMode()}

      <!-- Signatures -->
      ${renderSignatures()}
    </div>
  `;

  // Render Single Starter Kit Unit (STUDENT COPY or OFFICE COPY)
  const renderKitReceiptUnit = (copyType: "STUDENT COPY" | "OFFICE COPY") => `
    <div class="receipt-unit">
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td class="header-left">
            <div class="brand-title">NEOS ASTRA</div>
            <div class="brand-sub">SCHOOL OF INNOVATION</div>
            <div class="brand-web">www.neosastra.com | +91 9348059284</div>
          </td>
          <td class="header-center">
            <img src="${RECEIPT_LOGO_DATA_URL}" alt="Neos Astra" class="header-logo" />
          </td>
          <td class="header-right">
            <div class="badge-title">FEE RECEIPT</div>
            <div class="badge-copy">(${copyType})</div>
          </td>
        </tr>
      </table>

      <!-- Info Table (Bordered) -->
      <table class="grid-table">
        <tr>
          <td style="width: 50%;">RECEIPT NO: ${receiptNo}</td>
          <td style="width: 50%;">DATE: ${dateStr}</td>
        </tr>
        <tr>
          <td style="width: 50%;">STUDENT NAME: ${data.studentName}</td>
          <td style="width: 50%;">COURSE: ${data.courseTitle}</td>
        </tr>
      </table>

      <!-- Amount Table (Bordered) -->
      <table class="grid-table amount-table">
        <tr>
          <th style="width: 50%;">DESCRIPTION</th>
          <th style="width: 50%;">AMOUNT</th>
        </tr>
        <tr>
          <td>Innovators Starter Kit Fee</td>
          <td>${fmtAmt(kitFeeNum)}</td>
        </tr>
        <tr>
          <td>Total Paid</td>
          <td>${fmtAmt(kitFeeNum)}</td>
        </tr>
      </table>

      <!-- Payment Mode -->
      ${renderPaymentMode()}

      <!-- Signatures -->
      ${renderSignatures()}
    </div>
  `;

  // Dotted line matching Word doc
  const dividerLine = `<div class="dash-divider">----------------------------------------------------------------------------------------------------------------------------------</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Neos Astra Fee Receipt — ${receiptNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Cambria', 'Times New Roman', Georgia, serif;
      font-size: 11pt;
      color: #000;
      background: #fff;
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
      page-break-after: always;
      position: relative;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    .receipt-unit {
      width: 100%;
      padding-top: 4px;
      padding-bottom: 4px;
    }

    /* Header */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-bottom: 12px;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      padding: 0;
    }
    .header-left {
      width: 44%;
      text-align: left;
    }
    .brand-title {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .brand-sub {
      font-size: 10.5pt;
      font-weight: bold;
      line-height: 1.2;
      margin-top: 1px;
    }
    .brand-web {
      font-size: 9pt;
      margin-top: 2px;
    }

    .header-center {
      width: 16%;
      text-align: center;
      vertical-align: middle !important;
    }
    .header-logo {
      width: 65px;
      height: 65px;
      object-fit: contain;
      display: inline-block;
    }

    .header-right {
      width: 40%;
      text-align: right;
    }
    .badge-title {
      font-size: 11.5pt;
      font-weight: bold;
      line-height: 1.2;
    }
    .badge-copy {
      font-size: 10pt;
      font-weight: bold;
      line-height: 1.2;
      margin-top: 2px;
    }

    /* Bordered Tables */
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 1px solid #000;
      margin-bottom: 10px;
      font-size: 10pt;
    }
    .grid-table th, .grid-table td {
      border: 1px solid #000;
      padding: 3.5px 6px;
      vertical-align: middle;
      text-align: left;
    }
    .grid-table th {
      font-weight: bold;
      background: #fff;
    }

    /* Payment Mode */
    .payment-mode-line {
      font-size: 9.5pt;
      margin-top: 6px;
      margin-bottom: 22px;
    }
    .box-item {
      display: inline-flex;
      align-items: center;
    }
    .box {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1px solid #000;
      margin-right: 4px;
      background: #fff;
    }

    /* Signatures */
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-top: 10px;
      margin-bottom: 18px;
    }
    .signatures-table td {
      border: none;
      padding: 0;
      vertical-align: bottom;
    }
    .sig-line {
      font-size: 10pt;
      line-height: 1;
      margin-bottom: 3px;
    }
    .sig-text {
      font-size: 9.5pt;
    }

    /* Divider */
    .dash-divider {
      width: 100%;
      text-align: center;
      font-size: 9pt;
      letter-spacing: -0.5px;
      color: #000;
      margin: 16px 0 20px 0;
      overflow: hidden;
      white-space: nowrap;
    }

    @media print {
      body { padding: 0; }
      .page { padding: 0; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: Course Fee -->
  <div class="page">
    ${renderCourseReceiptUnit("STUDENT COPY")}
    ${emailOnly ? '' : `${dividerLine}${renderCourseReceiptUnit("OFFICE COPY")}`}
  </div>

  ${
    hasKit
      ? `
    <!-- PAGE 2: Innovators Starter Kit Fee -->
    <div class="page">
      ${renderKitReceiptUnit("STUDENT COPY")}
      ${emailOnly ? '' : `${dividerLine}${renderKitReceiptUnit("OFFICE COPY")}`}
    </div>
  `
      : ""
  }

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

export interface MonthlyReceiptData {
  receiptNo: string;
  registrationNo: string;
  studentName: string;
  courseTitle: string;
  cycleLabel: string;
  amount: number | string;
  paymentMode: string;
  transactionRef?: string | null;
  date?: string | Date;
  notes?: string | null;
}

export function generateMonthlyFeeReceiptHTML(data: MonthlyReceiptData, emailOnly = false): string {
  const dateStr = formatReceiptDate(data.date);
  const amtNum = typeof data.amount === "number" ? data.amount : parseAmt(data.amount);
  
  // Calculate Course Fee & 18% GST (matching docx)
  let courseFeeNum = 1700;
  let gstAmtNum = 306;
  let totalNum = 2006;

  if (amtNum > 0) {
    if (amtNum === 2006 || amtNum === 1700) {
      courseFeeNum = 1700;
      gstAmtNum = 306;
      totalNum = 2006;
    } else {
      // 18% GST calculation
      courseFeeNum = Math.round((amtNum / 1.18) * 100) / 100;
      gstAmtNum = Math.round((amtNum - courseFeeNum) * 100) / 100;
      totalNum = amtNum;
    }
  }

  const renderPaymentMode = () => `
    <div class="payment-mode-line">
      Payment Mode: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>Cash/</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>UPI /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>Card /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span class="box-item"><span class="box"></span>Bank Transfer</span>
    </div>
  `;

  const renderSignatures = () => `
    <table class="signatures-table">
      <tr>
        <td style="width: 50%; text-align: left;">
          <div class="sig-line">____________________</div>
          <div class="sig-text">Student Signature</div>
        </td>
        <td style="width: 50%; text-align: right;">
          <div class="sig-line">____________________</div>
          <div class="sig-text">Authorized Signature</div>
        </td>
      </tr>
    </table>
  `;

  const renderSingleMonthlyUnit = (copyType: "STUDENT COPY" | "OFFICE COPY") => `
    <div class="receipt-unit">
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td class="header-left">
            <div class="brand-title">NEOS ASTRA</div>
            <div class="brand-sub">SCHOOL OF INNOVATION</div>
            <div class="brand-web">www.neosastra.com | +91 9348059284</div>
          </td>
          <td class="header-center">
            <img src="${RECEIPT_LOGO_DATA_URL}" alt="Neos Astra" class="header-logo" />
          </td>
          <td class="header-right">
            <div class="badge-title">FEE RECEIPT</div>
            <div class="badge-copy">(${copyType})</div>
          </td>
        </tr>
      </table>

      <!-- Info Table -->
      <table class="grid-table">
        <tr>
          <td style="width: 50%;">RECEIPT NO: ${data.receiptNo}</td>
          <td style="width: 50%;">DATE: ${dateStr}</td>
        </tr>
        <tr>
          <td style="width: 50%;">STUDENT NAME: ${data.studentName}</td>
          <td style="width: 50%;">COURSE: ${data.courseTitle}</td>
        </tr>
      </table>

      <!-- Amount Table (Pure Course Fee + GST) -->
      <table class="grid-table amount-table">
        <tr>
          <th style="width: 50%;">DESCRIPTION</th>
          <th style="width: 50%;">AMOUNT</th>
        </tr>
        <tr>
          <td>Course Fee</td>
          <td>${fmtAmt(courseFeeNum)}</td>
        </tr>
        ${
          gstAmtNum > 0
            ? `<tr>
                <td>GST (18%)</td>
                <td>${fmtAmt(gstAmtNum)}</td>
              </tr>`
            : ""
        }
        <tr>
          <td>Total Paid</td>
          <td>${fmtAmt(totalNum)}</td>
        </tr>
      </table>

      <!-- Payment Mode -->
      ${renderPaymentMode()}

      <!-- Signatures -->
      ${renderSignatures()}
    </div>
  `;

  const dividerLine = `<div class="dash-divider">----------------------------------------------------------------------------------------------------------------------------------</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Neos Astra Tuition Fee Receipt — ${data.receiptNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Cambria', 'Times New Roman', Georgia, serif;
      font-size: 11pt;
      color: #000;
      background: #fff;
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
      page-break-after: always;
      position: relative;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    .receipt-unit {
      width: 100%;
      padding-top: 4px;
      padding-bottom: 4px;
    }

    /* Header */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-bottom: 12px;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      padding: 0;
    }
    .header-left {
      width: 44%;
      text-align: left;
    }
    .brand-title {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .brand-sub {
      font-size: 10.5pt;
      font-weight: bold;
      line-height: 1.2;
      margin-top: 1px;
    }
    .brand-web {
      font-size: 9pt;
      margin-top: 2px;
    }

    .header-center {
      width: 16%;
      text-align: center;
      vertical-align: middle !important;
    }
    .header-logo {
      width: 65px;
      height: 65px;
      object-fit: contain;
      display: inline-block;
    }

    .header-right {
      width: 40%;
      text-align: right;
    }
    .badge-title {
      font-size: 11.5pt;
      font-weight: bold;
      line-height: 1.2;
    }
    .badge-copy {
      font-size: 10pt;
      font-weight: bold;
      line-height: 1.2;
      margin-top: 2px;
    }

    /* Bordered Tables */
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 1px solid #000;
      margin-bottom: 10px;
      font-size: 10pt;
    }
    .grid-table th, .grid-table td {
      border: 1px solid #000;
      padding: 3.5px 6px;
      vertical-align: middle;
      text-align: left;
    }
    .grid-table th {
      font-weight: bold;
      background: #fff;
    }

    /* Payment Mode */
    .payment-mode-line {
      font-size: 9.5pt;
      margin-top: 6px;
      margin-bottom: 22px;
    }
    .box-item {
      display: inline-flex;
      align-items: center;
    }
    .box {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1px solid #000;
      margin-right: 4px;
      background: #fff;
    }

    /* Signatures */
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-top: 10px;
      margin-bottom: 18px;
    }
    .signatures-table td {
      border: none;
      padding: 0;
      vertical-align: bottom;
    }
    .sig-line {
      font-size: 10pt;
      line-height: 1;
      margin-bottom: 3px;
    }
    .sig-text {
      font-size: 9.5pt;
    }

    /* Divider */
    .dash-divider {
      width: 100%;
      text-align: center;
      font-size: 9pt;
      letter-spacing: -0.5px;
      color: #000;
      margin: 16px 0 20px 0;
      overflow: hidden;
      white-space: nowrap;
    }

    @media print {
      body { padding: 0; }
      .page { padding: 0; }
    }
  </style>
</head>
<body>

  <!-- Fee Receipt -->
  <div class="page">
    ${renderSingleMonthlyUnit("STUDENT COPY")}
    ${emailOnly ? '' : `${dividerLine}${renderSingleMonthlyUnit("OFFICE COPY")}`}
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
