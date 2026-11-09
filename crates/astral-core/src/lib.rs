use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
#[derive(Default, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Library { pub favorites: Vec<String>, pub progress: BTreeMap<String, f64>, pub addons: Vec<String> }
pub fn https_url(input: &str) -> Result<url::Url,String> {
    let u = url::Url::parse(input).map_err(|_|"URL invalide")?;
    if u.scheme() != "https" || u.host_str().is_none() || !u.username().is_empty() || u.password().is_some() { return Err("Une URL HTTPS sans identifiants est requise".into()); }
    Ok(u)
}
#[cfg(test)] mod tests {
    use super::*;
    #[test] fn rejects_unsafe_schemes() { for u in ["http://example.com", "file:///etc/passwd", "https://user:secret@example.com"] { assert!(https_url(u).is_err()); } }
    #[test] fn accepts_https() { assert!(https_url("https://example.com/manifest.json").is_ok()); }
    #[test] fn library_round_trip() { let mut l=Library::default(); l.progress.insert("film".into(),42.0); let s=serde_json::to_string(&l).unwrap(); assert_eq!(serde_json::from_str::<Library>(&s).unwrap().progress["film"],42.0); }
}
