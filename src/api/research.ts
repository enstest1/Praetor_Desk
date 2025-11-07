import { invoke } from "@tauri-apps/api/core";

export interface ResearchResult {
  source: string;
  content: string;
  metadata?: any;
}

export async function researchContext7Exa(data: {
  query: string;
  context7_url?: string;
  exa_url?: string;
}): Promise<ResearchResult[]> {
  return invoke("research_context7_exa", { req: data });
}


