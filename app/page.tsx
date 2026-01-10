import { redirect } from "next/navigation";
import { getClosestEvent } from "@/app/data/events";

export default function Home() {
  const closestEvent = getClosestEvent();
  redirect(`/${closestEvent.slug}`);
}
