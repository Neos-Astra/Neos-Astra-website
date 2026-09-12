// src/app/api/payments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

function parseAmt(val: string | number | undefined | null): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0;
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function generateReceiptNo() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NA-FEE-${new Date().getFullYear()}-${rand}`;
}

// GET: returns all students with computed anniversary billing cycles & fee status
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get("status") || "ALL"; // ALL, OVERDUE, DUE_SOON, PAID
    const searchQuery = searchParams.get("search")?.toLowerCase().trim() || "";

    const enrollments = await prisma.enrollment.findMany({
      include: {
        feePayments: {
          orderBy: { cycleMonthIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const studentsData = enrollments.map((e) => {
      const admissionDate = new Date(e.createdAt);
      admissionDate.setHours(0, 0, 0, 0);
      const billingDay = e.billingDay || admissionDate.getDate();

      // Monthly fee resolution:
      // 1) e.monthlyFee
      // 2) e.admissionFee
      // 3) default to 3000
      let monthlyFeeAmt = parseAmt(e.monthlyFee);
      if (monthlyFeeAmt === 0) {
        monthlyFeeAmt = parseAmt(e.admissionFee) || 3000;
      }

      // Compute how many months elapsed since admission
      const monthsElapsed =
        (today.getFullYear() - admissionDate.getFullYear()) * 12 +
        (today.getMonth() - admissionDate.getMonth());

      // We generate cycles from Month 1 up to at least monthsElapsed + 2 (upcoming)
      const totalCyclesToGenerate = Math.max(monthsElapsed + 2, 2);

      const cycles = [];
      let firstUnpaidCycle: any = null;
      let overdueCount = 0;
      let totalPaidAmount = 0;

      for (let i = 1; i <= totalCyclesToGenerate; i++) {
        // Calculate cycle due date
        // Month 1 due date is admission date
        // Month 2 due date is 1 month later on billingDay
        const cycleDue = new Date(admissionDate.getFullYear(), admissionDate.getMonth() + (i - 1), billingDay);
        cycleDue.setHours(0, 0, 0, 0);

        const cycleLabel = `Month ${i} (${formatMonthYear(cycleDue)})`;

        // Check if explicitly recorded in feePayments
        const recordedPayment = e.feePayments.find((p) => p.cycleMonthIndex === i);

        if (recordedPayment) {
          totalPaidAmount += recordedPayment.amount;
          cycles.push({
            monthIndex: i,
            cycleLabel: recordedPayment.cycleLabel || cycleLabel,
            dueDate: cycleDue.toISOString(),
            dueDateFormatted: formatDate(cycleDue),
            status: "PAID",
            amount: recordedPayment.amount,
            paidDate: recordedPayment.paidDate.toISOString(),
            paidDateFormatted: formatDate(recordedPayment.paidDate),
            paymentMethod: recordedPayment.paymentMethod,
            receiptNo: recordedPayment.receiptNo,
            transactionRef: recordedPayment.transactionRef,
            notes: recordedPayment.notes,
            paymentId: recordedPayment.id,
          });
        } else if (i === 1 && e.status === "CONFIRMED") {
          // Month 1 was covered by initial admission enrollment
          const initialTotal = parseAmt(e.total) || parseAmt(e.admissionFee) || monthlyFeeAmt;
          totalPaidAmount += initialTotal;
          cycles.push({
            monthIndex: 1,
            cycleLabel: `Month 1 (${formatMonthYear(admissionDate)})`,
            dueDate: admissionDate.toISOString(),
            dueDateFormatted: formatDate(admissionDate),
            status: "PAID",
            amount: initialTotal,
            paidDate: admissionDate.toISOString(),
            paidDateFormatted: formatDate(admissionDate),
            paymentMethod: "Admission Payment",
            receiptNo: e.registrationNo,
            transactionRef: "Initial Registration",
            notes: "Covered during enrollment",
            paymentId: "INITIAL_REGISTRATION",
          });
        } else {
          // Unpaid cycle
          const diffMs = today.getTime() - cycleDue.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          let cycleStatus = "UPCOMING";
          if (diffDays > 0) {
            cycleStatus = "OVERDUE";
            overdueCount++;
          } else if (diffDays >= -7) {
            cycleStatus = "DUE_SOON";
          }

          const unpaidCycleData = {
            monthIndex: i,
            cycleLabel,
            dueDate: cycleDue.toISOString(),
            dueDateFormatted: formatDate(cycleDue),
            status: cycleStatus,
            amount: monthlyFeeAmt,
            daysOverdue: diffDays > 0 ? diffDays : 0,
            daysRemaining: diffDays < 0 ? Math.abs(diffDays) : 0,
            paidDate: null,
            paidDateFormatted: null,
            paymentMethod: null,
            receiptNo: null,
            transactionRef: null,
            notes: null,
            paymentId: null,
          };

          cycles.push(unpaidCycleData);

          if (!firstUnpaidCycle) {
            firstUnpaidCycle = unpaidCycleData;
          }
        }
      }

      // Determine overall student status
      let overallStatus: "OVERDUE" | "DUE_SOON" | "PAID" = "PAID";
      if (firstUnpaidCycle) {
        if (firstUnpaidCycle.status === "OVERDUE") {
          overallStatus = "OVERDUE";
        } else if (firstUnpaidCycle.status === "DUE_SOON") {
          overallStatus = "DUE_SOON";
        }
      }

      return {
        id: e.id,
        registrationNo: e.registrationNo,
        studentName: e.studentName,
        guardianName: e.guardianName,
        studentPhone: e.studentPhone,
        studentEmail: e.studentEmail,
        courseTitle: e.courseTitle,
        admissionDate: admissionDate.toISOString(),
        admissionDateFormatted: formatDate(admissionDate),
        billingDay,
        monthlyFee: monthlyFeeAmt,
        overallStatus,
        nextDueCycle: firstUnpaidCycle,
        overdueCyclesCount: overdueCount,
        totalPaidAmount,
        cycles,
      };
    });

    // Summary KPI metrics
    let totalCollectedThisMonth = 0;
    let totalPendingAmount = 0;
    let overdueStudentsCount = 0;
    let dueSoonStudentsCount = 0;

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    studentsData.forEach((s) => {
      // Check payments made in current calendar month
      s.cycles.forEach((c) => {
        if (c.status === "PAID" && c.paidDate) {
          const pd = new Date(c.paidDate);
          if (pd.getMonth() === currentMonth && pd.getFullYear() === currentYear) {
            totalCollectedThisMonth += c.amount;
          }
        }
      });

      if (s.overallStatus === "OVERDUE") {
        overdueStudentsCount++;
        totalPendingAmount += s.nextDueCycle?.amount || s.monthlyFee;
      } else if (s.overallStatus === "DUE_SOON") {
        dueSoonStudentsCount++;
      }
    });

    // Filter students based on filterStatus and searchQuery
    let filtered = studentsData;

    if (filterStatus === "OVERDUE") {
      filtered = filtered.filter((s) => s.overallStatus === "OVERDUE");
    } else if (filterStatus === "DUE_SOON") {
      filtered = filtered.filter((s) => s.overallStatus === "DUE_SOON");
    } else if (filterStatus === "PAID") {
      filtered = filtered.filter((s) => s.overallStatus === "PAID");
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.studentName.toLowerCase().includes(searchQuery) ||
          s.studentPhone.includes(searchQuery) ||
          s.registrationNo.toLowerCase().includes(searchQuery) ||
          s.courseTitle.toLowerCase().includes(searchQuery) ||
          (s.guardianName && s.guardianName.toLowerCase().includes(searchQuery))
      );
    }

    return NextResponse.json({
      summary: {
        totalStudents: enrollments.length,
        totalCollectedThisMonth,
        totalPendingAmount,
        overdueStudentsCount,
        dueSoonStudentsCount,
      },
      students: filtered,
    });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

// POST: Record a new monthly fee payment
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      enrollmentId,
      cycleMonthIndex,
      cycleLabel,
      amount,
      paymentMethod,
      transactionRef,
      notes,
      paidDate,
      dueDate,
    } = body;

    if (!enrollmentId || !cycleMonthIndex || !amount) {
      return NextResponse.json(
        { error: "Enrollment ID, cycle index and amount are required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Student enrollment not found" }, { status: 404 });
    }

    // Check if this cycle is already paid
    const existing = await prisma.feePayment.findFirst({
      where: {
        enrollmentId,
        cycleMonthIndex: Number(cycleMonthIndex),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Payment for ${cycleLabel || `Month ${cycleMonthIndex}`} has already been recorded.` },
        { status: 400 }
      );
    }

    const receiptNo = generateReceiptNo();
    const cleanAmount = parseAmt(amount);

    const payment = await prisma.feePayment.create({
      data: {
        enrollmentId,
        receiptNo,
        cycleMonthIndex: Number(cycleMonthIndex),
        cycleLabel: cycleLabel || `Month ${cycleMonthIndex}`,
        dueDate: dueDate ? new Date(dueDate) : null,
        paidDate: paidDate ? new Date(paidDate) : new Date(),
        amount: cleanAmount,
        paymentMethod: paymentMethod || "UPI",
        transactionRef: transactionRef ? String(transactionRef).trim() : "",
        notes: notes ? String(notes).trim() : "",
        collectedBy: session.user.email || "Admin",
      },
    });

    return NextResponse.json(
      {
        success: true,
        payment,
        receipt: {
          receiptNo: payment.receiptNo,
          registrationNo: enrollment.registrationNo,
          studentName: enrollment.studentName,
          courseTitle: enrollment.courseTitle,
          cycleLabel: payment.cycleLabel,
          amount: payment.amount,
          paymentMode: payment.paymentMethod,
          transactionRef: payment.transactionRef,
          date: formatDate(payment.paidDate),
          notes: payment.notes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
