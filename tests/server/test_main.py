from fastapi.testclient import TestClient

from server.main import app

client = TestClient(app)


def test_index():
    response = client.get("/")
    assert response.status_code == 200


def test_selections():
    response = client.get("/selections")
    assert response.status_code == 200


def test_result_calculations():
    response = client.get(
        "/result-calculations", params={"number": 10, "datepicker": "2019/12/22"}
    )
    assert response.status_code == 200
