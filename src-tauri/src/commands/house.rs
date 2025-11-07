use tauri::State;
use sqlx::SqlitePool;
use chrono::Utc;
use serde::Deserialize;

use crate::models::HouseItem;

#[derive(Debug, Deserialize)]
pub struct CreateHouseItemRequest {
    pub title: String,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateHouseItemRequest {
    pub id: i64,
    pub title: Option<String>,
    pub notes: Option<String>,
    pub done: Option<bool>,
}

#[tauri::command]
pub async fn list_house_items(
    state: State<'_, crate::AppState>,
) -> Result<Vec<HouseItem>, String> {
    let items = sqlx::query_as::<_, HouseItem>(
        "SELECT * FROM house_items ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| format!("Failed to fetch house items: {}", e))?;

    Ok(items)
}

#[tauri::command]
pub async fn create_house_item(
    state: State<'_, crate::AppState>,
    req: CreateHouseItemRequest,
) -> Result<i64, String> {
    let now = Utc::now();

    sqlx::query(
        r#"
        INSERT INTO house_items (title, notes, done, created_at, updated_at)
        VALUES (?, ?, 0, ?, ?)
        "#,
    )
    .bind(&req.title)
    .bind(&req.notes)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to create house item: {}", e))?;

    let id = sqlx::query_scalar::<_, i64>("SELECT last_insert_rowid()")
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to get house item ID: {}", e))?;

    Ok(id)
}

#[tauri::command]
pub async fn update_house_item(
    state: State<'_, crate::AppState>,
    req: UpdateHouseItemRequest,
) -> Result<(), String> {
    let mut updates = Vec::new();
    if req.title.is_some() {
        updates.push("title = ?");
    }
    if req.notes.is_some() {
        updates.push("notes = ?");
    }
    if req.done.is_some() {
        updates.push("done = ?");
    }
    updates.push("updated_at = ?");

    let query = format!(
        "UPDATE house_items SET {} WHERE id = ?",
        updates.join(", ")
    );

    let mut q = sqlx::query(&query);
    if let Some(title) = &req.title {
        q = q.bind(title);
    }
    if let Some(notes) = &req.notes {
        q = q.bind(notes);
    }
    if let Some(done) = &req.done {
        q = q.bind(if *done { 1 } else { 0 });
    }
    q = q.bind(Utc::now().to_rfc3339());
    q = q.bind(req.id);

    q.execute(&state.db)
        .await
        .map_err(|e| format!("Failed to update house item: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_house_item(
    state: State<'_, crate::AppState>,
    id: i64,
) -> Result<(), String> {
    sqlx::query("DELETE FROM house_items WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete house item: {}", e))?;

    Ok(())
}

