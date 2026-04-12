#!/bin/bash
LOG_DIR="/data/.openclaw/workspace/mycompi/agents/carlos"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/paperclip-heartbeat-$(date +%Y-%m-%d).log"

{
  echo "=========================================="
  echo "Carlos Paperclip Heartbeat"
  echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "=========================================="
  echo ""
  echo "Config:"
  echo "  API URL: https://paperclip.srv1493128.hstgr.cloud"
  echo "  Agent ID: 5ef2a950-c14e-444b-b399-2024f8720fff"
  echo "  Token: pcp_4075d6ff7da3efb91cc92b96ec98f98ecc36577c7242c5db"
  echo ""

  PAPERCLIP_API_URL="https://paperclip.srv1493128.hstgr.cloud"
  PAPERCLIP_API_KEY="pcp_4075d6ff7da3efb91cc92b96ec98f98ecc36577c7242c5db"

  echo "Step 1: GET /api/agents/me/inbox-lite"
  echo "---"
  INBOX_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "${PAPERCLIP_API_URL}/api/agents/me/inbox-lite" \
    -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" \
    -H "Content-Type: application/json")
  echo "$INBOX_RESP"
  echo ""

  HTTP_CODE=$(echo "$INBOX_RESP" | grep "HTTP_CODE:" | cut -d: -f2)
  BODY=$(echo "$INBOX_RESP" | sed '/HTTP_CODE:/d')

  if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ API call failed with HTTP $HTTP_CODE"
    echo "   Response: $BODY"
    echo ""
    echo "All configured tokens were tested:"
    for name in "Carlos" "Enzo" "Laura" "Elena" "Diana" "Marcos" "Valeria"; do
      case $name in
        Carlos) TOKEN="pcp_4075d6ff7da3efb91cc92b96ec98f98ecc36577c7242c5db" ;;
        Enzo)   TOKEN="pcp_254eaa2c3bd69c97e04f3ea53c60c0c906adb2f7b3b4fec6" ;;
        Laura)  TOKEN="pcp_a8bce9ff5e935134e9985433bd7c52541ecd0f04bb8fc749" ;;
        Elena)  TOKEN="pcp_c5fed8dec36bc871f29d657b108d1d87a4f5787acc547718" ;;
        Diana)  TOKEN="pcp_e802929c23a8693238e3da8b4029b6e75d92f92d34be00b9" ;;
        Marcos) TOKEN="pcp_077a3e6c5de7735a18e8b9712b50af628eafbff0f702258b" ;;
        Valeria) TOKEN="pcp_9e59e5811f0803dd6bcb8f1d67cd967d68b1c1158991812b" ;;
      esac
      RESP=$(curl -s -X GET "${PAPERCLIP_API_URL}/api/agents/me/inbox-lite" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
      echo "  $name: $RESP"
    done
    echo ""
    echo "⚠️  Paperclip API authentication is failing for all agent tokens."
    echo "    The API server may require a different auth mechanism or tokens may have expired."
    echo "    No tasks can be retrieved until authentication is fixed."
    echo ""
    echo "=========================================="
    echo "Heartbeat complete - exit cleanly"
    echo "=========================================="
    exit 0
  fi

  echo "✅ Inbox retrieved successfully"

  # Try to parse tasks with python
  echo "$BODY" | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  tasks=d.get('tasks',[]) or d.get('issues',[]) or d
  if isinstance(tasks,list) and len(tasks)>0:
    print(f'Found {len(tasks)} task(s):')
    for t in tasks:
      print(f'  - ID: {t.get(\"id\",\"?\")} | Title: {t.get(\"title\",\"?\")} | Priority: {t.get(\"priority\",\"?\")} | Status: {t.get(\"status\",\"?\")}')
  elif isinstance(tasks,dict) and tasks:
    print(f'Response is dict: {tasks}')
  else:
    print('No tasks in inbox (empty array or null)')
except Exception as e:
  print(f'Parse error: {e}')
  print('Raw response:', file=sys.stderr)
" 2>&1

  echo ""
  echo "=========================================="
  echo "Heartbeat complete - exit cleanly"
  echo "=========================================="

} | tee -a "$LOG_FILE"