import { invoke } from "@tauri-apps/api/core";

export interface HouseItem {
  id: number;
  title: string;
  notes?: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export async function listHouseItems(): Promise<HouseItem[]> {
  return invoke("list_house_items");
}

export async function createHouseItem(data: {
  title: string;
  notes?: string;
}): Promise<number> {
  return invoke("create_house_item", { req: data });
}

export async function updateHouseItem(data: {
  id: number;
  title?: string;
  notes?: string;
  done?: boolean;
}): Promise<void> {
  return invoke("update_house_item", { req: data });
}

export async function deleteHouseItem(id: number): Promise<void> {
  return invoke("delete_house_item", { id });
}


