"use client";

import useSWR from "swr";
import {
  User,
  CreditCard,
  HandHelping,
  ClipboardList,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CURRENT_USER_ID } from "@/lib/constants";
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

export default function ProfilePage() {
  const { data: user, error, isLoading } = useSWR("profile-user", fetchUser);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <p className="text-destructive text-sm">
          {"Failed to load profile."}
        </p>
      </div>
    );
  }

  const noCredits = user.available_requests <= 0;

  return (
    <div className="pb-24">
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-xl font-bold text-foreground">{"Profile"}</h1>
      </header>

      <div className="px-5 space-y-4">
        {/* Avatar and name */}
        <div className="flex flex-col items-center gap-3 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {user.name}
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Phone className="h-3.5 w-3.5" />
              <span>{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 mx-auto mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {user.available_requests}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {"Credits"}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-success/10 mx-auto mb-2">
              <HandHelping className="h-5 w-5 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {user.helped_count}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {"Helped"}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary mx-auto mb-2">
              <ClipboardList className="h-5 w-5 text-secondary-foreground" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {user.requested_count}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {"Requested"}
            </p>
          </div>
        </div>

        {/* No credits warning */}
        {noCredits && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">
              {"You have no request credits left. Help others to unlock."}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
