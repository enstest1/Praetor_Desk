use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Idea {
    pub id: i64,
    pub title: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}


