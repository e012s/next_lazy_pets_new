"use client";
import { useState } from "react";
import { navigate } from "@/lib/navigation";
import { iconSrc } from "@/icons/sources";

const MAX_PHOTOS = 4;
const MIN_PHOTOS = 3;
const MAX_CHARS = 300;
const SAMPLE_PHOTO = "/images/sample-image.jpg"; // mock image until real upload exists
let photoSeq = 0;
const newPhoto = (src = SAMPLE_PHOTO, uploaded = false, isVideo = false) => ({
  key: `p${++photoSeq}`,
  src,
  uploaded,
  isVideo,
});

/**
 * Shared 提交報告 UI for both pet (寵物) and repair (維修) orders 
 * variant: "pet" |"repair" (copy comes from the normalized props).
 * Also drives the boarding 更新日誌 page via the optional props below;
 * their defaults keep the 提交報告 page unchanged.
 */
export default function ServiceReport({
  variant = "pet",
  id,
  bannerWhen,
  statusBadge,
  bannerDetail,
  startedAt,
  photoLabels = [],
  photoHint,
  photoSectionTitle,
  messageLabel,
  messagePlaceholder,
  defaultMessage = "",
  footerHint,
  backHref,
  readOnly = false,
  initialPhotos = 0,
  minPhotos = MIN_PHOTOS,
  photoRangeLabel = "（3–4 張，必填）",
  allowVideo = false,
  statusTone = "started",
  statusTitle,
  statusSubtitle = "客人已收到通知",
  ctaLabel = "完成服務並提交報告",
  successTitle = "報告已提交",
  successBody,
  placeholderPhotos = false,
}) {
  const [photoList, setPhotoList] = useState(() =>
    Array.from({ length: readOnly ? Math.max(initialPhotos, minPhotos) : initialPhotos }, () => newPhoto()),
  );
  const photos = photoList.length;
  const [message, setMessage] = useState(defaultMessage);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function addPhotos(event) {
    const files = Array.from(event.target.files ?? []).filter(
      (f) => f.type.startsWith("image/") || (allowVideo && f.type.startsWith("video/")),
    );
    event.target.value = ""; // allow picking the same file again
    if (readOnly || files.length === 0) return;
    setError("");
    setPhotoList((list) => {
      const room = MAX_PHOTOS - list.length;
      if (room <= 0) return list;
      return [...list, ...files.slice(0, room).map((f) => newPhoto(URL.createObjectURL(f), true, f.type.startsWith("video/")))];
    });
  }

  function removePhoto(key) {
    if (readOnly || sent) return;
    setPhotoList((list) => {
      const target = list.find((p) => p.key === key);
      if (target?.uploaded) URL.revokeObjectURL(target.src);
      return list.filter((p) => p.key !== key);
    });
  }

  function submit() {
    if (readOnly) {
      navigate(backHref);
      return;
    }
    if (photos < minPhotos) {
      setError(allowVideo ? `請上載最少 ${minPhotos} 個相片／影片。` : `請上載最少 ${minPhotos} 張相片。`);
      return;
    }
    if (!message.trim()) {
      setError(`請填寫${messageLabel}。`);
      return;
    }
    setError("");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-[calc(100dvh-52px)] flex-col items-center justify-center px-[30px] text-center">
        <span className="flex size-[64px] items-center justify-center rounded-full bg-[#0091b2]">
          <img src="/icons/check.svg" alt="" aria-hidden className="size-7 brightness-0 invert" />
        </span>
        <h2 className="mt-4 text-[18px] font-bold text-[#4d5257]">{successTitle}</h2>
        <p className="mt-2 text-[13px] leading-5 text-[#797979]">
          {successBody ?? (
            <>
              相片同{variant === "repair" ? "說明" : "留言"}已發送俾客人，訂單已完成。
              <br />
              酬勞會入下月 7 號結算。
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => navigate(backHref)}
          className="mt-8 inline-flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#0091b2] text-[15px] font-bold text-white active:opacity-90"
        >
          返回訂單
        </button>
      </div>
    );
  }

  const canDelete = !readOnly && !sent;

  return (
    <div data-report-id={id} data-variant={variant}>
      {/* Teal banner */}
      <section className="bg-[#0091b2] px-[15px] pb-[14px] pt-[16px] text-white">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-bold leading-5">{bannerWhen}</p>
          <span className="inline-flex h-[24px] shrink-0 items-center gap-1 rounded-full bg-white px-[10px] text-[12px] font-bold text-[#0091b2]">
            {variant === "pet" ? (
              <img src="/icons/order-detail/clock_blue.svg" alt="" aria-hidden className="size-[14px]" />
            ) : null}
            {statusBadge}
          </span>
        </div>
        <p className="mt-[6px] text-[12px] leading-[18px] text-white/90">{bannerDetail}</p>
      </section>

      <div className="space-y-[22px] px-[15px] pb-6 pt-[18px]">
        {/* Status card */}
        <section className="flex items-center gap-3 rounded-[8px] border border-[#c6ccd2] bg-white px-[15px] py-[14px]">
          {statusTone === "pending" ? (
            <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#d95959] text-[13px] font-bold leading-none text-white" aria-hidden>
              !
            </span>
          ) : (
            <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-[#0091b2]">
              <img src="/icons/check.svg" alt="" aria-hidden className="size-[14px] brightness-0 invert" />
            </span>
          )}
          <div>
            <p className="text-[14px] font-bold text-[#4d5257]">
              {statusTitle ?? (readOnly ? "已完成服務" : `已開始服務（${startedAt}）`)}
            </p>
            <p className="text-[12px] text-[#797979]">{statusSubtitle}</p>
          </div>
        </section>

        {/* Photos */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-[14px] font-bold text-[#4d5257]">
              {photoSectionTitle}
              <span className="ml-1 text-[12px] font-normal text-[#797979]">{photoRangeLabel}</span>
            </h2>
            <span className="text-[12px] text-[#797979]">
              {photos} / {MAX_PHOTOS}
            </span>
          </div>
          {photoHint ? <p className="mt-1 text-[12px] text-[#797979]">{photoHint}</p> : null}
          <div className="mt-[10px] grid grid-cols-4 gap-[8px]">
            {photoList.map((photo, i) => {
              const label = photoLabels[i] ?? "相片";
              return (
                <div key={photo.key} className="relative aspect-square overflow-hidden rounded-[6px] bg-[#e9ecef]">
                  {placeholderPhotos && !photo.uploaded ? (
                    <span
                      role="img"
                      aria-label={label}
                      className="flex size-full items-center justify-center bg-[repeating-linear-gradient(135deg,#e9ecef_0px,#e9ecef_6px,#f5f6f8_6px,#f5f6f8_12px)] text-[12px] leading-normal text-[#797979]"
                    >
                      {label}
                    </span>
                  ) : photo.isVideo ? (
                    <video src={photo.src} muted playsInline aria-label={label} className="size-full object-cover" />
                  ) : (
                    <img src={photo.src} alt={label} className="size-full object-cover" />
                  )}
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.key)}
                      aria-label={`刪除${label}`}
                      className="absolute top-1.5 right-1.5 flex items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
                    >
                      <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
            {!readOnly && photos < MAX_PHOTOS ? (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-[6px] border border-[#c6ccd2] bg-white text-[12px] text-[#4d5257] active:bg-[#f2f4f6] focus-within:outline-2 focus-within:outline-[#0091b2]">
                <input
                  type="file"
                  accept={allowVideo ? "image/*,video/*" : "image/*"}
                  multiple
                  onChange={addPhotos}
                  className="sr-only"
                />
                <img src="/icons/camera.svg" alt="" aria-hidden className="size-[20px]" />
                影相
              </label>
            ) : null}
          </div>
        </section>

        {/* Message */}
        <section>
          <label htmlFor={`report-msg-${id}`} className="text-[14px] font-bold text-[#4d5257]">
            {messageLabel}
            <span className="ml-1 text-[12px] font-normal text-[#797979]">（必填）</span>
          </label>
          <textarea
            id={`report-msg-${id}`}
            value={message}
            readOnly={readOnly}
            maxLength={MAX_CHARS}
            rows={4}
            placeholder={messagePlaceholder}
            onChange={(e) => {
              setError("");
              setMessage(e.target.value.slice(0, MAX_CHARS));
            }}
            className="mt-[10px] w-full resize-none rounded-[8px] border border-[#c6ccd2] bg-white px-[15px] py-[12px] text-[14px] leading-[22px] text-[#4d5257] outline-none placeholder:text-[#b5bcc3] focus-visible:border-[#0091b2]"
          />
          <p className="mt-1 text-right text-[12px] text-[#797979]">
            {message.length}/{MAX_CHARS}
          </p>
        </section>

        {error ? (
          <p role="alert" className="text-[13px] text-[#d95959]">
            {error}
          </p>
        ) : null}

        {/* CTA */}
        <div>
          <button
            type="button"
            onClick={submit}
            className={`inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#0091b2] text-[15px] font-bold text-white active:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0091b2]`}
          >
            {readOnly ? null : (
              <img src="/icons/check.svg" alt="" aria-hidden className="size-[16px] brightness-0 invert" />
            )}
            {readOnly ? "返回訂單" : ctaLabel}
          </button>
          <p className="mt-3 whitespace-pre-line text-center text-[11px] text-[#797979]">{footerHint}</p>
        </div>
      </div>
    </div>
  );
}
