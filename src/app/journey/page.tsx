import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JourneyClient from "@/components/journey/JourneyClient";

export default async function JourneyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: snapshots }, { data: milestones }] = await Promise.all([
    supabase
      .from("snapshots")
      .select("*")
      .eq("user_id", user.id)
      .order("month", { ascending: true }),
    supabase
      .from("milestones")
      .select("*")
      .eq("user_id", user.id)
      .order("amount", { ascending: true }),
  ]);

  return (
    <JourneyClient
      snapshots={snapshots ?? []}
      milestones={milestones ?? []}
    />
  );
}
