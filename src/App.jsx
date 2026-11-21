import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Server, BarChart3, Shield, Ticket, Users,
  ClipboardList, Wallet, Settings, Bell, Search, ChevronDown,
  Activity, MessageSquare, Sparkles, Crown, Menu, X, Check,
  SlidersHorizontal, ArrowUpRight, ShieldCheck, Zap, Lock, Bot,
  ChevronRight
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

function LandingPage({ onLogin }) {
  const features = [
    {
      icon: ShieldCheck,
      title: "Smart Moderation",
      description: "Keep your community protected with powerful moderation tools and automated controls."
    },
    {
      icon: Ticket,
      title: "Ticket System",
      description: "Organize support requests with a clean and professional ticket experience."
    },
    {
      icon: Users,
      title: "Community Management",
      description: "Manage members, welcome new people and keep your server organized."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Understand your community with activity insights and useful statistics."
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Reduce repetitive work with systems designed to make server management easier."
    },
    {
      icon: Lock,
      title: "Secure Workspace",
      description: "Access your dashboard through your Discord account with a secure sign-in flow."
    }
  ];

  const systemCards = [
    ["Moderation", "Control and protect your server.", Shield],
    ["Ticket System", "Give members a better support experience.", Ticket],
    ["Welcome System", "Make every new member feel welcome.", Users],
    ["Activity Logs", "Keep track of important server events.", ClipboardList]
  ];

  const faqs = [
    [
      "What is JONY OS?",
      "JONY OS is a dashboard concept for managing Discord communities and their bot systems from one place."
    ],
    [
      "How do I sign in?",
      "Use the Continue with Discord button. You will be redirected to Discord to authorize your account."
    ],
    [
      "Can I manage multiple servers?",
      "The dashboard is designed to support server management. Actual server controls will become available as the bot and API integrations are connected."
    ],
    [
      "Are all dashboard statistics real?",
      "Some values currently shown in the preview are demonstration data. Live statistics require the backend and Discord bot integration."
    ],
    [
      "Is JONY OS available on mobile?",
      "Yes. The landing page and dashboard layout are designed to adapt to mobile and tablet screens."
    ]
  ];

  return (
    <div className="landing">
      <nav className="landing-nav">
        <a className="landing-brand" href="#home">
          <span className="landing-brand-icon"><Crown /></span>
          <span>JONY <em>OS</em></span>
        </a>

        <div className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#systems">Systems</a>
          <a href="#terms">Terms</a>
          <a href="#faq">FAQ</a>
        </div>

        <button className="landing-login" onClick={onLogin}>
          Login with Discord <ArrowUpRight size={16} />
        </button>
      </nav>

      <section className="hero" id="home">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            THE NEXT GENERATION DISCORD PLATFORM
          </div>

          <h1>
            Your server.
            <br />
            Your systems.
            <br />
            <span>One platform.</span>
          </h1>

          <p className="hero-description">
            Take control of your Discord community with a powerful,
            organized and modern management experience.
          </p>

          <div className="hero-actions">
            <button className="hero-primary" onClick={onLogin}>
              Continue with Discord <ArrowUpRight size={17} />
            </button>
            <a className="hero-secondary" href="#features">
              Explore features <ChevronRight size={17} />
            </a>
          </div>

          <div className="hero-trust">
            <span><Check size={14} /> Easy to use</span>
            <span><Check size={14} /> Modern dashboard</span>
            <span><Check size={14} /> Built for communities</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="robot-card">
            <div className="robot-crown"><Crown /></div>
            <div className="robot-head">
              <div className="robot-antenna" />
              <div className="robot-face">
                <span className="robot-eye" />
                <span className="robot-eye" />
                <span className="robot-mouth" />
              </div>
              <div className="robot-ear robot-ear-left" />
              <div className="robot-ear robot-ear-right" />
            </div>
            <div className="robot-body">
              <div className="robot-core"><Sparkles /></div>
            </div>
            <div className="robot-base" />
          </div>

          <div className="float-card float-card-top">
            <span className="float-icon"><ShieldCheck /></span>
            <div><b>Protection active</b><small>Systems operational</small></div>
            <span className="float-dot" />
          </div>

          <div className="float-card float-card-bottom">
            <span className="float-icon"><Activity /></span>
            <div><b>Workspace status</b><small>All systems ready</small></div>
            <span className="float-dot" />
          </div>

          <div className="hero-caption">POWERED BY JONY OS</div>
        </div>

        <a className="scroll-indicator" href="#features">
          <span /> SCROLL TO EXPLORE
        </a>
      </section>

      <section className="features-section landing-section" id="features">
        <div className="section-heading">
          <span className="section-kicker">BUILT FOR YOUR COMMUNITY</span>
          <h2>Everything you need.<br /><span>All in one place.</span></h2>
          <p>Powerful tools, organized into one simple workspace.</p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon"><Icon /></div>
              <span className="feature-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="feature-card-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="systems-section landing-section" id="systems">
        <div className="systems-intro">
          <div className="section-heading section-heading-left">
            <span className="section-kicker">YOUR CONTROL CENTER</span>
            <h2>Meet your new<br /><span>command center.</span></h2>
            <p>
              A clean workspace that brings your community tools together.
              Spend less time switching between tools and more time building.
            </p>
            <button className="hero-primary" onClick={onLogin}>
              Open your dashboard <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="dashboard-preview">
            <div className="preview-topbar">
              <div className="preview-dots"><i /><i /><i /></div>
              <span>JONY OS / DASHBOARD</span>
              <span className="preview-online">● ONLINE</span>
            </div>
            <div className="preview-layout">
              <div className="preview-sidebar">
                <div className="preview-logo"><Crown /></div>
                <span className="preview-active"><LayoutDashboard /></span>
                <span><Server /></span>
                <span><BarChart3 /></span>
                <span><Shield /></span>
                <span><Ticket /></span>
                <span><Settings /></span>
              </div>
              <div className="preview-main">
                <div className="preview-welcome">
                  <div><small>WORKSPACE / OVERVIEW</small><b>Welcome back!</b></div>
                  <div className="preview-avatar">J</div>
                </div>
                <div className="preview-stats">
                  <div><small>Servers</small><b>12</b><i>+12.8%</i></div>
                  <div><small>Members</small><b>24.8K</b><i>+8.2%</i></div>
                  <div><small>Uptime</small><b>99.9%</b><i>Stable</i></div>
                </div>
                <div className="preview-chart">
                  <div><b>Server activity</b><small>Last 7 days</small></div>
                  <div className="preview-bars">
                    {[35, 54, 44, 75, 59, 92, 77, 100, 72, 86, 64, 91].map((height, i) => (
                      <span key={i} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
                <div className="preview-bottom">
                  <div><span className="preview-status-dot" /> Moderation <small>Operational</small></div>
                  <div><span className="preview-status-dot" /> Ticket System <small>Operational</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="system-showcase">
          {systemCards.map(([title, description, Icon]) => (
            <article className="showcase-card" key={title}>
              <span><Icon /></span>
              <div><b>{title}</b><p>{description}</p></div>
              <ChevronRight />
            </article>
          ))}
        </div>
      </section>

      <section className="terms-section landing-section" id="terms">
        <div className="section-heading">
          <span className="section-kicker">PLEASE READ</span>
          <h2>Terms & <span>Conditions.</span></h2>
          <p>A few important things to know before using JONY OS.</p>
        </div>

        <div className="terms-grid">
          <article className="terms-card">
            <span>01</span>
            <h3>Account Access</h3>
            <p>You are responsible for keeping access to your Discord account secure. Sign-in is handled through Discord authorization.</p>
          </article>
          <article className="terms-card">
            <span>02</span>
            <h3>Acceptable Use</h3>
            <p>Do not use the platform to violate Discord rules, disrupt communities, or interfere with the service.</p>
          </article>
          <article className="terms-card">
            <span>03</span>
            <h3>Service Availability</h3>
            <p>Features may change as the platform develops. Availability of individual systems may depend on setup and integrations.</p>
          </article>
          <article className="terms-card">
            <span>04</span>
            <h3>Data & Privacy</h3>
            <p>Discord account information is used to provide sign-in and identify your account. Do not share your account credentials.</p>
          </article>
        </div>
        <p className="terms-note">By using JONY OS, you agree to use the platform responsibly and in accordance with applicable Discord policies.</p>
      </section>

      <section className="faq-section landing-section" id="faq">
        <div className="section-heading">
          <span className="section-kicker">GOT QUESTIONS?</span>
          <h2>Frequently asked <span>questions.</span></h2>
          <p>Quick answers to help you get started.</p>
        </div>

        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details className="faq-item" key={question}>
              <summary>{question}<ChevronDown /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div className="cta-glow" />
        <div className="cta-icon"><Crown /></div>
        <span className="section-kicker">READY WHEN YOU ARE</span>
        <h2>Take control of<br /><span>your community.</span></h2>
        <p>Your next chapter starts with one click.</p>
        <button className="hero-primary" onClick={onLogin}>
          Continue with Discord <ArrowUpRight size={17} />
        </button>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home">
          <span className="landing-brand-icon"><Crown /></span>
          <span>JONY <em>OS</em></span>
        </a>
        <p>Built for better communities.</p>
        <span>© 2026 JONY OS. All rights reserved.</span>
      </footer>
    </div>
  );
}

18.4%", MessageSquare],
    ["Bot uptime", "99.9%", "30 days", Activity]export default function App() {
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

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-crown"><Crown /></div>
        <h2>JONY <em>OS</em></h2>
        <p>Preparing your experience...</p>
        <div className="loading-line"><span /></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={login} />;
  }

  const avatar = getAvatar(user);
  const displayName = user?.global_name || user?.username || "Guest";

  const stats = [
    ["Connected servers", "12", "+12.8%", Server],
    ["Total members", "24.8K", "+8.2%", Users],
    ["Messages handled", "1.2M", "+
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
            <div className="avatar">{displayName[0]?.toUpperCase() || "J"}</div>
          )}
          <div>
            <b>{displayName}</b>
            <small>Discord Account</small>
          </div>
        </div>
      </aside>

      <main>
        <header>
          <button className="hamb" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div className="crumb">Workspace　›　<b>{page}</b></div>
          <div className="right">
            <span className="online">● All systems operational</span>
            <button className="round"><Search /></button>
            <button className="round"><Bell /></button>
            {avatar ? (
              <img className="avatar" src={avatar} alt="Discord avatar" />
            ) : (
              <div className="avatar">{displayName[0]?.toUpperCase() || "J"}</div>
            )}
          </div>
        </header>

        <div className="content">
          <div className="heading">
            <div>
              <label>WORKSPACE / {page.toUpperCase()}</label>
              <h1>{page === "Dashboard" ? `Welcome back, ${displayName} 👋` : page}</h1>
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
                    <div><b>Server activity</b><p>Member growth over the last 7 days</p></div>
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
                    <div><b>System status</b><p>Your active modules</p></div>
                    <span className="live">● LIVE</span>
                  </div>
                  {["Moderation", "Ticket System", "Welcome", "Auto Moderation", "Audit Logs"].map(item => (
                    <div className="status" key={item}>
                      <span><Check size={13} /></span>{item}<small>Operational</small>
                    </div>
                  ))}
                  <button className="link" onClick={() => setPage("Systems")}>View all systems ↗</button>
                </section>
              </div>

              <div className="grid lower">
                <section className="panel">
                  <div className="panel-head">
                    <div><b>Your servers</b><p>Recently connected Discord servers</p></div>
                    <button className="link" onClick={() => setPage("Servers")}>View all ↗</button>
                  </div>
                  {[["GE", "Galaxy Empire", "8,420"], ["AW", "Anime World", "5,210"], ["GH", "Gaming Hub", "3,840"]].map(server => (
                    <div className="server-row" key={server[1]}>
                      <div className="server-logo">{server[0]}</div>
                      <div><b>{server[1]}</b><small>{server[2]} members</small></div>
                      <span>Connected</span>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <div className="panel-head"><div><b>Recent activity</b><p>Latest workspace events</p></div></div>
                  {["Moderation action logged", "New ticket created", "Member joined the server"].map((item, i) => (
                    <div className="activity" key={item}>
                      <span>{i === 0 ? <Shield /> : i === 1 ? <Ticket /> : <Users />}</span>
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
                  <input placeholder="Find a system..." value={query} onChange={e => setQuery(e.target.value)} />
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
                        <small className={enabled[i] ? "green" : "muted"}>● {enabled[i] ? "Enabled" : "Disabled"}</small>
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
              <h2>Your Discord account is connected</h2>
              <p>Signed in as {displayName}. Your managed servers will appear here after we connect the server API.</p>
              {avatar && <img src={avatar} alt="Discord avatar" style={{ width: 64, height: 64, borderRadius: "50%" }} />}
              <p>{user.username}</p>
            </div>
          )}

          {page === "Analytics" && (

export default function App() {
  const [page, setPage] = useState("Servers");
  const [menu, setMenu] = useState(false);
  const [enabled, setEnabled] = useState(systems.map(x => x[3]));
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [servers, setServers] = useState([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [serversError, setServersError] = useState("");

  const [selectedServer, setSelectedServer] = useState(null);
  const [serverDetails, setServerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

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

  const loadServers = async () => {
    setServersLoading(true);
    setServersError("");

    try {
      const response = await fetch("/api/servers");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load servers");
      }

      setServers(result.servers || []);
    } catch (error) {
      setServersError(error.message || "Something went wrong");
    } finally {
      setServersLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadServers();
  }, [user]);

  const openServer = async server => {
    setSelectedServer(server);
    setServerDetails(null);
    setDetailsError("");
    setDetailsLoading(true);
    setPage("Server Dashboard");
    setMenu(false);

    try {
      const response = await fetch(`/api/server?id=${encodeURIComponent(server.id)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load server details");
      }

      setServerDetails(result.server);
    } catch (error) {
      setDetailsError(error.message || "Something went wrong");
    } finally {
      setDetailsLoading(false);
    }
  };

  const backToServers = () => {
    setSelectedServer(null);
    setServerDetails(null);
    setPage("Servers");
  };

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-crown"><Crown /></div>
        <h2>JONY <em>OS</em></h2>
        <p>Preparing your experience...</p>
        <div className="loading-line"><span /></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={login} />;
  }

  const avatar = getAvatar(user);
  const displayName = user?.global_name || user?.username || "Guest";

  const navigationGroups = [
    {
      title: "OVERVIEW",
      links: [["Servers", Server], ["Analytics", BarChart3]]
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

  const pageTitle = page === "Server Dashboard"
    ? selectedServer?.name || "Server Dashboard"
    : page;

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

        <button className="workspace" onClick={backToServers}>
          <div className="server-logo">
            {selectedServer?.icon
              ? <img src={selectedServer.icon} alt="" />
              : "J"}
          </div>
          <div>
            <b>{selectedServer?.name || "JONY Workspace"}</b>
            <small>{selectedServer ? "Selected server" : "Server workspace"}</small>
          </div>
          <ChevronDown size={15} />
        </button>

        {navigationGroups.map(group => (
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

        {selectedServer && (
          <section className="nav-group">
            <label>SELECTED SERVER</label>
            <button
              className={page === "Server Dashboard" ? "nav active" : "nav"}
              onClick={() => {
                setPage("Server Dashboard");
                setMenu(false);
              }}
            >
              <LayoutDashboard size={17} />
              Server Overview
            </button>
            <button className="nav" onClick={backToServers}>
              <Server size={17} />
              Change Server
            </button>
          </section>
        )}

        <div className="help">
          <b>Need a hand?</b>
          <p>Explore guides and get help setting up your bot.</p>
          <span>JONY OS Support ↗</span>
        </div>

        <div className="user">
          {avatar ? (
            <img className="avatar" src={avatar} alt="Discord avatar" />
          ) : (
            <div className="avatar">{displayName[0]?.toUpperCase() || "J"}</div>
          )}
          <div>
            <b>{displayName}</b>
            <small>Discord Account</small>
          </div>
        </div>
      </aside>

      <main>
        <header>
          <button className="hamb" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div className="crumb">
            Workspace　›　<b>{pageTitle}</b>
          </div>
          <div className="right">
            <span className="online">● Connected to Discord</span>
            <button className="round" onClick={loadServers} title="Refresh servers">
              <Activity />
            </button>
            {avatar ? (
              <img className="avatar" src={avatar} alt="Discord avatar" />
            ) : (
              <div className="avatar">{displayName[0]?.toUpperCase() || "J"}</div>
            )}
          </div>
        </header>

        <div className="content">
          <div className="heading">
            <div>
              <label>JONY OS / {pageTitle.toUpperCase()}</label>
              <h1>
                {page === "Servers"
                  ? "Your Discord servers"
                  : page === "Server Dashboard"
                    ? pageTitle
                    : page}
              </h1>
              <p>
                {page === "Servers"
                  ? "Choose a server to open its management dashboard."
                  : page === "Server Dashboard"
                    ? "Manage and monitor your selected Discord server."
                    : `Manage your ${page.toLowerCase()} workspace.`}
              </p>
            </div>

            {page === "Server Dashboard" && (
              <button className="primary" onClick={backToServers}>
                <Server size={16} /> Change server
              </button>
            )}
          </div>

          {page === "Servers" && (
            <>
              <div className="server-toolbar">
                <div>
                  <span className="live">
                    ● {servers.length} MANAGEABLE SERVERS
                  </span>
                  <p>Only servers where you have Administrator permission or ownership are shown.</p>
                </div>
                <button className="primary" onClick={loadServers} disabled={serversLoading}>
                  <Activity size={16} />
                  {serversLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {serversLoading && (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading your servers...</h2>
                  <p>Connecting to Discord and checking your server access.</p>
                </div>
              )}

              {!serversLoading && serversError && (
                <div className="panel placeholder">
                  <Shield />
                  <h2>Couldn't load your servers</h2>
                  <p>{serversError}</p>
                  <button className="primary" onClick={loadServers}>
                    Try again
                  </button>
                </div>
              )}

              {!serversLoading && !serversError && servers.length === 0 && (
                <div className="panel placeholder">
                  <Server />
                  <h2>No manageable servers found</h2>
                  <p>
                    Make sure you're the server owner or have Administrator
                    permission in at least one Discord server.
                  </p>
                  <button className="primary" onClick={loadServers}>
                    Refresh servers
                  </button>
                </div>
              )}

              {!serversLoading && !serversError && servers.length > 0 && (
                <div className="real-server-grid">
                  {servers.map(server => (
                    <article className="real-server-card" key={server.id}>
                      <div className="real-server-top">
                        {server.icon ? (
                          <img src={server.icon} alt="" className="real-server-icon" />
                        ) : (
                          <div className="real-server-icon fallback">
                            {server.name?.slice(0, 1).toUpperCase() || "S"}
                          </div>
                        )}
                        <span className={server.isBotAdded ? "bot-badge added" : "bot-badge missing"}>
                          <span />
                          {server.isBotAdded ? "BOT CONNECTED" : "BOT NOT ADDED"}
                        </span>
                      </div>

                      <h3>{server.name}</h3>
                      <p className="real-server-id">ID: {server.id}</p>

                      <div className="real-server-meta">
                        <span><Users size={15} /> {server.memberCount != null ? server.memberCount.toLocaleString() : "—"} members</span>
                        <span>{server.isOwner ? "Owner" : "Administrator"}</span>
                      </div>

                      {server.isBotAdded ? (
                        <button className="server-manage" onClick={() => openServer(server)}>
                          Manage Server <ArrowUpRight size={16} />
                        </button>
                      ) : (
                        <a
                          className="server-manage invite"
                          href={server.inviteUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Invite JONY OS <ArrowUpRight size={16} />
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {page === "Server Dashboard" && (
            <>
              <div className="server-detail-actions">
                <button className="link" onClick={backToServers}>
                  <ChevronRight size={15} /> Back to servers
                </button>
                {selectedServer?.icon && (
                  <img src={selectedServer.icon} alt="" className="detail-server-icon" />
                )}
              </div>

              {detailsLoading && (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading server dashboard...</h2>
                  <p>Retrieving server information from Discord.</p>
                </div>
              )}

              {detailsError && (
                <div className="panel placeholder">
                  <Shield />
                  <h2>Unable to open this server</h2>
                  <p>{detailsError}</p>
                  <button className="primary" onClick={() => openServer(selectedServer)}>
                    Try again
                  </button>
                </div>
              )}

              {!detailsLoading && !detailsError && serverDetails && (
                <>
                  <div className="server-detail-hero panel">
                    <div>
                      <span className="live">● BOT CONNECTED</span>
                      <h2>{serverDetails.name}</h2>
                      <p>Your server workspace is ready.</p>
                    </div>
                    {serverDetails.icon ? (
                      <img src={serverDetails.icon} alt="" className="detail-server-icon large" />
                    ) : (
                      <div className="detail-server-icon large fallback">
                        {serverDetails.name?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="stats">
                    {[
                      ["Total members", serverDetails.memberCount?.toLocaleString() ?? "—", Users],
                      ["Online members", serverDetails.onlineCount?.toLocaleString() ?? "—", Activity],
                      ["Channels", serverDetails.channelCount ?? 0, MessageSquare],
                      ["Roles", serverDetails.roleCount ?? 0, Shield]
                    ].map(([label, value, Icon]) => (
                      <div className="stat" key={label}>
                        <div className="stat-top">
                          <span className="stat-icon"><Icon /></span>
                        </div>
                        <strong>{value}</strong>
                        <p>{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid">
                    <section className="panel">
                      <div className="panel-head">
                        <div>
                          <b>Server channels</b>
                          <p>Channels returned by Discord</p>
                        </div>
                        <span className="live">{serverDetails.channels?.length || 0}</span>
                      </div>
                      <div className="server-data-list">
                        {(serverDetails.channels || []).slice(0, 12).map(channel => (
                          <div className="server-data-row" key={channel.id}>
                            <MessageSquare size={16} />
                            <span>{channel.name}</span>
                            <small>{channel.type === 4 ? "Category" : "Channel"}</small>
                          </div>
                        ))}
                        {!serverDetails.channels?.length && <p>No channels available.</p>}
                      </div>
                    </section>

                    <section className="panel">
                      <div className="panel-head">
                        <div>
                          <b>Server roles</b>
                          <p>Roles returned by Discord</p>
                        </div>
                        <span className="live">{serverDetails.roles?.length || 0}</span>
                      </div>
                      <div className="server-data-list">
                        {(serverDetails.roles || []).slice(0, 12).map(role => (
                          <div className="server-data-row" key={role.id}>
                            <Shield size={16} />
                            <span>{role.name}</span>
                            <small>{role.position}</small>
                          </div>
                        ))}
                        {!serverDetails.roles?.length && <p>No roles available.</p>}
                      </div>
                    </section>
                  </div>
                </>
              )}
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
                          onChange={() => setEnabled(old =>
                            old.map((value, index) => i === index ? !value : value)
                          )}
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

          {page === "Analytics" && (
            <div className="panel placeholder">
              <BarChart3 />
              <h2>Analytics overview</h2>
              <p>Live analytics will be connected in a later stage.</p>
            </div>
          )}

          {!["Servers", "Server Dashboard", "Systems", "Analytics"].includes(page) && (
            <div className="panel placeholder">
              <Settings />
              <h2>{page} settings</h2>
              <p>This section will be connected to the selected server in a later stage.</p>
            </div>
          )}

          <footer>
            © 2026 JONY OS
            <span>Built for better communities.</span>
            <small>CONNECTED V1.0</small>
          </footer>
        </div>
      </main>
    </div>
  );
}
