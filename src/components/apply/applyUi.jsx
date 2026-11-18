"use client";

import { useRef } from "react";
import { PhotoBrowseImage } from "@/components/PhotoBrowseImage";
import { iconSrc } from "@/icons/sources";
import { dobInputSuffix, formatDobInput } from "@/lib/format";

export const APPLY_HK_ID_UPLOAD_ICON = iconSrc["upload_ic"];
export const APPLY_LICENSE_UPLOAD_ICON = iconSrc["form-license-upload"];

export const applyFieldClass =
  "h-12 w-full rounded-lg border border-[#c6ccd2] bg-white px-4 text-[14px] leading-5 font-normal outline-none placeholder:text-placeholder focus-visible:border-brand";
export const applyFieldErrorClass = "border-alert focus-visible:border-alert";

/** Default (new application): step 1 active. States: "done" | "active" | "upcoming". */
const defaultStepperSteps = [
  { n: "1", label: "提交申請", state: "active" },
  { n: "2", label: "審批中", state: "upcoming" },
  { n: "3", label: "未驗證", state: "upcoming" },
];

export function ApplyGlyph({ src, className }) {
  return <img src={src} alt="" aria-hidden className={`inline-block object-contain ${className ?? ""}`} />;
}

export function ApplyStepper({ steps = defaultStepperSteps }) {
  return (
    <ol className="flex w-full items-start px-10 pt-6">
      {steps.flatMap((step, index) => {
        const nodes = [];
        const filled = step.state === "done" || step.state === "active";
        if (index > 0) {
          const prevDone = steps[index - 1]?.state === "done";
          nodes.push(
            <li key={`line-${index}`} className="flex h-7 min-w-5 flex-1 items-center" aria-hidden>
              <span className={`h-0.5 w-full ${prevDone ? "bg-[#0091b2]" : "bg-[#c6ccd2]"}`} />
            </li>,
          );
        }
        nodes.push(
          <li key={step.label} className="flex shrink-0 flex-col items-center text-center">
            <span
              className={
                filled
                  ? "flex size-7 items-center justify-center rounded-full bg-[#0091b2] text-[14px] leading-5 font-bold text-white"
                  : "flex size-7 items-center justify-center rounded-full border-2 border-[#b9b9b9] bg-white text-[14px] leading-5 font-bold text-[#b9b9b9]"
              }
            >
              {step.n}
            </span>
            <span
              className={
                step.state === "active"
                  ? "mt-1.5 block text-[13px] leading-5 font-bold text-[#0091b2]"
                  : "mt-1.5 block text-[13px] leading-5 font-normal text-[#797979]"
              }
            >
              {step.label}
            </span>
          </li>,
        );
        return nodes;
      })}
    </ol>
  );
}

export function ApplySummaryChip({ children, className }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full bg-brand-softer py-1 px-3 text-[12px] leading-5 font-bold text-brand${className ? ` ${className}` : ""}`}
    >
      {children}
    </span>
  );
}

export function ApplyPill({
  active,
  children,
  onClick,
  className,
  readOnly = false,
}) {
  const pillClass = `inline-flex h-10 items-center justify-center rounded-full px-[18px] text-center text-[14px] leading-5 font-bold${active ? " bg-brand text-white" : " border border-[#b9b9b9] bg-white text-[#4d5257]"}${className ? ` ${className}` : ""}`;
  if (readOnly) {
    return <span className={pillClass}>{children}</span>;
  }
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={pillClass}
    >
      {children}
    </button>
  );
}

export function ApplyDobTextInput({ value, onChange, className, invalid, inputHeightClass = "h-12" }) {
  const digits = value.replace(/\D/g, "");
  const suffix = dobInputSuffix(digits.length);
  const showPlaceholder = digits.length === 0;
  const paddingClass = inputHeightClass === "h-10" ? " px-3" : " px-4";
  const textClass = "text-[16px] leading-5 font-normal";
  return (
    <>
      <input
        className={`${className} ${textClass}`}
        value={value}
        placeholder={showPlaceholder ? "YYYY/MM/DD" : ""}
        inputMode="numeric"
        autoComplete="bday"
        maxLength={10}
        aria-invalid={invalid}
        aria-describedby={invalid ? "dob-error" : undefined}
        onChange={(event) => onChange(formatDobInput(event.target.value))}
      />
      {suffix ? (
        <span
          className={`pointer-events-none absolute top-0 left-0 flex items-center ${textClass} ${inputHeightClass} ${paddingClass}`}
          aria-hidden
        >
          <span className="invisible whitespace-pre">{value}</span>
          <span className="text-[#b9b9b9]">{suffix}</span>
        </span>
      ) : null}
    </>
  );
}

export function ApplyUploadPlaceholder({
  hint,
  className,
  onClick,
  ariaLabel,
  iconClassName = "size-[27px]",
  iconSrc: uploadIconSrc = APPLY_HK_ID_UPLOAD_ICON,
  square = true,
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? hint ?? "上傳相片"}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#b9b9b9] bg-white text-muted${square ? " aspect-square" : ""} ${className}`}
    >
      <img src={uploadIconSrc} alt="" aria-hidden className={`object-contain ${iconClassName}`} />
      {hint ? <span className="text-[12px] leading-[17px]">{hint}</span> : null}
    </button>
  );
}

function HkIdUploadStatus({ uploadedCount }) {
  if (uploadedCount >= 2) {
    return <span className="shrink-0 text-[12px] leading-[18px] font-bold text-[#0091b2]">已完成</span>;
  }
  return (
    <span className="shrink-0 text-[12px] leading-[18px] font-bold text-[#797979]">
      {uploadedCount} / 2 已上傳
    </span>
  );
}

function ApplyIdFace({ label, previewUrl, gallerySources, galleryIndex, onFile, onRemove, uploadHint }) {
  const inputRef = useRef(null);
  const hint = uploadHint ?? `上傳${label}`;
  const sources = gallerySources?.filter(Boolean) ?? [];
  return (
    <div>
      <div className={`relative h-[120px] overflow-hidden rounded-lg${previewUrl ? " bg-[#eef0f3]" : ""}`}>
        {previewUrl ? (
          <>
            <PhotoBrowseImage
              sources={sources.length > 0 ? sources : undefined}
              src={previewUrl}
              index={galleryIndex ?? 0}
              className="block h-full w-full"
              imgClassName="h-full w-full object-contain"
            />
            <button
              type="button"
              aria-label={`移除身份證${label}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              className="absolute top-1.5 right-1.5 flex items-center justify-center text-[#797979]"
            >
              <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-[22px]" />
            </button>
            <span className="absolute bottom-1.5 left-1.5 inline-flex h-5 items-center gap-0.5 rounded bg-white px-1.5 text-[11px] leading-4 font-bold text-[#0091b2]">
              <ApplyGlyph src="/icons/form-check-circle.svg" className="size-3.5" />
              已上傳
            </span>
          </>
        ) : (
          <ApplyUploadPlaceholder
            hint={hint}
            className="h-full w-full"
            iconSrc={APPLY_HK_ID_UPLOAD_ICON}
            ariaLabel={`上載身份證${label}`}
            onClick={() => inputRef.current?.click()}
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = "";
          }}
        />
      </div>
      <p className="mt-1.5 text-center text-[12px] leading-[18px] font-normal text-[#797979]">{label}</p>
    </div>
  );
}

export function ApplyHkIdSection({
  idFrontPreview,
  idBackPreview,
  uploadedCount,
  onFrontFile,
  onBackFile,
  onFrontRemove,
  onBackRemove,
}) {
  const idGallery = [idFrontPreview, idBackPreview].filter(Boolean);
  return (
    <>
      <h2 className="text-[18px] leading-[26px] font-bold text-[#4d5257]">身份 / 牌照驗證</h2>
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-[14px] leading-5 font-bold text-[#4d5257]">香港身份證</h3>
        <HkIdUploadStatus uploadedCount={uploadedCount} />
      </div>
      <div className="mt-3 rounded-lg border border-[#c6ccd2] bg-white p-4">
        <div className="grid grid-cols-2 gap-3">
          <ApplyIdFace
            label="正面"
            uploadHint="上傳正面"
            previewUrl={idFrontPreview}
            gallerySources={idGallery}
            galleryIndex={Math.max(0, idGallery.indexOf(idFrontPreview))}
            onFile={onFrontFile}
            onRemove={onFrontRemove}
          />
          <ApplyIdFace
            label="背面"
            uploadHint="上傳背面"
            previewUrl={idBackPreview}
            gallerySources={idGallery}
            galleryIndex={Math.max(0, idGallery.indexOf(idBackPreview))}
            onFile={onBackFile}
            onRemove={onBackRemove}
          />
        </div>
        <p className="mt-3.5 flex gap-2 text-[12px] leading-[18px] text-[#797979]">
          <ApplyGlyph src="/icons/form-info.svg" className="mt-0.5 size-[19px] shrink-0" />
          <span>請確保四角完整、字體清晰，避免反光。資料只用作身份核實，不會向客人顯示。</span>
        </p>
      </div>
    </>
  );
}
