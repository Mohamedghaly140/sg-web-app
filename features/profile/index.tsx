import { currentUser } from "@clerk/nextjs/server";

import { ProfileNameForm } from "@/features/profile/components/profile-name-form";
import { ProfilePhoneForm } from "@/features/profile/components/profile-phone-form";
import { getProfile } from "@/features/profile/queries/get-profile";
import { formatDate } from "@/lib/format";

export default async function ProfileFeature() {
  const [profile, clerkUser] = await Promise.all([
    getProfile(),
    currentUser(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Account
        </h1>
        <p className="text-sm text-muted-foreground">
          View your profile and update your name or phone number.
        </p>
      </header>

      <section
        aria-labelledby="profile-summary-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="profile-summary-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Profile
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground">{profile.name}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground">{profile.email}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-foreground">{profile.phone ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="text-foreground">
              {formatDate(profile.createdAt)}
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="edit-profile-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="edit-profile-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Edit profile
        </h2>
        <div className="flex flex-col gap-6">
          <ProfileNameForm
            firstName={clerkUser?.firstName ?? ""}
            lastName={clerkUser?.lastName ?? ""}
          />
          <ProfilePhoneForm phone={profile.phone} />
        </div>
      </section>
    </div>
  );
}
