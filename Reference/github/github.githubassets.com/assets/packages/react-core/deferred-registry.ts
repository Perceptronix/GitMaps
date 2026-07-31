export class DeferredRegistry<T> {
  #registrationEntries = new Map<
    string,
    {
      promise: Promise<T>
      resolve: (value: T | PromiseLike<T>) => void
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reject: (reason?: any) => void
    }
  >()

  register(name: string, registration: T) {
    const entry = this.#registrationEntries.get(name)
    if (entry) {
      entry.resolve(registration)
    } else {
      const registrationWithResolvers = Promise.withResolvers<T>()
      registrationWithResolvers.resolve(registration)
      this.#registrationEntries.set(name, registrationWithResolvers)
    }
  }

  getRegistration(name: string): {
    promise: Promise<T>
    resolve: (value: T | PromiseLike<T>) => void
  } {
    const registration = this.#registrationEntries.get(name)
    if (registration) {
      return registration
    }

    const registrationWithResolvers = Promise.withResolvers<T>()
    this.#registrationEntries.set(name, registrationWithResolvers)
    return registrationWithResolvers
  }
}
