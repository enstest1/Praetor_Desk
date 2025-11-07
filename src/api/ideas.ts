import { invoke } from "@tauri-apps/api/core";

export interface Idea {
  id: number;
  title: string;
  notes?: string;
  created_at: string;
}

export async function listIdeas(): Promise<Idea[]> {
  return invoke("list_ideas");
}

export async function createIdea(data: {
  title: string;
  notes?: string;
}): Promise<number> {
  return invoke("create_idea", { req: data });
}

export async function updateIdea(data: {
  id: number;
  title?: string;
  notes?: string;
}): Promise<void> {
  return invoke("update_idea", { req: data });
}

export async function deleteIdea(id: number): Promise<void> {
  return invoke("delete_idea", { id });
}


