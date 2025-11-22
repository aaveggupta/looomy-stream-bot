import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          borderRadius: "36px",
        }}
      >
        {/* Robot head */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Antenna */}
          <div
            style={{
              width: "12px",
              height: "28px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "6px",
            }}
          />
          <div
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "50%",
              marginTop: "-8px",
              marginBottom: "4px",
            }}
          />
          {/* Head */}
          <div
            style={{
              width: "100px",
              height: "80px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            {/* Eyes */}
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "#2563eb",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "#2563eb",
                borderRadius: "50%",
              }}
            />
          </div>
          {/* Body */}
          <div
            style={{
              width: "75px",
              height: "32px",
              background: "rgba(255,255,255,0.9)",
              borderRadius: "8px",
              marginTop: "8px",
            }}
          />
        </div>
        {/* Chat bubble */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            width: "36px",
            height: "36px",
            background: "#10b981",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "12px",
              background: "white",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
