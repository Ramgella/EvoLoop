"""FastAPI application entry point.

Run locally with:  uvicorn app.main:app --reload --port 8000
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import health, profile
from app.services.supabase_client import SupabaseError


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # One shared HTTP connection pool for all Supabase calls.
    async with httpx.AsyncClient(timeout=10.0) as client:
        app.state.http = client
        yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="EvoLoop API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "PATCH", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.exception_handler(SupabaseError)
    async def handle_supabase_error(_: Request, exc: SupabaseError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    app.include_router(health.router)
    app.include_router(profile.router)
    return app


app = create_app()
