use tauri::State;
use sqlx::SqlitePool;
use chrono::Utc;
use serde::Deserialize;

use crate::models::{Project, ProjectTask, ProjectStatus};

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub description: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectRequest {
    pub id: i64,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectTaskRequest {
    pub project_id: i64,
    pub title: String,
    pub order: i64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectTaskRequest {
    pub id: i64,
    pub title: Option<String>,
    pub done: Option<bool>,
    pub order: Option<i64>,
}

#[tauri::command]
pub async fn list_projects(state: State<'_, crate::AppState>) -> Result<Vec<Project>, String> {
    let projects = sqlx::query_as::<_, Project>("SELECT * FROM projects ORDER BY created_at DESC")
        .fetch_all(&state.db)
        .await
        .map_err(|e| format!("Failed to fetch projects: {}", e))?;

    Ok(projects)
}

#[tauri::command]
pub async fn create_project(
    state: State<'_, crate::AppState>,
    req: CreateProjectRequest,
) -> Result<i64, String> {
    let now = Utc::now();
    let status = req
        .status
        .as_deref()
        .unwrap_or("active")
        .parse::<ProjectStatus>()
        .unwrap_or_else(|_| ProjectStatus::Active);

    sqlx::query(
        r#"
        INSERT INTO projects (name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        "#,
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(format!("{:?}", status).to_lowercase())
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to create project: {}", e))?;

    let id = sqlx::query_scalar::<_, i64>("SELECT last_insert_rowid()")
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to get project ID: {}", e))?;

    Ok(id)
}

#[tauri::command]
pub async fn update_project(
    state: State<'_, crate::AppState>,
    req: UpdateProjectRequest,
) -> Result<(), String> {
    let mut updates = Vec::new();
    if req.name.is_some() {
        updates.push("name = ?");
    }
    if req.description.is_some() {
        updates.push("description = ?");
    }
    if req.status.is_some() {
        updates.push("status = ?");
    }
    updates.push("updated_at = ?");

    let query = format!(
        "UPDATE projects SET {} WHERE id = ?",
        updates.join(", ")
    );

    let mut q = sqlx::query(&query);
    if let Some(name) = &req.name {
        q = q.bind(name);
    }
    if let Some(desc) = &req.description {
        q = q.bind(desc);
    }
    if let Some(status) = &req.status {
        q = q.bind(status.to_lowercase());
    }
    q = q.bind(Utc::now().to_rfc3339());
    q = q.bind(req.id);

    q.execute(&state.db)
        .await
        .map_err(|e| format!("Failed to update project: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_project(state: State<'_, crate::AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM projects WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete project: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn list_project_tasks(
    state: State<'_, crate::AppState>,
    project_id: i64,
) -> Result<Vec<ProjectTask>, String> {
    let tasks = sqlx::query_as::<_, ProjectTask>(
        "SELECT * FROM project_tasks WHERE project_id = ? ORDER BY \"order\" ASC",
    )
    .bind(project_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| format!("Failed to fetch project tasks: {}", e))?;

    Ok(tasks)
}

#[tauri::command]
pub async fn create_project_task(
    state: State<'_, crate::AppState>,
    req: CreateProjectTaskRequest,
) -> Result<i64, String> {
    let now = Utc::now();

    sqlx::query(
        r#"
        INSERT INTO project_tasks (project_id, title, done, "order", created_at, updated_at)
        VALUES (?, ?, 0, ?, ?, ?)
        "#,
    )
    .bind(req.project_id)
    .bind(&req.title)
    .bind(req.order)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to create project task: {}", e))?;

    let id = sqlx::query_scalar::<_, i64>("SELECT last_insert_rowid()")
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to get project task ID: {}", e))?;

    Ok(id)
}

#[tauri::command]
pub async fn update_project_task(
    state: State<'_, crate::AppState>,
    req: UpdateProjectTaskRequest,
) -> Result<(), String> {
    let mut updates = Vec::new();
    if req.title.is_some() {
        updates.push("title = ?");
    }
    if req.done.is_some() {
        updates.push("done = ?");
    }
    if req.order.is_some() {
        updates.push("\"order\" = ?");
    }
    updates.push("updated_at = ?");

    let query = format!(
        "UPDATE project_tasks SET {} WHERE id = ?",
        updates.join(", ")
    );

    let mut q = sqlx::query(&query);
    if let Some(title) = &req.title {
        q = q.bind(title);
    }
    if let Some(done) = &req.done {
        q = q.bind(if *done { 1 } else { 0 });
    }
    if let Some(order) = &req.order {
        q = q.bind(order);
    }
    q = q.bind(Utc::now().to_rfc3339());
    q = q.bind(req.id);

    q.execute(&state.db)
        .await
        .map_err(|e| format!("Failed to update project task: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_project_task(
    state: State<'_, crate::AppState>,
    id: i64,
) -> Result<(), String> {
    sqlx::query("DELETE FROM project_tasks WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete project task: {}", e))?;

    Ok(())
}

