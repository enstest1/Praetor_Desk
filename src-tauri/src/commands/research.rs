use log::info;
use serde::{Deserialize, Serialize};
use reqwest;

#[derive(Debug, Serialize)]
pub struct ResearchResult {
    pub source: String,
    pub content: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct ResearchRequest {
    pub query: String,
    pub context7_url: Option<String>,
    pub exa_url: Option<String>,
}

#[tauri::command]
pub async fn research_context7_exa(
    req: ResearchRequest,
) -> Result<Vec<ResearchResult>, String> {
    info!("phase=research_start targets=[context7,exa] query=\"{}\"", req.query);

    let mut results = Vec::new();

    // Call Context7 MCP
    if let Some(context7_url) = req.context7_url {
        match call_context7(&context7_url, &req.query).await {
            Ok(content) => {
                results.push(ResearchResult {
                    source: "context7".to_string(),
                    content,
                    metadata: Some(serde_json::json!({
                        "url": context7_url,
                        "query": req.query
                    })),
                });
            }
            Err(e) => {
                log::warn!("Context7 call failed: {}", e);
            }
        }
    } else {
        // Default Context7 endpoint
        match call_context7("http://localhost:7080", &req.query).await {
            Ok(content) => {
                results.push(ResearchResult {
                    source: "context7".to_string(),
                    content,
                    metadata: Some(serde_json::json!({
                        "url": "http://localhost:7080",
                        "query": req.query
                    })),
                });
            }
            Err(e) => {
                log::warn!("Context7 call failed: {}", e);
            }
        }
    }

    // Call Exa MCP
    if let Some(exa_url) = req.exa_url {
        match call_exa(&exa_url, &req.query).await {
            Ok(content) => {
                results.push(ResearchResult {
                    source: "exa".to_string(),
                    content,
                    metadata: Some(serde_json::json!({
                        "url": exa_url,
                        "query": req.query
                    })),
                });
            }
            Err(e) => {
                log::warn!("Exa call failed: {}", e);
            }
        }
    } else {
        // Default Exa endpoint
        match call_exa("http://localhost:7081", &req.query).await {
            Ok(content) => {
                results.push(ResearchResult {
                    source: "exa".to_string(),
                    content,
                    metadata: Some(serde_json::json!({
                        "url": "http://localhost:7081",
                        "query": req.query
                    })),
                });
            }
            Err(e) => {
                log::warn!("Exa call failed: {}", e);
            }
        }
    }

    info!("phase=research_done results_count={}", results.len());
    Ok(results)
}

async fn call_context7(url: &str, query: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    // Context7 MCP typically expects a POST request with JSON body
    let response = client
        .post(format!("{}/mcp/call", url))
        .json(&serde_json::json!({
            "method": "get-library-docs",
            "params": {
                "query": query
            }
        }))
        .send()
        .await
        .map_err(|e| format!("Context7 request failed: {}", e))?;

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read Context7 response: {}", e))?;

    Ok(text)
}

async fn call_exa(url: &str, query: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    // Exa MCP typically expects a POST request with JSON body
    let response = client
        .post(format!("{}/mcp/call", url))
        .json(&serde_json::json!({
            "method": "search",
            "params": {
                "query": query
            }
        }))
        .send()
        .await
        .map_err(|e| format!("Exa request failed: {}", e))?;

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read Exa response: {}", e))?;

    Ok(text)
}


