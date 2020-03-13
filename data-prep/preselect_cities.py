import pandas as pd

SRC_DATA_FOLDER = "data/data_fixed"
TARGET_DATA_FOLDER = "src/charts/data"

TARGET_COL = "Cumulative Median"
TIME_COL = "Timestep"


def read_tsv(path):
    return pd.read_csv(path, sep="\t")


def get_dummy_data(preprocessed_data, number=4):
    for i in range(number):
        preprocessed_data[TARGET_COL + "_" + str(i)] = (
            preprocessed_data[TARGET_COL] + i * 10
        )

    preprocessed_data = preprocessed_data.drop([TARGET_COL], axis=1)
    return preprocessed_data


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
    index_cols = ["City", "source_sec"]

    # select only relevant columns
    selected_cities = selected_cities[index_cols + [TARGET_COL, TIME_COL]]

    # preprocessing step according to David Johnston
    data_1 = (
        selected_cities[selected_cities["source_sec"] == 1]
        .drop(["source_sec"], axis=1)
        .set_index(["City", TIME_COL])
    )
    data_3 = (
        selected_cities[selected_cities["source_sec"] == 3]
        .drop(["source_sec"], axis=1)
        .set_index(["City", TIME_COL])
    )
    selected_cities = data_3 - data_1

    selected_cities = selected_cities.sort_index()

    return selected_cities


def load_cities():
    all_cities = read_tsv(SRC_DATA_FOLDER + "/md_cities.tsv")
    print("all cities loaded")

    selected_cities = read_tsv(SRC_DATA_FOLDER + "/city_selections.csv")
    print("city selection loaded")

    return all_cities, selected_cities


def process_data(all_cities, selected_cities, all_data):
    processed_data = preprocess_data(all_data, all_cities, selected_cities)
    print("preprocesessing done")

    processed_data = get_dummy_data(processed_data, number=4)
    print("dummy data created (real data artificially inflated)")

    return processed_data


if __name__ == "__main__":
    all_cities, selected_cities = load_cities()

    all_data = pd.read_parquet(SRC_DATA_FOLDER + "/areas.pq")
    print("gleamviz data loaded")

    processed_data = process_data(all_cities, selected_cities, all_data)

    target_filepath = TARGET_DATA_FOLDER + "/city_lookup.pq"
    processed_data.to_parquet(target_filepath)
    print("data saved to: " + target_filepath)
