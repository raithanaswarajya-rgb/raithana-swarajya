from typing import Any

import httpx

from ..core.config import settings


def _service_headers(prefer: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": settings.SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


async def verify_access_token(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={"apikey": settings.SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {access_token}"},
        )
    response.raise_for_status()
    return response.json()


async def table_request(
    method: str,
    table: str,
    *,
    params: dict[str, Any] | None = None,
    payload: dict | None = None,
    prefer: str | None = None,
) -> list[dict]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.request(
            method,
            f"{settings.SUPABASE_URL}/rest/v1/{table}",
            params=params,
            json=payload,
            headers=_service_headers(prefer),
        )
    response.raise_for_status()
    if response.status_code == 204 or not response.content:
        return []
    return response.json()


async def fetch_profile(user_id: str) -> dict | None:
    rows = await table_request("GET", "profiles", params={"select": "*", "id": f"eq.{user_id}", "limit": "1"})
    return rows[0] if rows else None


async def upsert_profile(payload: dict) -> dict:
    rows = await table_request(
        "POST", "profiles", payload=payload,
        prefer="resolution=merge-duplicates,return=representation",
    )
    return rows[0] if rows else payload
