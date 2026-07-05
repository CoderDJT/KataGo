import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';

const rootRoute = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-gray-900">
            <Outlet />
        </div>
    ),
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: HomePage,
});

const gameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/game/$gameId',
    validateSearch: (search: Record<string, unknown>) => ({
        difficulty: (search.difficulty as string) || 'pro',
        mode: (search.mode as string) || 'ai',
    }),
    component: GamePage,
});

const routeTree = rootRoute.addChildren([indexRoute, gameRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}