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

  // Check if course has kit (Robotics courses, or kitPrice > 0, or total >= 3000, or hasKit=true)
  const isRobotics = Boolean(data.courseTitle?.toLowerCase().includes("robotics"));
  const rawKitNum = parseAmt(data.kitPrice);
  const rawTotal = parseAmt(data.total);
  const hasKit = Boolean(
    data.hasKit === true ||
    isRobotics ||
    rawKitNum > 0 ||
    rawTotal >= 3000
  );
  const kitFeeNum = rawKitNum > 0 ? rawKitNum : 1100;

  // Fee and GST calculation
  const rawAdmission = parseAmt(data.admissionFee);
  let courseFeeNum = 1700;
  let gstAmtNum = 306;
  let courseTotalNum = 2006;

  if (rawAdmission > 0) {
    if (rawAdmission === 2006 || rawAdmission === 1700) {
      courseFeeNum = 1700;
      gstAmtNum = 306;
      courseTotalNum = 2006;
    } else if (data.gstPercent && data.gstPercent > 0) {
      courseFeeNum = rawAdmission;
      gstAmtNum = Math.round((courseFeeNum * data.gstPercent) / 100);
      courseTotalNum = courseFeeNum + gstAmtNum;
    } else {
      courseFeeNum = Math.round((rawAdmission / 1.18) * 100) / 100;
      gstAmtNum = Math.round((rawAdmission - courseFeeNum) * 100) / 100;
      courseTotalNum = rawAdmission;
    }
  }

  // Payment mode checkboxes matching Word document
  const renderPaymentMode = () => `
    <div style="font-size: 9.5pt; font-family: Cambria, 'Times New Roman', Georgia, serif; margin-top: 6px; margin-bottom: 16px;">
      Payment Mode: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>Cash/</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>UPI /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>Card /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>Bank Transfer</span>
    </div>
  `;

  // Signatures matching Word document
  const renderSignatures = () => `
    <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 10px; margin-bottom: 14px; font-family: Cambria, 'Times New Roman', Georgia, serif;">
      <tr>
        <td style="width: 50%; text-align: left; border: none; padding: 0; vertical-align: bottom;">
          <div style="font-size: 10pt; line-height: 1; margin-bottom: 3px;">____________________</div>
          <div style="font-size: 9.5pt;">Student Signature</div>
        </td>
        <td style="width: 50%; text-align: right; border: none; padding: 0; vertical-align: bottom;">
          <div style="font-size: 10pt; line-height: 1; margin-bottom: 3px;">____________________</div>
          <div style="font-size: 9.5pt;">Authorized Signature</div>
        </td>
      </tr>
    </table>
  `;

  // Render Single Course Fee Unit (STUDENT COPY or OFFICE COPY)
  const renderCourseReceiptUnit = (copyType: "STUDENT COPY" | "OFFICE COPY") => `
    <div style="width: 100%; padding-top: 4px; padding-bottom: 4px; font-family: Cambria, 'Times New Roman', Georgia, serif; color: #000;">
      <!-- Header -->
      <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 12px;">
        <tr>
          <td style="width: 44%; text-align: left; border: none; vertical-align: top; padding: 0;">
            <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; line-height: 1.2;">NEOS ASTRA</div>
            <div style="font-size: 10.5pt; font-weight: bold; line-height: 1.2; margin-top: 1px;">SCHOOL OF INNOVATION</div>
            <div style="font-size: 9pt; margin-top: 2px;">www.neosastra.com | +91 9348059284</div>
          </td>
          <td style="width: 16%; text-align: center; border: none; vertical-align: middle; padding: 0;">
            <img src="${RECEIPT_LOGO_DATA_URL}" alt="Neos Astra" style="width: 65px; height: 65px; object-fit: contain; display: inline-block;" />
          </td>
          <td style="width: 40%; text-align: right; border: none; vertical-align: top; padding: 0;">
            <div style="font-size: 11.5pt; font-weight: bold; line-height: 1.2;">FEE RECEIPT</div>
            <div style="font-size: 10pt; font-weight: bold; line-height: 1.2; margin-top: 2px;">(${copyType})</div>
          </td>
        </tr>
      </table>

      <!-- Info Table (Bordered) -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #000; margin-bottom: 10px; font-size: 10pt;">
        <tr>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">RECEIPT NO: ${receiptNo}</td>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">DATE: ${dateStr}</td>
        </tr>
        <tr>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">STUDENT NAME: ${data.studentName}</td>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">COURSE: ${data.courseTitle}</td>
        </tr>
      </table>

      <!-- Amount Table (Bordered) -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #000; margin-bottom: 10px; font-size: 10pt;">
        <tr>
          <th style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background: #fff;">DESCRIPTION</th>
          <th style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background: #fff;">AMOUNT</th>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px;">Course Fee</td>
          <td style="border: 1px solid #000; padding: 4px 6px;">${fmtAmt(courseFeeNum)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px;">GST (18%)</td>
          <td style="border: 1px solid #000; padding: 4px 6px;">${fmtAmt(gstAmtNum)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Total Paid</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">${fmtAmt(courseTotalNum)}</td>
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
    <div style="width: 100%; padding-top: 4px; padding-bottom: 4px; font-family: Cambria, 'Times New Roman', Georgia, serif; color: #000;">
      <!-- Header -->
      <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 12px;">
        <tr>
          <td style="width: 44%; text-align: left; border: none; vertical-align: top; padding: 0;">
            <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; line-height: 1.2;">NEOS ASTRA</div>
            <div style="font-size: 10.5pt; font-weight: bold; line-height: 1.2; margin-top: 1px;">SCHOOL OF INNOVATION</div>
            <div style="font-size: 9pt; margin-top: 2px;">www.neosastra.com | +91 9348059284</div>
          </td>
          <td style="width: 16%; text-align: center; border: none; vertical-align: middle; padding: 0;">
            <img src="${RECEIPT_LOGO_DATA_URL}" alt="Neos Astra" style="width: 65px; height: 65px; object-fit: contain; display: inline-block;" />
          </td>
          <td style="width: 40%; text-align: right; border: none; vertical-align: top; padding: 0;">
            <div style="font-size: 11.5pt; font-weight: bold; line-height: 1.2;">FEE RECEIPT</div>
            <div style="font-size: 10pt; font-weight: bold; line-height: 1.2; margin-top: 2px;">(${copyType})</div>
          </td>
        </tr>
      </table>

      <!-- Info Table (Bordered) -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #000; margin-bottom: 10px; font-size: 10pt;">
        <tr>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">RECEIPT NO: ${receiptNo}</td>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">DATE: ${dateStr}</td>
        </tr>
        <tr>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">STUDENT NAME: ${data.studentName}</td>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">COURSE: ${data.courseTitle}</td>
        </tr>
      </table>

      <!-- Amount Table (Bordered) -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #000; margin-bottom: 10px; font-size: 10pt;">
        <tr>
          <th style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background: #fff;">DESCRIPTION</th>
          <th style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background: #fff;">AMOUNT</th>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px;">Innovators Starter Kit Fee</td>
          <td style="border: 1px solid #000; padding: 4px 6px;">${fmtAmt(kitFeeNum)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Total Paid</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">${fmtAmt(kitFeeNum)}</td>
        </tr>
      </table>

      <!-- Payment Mode -->
      ${renderPaymentMode()}

      <!-- Signatures -->
      ${renderSignatures()}
    </div>
  `;

  // Dotted line matching Word doc
  const dividerLine = `<div style="width: 100%; text-align: center; font-size: 9pt; letter-spacing: -0.5px; color: #000; margin: 16px 0 20px 0; overflow: hidden; white-space: nowrap;">----------------------------------------------------------------------------------------------------------------------------------</div>`;

  // IF EMAIL ONLY: Return pure inline-styled HTML with Student Copy only (no Office Copy, no script tags)
  if (emailOnly) {
    return `
      <div style="font-family: Cambria, 'Times New Roman', Georgia, serif; color: #000; background: #ffffff;">
        ${renderCourseReceiptUnit("STUDENT COPY")}
        ${
          hasKit
            ? `
          <div style="margin: 28px 0 20px; border-top: 2px dashed #94a3b8; text-align: center;">
            <span style="background: #ffffff; padding: 2px 14px; font-size: 11px; font-weight: bold; color: #475569; letter-spacing: 0.5px; border: 1px solid #cbd5e1; border-radius: 9999px;">
              INNOVATORS STARTER KIT RECEIPT
            </span>
          </div>
          ${renderKitReceiptUnit("STUDENT COPY")}
        `
            : ""
        }
      </div>
    `;
  }

  // PRINT MODE: Full A4 document with dual copy (Student Copy + Office Copy)
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
    ${dividerLine}
    ${renderCourseReceiptUnit("OFFICE COPY")}
  </div>

  ${
    hasKit
      ? `
    <!-- PAGE 2: Innovators Starter Kit Fee -->
    <div class="page">
      ${renderKitReceiptUnit("STUDENT COPY")}
      ${dividerLine}
      ${renderKitReceiptUnit("OFFICE COPY")}
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
      courseFeeNum = Math.round((amtNum / 1.18) * 100) / 100;
      gstAmtNum = Math.round((amtNum - courseFeeNum) * 100) / 100;
      totalNum = amtNum;
    }
  }

  const renderPaymentMode = () => `
    <div style="font-size: 9.5pt; font-family: Cambria, 'Times New Roman', Georgia, serif; margin-top: 6px; margin-bottom: 16px;">
      Payment Mode: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>Cash/</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>UPI /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>Card /</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 4px; background: #fff;"></span>Bank Transfer</span>
    </div>
  `;

  const renderSignatures = () => `
    <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 10px; margin-bottom: 14px; font-family: Cambria, 'Times New Roman', Georgia, serif;">
      <tr>
        <td style="width: 50%; text-align: left; border: none; padding: 0; vertical-align: bottom;">
          <div style="font-size: 10pt; line-height: 1; margin-bottom: 3px;">____________________</div>
          <div style="font-size: 9.5pt;">Student Signature</div>
        </td>
        <td style="width: 50%; text-align: right; border: none; padding: 0; vertical-align: bottom;">
          <div style="font-size: 10pt; line-height: 1; margin-bottom: 3px;">____________________</div>
          <div style="font-size: 9.5pt;">Authorized Signature</div>
        </td>
      </tr>
    </table>
  `;

  const renderSingleMonthlyUnit = (copyType: "STUDENT COPY" | "OFFICE COPY") => `
    <div style="width: 100%; padding-top: 4px; padding-bottom: 4px; font-family: Cambria, 'Times New Roman', Georgia, serif; color: #000;">
      <!-- Header -->
      <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 12px;">
        <tr>
          <td style="width: 44%; text-align: left; border: none; vertical-align: top; padding: 0;">
            <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; line-height: 1.2;">NEOS ASTRA</div>
            <div style="font-size: 10.5pt; font-weight: bold; line-height: 1.2; margin-top: 1px;">SCHOOL OF INNOVATION</div>
            <div style="font-size: 9pt; margin-top: 2px;">www.neosastra.com | +91 9348059284</div>
          </td>
          <td style="width: 16%; text-align: center; border: none; vertical-align: middle; padding: 0;">
            <img src="${RECEIPT_LOGO_DATA_URL}" alt="Neos Astra" style="width: 65px; height: 65px; object-fit: contain; display: inline-block;" />
          </td>
          <td style="width: 40%; text-align: right; border: none; vertical-align: top; padding: 0;">
            <div style="font-size: 11.5pt; font-weight: bold; line-height: 1.2;">FEE RECEIPT</div>
            <div style="font-size: 10pt; font-weight: bold; line-height: 1.2; margin-top: 2px;">(${copyType})</div>
          </td>
        </tr>
      </table>

      <!-- Info Table -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #000; margin-bottom: 10px; font-size: 10pt;">
        <tr>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">RECEIPT NO: ${data.receiptNo}</td>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">DATE: ${dateStr}</td>
        </tr>
        <tr>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">STUDENT NAME: ${data.studentName}</td>
          <td style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle;">COURSE: ${data.courseTitle}</td>
        </tr>
      </table>

      <!-- Amount Table (Pure Course Fee + GST) -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #000; margin-bottom: 10px; font-size: 10pt;">
        <tr>
          <th style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background: #fff;">DESCRIPTION</th>
          <th style="width: 50%; border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background: #fff;">AMOUNT</th>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px;">Course Fee</td>
          <td style="border: 1px solid #000; padding: 4px 6px;">${fmtAmt(courseFeeNum)}</td>
        </tr>
        ${
          gstAmtNum > 0
            ? `<tr>
                <td style="border: 1px solid #000; padding: 4px 6px;">GST (18%)</td>
                <td style="border: 1px solid #000; padding: 4px 6px;">${fmtAmt(gstAmtNum)}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Total Paid</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">${fmtAmt(totalNum)}</td>
        </tr>
      </table>

      <!-- Payment Mode -->
      ${renderPaymentMode()}

      <!-- Signatures -->
      ${renderSignatures()}
    </div>
  `;

  const dividerLine = `<div style="width: 100%; text-align: center; font-size: 9pt; letter-spacing: -0.5px; color: #000; margin: 16px 0 20px 0; overflow: hidden; white-space: nowrap;">----------------------------------------------------------------------------------------------------------------------------------</div>`;

  // IF EMAIL ONLY: Return pure inline-styled HTML with Student Copy only (no Office Copy, no script tags)
  if (emailOnly) {
    return `
      <div style="font-family: Cambria, 'Times New Roman', Georgia, serif; color: #000; background: #ffffff;">
        ${renderSingleMonthlyUnit("STUDENT COPY")}
      </div>
    `;
  }

  // PRINT MODE: Full A4 document with dual copy (Student Copy + Office Copy)
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
    ${dividerLine}
    ${renderSingleMonthlyUnit("OFFICE COPY")}
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
