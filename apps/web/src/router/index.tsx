import { createBrowserRouter } from 'react-router';
import AuthGuard from '@/components/AuthGuard';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

const Login = lazy(() => import('@/pages/Login'));
const Manage = lazy(() => import('@/layout/manage'));
const Dashboard = lazy(() => import('@/pages/manage/Dashboard'));

const router = createBrowserRouter([{
  path: '/',
  element: <AuthGuard />,
  children: [
    {
      path: 'manage',
      element: <Suspense fallback={<LoadingSpinner />}>
        <Manage />
      </Suspense>,
      children: [
        {
          path: 'dashboard',
          element: <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>,
        }
      ]
    }
  ],

},
{
  path: 'login',
  element: <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
}
]);

export default router;
