// src/lib/whatsappReminder.ts

export interface WhatsAppReminderData {
  studentName: string;
  guardianName?: string | null;
  studentPhone: string;
  courseTitle: string;
  cycleLabel: string;
  amount: number | string;
  dueDate: string;
  isOverdue: boolean;
  daysOverdue?: number;
  upiId?: string;
  academyName?: string;
  contactNumber?: string;
}

/**
 * Normalizes an Indian/international phone number for WhatsApp wa.me links.
 * Strips all spaces, dashes, parentheses and ensures a country code (defaults to 91).
 */
export function cleanWhatsAppNumber(phone: string): string {
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  if (digitsOnly.startsWith("0") && digitsOnly.length === 11) {
    return `91${digitsOnly.slice(1)}`;
  }
  return digitsOnly;
}

/**
 * Builds a polite, formal, and professional English fee reminder text.
 */
export function buildFeeReminderText(data: WhatsAppReminderData): string {
  const academy = data.academyName || "Neos Astra School of Innovation";
  const parentOrStudent = data.guardianName?.trim()
    ? `Dear ${data.guardianName} (Parent / Guardian of ${data.studentName})`
    : `Dear ${data.studentName}`;
  const upi = data.upiId || "9348059284@upi"; // Official Neos Astra UPI
  const contact = data.contactNumber || "+91 9348059284";

  let statusSentence = "";
  if (data.isOverdue && data.daysOverdue && data.daysOverdue > 0) {
    statusSentence = `⚠️ *Payment Status: OVERDUE (${data.daysOverdue} days past due)*\n📅 *Original Due Date:* ${data.dueDate}`;
  } else if (data.isOverdue) {
    statusSentence = `⚠️ *Payment Status: DUE TODAY*\n📅 *Due Date:* ${data.dueDate}`;
  } else {
    statusSentence = `📅 *Payment Due Date:* ${data.dueDate}`;
  }

  const amtStr = typeof data.amount === "number" ? `₹${data.amount.toLocaleString("en-IN")}` : String(data.amount);

  return (
    `${parentOrStudent},\n\n` +
    `Greetings from *${academy}*.\n\n` +
    `This is a formal reminder regarding the monthly tuition fee for *${data.studentName}*:\n\n` +
    `• *Student Name:* ${data.studentName}\n` +
    `• *Course / Program:* ${data.courseTitle}\n` +
    `• *Billing Period:* ${data.cycleLabel}\n` +
    `• *Amount Due:* *${amtStr}*\n` +
    `${statusSentence}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💳 *Payment Options:*\n` +
    `• UPI ID: \`${upi}\`\n` +
    `• Google Pay / PhonePe / Paytm: *${contact}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Please process the payment at your earliest convenience. If you have already completed the transaction, kindly reply with the payment screenshot or UTR reference so we can verify and update our records.\n\n` +
    `For any assistance or billing inquiries, please contact our help desk at ${contact}.\n\n` +
    `Thank you,\n` +
    `*Administration & Accounts Desk*\n` +
    `*${academy}*`
  );
}

/**
 * Returns a direct https://wa.me/ URL that opens WhatsApp Web or WhatsApp mobile app.
 */
export function generateWhatsAppReminderUrl(data: WhatsAppReminderData): string {
  const cleanPhone = cleanWhatsAppNumber(data.studentPhone);
  const text = buildFeeReminderText(data);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
