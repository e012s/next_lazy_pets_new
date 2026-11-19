"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { InfiniteScrollSentinel } from "@/components/InfiniteScrollSentinel";
import { usePathname } from "next/navigation";
import { BalanceBar } from "@/components/BalanceBar";
import { RepairJobCard } from "@/components/RepairJobCard";
import { ServiceChips } from "@/components/ServiceChips";
import { ServiceGatePrompt } from "@/components/ServiceGatePrompt";
import { ShellNotice } from "@/components/ShellNotice";
import { TaskCard } from "@/components/TaskCard";
import { RegisteredData } from "@/components/RegisteredData";
import { retrieve_third_party_new_orders } from "@/actions/Authenticate";
import {
  mapPetOrderGroupToTask,
  mapRepairOrderGroupToJob,
} from "@/service/orders/mapOrderGroup";

const petNotice = "寵物任務為固定價，接單不扣儲值金，先到先得";

const emptyPool = () => ({
  items: [],
  serviceOpen: true,
  message: "",
  page: 1,
  lastPage: 1,
  loading: false,
  error: "",
});

/**
 * @param {{ status?: boolean; message?: string; data?: object }} res
 * @param {(group: object) => object} mapItem
 */
function nextPoolFromResponse(res, mapItem, append, prev) {
  if (res?.status !== true) {
    return {
      ...prev,
      loading: false,
      error: res?.message ?? "載入失敗",
    };
  }
  const data = res.data ?? {};
  const groups = Array.isArray(data.order_groups) ? data.order_groups : [];
  const mapped = groups.map(mapItem);
  const pagination = data.pagination ?? {};
  const serviceOpen = data.service !== false;
  const message = serviceOpen ? "" : String(res.message ?? "您尚未開啟此服務");

  return {
    items: append ? [...prev.items, ...mapped] : mapped,
    serviceOpen,
    message,
    page: Number(pagination.current_page ?? prev.page) || 1,
    lastPage: Number(pagination.last_page ?? 1) || 1,
    loading: false,
    error: "",
  };
}

export default function FindTasks({ initialTab = "all" }) {
  const pathname = usePathname();
  const [tab, setTab] = useState(initialTab);
  const [repairPool, setRepairPool] = useState(emptyPool);
  const [petPool, setPetPool] = useState(emptyPool);
  const repairFetchLock = useRef(false);
  const petFetchLock = useRef(false);

  useLayoutEffect(() => {
    setTab(initialTab);
  }, [pathname, initialTab]);

  const showRepair = tab === "all" || tab === "repair";
  const showPet = tab === "all" || tab === "pet";

  const loadRepair = useCallback(async (page, { append = false } = {}) => {
    if (repairFetchLock.current) return;
    repairFetchLock.current = true;
    setRepairPool((prev) => ({ ...prev, loading: true, error: append ? prev.error : "" }));
    try {
      const res = await retrieve_third_party_new_orders({ service: 1, page });
      setRepairPool((prev) =>
        nextPoolFromResponse(res, mapRepairOrderGroupToJob, append, { ...prev, page }),
      );
    } finally {
      repairFetchLock.current = false;
    }
  }, []);

  const loadPet = useCallback(async (page, { append = false } = {}) => {
    if (petFetchLock.current) return;
    petFetchLock.current = true;
    setPetPool((prev) => ({ ...prev, loading: true, error: append ? prev.error : "" }));
    try {
      const res = await retrieve_third_party_new_orders({ service: 2, page });
      setPetPool((prev) =>
        nextPoolFromResponse(res, mapPetOrderGroupToTask, append, { ...prev, page }),
      );
    } finally {
      petFetchLock.current = false;
    }
  }, []);

  const loadMoreRepair = useCallback(() => {
    if (
      repairFetchLock.current ||
      repairPool.loading ||
      !repairPool.serviceOpen ||
      repairPool.page >= repairPool.lastPage
    ) {
      return;
    }
    loadRepair(repairPool.page + 1, { append: true });
  }, [loadRepair, repairPool]);

  const loadMorePet = useCallback(() => {
    if (
      petFetchLock.current ||
      petPool.loading ||
      !petPool.serviceOpen ||
      petPool.page >= petPool.lastPage
    ) {
      return;
    }
    loadPet(petPool.page + 1, { append: true });
  }, [loadPet, petPool]);

  useEffect(() => {
    setRepairPool(emptyPool());
    setPetPool(emptyPool());

    if (showRepair) loadRepair(1);
    if (showPet) loadPet(1);
  }, [tab, showRepair, showPet, loadRepair, loadPet]);

  const repairHasMore =
    repairPool.serviceOpen && repairPool.page < repairPool.lastPage;
  const petHasMore = petPool.serviceOpen && petPool.page < petPool.lastPage;

  return (
    <div>
      <section className="bg-brand-soft p-5">
        <BalanceBar showTopUp={tab !== "pet"} />
        <ServiceChips current={tab} onSelect={setTab} />
      </section>
      <div className="space-y-4 px-4 pb-6 pt-4">
        <RegisteredData afterRegistered="即可查看任務。">
          {showRepair ? (
            <>
              {tab === "all" ? <h2 className="px-1 text-title font-medium">維修</h2> : null}
              {repairPool.error ? (
                <p className="rounded-2xl bg-white px-4 py-6 text-center text-body text-[#c0392b]">
                  {repairPool.error}
                </p>
              ) : null}
              {!repairPool.serviceOpen ? (
                <ServiceGatePrompt
                  message={repairPool.message || "您尚未開啟此服務"}
                  applyHref="/apply/repair"
                />
              ) : repairPool.items.length === 0 && !repairPool.loading ? (
                <p className="rounded-2xl bg-white px-4 py-10 text-center text-body font-normal text-muted">
                  暫時沒有維修任務
                </p>
              ) : (
                repairPool.items.map((job) => (
                  <RepairJobCard key={job.id || job.orderGroupId} job={job} />
                ))
              )}
              <InfiniteScrollSentinel
                enabled={
                  repairHasMore &&
                  repairPool.items.length > 0 &&
                  !repairPool.error
                }
                loading={repairPool.loading && repairPool.items.length > 0}
                onLoadMore={loadMoreRepair}
              />
            </>
          ) : null}
          {showPet ? (
            <>
              {tab === "pet" ? <ShellNotice>{petNotice}</ShellNotice> : null}
              {tab === "all" ? <h2 className="px-1 text-title font-medium">寵物</h2> : null}
              {tab === "all" ? <ShellNotice>{petNotice}</ShellNotice> : null}
              {petPool.error ? (
                <p className="rounded-2xl bg-white px-4 py-6 text-center text-body text-[#c0392b]">
                  {petPool.error}
                </p>
              ) : null}
              {!petPool.serviceOpen ? (
                <ServiceGatePrompt
                  message={petPool.message || "您尚未開啟此服務"}
                  applyHref="/apply/pet"
                />
              ) : petPool.items.length === 0 && !petPool.loading ? (
                <p className="rounded-2xl bg-white px-4 py-10 text-center text-body font-normal text-muted">
                  暫時沒有寵物任務
                </p>
              ) : (
                petPool.items.map((task) => (
                  <TaskCard key={task.id || task.orderGroupId} task={task} />
                ))
              )}
              <InfiniteScrollSentinel
                enabled={
                  petHasMore && petPool.items.length > 0 && !petPool.error
                }
                loading={petPool.loading && petPool.items.length > 0}
                onLoadMore={loadMorePet}
              />
            </>
          ) : null}
          {(showRepair && repairPool.loading && repairPool.items.length === 0) ||
          (showPet && petPool.loading && petPool.items.length === 0) ? (
            <p className="py-10 text-center text-body text-muted">載入中…</p>
          ) : null}
        </RegisteredData>
      </div>
    </div>
  );
}