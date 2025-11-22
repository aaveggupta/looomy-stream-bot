import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Looomy - AI Co-Pilot for YouTube Live Chat";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
          position: "relative",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "30%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            right: "20%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              borderRadius: "28px",
              position: "relative",
            }}
          >
            {/* Robot */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Antenna */}
              <div
                style={{
                  width: "8px",
                  height: "18px",
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "50%",
                  marginTop: "-6px",
                  marginBottom: "4px",
                }}
              />
              {/* Head */}
              <div
                style={{
                  width: "56px",
                  height: "44px",
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                }}
              >
                <div style={{ width: "12px", height: "12px", background: "#2563eb", borderRadius: "50%" }} />
                <div style={{ width: "12px", height: "12px", background: "#2563eb", borderRadius: "50%" }} />
              </div>
              {/* Body */}
              <div
                style={{
                  width: "42px",
                  height: "20px",
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "6px",
                  marginTop: "6px",
                }}
              />
            </div>
            {/* Chat bubble */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "24px",
                height: "24px",
                background: "#10b981",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "12px", height: "8px", background: "white", borderRadius: "50%" }} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              margin: "0 0 16px 0",
              letterSpacing: "-2px",
            }}
          >
            Looomy
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#94a3b8",
              margin: "0",
              maxWidth: "800px",
            }}
          >
            AI Co-Pilot for YouTube Live Chat
          </p>
          <p
            style={{
              fontSize: "24px",
              color: "#64748b",
              margin: "24px 0 0 0",
              maxWidth: "700px",
            }}
          >
            Deploy a smart bot that answers viewer questions in real-time
          </p>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "24px", color: "#3b82f6", fontWeight: "600" }}>
            looomy.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
