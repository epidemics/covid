class ProxyHeadersMiddleware:
    """Needed for HTTPS to work properly

    See starlette docs: https://www.starlette.io/middleware/#proxyheadersmiddleware
    """

    def __init__(self, app, trusted_hosts="127.0.0.1"):
        self.app = app
        if isinstance(trusted_hosts, str):
            self.trusted_hosts = [item.strip() for item in trusted_hosts.split(",")]
        else:
            self.trusted_hosts = trusted_hosts
        self.always_trust = "*" in self.trusted_hosts

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            client_addr = scope.get("client")
            client_host = client_addr[0] if client_addr else None

            if self.always_trust or client_host in self.trusted_hosts:
                headers = dict(scope["headers"])

                if b"x-forwarded-proto" in headers:
                    x_forwarded_proto = headers[b"x-forwarded-proto"].decode("ascii")
                    scope["scheme"] = x_forwarded_proto.strip()

                if b"x-forwarded-for" in headers:
                    x_forwarded_for = headers[b"x-forwarded-for"].decode("ascii")
                    host = x_forwarded_for.split(",")[-1].strip()
                    port = 0
                    scope["client"] = (host, port)

        return await self.app(scope, receive, send)
