import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from server.main import app
    client = TestClient(app)
    return client

def test_index(client):
    response = client.get("/")
    assert response.status_code == 200


def test_request_event_evaluation(client):
    response = client.get("/request-event-evaluation")
    assert response.status_code == 200

def test_status(client):
    response = client.get("/status")
    assert response.status_code == 200
    assert list(response.json().keys()) == ["app_version"]
