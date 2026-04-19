from fastapi import FastAPI

app = FastAPI(title="Bite Buddy API")


@app.get("/")
def root():
    return {"message": "Bite Buddy API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
