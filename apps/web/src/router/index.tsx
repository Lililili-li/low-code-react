import { createBrowserRouter } from 'react-router';
import AuthGuard from '@/components/AuthGuard';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Demo from '@/pages/Demo';

const Login = lazy(() => import('@/pages/Login'));
const Layout = lazy(() => import('@/layout'));

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Application = lazy(() => import('@/pages/application/Application'));
const Components = lazy(() => import('@/pages/component/Component'));
const FileResource = lazy(() => import('@/pages/resource/file-resource'));
const MapResource = lazy(() => import('@/pages/resource/map-resource'));

const Design = lazy(() => import('@/pages/design/index'));

const ProjectResource = lazy(() => import('@/pages/project/resource'));

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
            path: 'project',
            children: [
              {
                path: 'resource',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProjectResource />
                  </Suspense>
                ),
              },
            ],
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
            path: 'resource',
            children: [
              {
                path: 'file',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <FileResource />
                  </Suspense>
                ),
              },
              {
                path: 'map',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <MapResource />
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
        ),
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
  {
    path: 'demo',
    element: <Demo />,
  },
]);

export default router;
