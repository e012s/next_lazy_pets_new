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
  APPLY_HK_ID_UPLOAD_ICON,
  APPLY_LICENSE_UPLOAD_ICON,
  ApplyUploadPlaceholder,
} from "@/components/apply/applyUi";
import { DobDatePickerPopover } from "@/components/DobDatePickerPopover";
import { PhotoBrowseImage } from "@/components/PhotoBrowseImage";
import { useApplyForm } from "@/pages/apply/applyShared";
import { submitPetApplication, validatePetApplyForm } from "@/service/apply/applyApi";
import {
  emptyPetFormFromSession,
  petApplyCatalogFromSkills,
  petFormFromSession,
} from "@/service/apply/applyForm";

const boardingPickupOptions = ["可以提供", "唔提供"];

const PET_FORM = {
  serviceId: 2,
  buildCatalog: petApplyCatalogFromSkills,
  emptyCatalog: null,
  isCatalogReady: (catalog) => Boolean(catalog),
  formFromSession: petFormFromSession,
  emptyFormFromSession: emptyPetFormFromSession,
  validate: validatePetApplyForm,
  send: ({ session, form, catalog }) => submitPetApplication({ session, form, catalog }),
};

export default function ApplyExpertPet() {
  const {
    session,
    globalReady,
    ready,
    skillsError,
    catalog,
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
  } = useApplyForm(PET_FORM);
  const profilePhotoInputRef = useRef(null);
  const boardingLicenseInputRef = useRef(null);
  const dobFieldRef = useRef(null);

  if (!globalReady || !ready || !form || !catalog) {
    return (
      <InPageLoading
        label="載入寵物技能…"
        minHeight={false}
        className="min-h-[50vh] px-[15px] pt-6"
      />
    );
  }

  if (!catalog.visitServices.length) {
    return (
      <div className="px-[15px] pt-6 pb-10 text-[15px] leading-6 text-[#4d5257]">
        {skillsError || "暫無寵物技能資料，請稍後再試。"}
      </div>
    );
  }

  const {
    visitGroup,
    boardingGroup,
    sizeGroup,
    capGroup,
    visitServices,
    boardingService,
    boardingNeedsCert,
    petSizes,
    boardingCaps,
  } = catalog;

  const {
    name,
    phone,
    dob,
    company,
    region,
    services,
    sizes,
    boardingCap,
    boardingPickup,
    profilePreview,
    idFrontPreview,
    idBackPreview,
    boardingLicensePreview,
    boardingLicenseNo,
    boardingLicenseExpiry,
    certificates,
    agree,
    error,
    dobError,
    dobCalendarOpen,
  } = form;

  const idUploadedCount = (idFrontPreview ? 1 : 0) + (idBackPreview ? 1 : 0);
  const boardingSelected = services.includes(boardingService);

  function addCertificate() {
    setForm((prev) => ({
      ...prev,
      certificates: [...prev.certificates, { id: prev.nextCertId, name: "", photoPreview: "", uploadedAt: "" }],
      nextCertId: prev.nextCertId + 1,
    }));
  }
  function updateCertificate(id, patch) {
    setForm((prev) => ({
      ...prev,
      certificates: prev.certificates.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }
  function setCertificatePhoto(id, file) {
    const uploadedAt = formatToday();
    setForm((prev) => ({
      ...prev,
      certificates: prev.certificates.map((item) => {
        if (item.id !== id) return item;
        if (item.photoPreview) URL.revokeObjectURL(item.photoPreview);
        return {
          ...item,
          photoPreview: URL.createObjectURL(file),
          photoFile: file,
          uploadedAt,
        };
      }),
    }));
  }
  function removeCertificate(id) {
    setForm((prev) => {
      const cert = prev.certificates.find((item) => item.id === id);
      if (cert?.photoPreview) URL.revokeObjectURL(cert.photoPreview);
      return { ...prev, certificates: prev.certificates.filter((item) => item.id !== id) };
    });
  }

  return (
    <div className="bg-[#f9fafc] pb-10">
      <ApplyStepper steps={stepperSteps} />
      <form
        className="px-[15px] pt-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <h2 className="text-[20px] leading-7 font-bold text-[#4d5257]">填寫基本資料</h2>
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
              <span className="font-bold text-[#4d5257]">姓名</span>
              <span className="ml-1.5 font-normal text-[#797979]">中文全名</span>
            </span>
            <input
              className="h-12 w-full rounded-lg border border-[#c6ccd2] bg-white px-4 text-[14px] leading-5 font-normal outline-none placeholder:text-placeholder focus-visible:border-brand"
              value={name}
              onChange={(event) => patchForm({ name: event.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-2.5 block text-[14px] leading-5 font-bold text-[#4d5257]">電話號碼</span>
            <input
              className="h-12 w-full rounded-lg border border-[#c6ccd2] bg-white px-4 text-[14px] leading-5 font-normal outline-none placeholder:text-placeholder focus-visible:border-brand"
              inputMode="numeric"
              value={phone}
              readOnly={Boolean(session?.phone)}
              aria-readonly={Boolean(session?.phone)}
              onChange={(event) => patchForm({ phone: event.target.value })}
            />
          </label>
          <label className="block overflow-visible">
            <span className="mb-2.5 block text-[14px] leading-5 font-bold text-[#4d5257]">出生日期</span>
            <span ref={dobFieldRef} className={`relative block h-12${dobCalendarOpen ? " z-30" : ""}`}>
              <ApplyDobTextInput
                className={`relative z-0 h-12 w-full rounded-lg border border-[#c6ccd2] bg-white px-4 pr-12 text-[14px] leading-5 font-normal outline-none placeholder:text-placeholder focus-visible:border-brand${dobError ? " border-alert focus-visible:border-alert" : ""}`}
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
              <p id="dob-error" role="alert" className="mt-1.5 text-[13px] leading-5 text-[#d95959]">
                {dobError}
              </p>
            ) : null}
          </label>
          <label className="block">
            <span className="mb-2.5 block text-[14px] leading-5">
              <span className="font-bold text-[#4d5257]">公司名稱</span>
              <span className="ml-1.5 font-normal text-[#797979]">如有</span>
            </span>
            <input
              className="h-12 w-full rounded-lg border border-[#c6ccd2] bg-white px-4 text-[14px] leading-5 font-normal outline-none placeholder:text-placeholder focus-visible:border-brand"
              value={company}
              placeholder="例：大文工程有限公司"
              onChange={(event) => patchForm({ company: event.target.value })}
            />
          </label>
          <fieldset>
            <legend className="mb-3 text-[14px] leading-5 font-bold text-[#4d5257]">主要服務地區</legend>
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
          <h2 className="text-[18px] leading-[26px] font-bold text-[#4d5257]">
            服務範圍 <span className="text-[14px] font-normal text-[#797979]">(寵物服務專屬)</span>
          </h2>
          <p className="mt-2.5 text-[12px] leading-[17px] text-[#797979]">已選 {services.length} 項 · 稍後可更改</p>
          <div className="mt-4 space-y-5">
            <div>
              <h3 className="mb-2.5 text-[14px] leading-5 font-bold text-[#4d5257]">{visitGroup.title}</h3>
              <div className="flex flex-wrap gap-2.5">
                {visitServices.map((item) => (
                  <ApplyPill key={item} active={services.includes(item)} onClick={() => toggleList("services", item)}>
                    {item}
                  </ApplyPill>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2.5 text-[14px] leading-5 font-bold text-[#4d5257]">{boardingGroup.title}</h3>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  aria-pressed={boardingSelected}
                  onClick={() => toggleList("services", boardingService)}
                  className={`inline-flex h-10 max-w-full items-center gap-2 rounded-full py-0 pr-2 pl-[18px] text-[14px] leading-5 font-bold${boardingSelected ? " bg-[#0091b2] text-white" : " border border-[#b9b9b9] bg-white text-[#4d5257]"}`}
                >
                  <span className="shrink-0">{boardingService}</span>
                  {boardingNeedsCert ? (
                    <span className="shrink-0 rounded-full bg-[#fce8ec] px-2.5 py-0.5 text-[11px] leading-4 font-bold text-[#d95959]">
                      需要牌照
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
            <fieldset>
              <legend className="mb-3 text-[14px] leading-5 font-bold text-[#4d5257]">{sizeGroup.title}</legend>
              <div className="flex flex-wrap gap-2.5">
                {petSizes.map((item) => (
                  <ApplyPill key={item} active={sizes.includes(item)} onClick={() => toggleList("sizes", item)}>
                    {item}
                  </ApplyPill>
                ))}
              </div>
            </fieldset>
            {boardingSelected ? (
              <>
                <fieldset>
                  <legend className="mb-3 text-[14px] leading-5 font-bold text-[#4d5257]">
                    {capGroup.title} <span className="font-normal text-[#d95959]">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {boardingCaps.map((item) => (
                      <ApplyPill
                        key={item}
                        active={boardingCap === item}
                        onClick={() => patchForm({ boardingCap: item })}
                      >
                        {item}
                      </ApplyPill>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-[14px] leading-5 font-bold text-[#4d5257]">
                    可唔可以提供接送？（客人付 $150/程）
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {boardingPickupOptions.map((item) => (
                      <ApplyPill
                        key={item}
                        active={boardingPickup === item}
                        onClick={() => patchForm({ boardingPickup: item })}
                      >
                        {item}
                      </ApplyPill>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}
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

          {boardingSelected ? (
            <>
              <h3 className="mt-6 text-[14px] leading-5 font-bold">
                動物寄養所牌照 <span className="font-normal text-muted">(寄宿服務必須)</span>
              </h3>
              <p className="mt-2.5 flex gap-2 rounded-lg bg-brand-soft px-3.5 py-3 text-[13px] leading-[18px] text-brand">
                <ApplyGlyph src="/icons/info.svg" className="mt-0.5 size-[15px] shrink-0" />
                <span>漁護署規定寵物到師傅住所收費留宿須持牌。冇牌照仍可提供上門類服務。</span>
              </p>
              <div className="mt-3 rounded-lg border border-[#c6ccd2] bg-white p-4">
                <div className="relative h-[120px] overflow-hidden rounded-lg">
                  {boardingLicensePreview ? (
                    <>
                      <PhotoBrowseImage
                        src={boardingLicensePreview}
                        className="block h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label="移除牌照相片"
                        onClick={() => clearPreview("boardingLicensePreview")}
                        className="absolute top-2 right-2 flex items-center justify-center text-[#797979]"
                      >
                        <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-[22px]" />
                      </button>
                    </>
                  ) : (
                    <ApplyUploadPlaceholder
                      hint="上傳牌照相片"
                      className="h-full w-full gap-1.5"
                      iconSrc={APPLY_LICENSE_UPLOAD_ICON}
                      onClick={() => boardingLicenseInputRef.current?.click()}
                    />
                  )}
                </div>
                <input
                  ref={boardingLicenseInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setPreview("boardingLicensePreview", file);
                    event.target.value = "";
                  }}
                />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[12px] leading-[18px] text-muted">
                      牌照號碼 <span className="font-normal">(寄宿服務必須)</span>
                    </span>
                    <input
                      className="h-10 w-full rounded-lg border border-[#c6ccd2] bg-white px-3 text-[14px] leading-5 font-normal outline-none placeholder:text-placeholder focus-visible:border-brand"
                      value={boardingLicenseNo}
                      placeholder="例：AB-1234"
                      onChange={(event) => patchForm({ boardingLicenseNo: event.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12px] leading-[18px] text-muted">
                      到期日 <span className="font-normal">(寄宿服務必須)</span>
                    </span>
                    <span className="relative block h-10">
                      <ApplyDobTextInput
                        className="relative z-0 h-10 w-full rounded-lg border border-[#c6ccd2] bg-white px-3 text-[14px] leading-5 font-normal outline-none placeholder:text-placeholder focus-visible:border-brand"
                        value={boardingLicenseExpiry}
                        onChange={(value) => patchForm({ boardingLicenseExpiry: value })}
                        inputHeightClass="h-10"
                      />
                    </span>
                  </label>
                </div>
              </div>
            </>
          ) : null}

          <div className="mt-6">
            <h3 className="text-[14px] leading-5">
              <span className="font-bold">其他相關證書</span>
              <span className="ml-1.5 font-normal text-muted">可後補</span>
            </h3>
          </div>
          <div className="mt-3 space-y-3">
            {certificates.map((cert, index) => (
              <article key={cert.id} className="rounded-lg border border-[#c6ccd2] bg-white p-3.5">
                <div className="flex gap-3.5">
                  <CertPhoto
                    cert={cert}
                    onFile={(file) => setCertificatePhoto(cert.id, file)}
                    onRemovePhoto={() => {
                      setForm((prev) => ({
                        ...prev,
                        certificates: prev.certificates.map((item) => {
                          if (item.id !== cert.id) return item;
                          if (item.photoPreview) URL.revokeObjectURL(item.photoPreview);
                          return { ...item, photoPreview: "", uploadedAt: "" };
                        }),
                      }));
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] leading-4 font-bold text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={cert.name}
                          placeholder="證書名稱"
                          onChange={(event) => updateCertificate(cert.id, { name: event.target.value })}
                          className="w-full truncate border-0 bg-transparent p-0 text-[14px] leading-5 font-bold text-foreground outline-none placeholder:font-bold placeholder:text-placeholder"
                        />
                        {cert.uploadedAt ? (
                          <p className="mt-0.5 text-[12px] leading-[18px] text-muted">已上傳 · {cert.uploadedAt}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        aria-label="移除證書"
                        onClick={() => removeCertificate(cert.id)}
                        className="flex size-5 shrink-0 items-center justify-center"
                      >
                        <ApplyGlyph src="/icons/form-trash.svg" className="size-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={addCertificate}
            className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand bg-white text-[14px] leading-5 font-bold text-brand"
          >
            <ApplyGlyph src="/icons/plus.svg" className="size-3.5" />
            新增證書
          </button>
          <p className="mt-2 text-[12px] leading-[18px] text-muted">例：寵物急救證書、美容師證書</p>
        </section>

        <div className="my-8 h-px bg-[#c6ccd2]" />

        <div className="flex flex-wrap items-center gap-x-1 text-[14px] leading-5">
          <button
            type="button"
            aria-pressed={agree}
            onClick={() => setForm((prev) => ({ ...prev, agree: !prev.agree }))}
            className={`mr-1.5 flex size-5 items-center justify-center rounded-full${agree ? " bg-[#0091b2]" : " border border-[#b9b9b9] bg-white"}`}
            aria-label={agree ? "取消同意" : "同意條款"}
          >
            {agree ? <ApplyGlyph src="/icons/form-check-white.svg" className="size-3.5" /> : null}
          </button>
          <span className="text-[#797979]">我同意</span>
          <span className="text-[#0091b2]">服務條款</span>
          <span className="text-[#797979]">及</span>
          <span className="text-[#0091b2]">私隱政策</span>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-[13px] leading-5 text-[#d95959]">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-[#0091b2] text-[16px] font-bold text-white disabled:opacity-60"
        >
          {submitting ? "提交中…" : "提交申請"}
        </button>
        <p className="mt-4 text-center text-[12px] leading-[18px] text-[#797979]">提交後需審批，通常 1–2 個工作天</p>
      </form>
    </div>
  );
}

function formatToday() {
  const today = new Date();
  return `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
}

function CertPhoto({ cert, onFile, onRemovePhoto }) {
  const inputRef = useRef(null);
  const uploaded = Boolean(cert.uploadedAt);
  return (
    <div className="relative h-[70px] w-[92px] shrink-0">
      {cert.photoPreview ? (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#eef0f3]">
          <PhotoBrowseImage
            src={cert.photoPreview}
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          {uploaded ? null : (
            <button type="button" aria-label="移除證書相片" onClick={onRemovePhoto} className="absolute top-1.5 right-1.5 flex items-center justify-center text-[#797979]">
              <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-[22px]" />
            </button>
          )}
        </div>
      ) : uploaded ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#b9b9b9] bg-white"
          aria-hidden
        >
          <ApplyGlyph src={APPLY_HK_ID_UPLOAD_ICON} className="size-[27px]" />
        </div>
      ) : (
        <ApplyUploadPlaceholder
          square={false}
          className="h-full w-full"
          iconClassName="size-[27px]"
          ariaLabel="上載證書相片"
          onClick={() => inputRef.current?.click()}
        />
      )}
      {uploaded ? null : (
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
      )}
    </div>
  );
}
