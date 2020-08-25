import numpy as np
import pandas as pd

from enum import Enum
import datetime
from typing import Optional


def types_to_json(obj):
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    if isinstance(obj, Enum):
        return obj.name
    else:
        raise TypeError(f"Unserializable object {obj} of type {type(obj)}")


def get_df_else_none(df: pd.DataFrame, code) -> Optional[pd.DataFrame]:
    if code in df.index:
        return df.loc[code].sort_index()
    else:
        return None
