from dataclasses import dataclass

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..services.supabase import fetch_profile, verify_access_token

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    id: str
    email: str | None
    role: str | None
    profile: dict


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="A bearer access token is required.")

    try:
        auth_user = await verify_access_token(credentials.credentials)
        profile = await fetch_profile(auth_user["id"])
    except httpx.HTTPStatusError as exc:
        status = 401 if exc.response.status_code in (400, 401, 403) else 503
        raise HTTPException(status_code=status, detail="Invalid or expired access token.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Authentication service is unavailable.") from exc

    role = profile.get("user_role", profile.get("role")) if profile else None
    if not profile:
        raise HTTPException(status_code=403, detail="No application profile exists for this account.")

    return CurrentUser(
        id=auth_user["id"],
        email=auth_user.get("email"),
        role=role,
        profile=profile,
    )


def require_role(required_role: str):
    async def dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role != required_role:
            raise HTTPException(status_code=403, detail=f"This action requires the {required_role} role.")
        return user

    return dependency
