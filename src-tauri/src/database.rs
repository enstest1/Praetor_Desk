use log::info;
use sqlx::SqlitePool;

pub async fn migrate(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    info!("Running database migrations...");

    // Airdrop Types
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS airdrop_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            default_tasks TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Airdrops
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS airdrops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            airdrop_type_id INTEGER,
            chain TEXT,
            wallet_address TEXT,
            position INTEGER NOT NULL DEFAULT 0,
            notes TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (airdrop_type_id) REFERENCES airdrop_types(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Migration: Add chain and wallet_address columns if they don't exist
    sqlx::query(
        r#"
        ALTER TABLE airdrops ADD COLUMN chain TEXT
        "#,
    )
    .execute(pool)
    .await
    .ok(); // Ignore error if column already exists

    sqlx::query(
        r#"
        ALTER TABLE airdrops ADD COLUMN position INTEGER NOT NULL DEFAULT 0
        "#,
    )
    .execute(pool)
    .await
    .ok(); // Ignore error if column already exists

    // Ensure existing rows have sequential positions
    if let Ok(ids) = sqlx::query_scalar::<_, i64>(
        "SELECT id FROM airdrops ORDER BY position ASC, created_at ASC",
    )
    .fetch_all(pool)
    .await
    {
        for (idx, id) in ids.into_iter().enumerate() {
            let _ = sqlx::query(
                "UPDATE airdrops SET position = ?, updated_at = updated_at WHERE id = ?",
            )
            .bind(idx as i64)
            .bind(id)
            .execute(pool)
            .await;
        }
    }

    sqlx::query(
        r#"
        ALTER TABLE airdrops ADD COLUMN wallet_address TEXT
        "#,
    )
    .execute(pool)
    .await
    .ok(); // Ignore error if column already exists

    // Airdrop Daily Tasks
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS airdrop_daily_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            airdrop_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            "order" INTEGER NOT NULL DEFAULT 0,
            done_dates TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (airdrop_id) REFERENCES airdrops(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Projects
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Project Tasks
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS project_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            done INTEGER NOT NULL DEFAULT 0,
            "order" INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Ideas
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // House Items
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS house_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            notes TEXT,
            done INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // OAuth Tokens
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS oauth_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT NOT NULL UNIQUE,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            expires_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    info!("Database migrations completed successfully");
    Ok(())
}

