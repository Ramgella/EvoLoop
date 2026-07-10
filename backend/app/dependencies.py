"""Shared FastAPI dependencies: Supabase client and the authenticated user."""

from dataclasses import dataclass, field
from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings
from app.services.supabase_client import SupabaseAuthError, SupabaseService

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    id: str
    email: str | None
    access_token: str
    metadata: dict[str, Any] = field(default_factory=dict)


def get_supabase(request: Request) -> SupabaseService:
    settings = get_settings()
    if not settings.supabase_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the server. Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env.",
        )
    return SupabaseService(request.app.state.http, settings)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    supabase: SupabaseService = Depends(get_supabase),
) -> CurrentUser:
    if credentials is None or not credentials.credentials:
        raise SupabaseAuthError("Missing access token.")

    user = await supabase.get_user(credentials.credentials)
    return CurrentUser(
        id=user["id"],
        email=user.get("email"),
        access_token=credentials.credentials,
        metadata=user.get("user_metadata") or {},
    )
