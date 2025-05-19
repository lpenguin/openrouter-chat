// Fetches available models from OpenRouter public API
export async function fetchOpenRouterModels(): Promise<Array<{ id: string; name: string }>> {
  // OpenRouter public models endpoint
  const res = await fetch('https://openrouter.ai/api/v1/models');
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  console.log('Raw models API response:', data);
  // Map to id/name for dropdown
  return (data.models || data.data || []).map((m: any) => ({ id: m.id, name: m.name || m.id }));
}
