import { apiFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

type Publisher = {
  id: number;
  name: string;
};

export default async function PublishersPage() {
  try {
    const publishers = await apiFetch<Publisher[]>("/api/v1/publishers");
    console.log("[PublishersPage] /api/v1/publishers", publishers);
  } catch (error) {
    console.error("[PublishersPage] Failed to fetch publishers", error);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Publishers</h1>
      <p className="mt-3 text-black/70">Manage and browse publishers from your library.</p>
    </section>
  );
}
