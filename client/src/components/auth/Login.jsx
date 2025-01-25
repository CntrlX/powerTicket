import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  
  const navigate = useNavigate();
  const { login, verifyOTP, resendOTP } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.userId) {
        // OTP verification needed
        setUserId(response.userId);
        setOtpRequired(true);
      } else {
        // Login successful
        navigate('/tickets');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to login');
    }

    setLoading(false);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTP(userId, otp);
      navigate('/tickets');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify OTP');
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(userId);
      setError('');
      alert('New OTP has been sent to your email');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  if (otpRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Enter OTP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter the OTP sent to your email
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
            {error && <div className="error-text text-center">{error}</div>}
            <div>
              <label htmlFor="otp" className="form-label">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                className="input-field mt-1"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-primary-600 hover:text-primary-500"
              >
                Resend OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/register" className="text-primary-600 hover:text-primary-500">
              create a new account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="error-text text-center">{error}</div>}
          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input-field mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 