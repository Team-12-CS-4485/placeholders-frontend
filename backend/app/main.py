from fastapi import FastAPI
import uvicorn

app = FastAPI(title="YouTube Intelligence Backend")

@app.get("/")
def home():
    return {"message": "Welcome to YouTube Intelligence Backend"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
