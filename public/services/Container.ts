/**
 * Dependency Injection Container
 * 
 * Manages service instances and their dependencies.
 * Provides clean separation and testability.
 */

export class ServiceContainer {
    private services = new Map<string, any>()
    private factories = new Map<string, () => any>()

    /**
     * Register a service factory
     */
    register<T>(token: string, factory: () => T): void {
        this.factories.set(token, factory)
    }

    /**
     * Get service instance (singleton)
     */
    get<T>(token: string): T {
        if (!this.services.has(token)) {
            const factory = this.factories.get(token)
            if (!factory) {
                throw new Error(`Service ${token} not registered`)
            }
            this.services.set(token, factory())
        }
        return this.services.get(token)
    }

    /**
     * Clear all services (for testing)
     */
    clear(): void {
        this.services.clear()
        this.factories.clear()
    }
}