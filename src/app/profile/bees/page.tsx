import type { Metadata } from "next";
import { BeesDashboard } from "@/components/profile/bees-dashboard";

export const metadata: Metadata = {
  title: "I miei BEES | ApeHour",
};

export default function ProfileBeesPage() {
  return <BeesDashboard />;
}
