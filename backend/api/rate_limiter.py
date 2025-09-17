# app/utils/ratelimiter.py
import time
from functools import wraps
from django.core.cache import caches
from django.http import JsonResponse


class RateLimiter:
    """Sliding-window rate limiter keyed by client IP"""

    def __init__(self, max_requests: int = 5, window_seconds: int = 60, cache_alias: str = "default"):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.cache = caches[cache_alias]

    def __call__(self, view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            user_ip = self._get_client_ip(request)
            now = time.time()
            key = f"rl:{user_ip}"

            # get existing timestamps for this IP and drop those outside the window
            window = self.cache.get(key, [])
            window = [ts for ts in window if now - ts < self.window_seconds]

            # if over the limit, return 429 with Retry-After
            if len(window) >= self.max_requests:
                retry_after = max(0, self.window_seconds - (now - window[0]))
                resp = JsonResponse({"error": "Too Many Requests", "retry_after": round(retry_after, 2)})
                resp.status_code = 429
                resp["Retry-After"] = str(int(retry_after))
                return resp

            # record current request and persist with TTL = window size
            window.append(now)
            self.cache.set(key, window, timeout=self.window_seconds)

            return view_func(request, *args, **kwargs)

        return _wrapped

    @staticmethod
    def _get_client_ip(request):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            return xff.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "unknown")


ratelimiter = RateLimiter(max_requests=5, window_seconds=60)
