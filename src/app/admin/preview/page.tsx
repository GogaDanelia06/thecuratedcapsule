import { redirect } from "next/navigation";
import { authorizedEditor } from "@/lib/supabase/server";
import { LivePreview } from "@/features/admin/live-preview";
import { SiteShell } from "@/components/site/site-shell";
export const dynamic = "force-dynamic";
export default async function Preview() {
  if (!(await authorizedEditor())) redirect("/admin/login");
  return (
    <SiteShell>
      <LivePreview />
    </SiteShell>
  );
}
