
export const btnPrimary =
  "inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export const btnMuted =
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#c6ccd2] px-4 text-title font-medium text-white transition active:bg-[#b0b4b8]";

export const fieldInput =
  "h-11 w-full rounded-xl border border-line bg-white px-3 text-field font-normal text-foreground outline-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15";

const drawerBase =
  "fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[500px] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_32px_rgba(16,40,48,0.12)] outline-none";

export const drawerHandle = "mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-[#d8dde3]";

export const drawerLayers = {
  quote: {
    overlay: "fixed inset-0 z-50 bg-[#102028]/45",
    content: `${drawerBase} z-50 max-h-[min(92dvh,720px)]`,
  },
  lowBalance: {
    overlay: "fixed inset-0 z-[60] bg-[#102028]/35",
    content: `${drawerBase} z-[60] h-auto`,
  },
};
