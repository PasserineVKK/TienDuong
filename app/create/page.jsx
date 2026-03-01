"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { AlertTriangle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  CURRENT_USER_ID,
  PICKUP_POINTS,
  BUILDINGS,
  DROP_POINTS,
  PACKAGE_TAGS,
} from "@/lib/constants";
import BottomNav from "@/components/bottom-nav";

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

export default function CreateRequestPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useSWR(
    "create-user",
    fetchUser
  );

  const [form, setForm] = useState({
    receiver_name: "",
    receiver_phone: "",
    pickup_point: "gate",
    building: "A1",
    room: "",
    drop_point: "ground",
    shipper_phone: "",
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (
      !form.receiver_name.trim() ||
      !form.receiver_phone.trim() ||
      !form.room.trim() ||
      !form.shipper_phone.trim()
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          requester_id: CURRENT_USER_ID,
          receiver_name: form.receiver_name.trim(),
          receiver_phone: form.receiver_phone.trim(),
          pickup_point: form.pickup_point,
          building: form.building,
          room: form.room.trim(),
          drop_point: form.drop_point,
          shipper_phone: form.shipper_phone.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert tags
      if (selectedTags.length > 0) {
        const tagRows = selectedTags.map((tag) => ({
          order_id: order.id,
          tag,
        }));
        const { error: tagError } = await supabase
          .from("order_tags")
          .insert(tagRows);
        if (tagError) throw tagError;
      }

      // Update user credits
      const { error: userError } = await supabase
        .from("users")
        .update({
          available_requests: user.available_requests - 1,
          requested_count: user.requested_count + 1,
        })
        .eq("id", CURRENT_USER_ID);
      if (userError) throw userError;

      router.push("/");
    } catch (err) {
      setFormError("Failed to create request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const noCredits = user && user.available_requests <= 0;

  return (
    <div className="pb-24">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-foreground">
          {"Create Request"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"Ask someone to pick up your package"}
        </p>
      </header>

      <div className="px-5">
        {noCredits && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">
              {"No request credits left. Help others to earn more."}
            </p>
          </div>
        )}

        {/* Priority note */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            {
              "Please prioritize helper convenience. Coming down to the ground floor is strongly recommended."
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Receiver Name */}
          <div>
            <label
              htmlFor="receiver_name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {"Receiver Name"}
            </label>
            <input
              id="receiver_name"
              type="text"
              value={form.receiver_name}
              onChange={(e) => handleChange("receiver_name", e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter receiver name"
            />
          </div>

          {/* Receiver Phone */}
          <div>
            <label
              htmlFor="receiver_phone"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {"Receiver Phone"}
            </label>
            <input
              id="receiver_phone"
              type="tel"
              value={form.receiver_phone}
              onChange={(e) => handleChange("receiver_phone", e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. 0901234567"
            />
          </div>

          {/* Pickup Point */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground mb-2">
              {"Pickup Point"}
            </legend>
            <div className="flex gap-2 flex-wrap">
              {PICKUP_POINTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleChange("pickup_point", p.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    form.pickup_point === p.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Building */}
          <div>
            <label
              htmlFor="building"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {"Building"}
            </label>
            <select
              id="building"
              value={form.building}
              onChange={(e) => handleChange("building", e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label
              htmlFor="room"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {"Room"}
            </label>
            <input
              id="room"
              type="text"
              value={form.room}
              onChange={(e) => handleChange("room", e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. 301"
            />
          </div>

          {/* Drop Preference */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground mb-2">
              {"Drop Preference"}
            </legend>
            <div className="flex gap-2">
              {DROP_POINTS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleChange("drop_point", d.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    form.drop_point === d.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Package Tags */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground mb-2">
              {"Package Size Tags"}
            </legend>
            <div className="flex gap-2 flex-wrap">
              {PACKAGE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Shipper Phone */}
          <div>
            <label
              htmlFor="shipper_phone"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {"Shipper Phone"}
            </label>
            <input
              id="shipper_phone"
              type="tel"
              value={form.shipper_phone}
              onChange={(e) => handleChange("shipper_phone", e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. 0909876543"
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive font-medium">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || noCredits}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Request"}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
