# Answers

## 1. What is the difference between Component and PureComponent? give an example where it might break my app.

`PureComponent` is same as `Component`, it has `shouldComponentUpdate` method implementation with shallow comparison of props and state
Cases when to be careful

- If `PureComponent` has complex props or state structure, update might be false-positively skipped because of shallow comparison
- If `PureComponent` rerender skipped, all its children won't be updated as well. So all of them should be PureComponents as well

## 2. Context + ShouldComponentUpdate might be dangerous. Can think of why is that?

Context Consumers rerendered each time when Context Provider's value changed, even if its parent is PureComponent, so that might cause unexpected re-renders

```tsx

<MyContextProvider value={{...}}>
  // <...>

  // -> skips update
  <MyPureComponent>

    // -> will be updated
    <MyContextConsumer />

  </MyPureComponent>

  // <...>
</MyContextProvider>

```

## 3. Describe 3 ways to pass information from a component to its PARENT.

1. using parent context

```tsx
const Parent = () => {
  const handler = (childData) => {
    // handle data from child
  };

  return (
    <MyContext.Provider value={{ handler }}>
      <Child />
    </MyContext.Provider>
  );
};

const Child = () => {
  const { handler } = useContext(MyContext);

  useEffect(() => {
    // ...
    handler(childData);
    // ...
  }, []);

  // ...
};
```

2. passing handler callback as a child prop

```tsx
const Parent = () => {
  const handler = (childData) => {
    // handle data from child
  };

  return <Child onSomeEvent={handler} />;
};

const Child = ({ handler }) => {
  useEffect(() => {
    // ...
    handler(childData);
    // ...
  }, []);

  // ...
};
```

3. usning global event listener

```tsx
const EVENT_KEY = "my-custom-event";

const Parent = () => {
  useEffect(() => {
    const handler = (childData) => {
      // handle data from child
    };

    document.addEventListener(EVENT_KEY, handler);
    return () => document.removeEventListener(EVENT_KEY, handler);
  }, []);

  return <Child />;
};

const Child = () => {
  useEffect(() => {
    // ...
    document.dispatchEvent(
      new CustomEvent(EVENT_KEY, {
        data: childData,
      })
    );
    // ...
  }, []);

  // ...
};
```

## 4. Give 2 ways to prevent components from re-rendering.

1. If Component is pure function (returns same result if props not changed), HOC `React.memo` can be used. If props not changed it will return previously rendered result

2. For class components, `shouldComponentUpdate` can be used where more complex rules can be definedbasing on next props and next state (or PureComponent, if shallow comparison of props and state is enough)

## 5. What is a fragment and why do we need it? Give an example where it might break my app.

Fragment (`<React.Fragment>` or `<>...</>`) is a react node, which allows to return list of child components without creating new DOM node

```tsx
<>
  <div>...</div>
  <div>...</div>
  <div>...</div>
</>

// will result in

<div>...</div>
<div>...</div>
<div>...</div>
```

## 6. Give 3 examples of the HOC pattern.

- wrapping for additional functionality

```tsx
function withLogger(Component, logger) {
  return (props: ComponentProps) => {
    useEffect(() => {
      logger.log(...);
    }, []);

    return <Component {...props} />;
  }
}
```

- changing behaviour

```tsx
function withSkeleton(Component, skeletonParams) {
  return (isLoading: boolean, ...props: ComponentProps) => {
    if (isLoading) {
      return <Skeleton params={skeletonParams} />;
    }
    return <Component {...props} />;
  };
}
```

- passing some common functionality

```tsx
function withApiProvider(Component, apiParams) {
  return (isLoading: boolean, ...props: ComponentProps) => {
    return (
      <ApiProvider params={apiParams}>
        <Component {...props} />
      </ApiProvider>
    );
  };
}
```

## 7. what's the difference in handling exceptions in promises, callbacks and async...await.

Promises: `.catch` should be used to handle thrown errors (or cases when promise was rejected)

```ts
// we can log and throw error further
promise.then(...).catch((error) => {
  log(error);
  throw error;
});


// we can avoid breaking, by returning some fallback value, so Promise will be resolved
promise.then(...).catch((error) => {
  log(error);
  return { ... };
});

// if we have chained promises we can have single catch for all of then
promise0
  .then(promise1)
  .then(promise2)
  .then(promise3)
  .catch((err) => {
    // ...
  });

// we can define finally handler, which will be called regardles of promise result
promise.then(...).catch(...).finally(() => {
  console.log('all done');
})
```

Callbacks: usually error passed as a first argument in callback

```ts
someAsyncMethod((err, result) => {
  if (err) {
    // something went wrong
  }

  // if there is no err, we are good and can process with the result
  doSomething(result);
});
```

Async-Await: we should use try/catch around await calls

```ts

async main() {
  try {
    const result1 = await fetchData1();
    const result2 = await fetchData2();
    const result3 = await fetchData3();
  } catch (err) {
    // if one of async calls fails, error will be caught here
  }
}

main();

```

## 8. How many arguments does setState take and why is it async.

```ts
function setState<State>(newState: State, callback?: () => void): void;

function setState<State, Props>((state: State, props: Props) => State, callback?: () => void): void;
```

- first argument might be new state object or updater function, which gets previous state and props, and should return new state

- second argument is an optional callback function, which will be called after performing state update

`setState` is always asyncronous, because internally react performs some optimizations and might batch multiple setState calls in one to prevent unnecessary re-renders. That is why we should use callback in case if we want to get new state value right after updating it

## 9. List the steps needed to migrate a Class to Function Component.

- replace `class` with `function`
- replace state declaration from constructor to useState hook usage (also state structure refactoring might be needed)
- replace lifecycle methods (componentDidMount, componentDidUpdate and etc) with effect hooks. Also some refactoring might be needed
- replace all references to `this.state` and `this.props`
- replace render method with return statement

## 10. List a few ways styles can be used with components.

- `style` object to set inline styles

```tsx
<div style={{ color: "#f00", padding: 8 }}>text</div>
```

- using bundler options, to import styles and include in final bundle (e.g. style-loader, css-loader for webpack)
  additionally styles migh loaded as css modules, and unique classnames will be generated during build

- css-in-js - there are bunch of solutions, allowing to write styles directly in js code, e.g.styled-component, emotion, stitches, etc.
  also final styles are generated during build, depending on choosen library

- tailwindcss - provides bunch of utility classe and some default colors, sizes and spacings, so whole styling can be done by providing list of classes for each element, and then tailwind compiler generates optimized stylisheet based on used classes

## 11. How to render an HTML string coming from the server.

- `dangerouslySetInnerHTML` - equivalent of dom `innerHTML` in React.
  Usefull, but risky because of XSS attack possibility.

```tsx

<div dangerouslySetInnerHTML={{
  __html: '<b>text</b>'
}}>

```

- directly write using dom api
  same, might be dangerous because of XSS

```tsx
function Component() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "<b>test</b>";
    }
  }, []);

  return <div ref={ref} />;
}
```
