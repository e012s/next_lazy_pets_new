"use client";
import { iconSrc } from "@/icons/sources";

import { getAssignment } from "@/service/mock/assignments";
import { navigate } from "@/lib/navigation";
import { RegisterDataPrompt, useNeedsRegistration } from "@/components/RegisteredData";
export default function OrderMap({ id }) {
  const needsRegistration = useNeedsRegistration();
  const assignment = id ? getAssignment(id) : undefined;
  if (needsRegistration) {
    return (
      <div className="px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看訂單。" />
      </div>
    );
  }
  if (!assignment) {
    return <p className="px-4 py-8 text-sm text-[#797979]">找不到這張訂單。</p>;
  }
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(assignment.mapQuery)}`;
  return (<div className="space-y-3 px-5 py-4">
    <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#d7eef3]">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:28px_28px]" />
      <span className="relative flex flex-col items-center px-4 text-center text-[#0091b2]">
        <img src={iconSrc["order-location"]} alt="" aria-hidden className="inline-block object-contain size-10" />
        <span className="mt-1 text-sm font-medium">{assignment.place}</span>
      </span>
    </div>
    <section className="rounded-2xl bg-white p-4">
      <p className="text-[12px] text-[#797979]">{assignment.code}</p>
      <h2 className="mt-1 text-[15px] font-medium text-[#4d5257]">{assignment.title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#4d5257]">{assignment.place}</p>
    </section>
    <a href={maps} className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" target="_blank" rel="noreferrer">
      用 Google 地圖開啟
    </a>
    <button type="button" onClick={() => navigate(`/orders/${assignment.id}`)} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-title font-medium text-brand transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      返回訂單
    </button>
  </div>);
}