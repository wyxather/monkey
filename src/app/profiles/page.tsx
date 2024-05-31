import "server-only";

import { getProfiles } from "@/actions/profiles/action";
import { ProfilesTable } from "@/components/client/profiles_table";

export default async function ProfilesPage() {
  const profiles = await getProfiles();
  return <ProfilesTable profiles={profiles} />;
}
