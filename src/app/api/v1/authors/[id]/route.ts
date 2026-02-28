import { buildApiUrl } from "@/lib/api";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const response = await fetch(buildApiUrl(`/api/v1/authors/${id}`), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  const body = await response.text();
  const contentType = response.headers.get("content-type");

  return new Response(body || null, {
    status: response.status,
    statusText: response.statusText,
    headers: contentType ? { "Content-Type": contentType } : undefined,
  });
}
