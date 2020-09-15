from urllib.request import Request, urlopen
import json
import luigi
import luigi.event
import logging
import time
import os

log = logging.getLogger(__name__)

SLACK_WEBHOOK_ENV = "SLACK_WEBHOOK_URL"


class SlackAPI:
    def __init__(self, url):
        self.url = url
        self.headers = {"Content-type": "application/json"}
        self.method = "POST"

    def post(self, **kwargs):
        data = json.dumps(kwargs).encode()
        log.warning(f"Sending slack webhook with data {kwargs}")
        req = Request(self.url, data=data, headers=self.headers, method=self.method)
        return urlopen(req).read().decode()


class LuigiSlackWebhook:
    def __init__(self, webhook_url=None):
        if webhook_url is None:
            webhook_url = os.getenv(SLACK_WEBHOOK_ENV, None)
        if webhook_url is not None:
            self.client = SlackAPI(webhook_url)
        else:
            log.warning(f"No Slack webhook configured, silently ignoring events")

    def set_handlers(self, task_class, events=None):
        if events is None:
            events = [luigi.Event.SUCCESS, luigi.Event.FAILURE]
        handlers = self._get_handlers(task_class)

        for event in events:
            if event not in handlers:
                raise ValueError(f"Event {event} had no valid handler implemented")
            luigi.Task.event_handler(event)(handlers[event])

    def _get_handlers(self, task_class):
        def failure_handler(callback_task, exception):
            if callback_task.__class__ != task_class:
                return
            self._safe_post(
                self.format_message(
                    callback_task, luigi.Event.FAILURE, "#a64937", exception=exception
                )
            )

        def success_handler(callback_task):
            if callback_task.__class__ != task_class:
                return
            self._safe_post(
                self.format_message(callback_task, luigi.Event.SUCCESS, "#36a64f")
            )

        return {
            luigi.Event.FAILURE: failure_handler,
            luigi.Event.SUCCESS: success_handler,
        }

    def _safe_post(self, message):
        if self.client is not None:
            self.client.post(**message)

    @staticmethod
    def format_message(task: luigi.Task, status: luigi.Event, color: str, **kwargs):
        task_name = task.__class__.__name__
        extra_fields = [
            {"title": str(key), "value": str(value), "short": False}
            for key, value in kwargs.items()
        ]

        return {
            "attachments": [
                {
                    "fallback": f"Task {task_name} finished with status {status}",
                    "color": color,
                    "pretext": f"Task {task_name} pipeline status",
                    "fields": [
                        {"title": "status", "value": str(status), "short": False},
                        *extra_fields,
                    ],
                    "ts": time.time(),
                }
            ]
        }
