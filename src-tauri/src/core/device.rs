use rdev::{Event, EventType, listen};
use serde::Serialize;
use serde_json::{Value, json};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Runtime, command};

#[derive(Debug, Clone, Serialize)]
pub enum DeviceEventKind {
    MouseMove,
}

#[derive(Debug, Clone, Serialize)]
pub struct DeviceEvent {
    kind: DeviceEventKind,
    value: Value,
}

static IS_LISTENING: AtomicBool = AtomicBool::new(false);

#[command]
pub async fn start_device_listening<R: Runtime>(app_handle: AppHandle<R>) -> Result<(), String> {
    if IS_LISTENING.load(Ordering::SeqCst) {
        return Ok(());
    }

    IS_LISTENING.store(true, Ordering::SeqCst);

    let callback = move |event: Event| {
        if let EventType::MouseMove { x, y } = event.event_type {
            let device_event = DeviceEvent {
                kind: DeviceEventKind::MouseMove,
                value: json!({ "x": x, "y": y }),
            };

            let _ = app_handle.emit("device-changed", device_event);
        }
    };

    listen(callback).map_err(|err| format!("Failed to listen device: {:?}", err))?;

    Ok(())
}
