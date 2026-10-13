import { redirect } from "next/navigation";

export default function LegacyRedirectPage() {
  redirect("/todos/time-off");
}
