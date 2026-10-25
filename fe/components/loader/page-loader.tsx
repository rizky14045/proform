import { SiteLogo } from "../svg";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
      {/* Logo on top */}
      <div className="mb-4">
        <SiteLogo className="h-12 w-12 text-primary mx-auto" />
      </div>

      {/* Spinner and text in row */}
      <div className="flex items-center gap-2">
        {/* Spinner */}
        <div className="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>

        {/* Loading text */}
        <p className="text-white text-lg font-semibold tracking-wider">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
