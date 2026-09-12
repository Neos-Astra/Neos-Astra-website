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
 * Builds a polite, professional, and clear bilingual (Hinglish/English) reminder text.
 */
export function buildFeeReminderText(data: WhatsAppReminderData): string {
  const academy = data.academyName || "Neos Astra Academy";
  const parentOrStudent = data.guardianName?.trim()
    ? `Dear ${data.guardianName} (Parent of ${data.studentName})`
    : `Dear ${data.studentName}`;
  const upi = data.upiId || "9348059284@upi"; // Default Neos Astra official contact/UPI
  const contact = data.contactNumber || "+91 9348059284";

  let statusSentence = "";
  if (data.isOverdue && data.daysOverdue && data.daysOverdue > 0) {
    statusSentence = `⚠️ *Payment Status: OVERDUE by ${data.daysOverdue} day(s)*\n(Due date was: *${data.dueDate}*)`;
  } else if (data.isOverdue) {
    statusSentence = `⚠️ *Payment Status: DUE TODAY*\n(Due date: *${data.dueDate}*)`;
  } else {
    statusSentence = `🗓️ *Due Date:* *${data.dueDate}*`;
  }

  const amtStr = typeof data.amount === "number" ? `₹${data.amount.toLocaleString("en-IN")}` : String(data.amount);

  return (
    `Namaste! 🙏\n\n` +
    `${parentOrStudent},\n\n` +
    `This is a gentle monthly fee reminder from *${academy}*:\n\n` +
    `👤 *Student:* ${data.studentName}\n` +
    `📚 *Course:* ${data.courseTitle}\n` +
    `📅 *Fee Period:* ${data.cycleLabel}\n` +
    `💰 *Monthly Fee Amount:* *${amtStr}*\n` +
    `${statusSentence}\n\n` +
    `----------------------------\n` +
    `💳 *Payment Options:*\n` +
    `• UPI ID: \`${upi}\`\n` +
    `• Google Pay / PhonePe / Paytm to: *${contact}*\n` +
    `----------------------------\n\n` +
    `Agar aapne payment kar diya hai, kripya transaction receipt is number par share kar dein taaki hum system me update kar sakein.\n\n` +
    `For any query, feel free to reach out to us at ${contact}.\n\n` +
    `Warm regards,\n*${academy} Team*`
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
