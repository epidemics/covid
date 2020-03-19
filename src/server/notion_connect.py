import pandas as pd
from notion.client import NotionClient

from server.config import CONFIG

# Obtain the `NOTION_TOKEn` value by inspecting your browser cookies on a logged-in session on Notion.so
NOTION_TOKEN = CONFIG.NOTION_TOKEN


def query_containment_measures():

    client = NotionClient(token_v2=NOTION_TOKEN)

    cv = client.get_collection_view(
        "https://www.notion.so/977d5e5be0434bf996704ec361ad621d?v"
        "=aa8e0c75520a479ea48f56cb4c289b7e"
    )

    data = {"country": [], "description": [], "keywords": [], "source": [], "date": []}
    # Run a filtered/sorted query using a view's default parameters
    result = cv.default_query().execute()
    for row in result:
        if row.date_start is not None and row.country is not None:
            data["country"].append(row.country)
            data["description"].append(row.description_of_measure_implemented)
            data["keywords"].append(row.keywords)
            data["source"].append(row.source)
            data["date"].append(row.date_start.start)

    df = pd.DataFrame.from_dict(data)
    df["date"] = pd.to_datetime(df["date"])
    return df
