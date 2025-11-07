import { invoke } from "@tauri-apps/api/core";

export interface Airdrop {
  id: number;
  name: string;
  url: string;
  chain?: string; // Manual chain input (e.g., "EVM", "Solana", "Base", etc.)
  airdrop_type_id?: number;
  notes?: string;
  active: boolean;
  wallet_address?: string; // Manual wallet address input
  created_at: string;
  updated_at: string;
}

export interface AirdropType {
  id: number;
  name: string;
  default_tasks: any;
  created_at: string;
  updated_at: string;
}

export interface AirdropDailyTask {
  id: number;
  airdrop_id: number;
  title: string;
  order: number;
  done_dates: string[];
  created_at: string;
  updated_at: string;
}

export async function listAirdrops(): Promise<Airdrop[]> {
  return invoke("list_airdrops");
}

export async function createAirdrop(data: {
  name: string;
  url: string;
  chain?: string;
  airdrop_type_id?: number;
  notes?: string;
  active?: boolean;
  wallet_address?: string;
}): Promise<number> {
  return invoke("create_airdrop", { req: { ...data, active: data.active ?? true } });
}

export async function updateAirdrop(data: {
  id: number;
  name?: string;
  url?: string;
  chain?: string;
  airdrop_type_id?: number;
  notes?: string;
  active?: boolean;
  wallet_address?: string;
}): Promise<void> {
  return invoke("update_airdrop", { req: data });
}

export async function deleteAirdrop(id: number): Promise<void> {
  return invoke("delete_airdrop", { id });
}

export async function listAirdropTypes(): Promise<AirdropType[]> {
  return invoke("list_airdrop_types");
}

export async function createAirdropType(data: {
  name: string;
  default_tasks: any;
}): Promise<number> {
  return invoke("create_airdrop_type", { req: data });
}

export async function listAirdropDailyTasks(airdropId: number): Promise<AirdropDailyTask[]> {
  return invoke("list_airdrop_daily_tasks", { airdropId });
}

export async function createAirdropDailyTask(data: {
  airdrop_id: number;
  title: string;
  order: number;
}): Promise<number> {
  return invoke("create_airdrop_daily_task", { req: data });
}

export async function markTaskDoneToday(taskId: number, airdropId: number): Promise<void> {
  return invoke("mark_task_done_today", { taskId, airdropId });
}


