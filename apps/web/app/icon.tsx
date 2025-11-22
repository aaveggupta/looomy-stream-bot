import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "8px",
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
              width: "3px",
              height: "5px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "2px",
            }}
          />
          <div
            style={{
              width: "5px",
              height: "5px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "50%",
              marginTop: "-2px",
              marginBottom: "1px",
            }}
          />
          {/* Head */}
          <div
            style={{
              width: "18px",
              height: "14px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            {/* Eyes */}
            <div
              style={{
                width: "4px",
                height: "4px",
                background: "#2563eb",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: "4px",
                height: "4px",
                background: "#2563eb",
                borderRadius: "50%",
              }}
            />
          </div>
          {/* Body */}
          <div
            style={{
              width: "14px",
              height: "6px",
              background: "rgba(255,255,255,0.9)",
              borderRadius: "2px",
              marginTop: "2px",
            }}
          />
        </div>
        {/* Chat bubble */}
        <div
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            width: "8px",
            height: "8px",
            background: "#10b981",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "3px",
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
