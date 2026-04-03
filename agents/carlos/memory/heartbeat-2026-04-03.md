
## 09:39 UTC — paperclip-carlos-heartbeat (cron id: 35e3ed6d)

**Status:** FAILED — Missing environment variables

**Issue:** PAPERCLIP_API_KEY and PAPERCLIP_API_URL are not set in the isolated session environment.

The cron job `paperclip-carlos-heartbeat` (35e3ed6d-e144-41a8-ba97-688b335fa508) is configured to run every 15 minutes but the isolated sessions are not receiving the required env vars:
- `PAPERCLIP_API_KEY` — not found in env
- `PAPERCLIP_API_URL` — not found in env

Other paperclip heartbeats also affected: elena, enzo, diana, valeria, marcos, laura.

**Action needed:** Configure PAPERCLIP_API_KEY and PAPERCLIP_API_URL in the cron job's environment or in the agent's adapter config so they are injected into isolated sessions.
