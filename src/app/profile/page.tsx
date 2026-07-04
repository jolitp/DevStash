import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { auth } from "@/auth";
import { getProfileAccount, getProfileStats } from "@/lib/db/profile";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

// Reads the live session + DB; never prerender.
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/profile");

  const account = await getProfileAccount(session.user.id);
  // Session valid but the user row is gone (e.g. deleted elsewhere) — bounce out.
  if (!account) redirect("/sign-in?callbackUrl=/profile");

  const stats = await getProfileStats(account.id);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="space-y-8">
        {/* Account header */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={account.name}
              email={account.email}
              image={account.image}
              size={64}
            />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">
                {account.name ?? "Your profile"}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {account.email}
              </p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            Joined {dateFormatter.format(account.createdAt)}
          </p>
        </section>

        {/* Usage stats */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Usage</h2>
          <ProfileStats stats={stats} />
        </section>

        {/* Change password — email/password accounts only */}
        {account.hasPassword && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Change password</h2>
              <p className="text-sm text-muted-foreground">
                Update the password you use to sign in.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <ChangePasswordForm />
            </div>
          </section>
        )}

        {/* Danger zone */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-destructive">
              Danger zone
            </h2>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all of its data.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-card p-6">
            <div className="min-w-0">
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">
                This cannot be undone.
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        </section>
      </div>
    </div>
  );
}
