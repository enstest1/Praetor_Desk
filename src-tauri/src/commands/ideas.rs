use tauri::State;
use sqlx::SqlitePool;
use chrono::Utc;
use serde::Deserialize;

use crate::models::Idea;

#[derive(Debug, Deserialize)]
pub struct CreateIdeaRequest {
    pub title: String,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateIdeaRequest {
    pub id: i64,
    pub title: Option<String>,
    pub notes: Option<String>,
}

#[tauri::command]
pub async fn list_ideas(state: State<'_, crate::AppState>) -> Result<Vec<Idea>, String> {
    let ideas = sqlx::query_as::<_, Idea>("SELECT * FROM ideas ORDER BY created_at DESC")
        .fetch_all(&state.db)
        .await
        .map_err(|e| format!("Failed to fetch ideas: {}", e))?;

    Ok(ideas)
}

#[tauri::command]
pub async fn create_idea(
    state: State<'_, crate::AppState>,
    req: CreateIdeaRequest,
) -> Result<i64, String> {
    let now = Utc::now();

    sqlx::query(
        r#"
        INSERT INTO ideas (title, notes, created_at)
        VALUES (?, ?, ?)
        "#,
    )
    .bind(&req.title)
    .bind(&req.notes)
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to create idea: {}", e))?;

    let id = sqlx::query_scalar::<_, i64>("SELECT last_insert_rowid()")
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to get idea ID: {}", e))?;

    Ok(id)
}

#[tauri::command]
pub async fn update_idea(
    state: State<'_, crate::AppState>,
    req: UpdateIdeaRequest,
) -> Result<(), String> {
    let mut updates = Vec::new();
    if req.title.is_some() {
        updates.push("title = ?");
    }
    if req.notes.is_some() {
        updates.push("notes = ?");
    }

    if updates.is_empty() {
        return Ok(());
    }

    let query = format!("UPDATE ideas SET {} WHERE id = ?", updates.join(", "));

    let mut q = sqlx::query(&query);
    if let Some(title) = &req.title {
        q = q.bind(title);
    }
    if let Some(notes) = &req.notes {
        q = q.bind(notes);
    }
    q = q.bind(req.id);

    q.execute(&state.db)
        .await
        .map_err(|e| format!("Failed to update idea: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_idea(state: State<'_, crate::AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM ideas WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete idea: {}", e))?;

    Ok(())
}

