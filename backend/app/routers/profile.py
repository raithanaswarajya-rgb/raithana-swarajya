from fastapi import APIRouter, HTTPException
from ..schemas.profile import ProfileSyncRequest, ProfileSyncResponse
from ..services.supabase import upsert_profile
import httpx

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


@router.post("/sync", response_model=ProfileSyncResponse)
async def sync_profile(payload: ProfileSyncRequest):
    """
    Upserts the user profile in Supabase.
    Called after Supabase Auth signup — syncs language + role metadata.
    """
    try:
        row = await upsert_profile(
            {
                "id": payload.supabase_uuid,
                "full_name": payload.full_name,
                "phone": payload.phone,
                "language": payload.language.value,
                "user_role": payload.role.value,
            }
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Supabase error: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Could not reach Supabase: {e}")

    return ProfileSyncResponse(
        success=True,
        profile_id=row.get("id", payload.supabase_uuid),
        message="Profile synced successfully.",
    )
