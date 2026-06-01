# symmetry-math

> Mathematics of symmetry groups for JavaScript — group theory, 2D transforms, wallpaper groups, and Burnside's lemma.

## What This Does

`symmetry-math` brings abstract algebra to JavaScript. It constructs cyclic, symmetric, and dihedral groups; computes orbits, stabilizers, and Burnside's lemma counts; applies 2D affine transforms; and classifies periodic patterns into the 17 wallpaper groups. Use it for generative art, crystallography, game development (tile symmetry), or teaching group theory.

## The Cultural Root

Same mathematical tradition as the Python version. Symmetry groups formalize what humans have recognized intuitively across cultures — Islamic art explores all 17 wallpaper groups, crystal structures embody 3D space groups, and the classification of finite simple groups is one of mathematics' greatest achievements.

## Install

```bash
npm install symmetry-math
```

## Quick Start

```typescript
import {
  cyclicGroup, symmetricGroup, dihedralGroup,
  isAbelian,
  orbit, stabilizer, burnsideLemma,
  rotation2D, reflection2D, composeTransforms, transformPoint,
  classifyPattern,
} from "symmetry-math";

// Build groups
const C4 = cyclicGroup(4);
const S3 = symmetricGroup(3);
const D6 = dihedralGroup(6);

console.log(C4.order);  // 4
console.log(S3.order);  // 6
console.log(D6.order);  // 12
console.log(isAbelian(C4));  // true
console.log(isAbelian(S3));  // false

// Orbits and stabilizers
const orb = orbit(D6, 1);
const stab = stabilizer(D6, 1);

// Burnside's lemma
const distinct = burnsideLemma(C4.order, [16, 4, 8, 4]);  // Fixed points per element

// 2D transforms
const R = rotation2D(Math.PI / 4);
const M = reflection2D(Math.PI / 4);
const combined = composeTransforms(R, M);
const pt = transformPoint(combined, [1, 0]);

// Wallpaper group classification
const result = classifyPattern(points, latticeVectors);
console.log(result.groupType, result.rotationalOrders, result.hasReflection);
```

## API Reference

### Types
```typescript
interface GroupElement { id: number; permutation: number[]; }
interface Group {
  order: number;
  elements: GroupElement[];
  compose(a: number, b: number): number;
  identity: number;
  inverse(a: number): number;
}
interface Transform2D {
  matrix: [number, number, number, number];  // 2×2
  translation: [number, number];
}
interface WallpaperResult { groupType: number; rotationalOrders: number[]; hasReflection: boolean; hasGlide: boolean; }
```

### Group Constructors
- `cyclicGroup(n) → Group` — Cₙ
- `symmetricGroup(n) → Group` — Sₙ (all n! permutations)
- `dihedralGroup(n) → Group` — Dₙ

### Group Properties
- `isAbelian(group) → boolean`

### Group Actions
- `orbit(group, element) → OrbitResult`
- `stabilizer(group, element) → StabilizerResult`
- `burnsideLemma(groupOrder, fixedPoints) → number`

### 2D Transforms
- `rotation2D(angle) → Transform2D`
- `reflection2D(axisAngle) → Transform2D`
- `composeTransforms(t1, t2) → Transform2D`
- `transformPoint(t, p) → [number, number]`

### Wallpaper Groups
- `classifyPattern(points, lattice) → WallpaperResult`

## How It Works

Groups use permutation representations internally. Cyclic groups use modular addition; symmetric groups enumerate all permutations; dihedral groups compose rotations (mod n) with reflections. Burnsides lemma: |X/G| = (1/|G|) Σ|Fix(g)|. Wallpaper classification uses the same decision-tree approach as the Python version.

## License

MIT
