use log::{info, warn};
use tauri::{Manager, State};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use std::str::FromStr;

mod models;
mod commands;
mod database;
mod oauth;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
}

pub fn run() {
    env_logger::init();
    info!("phase=boot");

    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::block_on(async {
                // Initialize database
                let app_data_dir = app_handle
                    .path()
                    .app_data_dir()
                    .expect("Failed to get app data dir");
                
                // Ensure directory exists
                std::fs::create_dir_all(&app_data_dir)
                    .expect("Failed to create app data directory");
                
                let db_url = app_data_dir
                    .join("praetor_desk.db")
                    .to_str()
                    .expect("Invalid path")
                    .to_string();

                let options = SqliteConnectOptions::from_str(&format!("sqlite://{}", db_url))?
                    .create_if_missing(true);

                let pool = SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect_with(options)
                    .await?;

                // Run migrations
                database::migrate(&pool).await?;
                info!("phase=db_init_ok");

                // Store database pool in app state
                app_handle.manage(AppState { db: pool });

                Ok::<(), Box<dyn std::error::Error>>(())
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Airdrops
            commands::airdrops::list_airdrops,
            commands::airdrops::create_airdrop,
            commands::airdrops::update_airdrop,
            commands::airdrops::delete_airdrop,
            commands::airdrops::list_airdrop_types,
            commands::airdrops::create_airdrop_type,
            commands::airdrops::reorder_airdrops,
            // Airdrop Daily Tasks
            commands::airdrops::list_airdrop_daily_tasks,
            commands::airdrops::create_airdrop_daily_task,
            commands::airdrops::mark_task_done_today,
            // Projects
            commands::projects::list_projects,
            commands::projects::create_project,
            commands::projects::update_project,
            commands::projects::delete_project,
            // Project Tasks
            commands::projects::list_project_tasks,
            commands::projects::create_project_task,
            commands::projects::update_project_task,
            commands::projects::delete_project_task,
            // Ideas
            commands::ideas::list_ideas,
            commands::ideas::create_idea,
            commands::ideas::update_idea,
            commands::ideas::delete_idea,
            // House
            commands::house::list_house_items,
            commands::house::create_house_item,
            commands::house::update_house_item,
            commands::house::delete_house_item,
            // Calendar / OAuth
            commands::calendar::calendar_oauth_start,
            commands::calendar::calendar_oauth_callback,
            commands::calendar::calendar_events_upcoming,
            // Research
            commands::research::research_context7_exa,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

