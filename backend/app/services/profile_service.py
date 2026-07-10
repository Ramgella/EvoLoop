"""Data access for the `profiles` table."""

from typing import Any

from app.dependencies import CurrentUser
from app.services.supabase_client import SupabaseError, SupabaseService

TABLE = "profiles"
COLUMNS = "id,full_name,email,headline,bio,created_at,updated_at"


async def get_profile(supabase: SupabaseService, user: CurrentUser) -> dict[str, Any] | None:
    rows = await supabase.rest(
        "GET",
        TABLE,
        user.access_token,
        params={"id": f"eq.{user.id}", "select": COLUMNS},
    )
    return rows[0] if rows else None


async def create_profile(supabase: SupabaseService, user: CurrentUser) -> dict[str, Any]:
    """Create the user's profile.

    Normally the `on_auth_user_created` database trigger does this at signup;
    this is a fallback for accounts created before the trigger existed.
    """
    full_name = (user.metadata.get("full_name") or "").strip() or None
    try:
        rows = await supabase.rest(
            "POST",
            TABLE,
            user.access_token,
            params={"select": COLUMNS},
            json={"id": user.id, "email": user.email, "full_name": full_name},
            prefer="return=representation",
        )
    except SupabaseError as exc:
        if exc.status_code != 409:
            raise
        # Created concurrently (e.g. by the trigger) — read it back instead.
        existing = await get_profile(supabase, user)
        if existing is None:
            raise
        return existing
    return rows[0]


async def get_or_create_profile(supabase: SupabaseService, user: CurrentUser) -> dict[str, Any]:
    profile = await get_profile(supabase, user)
    return profile if profile is not None else await create_profile(supabase, user)


async def update_profile(
    supabase: SupabaseService, user: CurrentUser, changes: dict[str, Any]
) -> dict[str, Any]:
    if not changes:
        return await get_or_create_profile(supabase, user)

    # Make sure the row exists before patching it.
    await get_or_create_profile(supabase, user)
    rows = await supabase.rest(
        "PATCH",
        TABLE,
        user.access_token,
        params={"id": f"eq.{user.id}", "select": COLUMNS},
        json=changes,
        prefer="return=representation",
    )
    if not rows:
        raise SupabaseError("Profile not found.", status_code=404)
    return rows[0]
