import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Server,
  BarChart3,
  Shield,
  Ticket,
  Users,
  ClipboardList,
  Wallet,
  Settings,
  Search,
  ChevronDown,
  Activity,
  MessageSquare,
  Sparkles,
  Crown,
  Menu,
  X,
  Check,
  SlidersHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  RefreshCw,
  Hash,
  Volume2,
  Folder,
  Percent
} from "lucide-react";

const systems = [
  ["Moderation", "Protect your community with moderation tools.", Shield, true],
  ["Ticket System", "Private support channels for your members.", Ticket, true],
  ["Welcome", "Custom greetings for new members.", Users, true],
  ["Auto Moderation", "Automatically catch spam and unwanted links.", Shield, false],
  ["Leveling", "Reward members for being active.", Activity, false],
  ["Suggestions", "Collect and vote on community ideas.", MessageSquare, true]
];

const systemKeys = [
  "moderation",
  "tickets",
  "welcome",
  "automod",
  "leveling",
  "suggestions"
];

const DEFAULT_SETTINGS = {
  prefix: "-",
  systems: {
    moderation: true,
    tickets: true,
    welcome: true,
    automod: false,
    leveling: false,
    suggestions: true
  },
  moderation: {},
  tickets: {
    commands: {
      rename: { enabled: true, aliases: ["rename"] },
      add: { enabled: true, aliases: ["add"] },
      remove: { enabled: true, aliases: ["remove"] },
      close: { enabled: true, aliases: ["close"] },
      delete: { enabled: true, aliases: ["delete"] }
    }
  },
  welcome: {},
  economy: {},
  logs: {}
};

function getAvatar(user) {
  if (!user?.avatar) return null;

  const extension = user.avatar.startsWith("a_") ? "gif" : "png";

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  perPage,
  label
}) {
  if (totalItems <= perPage) return null;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  const buttonStyle = {
    minWidth: "34px",
    height: "34px",
    padding: "0 10px",
    borderRadius: "8px",
    border: "1px solid rgba(145,90,255,0.3)",
    background: "rgba(145,90,255,0.13)",
    color: "#c7a8ff",
    cursor: "pointer",
    fontSize: "13px"
  };

  const activeStyle = {
    ...buttonStyle,
    background: "#8050d8",
    borderColor: "#9869ef",
    color: "#ffffff"
  };

  const disabledStyle = {
    ...buttonStyle,
    opacity: 0.35,
    cursor: "not-allowed"
  };

  return (
    <div
      className="pagination"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        flexWrap: "wrap",
        marginTop: "16px",
        paddingTop: "14px",
        borderTop: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <span
        style={{
          color: "#aaa4b8",
          fontSize: "12px"
        }}
      >
        Showing {start}–{end} of {totalItems} {label}
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          flexWrap: "wrap"
        }}
      >
        <button
          type="button"
          style={currentPage === 1 ? disabledStyle : buttonStyle}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ‹
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => (
          <button
            type="button"
            key={number}
            style={currentPage === number ? activeStyle : buttonStyle}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          style={currentPage === totalPages ? disabledStyle : buttonStyle}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
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
      "JONY OS is a dashboard for managing Discord communities and their bot systems from one place."
    ],
    [
      "How do I sign in?",
      "Use the Continue with Discord button. You will be redirected to Discord to authorize your account."
    ],
    [
      "Can I manage multiple servers?",
      "Yes. The dashboard supports multiple servers where you have ownership or Administrator permission."
    ],
    [
      "Are all dashboard statistics real?",
      "Server information is retrieved through the connected Discord API. Some future features are still being developed."
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
            <div>
              <b>Protection active</b>
              <small>Systems operational</small>
            </div>
            <span className="float-dot" />
          </div>

          <div className="float-card float-card-bottom">
            <span className="float-icon"><Activity /></span>
            <div>
              <b>Workspace status</b>
              <small>All systems ready</small>
            </div>
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
          <h2>
            Everything you need.
            <br />
            <span>All in one place.</span>
          </h2>
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

            <h2>
              Meet your new
              <br />
              <span>command center.</span>
            </h2>

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
                  <div>
                    <small>WORKSPACE / OVERVIEW</small>
                    <b>Welcome back!</b>
                  </div>
                  <div className="preview-avatar">J</div>
                </div>

                <div className="preview-stats">
                  <div><small>Servers</small><b>12</b><i>+12.8%</i></div>
                  <div><small>Members</small><b>24.8K</b><i>+8.2%</i></div>
                  <div><small>Uptime</small><b>99.9%</b><i>Stable</i></div>
                </div>

                <div className="preview-chart">
                  <div>
                    <b>Server activity</b>
                    <small>Last 7 days</small>
                  </div>

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
              <div>
                <b>{title}</b>
                <p>{description}</p>
              </div>
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
            <p>
              You are responsible for keeping access to your Discord account
              secure. Sign-in is handled through Discord authorization.
            </p>
          </article>

          <article className="terms-card">
            <span>02</span>
            <h3>Acceptable Use</h3>
            <p>
              Do not use the platform to violate Discord rules, disrupt
              communities, or interfere with the service.
            </p>
          </article>

          <article className="terms-card">
            <span>03</span>
            <h3>Service Availability</h3>
            <p>
              Features may change as the platform develops. Availability of
              individual systems may depend on setup and integrations.
            </p>
          </article>

          <article className="terms-card">
            <span>04</span>
            <h3>Data & Privacy</h3>
            <p>
              Discord account information is used to provide sign-in and
              identify your account. Do not share your account credentials.
            </p>
          </article>
        </div>

        <p className="terms-note">
          By using JONY OS, you agree to use the platform responsibly and in
          accordance with applicable Discord policies.
        </p>
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

        <h2>
          Take control of
          <br />
          <span>your community.</span>
        </h2>

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
function AnalyticsView({
  selectedServer,
  serverDetails,
  loading,
  error,
  onRefresh,
  onChooseServer
}) {
  if (!selectedServer) {
    return (
      <div className="panel placeholder">
        <BarChart3 />
        <h2>Select a server first</h2>
        <p>
          Choose one of your Discord servers to view its live analytics.
        </p>

        <button className="primary" onClick={onChooseServer}>
          <Server size={16} />
          Choose Server
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel placeholder">
        <Activity className="spin" />
        <h2>Loading analytics...</h2>
        <p>Retrieving live server statistics from Discord.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel placeholder">
        <Shield />
        <h2>Analytics unavailable</h2>
        <p>{error}</p>

        <button className="primary" onClick={onRefresh}>
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  if (!serverDetails) {
    return (
      <div className="panel placeholder">
        <BarChart3 />
        <h2>No analytics data</h2>
        <p>Refresh the analytics to retrieve the current server data.</p>

        <button className="primary" onClick={onRefresh}>
          <RefreshCw size={16} />
          Load Analytics
        </button>
      </div>
    );
  }

  const channels = serverDetails.channels || [];

  const categories = channels.filter(channel => channel.type === 4);
  const textChannels = channels.filter(channel =>
    [0, 5, 10, 11, 12, 15].includes(channel.type)
  );
  const voiceChannels = channels.filter(channel =>
    [2, 13].includes(channel.type)
  );

  const memberCount = Number(serverDetails.memberCount || 0);
  const onlineCount = Number(serverDetails.onlineCount || 0);

  const onlinePercentage = memberCount > 0
    ? Math.min(100, Math.round((onlineCount / memberCount) * 100))
    : 0;

  const stats = [
    {
      label: "Total Members",
      value: memberCount.toLocaleString(),
      icon: Users,
      description: "Current server members"
    },
    {
      label: "Online Members",
      value: onlineCount.toLocaleString(),
      icon: Activity,
      description: `${onlinePercentage}% currently online`
    },
    {
      label: "Channels",
      value: channels.length.toLocaleString(),
      icon: MessageSquare,
      description: "All server channels"
    },
    {
      label: "Roles",
      value: Number(serverDetails.roleCount || 0).toLocaleString(),
      icon: Shield,
      description: "Server roles"
    }
  ];

  const channelStats = [
    {
      label: "Text Channels",
      value: textChannels.length,
      icon: Hash
    },
    {
      label: "Voice Channels",
      value: voiceChannels.length,
      icon: Volume2
    },
    {
      label: "Categories",
      value: categories.length,
      icon: Folder
    }
  ];

  return (
    <div className="analytics-page">
      <div
        className="panel"
        style={{
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <span className="live">● LIVE DATA</span>
          <h2 style={{ marginTop: "8px" }}>
            {serverDetails.name}
          </h2>
          <p>
            Real-time information retrieved from Discord.
          </p>
        </div>

        <button
          className="primary"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "spin" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="stats">
        {stats.map(({ label, value, icon: Icon, description }) => (
          <div className="stat" key={label}>
            <div className="stat-top">
              <span className="stat-icon">
                <Icon />
              </span>

              <span
                style={{
                  fontSize: "11px",
                  color: "#73e6a2",
                  background: "rgba(80,220,140,0.08)",
                  padding: "5px 8px",
                  borderRadius: "7px"
                }}
              >
                LIVE
              </span>
            </div>

            <strong>{value}</strong>
            <p>{label}</p>

            <small
              style={{
                display: "block",
                marginTop: "6px",
                color: "#777181",
                fontSize: "11px"
              }}
            >
              {description}
            </small>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
          gap: "18px",
          marginTop: "18px"
        }}
      >
        <section className="panel">
          <div className="panel-head">
            <div>
              <b>Member Presence</b>
              <p>Current online member ratio</p>
            </div>

            <span className="live">
              <Percent size={13} />
              {onlinePercentage}%
            </span>
          </div>

          <div
            style={{
              marginTop: "24px",
              height: "12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${onlinePercentage}%`,
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(90deg, #6f42c1, #a66cff)",
                transition: "width 0.4s ease"
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "12px",
              color: "#9b95a8",
              fontSize: "12px"
            }}
          >
            <span>
              {onlineCount.toLocaleString()} online
            </span>

            <span>
              {Math.max(memberCount - onlineCount, 0).toLocaleString()} not online
            </span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <b>Server Status</b>
              <p>Current connection state</p>
            </div>

            <span className="live">CONNECTED</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "18px"
            }}
          >
            <div className="server-data-row">
              <Activity size={16} />
              <span>Discord API</span>
              <small style={{ color: "#73e6a2" }}>Online</small>
            </div>

            <div className="server-data-row">
              <Server size={16} />
              <span>Bot Connection</span>
              <small style={{ color: "#73e6a2" }}>Connected</small>
            </div>

            <div className="server-data-row">
              <BarChart3 size={16} />
              <span>Analytics</span>
              <small style={{ color: "#73e6a2" }}>Live</small>
            </div>
          </div>
        </section>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "18px",
          marginTop: "18px"
        }}
      >
        {channelStats.map(({ label, value, icon: Icon }) => (
          <section className="panel" key={label}>
            <div className="stat-top">
              <span className="stat-icon">
                <Icon />
              </span>
            </div>

            <strong
              style={{
                display: "block",
                fontSize: "28px",
                marginTop: "14px"
              }}
            >
              {value}
            </strong>

            <p>{label}</p>
          </section>
        ))}
      </div>

      <section className="panel" style={{ marginTop: "18px" }}>
        <div className="panel-head">
          <div>
            <b>Channel Distribution</b>
            <p>Current channel structure in this server</p>
          </div>

          <span className="live">
            {channels.length} TOTAL
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px"
          }}
        >
          {[
            ["Text Channels", textChannels.length, Hash],
            ["Voice Channels", voiceChannels.length, Volume2],
            ["Categories", categories.length, Folder]
          ].map(([label, value, Icon]) => {
            const percentage = channels.length
              ? Math.round((value / channels.length) * 100)
              : 0;

            return (
              <div key={label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#d5d0dd",
                      fontSize: "13px"
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </span>

                  <span
                    style={{
                      color: "#9d95aa",
                      fontSize: "12px"
                    }}
                  >
                    {value} · {percentage}%
                  </span>
                </div>

                <div
                  style={{
                    height: "8px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.05)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg, #6f42c1, #a66cff)"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div
        className="panel"
        style={{
          marginTop: "18px",
          borderColor: "rgba(145,90,255,0.22)"
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              background: "rgba(145,90,255,0.12)",
              color: "#b78cff",
              flexShrink: 0
            }}
          >
            <BarChart3 size={18} />
          </div>

          <div>
            <b>Historical Analytics</b>
            <p style={{ marginTop: "5px" }}>
              Member growth, messages, commands, tickets, moderation
              activity and heatmaps will become available once JONY OS
              starts recording server events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("Servers");
  const [menu, setMenu] = useState(false);
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

  const [rolePage, setRolePage] = useState(1);
  const [channelPage, setChannelPage] = useState(1);

  const [guildSettings, setGuildSettings] = useState(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");

  const rolesPerPage = 8;
  const channelsPerPage = 8;

  const allRoles = serverDetails?.roles || [];
  const allChannels = serverDetails?.channels || [];

  const totalRolePages = Math.max(
    1,
    Math.ceil(allRoles.length / rolesPerPage)
  );

  const totalChannelPages = Math.max(
    1,
    Math.ceil(allChannels.length / channelsPerPage)
  );

  const displayedRoles = allRoles.slice(
    (rolePage - 1) * rolesPerPage,
    rolePage * rolesPerPage
  );

  const displayedChannels = allChannels.slice(
    (channelPage - 1) * channelsPerPage,
    channelPage * channelsPerPage
  );

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

      const sortedServers = [...(result.servers || [])].sort(
        (a, b) => Number(Boolean(b.isBotAdded)) - Number(Boolean(a.isBotAdded))
      );

      setServers(sortedServers);
    } catch (error) {
      setServersError(error.message || "Something went wrong");
    } finally {
      setServersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadServers();
    }
  }, [user]);

  const fetchServerDetails = async serverId => {
    const response = await fetch(
      `/api/server?id=${encodeURIComponent(serverId)}`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not load server details");
    }

    return result.server;
  };

  const loadGuildSettings = async serverId => {
    setSettingsLoading(true);
    setSettingsError("");
    setSettingsMessage("");

    try {
      const response = await fetch(
        `/api/settings?id=${encodeURIComponent(serverId)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load settings");
      }

      const saved = result.settings || {};

      setGuildSettings({
        ...DEFAULT_SETTINGS,
        ...saved,
        systems: {
          ...DEFAULT_SETTINGS.systems,
          ...(saved.systems || {})
        },
        tickets: {
          ...DEFAULT_SETTINGS.tickets,
          ...(saved.tickets || {}),
          commands: {
            ...DEFAULT_SETTINGS.tickets.commands,
            ...(saved.tickets?.commands || {})
          }
        }
      });
    } catch (error) {
      setSettingsError(error.message || "Could not load settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveGuildSettings = async settingsToSave => {
    if (!selectedServer) return false;

    setSettingsSaving(true);
    setSettingsError("");
    setSettingsMessage("");

    try {
      const response = await fetch(
        `/api/settings?id=${encodeURIComponent(selectedServer.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            settings: settingsToSave
          })
        }
      );
            const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save settings");
      }

      setSettingsMessage("Settings saved successfully.");
      return true;
    } catch (error) {
      setSettingsError(error.message || "Could not save settings");
      return false;
    } finally {
      setSettingsSaving(false);
    }
  };

  const updateSystem = async (key, value) => {
    const nextSettings = {
      ...guildSettings,
      systems: {
        ...guildSettings.systems,
        [key]: value
      }
    };

    setGuildSettings(nextSettings);

    if (!selectedServer) return;

    await saveGuildSettings(nextSettings);
  };

  const updateTicketCommand = (command, key, value) => {
    setGuildSettings(old => ({
      ...old,
      tickets: {
        ...(old.tickets || {}),
        commands: {
          ...(old.tickets?.commands || {}),
          [command]: {
            ...(old.tickets?.commands?.[command] || {}),
            [key]: value
          }
        }
      }
    }));

    setSettingsError("");
    setSettingsMessage("");
  };

  const openServer = async server => {
    setSelectedServer(server);
    setServerDetails(null);
    setDetailsError("");
    setDetailsLoading(true);
    setRolePage(1);
    setChannelPage(1);
    setPage("Server Dashboard");
    setMenu(false);

    setGuildSettings(DEFAULT_SETTINGS);
    loadGuildSettings(server.id);

    try {
      const details = await fetchServerDetails(server.id);
      setServerDetails(details);
    } catch (error) {
      setDetailsError(error.message || "Something went wrong");
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedServer) return;

    setDetailsLoading(true);
    setDetailsError("");

    try {
      const details = await fetchServerDetails(selectedServer.id);
      setServerDetails(details);
    } catch (error) {
      setDetailsError(error.message || "Could not load analytics");
    } finally {
      setDetailsLoading(false);
    }
  };

  const backToServers = () => {
    setSelectedServer(null);
    setServerDetails(null);
    setDetailsError("");
    setSettingsError("");
    setSettingsMessage("");
    setRolePage(1);
    setChannelPage(1);
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
      links: [
        ["Servers", Server],
        ["Analytics", BarChart3]
      ]
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
      links: [
        ["Settings", Settings]
      ]
    }
  ];

  const pageTitle = page === "Server Dashboard"
    ? selectedServer?.name || "Server Dashboard"
    : page;

  return (
    <div className="app">
      {menu && (
        <div
          className="scrim"
          onClick={() => setMenu(false)}
        />
      )}

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
            {selectedServer?.icon ? (
              <img src={selectedServer.icon} alt="" />
            ) : (
              "J"
            )}
          </div>

          <div>
            <b>{selectedServer?.name || "JONY Workspace"}</b>
            <small>
              {selectedServer ? "Selected server" : "Server workspace"}
            </small>
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
            <div className="avatar">
              {displayName[0]?.toUpperCase() || "J"}
            </div>
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

            <button
              className="round"
              onClick={loadServers}
              title="Refresh servers"
            >
              <Activity />
            </button>

            {avatar ? (
              <img className="avatar" src={avatar} alt="Discord avatar" />
            ) : (
              <div className="avatar">
                {displayName[0]?.toUpperCase() || "J"}
              </div>
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
                    : page === "Analytics"
                      ? "Monitor your selected Discord server with live statistics."
                      : page === "Settings"
                        ? "Configure and save your server preferences."
                        : `Manage your ${page.toLowerCase()} workspace.`}
              </p>
            </div>

            {page === "Server Dashboard" && (
              <button className="primary" onClick={backToServers}>
                <Server size={16} />
                Change server
              </button>
            )}

            {page === "Analytics" && selectedServer && (
              <button
                className="primary"
                onClick={loadAnalytics}
                disabled={detailsLoading}
              >
                <RefreshCw
                  size={16}
                  className={detailsLoading ? "spin" : ""}
                />
                {detailsLoading ? "Refreshing..." : "Refresh Analytics"}
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

                  <p>
                    Only servers where you have Administrator permission
                    or ownership are shown.
                  </p>
                </div>

                <button
                  className="primary"
                  onClick={loadServers}
                  disabled={serversLoading}
                >
                  <Activity size={16} />
                  {serversLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {serversLoading && (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading your servers...</h2>
                  <p>
                    Connecting to Discord and checking your server access.
                  </p>
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
                          <img
                            src={server.icon}
                            alt=""
                            className="real-server-icon"
                          />
                        ) : (
                          <div className="real-server-icon fallback">
                            {server.name?.slice(0, 1).toUpperCase() || "S"}
                          </div>
                        )}

                        <span
                          className={
                            server.isBotAdded
                              ? "bot-badge added"
                              : "bot-badge missing"
                          }
                        >
                          <span />
                          {server.isBotAdded
                            ? "BOT CONNECTED"
                            : "BOT NOT ADDED"}
                        </span>
                      </div>

                      <h3>{server.name}</h3>

                      <p className="real-server-id">
                        ID: {server.id}
                      </p>

                      <div className="real-server-meta">
                        <span>
                          <Users size={15} />
                          {server.memberCount != null
                            ? server.memberCount.toLocaleString()
                            : "—"} members
                        </span>

                        <span>
                          {server.isOwner ? "Owner" : "Administrator"}
                        </span>
                      </div>

                      {server.isBotAdded ? (
                        <button
                          className="server-manage"
                          onClick={() => openServer(server)}
                        >
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
                  <ChevronRight size={15} />
                  Back to servers
                </button>

                {selectedServer?.icon && (
                  <img
                    src={selectedServer.icon}
                    alt=""
                    className="detail-server-icon"
                  />
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

                  <button
                    className="primary"
                    onClick={() => openServer(selectedServer)}
                    disabled={!selectedServer}
                  >
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
                      <img
                        src={serverDetails.icon}
                        alt=""
                        className="detail-server-icon large"
                      />
                    ) : (
                      <div className="detail-server-icon large fallback">
                        {serverDetails.name?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="stats">
                    {[
                      [
                        "Total members",
                        serverDetails.memberCount?.toLocaleString() ?? "—",
                        Users
                      ],
                      [
                        "Online members",
                        serverDetails.onlineCount?.toLocaleString() ?? "—",
                        Activity
                      ],
                      [
                        "Channels",
                        serverDetails.channelCount ?? 0,
                        MessageSquare
                      ],
                      [
                        "Roles",
                        serverDetails.roleCount ?? 0,
                        Shield
                      ]
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
                          <p>
                            Showing {displayedChannels.length} of {allChannels.length} channels
                          </p>
                        </div>

                        <span className="live">
                          {allChannels.length}
                        </span>
                      </div>

                      <div className="server-data-list">
                        {displayedChannels.map(channel => (
                          <div className="server-data-row" key={channel.id}>
                            <MessageSquare size={16} />
                            <span>{channel.name}</span>
                            <small>
                              {channel.type === 4 ? "Category" : "Channel"}
                            </small>
                          </div>
                        ))}

                        {!allChannels.length && (
                          <p>No channels available.</p>
                        )}
                      </div>

                      <Pagination
                        currentPage={channelPage}
                        totalPages={totalChannelPages}
                        onPageChange={setChannelPage}
                        totalItems={allChannels.length}
                        perPage={channelsPerPage}
                        label="channels"
                      />
                    </section>

                    <section className="panel">
                      <div className="panel-head">
                        <div>
                          <b>Server roles</b>
                          <p>
                            Showing {displayedRoles.length} of {allRoles.length} roles
                          </p>
                        </div>

                        <span className="live">
                          {allRoles.length}
                        </span>
                      </div>

                      <div className="server-data-list">
                        {displayedRoles.map(role => (
                          <div className="server-data-row" key={role.id}>
                            <Shield size={16} />
                            <span>{role.name}</span>
                            <small>{role.position}</small>
                          </div>
                        ))}

                        {!allRoles.length && (
                          <p>No roles available.</p>
                        )}
                      </div>

                      <Pagination
                        currentPage={rolePage}
                        totalPages={totalRolePages}
                        onPageChange={setRolePage}
                        totalItems={allRoles.length}
                        perPage={rolesPerPage}
                        label="roles"
                      />
                    </section>
                  </div>
                </>
              )}
            </>
          )}

          {page === "Systems" && (
            <>
              {!selectedServer ? (
                <div className="panel placeholder">
                  <Settings />
                  <h2>Select a server first</h2>
                  <p>Choose a server before changing its systems.</p>
                  <button className="primary" onClick={backToServers}>
                    <Server size={16} />
                    Choose Server
                  </button>
                </div>
              ) : settingsLoading ? (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading systems...</h2>
                  <p>Retrieving saved settings from MongoDB.</p>
                </div>
              ) : (
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

                    <span className="live">
                      {Object.values(guildSettings.systems).filter(Boolean).length} ACTIVE
                    </span>
                  </div>

                  {settingsError && (
                    <p style={{ color: "#ff7777", marginBottom: "12px" }}>
                      {settingsError}
                    </p>
                  )}

                  {settingsMessage && (
                    <p style={{ color: "#73e6a2", marginBottom: "12px" }}>
                      {settingsMessage}
                    </p>
                  )}

                  <div className="system-grid">
                    {systems.map(([name, desc, Icon], i) =>
                      name.toLowerCase().includes(query.toLowerCase()) && (
                        <section className="panel system" key={name}>
                          <div className="system-top">
                            <span className="system-icon"><Icon /></span>

                            <input
                              type="checkbox"
                              checked={Boolean(guildSettings.systems[systemKeys[i]])}
                              disabled={settingsSaving}
                              onChange={e =>
                                updateSystem(systemKeys[i], e.target.checked)
                              }
                            />
                          </div>

                          <b>{name}</b>
                          <p>{desc}</p>

                          <div className="system-bottom">
                            <small className={guildSettings.systems[systemKeys[i]] ? "green" : "muted"}>
                              ● {guildSettings.systems[systemKeys[i]] ? "Enabled" : "Disabled"}
                            </small>

                            <button
                              className="link"
                              onClick={() => setPage("Settings")}
                            >
                              Configure ›
                            </button>
                          </div>
                        </section>
                      )
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {page === "Tickets" && (
            <div className="settings-page">
              {!selectedServer ? (
                <div className="panel placeholder">
                  <Ticket />
                  <h2>Select a server first</h2>
                  <p>Choose a server to manage its ticket commands.</p>

                  <button className="primary" onClick={backToServers}>
                    <Server size={16} />
                    Choose Server
                  </button>
                </div>
              ) : settingsLoading ? (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading ticket settings...</h2>
                  <p>Retrieving saved settings from MongoDB.</p>
                </div>
              ) : (
                <>
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <b>Ticket Commands</b>
                        <p>Enable or disable commands and manage their aliases.</p>
                      </div>

                      <Ticket />
                    </div>

                    <div className="server-data-list" style={{ marginTop: "18px" }}>
                      {[
                        ["rename", "Rename Ticket", "Rename an existing ticket."],
                        ["add", "Add Member", "Allow a member to access the ticket."],
                        ["remove", "Remove Member", "Remove a member from the ticket."],
                        ["close", "Close Ticket", "Close a ticket without deleting it."],
                        ["delete", "Delete Ticket", "Delete a ticket channel."]
                      ].map(([key, title, description]) => {
                        const command = guildSettings.tickets?.commands?.[key] || {
                          enabled: true,
                          aliases: [key]
                        };

                        return (
                          <div
                            key={key}
                            className="server-data-row"
                            style={{
                              display: "block",
                              padding: "16px",
                              marginBottom: "12px",
                              border: "1px solid rgba(145,90,255,0.18)",
                              borderRadius: "12px"
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px"
                              }}
                            >
                              <div>
                                <b>{title}</b>
                                <small style={{ display: "block", marginTop: "5px" }}>
                                  {description}
                                </small>
                              </div>

                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  cursor: "pointer"
                                }}
                              >
                                <span style={{ fontSize: "12px" }}>
                                  {command.enabled !== false ? "Enabled" : "Disabled"}
                                </span>

                                <input
                                  type="checkbox"
                                  checked={command.enabled !== false}
                                  disabled={settingsSaving}
                                  onChange={e =>
                                    updateTicketCommand(
                                      key,
                                      "enabled",
                                      e.target.checked
                                    )
                                  }
                                />
                              </label>
                            </div>

                            <div style={{ marginTop: "14px" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "12px"
                                }}
                              >
                                Command aliases
                              </label>

                              <input
                                type="text"
                                value={(command.aliases || [key]).join(", ")}
                                disabled={settingsSaving}
                                onChange={e => {
                                  const aliases = [
                                    ...new Set(
                                      e.target.value
                                        .split(",")
                                        .map(alias =>
                                          alias
                                            .trim()
                                            .toLowerCase()
                                            .replace(/^[-!]+/, "")
                                        )
                                        .filter(Boolean)
                                    )
                                  ];

                                  updateTicketCommand(key, "aliases", aliases);
                                }}
                                placeholder="rename, rn, change-name"
                                style={{
                                  width: "100%",
                                  padding: "12px",
                                  borderRadius: "9px",
                                  border: "1px solid rgba(145,90,255,0.3)",
                                  background: "rgba(255,255,255,0.04)",
                                  color: "#fff",
                                  outline: "none"
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p style={{ color: "#8f899b", fontSize: "12px", marginTop: "12px" }}>
                      Separate aliases with commas. Do not include the command prefix.
                      The bot prefix is configured in General Settings.
                    </p>
                  </section>

                  {settingsError && (
                    <p style={{ color: "#ff7777", marginTop: "15px" }}>
                      {settingsError}
                    </p>
                  )}

                  {settingsMessage && (
                    <p style={{ color: "#73e6a2", marginTop: "15px" }}>
                      {settingsMessage}
                    </p>
                  )}

                  <button
                    className="primary"
                    style={{ marginTop: "18px" }}
                    onClick={() => saveGuildSettings(guildSettings)}
                    disabled={settingsSaving}
                  >
                    {settingsSaving ? "Saving..." : "Save Ticket Settings"}
                  </button>
                </>
              )}
            </div>
          )}

          {page === "Settings" && (
            <div className="settings-page">
              {!selectedServer ? (
                <div className="panel placeholder">
                  <Settings />
                  <h2>Select a server first</h2>
                  <p>Choose a server to manage its settings.</p>
                  <button className="primary" onClick={backToServers}>
                    <Server size={16} />
                    Choose Server
                  </button>
                </div>
              ) : settingsLoading ? (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading settings...</h2>
                  <p>Retrieving saved settings from MongoDB.</p>
                </div>
              ) : (
                <>
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <b>General Settings</b>
                        <p>Configure the basic settings for this server.</p>
                      </div>
                      <Settings />
                    </div>

                    <div style={{ marginTop: "22px" }}>
                      <label style={{ display: "block", marginBottom: "9px" }}>
                        Command Prefix
                      </label>

                      <input
                        value={guildSettings.prefix}
                        maxLength={5}
                        onChange={e =>
                          setGuildSettings(old => ({
                            ...old,
                            prefix: e.target.value
                          }))
                        }
                        placeholder="-"
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          padding: "12px",
                          borderRadius: "9px",
                          border: "1px solid rgba(145,90,255,0.3)",
                          background: "rgba(255,255,255,0.04)",
                          color: "#fff",
                          outline: "none"
                        }}
                      />

                      <p style={{ marginTop: "8px", color: "#8f899b", fontSize: "12px" }}>
                        Current prefix: {guildSettings.prefix || "Not set"}
                      </p>
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>System Configuration</b>
                        <p>Choose which bot systems should be enabled.</p>
                      </div>
                      <SlidersHorizontal />
                    </div>

                    <div className="server-data-list" style={{ marginTop: "15px" }}>
                      {systems.map(([name, description, Icon], index) => {
                        const key = systemKeys[index];
                        const checked = Boolean(guildSettings.systems[key]);

                        return (
                          <div className="server-data-row" key={key}>
                            <Icon size={18} />

                            <div style={{ flex: 1 }}>
                              <b>{name}</b>
                              <small style={{ display: "block", marginTop: "4px" }}>
                                {description}
                              </small>
                            </div>

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                setGuildSettings(old => ({
                                  ...old,
                                  systems: {
                                    ...old.systems,
                                    [key]: e.target.checked
                                  }
                                }));
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {settingsError && (
                    <p style={{ color: "#ff7777", marginTop: "15px" }}>
                      {settingsError}
                    </p>
                  )}

                  {settingsMessage && (
                    <p style={{ color: "#73e6a2", marginTop: "15px" }}>
                      {settingsMessage}
                    </p>
                  )}

                  <button
                    className="primary"
                    style={{ marginTop: "18px" }}
                    onClick={() => saveGuildSettings(guildSettings)}
                    disabled={settingsSaving}
                  >
                    {settingsSaving ? "Saving..." : "Save Settings"}
                  </button>
                </>
              )}
            </div>
          )}

          {page === "Analytics" && (
            <AnalyticsView
              selectedServer={selectedServer}
              serverDetails={serverDetails}
              loading={detailsLoading}
              error={detailsError}
              onRefresh={loadAnalytics}
              onChooseServer={backToServers}
            />
          )}

          {[
            "Moderation",
            "Welcome",
            "Logs",
            "Economy"
          ].includes(page) && (
            <div className="panel placeholder">
              <Settings />
              <h2>{page} settings</h2>
              <p>
                This section will be connected to the selected server
                in a later stage.
              </p>
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
