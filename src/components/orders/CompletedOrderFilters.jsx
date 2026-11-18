"use client";

import { useMemo, useState } from "react";
import { FilterDropdown } from "@/components/orders/FilterDropdown";
import { DONE_SERVICE_FILTERS, formatDoneMonthLabel } from "@/service/orders/completedFilters";

export function CompletedOrderFilters({ month, monthOptions, serviceId, onMonthChange, onServiceChange }) {
  const [openFilter, setOpenFilter] = useState(null);

  const monthSelectOptions = useMemo(
    () => monthOptions.map((m) => ({ id: m, label: formatDoneMonthLabel(m) })),
    [monthOptions],
  );

  const serviceSelectOptions = useMemo(
    () => DONE_SERVICE_FILTERS.map((item) => ({ id: item.id, label: item.label })),
    [],
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <FilterDropdown
        ariaLabel="篩選月份"
        value={month ?? monthOptions[0]}
        options={monthSelectOptions}
        open={openFilter === "month"}
        onOpenChange={(open) => setOpenFilter(open ? "month" : null)}
        onChange={(id) => onMonthChange(Number(id))}
      />
      <FilterDropdown
        ariaLabel="篩選服務類型"
        value={serviceId}
        options={serviceSelectOptions}
        open={openFilter === "service"}
        onOpenChange={(open) => setOpenFilter(open ? "service" : null)}
        onChange={(id) => onServiceChange(String(id))}
      />
    </div>
  );
}
