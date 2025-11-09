use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AirdropType {
    pub id: i64,
    pub name: String,
    #[sqlx(json)]
    pub default_tasks: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Airdrop {
    pub id: i64,
    pub name: String,
    pub url: String,
    pub airdrop_type_id: Option<i64>,
    #[sqlx(default)]
    pub chain: Option<String>,
    #[sqlx(default)]
    pub wallet_address: Option<String>,
    pub position: i64,
    pub notes: Option<String>,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AirdropDailyTask {
    pub id: i64,
    pub airdrop_id: i64,
    pub title: String,
    pub order: i64,
    #[sqlx(json)]
    pub done_dates: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}


