"use client";
import { useState } from "react";
import { SECURITY_FLOWS } from "@/lib/data";

const TYPE_COLORS: Record<string, string> = {
  request: "var(--primary)",
  response: "var(--success)",
  process: "var(--secondary)",
  action: "var(--warning)",
  alert: "var(--danger)",
};
const TYPE_ICONS: Record<string, string> = {
  request: "→",
  response: "←",
  process: "⚙",
  action: "▶",
  alert: "🚨",
};

export default function FlowsPage() {
  const [activeFlow, setActiveFlow] = useState(SECURITY_FLOWS[0].id);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const flow = SECURITY_FLOWS.find((f) => f.id === activeFlow)!;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <span className="gradient-text">Security Flows</span>
        </h1>
        <p style={{ color: "var(--muted)" }}>
          Visual step-by-step security flows for authentication, API keys, incident response, and more.
        </p>
      </div>

      {/* Flow Selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {SECURITY_FLOWS.map((f) => (
          <button key={f.id} onClick={() => { setActiveFlow(f.id); setActiveStep(null); }}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid", borderColor: activeFlow === f.id ? "var(--primary)" : "var(--card-border)", background: activeFlow === f.id ? "var(--primary-glow)" : "var(--card)", color: activeFlow === f.id ? "var(--primary)" : "var(--fg)", cursor: "pointer", fontWeight: activeFlow === f.id ? 700 : 400, fontSize: "0.875rem", transition: "all 0.2s" }}>
            <div style={{ fontWeight: 600 }}>{f.title}</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>{f.category}</div>
          </button>
        ))}
      </div>

      {/* Flow Header */}
      <div className="card anim-fadeup" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>{flow.title}</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{flow.description}</p>
        <div style={{ marginTop: 10, display: "flex", gap: 12, fontSize: "0.75rem", color: "var(--muted)" }}>
          <span>📋 {flow.steps.length} steps</span>
          <span>🏷️ {flow.category}</span>
          <span>💡 Click any step to expand details</span>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="card anim-fadeup delay-1" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem" }}>Flow Diagram</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {flow.steps.map((step, i) => {
            const isActive = activeStep === step.id;
            const color = TYPE_COLORS[step.type] || "var(--primary)";
            return (
              <div key={step.id}>
                <div onClick={() => setActiveStep(isActive ? null : step.id)}
                  style={{ display: "flex", gap: 12, cursor: "pointer", borderRadius: 10, padding: "10px 12px", background: isActive ? `${color}15` : "transparent", border: isActive ? `1px solid ${color}44` : "1px solid transparent", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "var(--muted-bg)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                  {/* Step number + connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: color + "22", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, color, flexShrink: 0 }}>
                      {step.id}
                    </div>
                    {i < flow.steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: `linear-gradient(to bottom, ${color}, var(--card-border))`, margin: "4px 0", opacity: 0.5 }} />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color, background: color + "15", padding: "2px 8px", borderRadius: 6 }}>
                        {TYPE_ICONS[step.type]} {step.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600 }}>{step.actor}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>→</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600 }}>{step.target}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", marginTop: 4 }}>{step.action}</div>
                    {isActive && (
                      <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, background: "var(--muted-bg)", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
                        💡 <strong>Security Note:</strong> {step.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card anim-fadeup delay-2">
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Flow Legend</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: "0.75rem", textTransform: "capitalize" }}>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
