"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { repairJob } from "@/service/mock/repair";
import { wallet } from "@/service/mock/wallet";
import { formatVisitSchedule, parseAmountInput } from "@/lib/format";
import { bumpEndTime } from "@/components/repair/TimeScrollWheels";
import { useRepairQuote } from "./RepairQuoteProvider";
import { LowBalanceSheet } from "./quoteSheet/LowBalanceSheet";
import { QuoteDrawer } from "./quoteSheet/QuoteDrawer";
import { QuoteFormPanel } from "./quoteSheet/QuoteFormPanel";
import { QuoteSuccessPanel } from "./quoteSheet/QuoteSuccessPanel";

const initialForm = () => ({
  mode: "fixed",
  price: "0",
  low: "0",
  high: "0",
  when: "guest",
  visitDate: "",
  visitStart: "10:00",
  visitEnd: "12:00",
  note: "",
});

const initialSheet = () => ({
  lowBalanceOpen: false,
  sent: false,
  submittedQuote: null,
  error: "",
});

export function RepairQuoteBottomSheet() {
  const router = useRouter();
  const { open, closeQuote, demoLowBalance, setDemoLowBalance } = useRepairQuote();
  const [form, setForm] = useState(initialForm);
  const [sheet, setSheet] = useState(initialSheet);
  const formScrollRef = useRef(null);

  const job = repairJob;
  const balance = demoLowBalance ? 10 : wallet.balance;
  const { lowBalanceOpen, sent, submittedQuote, error } = sheet;

  const patchForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const patchSheet = (patch) => setSheet((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!open) {
      setDemoLowBalance(false);
      setSheet(initialSheet());
      return;
    }
    setForm(initialForm());
    setSheet(initialSheet());
  }, [open, setDemoLowBalance]);

  useEffect(() => {
    if (!error || !open) return;
    const el = formScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }));
  }, [error, open]);

  function submit() {
    const { mode, price, low, high, when, visitDate, visitStart, visitEnd, note } = form;
    const amount = mode === "fixed" ? parseAmountInput(price) : parseAmountInput(high);
    if (!Number.isFinite(amount) || amount <= 0) {
      patchSheet({ error: "請填一個大於 0 的報價。" });
      return;
    }
    if (mode === "range" && parseAmountInput(low) > parseAmountInput(high)) {
      patchSheet({ error: "價錢範圍的下限不能高過上限。" });
      return;
    }
    if (when === "other") {
      if (!/^\d{4}\/\d{2}\/\d{2}$/.test(visitDate)) {
        patchSheet({ error: "請選擇建議上門日期。" });
        return;
      }
      if (visitStart >= visitEnd) {
        patchSheet({ error: "結束時間須晚於開始時間。" });
        return;
      }
    }
    if (balance < job.quoteFee) {
      patchSheet({ error: "", lowBalanceOpen: true });
      return;
    }
    patchSheet({
      error: "",
      submittedQuote: {
        mode,
        fixedPrice: price,
        low,
        high,
        schedule:
          when === "guest" ? job.schedule : formatVisitSchedule(visitDate, visitStart, visitEnd),
        scheduleCaption: when === "guest" ? "跟客人指定時間" : "建議上門時間",
        note: note.trim(),
      },
      sent: true,
    });
  }

  function goFindTasks() {
    closeQuote();
    router.push("/find");
  }

  function handleQuoteOpenChange(isOpen) {
    if (isOpen || lowBalanceOpen) return;
    sent ? goFindTasks() : closeQuote();
  }

  return (
    <>
      <QuoteDrawer
        open={open}
        layer="quote"
        dismissible={!lowBalanceOpen}
        labelledBy={sent ? "repair-quote-submitted-title" : "repair-quote-title"}
        title={sent ? undefined : "提供報價"}
        closeLabel={sent ? "關閉並返回尋找任務" : "關閉"}
        onClose={sent ? goFindTasks : closeQuote}
        onOpenChange={handleQuoteOpenChange}
      >
        {sent ? (
          <QuoteSuccessPanel job={job} submittedQuote={submittedQuote} onDone={goFindTasks} />
        ) : (
          <QuoteFormPanel
            job={job}
            balance={balance}
            form={form}
            error={error}
            formScrollRef={formScrollRef}
            onPatch={patchForm}
            onVisitStartChange={(visitStart) =>
              patchForm({ visitStart, visitEnd: bumpEndTime(visitStart, form.visitEnd) })
            }
            onSubmit={submit}
          />
        )}
      </QuoteDrawer>

      <LowBalanceSheet
        open={open && lowBalanceOpen}
        quoteFee={job.quoteFee}
        balance={balance}
        onOpenChange={(isOpen) => !isOpen && patchSheet({ lowBalanceOpen: false })}
        onClose={() => patchSheet({ lowBalanceOpen: false })}
        onTopUp={() => {
          patchSheet({ lowBalanceOpen: false });
          closeQuote();
          router.push("/balance");
        }}
        onQuoteLater={() => {
          patchSheet({ lowBalanceOpen: false });
          closeQuote();
        }}
      />
    </>
  );
}
