import React from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import Breadcrumb from './BreadCrumb';

interface RouteBreadcrumbConfig {
  path: string;
  homeLink: string;
  items: Array<{
    label: string;
    path?: string;
  }>;
}

// Pages that have their OWN header/back button — skip breadcrumbs here
const SKIP_BREADCRUMB_PATHS = [
  '/client/services/:id',
  '/client/book/:id',
  '/client/courses/:id',
  '/client/courses/:id/enroll',
  '/client/learning/:id',
  '/client/enrollment-success/:id',
  '/vendor/services/create',
  '/vendor/services/edit/:id',
  '/vendor/courses/create',
  '/vendor/courses/edit/:id',
  '/vendor/courses/:id/students',
  '/vendor/courses/:id/attendance',
];

const ROUTE_BREADCRUMBS: RouteBreadcrumbConfig[] = [
  // Client routes
  {
    path: '/client/dashboard',
    homeLink: '/client/dashboard',
    items: [{ label: 'Dashboard' }],
  },
  {
    path: '/client/services',
    homeLink: '/client/dashboard',
    items: [
      { label: 'Client Dashboard', path: '/client/dashboard' },
      { label: 'Browse Services' },
    ],
  },
  {
    path: '/client/bookings',
    homeLink: '/client/dashboard',
    items: [
      { label: 'Client Dashboard', path: '/client/dashboard' },
      { label: 'My Bookings' },
    ],
  },
  {
    path: '/client/courses',
    homeLink: '/client/dashboard',
    items: [
      { label: 'Client Dashboard', path: '/client/dashboard' },
      { label: 'Browse Courses' },
    ],
  },
  {
    path: '/client/my-courses',
    homeLink: '/client/dashboard',
    items: [
      { label: 'Client Dashboard', path: '/client/dashboard' },
      { label: 'My Courses' },
    ],
  },
  // Vendor routes
  {
    path: '/vendor/dashboard',
    homeLink: '/vendor/dashboard',
    items: [{ label: 'Vendor Dashboard' }],
  },
  {
    path: '/vendor/bookings',
    homeLink: '/vendor/dashboard',
    items: [
      { label: 'Vendor Dashboard', path: '/vendor/dashboard' },
      { label: 'My Bookings' },
    ],
  },
  {
    path: '/vendor/courses',
    homeLink: '/vendor/dashboard',
    items: [
      { label: 'Vendor Dashboard', path: '/vendor/dashboard' },
      { label: 'My Courses' },
    ],
  },
  // Admin routes
  {
    path: '/admin/dashboard',
    homeLink: '/admin/dashboard',
    items: [{ label: 'Dashboard' }],
  },
  {
    path: '/admin/users',
    homeLink: '/admin/dashboard',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'User Management' },
    ],
  },
  {
    path: '/admin/vendors',
    homeLink: '/admin/dashboard',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Vendor Management' },
    ],
  },
  {
    path: '/admin/services',
    homeLink: '/admin/dashboard',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Service Management' },
    ],
  },
  {
    path: '/admin/bookings',
    homeLink: '/admin/dashboard',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Booking Management' },
    ],
  },
  {
    path: '/admin/courses',
    homeLink: '/admin/dashboard',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Course Management' },
    ],
  },
  {
    path: '/admin/enrollments',
    homeLink: '/admin/dashboard',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Enrollment Management' },
    ],
  },
];

const RouteBreadcrumbs: React.FC = () => {
  const location = useLocation();

  // Skip breadcrumbs on pages that have their own PageHeader/back button
  const shouldSkip = SKIP_BREADCRUMB_PATHS.some((pattern) =>
    matchPath(pattern, location.pathname)
  );
  if (shouldSkip) return null;

  // Find matching breadcrumb config
  const config = ROUTE_BREADCRUMBS.find((route) =>
    matchPath(route.path, location.pathname)
  );

  if (!config) return null;

  return <Breadcrumb items={config.items} homeLink={config.homeLink} />;
};

export default RouteBreadcrumbs;