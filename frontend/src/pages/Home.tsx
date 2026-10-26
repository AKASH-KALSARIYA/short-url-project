import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { api, shortLink, type UrlItem } from "../api";
import { useAuth } from "../AuthContext";

type AdminUser = { _id: string; name: string; email: string; role: string };

export default function Home() {
  const { user, loading, setUser } = useAuth();
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [longUrl, setLongUrl] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<{
    shortId: string;
    totalclicks: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api.listUrls();
    setUrls(data.urls);
    if (user?.role === "ADMIN") {
      const admin = await api.adminUsers();
      setUsers(admin.users);
    }
  }

  useEffect(() => {
    if (!user) return;
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load")
    );
  }, [user]);

  if (loading) return <div className="center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCreated(null);
    setBusy(true);
    try {
      const data = await api.createUrl(longUrl);
      setCreated(data.shortUrl);
      setLongUrl("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create URL");
    } finally {
      setBusy(false);
    }
  }

  async function onAnalytics(shortId: string) {
    try {
      const data = await api.analytics(shortId);
      setAnalytics({ shortId, totalclicks: data.totalclicks });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analytics failed");
    }
  }

  async function onLogout() {
    await api.logout();
    setUser(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand">ShortURL</p>
          <p className="muted small">
            {user.email} · {user.role}
          </p>
        </div>
        <button type="button" className="ghost" onClick={() => void onLogout()}>
          Logout
        </button>
      </header>

      <main className="main">
        <section className="hero-block">
          <h1>Shorten any link</h1>
          <p className="muted">Paste a URL, get a compact shareable link.</p>
          <form onSubmit={onCreate} className="create-row">
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/path"
              required
            />
            <button type="submit" disabled={busy}>
              {busy ? "Generating…" : "Generate"}
            </button>
          </form>
          {created && (
            <p className="success">
              Created:{" "}
              <a href={created} target="_blank" rel="noreferrer">
                {created}
              </a>
            </p>
          )}
          {error && <p className="error">{error}</p>}
        </section>

        <section>
          <h2>Your links</h2>
          {urls.length === 0 ? (
            <p className="muted">No links yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Short ID</th>
                    <th>Redirect URL</th>
                    <th>Clicks</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>
                        <a
                          href={shortLink(item.shortId)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.shortId}
                        </a>
                      </td>
                      <td className="truncate">{item.redirectURL}</td>
                      <td>{item.visitedHistory?.length || 0}</td>
                      <td>
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => void onAnalytics(item.shortId)}
                        >
                          Analytics
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {analytics && (
            <p className="success">
              Analytics for <strong>{analytics.shortId}</strong>:{" "}
              {analytics.totalclicks} total clicks
            </p>
          )}
        </section>

        {user.role === "ADMIN" && (
          <section>
            <h2>Users (Admin)</h2>
            <ul className="user-list">
              {users.map((u) => (
                <li key={u._id}>
                  <span>{u.name || "—"}</span>
                  <span className="muted">{u.email}</span>
                  <span className="badge">{u.role}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
