import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import MainLayout from 'src/layouts/MainLayout';
import DashboardView from 'src/views/share/DashboardView';
import NotFoundView from 'src/views/errors/NotFoundView';
import SettingsView from 'src/views/settings/SettingsView';
import ReceiveView from 'src/views/receive/ReceiveView';
const routes = [{
        path: 'app',
        element: < DashboardLayout / > ,
        children: [
            { path: 'dashboard', element: < DashboardView / > },
            { path: 'receive', element: < ReceiveView selectFacingMode = {"front"} / > },
            { path: 'settings', element: < SettingsView / > },
            { path: '*', element: < Navigate to = "/404" / > }
        ]
    },
    {
        path: '/',
        element: < MainLayout / > ,
        children: [
            { path: '404', element: < NotFoundView / > },
            { path: '/', element: < Navigate to = "/app/dashboard" / > },
            { path: '*', element: < Navigate to = "/404" / > }
        ]
    }
];

export default routes;