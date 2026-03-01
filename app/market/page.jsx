"use client";

import { useState } from "react";
import useSWR from "swr";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CURRENT_USER_ID, PICKUP_POINTS } from "@/lib/constants";
import BottomNav from "@/components/bottom-nav";
import OrderCard from "@/components/order-card";

const FILTERS = [{ value: "all", label: "All" }, ...PICKUP_POINTS];

async function fetchPendingOrders() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_tags(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function MarketplacePage() {
  const [filter, setFilter] = useState("all");
  const [acceptingId, setAcceptingId] = useState(null);

  const { data: orders, error, isLoading, mutate } = useSWR(
    "market-orders",
    fetchPendingOrders
  );

  async function handleAccept(orderId) {
    setAcceptingId(orderId);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "picked", picker_id: CURRENT_USER_ID })
        .eq("id", orderId);
      if (updateError) throw updateError;
      await mutate();
    } catch (err) {
      alert("Failed to accept request. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  }

  const filtered =
    orders && filter !== "all"
      ? orders.filter((o) => o.pickup_point === filter)
      : orders;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <p className="text-destructive text-sm">
          {"Failed to load orders. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-foreground">{"Marketplace"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"Help someone pick up their package"}
        </p>
      </header>

      {/* Filter bar */}
      <div className="px-5 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="px-5 space-y-3">
        {filtered && filtered.length > 0 ? (
          filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showAccept
              onAccept={handleAccept}
              accepting={acceptingId === order.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {"No pending requests in this area."}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
