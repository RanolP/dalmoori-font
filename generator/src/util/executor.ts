export type ReturningOrValue<T> = T | (() => T);

export async function execute<T>(input: ReturningOrValue<Generator<ReturningOrValue<Promise<T>>, void, unknown>>, poolSize: number, progress: (value: T) => void): Promise<T[]> {
  const generator = input instanceof Function ? input() : input;
  const result: T[] = [];
  const holder = {
    resolve: () => { /* do nothing */ },
    reject: (_reason: unknown) => { /* do nothing */ },
  };
  const wholePromise: Array<Promise<unknown>> = [];

  const promise = new Promise<T[]>((resolve, reject) => {
    holder.resolve = () => resolve(result);
    holder.reject = reject;
  });

  function next() {
    const nextValue = generator.next();

    if (nextValue.value) {
      const value = nextValue.value instanceof Function ? nextValue.value() : nextValue.value;
      const promise = value
        .then(v => {
          result.push(v);
          progress(v);
          if (nextValue.done) {
            holder.resolve();
          } else {
            next();
          }
          return v;
        })
        .catch(holder.reject);
      wholePromise.push(promise);
    } else if (nextValue.done) {
      Promise.all(wholePromise).then(holder.resolve);
    }

    return nextValue.done;
  }

  for (let i = 0; i < poolSize; i++) {
    if (next()) {
      break;
    }
  }

  return promise;
}
