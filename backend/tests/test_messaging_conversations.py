import asyncio

from app.dependencies.auth import CurrentUser
from app.routers import marketplace


def test_decorate_conversations_preserves_conversation_id(monkeypatch):
    async def fake_table_request(method, table, *, params=None, payload=None, prefer=None):
        if table == "inventory":
            return [{"id": "product-123", "crop_name": "Rice", "image_url": "http://img"}]
        if table == "profiles":
            return [{"id": "person-2", "full_name": "Asha", "user_role": "producer"}]
        raise AssertionError(f"Unexpected table: {table}")

    monkeypatch.setattr(marketplace, "table_request", fake_table_request)

    user = CurrentUser(id="person-1", email="user@example.com", role="consumer", profile={})
    conversations = [
        {
            "id": "conv-123",
            "product_id": "product-123",
            "producer_id": "person-2",
            "consumer_id": "person-1",
        }
    ]

    decorated = asyncio.run(marketplace._decorate_conversations(conversations, user))

    assert decorated[0]["id"] == "conv-123"
    assert decorated[0]["product_id"] == "product-123"
    assert decorated[0]["crop_name"] == "Rice"
    assert decorated[0]["other_party_name"] == "Asha"
