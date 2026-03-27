type Unsubscribe = () => void;

let currentEffect: (() => void) | null = null;
let inBatch: boolean = false;
const proxyStack = new WeakMap<object, object>();
const pendingEffects = new Set<() => void>();

export const proxy = <T extends object>(state: T): T => {
  const effectDependencies = new Map<keyof T, Set<() => void>>();
  if (proxyStack.has(state)) return proxyStack.get(state) as T;

  const _proxy = new Proxy(state, {
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      if (result) {
        if (inBatch) {
          effectDependencies.get(key as keyof T)?.forEach((effect) => {
            pendingEffects.add(effect);
          });
        } else {
          effectDependencies.get(key as keyof T)?.forEach((effect) => {
            effect();
          });
        }
      }
      return result;
    },
    get(target, key, value) {
      if (currentEffect) {
        if (!effectDependencies.has(key as keyof T)) {
          effectDependencies.set(key as keyof T, new Set());
        }
        effectDependencies.get(key as keyof T)?.add(currentEffect);
      }
      const response = Reflect.get(target, key, value);
      if (typeof response === "object" && response !== null) {
        return proxy(response);
      }
      return response;
    },
  });

  proxyStack.set(state, _proxy);
  return _proxy;
};

export const effect = (callback: () => void): Unsubscribe => {
  const wrappedCallback = () => {
    currentEffect = wrappedCallback;
    callback();
    currentEffect = null;
  };

  wrappedCallback();

  return () => {
    // TODO: Implementar la lógica de desuscripción de efectos
  };
};

type ComputedState<T extends Record<string, () => unknown>> = {
  [K in keyof T]: ReturnType<T[K]>;
};

export const computed = <T extends Record<string, () => unknown>>(
  computations: T,
): ComputedState<T> => {
  const computedState = proxy({} as ComputedState<T>);

  for (const key in computations) {
    const computation = computations[key];
    effect(() => {
      computedState[key] = computation() as ComputedState<T>[typeof key];
    });
  }
  return computedState;
};


export const batch = (callback: () => void) => {
  inBatch = true;
  callback();
  inBatch = false;
    pendingEffects.forEach((effect) => effect());
    pendingEffects.clear();
};