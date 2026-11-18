export class ClientRouter {
  constructor(routes, onRouteChange) {
    this.routes = routes;
    this.onRouteChange = onRouteChange;

    window.addEventListener('hashchange', () => this.resolve());
    window.addEventListener('DOMContentLoaded', () => this.resolve());
  }

  resolve() {
    const rawHash = window.location.hash.replace('#', '') || 'home';
    const [routeName, param] = rawHash.split('/');

    const handler = this.routes[routeName] || this.routes.home;
    this.onRouteChange(routeName, handler, param);
  }
}