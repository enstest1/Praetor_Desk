import { invoke } from "@tauri-apps/api/core";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: "active" | "paused" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  done: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export async function listProjects(): Promise<Project[]> {
  return invoke("list_projects");
}

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
}): Promise<number> {
  return invoke("create_project", { req: data });
}

export async function updateProject(data: {
  id: number;
  name?: string;
  description?: string;
  status?: string;
}): Promise<void> {
  return invoke("update_project", { req: data });
}

export async function deleteProject(id: number): Promise<void> {
  return invoke("delete_project", { id });
}

export async function listProjectTasks(projectId: number): Promise<ProjectTask[]> {
  return invoke("list_project_tasks", { project_id: projectId, projectId });
}

export async function createProjectTask(data: {
  project_id: number;
  title: string;
  order: number;
}): Promise<number> {
  return invoke("create_project_task", { req: data });
}

export async function updateProjectTask(data: {
  id: number;
  title?: string;
  done?: boolean;
  order?: number;
}): Promise<void> {
  return invoke("update_project_task", { req: data });
}

export async function deleteProjectTask(id: number): Promise<void> {
  return invoke("delete_project_task", { id });
}


