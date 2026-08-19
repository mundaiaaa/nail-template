"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import Image from "next/image";
import {
  createStickerAction,
  deleteStickerAction,
  updateStickerPositionAction,
  type AppearanceActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SHOP_PAGES } from "@/lib/validation/appearance";
import type { PageDecoration } from "@/generated/prisma/client";

const initialState: AppearanceActionState = {};

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function StickerItem({
  sticker,
  containerSize,
}: {
  sticker: PageDecoration;
  containerSize: { width: number; height: number };
}) {
  // Uncontrolled: Rnd owns its own position/size after mount, seeded from the
  // stored percentages. Remounting (via `key`, below) is how we resync when
  // the container is resized or the server value changes, instead of an
  // effect that would call setState on every containerSize change.
  const initialBox: Box = {
    x: (sticker.xPct / 100) * containerSize.width,
    y: (sticker.yPct / 100) * containerSize.height,
    width: (sticker.widthPct / 100) * containerSize.width,
    height: (sticker.heightPct / 100) * containerSize.height,
  };

  function persist(newBox: Box) {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    updateStickerPositionAction(sticker.id, {
      xPct: (newBox.x / containerSize.width) * 100,
      yPct: (newBox.y / containerSize.height) * 100,
      widthPct: (newBox.width / containerSize.width) * 100,
      heightPct: (newBox.height / containerSize.height) * 100,
    });
  }

  return (
    <Rnd
      key={`${Math.round(containerSize.width)}x${Math.round(containerSize.height)}`}
      bounds="parent"
      default={initialBox}
      onDragStop={(_e, d) => persist({ ...initialBox, x: d.x, y: d.y })}
      onResizeStop={(_e, _dir, ref, _delta, position) =>
        persist({
          width: parseFloat(ref.style.width),
          height: parseFloat(ref.style.height),
          ...position,
        })
      }
      className="group border border-dashed border-transparent hover:border-[var(--brand,theme(colors.foreground))]"
    >
      <div className="relative h-full w-full">
        <Image src={sticker.imageKey} alt="" fill sizes="200px" className="pointer-events-none object-contain" />
        <form action={deleteStickerAction} className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100">
          <input type="hidden" name="stickerId" value={sticker.id} />
          <button
            type="submit"
            className="flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
          >
            ×
          </button>
        </form>
      </div>
    </Rnd>
  );
}

export function StickerEditor({ stickers }: { stickers: PageDecoration[] }) {
  const [page, setPage] = useState<string>(SHOP_PAGES[0].value);
  const [uploadState, uploadAction, uploadPending] = useActionState(createStickerAction, initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageStickers = stickers.filter((s) => s.page === page);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="sticker-page">選擇頁面</Label>
        <Select value={page} onValueChange={(v) => v && setPage(v)}>
          <SelectTrigger id="sticker-page" className="w-full max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHOP_PAGES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-lg border bg-muted"
      >
        {containerSize.width > 0 &&
          pageStickers.map((sticker) => (
            <StickerItem key={sticker.id} sticker={sticker} containerSize={containerSize} />
          ))}
        {pageStickers.length === 0 && (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            此頁面尚無貼圖，上傳圖片後可拖曳調整位置與大小
          </p>
        )}
      </div>

      <form action={uploadAction} className="flex max-w-md flex-col gap-3">
        <input type="hidden" name="page" value={page} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="sticker-image">上傳新貼圖</Label>
          <Input id="sticker-image" name="image" type="file" accept="image/*" />
        </div>
        {uploadState?.error && <p className="text-sm text-destructive">{uploadState.error}</p>}
        <Button type="submit" disabled={uploadPending} className="w-fit">
          {uploadPending ? "上傳中…" : "新增貼圖"}
        </Button>
      </form>
    </div>
  );
}
