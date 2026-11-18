"use client";

import { useState } from "react";
import { iconSrc } from "@/icons/sources";
import { ReviewStarRow } from "@/components/orders/ReviewStars";
import { ContactGuestLink } from "@/components/ContactGuestLink";
import { usePhotoBrowser } from "@/components/PhotoBrowser/PhotoBrowserProvider";
import { mediaItemSources } from "@/components/orders/dailyLogMedia";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const detailEase = "duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]";
const detailGridMotion = `grid transition-[grid-template-rows] ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;
const detailFadeMotion = `transition-opacity ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;
const chevronMotion = `transition-transform ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;

export const completedCardClass = "rounded-[8px] border border-[#c6ccd2] bg-white";

export const completedContactBtnClass =
  "inline-flex h-12 w-full items-center justify-center rounded-[8px] border border-[#0091b2] bg-white px-4 text-center text-[16px] font-bold leading-[23px] text-[#0091b2] transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50";

const rowIcon = {
  pet: "animal",
  pin: "order-location",
  plus: "order-add-ons",
  budget: "budget",
  clock: "order-clock",
  pay: "budget",
};

export function PhotoPlaceholder({ className = "", label = "相片" }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex items-center justify-center bg-[repeating-linear-gradient(135deg,#e9ecef_0px,#e9ecef_6px,#f5f6f8_6px,#f5f6f8_12px)] text-[12px] leading-normal text-[#797979] ${className}`}
    >
      {label}
    </span>
  );
}

export function CompletedDetailHeader({ iconKey, iconSize = 50, title, code, subtitle, badge = "已完成" }) {
  return (
    <section className="flex items-start gap-3">
      <img
        src={iconSrc[iconKey]}
        alt=""
        aria-hidden
        className={`inline-block shrink-0 object-contain ${iconSize === 60 ? "size-[60px]" : "size-[50px]"}`}
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-[16px] font-bold leading-[23px] text-[#4d5257]">
          {title} · {code}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[12px] leading-[17px] text-[#797979]">{subtitle}</p>
        ) : null}
      </div>
      <span className="inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full border border-[#c6ccd2] bg-white px-[10px] text-[12px] font-medium leading-[17px] tracking-[0.3px] text-[#797979]">
        {badge}
      </span>
    </section>
  );
}

export function CompletedStatsRow({ stats }) {
  if (!stats?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.slice(0, 2).map((stat) => (
        <div key={stat.label} className={`${completedCardClass} px-[15px] py-[15px]`}>
          <p className="text-[14px] leading-5 text-[#797979]">{stat.label}</p>
          <p className="mt-0 text-[20px] font-bold leading-[29px] text-[#0091b2]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CompletedReviewCard({ review }) {
  if (!review) return null;
  if (review.empty) {
    return (
      <section className={`${completedCardClass} px-5 py-5`}>
        <h3 className="text-[16px] font-bold leading-[23px] text-[#4d5257]">客人評價</h3>
        <p className="mt-3 text-[14px] leading-5 text-[#797979]">尚未評價</p>
      </section>
    );
  }
  const stars = review.stars ?? 0;
  const quote = review.text ?? "";
  const hasQuote = Boolean(quote);
  const hasMeta = Boolean(review.author || review.date);
  if (!stars && !hasQuote && !review.tags?.length) return null;

  return (
    <section className={`${completedCardClass} px-5 py-5`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[16px] font-bold leading-[23px] text-[#4d5257]">客人評價</h3>
        {stars ? <ReviewStarRow count={stars} labelled /> : null}
      </div>
      {review.tags?.length ? (
        <div className="mt-[12px] flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-[#e5f6fb] px-3 py-[5px] text-[12px] leading-[17px] font-medium text-[#0091b2]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {hasQuote ? (
        <p className="mt-3 text-[14px] leading-5 text-[#4d5257]">
          {quote.startsWith("「") ? quote : `「${quote}」`}
        </p>
      ) : null}
      {hasMeta ? (
        <p className="mt-3 text-[12px] leading-[17px] text-[#797979]">
          {[review.author, review.date].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </section>
  );
}

const SAMPLE_REPORT_PHOTO = "/images/sample-image.jpg";
const reportThumbClass = "size-[100px] shrink-0 rounded-[6px]";

function reportEntryMedia(entry) {
  let media;
  if (entry.media?.length) {
    media = entry.media;
  } else {
    const count = Number(entry.photoCount);
    const photoCount = Number.isFinite(count) && count > 0 ? count : 1;
    media = Array.from({ length: photoCount }, () => ({ type: "photo" }));
  }
  return media.map((item) => ({
    ...item,
    src: item.src || SAMPLE_REPORT_PHOTO,
  }));
}

function ReportPhotoThumb({ item, sources, index, className, onOpen }) {
  const src = item.src || SAMPLE_REPORT_PHOTO;
  const list = sources.length ? sources : [src];
  return (
    <button
      type="button"
      aria-label={`查看相片 ${index + 1}`}
      onClick={() => onOpen(list, index)}
      className={`relative block overflow-hidden rounded-[6px] p-0 ${className}`}
    >
      <img src={src} alt="" className="size-full object-cover" />
    </button>
  );
}

function ReportPhotoSwiper({ media }) {
  const { open } = usePhotoBrowser();
  const sources = mediaItemSources(media);
  return (
    <div className="mt-2 overflow-hidden">
      <Swiper
        modules={[FreeMode]}
        className="!overflow-hidden"
        spaceBetween={8}
        slidesPerView="auto"
        freeMode={{ enabled: true, momentumRatio: 0.4 }}
      >
        {media.map((item, index) => (
          <SwiperSlide key={`${item.src ?? "ph"}-${index}`} className="!h-auto !w-[100px]">
            <ReportPhotoThumb item={item} sources={sources} index={index} onOpen={open} className={reportThumbClass} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function ReportCaption({ caption }) {
  if (!caption) return null;
  return (
    <p className="min-w-0 text-[14px] leading-5 text-[#4d5257]">
      {caption.startsWith("「") ? caption : `「${caption}」`}
    </p>
  );
}

function ReportEntry({ entry }) {
  const { open } = usePhotoBrowser();
  const sent = entry.sentAt ? `${entry.sentAt} 已發送` : null;
  const photos = reportEntryMedia(entry);
  const sources = mediaItemSources(photos);
  const multi = photos.length > 1;

  return (
    <div className="border-t border-[#c6ccd2] pt-[14px] pb-[15px]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-bold leading-5 text-[#4d5257]">{entry.dateLabel}</p>
        {sent ? <p className="shrink-0 text-[12px] leading-[17px] text-[#797979]">{sent}</p> : null}
      </div>
      {multi ? (
        <>
          <ReportPhotoSwiper media={photos} />
          {entry.caption ? <div className="mt-2"><ReportCaption caption={entry.caption} /></div> : null}
        </>
      ) : photos.length === 1 ? (
        <div className="mt-2 flex items-start gap-2.5">
          <ReportPhotoThumb
            item={photos[0]}
            sources={sources}
            index={0}
            onOpen={open}
            className={reportThumbClass}
          />
          <ReportCaption caption={entry.caption} />
        </div>
      ) : entry.caption ? (
        <div className="mt-2">
          <ReportCaption caption={entry.caption} />
        </div>
      ) : null}
    </div>
  );
}

export function CompletedReportsCard({ title, entries, previewCount = 2, footerLabel, expandable = true }) {
  const [open, setOpen] = useState(false);
  if (!title && !entries?.length) return null;
  const list = entries ?? [];
  const preview = expandable ? list.slice(0, previewCount) : list;
  const rest = expandable ? list.slice(previewCount) : [];

  return (
    <section className={`${completedCardClass} px-5`}>
      {title ? (
        <h3 className="pt-[18px] pb-1 text-[16px] font-bold leading-[23px] text-[#4d5257]">{title}</h3>
      ) : null}
      {preview.map((entry, index) => (
        <ReportEntry key={`${entry.dateLabel}-p-${index}`} entry={entry} />
      ))}
      {rest.length ? (
        <>
          <div className={`${detailGridMotion} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className={`min-h-0 overflow-hidden ${detailFadeMotion} ${open ? "opacity-100" : "opacity-0"}`}>
              {rest.map((entry, index) => (
                <ReportEntry key={`${entry.dateLabel}-r-${index}`} entry={entry} />
              ))}
            </div>
          </div>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-2 py-3 text-left"
          >
            <span className="text-[14px] leading-5 text-[#797979]">{footerLabel}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[14px] leading-5 text-[#0091b2]">
              {open ? "收起" : "展開"}
              <span
                aria-hidden
                className={`inline-block h-[11px] w-2.5 bg-[#0091b2] ${chevronMotion} ${open ? "rotate-180" : ""}`}
                style={{
                  WebkitMaskImage: `url(${iconSrc["chevron-down"]})`,
                  maskImage: `url(${iconSrc["chevron-down"]})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                }}
              />
            </span>
          </button>
        </>
      ) : null}
    </section>
  );
}

export function CompletedInfoCard({ rows }) {
  if (!rows?.length) return null;
  return (
    <section className={`${completedCardClass} px-5 py-5`}>
      {rows.map((row, index) => (
        <div key={row.label} className={index === 0 ? "" : "mt-3 border-t border-[#c6ccd2] pt-3"}>
          <div className="flex items-center gap-2">
            <img
              src={iconSrc[rowIcon[row.icon] ?? "order-add-ons"]}
              alt=""
              aria-hidden
              className="size-4 shrink-0 object-contain"
            />
            <p className="text-[14px] font-bold leading-5 text-[#4d5257]">{row.label}</p>
          </div>
          {row.amount ? (
            <p className="mt-1.5 pl-6 text-[14px] leading-[21px]">
              <span className="font-bold leading-[29px] text-[#0091b2]">{row.amount}</span>
              {row.note ? (
                <span className="text-[#797979]">{"\u3000·\u3000"}{row.note}</span>
              ) : null}
            </p>
          ) : (
            <p className="mt-1.5 pl-6 text-[14px] leading-5 text-[#797979]">{row.value}</p>
          )}
        </div>
      ))}
    </section>
  );
}

export function CompletedContactButton({ orderId, phoneNumber }) {
  return (
    <ContactGuestLink orderId={orderId} phoneNumber={phoneNumber} className={completedContactBtnClass} />
  );
}
