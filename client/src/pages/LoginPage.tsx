import { auth } from '../lib/auth';

export function LoginPage() {
  const handleLogin = () => {
    auth.signIn();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Realtime Chat App
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Sign in to start chatting with your friends
        </p>
        <button
          onClick={handleLogin}
          className="btn btn-primary w-full"
        >
          Sign In with Clerk
        </button>
      </div>
    </div>
  );
}
