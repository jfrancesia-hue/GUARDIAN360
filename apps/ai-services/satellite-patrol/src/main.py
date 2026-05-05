from fastapi import FastAPI

app = FastAPI(title="Guardian360 SatellitePatrol", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "satellite-patrol"}
