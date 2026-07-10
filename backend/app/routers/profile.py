"""Endpoints for the signed-in user's profile."""

from fastapi import APIRouter, Depends

from app.dependencies import CurrentUser, get_current_user, get_supabase
from app.schemas.profile import Profile, ProfileUpdate
from app.services import profile_service
from app.services.supabase_client import SupabaseService

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/me", response_model=Profile)
async def read_my_profile(
    user: CurrentUser = Depends(get_current_user),
    supabase: SupabaseService = Depends(get_supabase),
) -> dict:
    return await profile_service.get_or_create_profile(supabase, user)


@router.patch("/me", response_model=Profile)
async def update_my_profile(
    payload: ProfileUpdate,
    user: CurrentUser = Depends(get_current_user),
    supabase: SupabaseService = Depends(get_supabase),
) -> dict:
    changes = payload.model_dump(exclude_unset=True, mode="json")
    return await profile_service.update_profile(supabase, user, changes)
