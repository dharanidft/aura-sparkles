import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Aura Sparkles — Handcrafted Scented Soy Candles & Home Fragrance";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAF7F2",
          backgroundImage: "radial-gradient(circle at 50% 30%, #FFFFFF 0%, #FAF7F2 70%, #F0E6D8 100%)",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Subtle Decorative Luxury Border */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1.5px solid #EAE0D5",
            borderRadius: 24,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: "1px solid rgba(182, 154, 98, 0.35)",
            borderRadius: 18,
            display: "flex",
          }}
        />

        {/* Brand Tagline Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#B69A62",
            }}
          />
          <span
            style={{
              color: "#B69A62",
              fontSize: 16,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Artisan Home Fragrance · Chennai
          </span>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#B69A62",
            }}
          />
        </div>

        {/* Brand Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            letterSpacing: "0.14em",
            color: "#452638",
            textAlign: "center",
            textTransform: "uppercase",
            marginBottom: "16px",
            fontFamily: "serif",
          }}
        >
          Aura Sparkles
        </div>

        {/* Slogan */}
        <div
          style={{
            fontSize: 22,
            color: "#B69A62",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "32px",
            fontWeight: 500,
          }}
        >
          Pure · Elegant · You
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: "#766E65",
            textAlign: "center",
            maxWidth: "880px",
            lineHeight: 1.5,
            marginBottom: "40px",
          }}
        >
          Hand-poured 100% soy wax candles, botanical wax sachets, and frosted glass jars crafted with pure botanicals and lead-free wicks.
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#452638",
              color: "#FFFFFF",
              padding: "10px 24px",
              borderRadius: "999px",
              fontSize: 14,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            100% Pure Soy Wax
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              border: "1px solid #EAE0D5",
              color: "#452638",
              padding: "10px 24px",
              borderRadius: "999px",
              fontSize: 14,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Clean Lead-Free Cotton Wicks
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              border: "1px solid #EAE0D5",
              color: "#452638",
              padding: "10px 24px",
              borderRadius: "999px",
              fontSize: 14,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Pan-India Delivery
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
