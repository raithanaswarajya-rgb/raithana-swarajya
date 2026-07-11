from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from ..dependencies.auth import CurrentUser, get_current_user, require_role
from ..schemas.marketplace import ConversationCreate, MessageCreate, ProductCreate, ProductUpdate
from ..services.supabase import table_request

router = APIRouter(prefix="/api/v1/marketplace", tags=["marketplace"])


def _database_error(exc: httpx.HTTPError, action: str) -> HTTPException:
    if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code == 404:
        return HTTPException(
            status_code=503,
            detail="Marketplace database is not initialized. Apply Supabase migrations 002, 003, and 004.",
        )
    return HTTPException(status_code=503, detail=f"Unable to {action}.")


async def _decorate_products(products: list[dict]) -> list[dict]:
    producer_ids = sorted({row["producer_id"] for row in products})
    if not producer_ids:
        return products
    profiles = await table_request(
        "GET", "profiles",
        params={"select": "id,full_name", "id": f"in.({','.join(producer_ids)})"},
    )
    names = {profile["id"]: profile.get("full_name") for profile in profiles}
    return [{**product, "farmer_name": names.get(product["producer_id"])} for product in products]


@router.get("/products")
async def list_products(
    mine: bool = Query(False),
    user: CurrentUser = Depends(get_current_user),
):
    params = {"select": "*", "order": "created_at.desc"}
    if mine:
        if user.role != "producer":
            raise HTTPException(status_code=403, detail="Only producers can request their own inventory.")
        params["producer_id"] = f"eq.{user.id}"
        params["is_active"] = "eq.true"
    else:
        params["is_active"] = "eq.true"
    try:
        return await _decorate_products(await table_request("GET", "inventory", params=params))
    except httpx.HTTPError as exc:
        raise _database_error(exc, "load marketplace inventory") from exc


@router.post("/products", status_code=201)
async def create_product(
    payload: ProductCreate,
    user: CurrentUser = Depends(require_role("producer")),
):
    row = {"producer_id": user.id, **payload.model_dump(mode="json")}
    try:
        created = await table_request("POST", "inventory", payload=row, prefer="return=representation")
        return {**created[0], "farmer_name": user.profile.get("full_name")}
    except httpx.HTTPError as exc:
        raise _database_error(exc, "publish this harvest") from exc


@router.patch("/products/{product_id}")
async def update_product(
    product_id: str,
    payload: ProductUpdate,
    user: CurrentUser = Depends(require_role("producer")),
):
    changes = payload.model_dump(mode="json", exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No product changes were provided.")
    try:
        updated = await table_request(
            "PATCH", "inventory",
            params={"id": f"eq.{product_id}", "producer_id": f"eq.{user.id}"},
            payload=changes, prefer="return=representation",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Unable to update this harvest.") from exc
    if not updated:
        raise HTTPException(status_code=404, detail="Harvest not found or not owned by this producer.")
    return updated[0]


async def _decorate_conversations(conversations: list[dict], user: CurrentUser) -> list[dict]:
    product_ids = sorted({row["product_id"] for row in conversations})
    if not product_ids:
        return conversations
    products = await table_request(
        "GET", "inventory",
        params={"select": "id,crop_name,image_url", "id": f"in.({','.join(product_ids)})"},
    )
    by_id = {product["id"]: product for product in products}
    other_ids = sorted({
        row["consumer_id"] if user.id == row["producer_id"] else row["producer_id"]
        for row in conversations
    })
    profiles = await table_request(
        "GET", "profiles",
        params={"select": "id,full_name,user_role", "id": f"in.({','.join(other_ids)})"},
    ) if other_ids else []
    profile_by_id = {profile["id"]: profile for profile in profiles}
    decorated = []
    for conversation in conversations:
        other_id = conversation["consumer_id"] if user.id == conversation["producer_id"] else conversation["producer_id"]
        other = profile_by_id.get(other_id, {})
        decorated.append({
            **by_id.get(conversation["product_id"], {}),
            **conversation,
            "other_party_id": other_id,
            "other_party_name": other.get("full_name"),
            "other_party_role": other.get("user_role", other.get("role")),
        })
    return decorated


@router.get("/conversations")
async def list_conversations(user: CurrentUser = Depends(get_current_user)):
    owner_field = "producer_id" if user.role == "producer" else "consumer_id"
    try:
        rows = await table_request(
            "GET", "conversations",
            params={"select": "*", owner_field: f"eq.{user.id}", "order": "updated_at.desc"},
        )
        return await _decorate_conversations(rows, user)
    except httpx.HTTPError as exc:
        raise _database_error(exc, "load conversations") from exc


@router.post("/conversations", status_code=201)
async def start_conversation(
    payload: ConversationCreate,
    user: CurrentUser = Depends(require_role("consumer")),
):
    try:
        products = await table_request(
            "GET", "inventory",
            params={"select": "*", "id": f"eq.{payload.product_id}", "is_active": "eq.true", "limit": "1"},
        )
        if not products:
            raise HTTPException(status_code=404, detail="This harvest is no longer available.")
        product = products[0]
        existing = await table_request(
            "GET", "conversations",
            params={
                "select": "*", "product_id": f"eq.{product['id']}",
                "consumer_id": f"eq.{user.id}", "producer_id": f"eq.{product['producer_id']}",
                "limit": "1",
            },
        )
        rows = existing or await table_request(
            "POST", "conversations",
            payload={
                "product_id": product["id"], "consumer_id": user.id,
                "producer_id": product["producer_id"],
            },
            prefer="return=representation",
        )
        if not rows:
            raise HTTPException(status_code=500, detail="Unable to open this conversation.")
        return (await _decorate_conversations(rows, user))[0]
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        raise _database_error(exc, "open this conversation") from exc


async def _participant_conversation(conversation_id: str, user: CurrentUser) -> dict:
    rows = await table_request(
        "GET", "conversations",
        params={"select": "*", "id": f"eq.{conversation_id}", "limit": "1"},
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    conversation = rows[0]
    producer_id = conversation.get("producer_id")
    consumer_id = conversation.get("consumer_id")
    if not producer_id or not consumer_id:
        raise HTTPException(status_code=500, detail="This conversation is missing participant data.")
    if user.id not in (producer_id, consumer_id):
        raise HTTPException(status_code=403, detail="You are not a participant in this conversation.")
    return conversation


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: str,
    user: CurrentUser = Depends(get_current_user),
):
    try:
        await _participant_conversation(conversation_id, user)
        return await table_request(
            "GET", "messages",
            params={"select": "*", "conversation_id": f"eq.{conversation_id}", "order": "created_at.asc"},
        )
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        raise _database_error(exc, "load messages") from exc


@router.post("/conversations/{conversation_id}/messages", status_code=201)
async def send_message(
    conversation_id: str,
    payload: MessageCreate,
    user: CurrentUser = Depends(get_current_user),
):
    body = payload.body.strip()
    if not body:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")
    try:
        await _participant_conversation(conversation_id, user)
        created = await table_request(
            "POST", "messages",
            payload={"conversation_id": conversation_id, "sender_id": user.id, "body": body},
            prefer="return=representation",
        )
        if not created:
            raise HTTPException(status_code=500, detail="The message could not be created.")
        await table_request(
            "PATCH", "conversations",
            params={"id": f"eq.{conversation_id}"},
            payload={"updated_at": datetime.now(timezone.utc).isoformat()},
        )
        return created[0]
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        raise _database_error(exc, "send this message") from exc
