import pandas as pd

SRC_DATA_FOLDER = "data/data_fixed"
TARGET_DATA_FOLDER = "src/charts/data"

TARGET_COL = "Cumulative Median"
TIME_COL = "Timestep"


def read_tsv(path):
    # return pd.read_csv(path, sep="\t", index_col=0)
    return pd.read_csv(path, sep="\t")


def preprocess_data(all_data, all_cities, selected_cities):
    all_data = all_data[all_data["area_type"] == "cities"]

    # find intersection based on names
    selected_cities = all_cities.merge(
        selected_cities, left_on=["City Name"], right_on=["City"], how="inner"
    )
    # find intersection based on City IDs
    selected_cities = all_data.merge(
        selected_cities, left_on="source_main", right_on="City ID", how="inner"
    )
    # select only the files 1 and 3
    selected_cities = selected_cities[selected_cities["source_sec"].isin({1, 3})]
    selected_cities = selected_cities.set_index(["City", "source_sec"]).sort_index()

    # select only relevant columns
    selected_cities = selected_cities[[TARGET_COL, TIME_COL]]

    return selected_cities


if __name__ == "__main__":
    all_cities = read_tsv(SRC_DATA_FOLDER + "/md_cities.tsv")
    print("all cities loaded")

    selected_cities = read_tsv(SRC_DATA_FOLDER + "/city_selections.csv")
    print("city selection loaded")

    all_data = pd.read_parquet(SRC_DATA_FOLDER + "/areas.pq")
    print("gleamviz data loaded")

    preprocessed_data = preprocess_data(all_data, all_cities, selected_cities)
    print("preprocesessing done")

    target_filepath = TARGET_DATA_FOLDER + "/city_lookup.pq"
    preprocessed_data.to_parquet(target_filepath)
    print("data saved to:" + target_filepath)
