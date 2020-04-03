import os

from dataclasses import dataclass, fields
from distutils.util import strtobool


@dataclass
class BaseConfig:
    """
    Default config values (can be overridden through shell environment
    Use the CONFIG global variable to obtain current settings.
    """

    @staticmethod
    def from_string(type_, value):
        if type_ == bool:
            value = strtobool(str(value))

        return type_(value)

    def __init__(self):
        """Either set config variables to those passed in Environment variables or
        fallback to default values set on the class level."""
        for field in fields(self):
            name = field.name
            if name in os.environ:
                value = BaseConfig.from_string(field.type, os.environ[name])
                setattr(self, name, value)


@dataclass(init=False)
class Config(BaseConfig):
    APP_VERSION: str = "000000"

    # comma separated string of addresses
    ALLOWED_HOSTS: str = "127.0.0.1"


CONFIG = Config()
