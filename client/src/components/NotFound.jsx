import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem 4rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '2rem'
      }}>
        <div style={{
          fontSize: '8rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          404
        </div>
        <h1 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '1rem' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#718096', marginBottom: '0.5rem' }}>
          The page you're looking for doesn't exist.
        </p>
        <div style={{
          background: '#f7fafc',
          padding: '1rem',
          borderRadius: '10px',
          margin: '1.5rem 0',
          fontFamily: 'monospace',
          color: '#e53e3e',
          fontWeight: 600
        }}>
          {window.location.pathname}
        </div>
        <Link 
          to="/" 
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '0.9rem 2.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '50px',
            fontWeight: 600
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
