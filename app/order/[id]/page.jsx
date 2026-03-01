"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Building2,
  ArrowDown,
  Phone,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  CURRENT_USER_ID,
  formatPickupPoint,
  formatDropPoint,
} from "@/lib/constants";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [completing, setCompleting] = useState(false);

  const { data: order, error, isLoading } = useSWR(
    params.id ? `order-${params.id}` : null,
    async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*, order_tags(*)")
        .eq("id", params.id)
        .single();
      if (fetchError) throw fetchError;
      return data;
    }
  );

  async function handleComplete() {
    setCompleting(true);
    try {
      const supabase = createClient();
      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);
      if (orderError) throw orderError;

      // Fetch current user to get latest counts
      const { data: currentUser, error: userFetchError } = await supabase
        .from("users")
        .select("helped_count, available_requests")
        .eq("id", CURRENT_USER_ID)
        .single();
      if (userFetchError) throw userFetchError;

      // Update user credits
      const { error: userError } = await supabase
        .from("users")
        .update({
          helped_count: currentUser.helped_count + 1,
          available_requests: currentUser.available_requests + 1,
        })
        .eq("id", CURRENT_USER_ID);
      if (userError) throw userError;

      router.push("/");
    } catch (err) {
      alert("Failed to complete delivery. Please try again.");
    } finally {
      setCompleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-4">
        <p className="text-destructive text-sm">{"Order not found."}</p>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">
          {"Go home"}
        </Link>
      </div>
    );
  }

  const tags = order.order_tags || [];
  const isPicker = order.picker_id === CURRENT_USER_ID;
  const isPicked = order.status === "picked";
  const isCompleted = order.status === "completed";

  return (
    <div className="pb-8">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary text-foreground hover:bg-secondary/80"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">
          {"Order Details"}
        </h1>
      </header>

      <div className="px-5 space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          {order.status === "pending" && (
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {"Pending"}
            </span>
          )}
          {isPicked && (
            <span className="inline-block rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
              {"Picked Up"}
            </span>
          )}
          {isCompleted && (
            <span className="inline-block rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
              {"Completed"}
            </span>
          )}
        </div>

        {/* Delivery info card */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            {"Delivery Information"}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{"Pickup Point"}</p>
                <p className="text-sm font-medium text-foreground">
                  {formatPickupPoint(order.pickup_point)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{"Building & Room"}</p>
                <p className="text-sm font-medium text-foreground">
                  {order.building} - {order.room}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
                <ArrowDown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {"Drop Preference"}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDropPoint(order.drop_point)}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t.id || t.tag}
                  className="inline-block rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground capitalize"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Receiver info card */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            {"Receiver"}
          </h2>
          <p className="text-sm text-foreground">{order.receiver_name}</p>
          {isPicked || isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${order.receiver_phone}`}
                  className="text-sm text-primary font-medium"
                >
                  {order.receiver_phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${order.shipper_phone}`}
                  className="text-sm text-primary font-medium"
                >
                  {order.shipper_phone}
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {"Phone numbers will be visible after the order is picked up."}
            </p>
          )}
        </div>

        {/* Action buttons for picker */}
        {isPicked && isPicker && (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              className="w-full rounded-xl bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground"
              disabled
            >
              {"Picked Up"}
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={completing}
              className="w-full rounded-xl bg-success py-3.5 text-sm font-semibold text-success-foreground hover:bg-success/90 disabled:opacity-50"
            >
              {completing ? "Completing..." : "Delivered Successfully"}
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 bg-success/10 rounded-xl p-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm font-medium text-success">
              {"This delivery has been completed."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
