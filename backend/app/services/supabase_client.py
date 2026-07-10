"""Thin async client for the Supabase Auth and PostgREST HTTP APIs.

Every database request is sent with the *user's* access token, so Postgres
Row Level Security decides what the user may read or write. The backend never
needs the service-role key.
"""

from typing import Any

import httpx

from app.config import Settings


class SupabaseError(Exception):
    """An error returned by (or while reaching) Supabase."""

    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class SupabaseAuthError(SupabaseError):
    """The supplied access token is missing, invalid or expired."""

    def __init__(self, message: str = "Your session is invalid or has expired. Please sign in again.") -> None:
        super().__init__(message, status_code=401)


def _error_message(response: httpx.Response, fallback: str) -> str:
    try:
        payload = response.json()
    except ValueError:
        return fallback
    if isinstance(payload, dict):
        for key in ("message", "msg", "error_description", "error"):
            value = payload.get(key)
            if isinstance(value, str) and value:
                return value
    return fallback


class SupabaseService:
    def __init__(self, http: httpx.AsyncClient, settings: Settings) -> None:
        self._http = http
        self._url = settings.supabase_url
        self._key = settings.supabase_anon_key

    def _headers(self, access_token: str, prefer: str | None = None) -> dict[str, str]:
        headers = {
            "apikey": self._key,
            "Authorization": f"Bearer {access_token}",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    async def get_user(self, access_token: str) -> dict[str, Any]:
        """Validate an access token with Supabase Auth and return the user."""
        try:
            response = await self._http.get(
                f"{self._url}/auth/v1/user",
                headers=self._headers(access_token),
            )
        except httpx.HTTPError as exc:
            raise SupabaseError("Could not reach Supabase Auth.", status_code=503) from exc

        if response.status_code in (401, 403):
            raise SupabaseAuthError()
        if response.is_error:
            raise SupabaseError(_error_message(response, "Supabase Auth returned an error."))
        return response.json()

    async def rest(
        self,
        method: str,
        table: str,
        access_token: str,
        *,
        params: dict[str, str] | None = None,
        json: dict[str, Any] | None = None,
        prefer: str | None = None,
    ) -> list[dict[str, Any]]:
        """Call PostgREST for `table` on behalf of the user."""
        try:
            response = await self._http.request(
                method,
                f"{self._url}/rest/v1/{table}",
                headers=self._headers(access_token, prefer),
                params=params,
                json=json,
            )
        except httpx.HTTPError as exc:
            raise SupabaseError("Could not reach the Supabase database.", status_code=503) from exc

        if response.status_code == 401:
            raise SupabaseAuthError()
        if response.is_error:
            message = _error_message(response, "Database request failed.")
            if response.status_code == 404 or "Could not find the table" in message:
                raise SupabaseError(
                    f"Table '{table}' was not found. Run backend/database/schema.sql in Supabase.",
                    status_code=500,
                )
            if response.status_code == 403:
                raise SupabaseError("You do not have permission to perform this action.", status_code=403)
            if response.status_code == 409:
                raise SupabaseError(message, status_code=409)
            status = 400 if response.status_code < 500 else 502
            raise SupabaseError(message, status_code=status)

        if not response.content:
            return []
        data = response.json()
        return data if isinstance(data, list) else [data]
