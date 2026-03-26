// src/components/ErrorPage.js

const ErrorPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">Oops!</h1>
        <p className="mt-4 text-lg text-gray-600">Something went wrong.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
