import StatsCard from "../components/dashboard/StatsCard";
import TaskList from "../components/dashboard/TaskList";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";

const Home = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid lg:grid-cols-2">
        <WelcomeBanner />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <StatsCard title="Total Projects" value="5" />
          <StatsCard title="Active Tasks" value="12" />
          <StatsCard title="Completed Tasks" value="27" />
          <StatsCard title="Productivity" value="82%" />
        </div>
      </div>
      {/* <ProductivityChart /> */}
      <TaskList />
    </div>
  );
};

export default Home;
