"use client";

import Link from "next/link";
import { MapPin, Building2, ArrowDown } from "lucide-react";
import { formatPickupPoint, formatDropPoint } from "@/lib/constants";

export default function OrderCard({ order, showAccept, onAccept, accepting }) {
  const tags = order.order_tags || [];

  return (
    <Link
      href={`/order/${order.id}`}
      className="block bg-card rounded-xl border border-border p-4 hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span>{formatPickupPoint(order.pickup_point)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span>
              {order.building} - {order.room}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowDown className="h-4 w-4 shrink-0" />
            <span>{formatDropPoint(order.drop_point)}</span>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t.id || t.tag}
                  className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0">
          {order.status === "pending" && (
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Pending
            </span>
          )}
          {order.status === "picked" && (
            <span className="inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
              Picked
            </span>
          )}
          {order.status === "completed" && (
            <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              Done
            </span>
          )}
        </div>
      </div>
      {showAccept && order.status === "pending" && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAccept?.(order.id);
          }}
          disabled={accepting}
          className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {accepting ? "Accepting..." : "Accept Request"}
        </button>
      )}
    </Link>
  );
}
