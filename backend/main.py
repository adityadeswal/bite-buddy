import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db
from routers import flats, flatmates, availability, recipes, cooks, actions, engine


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
app.include_router(engine.router)


_default_origins = "http://localhost:3000"
_origins_env = os.environ.get("CORS_ORIGINS", _default_origins)
allow_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]
allow_origin_regex = os.environ.get("CORS_ORIGIN_REGEX") or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
