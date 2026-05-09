import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';

function YouTubeAuth({ setAccessToken }) {
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setAccessToken(codeResponse.access_token);
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/youtube',
  });

  return (
    <button onClick={() => login()} className="btn btn-primary" style={{ backgroundColor: '#fff', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <FaGoogle style={{ color: '#4285F4' }} /> Login with Google
    </button>
  );
}

export default YouTubeAuth;
