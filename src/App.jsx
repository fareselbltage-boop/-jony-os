
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Server, BarChart3, Shield, Ticket, Users,
  ClipboardList, Wallet, Settings, Bell, Search, ChevronDown,
  Activity, MessageSquare, Sparkles, Crown, Menu, X, Check,
  SlidersHorizontal
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip
} from "recharts";

const data = [
  { day: "Mon", members: 420 },
  { day: "Tue", members: 610 },
  { day: "Wed", members: 540 },
  { day: "Thu", members: 890 },
  { day: "Fri", members: 720 },
  { day: "Sat", members: 1120 },
  { day: "Sun", members: 980 }
];

const groups = [
  {
    title: "OVERVIEW",
    links: [["Dashboard", LayoutDashboard], ["Servers", Server], ["Analytics", BarChart3]]
  },
  {
    title: "MANAGEMENT",
    links: [
      ["Systems", SlidersHorizontal],
      ["Moderation", Shield],
      ["Tickets", Ticket],
      ["Welcome", Users],
      ["Logs", ClipboardList],
      ["Economy", Wallet]
    ]
  },
  {
    title: "PREFERENCES",
    links: [["Settings", Settings]]
  }
];

const systems = [
  ["Moderation", "Protect your community with moderation tools.", Shield, true],
  ["Ticket System", "Private support channels for your members.", Ticket, true],
  ["Welcome", "Custom greetings for new members.", Users, true],
  ["Auto Moderation", "Automatically catch spam and unwanted links.", Shield, false],
  ["Leveling", "Reward members for being active.", Activity, false],
  ["Suggestions", "Collect and vote on community ideas.", MessageSquare, true]
];

function getAvatar(user) {
  if (!user?.avatar) return null;

  const extension = user.avatar.startsWith("a_") ? "gif" : "png";

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [menu, setMenu] = useState(false);
  const [enabled, setEnabled] = useState(systems.map(x => x[3]));
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then(async response => {
        if (!response.ok) return null;
        return response.json();
      })
      .then(result => {
        if (active && result?.authenticated && result.user) {
          setUser(result.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = () => {
    window.location.href = "/api/auth/login";
  };

  const avatar = getAvatar(user);
  const displayName = user?.global_name || user?.username || "Guest";

  const stats = [
    ["Connected servers", "12", "+12.8%", Server],
    ["Total members", "24.8K", "+8.2%", Users],
    ["Messages handled", "1.2M", "+18.4%", MessageSquare],
    ["Bot uptime", "99.9%", "30 days", Activity]
  ];

  return (
    <div className="app">
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}

      <aside className={menu ? "sidebar show" : "sidebar"}>
        <div className="brand">
          <div className="brand-icon"><Crown /></div>
          <div>
            <b>JONY <em>OS</em></b>
            <small>DISCORD BOT PLATFORM</small>
          </div>
          <button className="close" onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>

        <div className="workspace">
          <div className="server-logo">J</div>
          <div>
            <b>JONY Workspace</b>
            <small>Free workspace</small>
          </div>
          <ChevronDown size={15} />
        </div>

        {groups.map(group => (
          <section className="nav-group" key={group.title}>
            <label>{group.title}</label>

            {group.links.map(([name, Icon]) => (
              <button
                className={page === name ? "nav active" : "nav"}
                key={name}
                onClick={() => {
                  setPage(name);
                  setMenu(false);
                }}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
          </section>
        ))}

        <div className="help">
          <b>Need a hand?</b>
          <p>Explore guides and get help setting up your bot.</p>
          <span>Visit help center ↗</span>
        </div>

        <div className="user">
          {avatar ? (
            <img className="avatar" src={avatar} alt="Discord avatar" />
          ) : (
            <div className="avatar">{user ? displayName[0]?.toUpperCase() : "J"}</div>
          )}

          <div>
            <b>{user ? displayName : "JONY Admin"}</b>
            <small>{user ? "Discord Account" : "Administrator"}</small>
          </div>
        </div>
      </aside>

      <main>
        <header>
          <button className="hamb" onClick={() => setMenu(true)}>
            <Menu />
          </button>

          <div className="crumb">
            Workspace　›　<b>{page}</b>
          </div>

          <div className="right">
            <span className="online">● All systems operational</span>
            <button className="round"><Search /></button>
            <button className="round"><Bell /></button>

            {avatar ? (
              <img className="avatar" src={avatar} alt="Discord avatar" />
            ) : (
              <div className="avatar">J</div>
            )}
          </div>
        </header>

        <div className="content">
          <div className="heading">
            <div>
              <label>WORKSPACE / {page.toUpperCase()}</label>

              <h1>
                {page === "Dashboard"
                  ? user
                    ? `Welcome back, ${displayName} 👋`
                    : "Welcome to JONY OS 👋"
                  : page}
              </h1>

              <p>
                {page === "Dashboard"
                  ? "Here's what's happening with your Discord bot today."
                  : `Manage and configure your ${page.toLowerCase()} workspace.`}
              </p>
            </div>

            <button className="primary" onClick={() => setPage("Systems")}>
              <Sparkles size={16} /> Customize dashboard
            </button>
          </div>

          {page === "Dashboard" && (
            <>
              <div className="stats">
                {stats.map(([label, value, change, Icon]) => (
                  <div className="stat" key={label}>
                    <div className="stat-top">
                      <span className="stat-icon"><Icon /></span>
                      <small>↗ {change}</small>
                    </div>
                    <strong>{value}</strong>
                    <p>{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid">
                <section className="panel chart">
                  <div className="panel-head">
                    <div>
                      <b>Server activity</b>
                      <p>Member growth over the last 7 days</p>
                    </div>
                    <button className="select">Last 7 days⌄</button>
                  </div>

                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9b78ff" stopOpacity=".35" />
                            <stop offset="100%" stopColor="#9b78ff" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#252740" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "#8589a5", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#8589a5", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#17182c", border: "1px solid #393451", borderRadius: 10 }} />
                        <Area type="monotone" dataKey="members" stroke="#a78bfa" strokeWidth={3} fill="url(#fill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <b>System status</b>
                      <p>Your active modules</p>
                    </div>
                    <span className="live">● LIVE</span>
                  </div>

                  {["Moderation", "Ticket System", "Welcome", "Auto Moderation", "Audit Logs"].map(item => (
                    <div className="status" key={item}>
                      <span><Check size={13} /></span>
                      {item}
                      <small>Operational</small>
                    </div>
                  ))}

                  <button className="link" onClick={() => setPage("Systems")}>
                    View all systems ↗
                  </button>
                </section>
              </div>

              <div className="grid lower">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <b>Your servers</b>
                      <p>Recently connected Discord servers</p>
                    </div>
                    <button className="link" onClick={() => setPage("Servers")}>
                      View all ↗
                    </button>
                  </div>

                  {[["GE", "Galaxy Empire", "8,420"], ["AW", "Anime World", "5,210"], ["GH", "Gaming Hub", "3,840"]].map(server => (
                    <div className="server-row" key={server[1]}>
                      <div className="server-logo">{server[0]}</div>
                      <div>
                        <b>{server[1]}</b>
                        <small>{server[2]} members</small>
                      </div>
                      <span>Connected</span>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <b>Recent activity</b>
                      <p>Latest workspace events</p>
                    </div>
                  </div>

                  {["Moderation action logged", "New ticket created", "Member joined the server"].map((item, i) => (
                    <div className="activity" key={item}>
                      <span>
                        {i === 0 ? <Shield /> : i === 1 ? <Ticket /> : <Users />}
                      </span>
                      <div>
                        <b>{item}</b>
                        <small>{["Galaxy Empire · 2 min ago", "Anime World · 18 min ago", "Gaming Hub · 42 min ago"][i]}</small>
                      </div>
                    </div>
                  ))}
                </section>
              </div>

              <div className="banner">
                <Crown />
                <div>
                  <b>Make community management effortless.</b>
                  <p>Explore JONY OS systems and build your perfect server experience.</p>
                </div>
                <button onClick={() => setPage("Systems")}>Explore systems ↗</button>
              </div>
            </>
          )}

          {page === "Systems" && (
            <>
              <div className="toolbar">
                <div className="search">
                  <Search size={16} />
                  <input
                    placeholder="Find a system..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>
                <span className="live">{enabled.filter(Boolean).length} ACTIVE</span>
              </div>

              <div className="system-grid">
                {systems.map(([name, desc, Icon], i) =>
                  name.toLowerCase().includes(query.toLowerCase()) && (
                    <section className="panel system" key={name}>
                      <div className="system-top">
                        <span className="system-icon"><Icon /></span>
                        <input
                          type="checkbox"
                          checked={enabled[i]}
                          onChange={() => setEnabled(old => old.map((value, index) => i === index ? !value : value))}
                        />
                      </div>
                      <b>{name}</b>
                      <p>{desc}</p>
                      <div className="system-bottom">
                        <small className={enabled[i] ? "green" : "muted"}>
                          ● {enabled[i] ? "Enabled" : "Disabled"}
                        </small>
                        <button className="link">Configure ›</button>
                      </div>
                    </section>
                  )
                )}
              </div>
            </>
          )}

          {page === "Servers" && (
            <div className="panel placeholder">
              <Server />
              <h2>{user ? "Your Discord account is connected" : "Connect your Discord account"}</h2>

              <p>
                {user
                  ? `Signed in as ${displayName}. Your managed servers will appear here after we connect the server API.`
                  : "Sign in with Discord to connect your account and prepare your server dashboard."}
              </p>

              {!user && (
                <button className="primary" onClick={login} disabled={authLoading}>
                  {authLoading ? "Checking login..." : "Connect Discord"}
                </button>
              )}

              {user && (
                <div style={{ marginTop: 20 }}>
                  {avatar && (
                    <img
                      src={avatar}
                      alt="Discord avatar"
                      style={{ width: 64, height: 64, borderRadius: "50%" }}
                    />
                  )}
                  <p>{user.username}</p>
                </div>
              )}
            </div>
          )}

          {page === "Analytics" && (
            <div className="panel placeholder">
              <BarChart3 />
              <h2>Analytics overview</h2>
              <p>Charts will show real server activity after connecting the bot and database.</p>
            </div>
          )}

          {!["Dashboard", "Systems", "Servers", "Analytics"].includes(page) && (
            <div className="panel placeholder">
              <Settings />
              <h2>{page} settings</h2>
              <p>This section is included in the dashboard layout. We'll connect its working controls in the next stage.</p>
            </div>
          )}

          <footer>
            © 2026 JONY OS
            <span>Built for better communities.</span>
            <small>PREVIEW V1.0</small>
          </footer>
        </div>
      </main>
    </div>
  );
}
