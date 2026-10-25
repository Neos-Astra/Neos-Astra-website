// src/app/api/email-receipt/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/superadmin/auth";
import { sendMail } from "@/lib/mail";
import { generateOfficialFeeReceiptHTML, generateMonthlyFeeReceiptHTML } from "@/lib/receiptTemplate";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, studentEmail, studentName, receiptData } = body;

    if (!studentEmail || !studentEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid student email address is required to send receipt." },
        { status: 400 }
      );
    }

    let htmlReceipt = "";
    let subject = "";

    if (type === "ADMISSION") {
      subject = `Official Admission Fee Receipt — Neos Astra School of Innovation [${receiptData.registrationNo}]`;
      htmlReceipt = generateOfficialFeeReceiptHTML(receiptData);
    } else {
      subject = `Official Tuition Fee Receipt (${receiptData.cycleLabel || "Monthly Fee"}) — Neos Astra [${receiptData.receiptNo}]`;
      htmlReceipt = generateMonthlyFeeReceiptHTML(receiptData);
    }

    // Email Body Wrapper for email inboxes
    const emailHtml = `
      <div style="font-family: Calibri, 'Times New Roman', Arial, sans-serif; color: #111; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 15px; border-bottom: 2px solid #000;">
          <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">NEOS ASTRA</h2>
          <div style="font-size: 13px; font-weight: bold; margin-top: 3px;">SCHOOL OF INNOVATION</div>
          <div style="font-size: 11px; color: #555; margin-top: 2px;">www.neosastra.com | +91 9348059284</div>
        </div>

        <p style="font-size: 14px; margin-top: 20px;">Dear <strong>${studentName}</strong>,</p>
        <p style="font-size: 13px; color: #333; line-height: 1.5;">
          Thank you for your payment. We have successfully recorded your fee. Below is your official Neos Astra fee receipt:
        </p>

        <div style="margin: 20px 0;">
          ${htmlReceipt}
        </div>

        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; text-align: center;">
          <p style="margin: 0;">This is an automated official fee receipt from <strong>Neos Astra School of Innovation</strong>.</p>
          <p style="margin: 4px 0 0 0;">For any questions, reach out to <a href="mailto:contact@neosastra.com" style="color: #0284c7;">contact@neosastra.com</a> or +91 9348059284.</p>
        </div>
      </div>
    `;

    try {
      await sendMail(studentEmail, subject, emailHtml);
      return NextResponse.json({
        success: true,
        message: `Receipt successfully emailed to ${studentEmail}!`,
      });
    } catch (mailError: any) {
      console.error("Mail send error:", mailError);
      return NextResponse.json(
        {
          error:
            mailError.message?.includes("SMTP credentials")
              ? "SMTP credentials not configured in .env. Please add SMTP_USER and SMTP_PASS in .env file."
              : `Failed to send email: ${mailError.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Email receipt route error:", error);
    return NextResponse.json({ error: error.message || "Failed to process receipt email." }, { status: 500 });
  }
}
