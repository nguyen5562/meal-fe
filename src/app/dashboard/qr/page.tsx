"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";

export default function QRGeneratorPage() {
  const [tables] = useState([
    { id: 1, tableName: "Bàn 1", qrToken: "abc-123" },
    { id: 2, tableName: "Bàn 2", qrToken: "xyz-789" },
    { id: 3, tableName: "Bàn 3", qrToken: "def-456" },
  ]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">Tạo Mã QR Cố Định</h1>
        <button
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-5 h-5" />
          In khổ A4 (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-12">
        {tables.map(table => (
          <div key={table.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center print:shadow-none print:border-2 print:border-slate-800 print:break-inside-avoid print:p-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{table.tableName}</h2>
            <p className="text-slate-500 mb-8 text-lg">Quét mã để đánh giá bữa ăn</p>
            <div className="bg-white p-4 rounded-xl border-2 border-slate-100 print:border-none">
              <QRCodeSVG 
                value={`https://app.com/rate/${table.qrToken}`} 
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="mt-8 text-sm font-medium text-slate-400 font-mono tracking-wider">{table.qrToken}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
