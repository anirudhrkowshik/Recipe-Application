import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* The global mini-player will be added here later */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;