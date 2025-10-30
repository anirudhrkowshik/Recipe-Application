import { Outlet } from 'react-router-dom';
import MiniCookPlayer from './MiniCookPlayer';

const Layout = () => {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <main>
        <Outlet />
      </main>
      <MiniCookPlayer />
    </div>
  );
};

export default Layout;