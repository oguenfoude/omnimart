import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function GET() {
  // Check env vars first
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyRaw = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !keyRaw || !sheetId) {
    return NextResponse.json({
      status: "missing_env",
      message: "بيانات الربط غير مكتملة (.env.local)"
    }, { status: 200 });
  }

  try {
    const auth = new JWT({
      email,
      key: keyRaw.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    return NextResponse.json({
      status: "ok",
      message: "الاتصال ناجح"
    }, { status: 200 });
  } catch (err) {
    const e = err as Error;
    const msg: string = e.message || "";
    let status: string = "unknown";
    let friendly = "خطأ غير معروف";

    if (msg.includes("403") && msg.includes("sheets.googleapis.com")) {
      status = "api_disabled";
      friendly = "Google Sheets API غير مفعلة";
    } else if (msg.toLowerCase().includes("permission")) {
      status = "permission";
      friendly = "صلاحيات غير كافية للوصول إلى الورقة";
    }

    return NextResponse.json({ status, message: friendly }, { status: 200 });
  }
}
