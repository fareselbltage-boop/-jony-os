
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
  Percent,
  Plus,
  Image as ImageIcon,
  Upload,
  Trash2
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

const translationOriginals = new WeakMap();

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
  moderation: {
    enabled: true,
    prefix: "-",
    staffRoleId: "",
    logChannelId: "",
    defaultTimeout: 10,
    successMessage: "تم تنفيذ إجراء الإشراف بنجاح.",
    permissionMessage: "ليس لديك صلاحية لاستخدام هذا الأمر.",
    commands: {
      ban: { enabled: true },
      kick: { enabled: true },
      timeout: { enabled: true },
      untimeout: { enabled: true },
      warn: { enabled: true },
      clear: { enabled: true },
      lock: { enabled: true },
      unlock: { enabled: true }
    }
  },
  tickets: {
    prefix: "-",
    commands: {
      rename: { enabled: true, aliases: ["rename"] },
      add: { enabled: true, aliases: ["add"] },
      remove: { enabled: true, aliases: ["remove"] },
      close: { enabled: true, aliases: ["close"] },
      delete: { enabled: true, aliases: ["delete"] },
      come: { enabled: true, aliases: ["come"] }
    },
    come: {
      enabled: true,
      message: "مرحباً {user}! أحد أعضاء الطاقم يحتاجك في تذكرتك: {ticket}"
    }
  },
  welcome: {
    channelId: "",
    message: "مرحباً {user} في {server}!",
    useEmbed: true,
    embedTitle: "مرحباً بك في {server}!",
    embedColor: "#8b5cf6",
    showAvatar: true
  },
  economy: {},
  logs: {
    enabled: true,
    embedColor: "#8b5cf6",
    channels: {
      messages: "",
      members: "",
      moderation: "",
      roles: "",
      channels: "",
      voice: "",
      tickets: "",
      server: ""
    },
    events: {
      messageDelete: true,
      messageEdit: true,
      memberJoin: true,
      memberLeave: true,
      memberUpdate: true,
      ban: true,
      unban: true,
      timeout: true,
      roleCreate: true,
      roleUpdate: true,
      roleDelete: true,
      channelCreate: true,
      channelUpdate: true,
      channelDelete: true,
      voiceJoin: true,
      voiceLeave: true,
      voiceMove: true,
      ticketCreate: true,
      ticketClose: true,
      inviteCreate: true,
      inviteDelete: true
    }
  }
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


function ModerationView({
  selectedServer,
  serverDetails,
  guildSettings,
  settingsLoading,
  settingsSaving,
  settingsError,
  settingsMessage,
  onSave
}) {
  const moderation = guildSettings.moderation || {};
  const commands = moderation.commands || {};

  const commandList = [
    ["ban", "Ban", "Ban a member from the server.", Shield],
    ["kick", "Kick", "Remove a member from the server.", X],
    ["timeout", "Timeout", "Temporarily restrict a member.", Lock],
    ["untimeout", "Remove Timeout", "Remove an active timeout.", RefreshCw],
    ["warn", "Warn", "Issue a moderation warning.", ShieldCheck],
    ["clear", "Clear Messages", "Bulk delete recent messages.", Trash2],
    ["lock", "Lock Channel", "Prevent members from sending messages.", Lock],
    ["unlock", "Unlock Channel", "Restore member message permissions.", Check]
  ];

  const roles = (serverDetails?.roles || [])
    .filter(role => role.id && role.name !== "@everyone" && !role.managed)
    .sort((a, b) => b.position - a.position);

  const channels = (serverDetails?.channels || [])
    .filter(channel => [0, 5].includes(Number(channel.type)))
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

  const updateModeration = (key, value) => {
    const next = {
      ...guildSettings,
      moderation: {
        ...moderation,
        [key]: value
      }
    };
    onSave(next, false);
  };

  const updateCommand = (key, value) => {
    const next = {
      ...guildSettings,
      moderation: {
        ...moderation,
        commands: {
          ...commands,
          [key]: value
        }
      }
    };
    onSave(next, false);
  };

  if (!selectedServer) {
    return (
      <div className="panel placeholder">
        <Shield />
        <h2>Select a server first</h2>
        <p>Choose a server before changing moderation settings.</p>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="panel placeholder">
        <Activity className="spin" />
        <h2>Loading moderation...</h2>
        <p>Retrieving saved moderation settings from MongoDB.</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <section className="panel">
        <div className="panel-head">
          <div>
            <b>Moderation System</b>
            <p>Configure who can use moderation commands and where actions are logged.</p>
          </div>
          <Shield />
        </div>

        <div className="server-data-row" style={{ marginTop: "18px" }}>
          <div style={{ flex: 1 }}>
            <b>Enable Moderation</b>
            <small style={{ display: "block", marginTop: "4px" }}>
              Turn the moderation system on or off for this server.
            </small>
          </div>
          <input
            type="checkbox"
            checked={moderation.enabled !== false}
            disabled={settingsSaving}
            onChange={e => updateModeration("enabled", e.target.checked)}
          />
        </div>

        <div className="grid" style={{ marginTop: "18px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Command Prefix</label>
            <input
              value={moderation.prefix ?? guildSettings.prefix ?? "-"}
              maxLength={5}
              disabled={settingsSaving}
              onChange={e => updateModeration("prefix", e.target.value)}
              placeholder="-"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid rgba(145,90,255,0.3)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Moderator Role</label>
            <select
              value={moderation.staffRoleId || ""}
              disabled={settingsSaving}
              onChange={e => updateModeration("staffRoleId", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid rgba(145,90,255,0.3)",
                background: "#17131f",
                color: "#fff"
              }}
            >
              <option value="">Administrator only</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>@{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Moderation Log Channel</label>
            <select
              value={moderation.logChannelId || ""}
              disabled={settingsSaving}
              onChange={e => updateModeration("logChannelId", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid rgba(145,90,255,0.3)",
                background: "#17131f",
                color: "#fff"
              }}
            >
              <option value="">No log channel</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>#{channel.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Default Timeout</label>
            <select
              value={String(moderation.defaultTimeout ?? 10)}
              disabled={settingsSaving}
              onChange={e => updateModeration("defaultTimeout", Number(e.target.value))}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid rgba(145,90,255,0.3)",
                background: "#17131f",
                color: "#fff"
              }}
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="1440">1 day</option>
            </select>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: "18px" }}>
        <div className="panel-head">
          <div>
            <b>Moderation Commands</b>
            <p>Enable or disable individual moderation actions.</p>
          </div>
          <SlidersHorizontal />
        </div>

        <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
          {commandList.map(([key, name, description, Icon]) => (
            <div
              className="server-data-row"
              key={key}
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(145,90,255,0.12)",
                  color: "#c7a8ff"
                }}
              >
                <Icon size={16} />
              </span>

              <div style={{ flex: 1 }}>
                <b>{name}</b>
                <small style={{ display: "block", marginTop: "3px" }}>{description}</small>
              </div>

              <input
                type="checkbox"
                checked={commands[key]?.enabled !== false}
                disabled={settingsSaving || moderation.enabled === false}
                onChange={e => updateCommand(key, {
                  ...(commands[key] || {}),
                  enabled: e.target.checked
                })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: "18px" }}>
        <div className="panel-head">
          <div>
            <b>Moderation Messages</b>
            <p>Customize the basic responses used by the moderation system.</p>
          </div>
          <MessageSquare />
        </div>

        <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Success Message</label>
            <input
              value={moderation.successMessage ?? "Moderation action completed."}
              maxLength={500}
              disabled={settingsSaving}
              onChange={e => updateModeration("successMessage", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid rgba(145,90,255,0.3)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Permission Denied Message</label>
            <input
              value={moderation.permissionMessage ?? "You do not have permission to use this command."}
              maxLength={500}
              disabled={settingsSaving}
              onChange={e => updateModeration("permissionMessage", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid rgba(145,90,255,0.3)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff"
              }}
            />
          </div>
        </div>
      </section>

      {settingsError && <p style={{ color: "#ff7777", marginTop: "15px" }}>{settingsError}</p>}
      {settingsMessage && <p style={{ color: "#73e6a2", marginTop: "15px" }}>{settingsMessage}</p>}

      <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
        <button
          className="primary"
          disabled={settingsSaving}
          onClick={() => onSave({
            ...guildSettings,
            moderation: {
              ...moderation,
              commands: Object.fromEntries(
                commandList.map(([key]) => [
                  key,
                  {
                    ...(commands[key] || {}),
                    enabled: commands[key]?.enabled !== false
                  }
                ])
              )
            }
          }, true)}
        >
          {settingsSaving ? "Saving..." : "Save Moderation Settings"}
        </button>

        <span className="live" style={{ alignSelf: "center" }}>
          {commandList.filter(([key]) => commands[key]?.enabled !== false).length} COMMANDS ACTIVE
        </span>
      </div>
    </div>
  );
}



function LogsView({
  selectedServer,
  serverDetails,
  guildSettings,
  settingsLoading,
  settingsSaving,
  settingsError,
  settingsMessage,
  onSave
}) {
  const logs = guildSettings.logs || {};
  const channelsConfig = logs.channels || {};
  const events = logs.events || {};

  const channelGroups = [
    ["messages", "Message Logs", "Deleted and edited messages", MessageSquare],
    ["members", "Member Logs", "Member joins, leaves and profile updates", Users],
    ["moderation", "Moderation Logs", "Bans, unbans and timeouts", Shield],
    ["roles", "Role Logs", "Role creation, updates and deletion", ShieldCheck],
    ["channels", "Channel Logs", "Channel creation, updates and deletion", Hash],
    ["voice", "Voice Logs", "Voice joins, leaves and channel moves", Volume2],
    ["tickets", "Ticket Logs", "Ticket creation and closure", Ticket],
    ["server", "Server Logs", "Invite creation and deletion", Server]
  ];

  const eventGroups = [
    ["Messages", [
      ["messageDelete", "Message Deleted"],
      ["messageEdit", "Message Edited"]
    ]],
    ["Members", [
      ["memberJoin", "Member Joined"],
      ["memberLeave", "Member Left"],
      ["memberUpdate", "Member Updated"]
    ]],
    ["Moderation", [
      ["ban", "Member Banned"],
      ["unban", "Member Unbanned"],
      ["timeout", "Member Timed Out"]
    ]],
    ["Roles", [
      ["roleCreate", "Role Created"],
      ["roleUpdate", "Role Updated"],
      ["roleDelete", "Role Deleted"]
    ]],
    ["Channels", [
      ["channelCreate", "Channel Created"],
      ["channelUpdate", "Channel Updated"],
      ["channelDelete", "Channel Deleted"]
    ]],
    ["Voice", [
      ["voiceJoin", "Joined Voice Channel"],
      ["voiceLeave", "Left Voice Channel"],
      ["voiceMove", "Moved Voice Channel"]
    ]],
    ["Tickets", [
      ["ticketCreate", "Ticket Opened"],
      ["ticketClose", "Ticket Closed"]
    ]],
    ["Server", [
      ["inviteCreate", "Invite Created"],
      ["inviteDelete", "Invite Deleted"]
    ]]
  ];

  const textChannels = (serverDetails?.channels || [])
    .filter(channel => [0, 5].includes(Number(channel.type)))
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

  const updateLogs = patch => {
    onSave({
      ...guildSettings,
      logs: {
        ...logs,
        ...patch
      }
    }, false);
  };

  const updateChannel = (key, value) => {
    updateLogs({
      channels: {
        ...channelsConfig,
        [key]: value
      }
    });
  };

  const updateEvent = (key, value) => {
    updateLogs({
      events: {
        ...events,
        [key]: value
      }
    });
  };

  if (!selectedServer) {
    return (
      <div className="panel placeholder">
        <ClipboardList />
        <h2>Select a server first</h2>
        <p>Choose a server before configuring activity logs.</p>
      </div>
    );
  }

  if (settingsLoading || !serverDetails) {
    return (
      <div className="panel placeholder">
        <Activity className="spin" />
        <h2>Loading log settings...</h2>
        <p>Retrieving your server channels and saved settings.</p>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "9px",
    border: "1px solid rgba(145,90,255,0.3)",
    background: "#17131f",
    color: "#fff"
  };

  return (
    <div className="settings-page">
      <section className="panel">
        <div className="panel-head">
          <div>
            <b>Activity Logs</b>
            <p>Send server events to dedicated channels. Every event should be delivered as a Discord Embed.</p>
          </div>
          <ClipboardList />
        </div>

        <div className="server-data-row" style={{ marginTop: "18px" }}>
          <div style={{ flex: 1 }}>
            <b>Enable Activity Logs</b>
            <small style={{ display: "block", marginTop: "4px" }}>Turn all configured event logging on or off.</small>
          </div>
          <input
            type="checkbox"
            checked={logs.enabled !== false}
            disabled={settingsSaving}
            onChange={e => updateLogs({ enabled: e.target.checked })}
          />
        </div>

        <div className="grid" style={{ marginTop: "18px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Embed Color</label>
            <input
              type="color"
              value={logs.embedColor || "#8b5cf6"}
              disabled={settingsSaving}
              onChange={e => updateLogs({ embedColor: e.target.value })}
              style={{ ...inputStyle, height: "44px", padding: "5px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>Available Text Channels</label>
            <div style={{ ...inputStyle, color: "#aaa4b8" }}>{textChannels.length} text channels loaded</div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: "18px" }}>
        <div className="panel-head">
          <div>
            <b>Log Channel Routing</b>
            <p>Choose where each category of event should be sent.</p>
          </div>
          <Hash />
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
          {channelGroups.map(([key, title, description, Icon]) => (
            <div className="server-data-row" key={key} style={{ gap: "14px", flexWrap: "wrap" }}>
              <span style={{ width: "36px", height: "36px", borderRadius: "9px", display: "grid", placeItems: "center", background: "rgba(145,90,255,0.12)", color: "#c7a8ff" }}>
                <Icon size={17} />
              </span>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <b>{title}</b>
                <small style={{ display: "block", marginTop: "3px" }}>{description}</small>
              </div>
              <select
                value={channelsConfig[key] || ""}
                disabled={settingsSaving || logs.enabled === false}
                onChange={e => updateChannel(key, e.target.value)}
                style={{ ...inputStyle, maxWidth: "260px" }}
              >
                <option value="">Not configured</option>
                {textChannels.map(channel => (
                  <option key={channel.id} value={channel.id}>#{channel.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: "18px" }}>
        <div className="panel-head">
          <div>
            <b>Event Controls</b>
            <p>Enable or disable individual events. All enabled events use Discord embeds.</p>
          </div>
          <SlidersHorizontal />
        </div>

        <div style={{ display: "grid", gap: "18px", marginTop: "18px" }}>
          {eventGroups.map(([group, items]) => (
            <div key={group}>
              <b style={{ display: "block", marginBottom: "10px" }}>{group}</b>
              <div style={{ display: "grid", gap: "8px" }}>
                {items.map(([key, label]) => (
                  <div className="server-data-row" key={key} style={{ padding: "12px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ flex:  1 }}>{label}</span>
                    <input
                      type="checkbox"
                      checked={events[key] !== false}
                      disabled={settingsSaving || logs.enabled === false}
                      onChange={e => updateEvent(key, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {settingsError && <p style={{ color: "#ff7777", marginTop: "15px" }}>{settingsError}</p>}
      {settingsMessage && <p style={{ color: "#73e6a2", marginTop: "15px" }}>{settingsMessage}</p>}

      <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
        <button
          className="primary"
          disabled={settingsSaving}
          onClick={() => onSave({
            ...guildSettings,
            logs: {
              ...logs,
              enabled: logs.enabled !== false,
              channels: { ...channelsConfig },
              events: { ...events }
            }
          }, true)}
        >
          {settingsSaving ? "Saving..." : "Save Log Settings"}
        </button>
        <span className="live" style={{ alignSelf: "center" }}>
          {Object.values(channelsConfig).filter(Boolean).length} CHANNELS CONFIGURED
        </span>
      </div>
    </div>
  );
}


export default function App() {
  const [page, setPage] = useState("Servers");
  const [dashboardLanguage, setDashboardLanguage] = useState(() => {
    try {
      return localStorage.getItem("jony-dashboard-language") || "en";
    } catch {
      return "en";
    }
  });
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

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
  const [welcomeTestLoading, setWelcomeTestLoading] = useState(false);
  const [welcomeTestMessage, setWelcomeTestMessage] = useState("");
  const [welcomeTemplate, setWelcomeTemplate] = useState(null);
  const [welcomeTemplateLoading, setWelcomeTemplateLoading] = useState(false);
  const [welcomeTemplateSaving, setWelcomeTemplateSaving] = useState(false);
  const [welcomeTemplateError, setWelcomeTemplateError] = useState("");
  const [ticketImage, setTicketImage] = useState(null);
  const [ticketImageLoading, setTicketImageLoading] = useState(false);
  const [ticketImageSaving, setTicketImageSaving] = useState(false);
  const [ticketImageError, setTicketImageError] = useState("");

  useEffect(() => {
    const isArabic = dashboardLanguage === "ar";
    document.documentElement.lang = dashboardLanguage;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    try {
      localStorage.setItem("jony-dashboard-language", dashboardLanguage);
    } catch {}
  }, [dashboardLanguage]);

  useEffect(() => {
    const isArabic = dashboardLanguage === "ar";
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    try { localStorage.setItem("jony-dashboard-language", dashboardLanguage); } catch {}
    const dictionary = {"Servers":"السيرفرات","Server Dashboard":"لوحة السيرفر","Systems":"الأنظمة","Moderation":"الإشراف","Tickets":"التذاكر","Ticket System":"نظام التذاكر","Welcome":"الترحيب","Logs":"السجلات","Economy":"الاقتصاد","Settings":"الإعدادات","Analytics":"الإحصائيات","PREFERENCES":"التفضيلات","OVERVIEW":"نظرة عامة","MANAGEMENT":"الإدارة","SELECTED SERVER":"السيرفر المحدد","Server Overview":"نظرة عامة على السيرفر","Change Server":"تغيير السيرفر","Select a server first":"اختر سيرفر أولاً","Choose a server to manage its settings.":"اختر سيرفراً لإدارة إعداداته.","Choose a server before changing its systems.":"اختر سيرفراً قبل تعديل أنظمته.","Choose Server":"اختيار سيرفر","Loading settings...":"جارٍ تحميل الإعدادات...","Loading systems...":"جارٍ تحميل الأنظمة...","Retrieving saved settings from MongoDB.":"جارٍ تحميل الإعدادات المحفوظة.","General Settings":"الإعدادات العامة","Configure the basic settings for this server.":"اضبط الإعدادات الأساسية لهذا السيرفر.","Dashboard Language":"لغة لوحة التحكم","Choose the dashboard language.":"اختر لغة لوحة التحكم.","Choose the language you want to use across the dashboard.":"اختر اللغة التي تريد استخدامها في لوحة التحكم.","System Configuration":"إعدادات الأنظمة","Choose which bot systems should be enabled.":"اختر أنظمة البوت التي تريد تفعيلها.","Protect your community with moderation tools.":"احمِ مجتمعك باستخدام أدوات الإشراف.","Private support channels for your members.":"قنوات دعم خاصة لأعضاء السيرفر.","Custom greetings for new members.":"رسائل ترحيب مخصصة للأعضاء الجدد.","Automatically catch spam and unwanted links.":"اكتشف الرسائل المزعجة والروابط غير المرغوبة تلقائياً.","Reward members for being active.":"كافئ الأعضاء على نشاطهم.","Collect and vote on community ideas.":"اجمع أفكار المجتمع وصوّت عليها.","Enabled":"مفعّل","Disabled":"معطّل","Configure":"إعداد","Save Settings":"حفظ الإعدادات","Save Ticket Settings":"حفظ إعدادات التذاكر","Save Welcome Settings":"حفظ إعدادات الترحيب","Save Log Settings":"حفظ إعدادات السجلات","Test Welcome":"تجربة الترحيب","Sending test...":"جارٍ إرسال التجربة...","Find a system...":"ابحث عن نظام...","Server roles":"رتب السيرفر","No roles available.":"لا توجد رتب متاحة.","No channels available.":"لا توجد قنوات متاحة.","Server channels":"قنوات السيرفر","ACTIVE":"نشط","ONLINE":"متصل","OFFLINE":"غير متصل","Save":"حفظ","Cancel":"إلغاء","Close":"إغلاق","Delete":"حذف","Refresh":"تحديث","Search":"بحث","Prefix":"البادئة","Commands":"الأوامر","Command":"الأمر","Channel":"القناة","Category":"التصنيف","Staff Role":"رتبة الطاقم","Log Channel":"قناة السجلات","Ticket Settings":"إعدادات التذاكر","Welcome Settings":"إعدادات الترحيب","Message":"الرسالة","Enabled systems":"الأنظمة المفعّلة","Total Members":"إجمالي الأعضاء","Members":"الأعضاء","Channels":"القنوات","Roles":"الرتب","Loading...":"جارٍ التحميل...","Saving...":"جارٍ الحفظ...","Save failed":"فشل الحفظ","Settings saved successfully.":"تم حفظ الإعدادات بنجاح.","Loading your connected servers...":"جارٍ تحميل السيرفرات المتصلة...","Connecting to Discord and checking your server access.":"جارٍ الاتصال بديسكورد والتحقق من صلاحياتك.","Couldn't load your servers":"تعذّر تحميل السيرفرات","No connected servers found":"لم يتم العثور على سيرفرات متصلة متاحة","Make sure you're the server owner or have Administrator permission in at least one Discord server.":"ستظهر هنا السيرفرات التي أُضيف إليها JONY OS ولديك فيها صلاحية Administrator.","Refresh servers":"تحديث السيرفرات","BOT CONNECTED":"البوت متصل","BOT NOT ADDED":"البوت غير مضاف","Owner":"المالك","Administrator":"مسؤول","Manage Server":"إدارة السيرفر","Invite JONY OS":"إضافة JONY OS","Loading server dashboard...":"جارٍ تحميل لوحة السيرفر...","Retrieving server information from Discord.":"جارٍ جلب معلومات السيرفر من ديسكورد.","Unable to open this server":"تعذّر فتح هذا السيرفر","Back to servers":"العودة إلى السيرفرات","Try again":"حاول مرة أخرى","Load Analytics":"تحميل الإحصائيات","Analytics unavailable":"الإحصائيات غير متاحة","No analytics data":"لا توجد بيانات إحصائية","Refresh the analytics to retrieve the current server data.":"حدّث الإحصائيات لجلب بيانات السيرفر الحالية.","Moderation Settings":"إعدادات الإشراف","Ticket System Settings":"إعدادات نظام التذاكر","Welcome System":"نظام الترحيب","Activity Logs":"سجلات النشاط","Server Information":"معلومات السيرفر","Server Name":"اسم السيرفر","Server ID":"معرّف السيرفر","Member Count":"عدد الأعضاء","Text Channels":"القنوات النصية","Voice Channels":"القنوات الصوتية","Default Timeout":"مدة الإسكات الافتراضية","Success Message":"رسالة النجاح","Permission Message":"رسالة الصلاحيات","Enable system":"تفعيل النظام","Disable system":"تعطيل النظام","Command Settings":"إعدادات الأوامر","Command Prefix":"بادئة الأوامر","Aliases":"الأسماء البديلة","Add":"إضافة","Remove":"إزالة","Rename":"إعادة التسمية","Close Ticket":"إغلاق التذكرة","Delete Ticket":"حذف التذكرة","Welcome Channel":"قناة الترحيب","Welcome Message":"رسالة الترحيب","Embed Title":"عنوان التضمين","Embed Color":"لون التضمين","Show Avatar":"إظهار الصورة الشخصية","Use Embed":"استخدام Embed","Upload Image":"رفع صورة","Choose Image":"اختيار صورة","Save Image":"حفظ الصورة","Image uploaded successfully.":"تم رفع الصورة بنجاح.","Image must be 2 MB or smaller.":"يجب ألا يتجاوز حجم الصورة 2 ميجابايت.","Log Settings":"إعدادات السجلات","Log Events":"أحداث السجلات","Message Delete":"حذف الرسائل","Message Edit":"تعديل الرسائل","Member Join":"انضمام عضو","Member Leave":"مغادرة عضو","Member Update":"تحديث العضو","Role Create":"إنشاء رتبة","Role Update":"تحديث رتبة","Role Delete":"حذف رتبة","Channel Create":"إنشاء قناة","Channel Update":"تحديث قناة","Channel Delete":"حذف قناة","Voice Join":"دخول صوتي","Voice Leave":"مغادرة صوتية","Voice Move":"الانتقال الصوتي","No servers found":"لم يتم العثور على سيرفرات","Search servers...":"ابحث عن سيرفرات...","Search channels...":"ابحث عن قنوات...","Search roles...":"ابحث عن رتب...","Last 7 days":"آخر 7 أيام","Today":"اليوم","Yesterday":"أمس","This week":"هذا الأسبوع","This month":"هذا الشهر","Welcome back!":"مرحباً بعودتك!","Dashboard":"لوحة التحكم","Home":"الرئيسية","Overview":"نظرة عامة","Profile":"الملف الشخصي","Logout":"تسجيل الخروج","Log out":"تسجيل الخروج","Login with Discord":"تسجيل الدخول عبر Discord","Continue with Discord":"المتابعة عبر Discord","Could not load servers":"تعذّر تحميل السيرفرات","Could not load settings":"تعذّر تحميل الإعدادات","Something went wrong":"حدث خطأ ما","Please try again later.":"يرجى المحاولة مرة أخرى لاحقاً.","No data available":"لا توجد بيانات متاحة","Not configured":"غير مُعدّ","Configured":"تم الإعداد","Enabled events":"الأحداث المفعّلة","CHANNELS CONFIGURED":"قنوات تم إعدادها"};
    const root = document.querySelector(".app") || document.body;
    let translating = false;
    const translateTree = target => {
      if (!target || translating) return;
      translating = true;
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        if (!translationOriginals.has(node)) translationOriginals.set(node, node.nodeValue);
        const original = translationOriginals.get(node);
        const trimmed = original.trim();
        if (!trimmed) continue;
        const translated = isArabic ? dictionary[trimmed] : original;
        if (translated !== undefined) {
          const nextValue = original.replace(trimmed, translated);
          if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
        }
      }
      const elements = target.nodeType === Node.ELEMENT_NODE ? [target, ...target.querySelectorAll("*")] : [...(target.querySelectorAll?.("*") || [])];
      for (const element of elements) {
        for (const attribute of ["placeholder", "aria-label", "title"]) {
          const originalKey = "data-jony-original-" + attribute;
          if (!element.hasAttribute(originalKey) && element.hasAttribute(attribute)) element.setAttribute(originalKey, element.getAttribute(attribute));
          const original = element.getAttribute(originalKey);
          if (original !== null) {
            const translated = isArabic ? dictionary[original] : original;
            if (translated !== undefined) element.setAttribute(attribute, translated);
          }
        }
      }
      translating = false;
    };
    translateTree(root);
    const observer = new MutationObserver(records => {
      if (translating) return;
      for (const record of records) {
        if (record.type === "characterData") {
          const node = record.target;
          if (!translationOriginals.has(node)) translationOriginals.set(node, node.nodeValue);
          const original = translationOriginals.get(node);
          const trimmed = original.trim();
          const translated = isArabic ? dictionary[trimmed] : original;
          if (trimmed && translated !== undefined) {
            const nextValue = original.replace(trimmed, translated);
            if (node.nodeValue !== nextValue) {
              translating = true;
              node.nodeValue = nextValue;
              translating = false;
            }
          }
        }
        for (const node of record.addedNodes || []) {
          if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
          else if (node.nodeType === Node.TEXT_NODE) {
            translationOriginals.set(node, node.nodeValue);
            const original = node.nodeValue;
            const trimmed = original.trim();
            const translated = isArabic ? dictionary[trimmed] : original;
            if (trimmed && translated !== undefined) {
            const nextValue = original.replace(trimmed, translated);
            if (node.nodeValue !== nextValue) {
              translating = true;
              node.nodeValue = nextValue;
              translating = false;
            }
          }
          }
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [dashboardLanguage]);

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
    const controller = new AbortController();

    // Never keep the whole dashboard blocked by a slow Discord auth check.
    const fallbackTimeout = setTimeout(() => {
      if (active) setAuthLoading(false);
    }, 4000);

    const timeout = setTimeout(() => controller.abort(), 9000);

    fetch("/api/auth/me", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal
    })
      .then(async response => {
        if (!response.ok) return null;
        return response.json();
      })
      .then(result => {
        if (active && result?.authenticated && result.user) {
          setUser(result.user);
        }
      })
      .catch(error => {
        if (error.name !== "AbortError") {
          console.error("[JONY OS] Authentication check failed:", error);
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        clearTimeout(fallbackTimeout);
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(timeout);
      clearTimeout(fallbackTimeout);
      controller.abort();
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
      `/api/server?id=${encodeURIComponent(serverId)}`,
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not load server details");
    }

    // Support the API's nested response and common root-level response shapes.
    const server = result.server || result.data?.server || result.data || {};
    const channels = Array.isArray(server.channels)
      ? server.channels
      : Array.isArray(result.channels)
        ? result.channels
        : [];
    const roles = Array.isArray(server.roles)
      ? server.roles
      : Array.isArray(result.roles)
        ? result.roles
        : [];

    return {
      ...server,
      channels: channels
        .filter(channel => channel && channel.id)
        .map(channel => ({
          ...channel,
          id: String(channel.id),
          type: Number(channel.type),
          name: String(channel.name || "unknown-channel"),
          parent_id: channel.parent_id ? String(channel.parent_id) : null
        })),
      roles: roles
        .filter(role => role && role.id)
        .map(role => ({
          ...role,
          id: String(role.id),
          name: String(role.name || "unknown-role"),
          position: Number(role.position || 0)
        }))
    };
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
          prefix: saved.tickets?.prefix ?? saved.prefix ?? DEFAULT_SETTINGS.tickets.prefix,
          commands: Object.fromEntries(
            Object.entries(DEFAULT_SETTINGS.tickets.commands).map(([key, defaults]) => {
              const savedCommand = saved.tickets?.commands?.[key] || {};
              return [key, {
                ...defaults,
                ...savedCommand,
                aliases: Array.isArray(savedCommand.aliases) && savedCommand.aliases.length
                  ? savedCommand.aliases
                  : defaults.aliases
              }];
            })
          )
        },
        moderation: {
          ...DEFAULT_SETTINGS.moderation,
          ...(saved.moderation || {}),
          commands: Object.fromEntries(
            Object.entries(DEFAULT_SETTINGS.moderation.commands).map(([key, defaults]) => [
              key,
              {
                ...defaults,
                ...(saved.moderation?.commands?.[key] || {})
              }
            ])
          )
        },
        welcome: {
          ...DEFAULT_SETTINGS.welcome,
          ...(saved.welcome || {})
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

  const updateModerationSettings = (nextSettings, shouldSave = false) => {
    setGuildSettings(nextSettings);
    setSettingsError("");
    setSettingsMessage("");
    if (shouldSave && selectedServer) {
      saveGuildSettings(nextSettings);
    }
  };

  const loadWelcomeTemplate = async serverId => {
    if (!serverId) return;
    setWelcomeTemplateLoading(true);
    setWelcomeTemplateError("");

    try {
      const response = await fetch(`/api/welcome-template?id=${encodeURIComponent(serverId)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load welcome image.");
      setWelcomeTemplate(result.template || null);
    } catch (error) {
      setWelcomeTemplateError(error.message || "Could not load welcome image.");
    } finally {
      setWelcomeTemplateLoading(false);
    }
  };

  const uploadWelcomeTemplate = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedServer) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setWelcomeTemplateError("Use a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setWelcomeTemplateError("The image must be 2 MB or smaller.");
      return;
    }

    setWelcomeTemplateSaving(true);
    setWelcomeTemplateError("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(file);
      });

      const response = await fetch(`/api/welcome-template?id=${encodeURIComponent(selectedServer.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, fileName: file.name })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not upload image.");

      setWelcomeTemplate(result.template);
    } catch (error) {
      setWelcomeTemplateError(error.message || "Could not upload image.");
    } finally {
      setWelcomeTemplateSaving(false);
    }
  };

  const removeWelcomeTemplate = async () => {
    if (!selectedServer) return;
    setWelcomeTemplateSaving(true);
    setWelcomeTemplateError("");

    try {
      const response = await fetch(`/api/welcome-template?id=${encodeURIComponent(selectedServer.id)}`, {
        method: "DELETE"
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove image.");
      setWelcomeTemplate(null);
    } catch (error) {
      setWelcomeTemplateError(error.message || "Could not remove image.");
    } finally {
      setWelcomeTemplateSaving(false);
    }
  };

  const loadTicketImage = async serverId => {
    if (!serverId) return;
    setTicketImageLoading(true);
    setTicketImageError("");

    try {
      const response = await fetch(`/api/ticket-image?id=${encodeURIComponent(serverId)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load ticket image.");
      setTicketImage(result.image || null);
    } catch (error) {
      setTicketImageError(error.message || "Could not load ticket image.");
    } finally {
      setTicketImageLoading(false);
    }
  };

  const uploadTicketImage = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedServer) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setTicketImageError("Use a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setTicketImageError("The image must be 2 MB or smaller.");
      return;
    }

    setTicketImageSaving(true);
    setTicketImageError("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(file);
      });

      const response = await fetch(`/api/ticket-image?id=${encodeURIComponent(selectedServer.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, fileName: file.name })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not upload image.");
      setTicketImage(result.image || null);
    } catch (error) {
      setTicketImageError(error.message || "Could not upload image.");
    } finally {
      setTicketImageSaving(false);
    }
  };

  const removeTicketImage = async () => {
    if (!selectedServer) return;
    setTicketImageSaving(true);
    setTicketImageError("");

    try {
      const response = await fetch(`/api/ticket-image?id=${encodeURIComponent(selectedServer.id)}`, {
        method: "DELETE"
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove image.");
      setTicketImage(null);
    } catch (error) {
      setTicketImageError(error.message || "Could not remove image.");
    } finally {
      setTicketImageSaving(false);
    }
  };

  useEffect(() => {
    if (page === "Tickets" && selectedServer?.id) {
      loadTicketImage(selectedServer.id);
    }
  }, [page, selectedServer?.id]);

  useEffect(() => {
    if (page === "Welcome" && selectedServer?.id) {
      loadWelcomeTemplate(selectedServer.id);
    }
  }, [page, selectedServer?.id]);

  const testWelcome = async () => {
    if (!selectedServer) return;

    setWelcomeTestLoading(true);
    setWelcomeTestMessage("");
    setSettingsError("");

    try {
      const saved = await saveGuildSettings(guildSettings);
      if (!saved) throw new Error("Save your welcome settings before testing.");

      const createResponse = await fetch(
        `/api/welcome-test?id=${encodeURIComponent(selectedServer.id)}`,
        { method: "POST" }
      );
      const created = await createResponse.json();
      if (!createResponse.ok) throw new Error(created.error || "Could not start test.");

      const deadline = Date.now() + 60000;

      while (Date.now() < deadline) {
        await new Promise(resolve => window.setTimeout(resolve, 2000));

        const statusResponse = await fetch(
          `/api/welcome-test?id=${encodeURIComponent(selectedServer.id)}&requestId=${encodeURIComponent(created.requestId)}`
        );
        const status = await statusResponse.json();

        if (!statusResponse.ok) throw new Error(status.error || "Could not check test status.");

        if (status.status === "completed") {
          setWelcomeTestMessage("Test welcome message sent successfully.");
          return;
        }

        if (status.status === "failed" || status.status === "expired") {
          throw new Error(status.result || "The bot could not send the test message.");
        }
      }

      throw new Error("Test timed out. Make sure the bot is online and restart it with the updated files.");
    } catch (error) {
      setWelcomeTestMessage(error.message || "Welcome test failed.");
    } finally {
      setWelcomeTestLoading(false);
    }
  };

  const updateWelcomeSetting = (key, value) => {
    setGuildSettings(old => ({
      ...old,
      welcome: {
        ...(old.welcome || {}),
        [key]: value
      }
    }));
    setSettingsError("");
    setSettingsMessage("");
  };

  const updateTicketSetting = (key, value) => {
    setGuildSettings(old => ({
      ...old,
      tickets: {
        ...(old.tickets || {}),
        [key]: value
      }
    }));
    setSettingsError("");
    setSettingsMessage("");
  };

  const updateTicketCommand = (commandKey, patch) => {
    setGuildSettings(old => {
      const current = old.tickets?.commands?.[commandKey] || {
        enabled: true,
        aliases: [commandKey]
      };

      return {
        ...old,
        tickets: {
          ...(old.tickets || {}),
          commands: {
            ...(old.tickets?.commands || {}),
            [commandKey]: {
              ...current,
              ...patch
            }
          }
        }
      };
    });
    setSettingsError("");
    setSettingsMessage("");
  };

  const updateTicketAlias = (commandKey, aliasIndex, value) => {
    const aliases = [
      ...(guildSettings.tickets?.commands?.[commandKey]?.aliases || [commandKey])
    ];
    aliases[aliasIndex] = value;
    updateTicketCommand(commandKey, { aliases });
  };

  const addTicketAlias = commandKey => {
    const aliases = [
      ...(guildSettings.tickets?.commands?.[commandKey]?.aliases || [commandKey])
    ];
    aliases.push("");
    updateTicketCommand(commandKey, { aliases });
  };

  const removeTicketAlias = (commandKey, aliasIndex) => {
    const aliases = [
      ...(guildSettings.tickets?.commands?.[commandKey]?.aliases || [commandKey])
    ];
    if (aliases.length <= 1) return;
    aliases.splice(aliasIndex, 1);
    updateTicketCommand(commandKey, { aliases });
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

  const refreshServerDetails = async () => {
    if (!selectedServer) return;

    setDetailsLoading(true);
    setDetailsError("");

    try {
      const details = await fetchServerDetails(selectedServer.id);
      setServerDetails(details);
      setRolePage(1);
      setChannelPage(1);
    } catch (error) {
      setDetailsError(error.message || "Could not load Discord server data.");
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
      <style>{`
        .app input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          position: relative;
          display: inline-block;
          flex: 0 0 44px;
          width: 44px;
          min-width: 44px;
          height: 25px;
          margin: 0;
          padding: 0;
          border: 1px solid rgba(255,255,255,0.32);
          border-radius: 999px;
          background: #f4f4f5;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
          vertical-align: middle;
        }
        .app input[type="checkbox"]::before {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #777;
          transition: transform .2s ease, background .2s ease;
        }
        .app input[type="checkbox"]:checked {
          background: #22c55e;
          border-color: #22c55e;
        }
        .app input[type="checkbox"]:checked::before {
          background: #fff;
          transform: translateX(19px);
        }
        .app input[type="checkbox"]:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .language-setting {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          padding: 16px;
          margin-top: 15px;
          border: 1px solid rgba(145,90,255,.2);
          border-radius: 12px;
          background: rgba(145,90,255,.06);
        }
        .language-setting-copy b { display: block; color: #f4efff; }
        .language-setting-copy small { display: block; margin-top: 5px; color: #a99dbb; }
        .language-select { min-width: 150px; font-size: 12px; cursor: pointer; }\n        .language-toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 0;
          background: transparent;
          color: #eee7ff;
          cursor: pointer;
          font: inherit;
        }
        .language-toggle-track {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 27px;
          border-radius: 999px;
          background: ${dashboardLanguage === "en" ? "#22c55e" : "#f4f4f5"};
          transition: background .2s ease;
        }
        .language-toggle-knob {
          position: absolute;
          top: 3px;
          left: ${dashboardLanguage === "en" ? "24px" : "3px"};
          width: 21px;
          height: 21px;
          border-radius: 50%;
          background: ${dashboardLanguage === "en" ? "#fff" : "#777"};
          transition: left .2s ease;
        }
      `}</style>
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
                        : page === "Moderation"
                          ? "Configure moderation commands, permissions and logging."
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
                            "bot-badge added"
                          }
                        >
                          <span />
                          "BOT CONNECTED"
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

                      {true ? (
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
                              onClick={() => {
                                const configPages = {
                                  "Moderation": "Moderation",
                                  "Ticket System": "Tickets",
                                  "Welcome": "Welcome",
                                  "Auto Moderation": "Moderation",
                                  "Leveling": "Economy",
                                  "Suggestions": "Suggestions"
                                };
                                setPage(configPages[name] || name);
                                setMenu(false);
                              }}
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

          {page === "Moderation" && (
            <ModerationView
              selectedServer={selectedServer}
              serverDetails={serverDetails}
              guildSettings={guildSettings}
              settingsLoading={settingsLoading}
              settingsSaving={settingsSaving}
              settingsError={settingsError}
              settingsMessage={settingsMessage}
              onSave={updateModerationSettings}
            />
          )}

          {page === "Logs" && (
            <LogsView
              selectedServer={selectedServer}
              serverDetails={serverDetails}
              guildSettings={guildSettings}
              settingsLoading={settingsLoading}
              settingsSaving={settingsSaving}
              settingsError={settingsError}
              settingsMessage={settingsMessage}
              onSave={updateModerationSettings}
            />
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

                    <div className="language-setting">
                      <div className="language-setting-copy">
                        <b>{dashboardLanguage === "ar" ? "لغة لوحة التحكم" : "Dashboard Language"}</b>
                        <small>{dashboardLanguage === "ar" ? "اختر اللغة التي تريد استخدامها في لوحة التحكم." : "Choose the language you want to use across the dashboard."}</small>
                      </div>

                      <select
                        className="select language-select"
                        value={dashboardLanguage}
                        onChange={event => setDashboardLanguage(event.target.value)}
                        aria-label="Dashboard language"
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
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

          {page === "Tickets" && (
            <div className="settings-page">
              {!selectedServer ? (
                <div className="panel placeholder">
                  <Ticket />
                  <h2>Select a server first</h2>
                  <p>Choose a server before configuring its ticket system.</p>
                  <button className="primary" onClick={backToServers}>
                    <Server size={16} />
                    Choose Server
                  </button>
                </div>
              ) : settingsLoading || detailsLoading ? (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading ticket settings...</h2>
                  <p>Retrieving your server channels and saved settings.</p>
                </div>
              ) : (
                <>
                  <section className="panel" style={{ marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <div>
                        <b>Discord Server Data</b>
                        <p style={{ margin: "5px 0 0", color: "#aaa4b8" }}>
                          {allChannels.length} channels · {allChannels.filter(channel => Number(channel.type) === 4).length} categories · {allRoles.length} roles loaded
                        </p>
                      </div>
                      <button type="button" onClick={refreshServerDetails} disabled={detailsLoading} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.4)", background: "rgba(145,90,255,0.14)", color: "#d8c5ff", cursor: detailsLoading ? "not-allowed" : "pointer" }}>
                        <RefreshCw size={15} className={detailsLoading ? "spin" : ""} />
                        {detailsLoading ? "Refreshing..." : "Refresh Channels & Roles"}
                      </button>
                    </div>
                    {detailsError && (
                      <p style={{ color: "#ff8585", margin: "12px 0 0" }}>
                        Discord data could not be loaded: {detailsError}. Check that DISCORD_BOT_TOKEN is set in Vercel and that the bot is a member of this server, then refresh.
                      </p>
                    )}
                    {!detailsError && allChannels.length === 0 && allRoles.length === 0 && (
                      <p style={{ color: "#ffbd75", margin: "12px 0 0" }}>
                        Discord returned no channels or roles. Make sure the bot has been added to this server and refresh the data.
                      </p>
                    )}
                  </section>

                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <b>Ticket System</b>
                        <p>Configure where tickets are created and who can manage them.</p>
                      </div>
                      <Ticket />
                    </div>

                    <div className="server-data-row" style={{ marginTop: "18px" }}>
                      <div style={{ flex: 1 }}>
                        <b>Enable Ticket System</b>
                        <small style={{ display: "block", marginTop: "4px" }}>
                          Allow members to create support tickets.
                        </small>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(guildSettings.systems?.tickets)}
                        disabled={settingsSaving}
                        onChange={e => setGuildSettings(old => ({
                          ...old,
                          systems: { ...old.systems, tickets: e.target.checked }
                        }))}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "22px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px" }}>Ticket Category</label>
                        <select
                          value={guildSettings.tickets?.categoryId || ""}
                          onChange={e => updateTicketSetting("categoryId", e.target.value)}
                          style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "#171321", color: "#fff" }}
                        >
                          <option value="">Select a category</option>
                          {guildSettings.tickets?.categoryId &&
                            !(serverDetails?.channels || []).some(channel =>
                              String(channel.id) === String(guildSettings.tickets.categoryId) &&
                              Number(channel.type) === 4
                            ) && (
                              <option value={String(guildSettings.tickets.categoryId)}>
                                Saved category ({guildSettings.tickets.categoryId})
                              </option>
                            )}
                          {(serverDetails?.channels || []).filter(channel => Number(channel.type) === 4).map(channel => (
                            <option key={channel.id} value={channel.id}>{channel.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px" }}>Panel Channel</label>
                        <select
                          value={guildSettings.tickets?.panelChannelId || ""}
                          onChange={e => updateTicketSetting("panelChannelId", e.target.value)}
                          style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "#171321", color: "#fff" }}
                        >
                          <option value="">Use command channel</option>
                          {guildSettings.tickets?.panelChannelId &&
                            !(serverDetails?.channels || []).some(channel =>
                              String(channel.id) === String(guildSettings.tickets.panelChannelId) &&
                              [0, 5].includes(Number(channel.type))
                            ) && (
                              <option value={String(guildSettings.tickets.panelChannelId)}>
                                Saved channel ({guildSettings.tickets.panelChannelId})
                              </option>
                            )}
                          {(serverDetails?.channels || []).filter(channel => [0, 5].includes(Number(channel.type))).map(channel => (
                            <option key={channel.id} value={channel.id}>#{channel.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px" }}>Staff Role</label>
                        <select
                          value={guildSettings.tickets?.staffRoleId || ""}
                          onChange={e => updateTicketSetting("staffRoleId", e.target.value)}
                          style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "#171321", color: "#fff" }}
                        >
                          <option value="">Use Manage Server permission</option>
                          {(serverDetails?.roles || []).filter(role => String(role.id) !== String(selectedServer?.id)).map(role => (
                            <option key={role.id} value={role.id}>@{role.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px" }}>Ticket Log Channel</label>
                        <select
                          value={guildSettings.tickets?.logChannelId || ""}
                          onChange={e => updateTicketSetting("logChannelId", e.target.value)}
                          style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "#171321", color: "#fff" }}
                        >
                          <option value="">No log channel</option>
                          {guildSettings.tickets?.logChannelId &&
                            !(serverDetails?.channels || []).some(channel =>
                              String(channel.id) === String(guildSettings.tickets.logChannelId) &&
                              [0, 5].includes(Number(channel.type))
                            ) && (
                              <option value={String(guildSettings.tickets.logChannelId)}>
                                Saved channel ({guildSettings.tickets.logChannelId})
                              </option>
                            )}
                          {(serverDetails?.channels || []).filter(channel => [0, 5].includes(Number(channel.type))).map(channel => (
                            <option key={channel.id} value={channel.id}>#{channel.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>Ticket Image</b>
                        <p>This image is sent as a normal image message whenever a new ticket is opened.</p>
                      </div>
                      <ImageIcon />
                    </div>

                    <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      {ticketImage?.dataUrl ? (
                        <img
                          src={ticketImage.dataUrl}
                          alt="Ticket image preview"
                          style={{ display: "block", width: "100%", maxWidth: "620px", maxHeight: "360px", objectFit: "contain", borderRadius: "10px", border: "1px solid rgba(145,90,255,0.25)", background: "rgba(0,0,0,0.2)" }}
                        />
                      ) : (
                        <div style={{ width: "100%", maxWidth: "620px", minHeight: "150px", display: "grid", placeItems: "center", border: "1px dashed rgba(145,90,255,0.4)", borderRadius: "10px", color: "#aaa4b8", background: "rgba(145,90,255,0.05)" }}>
                          <div style={{ textAlign: "center" }}>
                            <ImageIcon size={28} />
                            <p style={{ marginTop: "8px" }}>No ticket image uploaded</p>
                          </div>
                        </div>
                      )}

                      <small style={{ color: "#aaa4b8", lineHeight: 1.6 }}>
                        PNG, JPG or WebP · Maximum 2 MB. No template, white circle, or special layout is required.
                      </small>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 16px", borderRadius: "9px", background: "rgba(145,90,255,0.16)", border: "1px solid rgba(145,90,255,0.4)", color: "#d8c5ff", cursor: ticketImageSaving ? "not-allowed" : "pointer", fontWeight: 700, opacity: ticketImageSaving ? 0.6 : 1 }}>
                          <Upload size={16} />
                          {ticketImageSaving ? "Uploading..." : "Upload Image"}
                          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadTicketImage} disabled={ticketImageSaving} style={{ display: "none" }} />
                        </label>

                        {ticketImage && (
                          <button type="button" onClick={removeTicketImage} disabled={ticketImageSaving} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 16px", borderRadius: "9px", background: "rgba(255,90,90,0.08)", border: "1px solid rgba(255,100,100,0.3)", color: "#ff9b9b", cursor: "pointer" }}>
                            <Trash2 size={16} /> Remove Image
                          </button>
                        )}
                      </div>

                      {ticketImageLoading && <small style={{ color: "#aaa4b8" }}>Loading saved image...</small>}
                      {ticketImageError && <p style={{ color: "#ff8585", margin: 0 }}>{ticketImageError}</p>}
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>Ticket Commands</b>
                        <p>Set the ticket command prefix, aliases, and availability.</p>
                      </div>
                      <SlidersHorizontal />
                    </div>

                    <div style={{ marginTop: "18px", maxWidth: "320px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Ticket Command Prefix</label>
                      <input
                        value={guildSettings.tickets?.prefix ?? "-"}
                        maxLength={5}
                        onChange={e => updateTicketSetting("prefix", e.target.value)}
                        placeholder="-"
                        style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                      />
                      <small style={{ display: "block", marginTop: "7px", color: "#8f899b" }}>
                        This prefix is used only by ticket commands.
                      </small>
                    </div>

                    <div style={{ display: "grid", gap: "14px", marginTop: "22px" }}>
                      {[
                        ["rename", "Rename Ticket", "Change the ticket channel name."],
                        ["add", "Add Member", "Give a member access to the ticket."],
                        ["remove", "Remove Member", "Remove a member's ticket access."],
                        ["close", "Close Ticket", "Close a ticket without deleting it."],
                        ["delete", "Delete Ticket", "Delete a ticket channel."],
                        ["come", "Call Member", "DM a member with a link to this ticket."]
                      ].map(([key, label, description]) => {
                        const command = guildSettings.tickets?.commands?.[key] || {
                          enabled: true,
                          aliases: [key]
                        };
                        const aliases = Array.isArray(command.aliases) && command.aliases.length
                          ? command.aliases
                          : [key];

                        return (
                          <div key={key} style={{ padding: "16px", border: "1px solid rgba(145,90,255,0.2)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                              <div>
                                <b>{label}</b>
                                <small style={{ display: "block", marginTop: "4px", color: "#8f899b" }}>{description}</small>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateTicketCommand(key, { enabled: !command.enabled })}
                                disabled={settingsSaving}
                                style={{ border: "1px solid", borderColor: command.enabled ? "rgba(80,220,140,0.4)" : "rgba(255,110,110,0.35)", background: command.enabled ? "rgba(80,220,140,0.12)" : "rgba(255,110,110,0.10)", color: command.enabled ? "#73e6a2" : "#ff8585", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontWeight: 700 }}
                              >
                                {command.enabled ? "Active" : "Inactive"}
                              </button>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "16px", marginBottom: "9px" }}>
                              <label style={{ color: "#c9c2d5", fontSize: "12px" }}>Command aliases</label>
                              <button
                                type="button"
                                onClick={() => addTicketAlias(key)}
                                title={`Add ${label} alias`}
                                style={{ display: "inline-flex", alignItems: "center", gap: "5px", border: "1px solid rgba(145,90,255,0.35)", background: "rgba(145,90,255,0.13)", color: "#c7a8ff", borderRadius: "8px", padding: "6px 10px", cursor: "pointer" }}
                              >
                                <Plus size={15} /> Add alias
                              </button>
                            </div>

                            <div style={{ display: "grid", gap: "8px" }}>
                              {aliases.map((alias, aliasIndex) => (
                                <div key={`${key}-${aliasIndex}`} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <span style={{ color: "#a99dbb", fontSize: "13px" }}>{guildSettings.tickets?.prefix || "-"}</span>
                                  <input
                                    value={alias}
                                    maxLength={32}
                                    onChange={e => updateTicketAlias(key, aliasIndex, e.target.value)}
                                    placeholder={`${key} alias`}
                                    style={{ flex: 1, minWidth: 0, padding: "10px", borderRadius: "8px", border: "1px solid rgba(145,90,255,0.25)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeTicketAlias(key, aliasIndex)}
                                    disabled={aliases.length <= 1}
                                    title="Remove alias"
                                    style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid rgba(255,110,110,0.25)", background: "rgba(255,110,110,0.08)", color: "#ff8585", cursor: aliases.length <= 1 ? "not-allowed" : "pointer", opacity: aliases.length <= 1 ? 0.35 : 1 }}
                                  >
                                    <X size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>Ticket Panel Appearance</b>
                        <p>Customize the message members see when opening a ticket.</p>
                      </div>
                      <SlidersHorizontal />
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Panel Title</label>
                      <input
                        value={guildSettings.tickets?.panelTitle ?? "JONY OS Support"}
                        maxLength={100}
                        onChange={e => updateTicketSetting("panelTitle", e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                      />
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Panel Description</label>
                      <textarea
                        value={guildSettings.tickets?.panelDescription ?? "Press the button below to open a ticket."}
                        maxLength={1000}
                        rows={4}
                        onChange={e => updateTicketSetting("panelDescription", e.target.value)}
                        style={{ width: "100%", resize: "vertical", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                      />
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Button Label</label>
                      <input
                        value={guildSettings.tickets?.buttonLabel ?? "Create Ticket"}
                        maxLength={80}
                        onChange={e => updateTicketSetting("buttonLabel", e.target.value)}
                        style={{ width: "100%", maxWidth: "420px", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                      />
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>Come Command DM</b>
                        <p>Configure the private message sent when staff use the come command.</p>
                      </div>
                      <MessageSquare />
                    </div>

                    <div className="server-data-row" style={{ marginTop: "18px" }}>
                      <div style={{ flex: 1 }}>
                        <b>Enable Come Command</b>
                        <small style={{ display: "block", marginTop: "4px" }}>
                          Allow staff to DM a member with the current ticket link.
                        </small>
                      </div>
                      <input
                        type="checkbox"
                        checked={guildSettings.tickets?.come?.enabled !== false}
                        disabled={settingsSaving}
                        onChange={e => updateTicketSetting("come", {
                          ...(guildSettings.tickets?.come || {}),
                          enabled: e.target.checked
                        })}
                      />
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>DM Message Template</label>
                      <textarea
                        value={guildSettings.tickets?.come?.message ?? "Hello {user}! A staff member needs you in your ticket: {ticket}"}
                        maxLength={1800}
                        rows={5}
                        onChange={e => updateTicketSetting("come", {
                          ...(guildSettings.tickets?.come || {}),
                          message: e.target.value
                        })}
                        placeholder="Hello {user}! Please join your ticket: {ticket}"
                        style={{ width: "100%", resize: "vertical", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                      />
                      <small style={{ display: "block", marginTop: "8px", color: "#8f899b" }}>
                        Placeholders: <code>{"{user}"}</code>, <code>{"{server}"}</code>, <code>{"{ticket}"}</code>, <code>{"{channel}"}</code>.
                      </small>
                    </div>
                  </section>

                  {settingsError && <p style={{ color: "#ff7777", marginTop: "15px" }}>{settingsError}</p>}
                  {settingsMessage && <p style={{ color: "#73e6a2", marginTop: "15px" }}>{settingsMessage}</p>}

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


          {page === "Welcome" && (
            <div className="settings-page">
              {!selectedServer ? (
                <div className="panel placeholder">
                  <Users />
                  <h2>Select a server first</h2>
                  <p>Choose a server before configuring welcome messages.</p>
                  <button className="primary" onClick={backToServers}>
                    <Server size={16} />
                    Choose Server
                  </button>
                </div>
              ) : settingsLoading || detailsLoading ? (
                <div className="panel placeholder">
                  <Activity className="spin" />
                  <h2>Loading welcome settings...</h2>
                  <p>Retrieving your server channels and saved settings.</p>
                </div>
              ) : (
                <>
                  <section className="panel" style={{ marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <div>
                        <b>Discord Server Data</b>
                        <p style={{ margin: "5px 0 0", color: "#aaa4b8" }}>
                          {allChannels.length} channels · {allRoles.length} roles loaded
                        </p>
                      </div>
                      <button type="button" onClick={refreshServerDetails} disabled={detailsLoading} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.4)", background: "rgba(145,90,255,0.14)", color: "#d8c5ff", cursor: detailsLoading ? "not-allowed" : "pointer" }}>
                        <RefreshCw size={15} className={detailsLoading ? "spin" : ""} />
                        {detailsLoading ? "Refreshing..." : "Refresh Channels & Roles"}
                      </button>
                    </div>
                    {detailsError && (
                      <p style={{ color: "#ff8585", margin: "12px 0 0" }}>
                        Discord data could not be loaded: {detailsError}. Check that DISCORD_BOT_TOKEN is set in Vercel and that the bot is a member of this server, then refresh.
                      </p>
                    )}
                    {!detailsError && allChannels.length === 0 && allRoles.length === 0 && (
                      <p style={{ color: "#ffbd75", margin: "12px 0 0" }}>
                        Discord returned no channels or roles. Make sure the bot has been added to this server and refresh the data.
                      </p>
                    )}
                  </section>

                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <b>Welcome System</b>
                        <p>Send a custom greeting when someone joins your Discord server.</p>
                      </div>
                      <Users />
                    </div>

                    <div className="server-data-row" style={{ marginTop: "18px" }}>
                      <div style={{ flex: 1 }}>
                        <b>Enable Welcome System</b>
                        <small style={{ display: "block", marginTop: "4px" }}>
                          Turn automatic welcome messages on or off.
                        </small>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(guildSettings.systems?.welcome)}
                        disabled={settingsSaving}
                        onChange={e => setGuildSettings(old => ({
                          ...old,
                          systems: { ...old.systems, welcome: e.target.checked }
                        }))}
                      />
                    </div>

                    <div style={{ marginTop: "22px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Welcome Channel</label>
                      <select
                        value={guildSettings.welcome?.channelId || ""}
                        onChange={e => updateWelcomeSetting("channelId", e.target.value)}
                        disabled={settingsSaving}
                        style={{ width: "100%", maxWidth: "520px", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "#171321", color: "#fff" }}
                      >
                        <option value="">Select a channel</option>
                        {(serverDetails?.channels || []).filter(channel => [0, 5].includes(Number(channel.type))).map(channel => (
                          <option key={channel.id} value={channel.id}>#{channel.name}</option>
                        ))}
                      </select>
                      <small style={{ display: "block", marginTop: "7px", color: "#8f899b" }}>
                        The bot must have permission to view and send messages in this channel.
                      </small>
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>Welcome Image Template</b>
                        <p>Upload a design with a white or light-gray area for the member avatar. If no suitable area is detected, the original image is sent unchanged.</p>
                      </div>
                      <ImageIcon />
                    </div>

                    <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      {welcomeTemplate?.dataUrl ? (
                        <img
                          src={welcomeTemplate.dataUrl}
                          alt="Welcome template preview"
                          style={{ display: "block", width: "100%", maxWidth: "620px", maxHeight: "360px", objectFit: "contain", borderRadius: "10px", border: "1px solid rgba(145,90,255,0.25)", background: "rgba(0,0,0,0.2)" }}
                        />
                      ) : (
                        <div style={{ width: "100%", maxWidth: "620px", minHeight: "150px", display: "grid", placeItems: "center", border: "1px dashed rgba(145,90,255,0.4)", borderRadius: "10px", color: "#aaa4b8", background: "rgba(145,90,255,0.05)" }}>
                          <div style={{ textAlign: "center" }}>
                            <ImageIcon size={28} />
                            <p style={{ marginTop: "8px" }}>No welcome image uploaded</p>
                          </div>
                        </div>
                      )}

                      <small style={{ color: "#aaa4b8", lineHeight: 1.6 }}>
                        PNG, JPG or WebP · Maximum 2 MB. A white or light-gray connected placeholder area is optional. If no suitable area is found, the original image is sent unchanged.
                      </small>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 16px", borderRadius: "9px", background: "rgba(145,90,255,0.16)", border: "1px solid rgba(145,90,255,0.4)", color: "#d8c5ff", cursor: welcomeTemplateSaving ? "not-allowed" : "pointer", fontWeight: 700, opacity: welcomeTemplateSaving ? 0.6 : 1 }}>
                          <Upload size={16} />
                          {welcomeTemplateSaving ? "Uploading..." : "Upload Image"}
                          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadWelcomeTemplate} disabled={welcomeTemplateSaving} style={{ display: "none" }} />
                        </label>

                        {welcomeTemplate && (
                          <button type="button" onClick={removeWelcomeTemplate} disabled={welcomeTemplateSaving} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 16px", borderRadius: "9px", background: "rgba(255,90,90,0.08)", border: "1px solid rgba(255,100,100,0.3)", color: "#ff9b9b", cursor: "pointer" }}>
                            <Trash2 size={16} /> Remove Image
                          </button>
                        )}
                      </div>

                      {welcomeTemplateLoading && <small style={{ color: "#aaa4b8" }}>Loading saved image...</small>}
                      {welcomeTemplateError && <p style={{ color: "#ff8585", margin: 0 }}>{welcomeTemplateError}</p>}
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>Welcome Message</b>
                        <p>Customize the message sent to every new member.</p>
                      </div>
                      <MessageSquare />
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Message Template</label>
                      <textarea
                        value={guildSettings.welcome?.message ?? "Welcome {user} to {server}!"}
                        maxLength={1800}
                        rows={5}
                        onChange={e => updateWelcomeSetting("message", e.target.value)}
                        placeholder="Welcome {user} to {server}!"
                        style={{ width: "100%", resize: "vertical", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                      />
                      <small style={{ display: "block", marginTop: "8px", color: "#aaa4b8" }}>
                        Available placeholders: <code>{"{user}"}</code> for the member mention and <code>{"{server}"}</code> for your server name.
                      </small>
                    </div>

                    <div style={{ marginTop: "18px", padding: "16px", borderRadius: "10px", background: "rgba(145,90,255,0.08)", border: "1px solid rgba(145,90,255,0.2)" }}>
                      <b style={{ display: "block", marginBottom: "8px" }}>Message Preview</b>
                      <p style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "#d8d0e5" }}>
                        {(guildSettings.welcome?.message || "Welcome {user} to {server}!")
                          .replaceAll("{user}", "@NewMember")
                          .replaceAll("{username}", "NewMember")
                          .replaceAll("{server}", serverDetails?.name || selectedServer?.name || "Your Server")
                          .replaceAll("{count}", "123")}
                      </p>
                    </div>
                  </section>

                  <section className="panel" style={{ marginTop: "18px" }}>
                    <div className="panel-head">
                      <div>
                        <b>Embed Appearance</b>
                        <p>Customize the welcome card sent by JONY OS.</p>
                      </div>
                      <SlidersHorizontal />
                    </div>

                    <div className="server-data-row" style={{ marginTop: "18px" }}>
                      <div style={{ flex: 1 }}>
                        <b>Use Embed</b>
                        <small style={{ display: "block", marginTop: "4px" }}>Send the welcome message as a rich Discord embed.</small>
                      </div>
                      <input
                        type="checkbox"
                        checked={guildSettings.welcome?.useEmbed !== false}
                        onChange={e => updateWelcomeSetting("useEmbed", e.target.checked)}
                      />
                    </div>

                    <div className="server-data-row" style={{ marginTop: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <b>Show Member Avatar</b>
                        <small style={{ display: "block", marginTop: "4px" }}>Display the new member's avatar in the embed.</small>
                      </div>
                      <input
                        type="checkbox"
                        checked={guildSettings.welcome?.showAvatar !== false}
                        onChange={e => updateWelcomeSetting("showAvatar", e.target.checked)}
                      />
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Embed Title</label>
                      <input
                        value={guildSettings.welcome?.embedTitle ?? "Welcome to {server}!"}
                        maxLength={200}
                        onChange={e => updateWelcomeSetting("embedTitle", e.target.value)}
                        placeholder="Welcome to {server}!"
                        style={{ width: "100%", maxWidth: "520px", padding: "12px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.3)", background: "rgba(255,255,255,0.04)", color: "#fff" }}
                      />
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Embed Color</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="color"
                          value={guildSettings.welcome?.embedColor || "#8b5cf6"}
                          onChange={e => updateWelcomeSetting("embedColor", e.target.value)}
                          style={{ width: "54px", height: "42px", padding: "3px", border: "1px solid rgba(145,90,255,0.3)", borderRadius: "8px", background: "transparent", cursor: "pointer" }}
                        />
                        <code>{guildSettings.welcome?.embedColor || "#8b5cf6"}</code>
                      </div>
                    </div>
                  </section>

                  {settingsError && <p style={{ color: "#ff7777", marginTop: "15px" }}>{settingsError}</p>}
                  {settingsMessage && <p style={{ color: "#73e6a2", marginTop: "15px" }}>{settingsMessage}</p>}

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
                    <button
                      className="primary"
                      onClick={() => saveGuildSettings(guildSettings)}
                      disabled={settingsSaving || welcomeTestLoading}
                    >
                      {settingsSaving ? "Saving..." : "Save Welcome Settings"}
                    </button>
                    <button
                      type="button"
                      onClick={testWelcome}
                      disabled={settingsSaving || welcomeTestLoading || !guildSettings.welcome?.channelId}
                      style={{ padding: "11px 18px", borderRadius: "9px", border: "1px solid rgba(145,90,255,0.4)", background: "rgba(145,90,255,0.14)", color: "#d8c5ff", cursor: "pointer", fontWeight: 700 }}
                    >
                      {welcomeTestLoading ? "Sending test..." : "Test Welcome"}
                    </button>
                  </div>
                  {welcomeTestMessage && (
                    <p style={{ color: welcomeTestMessage.includes("successfully") ? "#73e6a2" : "#ff8585", marginTop: "12px" }}>
                      {welcomeTestMessage}
                    </p>
                  )}
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

          {![
            "Servers",
            "Server Dashboard",
            "Systems",
            "Tickets",
            "Welcome",
            "Analytics",
            "Settings"
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
