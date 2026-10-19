import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "../store/auth.store";

interface RequestLog {
  timestamp?: string;
  username?: string;
  method: string;
  uri?: string;
  url?: string;
  body: string;
}

export default function Monitor() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // 1. 스크롤 박스 DOM 참조를 위한 ref 생성
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let res = await fetch("/api/monitor", { headers });

      if (res.status === 401 && token) {
        res = await fetch("/api/monitor", {
          headers: { Accept: "application/json" },
        });
      }

      if (!res.ok) {
        throw new Error(`로그 조회 실패 (HTTP ${res.status})`);
      }

      const raw = await res.json();
      const list: RequestLog[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

      // 수집된 로그 업데이트
      setLogs([...list].reverse());
      setLastUpdated(new Date().toLocaleTimeString("ko-KR"));
    } catch (err: unknown) {
      setError((err as Error).message || "로그를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. logs 데이터가 변경(새로고침/추가)될 때마다 스크롤 박스를 최하단으로 자동 이동
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSendTestRequest = async () => {
    setTestSending(true);
    try {
      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch("/api/users/me", { headers });

      setTimeout(() => {
        fetchLogs();
        setTestSending(false);
      }, 300);
    } catch {
      setTestSending(false);
      fetchLogs();
    }
  };

  const formatUsername = (username?: string) => {
    if (!username || username === "Anonymous") return "Anonymous";
    if (/^\d+$/.test(username)) return `User #${username}`;
    return username;
  };

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e2e8f0",
        background: "#0f172a",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#f8fafc",
                margin: "0 0 4px 0",
              }}
            >
              📡 API Request Monitor
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
              서버 백엔드 로그 포맷과 일치하는 실시간 압축 한 줄 로그 뷰어입니다.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={handleSendTestRequest}
              disabled={testSending}
              style={{
                padding: "9px 16px",
                background: "#334155",
                color: "#f8fafc",
                border: "1px solid #475569",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: testSending ? "not-allowed" : "pointer",
              }}
            >
              {testSending ? "⚡ 요청 전송 중..." : "⚡ 테스트 요청 보내기"}
            </button>

            <button
              onClick={fetchLogs}
              disabled={loading}
              style={{
                padding: "9px 20px",
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: loading ? "rotate(360deg)" : "none",
                  transition: "transform 0.5s ease",
                }}
              >
                🔄
              </span>
              {loading ? "조회 중..." : "새로고침"}
            </button>
          </div>
        </div>

        {/* 상태 바 */}
        <div
          style={{
            marginBottom: 16,
            padding: "10px 16px",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          <div>
            총 수집된 로그: <span style={{ color: "#38bdf8", fontWeight: 700 }}>{logs.length}</span> 건 (최대 100건)
          </div>
          <div>
            마지막 갱신: <span style={{ color: "#f8fafc", fontWeight: 600 }}>{lastUpdated || "아직 조회되지 않음"}</span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              background: "#450a0a",
              color: "#fecaca",
              border: "1px solid #991b1b",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* 3. ref 바인딩된 고정 크기 자동 스크롤 박스 */}
        <div
          ref={scrollContainerRef}
          style={{
            background: "#020617",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: 12,
            maxHeight: "550px",
            overflowY: "auto",
            scrollBehavior: "smooth", // 부드러운 스크롤 효과
          }}
        >
          {logs.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              {loading ? <p style={{ margin: 0 }}>로그를 불러오는 중입니다...</p> : <p style={{ margin: 0 }}>수집된 API 요청 로그가 없습니다.</p>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "monospace" }}>
              {logs.map((log, idx) => {
                const method = log.method?.toUpperCase() || "UNKNOWN";
                const targetUrl = log.uri || log.url || "(no path)";
                const isExpanded = expandedIndex === idx;

                const methodColor =
                  method === "GET"
                    ? "#38bdf8"
                    : method === "POST"
                      ? "#4ade80"
                      : method === "PUT" || method === "PATCH"
                        ? "#fbbf24"
                        : method === "DELETE"
                          ? "#f87171"
                          : "#94a3b8";

                return (
                  <div
                    key={`${log.timestamp || idx}-${idx}`}
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: 13,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                        cursor: log.body ? "pointer" : "default",
                      }}
                      onClick={() => log.body && setExpandedIndex(isExpanded ? null : idx)}
                    >
                      <span style={{ color: "#64748b", fontSize: 12 }}>{log.timestamp || "-"}</span>
                      <span style={{ fontWeight: 700, color: methodColor, width: 65 }}>{method}</span>
                      <span style={{ color: "#38bdf8", fontWeight: 600 }}>👤 {formatUsername(log.username)}</span>
                      <span style={{ color: "#f8fafc", fontWeight: 500, flex: 1, wordBreak: "break-all" }}>{targetUrl}</span>
                      {log.body && (
                        <span style={{ color: "#94a3b8", fontSize: 11, background: "#0f172a", padding: "2px 6px", borderRadius: 4 }}>
                          {isExpanded ? "▲ Body 닫기" : "▼ Body 보기"}
                        </span>
                      )}
                    </div>

                    {isExpanded && log.body && (
                      <pre
                        style={{
                          margin: "6px 0 0 0",
                          padding: 10,
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 4,
                          fontSize: 12,
                          color: "#cbd5e1",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          maxHeight: 150,
                          overflowY: "auto",
                        }}
                      >
                        {log.body}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}