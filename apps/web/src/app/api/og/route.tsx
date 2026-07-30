import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic params
    const title = searchParams.get('title') || 'Community Event';
    const location = searchParams.get('location') || 'Local Community';
    const date = searchParams.get('date') || 'Join us today!';
    const type = searchParams.get('type') || 'event'; // 'event' or 'registered'

    const isRegistered = type === 'registered';

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
            backgroundColor: '#FAFAF9',
            backgroundImage: 'linear-gradient(to bottom right, #228B2220, #FAFAF9, #D4AF3720)',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              padding: '60px 80px',
              borderRadius: '40px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              border: '2px solid #E5E7EB',
              maxWidth: '80%',
            }}
          >
            {/* Logo placeholder */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '25px',
                background: 'linear-gradient(to bottom right, #228B22, #D4AF37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
                boxShadow: '0 10px 25px rgba(34,139,34,0.3)',
              }}
            >
              <span style={{ color: 'white', fontSize: '60px', fontWeight: 'bold' }}>S</span>
            </div>

            <div
              style={{
                fontSize: '32px',
                color: isRegistered ? '#228B22' : '#6B7280',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '20px',
              }}
            >
              {isRegistered ? "I'M GOING TO" : "UPCOMING EVENT"}
            </div>

            <div
              style={{
                fontSize: '70px',
                fontWeight: 900,
                color: '#1C2B23',
                textAlign: 'center',
                lineHeight: 1.1,
                marginBottom: '30px',
                maxWidth: '900px',
              }}
            >
              {title}
            </div>

            <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '30px' }}>📍</span>
                <span style={{ fontSize: '32px', color: '#4B5563', fontWeight: 500 }}>{location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '30px' }}>📅</span>
                <span style={{ fontSize: '32px', color: '#4B5563', fontWeight: 500 }}>{date}</span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            position: 'absolute', 
            bottom: '40px', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#228B22',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            Sevantra — The Civic Engagement Platform
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
