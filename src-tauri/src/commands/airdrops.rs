use log::info;
use tauri::State;
use sqlx::SqlitePool;
use chrono::Utc;
use serde::{Deserialize, Serialize};

use crate::models::{Airdrop, AirdropType, AirdropDailyTask};

#[derive(Debug, Deserialize)]
pub struct CreateAirdropRequest {
    pub name: String,
    pub url: String,
    pub airdrop_type_id: Option<i64>,
    pub chain: Option<String>,
    pub wallet_address: Option<String>,
    pub notes: Option<String>,
    pub active: bool,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAirdropRequest {
    pub id: i64,
    pub name: Option<String>,
    pub url: Option<String>,
    pub airdrop_type_id: Option<i64>,
    pub chain: Option<String>,
    pub wallet_address: Option<String>,
    pub notes: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAirdropTypeRequest {
    pub name: String,
    pub default_tasks: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct CreateAirdropDailyTaskRequest {
    pub airdrop_id: i64,
    pub title: String,
    pub order: i64,
}

#[tauri::command]
pub async fn delete_airdrop_daily_task(
    state: State<'_, crate::AppState>,
    id: i64,
) -> Result<(), String> {
    sqlx::query("DELETE FROM airdrop_daily_tasks WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete daily task: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn list_airdrops(state: State<'_, crate::AppState>) -> Result<Vec<Airdrop>, String> {
    let airdrops = sqlx::query_as::<_, Airdrop>(
        "SELECT * FROM airdrops ORDER BY position ASC, created_at ASC",
    )
        .fetch_all(&state.db)
        .await
        .map_err(|e| format!("Failed to fetch airdrops: {}", e))?;

    Ok(airdrops)
}

#[tauri::command]
pub async fn create_airdrop(
    state: State<'_, crate::AppState>,
    req: CreateAirdropRequest,
) -> Result<i64, String> {
    let now = Utc::now();
    let position = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(MAX(position), -1) + 1 FROM airdrops",
    )
    .fetch_one(&state.db)
    .await
    .unwrap_or(0);

    sqlx::query(
        r#"
        INSERT INTO airdrops (name, url, airdrop_type_id, chain, wallet_address, position, notes, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&req.name)
    .bind(&req.url)
    .bind(&req.airdrop_type_id)
    .bind(&req.chain)
    .bind(&req.wallet_address)
    .bind(position)
    .bind(&req.notes)
    .bind(if req.active { 1 } else { 0 })
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to create airdrop: {}", e))?;

    let id = sqlx::query_scalar::<_, i64>("SELECT last_insert_rowid()")
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to get airdrop ID: {}", e))?;

    info!("phase=airdrop_create_ok id={}", id);
    Ok(id)
}

#[tauri::command]
pub async fn update_airdrop(
    state: State<'_, crate::AppState>,
    req: UpdateAirdropRequest,
) -> Result<(), String> {
    let mut updates = Vec::new();
    if req.name.is_some() {
        updates.push("name = ?");
    }
    if req.url.is_some() {
        updates.push("url = ?");
    }
    if req.airdrop_type_id.is_some() {
        updates.push("airdrop_type_id = ?");
    }
    if req.chain.is_some() {
        updates.push("chain = ?");
    }
    if req.wallet_address.is_some() {
        updates.push("wallet_address = ?");
    }
    if req.notes.is_some() {
        updates.push("notes = ?");
    }
    if req.active.is_some() {
        updates.push("active = ?");
    }
    updates.push("updated_at = ?");

    let query = format!(
        "UPDATE airdrops SET {} WHERE id = ?",
        updates.join(", ")
    );

    let mut q = sqlx::query(&query);
    if let Some(name) = &req.name {
        q = q.bind(name);
    }
    if let Some(url) = &req.url {
        q = q.bind(url);
    }
    if let Some(type_id) = &req.airdrop_type_id {
        q = q.bind(type_id);
    }
    if let Some(chain) = &req.chain {
        q = q.bind(chain);
    }
    if let Some(wallet_address) = &req.wallet_address {
        q = q.bind(wallet_address);
    }
    if let Some(notes) = &req.notes {
        q = q.bind(notes);
    }
    if let Some(active) = &req.active {
        q = q.bind(if *active { 1 } else { 0 });
    }
    q = q.bind(Utc::now().to_rfc3339());
    q = q.bind(req.id);

    q.execute(&state.db)
        .await
        .map_err(|e| format!("Failed to update airdrop: {}", e))?;

    Ok(())
}

#[derive(Debug, Deserialize)]
pub struct ReorderAirdropsRequest {
    pub items: Vec<AirdropOrderItem>,
}

#[derive(Debug, Deserialize)]
pub struct AirdropOrderItem {
    pub id: i64,
    pub position: i64,
}

#[tauri::command]
pub async fn reorder_airdrops(
    state: State<'_, crate::AppState>,
    req: ReorderAirdropsRequest,
) -> Result<(), String> {
    let mut tx = state
        .db
        .begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {}", e))?;

    for item in req.items {
        sqlx::query(
            "UPDATE airdrops SET position = ?, updated_at = ? WHERE id = ?",
        )
        .bind(item.position)
        .bind(Utc::now().to_rfc3339())
        .bind(item.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to update airdrop position: {}", e))?;
    }

    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit reorder: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_airdrop(state: State<'_, crate::AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM airdrops WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete airdrop: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn list_airdrop_types(
    state: State<'_, crate::AppState>,
) -> Result<Vec<AirdropType>, String> {
    let types = sqlx::query_as::<_, AirdropType>(
        "SELECT * FROM airdrop_types ORDER BY name ASC",
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| format!("Failed to fetch airdrop types: {}", e))?;

    Ok(types)
}

#[tauri::command]
pub async fn create_airdrop_type(
    state: State<'_, crate::AppState>,
    req: CreateAirdropTypeRequest,
) -> Result<i64, String> {
    let now = Utc::now();

    sqlx::query(
        r#"
        INSERT INTO airdrop_types (name, default_tasks, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        "#,
    )
    .bind(&req.name)
    .bind(serde_json::to_string(&req.default_tasks).unwrap())
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to create airdrop type: {}", e))?;

    let id = sqlx::query_scalar::<_, i64>("SELECT last_insert_rowid()")
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to get airdrop type ID: {}", e))?;

    Ok(id)
}

#[tauri::command]
pub async fn list_airdrop_daily_tasks(
    state: State<'_, crate::AppState>,
    airdrop_id: i64,
) -> Result<Vec<AirdropDailyTask>, String> {
    let tasks = sqlx::query_as::<_, AirdropDailyTask>(
        "SELECT * FROM airdrop_daily_tasks WHERE airdrop_id = ? ORDER BY \"order\" ASC",
    )
    .bind(airdrop_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| format!("Failed to fetch daily tasks: {}", e))?;

    Ok(tasks)
}

#[tauri::command]
pub async fn create_airdrop_daily_task(
    state: State<'_, crate::AppState>,
    req: CreateAirdropDailyTaskRequest,
) -> Result<i64, String> {
    let now = Utc::now();

    sqlx::query(
        r#"
        INSERT INTO airdrop_daily_tasks (airdrop_id, title, "order", done_dates, created_at, updated_at)
        VALUES (?, ?, ?, '[]', ?, ?)
        "#,
    )
    .bind(req.airdrop_id)
    .bind(&req.title)
    .bind(req.order)
    .bind(now.to_rfc3339())
    .bind(now.to_rfc3339())
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to create daily task: {}", e))?;

    let id = sqlx::query_scalar::<_, i64>("SELECT last_insert_rowid()")
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to get daily task ID: {}", e))?;

    Ok(id)
}

#[tauri::command]
pub async fn mark_task_done_today(
    state: State<'_, crate::AppState>,
    task_id: i64,
    airdrop_id: i64,
) -> Result<(), String> {
    let today = Utc::now().format("%Y-%m-%d").to_string();
    let today_for_log = today.clone(); // Clone for logging before moving

    // Get current done_dates
    let task: AirdropDailyTask = sqlx::query_as::<_, AirdropDailyTask>(
        "SELECT * FROM airdrop_daily_tasks WHERE id = ?",
    )
    .bind(task_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| format!("Failed to fetch task: {}", e))?;

    let mut done_dates: Vec<String> = serde_json::from_value(task.done_dates.clone())
        .unwrap_or_else(|_| Vec::new());

    if !done_dates.contains(&today) {
        done_dates.push(today);
    }

    sqlx::query(
        "UPDATE airdrop_daily_tasks SET done_dates = ?, updated_at = ? WHERE id = ?",
    )
    .bind(serde_json::to_string(&done_dates).unwrap())
    .bind(Utc::now().to_rfc3339())
    .bind(task_id)
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to update task: {}", e))?;

    info!(
        "phase=airdrop_task_done airdrop_id={} task_id={} date={}",
        airdrop_id, task_id, today_for_log
    );

    Ok(())
}

