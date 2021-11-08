# Type-level utilities

tasl comes with some basic utility methods for reasoning about and operating on types. Strictly speaking, tasl types only exist within the context of a particular schema, and so only types in the same schema can be related.

## Table of contents

- [Subtypes](#subtypes)
- [Type equality](#type-equality)
- [Type comparability](#type-comparability)
- [Greatest common subtype](#greatest-common-subtype)
- [Least common supertype](#least-common-supertype)

## Type equality

Type _equality_ (=) is an equivalence relation on types.

Equality is defined by cases:

- The URI type is equal to itself
- Two literal types X and Y are equal if and only if they have the same datatype
- Two product types X and Y are equal if and only if all of the following are true:
  - every key in X is also in Y
  - every key in Y is also in X
  - for every key K in X, X(K) is equal to Y(K)
- Two coproduct types X and Y are equal if and only if all of the following are true:
  - every key in X is also in Y
  - every key in Y is also in X
  - for every key K in X, X(K) is equal to Y(K)
- Two reference types X and Y are equal if and only if they reference the same class
- Types of different kinds are never equal

```typescript
/**
 * Check whether the type X is equal to the type Y.
 * Equality is reflexive, transitive, and symmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X = Y, false otherwise
 */
declare function isEqualTo<T extends types.Type>(x: T, y: types.Type): y is T
```

## Subtypes

The _subtype_ relation (≤) is defined by cases:

- The URI type is a subtype of itself
- A literal type X is a subtype of a literal type Y if and only if X and Y have the same datatype
- A product type X is a subtype of the product type Y if and only if
  - for every key K in X, Y has a component with key K, and the type X(K) is a subtype of the type Y(K)
- A coproduct type X is a subtype of the coproduct type Y if
  - for every key K in Y, X has a component with key K, and the type X(K) is a subtype of the type Y(K)
- A reference type X is a subtype of a reference type Y if and only if X and Y reference the same class
- If two types X and Y are of different kinds, then neither X ≤ Y nor Y ≤ X

If type X is a subtype of a type Y, but Y is not a subtype of X, then we say that X is a _strict subtype_ of Y.

The subtype relation induces a partial order on types, meaning that every two types X and Y are related in one of four ways:

1. X is a strict subtype of Y ((X ≤ Y) ∧ ¬(Y ≤ X))
2. Y is a strict subtype of X ((Y ≤ X) ∧ ¬(X ≤ Y))
3. X and Y are equal ((X ≤ Y) ∧ (Y ≤ X))
4. X and Y are incomparable (¬(X ≤ Y) ∧ ¬(Y ≤ X))

The subtype relation is antisymmetric: `types.isEqualTo(x, y)` is equivalent to `types.isSubtypeOf(x, y) && types.isSubtypeOf(y, x)`.

```typescript
/**
 * Check whether the type X is a subtype of the type Y.
 * The subtype relation is reflexive, transitive, and antisymmetric.
 * @param x any type
 * @param y any type
 * @returns {boolean} true if X ≤ Y, false otherwise
 */
declare function isSubtypeOf(x: types.Type, y: types.Type): boolean
```

## Type comparablility

Intuitively, types X and Y are comparable if they can be naturally "merged". There are two versions of "merging": the _infimum_, which takes the intersection of product components and the union of coproduct options; and the _supremum_, which takes the union of product components and the intersection of coproduct options.

Comparablility is defined by cases:

- Primitive types (URIs, literals, and references) are comparable if and only if they are equal
- Product and coproduct types are comparable if, for each key K that appears in both X and Y, X(K) and Y(K) are comparable
- Types of different kinds are never comparable

```typescript
/**
 * Check whether the type X is comparable with the type Y.
 * The comparability relation is reflexive and symmetric, but not necessarily transitive.
 * @param x a type
 * @param y a type
 * @returns {boolean} true if X and Y are comparable, false otherwise
 */
declare function isComparableWith(x: Type, y: Type): boolean
```

`types.isComparableWith(x, y)` is equivalent to `types.isSubtypeOf(x, y) || types.isSubtypeOf(y, x)`.

## Greatest common subtype

The _greatest common subtype_ of two types is their infimum with respect to the subtype relation.

An infimum of types X and Y exists if and only if X and Y are comparable (this is true of the subtype relation but not of partial orders in general). When an infimum Z exists, Z is a subtype of both X and Y.

```typescript
/**
 * Get the infimum of types X and Y.
 * The infimum operation is associative and commutative.
 * @param x any type
 * @param y any type
 * @throws an error if X and Y are not comparable
 * @returns {Type} a type Z such that both X and Y are assignable to Z
 */
declare function greatestCommonSubtype(x: Type, y: Type): Type
```

`greatestCommonSubtype` **will throw an error if the arguments are not comparable** - always check that they are using [`types.isComparableWith`](#type-comparablility).

## Least common supertype

The _least common supertype_ of two types is their supremum with respect to the subtype relation.

A supremum of types X and Y exists if and only if X and Y are comparable (again, this is true of the subtype relation but not of partial orders in general). When a supremum Z exists, both X and Y are subtypes of Z.

```typescript
/**
 * Get the supremum of types X and Y.
 * The supremum operation is associative and commutative.
 * @param x any type
 * @param y any type
 * @throws an error if X and Y are not comparable
 * @returns {Type} a type Z such that both X and Y are subtypes of Z
 */
declare function leastCommonSupertype(x: Type, y: Type): Type
```

`leastCommonSupertype` **will throw an error if the arguments are not comparable** - always check that they are using [`types.isComparableWith`](#type-comparablility).
