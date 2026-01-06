# Refactor Problems & Solutions:

> <sub>_The aim of this document is to address problems in the seed bible source code which a refactor could solve reasonably._<sub>

## What problems do we have?

### Coupling:

In multiple locations throughout the seed-bible we have components which if changed or deleted would break the entire seed bible's functionality!
This is a system architecture nightmare!

Tight coupling often makes systems "All or Nothing" as in "All of it works" or "Nothing works".

It significantly decreases maintainability, and module reusability.

### Dishonest Modules & Components:

> <sub>_This contributes to the coupling issue; and is exacerbated by poor encapsulation practices._</sub>

In some locations in the seed bible, components mutate global properties (via `globalThis`) which are then used by other components, implicitly making them dishonest. This is a disaster!

There are several instances of Modules that don't explicitly define/require everything they need in order to function; they instead are tightly coupled with assumptions of higher scope dependencies.

This practice is known as dishonesty in modular environments. The reason being is because honest module's should provide functionality with no assumption that some of the things it may need are already present or accessible from its scope; instead they should explicitly request them (in most cases this is done parametrically in method or constructor calls).

### Seperations of Concern:

There are several locations in the seed-bible where a function/component may perform far too many tasks for what it nominally advertises.

There is a principle in software architecture called the Single Responsibility Principle (SRP), it states that a module (class, function, etc) should have one and only one reason to change.

In other words, there should be one responsibility per module; future changes that could be made, should be related entirely to that singular responsibility.

### Encapsulation

Encapsulation is a major cohort in the coupling issue.
Proper encapsulation is acheived by taking and making distinct parts of an application insulated from other parts.

For example globals like `globalThis` should not be accessed directly by more than one class/part of code.
As `globalThis` behaves as a bypass for encapsulation by making parts from one scope accessible anywhere else freely.

> If a need was found to use globals, an accessing/mutating class would functionally be a store/model implementation.

There are several instances of `globalThis` being uses as a form of intermediary shared scope for many seperate parts of the seed bible.
This is a disaster!

## How do we fix these problems?

### Coupling:

Tight coupling is practically a sum consequence of poor Seperation of Concern, Encapsulation, and disregard for the heuristic Law of Demeter.

Let's gain some intuition on these aspects and how they're involved in coupling.

Please take a look at the example below.

#### Tight Coupling Example:

```ts
globalThis.itemMap = new Map([[0, { createdAt: Date.now() }]]);

export function getItem(id: number) {
  if (typeof id !== "number") return null;
  return globalThis.itemMap.get(id);
}

export function getTimeSinceCreation(itemId: number): number {
  return Date.now() - getItem(itemId).createdAt;
}

const item0TimeSinceCreation = getTimeSinceCreation(0);

console.log(
  `It has been ${item0TimeSinceCreation}ms since item 0 was created!`
);
```

While this code works, there is a terrible fragility to it that stems from poor encapsulation.

Take a look at how linked (coupled) everything is, can you see how the close connections (tight coupling) creates a form of implicit dependency chain?

```
item0TimeSinceCreation (invocation result of) -> getTimeSinceCreation (implements/invokes) -> getItem (will access) -> globalThis.itemMap
```

This means any change made to `globalThis.itemMap` could effect everything up the call stack all the way to `item0TimeSinceCreation`.

As an example, let's update the `itemMap` Map to use a `string` for keys instead of a `number`,

```ts
globalThis.itemMap = new Map([["uuid-0", { createdAt: Date.now() }]]);
```

This is fine from `itemMap`'s perspective, however we now have an issue up the chain with `getItem`.

It only supports number id's...

Which means, in order to properly function and not forever return `null` it must be refactored to support (exclusively or not) a `string` id.

```ts
export function getItem(id: string) {
  if (typeof id !== "string") return null;
  return globalThis.itemMap.get(id);
}
```

Lets now take one step up further in that chain to `getTimeSinceCreation`.

`getTimeSinceCreation` expects an `itemId` parameter of type `number`; which was to proxy through to its implementation of `getItem`.

Well if left untouched you're going to get a typescript compiler error because a `number` cannot be used in place of a `string`.

So we refactor `itemId` to be of type (accept) `string`:

```ts
export function getTimeSinceCreation(itemId: string): number {
  return Date.now() - getItem(itemId).createdAt;
}
```

And finally we step out to `item0TimeSinceCreation`'s declaration, where we see an invocation of `getTimeSinceCreation`.

```ts
const item0TimeSinceCreation = getTimeSinceCreation(0);
```

The parameter supplied for `itemId` is of type `number` which is `0`.

This will always return null. So of course we need to refactor it to use a string.

```ts
const item0TimeSinceCreation = getTimeSinceCreation("uuid-0");
```

### How can we fix this fragility?

#### Start with an evaluation.

Look at the implementation quality (if implemented at all) of the principles mentioned before.

Theoretically speaking, a better implementation of said principles should always coorelate to looser coupling.

> _Heads up... this next evaluation is fairly subjective._

| Principle/Heuristic             | Quality (Poor, Okay, Good) |
| ------------------------------- | -------------------------- |
| Encapsulation                   | Poor                       |
| Seperation of Concern           | Okay                       |
| Law of Demeter                  | Poor                       |
| Single Responsibility Principle | Okay                       |

In this example a good refactor might start with focusing on breaking up that dependency chain, Encapsulation and Seperation of Concern are arguably very important starting principles.

#### Apply Principles:

Lets look at the concerns of each unit, and carefully consider other principles with respect to said concern.

We'll slowly ideate our refactor during this process.

### `getItem`

`getItem` in context of our example is concerned with getting items by their id.

Right off the bat, nominally its extremely vague, where should items be gotten from and with what expectations?

[The Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter) encourages that an object (in our case this function) should only know its own structure, and only be able to invoke methods of its friends.

This means `getItem` needs to be friends with, or be a method of, a store/model before being allowed to request a service from it.

To satisfy this, we can make `getItem` either a method of a store, or have `getItem` be honest that it needs you to provide it a store (friend by parametric nature) in order to function.

If we choose the later option, the store must provide a method that getItem can proxy its request to (to fulfill its concern/responsibility), which would in most cases make an independant `getItem` function redundant.

This is an example of the honest function option:

```ts
export interface ItemStore {
  getItem(id: string);
  addItem(id: string);
}

export function getItem(id: string, store: ItemStore) {
  return store.getItem(id);
}
```

The better option (for sake of avoiding redundant functions) is to implement a proper class encapsulating relevant data and methods.

```ts
export interface ItemStore {
  getItem(id: string);
  addItem(id: string);
}

export class MemoryStore implements ItemStore {
  private _items: Map<string, { createdAt: number }>;
  constructor() {
    this._items = new Map();
  }
  getItem(id: string) {
    return this._items.get(id);
  }
  addItem(id: string) {
    return this._items.set(id, { createdAt: Date.now() });
  }
}
```

We'll wrap this into the end refactor... hold tight on this for now!

### `getTimeSinceCreation`

> _Source Definition:_

```ts
export function getTimeSinceCreation(itemId: number): number {
  return Date.now() - getItem(itemId).createdAt;
}
```

`getTimeSinceCreation` serves a niche that doesn't inherently need to be concerned with store items or their properties.

This is actually another violation of The Law of Demeter!

It as a function simply calculates the difference between the time it is invoked and another timestamp.

There are two ways we can go about a refactor, we either make it a store method, or we can convert it to a generic utility function `getTimeDelta`, and defer the concern with obtaining the timestamp to be compared against to the implementing scope.

The former method of adding (a) store method(s) could look like this:

```ts
export interface ItemStore {
  getItem(id: string);
  getItemCreationTime(id: string);
  getItemTimeSinceCreation(id: string): number;
  addItem(id: string);
}

export class MemoryStore implements ItemStore {
  private _items: Map<string, { createdAt: number }>;
  constructor() {
    this._items = new Map();
  }
  getItem(id: string) {
    return this._items.get(id);
  }
  getItemCreationTime(id: string): number | null {
    const item = this.getItem(id);
    return item ? item.createdAt : null;
  }
  getItemTimeSinceCreation(id: string): number | null {
    const itemCreatedAt = this.getItemCreationTime(id);
    if (itemCreatedAt === null) return null;
    return Date.now() - itemCreatedAt;
  }
  addItem(id: string) {
    return this._items.set(id, { createdAt: Date.now() });
  }
}
```

The latter of creating a generic utility function could look like this:

```ts
export function getTimeDelta(timeMs: number): number {
  return Date.now() - timeMs;
}
```

For our sake we're going to continue the store route, as it keeps item concerns isolated to the store; we'll wrap this store back into the final refactor.

### `Clean Up`

The last bit (before the final refactor) is understanding what happens to these three lines:

```ts
globalThis.itemMap = new Map([[0, { createdAt: Date.now() }]]);
const item0TimeSinceCreation = getTimeSinceCreation("uuid-0");
console.log(
  `It has been ${item0TimeSinceCreation}ms since item 0 was created!`
);
```

This line was made obsolete by the presence of the MemoryStore, which stores `_items` internally in an instance of the class and provides an interfae to interact with said store.

```ts
// Original:
globalThis.itemMap = new Map([["uuid-0", { createdAt: Date.now() }]]);
// Refactor:
const store = new MemoryStore();
store.addItem("uuid-0");
```

This line can be refactored to reference the store's `getItemTimeSinceCreation` method.

```ts
// Original:
const item0TimeSinceCreation = getTimeSinceCreation("uuid-0");
// Refactor (store will be instantiated prior to this reference in final refactor):
const item0TimeSinceCreation = store.getItemTimeSinceCreation("uuid-0");
```

And finally the last line can remain (as its the goal of our example program to output this value):

```ts
// Keep as is, the refactor isn't changing program behavior.
console.log(
  `It has been ${item0TimeSinceCreation}ms since item 0 was created!`
);
```

### The Final Refactor:

```ts
export interface ItemStore {
  getItem(id: string);
  getItemCreationTime(id: string);
  getItemTimeSinceCreation(id: string): number;
  addItem(id: string);
}

export class MemoryStore implements ItemStore {
  private _items: Map<string, { createdAt: number }>;
  constructor() {
    this._items = new Map();
  }
  getItem(id: string) {
    return this._items.get(id);
  }
  getItemCreationTime(id: string): number | null {
    const item = this.getItem(id);
    return item ? item.createdAt : null;
  }
  getItemTimeSinceCreation(id: string): number | null {
    const itemCreatedAt = this.getItemCreationTime(id);
    if (itemCreatedAt === null) return null;
    return Date.now() - itemCreatedAt;
  }
  addItem(id: string) {
    return this._items.set(id, { createdAt: Date.now() });
  }
}

const store = new MemoryStore();
store.addItem("uuid-0");

const item0TimeSinceCreation = store.getItemTimeSinceCreation("uuid-0");

console.log(
  `It has been ${item0TimeSinceCreation}ms since item 0 was created!`
);
```

## This Refactor Document Is In The Works.
