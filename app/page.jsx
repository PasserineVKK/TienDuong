"use client";

import useSWR from "swr";
import Link from "next/link";
import { Package, HandHelping, ClipboardList, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CURRENT_USER_ID } from "@/lib/constants";
import BottomNav from "@/components/bottom-nav";
import OrderCard from "@/components/order-card";

async function fetchUser() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", CURRENT_USER_ID)
    .single();
  if (error) throw error;
  return data;
}

async function acceptOrder(orderId) {
  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      accepted_by: CURRENT_USER_ID,
      status: "accepted",
    })
    .eq("id", orderId);

  if (error) {
    console.error(error);
    return;
  }

  alert("Accepted successfully!");
} 

async function completeOrder(order) {
  const supabase = createClient();

  // 1️⃣ Update order status
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", order.id);

  if (orderError) {
    console.error(orderError);
    return;
  }

  // 2️⃣ Tăng credit cho người nhận
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", order.accepted_by)
    .single();

  if (userError) {
    console.error(userError);
    return;
  }

  await supabase
    .from("users")
    .update({
      available_requests: user.available_requests + 1,
      helped_count: user.helped_count + 1,
    })
    .eq("id", order.accepted_by);

  alert("Order completed & credit added!");
}

async function fetchRecentOrders() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_tags(*)")
    .or(`status.eq.pending,requester_id.eq.${CURRENT_USER_ID}`)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}
export default function HomePage() {
  const { data: user, error: userError, isLoading: userLoading } = useSWR(
    "home-user",
    fetchUser
  );
  const { data: orders, error: ordersError, isLoading: ordersLoading } = useSWR(
    "home-recent-orders",
    fetchRecentOrders
  );

  const loading = userLoading || ordersLoading;
  const error = userError || ordersError;

  if (loading) {
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
          {"Failed to load data. Please try again."}
        </p>
      </div>
    );
  }

  const noCredits = user.available_requests <= 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="bg-primary px-5 pt-12 pb-8 rounded-b-3xl">
        <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
          {"TIEN DUONG"}
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          {"Package delivery helper"}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-primary-foreground/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary-foreground">
              {user.available_requests}
            </p>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Credits</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary-foreground">
              {user.helped_count}
            </p>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Helped</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary-foreground">
              {user.requested_count}
            </p>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Requested</p>
          </div>
        </div>
      </header>

      <div className="px-5 mt-6 space-y-4">
        {/* No credits warning */}
        {noCredits && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">
              {"No request credits left. Help others to earn more."}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          {noCredits ? (
            <div className="flex flex-col items-center gap-2 bg-muted rounded-xl p-5 opacity-50 cursor-not-allowed">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground text-center">
                {"I Want to Request"}
              </span>
            </div>
          ) : (
            <Link
              href="/create"
              className="flex flex-col items-center gap-2 bg-primary rounded-xl p-5 hover:bg-primary/90"
            >
              <ClipboardList className="h-6 w-6 text-primary-foreground" />
              <span className="text-sm font-semibold text-primary-foreground text-center">
                {"I Want to Request"}
              </span>
            </Link>
          )}
          <Link
            href="/market"
            className="flex flex-col items-center gap-2 bg-success rounded-xl p-5 hover:bg-success/90"
          >
            <HandHelping className="h-6 w-6 text-success-foreground" />
            <span className="text-sm font-semibold text-success-foreground text-center">
              {"I Want to Help"}
            </span>
          </Link>
        </div>

        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">
              {"Recent Requests"}
            </h2>
            <Link
              href="/market"
              className="text-xs text-primary font-medium hover:underline"
            >
              {"View all"}
            </Link>
          </div>
          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {"No pending requests right now."}
              </p>
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
