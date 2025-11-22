"use client";

import { useState, useActionState, useRef } from "react";
import { submitOrder } from "./actions";
import Image from "next/image";
import { Home, Building2, CheckCircle2, Truck, Shield, Phone } from "lucide-react";

const initialState = {
  success: false,
  message: "",
};

export default function OmnimartPage() {
  const [formState, formAction] = useActionState(submitOrder, initialState);
  const [selectedWatch, setSelectedWatch] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState<"home" | "desk">("home");
  const [isPending, setIsPending] = useState(false);
  const [perfumeChoice, setPerfumeChoice] = useState<string>("");
  const [heroImage, setHeroImage] = useState<number>(1);
  const [showErrors, setShowErrors] = useState(false);
  // Controlled inputs for persistence
  const [nameValue, setNameValue] = useState<string>("");
  const [phoneValue, setPhoneValue] = useState<string>("");
  const [wilayaValue, setWilayaValue] = useState<string>("");
  const [baladiaValue, setBaladiaValue] = useState<string>("");
  // success view derived directly from formState.success for cleaner logic

  const watchModels = [
    { id: "model1", label: "موديل 1", img: "/whatchs/1.jpg" },
    { id: "model2", label: "موديل 2", img: "/whatchs/2.jpg" },
    { id: "model3", label: "موديل 3", img: "/whatchs/3.jpg" },
    { id: "model4", label: "موديل 4", img: "/whatchs/4.jpg" },
    { id: "model5", label: "موديل 5", img: "/whatchs/5.jpg" },
    { id: "model6", label: "موديل 6", img: "/whatchs/6.jpg" },
    { id: "model7", label: "موديل 7", img: "/whatchs/7.jpg" },
    { id: "model8", label: "موديل 8", img: "/whatchs/8.jpg" },
  ];

  const calculateTotal = () => {
    const productPrice = 2000;
    const deliveryCost = deliveryType === "home" ? 800 : 500;
    return productPrice * quantity + deliveryCost;
  };

  // Prevent duplicate submission clicks using a stable ref flag
  const submitRef = useRef(false);
  const handleSubmit = async (formData: FormData) => {
    if (submitRef.current || isPending) return; // guard
    submitRef.current = true;
    setIsPending(true);
    await formAction(formData);
    setIsPending(false);
    submitRef.current = false;
  };

  // When order succeeds: clear all state & show success screen
  // No effect needed; avoid cascading renders by deriving UI from formState.success

  const handleWhatsAppOrder = () => {
    const name = nameValue.trim();
    const phone = phoneValue.trim();
    const wilaya = wilayaValue.trim();
    const baladia = baladiaValue.trim();
    
    if (!selectedWatch || !perfumeChoice || !name || !phone || !wilaya || !baladia) {
      setShowErrors(true);
      
      // Scroll to first error
      setTimeout(() => {
        if (!selectedWatch) {
          document.querySelector('fieldset')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (!perfumeChoice) {
          document.querySelectorAll('fieldset')[1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (!name) {
          document.getElementById('name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (!phone) {
          document.getElementById('phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (!wilaya) {
          document.getElementById('wilaya')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (!baladia) {
          document.getElementById('baladia')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    const watchName = watchModels.find(w => w.id === selectedWatch)?.label || "غير محدد";
    const watchImgPath = selectedWatch ? `/whatchs/${selectedWatch.replace('model','')}.jpg` : "";
    // Get full URL with automatic domain detection for WhatsApp
    const fullImageUrl = watchImgPath ? `${window.location.origin}${watchImgPath}` : "";
    const perfume = perfumeChoice === "sauvage" ? "عطر سوفاج" : "عطر ويسكي";
    const delivery = deliveryType === "home" ? "توصيل للمنزل (800 دج)" : "توصيل للمكتب (500 دج)";
    const total = calculateTotal();
    
    const message = `*طلب جديد من Omnimart*\n\n` +
      `الاسم: ${name}\n` +
      `الهاتف: ${phone}\n` +
      `الولاية: ${wilaya}\n` +
      `البلدية: ${baladia}\n` +
      `موديل الساعة: ${watchName}\n` +
      (fullImageUrl ? `صورة الموديل: ${fullImageUrl}\n` : "") +
      `العطر: ${perfume}\n` +
      `الكمية: ${quantity}\n` +
      `${delivery}\n` +
      `المجموع الكلي: ${total} دج`;
    
    const whatsappUrl = `https://wa.me/213776863561?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <Image src="/logo/logo.jpg" alt="شعار Omnimart" width={50} height={50} className="rounded-lg" priority />
            <h1 className="text-3xl font-bold text-black">Omnimart</h1>
          </div>
        </div>
      </header>
      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-6">
          <div className="animate-spin h-16 w-16 border-4 border-black border-t-transparent rounded-full mb-8" />
          <p className="text-2xl font-bold text-black">جاري إرسال طلبك...</p>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        {formState.success ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
            <CheckCircle2 className="w-24 h-24 text-green-600" />
            <h2 className="text-4xl font-bold text-black">تم استلام طلبك بنجاح ✅</h2>
            <p className="text-xl text-gray-700 max-w-xl leading-relaxed">
              شكراً لك! تم إرسال طلبك وسنتواصل معك قريباً للتأكيد. يمكنك أيضاً تتبع طلبك عبر رسالة واتساب عندما يصلك إشعار التوصيل.
            </p>
            <button
              type="button"
              onClick={() => { window.location.reload(); }}
              className="px-10 py-4 rounded-xl bg-black text-white text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              إنشاء طلب جديد
            </button>
          </div>
        ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Media Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4">
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-4 bg-gray-50">
                <Image 
                  src={heroImage === 1 ? "/box/1.jpg" : "/box/2.jpg"} 
                  alt={heroImage === 1 ? "صندوق الأناقة - الصورة الأمامية" : "صندوق الأناقة - محتويات الصندوق"}
                  width={600} 
                  height={600} 
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300" 
                  onClick={() => setHeroImage(heroImage === 1 ? 2 : 1)}
                  priority
                />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setHeroImage(1)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    heroImage === 1 ? "border-black ring-2 ring-black" : "border-gray-300"
                  }`}
                >
                  <Image 
                    src="/box/1.jpg" 
                    alt="عرض الصندوق" 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setHeroImage(2)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    heroImage === 2 ? "border-black ring-2 ring-black" : "border-gray-300"
                  }`}
                >
                  <Image 
                    src="/box/2.jpg" 
                    alt="المحتويات" 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-4xl font-bold mb-3 text-black">صندوق الأناقة</h2>
              <p className="text-lg text-gray-800 mb-4 leading-relaxed">هدية مثالية تحتوي على ساعة فاخرة وإكسسوارات أنيقة</p>
              <div className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl text-3xl font-bold">
                <span>2000 دج</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="space-y-6">
            {/* Order Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8">
              <h3 className="text-3xl font-bold mb-6 text-black">أكمل طلبك الآن</h3>

              <form action={handleSubmit} className="space-y-6">
                <input type="hidden" name="watchModel" value={selectedWatch} />
                <input
                  type="hidden"
                  name="watchImage"
                  value={selectedWatch ? `/whatchs/${selectedWatch.replace('model','')}.jpg` : ''}
                />
                <input type="hidden" name="perfumeModel" value={perfumeChoice} />

                {/* Watch Selection Fieldset (images only, no title text) */}
                <fieldset className="rounded-xl p-5 border-2" style={{ borderColor: showErrors && !selectedWatch ? "#dc2626" : "#000" }}>
                  <legend className="sr-only">موديل الساعة</legend>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {watchModels.map((model, index) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedWatch(model.id)}
                        className="p-3 rounded-lg border-2 transition-all hover:shadow-lg"
                        style={{
                          borderColor: selectedWatch === model.id ? "#000" : "#d1d5db",
                          backgroundColor: selectedWatch === model.id ? "#f3f4f6" : "white",
                          boxShadow: selectedWatch === model.id ? "0 0 0 3px rgba(0,0,0,0.1)" : "none"
                        }}
                      >
                        <div className="aspect-square w-full mb-2 rounded overflow-hidden bg-gray-100">
                          <Image 
                            src={model.img} 
                            alt={model.label}
                            width={120} 
                            height={120} 
                            className="w-full h-full object-cover"
                            loading={index < 4 ? "eager" : "lazy"}
                          />
                        </div>
                        {selectedWatch === model.id && (
                          <CheckCircle2 className="w-5 h-5 mx-auto mt-2 text-black" />
                        )}
                      </button>
                    ))}
                  </div>
                  {showErrors && !selectedWatch && (
                    <p className="text-red-600 text-base mt-3 font-bold bg-red-50 p-3 rounded-lg">⚠️ يرجى اختيار موديل الساعة</p>
                  )}
                </fieldset>

                {/* Perfume Selection */}
                <fieldset className="rounded-xl p-5 border-2" style={{ borderColor: showErrors && !perfumeChoice ? "#dc2626" : "#000" }}>
                  <legend className="text-xl font-bold px-3 text-black">اختر العطر</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setPerfumeChoice("sauvage")}
                      className="p-4 rounded-lg border-2 transition-all hover:shadow-lg flex items-center justify-between"
                      style={{
                        borderColor: perfumeChoice === "sauvage" ? "#000" : "#d1d5db",
                        backgroundColor: perfumeChoice === "sauvage" ? "#f3f4f6" : "white"
                      }}
                    >
                      <span className="text-base font-bold text-black">عطر سوفاج</span>
                      {perfumeChoice === "sauvage" && <CheckCircle2 className="w-6 h-6 text-black" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerfumeChoice("whisky")}
                      className="p-4 rounded-lg border-2 transition-all hover:shadow-lg flex items-center justify-between"
                      style={{
                        borderColor: perfumeChoice === "whisky" ? "#000" : "#d1d5db",
                        backgroundColor: perfumeChoice === "whisky" ? "#f3f4f6" : "white"
                      }}
                    >
                      <span className="text-base font-bold text-black">عطر ويسكي</span>
                      {perfumeChoice === "whisky" && <CheckCircle2 className="w-6 h-6 text-black" />}
                    </button>
                  </div>
                  {showErrors && !perfumeChoice && (
                    <p className="text-red-600 text-base mt-3 font-bold bg-red-50 p-3 rounded-lg">⚠️ يرجى اختيار العطر</p>
                  )}
                </fieldset>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-base font-bold mb-2 text-black">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    style={{ borderColor: showErrors && !nameValue ? "#dc2626" : "#000" }}
                    placeholder="أدخل اسمك الكامل"
                    value={nameValue}
                    onChange={(e) => { setNameValue(e.target.value); setShowErrors(false); }}
                  />
                  {showErrors && !nameValue && (
                    <p className="text-red-600 text-sm mt-1 font-semibold">⚠️ يرجى إدخال الاسم</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-base font-bold mb-2 text-black">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    inputMode="numeric"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    style={{ borderColor: showErrors && !phoneValue ? "#dc2626" : "#000" }}
                    placeholder="0555123456"
                    pattern="0[567]\d{8}"
                    value={phoneValue}
                    onChange={(e) => { setPhoneValue(e.target.value); setShowErrors(false); }}
                    onInvalid={(e) => {
                      e.preventDefault();
                      setShowErrors(true);
                      (e.target as HTMLInputElement).setCustomValidity("رقم الهاتف غير صحيح. يجب أن يبدأ بــ 05 أو 06 أو 07 ويكون 10 أرقام.");
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).setCustomValidity("");
                    }}
                  />
                  {showErrors && !phoneValue && (
                    <p className="text-red-600 text-sm mt-1 font-semibold">⚠️ يرجى إدخال رقم الهاتف</p>
                  )}
                  {showErrors && phoneValue && !(new RegExp(/^0[567]\d{8}$/).test(phoneValue)) && (
                    <p className="text-red-600 text-sm mt-1 font-semibold">⚠️ رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويكون المجموع 10 أرقام.</p>
                  )}
                </div>

                {/* Wilaya - Text Input */}
                <div>
                  <label htmlFor="wilaya" className="block text-base font-bold mb-2 text-black">
                    الولاية
                  </label>
                  <input
                    type="text"
                    id="wilaya"
                    name="wilaya"
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    style={{ borderColor: showErrors && !wilayaValue ? "#dc2626" : "#000" }}
                    placeholder="أدخل اسم الولاية"
                    value={wilayaValue}
                    onChange={(e) => { setWilayaValue(e.target.value); setShowErrors(false); }}
                  />
                  {showErrors && !wilayaValue && (
                    <p className="text-red-600 text-sm mt-1 font-semibold">⚠️ يرجى إدخال الولاية</p>
                  )}
                </div>

                {/* Baladia */}
                <div>
                  <label htmlFor="baladia" className="block text-base font-bold mb-2 text-black">
                    البلدية
                  </label>
                  <input
                    type="text"
                    id="baladia"
                    name="baladia"
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    style={{ borderColor: showErrors && !baladiaValue ? "#dc2626" : "#000" }}
                    placeholder="أدخل اسم البلدية"
                    value={baladiaValue}
                    onChange={(e) => { setBaladiaValue(e.target.value); setShowErrors(false); }}
                  />
                  {showErrors && !baladiaValue && (
                    <p className="text-red-600 text-sm mt-1 font-semibold">⚠️ يرجى إدخال البلدية</p>
                  )}
                </div>

                {/* Quantity & Delivery Type */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-base font-bold mb-2 text-black">
                      الكمية
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-2 text-black">نوع التوصيل</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md" style={{ borderColor: deliveryType === "home" ? "#000" : "#d1d5db", backgroundColor: deliveryType === "home" ? "#f3f4f6" : "white" }}>
                        <input
                          type="radio"
                          name="deliveryType"
                          value="home"
                          checked={deliveryType === "home"}
                          onChange={(e) => setDeliveryType(e.target.value as "home" | "desk")}
                          className="w-5 h-5"
                          style={{ accentColor: "#000" }}
                        />
                        <Home className="w-5 h-5 text-black" />
                        <span className="flex-1 text-sm font-bold text-black">منزل (800 دج)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md" style={{ borderColor: deliveryType === "desk" ? "#000" : "#d1d5db", backgroundColor: deliveryType === "desk" ? "#f3f4f6" : "white" }}>
                        <input
                          type="radio"
                          name="deliveryType"
                          value="desk"
                          checked={deliveryType === "desk"}
                          onChange={(e) => setDeliveryType(e.target.value as "home" | "desk")}
                          className="w-5 h-5"
                          style={{ accentColor: "#000" }}
                        />
                        <Building2 className="w-5 h-5 text-black" />
                        <span className="flex-1 text-sm font-bold text-black">مكتب (500 دج)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Error Message (only show if failure) */}
                {formState.message && !formState.success && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-5 rounded-xl text-center font-bold tracking-wide shadow-sm border-2 bg-red-50 text-red-800 border-red-300"
                  >
                    ❌ {formState.message}
                  </div>
                )}
              </form>
            </div>

            {/* Price Summary - Below Form */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4 text-black">ملخص الطلب</h3>
              <div className="space-y-3 text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">سعر المنتج:</span>
                  <span className="font-bold text-black">2000 دج × {quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">تكلفة التوصيل:</span>
                  <span className="font-bold text-black">{deliveryType === "home" ? "800" : "500"} دج</span>
                </div>
                <div className="pt-3 flex justify-between items-center border-t-2 border-black">
                  <span className="font-bold text-xl text-black">المجموع:</span>
                  <span className="font-bold text-3xl text-black">{calculateTotal()} دج</span>
                </div>
              </div>
            </div>

            {/* Dual CTA Buttons (Submit first then WhatsApp) */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  const name = nameValue.trim();
                  const phone = phoneValue.trim();
                  const wilaya = wilayaValue.trim();
                  const baladia = baladiaValue.trim();
                  
                  if (!selectedWatch || !perfumeChoice || !name || !phone || !wilaya || !baladia) {
                    setShowErrors(true);
                    
                    // Scroll to first error field
                    setTimeout(() => {
                      if (!selectedWatch) {
                        document.querySelector('fieldset')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else if (!perfumeChoice) {
                        document.querySelectorAll('fieldset')[1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else if (!name) {
                        document.getElementById('name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else if (!phone) {
                        document.getElementById('phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else if (!wilaya) {
                        document.getElementById('wilaya')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else if (!baladia) {
                        document.getElementById('baladia')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                    return;
                  }
                  if (isPending) return; // guard against double click while pending
                  
                  const form = document.querySelector('form');
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                    if (!submitEvent.defaultPrevented) {
                      handleSubmit(new FormData(form));
                    }
                  }
                }}
                disabled={isPending}
                className="w-full bg-black text-white py-5 rounded-xl text-xl font-bold transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </button>
              <button
                type="button"
                onClick={() => { if (!isPending) handleWhatsAppOrder(); }}
                className="w-full text-white py-5 rounded-xl text-xl font-bold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#25D366" }}
                disabled={isPending}
              >
                <Phone className="w-7 h-7" />
                اطلب عبر واتساب
              </button>
            </div>
          </div>
        </div>
        )}

        {/* FAQ Section */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8">
            <h3 className="text-3xl font-bold mb-6 text-center text-black">الأسئلة الشائعة</h3>
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <Truck className="w-7 h-7 flex-shrink-0 text-black" />
                  <div>
                    <h4 className="font-bold mb-2 text-lg text-black">كم مدة التوصيل؟</h4>
                    <p className="text-gray-800 text-base">من 2 إلى 3 أيام عمل عبر شركة ياليدين للشحن السريع لجميع ولايات الجزائر</p>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-7 h-7 flex-shrink-0 text-black" />
                  <div>
                    <h4 className="font-bold mb-2 text-lg text-black">كيف أدفع؟</h4>
                    <p className="text-gray-800 text-base">الدفع عند الاستلام - تدفع المبلغ نقداً عندما يصلك المنتج</p>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <Shield className="w-7 h-7 flex-shrink-0 text-black" />
                  <div>
                    <h4 className="font-bold mb-2 text-lg text-black">هل المنتجات أصلية؟</h4>
                    <p className="text-gray-800 text-base">نعم، جميع منتجاتنا أصلية 100% ونضمن الجودة العالية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-5 bg-white rounded-xl text-center hover:shadow-xl transition-all">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-black" />
            <h4 className="font-bold text-base mb-2 text-black">توصيل سريع</h4>
            <p className="text-gray-700 text-sm">التوصيل لجميع الولايات</p>
          </div>
          <div className="p-5 bg-white rounded-xl text-center hover:shadow-xl transition-all">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-black" />
            <h4 className="font-bold text-base mb-2 text-black">جودة عالية</h4>
            <p className="text-gray-700 text-sm">منتجات أصلية ومضمونة</p>
          </div>
          <div className="p-5 bg-white rounded-xl text-center hover:shadow-xl transition-all">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-black" />
            <h4 className="font-bold text-base mb-2 text-black">دفع عند الاستلام</h4>
            <p className="text-gray-700 text-sm">ادفع عندما تستلم المنتج</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl font-bold mb-2">Omnimart</p>
          <p className="text-gray-400 text-base">منصة التسوق الإلكتروني الموثوقة في الجزائر</p>
        </div>
      </footer>
    </div>
  );
}
