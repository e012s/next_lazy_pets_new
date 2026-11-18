"use client";
import { phone } from "@/lib/format";
export function ContactSheet({ name, phoneNumber, meta, onClose, }) {
    return (<div className="fixed inset-0 z-40 flex justify-center">
      <button type="button" className="absolute inset-0 bg-[#102028]/40" aria-label="關閉聯絡資料" onClick={onClose}/>
      <div className="absolute bottom-6 left-1/2 w-[min(22rem,calc(100%-2rem))] max-w-[500px] -translate-x-1/2 rounded-2xl bg-white p-5 shadow-xl">
        <p className="text-xs text-[#797979]">聯絡客人</p>
        <h2 className="mt-1 text-lg font-medium text-[#4d5257]">{name}</h2>
        <p className="mt-1 text-2xl font-bold tracking-wide text-[#0091b2]">{phone(phoneNumber)}</p>
        <p className="mt-2 text-sm text-[#797979]">{meta}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-title font-medium text-brand transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={onClose}>
            關閉
          </button>
          <a className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href={`tel:${phoneNumber}`}>
            致電
          </a>
        </div>
      </div>
    </div>);
}
