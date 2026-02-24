import { getSessionUser } from "@/lib/auth";
import HeaderAuth from "./HeaderAuth";
import HeaderGuest from "./HeaderGuest";

export default async function Header() {
  const user = await getSessionUser();
  if (user) return <HeaderAuth user={user} />;
  return <HeaderGuest />;
}