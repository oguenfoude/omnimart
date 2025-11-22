"use server";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { z } from "zod";
import { Resend } from "resend";

// Zod validation schema for order form
const orderSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
  phone: z
    .string()
    .regex(/^0[567]\d{8}$/, "رقم الهاتف غير صحيح. يجب أن يكون 10 أرقام"),
  wilaya: z.string().min(2, "يرجى إدخال اسم الولاية"),
  baladia: z.string().min(1, "يرجى إدخال البلدية"),
  quantity: z.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  deliveryType: z.enum(["home", "desk"], {
    message: "يرجى اختيار نوع التوصيل",
  }),
  watchModel: z.string().min(1, "يرجى اختيار موديل الساعة"),
  watchImage: z.string().optional(), // الرابط (المسار) للصورة المختارة
  perfumeModel: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// Calculate total price
function calculateTotal(quantity: number, deliveryType: "home" | "desk"): number {
  const productPrice = 2000;
  const deliveryCost = deliveryType === "home" ? 800 : 500;
  return productPrice * quantity + deliveryCost;
}

// Server Action to submit order to Google Sheets
export async function submitOrder(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  try {
    // Parse and validate form data
    const rawData = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      wilaya: formData.get("wilaya") as string,
      baladia: formData.get("baladia") as string,
      quantity: Number(formData.get("quantity")),
      deliveryType: formData.get("deliveryType") as "home" | "desk",
      watchModel: formData.get("watchModel") as string,
      watchImage: (formData.get("watchImage") as string) || undefined,
      perfumeModel: (formData.get("perfumeModel") as string) || undefined,
    };

    // Validate with Zod
    const validatedData = orderSchema.parse(rawData);

    // Calculate total
    const total = calculateTotal(
      validatedData.quantity,
      validatedData.deliveryType
    );

    // Try to save to Google Sheets (optional - will proceed even if fails)
    let sheetsSaved = false;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID) {
      try {
        const serviceAccountAuth = new JWT({
          email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const doc = new GoogleSpreadsheet(
          process.env.GOOGLE_SHEET_ID!,
          serviceAccountAuth
        );

        await doc.loadInfo();

        let sheet = doc.sheetsByIndex[0];
        const desiredHeaders = [
          "Timestamp",
          "Name",
          "Phone",
          "Wilaya",
          "Baladia",
          "Quantity",
          "Delivery Type",
          "Watch Model",
          "Perfume Model",
          "Watch Image URL",
          "Total Price (DZD)",
        ];
        if (!sheet) {
          sheet = await doc.addSheet({ headerValues: desiredHeaders });
        } else {
          let existing: string[] = [];
          try {
            await sheet.loadHeaderRow();
            existing = sheet.headerValues || [];
          } catch (e) {
            existing = [];
          }
          if (!existing.length) {
            await sheet.setHeaderRow(desiredHeaders);
            await sheet.loadHeaderRow();
            existing = sheet.headerValues || [];
          }
          const missingHeaders = desiredHeaders.filter(h => !existing.includes(h));
          if (missingHeaders.length) {
            await sheet.setHeaderRow([...existing, ...missingHeaders]);
            await sheet.loadHeaderRow();
          }
        }

        await sheet.addRow({
          Timestamp: new Date().toLocaleString("ar-DZ", {
            timeZone: "Africa/Algiers",
          }),
          Name: validatedData.name,
          Phone: validatedData.phone,
          Wilaya: validatedData.wilaya,
          Baladia: validatedData.baladia,
          Quantity: validatedData.quantity,
          "Delivery Type": validatedData.deliveryType === "home" ? "منزل" : "مكتب بريد",
          "Watch Model": validatedData.watchModel,
          "Perfume Model": validatedData.perfumeModel || "-",
          "Watch Image URL": validatedData.watchImage || "",
          "Total Price (DZD)": total,
        });
        sheetsSaved = true;
      } catch (sheetsError) {
        // Silently continue - email notification will still work
      }
    }

    // Send email notification (works even if Sheets fails)
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const perfumeLabel = validatedData.perfumeModel === "sauvage" ? "عطر سوفاج" : "عطر ويسكي";
        const deliveryLabel = validatedData.deliveryType === "home" ? "توصيل للمنزل (800 دج)" : "توصيل للمكتب (500 دج)";
        
        await resend.emails.send({
          from: 'Omnimart Orders <onboarding@resend.dev>',
          to: 'oguenfoude@gmail.com',
          subject: `🛒 طلب جديد من Omnimart - ${validatedData.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #000; border-bottom: 3px solid #000; padding-bottom: 10px;">🛒 طلب جديد من Omnimart</h1>
                
                <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-right: 4px solid #000;">
                  <h2 style="color: #000; margin-top: 0;">معلومات العميل</h2>
                  <p style="margin: 8px 0;"><strong>الاسم:</strong> ${validatedData.name}</p>
                  <p style="margin: 8px 0;"><strong>الهاتف:</strong> <a href="tel:${validatedData.phone}" style="color: #000;">${validatedData.phone}</a></p>
                  <p style="margin: 8px 0;"><strong>الولاية:</strong> ${validatedData.wilaya}</p>
                  <p style="margin: 8px 0;"><strong>البلدية:</strong> ${validatedData.baladia}</p>
                </div>
                
                <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-right: 4px solid #000;">
                  <h2 style="color: #000; margin-top: 0;">تفاصيل الطلب</h2>
                  <p style="margin: 8px 0;"><strong>موديل الساعة:</strong> ${validatedData.watchModel}</p>
                  <p style="margin: 8px 0;"><strong>العطر:</strong> ${perfumeLabel}</p>
                  <p style="margin: 8px 0;"><strong>الكمية:</strong> ${validatedData.quantity}</p>
                  <p style="margin: 8px 0;"><strong>التوصيل:</strong> ${deliveryLabel}</p>
                </div>
                
                <div style="margin: 20px 0; padding: 20px; background: #000; color: white; border-radius: 8px; text-align: center;">
                  <h2 style="margin-top: 0; color: white;">المجموع الكلي</h2>
                  <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${total} دج</p>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-right: 4px solid #ffc107; border-radius: 5px;">
                  <p style="margin: 0; color: #856404;"><strong>⏰ الوقت:</strong> ${new Date().toLocaleString("ar-DZ", { timeZone: "Africa/Algiers" })}</p>
                </div>
                
                <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #666; font-size: 14px;">تم إرسال هذه الرسالة تلقائياً من نظام Omnimart</p>
                </div>
              </div>
            </div>
          `,
        });
        emailSent = true;
      } catch (emailError) {
        // Email failed but continue
      }
    }

    // Success if at least one method worked
    if (sheetsSaved || emailSent) {
      return {
        success: true,
        message: "تم إرسال طلبك بنجاح! سنتواصل معك قريباً للتأكيد.",
      };
    } else {
      return {
        success: false,
        message: "حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.",
      };
    }
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
       const firstError = error.issues[0];
      return {
        success: false,
         message: firstError.message,
      };
    }

    return {
      success: false,
      message: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
    };
  }
}
