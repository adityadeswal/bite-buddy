from contextlib import asynccontextmanager

from fastapi import FastAPI

import db
from routers import flats, flatmates, availability, recipes, cooks, actions


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Bite Buddy API", lifespan=lifespan)

app.include_router(flats.router)
app.include_router(flatmates.router)
app.include_router(availability.router)
app.include_router(recipes.router)
app.include_router(cooks.router)
app.include_router(actions.router)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
