import { iconSrc } from "@/icons/sources";
import { Drawer } from "vaul";
import { drawerHandle, drawerLayers } from "./styles";

export function QuoteDrawer({
  open,
  onOpenChange,
  dismissible = true,
  layer = "quote",
  labelledBy,
  title,
  closeLabel = "關閉",
  onClose,
  headerRight,
  contentClassName,
  children,
}) {
  const { overlay, content } = drawerLayers[layer];

  return (
    <Drawer.Root
      open={open}
      dismissible={dismissible}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className={overlay} />
        <Drawer.Content
          className={contentClassName ?? content}
          aria-labelledby={labelledBy}
          onPointerDownOutside={(event) => {
            const target = event.target;
            if (target instanceof Element && target.closest("[data-lazy-calendar-popover]")) {
              event.preventDefault();
            }
          }}
          onFocusOutside={(event) => {
            const target = event.target;
            if (target instanceof Element && target.closest("[data-lazy-calendar-popover]")) {
              event.preventDefault();
            }
          }}
        >
          <Drawer.Handle className={drawerHandle} aria-hidden />
          {title || onClose || headerRight ? (
            <div
              className={
                title
                  ? " flex shrink-0 items-center justify-between gap-2 px-5 pt-1 pb-1"
                  : " flex shrink-0 justify-end px-5 pt-1"
              }
            >
              {title ? (
                <h2 id={labelledBy} className="text-[17px] font-bold text-[#4d5257]">
                  {title}
                </h2>
              ) : (
                <span id={labelledBy} className="sr-only">
                  {closeLabel}
                </span>
              )}
              {headerRight ??
                (onClose ? (
                  <button
                    type="button"
                    aria-label={closeLabel}
                    onClick={onClose}
                    className="inline-flex shrink-0 items-center justify-center text-muted"
                  >
                    <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-6" />
                  </button>
                ) : null)}
            </div>
          ) : null}
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
