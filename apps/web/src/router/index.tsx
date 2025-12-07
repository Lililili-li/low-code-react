import { createBrowserRouter } from 'react-router';
import AuthGuard from '@/components/AuthGuard';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

const Login = lazy(() => import('@/pages/Login'));
const Layout = lazy(() => import('@/layout'));



const Dashboard = lazy(() => import('@/pages/manage/Dashboard'));
const Projects = lazy(() => import('@/pages/manage/resource/projects/Projects'))
const Components = lazy(() => import('@/pages/manage/resource/Components'))
const Images = lazy(() => import('@/pages/manage/resource/Images'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: 'manage',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Layout />
          </Suspense>
        ),
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: 'resource',
            children: [
              {
                path: 'projects',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Projects />
                  </Suspense>
                ),
              },
              {
                path: 'components',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Components />
                  </Suspense>
                ),
              },
              {
                path: 'images',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Images />
                  </Suspense>
                ),
              }
            ]
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    ),
  },
]);

export default router;
