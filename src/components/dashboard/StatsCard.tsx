type Props = {
  title: string;
  value: string;
};

export default function StatsCard({ title, value }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{value}</h2>
    </div>
  );
}
