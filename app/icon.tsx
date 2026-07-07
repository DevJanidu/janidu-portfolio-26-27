import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          fontSize: 20,
          background: "#111",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "6px",
          fontFamily: "sans-serif",
          fontWeight: "bold",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginTop: "-2px" }}>
          <span style={{ color: "#ea580c" }}>&lt;</span>
          <span style={{ margin: "0 1px" }}>J</span>
          <span style={{ color: "#ea580c" }}>&gt;</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
