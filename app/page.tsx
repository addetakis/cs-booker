import HomePage from "./home-page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "components/auth";

const getPageProps = async () => {
  const encodedFilter = encodeURIComponent(
    `(date>="${new Date().toISOString().slice(0, 10)}")`,
  );

  const csmatch = await fetch(
    `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/collections/csmatch/records?page=1&perPage=50&filter=${encodedFilter}`,
    { next: { tags: ["homepage"] } },
  ).then((res) => res.json());

  const matchIds = csmatch?.items?.map((x: Record<string, string>) => x.id);
  const userPerMatchFilter = encodeURIComponent(
    `(match="${matchIds.join('" || match="')}")`,
  );

  const usersPerMatch = await fetch(
    `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/collections/user_match/records?page=1&perPage=50&filter=${userPerMatchFilter}&expand=user`,
    { next: { tags: ["homepage-match"] } },
  ).then((res) => res.json());

  return {
    matches: csmatch,
    userMatches: usersPerMatch,
  };
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/login");
  const pocketbaseData = await getPageProps();

  return (
    <HomePage
      userMatches={pocketbaseData.userMatches}
      matches={pocketbaseData.matches}
      user={session?.user}
    />
  );
}
