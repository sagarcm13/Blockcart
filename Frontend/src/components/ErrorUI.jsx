// eslint-disable-next-line react/prop-types
const ErrorUI = ({ errorMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div className="mt-4 text-red-800 text-center">
        <p>Oops! Something went wrong.</p>
      </div>
      <div className=" text-red-600 text-lg font-bold py-2 px-4 rounded-md">
      {errorMessage}
      </div>
    </div>
  );
};

export default ErrorUI;