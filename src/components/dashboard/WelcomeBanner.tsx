export default function WelcomeBanner() {
  const user = "Navdeep";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-1/2 bg-blue-100 dark:bg-blue-900 rounded-xl p-6 flex items-center justify-center text-center">
      <div>
        <h1 className="text-2xl font-bold text-blue-900 dark:text-white">
          Good morning, {user} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{today}</p>
      </div>
    </div>
  );
}
