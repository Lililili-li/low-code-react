import { createBrowserRouter } from 'react-router';
import AuthGuard from '@/components/AuthGuard';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Demo from '@/pages/Demo';

const Login = lazy(() => import('@/pages/Login'));
const Layout = lazy(() => import('@/layout'));

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Project = lazy(() => import('@/pages/project/Project'));
const Application = lazy(() => import('@/pages/application/Application'));
const Components = lazy(() => import('@/pages/component/Component'));
const Images = lazy(() => import('@/pages/image/Image'));


const Design = lazy(() => import('@/pages/design/index'));

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
                path: 'project',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Project />
                  </Suspense>
                ),
              },
              {
                path: 'application',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Application />
                  </Suspense>
                ),
              },
              {
                path: 'component',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Components />
                  </Suspense>
                ),
              },
              {
                path: 'image',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Images />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
      {
        path: 'design',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Design />
          </Suspense>
        )
      }
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
  {
    path: 'demo',
    element: <Demo />
  }
]);

export default router;
