import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          fontSize: 100,
          background: "#111",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "40px",
          fontFamily: "sans-serif",
          fontWeight: "bold",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginTop: "-8px" }}>
          <span style={{ color: "#ea580c" }}>&lt;</span>
          <span style={{ margin: "0 8px" }}>J</span>
          <span style={{ color: "#ea580c" }}>&gt;</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
