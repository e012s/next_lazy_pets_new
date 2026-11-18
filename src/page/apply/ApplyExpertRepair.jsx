"use client";
import { iconSrc } from "@/icons/sources";
import { useRef } from "react";
import { InPageLoading } from "@/components/Loading";
import {
  ApplyDobTextInput,
  ApplyGlyph,
  ApplyHkIdSection,
  ApplyPill,
  ApplyStepper,
  APPLY_LICENSE_UPLOAD_ICON,
  applyFieldClass,
  applyFieldErrorClass,
  ApplyUploadPlaceholder,
} from "@/components/apply/applyUi";
import { DobDatePickerPopover } from "@/components/DobDatePickerPopover";
import { PhotoBrowseImage } from "@/components/PhotoBrowseImage";
import { useApplyForm } from "@/pages/apply/applyShared";
import { submitRepairApplication, validateRepairApplyForm } from "@/service/apply/applyApi";
import {
  emptyRepairFormFromSession,
  repairFormFromSession,
  repairServiceGroupsFromSkills,
} from "@/service/apply/applyForm";

function serviceContent(item) {
  return typeof item === "string" ? item : item?.content ?? "";
}

const NO_SERVICE_GROUPS = [];

const REPAIR_FORM = {
  serviceId: 1,
  buildCatalog: repairServiceGroupsFromSkills,
  emptyCatalog: NO_SERVICE_GROUPS,
  isCatalogReady: (serviceGroups) => serviceGroups.length > 0,
  formFromSession: repairFormFromSession,
  emptyFormFromSession: emptyRepairFormFromSession,
  validate: validateRepairApplyForm,
  send: ({ session, form, catalog }) =>
    submitRepairApplication({ session, form, serviceGroups: catalog }),
};

export default function ApplyExpertRepair() {
  const {
    session,
    globalReady,
    ready,
    skillsError,
    catalog: serviceGroups,
    regionOptions,
    stepperSteps,
    form,
    setForm,
    patchForm,
    toggleList,
    setDobValue,
    setPreview,
    clearPreview,
    submitting,
    submit,
  } = useApplyForm(REPAIR_FORM);
  const nextProjectPhotoIdRef = useRef(1);
  const projectPhotoInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);
  const dobFieldRef = useRef(null);

  if (!globalReady || !ready || !form) {
    return (
      <InPageLoading
        label="載入維修技能…"
        minHeight={false}
        className="min-h-[50vh] px-[15px] pt-6"
      />
    );
  }

  if (serviceGroups.length === 0) {
    return (
      <div className="px-[15px] pt-6 pb-10 text-[15px] leading-6 text-[#4d5257]">
        {skillsError || "暫無維修技能資料，請稍後再試。"}
      </div>
    );
  }

  const {
    name,
    phone,
    dob,
    company,
    region,
    services,
    profilePreview,
    idFrontPreview,
    idBackPreview,
    licenses,
    projectPhotos,
    agree,
    error,
    dobError,
    dobCalendarOpen,
  } = form;

  const idUploadedCount = (idFrontPreview ? 1 : 0) + (idBackPreview ? 1 : 0);

  function updateLicense(id, patch) {
    setForm((prev) => ({
      ...prev,
      licenses: prev.licenses.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }
  function setLicensePhoto(id, file) {
    setForm((prev) => ({
      ...prev,
      licenses: prev.licenses.map((item) => {
        if (item.id !== id) return item;
        if (item.photoPreview) URL.revokeObjectURL(item.photoPreview);
        return {
          ...item,
          photoPreview: URL.createObjectURL(file),
          photoFile: file,
        };
      }),
    }));
  }
  function clearLicensePhoto(id) {
    setForm((prev) => ({
      ...prev,
      licenses: prev.licenses.map((item) => {
        if (item.id !== id) return item;
        if (item.photoPreview) URL.revokeObjectURL(item.photoPreview);
        return { ...item, photoPreview: "", photoFile: null };
      }),
    }));
  }
  function removeLicense(id) {
    setForm((prev) => {
      const license = prev.licenses.find((item) => item.id === id);
      if (license?.photoPreview) URL.revokeObjectURL(license.photoPreview);
      return { ...prev, licenses: prev.licenses.filter((item) => item.id !== id) };
    });
  }
  function addLicense() {
    setForm((prev) => ({
      ...prev,
      licenses: [...prev.licenses, { id: prev.nextLicenseId, name: "", years: "", photoPreview: "" }],
      nextLicenseId: prev.nextLicenseId + 1,
    }));
  }
  function addProjectPhotos(fileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setForm((prev) => {
      const room = 20 - prev.projectPhotos.length;
      if (room <= 0) return prev;
      const nextPhotos = [...prev.projectPhotos];
      for (const file of files.slice(0, room)) {
        nextPhotos.push({
          id: nextProjectPhotoIdRef.current,
          preview: URL.createObjectURL(file),
        });
        nextProjectPhotoIdRef.current += 1;
      }
      return { ...prev, projectPhotos: nextPhotos };
    });
  }
  function removeProjectPhoto(id) {
    setForm((prev) => {
      const photo = prev.projectPhotos.find((item) => item.id === id);
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      return { ...prev, projectPhotos: prev.projectPhotos.filter((item) => item.id !== id) };
    });
  }
  return (<div className="bg-[#f9fafc] pb-10">
    <ApplyStepper steps={stepperSteps} />
    <form className="px-[15px] pt-6" onSubmit={(event) => {
      event.preventDefault();
      submit();
    }}>
      <h2 className="text-[20px] leading-7 font-bold">填寫基本資料</h2>
      <div className="relative mx-auto mt-5 size-24">
        {profilePreview ? (
          <PhotoBrowseImage
            src={profilePreview}
            className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-[#c6ccd2] bg-white p-1"
            imgClassName="block size-full rounded-full object-cover object-center"
          />
        ) : (
          <button
            type="button"
            className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-[#c6ccd2] bg-white p-1"
            aria-label="上載個人相片"
            onClick={() => profilePhotoInputRef.current?.click()}
          >
            <span className="flex size-full items-center justify-center rounded-full bg-[#eef0f3]">
              <ApplyGlyph src="/icons/form-person.svg" className="size-12" />
            </span>
          </button>
        )}
        <button
          type="button"
          aria-label="上載個人相片"
          onClick={() => profilePhotoInputRef.current?.click()}
          className="absolute right-0 bottom-0 flex size-[30px] items-center justify-center rounded-full border-2 border-white bg-[#0091b2]"
        >
          <ApplyGlyph src="/icons/camera_white.svg" />
        </button>
      </div>
      <input
        ref={profilePhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setPreview("profilePreview", file);
          event.target.value = "";
        }}
      />

      <div className="mt-5 space-y-5">
        <label className="block">
          <span className="mb-2.5 block text-[14px] leading-5">
            <span className="font-bold">姓名</span>
            <span className="ml-1.5 text-[14px] leading-5 font-normal text-muted">中文全名</span>
          </span>
          <input className={applyFieldClass} value={name} onChange={(event) => patchForm({ name: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2.5 block text-[14px] leading-5 font-bold">電話號碼</span>
          <input
            className={applyFieldClass}
            inputMode="numeric"
            value={phone}
            readOnly={Boolean(session?.phone)}
            aria-readonly={Boolean(session?.phone)}
            onChange={(event) => patchForm({ phone: event.target.value })}
          />
        </label>
        <label className="block overflow-visible">
          <span className="mb-2.5 block text-[14px] leading-5 font-bold">出生日期</span>
          <span
            ref={dobFieldRef}
            className={`relative block h-12${dobCalendarOpen ? " z-30" : ""}`}
          >
            <ApplyDobTextInput
              className={`${applyFieldClass} relative z-0 pr-12${dobError ? ` ${applyFieldErrorClass}` : ""}`}
              value={dob}
              invalid={Boolean(dobError)}
              onChange={setDobValue}
            />
            <DobDatePickerPopover
              open={dobCalendarOpen}
              anchorRef={dobFieldRef}
              value={dob}
              onChange={(value) => patchForm({ dob: value, dobError: "" })}
              onClose={() => patchForm({ dobCalendarOpen: false })}
            />
            <button
              type="button"
              aria-label="選擇出生日期"
              aria-expanded={dobCalendarOpen}
              onClick={() => setForm((prev) => ({ ...prev, dobCalendarOpen: !prev.dobCalendarOpen }))}
              className="absolute top-0 right-0 z-10 flex h-12 w-14 items-center justify-center"
            >
              <ApplyGlyph src="/icons/order-detail/calendar.svg" className="size-[19px]" />
            </button>
          </span>
          {dobError ? (
            <p id="dob-error" role="alert" className="mt-1.5 text-[13px] leading-5 text-alert">
              {dobError}
            </p>
          ) : null}
        </label>
        <label className="block">
          <span className="mb-2.5 block text-[14px] leading-5">
            <span className="font-bold">公司名稱</span>
            <span className="ml-1.5 text-[14px] leading-5 font-normal text-muted">如有</span>
          </span>
          <input className={applyFieldClass} value={company} placeholder="例：大文工程有限公司" onChange={(event) => patchForm({ company: event.target.value })} />
        </label>
        <fieldset>
          <legend className="mb-3 text-[14px] leading-5 font-bold">主要服務地區</legend>
          <div className="flex flex-wrap gap-x-2.5 gap-y-5">
            {regionOptions.map((item) => (
              <ApplyPill
                key={item.code}
                className="min-w-[95px] px-3"
                active={region.includes(item.code)}
                onClick={() => toggleList("region", item.code)}
              >
                {item.name}
              </ApplyPill>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="my-8 h-px bg-[#c6ccd2]" />

      <section>
        <h2 className="text-[18px] leading-[26px] font-bold">
          服務範圍 <span className="text-[14px] leading-5 font-normal text-muted">(維修安裝服務專屬)</span>
        </h2>
        <p className="mt-2.5 text-[12px] leading-[17px] font-normal text-muted">已選 {services.length} 項 · 稍後可更改</p>
        <div className="mt-4 space-y-5">
          {serviceGroups.map((group) => (<div key={group.title}>
            <h3 className="mb-2.5 text-[14px] leading-5 font-bold">{group.title}</h3>
            <div className="flex flex-wrap gap-2.5">
              {group.items.map((item) => {
                const label = serviceContent(item);
                return (
                  <ApplyPill
                    key={label}
                    active={services.includes(label)}
                    onClick={() => toggleList("services", label)}
                  >
                    {label}
                  </ApplyPill>
                );
              })}
            </div>
          </div>))}
        </div>
      </section>

      <div className="my-8 h-px bg-[#c6ccd2]" />

      <section>
        <ApplyHkIdSection
          idFrontPreview={idFrontPreview}
          idBackPreview={idBackPreview}
          uploadedCount={idUploadedCount}
          onFrontFile={(file) => setPreview("idFrontPreview", file)}
          onBackFile={(file) => setPreview("idBackPreview", file)}
          onFrontRemove={() => clearPreview("idFrontPreview")}
          onBackRemove={() => clearPreview("idBackPreview")}
        />

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-[14px] leading-5">
            <span className="font-bold">相關牌照</span>
            <span className="ml-1.5 text-[14px] leading-5 font-normal text-muted">可後補</span>
          </h3>
          <span className="text-[12px] leading-[18px] font-normal text-muted">
            {licenses.length} / 3
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {licenses.map((license, index) => (<article key={license.id} className="rounded-lg border border-[#c6ccd2] bg-white p-3.5">
            <div className="flex gap-3.5">
              <LicensePhoto
                previewUrl={license.photoPreview}
                onFile={(file) => setLicensePhoto(license.id, file)}
                onRemove={() => clearLicensePhoto(license.id)}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0091b2] text-[11px] leading-4 font-bold text-white">
                    {index + 1}
                  </span>
                  <p className={`min-w-0 flex-1 truncate text-[14px] leading-5 font-bold ${license.name ? "" : " text-placeholder"}`}>
                    {license.name || "牌照名稱"}
                  </p>
                  <button
                    type="button"
                    aria-label="移除牌照"
                    onClick={() => removeLicense(license.id)}
                    className="flex size-5 shrink-0 items-center justify-center"
                  >
                    <ApplyGlyph src="/icons/form-trash.svg" className="size-[18px]" />
                  </button>
                </div>
                <label className="mt-2 block">
                  <span className="mb-1 block text-[12px] leading-[18px] font-normal text-muted">牌照名稱</span>
                  <input className="h-9 w-full rounded-md border border-[#c6ccd2] bg-white px-2.5 text-[13px] leading-5 font-normal outline-none placeholder:text-placeholder" value={license.name} placeholder="例：電業工程人員註冊證" onChange={(event) => updateLicense(license.id, { name: event.target.value })} />
                </label>
                <label className="mt-2 block">
                  <span className="mb-1 block text-[12px] leading-[18px] font-normal text-muted">入行年資</span>
                  <input className="h-9 w-full rounded-md border border-[#c6ccd2] bg-white px-2.5 text-[13px] leading-5 font-normal outline-none placeholder:text-placeholder" value={license.years} placeholder="例：8 年" onChange={(event) => updateLicense(license.id, { years: event.target.value })} />
                </label>
              </div>
            </div>
          </article>))}
        </div>
        {licenses.length < 3 ? (<button type="button" onClick={addLicense} className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand bg-white text-[14px] leading-5 font-bold text-brand">
          <ApplyGlyph src="/icons/plus.svg" className="size-3.5" />
          新增牌照
        </button>) : null}
      </section>

      <div className="my-8 h-px bg-[#c6ccd2]" />

      <section className="text-muted">
        <h2 className="text-[20px] leading-7 font-bold text-foreground">
          過往工程相片 <span className="text-[14px] leading-5 font-normal">(可後補)</span>
        </h2>
        <p className="mt-2 text-[13px] leading-5">建議上傳完工相片或施工前後對比，客人揀師傅時會見到</p>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {projectPhotos.map((photo, photoIndex) => (
            <div key={photo.id} className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#eef0f3]">
              <PhotoBrowseImage
                sources={projectPhotos.map((item) => item.preview)}
                index={photoIndex}
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label="移除相片"
                onClick={() => removeProjectPhoto(photo.id)}
                className="absolute top-1.5 right-1.5 flex items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
              >
                <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-4" />
              </button>
            </div>
          ))}
          {projectPhotos.length < 20 ? (
            <ApplyUploadPlaceholder
              hint="新增"
              className="aspect-square w-full gap-1.5"
              ariaLabel="新增工程相片"
              onClick={() => projectPhotoInputRef.current?.click()}
            />
          ) : null}
        </div>
        <input
          ref={projectPhotoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addProjectPhotos(event.target.files);
            event.target.value = "";
          }}
        />
        <p className="mt-2 text-right text-[12px] leading-[18px]">
          {projectPhotos.length} / 20
        </p>
      </section>

      <div className="my-8 h-px bg-[#c6ccd2]" />

      <div className="flex flex-wrap items-center gap-x-1 text-[14px] leading-5">
        <button type="button" aria-pressed={agree} onClick={() => setForm((prev) => ({ ...prev, agree: !prev.agree }))} className={`mr-1.5 flex size-5 items-center justify-center rounded-full ${agree ? " bg-[#0091b2]" : " border border-[#b9b9b9] bg-white"}`} aria-label={agree ? "取消同意" : "同意條款"}>
          {agree ? <ApplyGlyph src="/icons/form-check-white.svg" className="size-3.5" /> : null}
        </button>
        <span className="font-normal text-muted">我同意</span>
        <span className="font-normal text-brand">服務條款</span>
        <span className="font-normal text-muted">及</span>
        <span className="font-normal text-brand">私隱政策</span>
      </div>
      {error ? (<p role="alert" className="mt-3 text-[13px] leading-5 font-normal text-alert">
        {error}
      </p>) : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-[#0091b2] text-[16px] leading-6 font-bold text-white disabled:opacity-60"
      >
        {submitting ? "提交中…" : "提交申請"}
      </button>
      <p className="mt-4 text-center text-[12px] leading-[18px] font-normal text-muted">提交後需審批，通常 1–2 個工作天</p>
    </form>
  </div>);
}
function LicensePhoto({ previewUrl, onFile, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div className="relative h-[70px] w-[92px] shrink-0">
      {previewUrl ? (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#eef0f3]">
          <PhotoBrowseImage
            src={previewUrl}
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <button
            type="button"
            aria-label="移除牌照相片"
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 flex items-center justify-center text-[#797979]"
          >
            <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-[22px]" />
          </button>
        </div>
      ) : (
        <ApplyUploadPlaceholder
          square={false}
          className="h-full w-full"
          iconClassName="size-[27px]"
          iconSrc={APPLY_LICENSE_UPLOAD_ICON}
          ariaLabel="上載牌照相片"
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
  );
}
