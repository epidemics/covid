# import pytest
# from fastapi.testclient import TestClient


# @pytest.fixture
# def client():
#     from server.main import app

#     client = TestClient(app)
#     return client


# def test_index(client):
#     response = client.get("/")
#     assert response.status_code == 200


# def test_case_map(client):
#     response = client.get("/case-map")
#     assert response.status_code == 200


# def test_about(client):
#     response = client.get("/about")
#     assert response.status_code == 200


# def test_request_calculation(client):
#     response = client.get("/request-calculation")
#     assert response.status_code == 200


# def test_status(client):
#     response = client.get("/status")
#     assert response.status_code == 200
#     assert list(response.json().keys()) == ["app_version"]
