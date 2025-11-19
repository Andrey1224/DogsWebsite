import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Exotic Bulldog Legacy - Premium French & English Bulldog Breeder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF4D79 0%, #FF7FA5 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: 0,
              marginBottom: 20,
              textShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            Exotic Bulldog Legacy
          </h1>
          <p
            style={{
              fontSize: 36,
              color: '#FFFFFF',
              margin: 0,
              marginBottom: 40,
              opacity: 0.95,
              maxWidth: 900,
            }}
          >
            Premium French & English Bulldog Breeder
          </p>
          <div
            style={{
              display: 'flex',
              gap: 20,
              fontSize: 24,
              color: '#FFFFFF',
              opacity: 0.9,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>📍</span>
              <span style={{ marginLeft: 8 }}>Falkville, Alabama</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>🏆</span>
              <span style={{ marginLeft: 8 }}>Health Guaranteed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>❤️</span>
              <span style={{ marginLeft: 8 }}>Family Raised</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
