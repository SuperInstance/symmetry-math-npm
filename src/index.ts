// symmetry-math — Mathematics of symmetry groups for the browser

// === Types ===
export interface GroupElement {
  id: number;
  permutation: number[];
}

export interface Group {
  order: number;
  elements: GroupElement[];
  compose(a: number, b: number): number;
  identity: number;
  inverse(a: number): number;
}

export interface Transform2D {
  matrix: [number, number, number, number]; // 2x2 as [a,b,c,d]
  translation: [number, number];
}

export interface WallpaperResult {
  groupType: number;
  rotationalOrders: number[];
  hasReflection: boolean;
  hasGlide: boolean;
}

export interface OrbitResult {
  elements: number[];
  size: number;
}

export interface StabilizerResult {
  elements: number[];
  order: number;
}

// === Permutation utilities ===
function permCompose(a: number[], b: number[]): number[] {
  return a.map((_, i) => b[a[i]]);
}

function permInverse(p: number[]): number[] {
  const inv = new Array(p.length);
  for (let i = 0; i < p.length; i++) inv[p[i]] = i;
  return inv;
}

function permEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// === Group constructors ===
export function cyclicGroup(n: number): Group {
  const elements: GroupElement[] = [];
  for (let i = 0; i < n; i++) {
    const perm = new Array(n);
    for (let j = 0; j < n; j++) perm[j] = (j + i) % n;
    elements.push({ id: i, permutation: perm });
  }
  return {
    order: n,
    elements,
    compose: (a: number, b: number) => (a + b) % n,
    identity: 0,
    inverse: (a: number) => (n - a) % n,
  };
}

export function symmetricGroup(n: number): Group {
  // Generate all permutations
  const perms: number[][] = [];
  function generate(arr: number[], l: number = 0) {
    if (l === arr.length) { perms.push([...arr]); return; }
    for (let i = l; i < arr.length; i++) {
      [arr[l], arr[i]] = [arr[i], arr[l]];
      generate(arr, l + 1);
      [arr[l], arr[i]] = [arr[i], arr[l]];
    }
  }
  generate(Array.from({ length: n }, (_, i) => i));
  
  const elements = perms.map((p, i) => ({ id: i, permutation: p }));
  const compose = (a: number, b: number): number => {
    const result = permCompose(elements[a].permutation, elements[b].permutation);
    return elements.findIndex(e => permEqual(e.permutation, result));
  };
  const inverse = (a: number): number => {
    const inv = permInverse(elements[a].permutation);
    return elements.findIndex(e => permEqual(e.permutation, inv));
  };
  return { order: perms.length, elements, compose, identity: 0, inverse };
}

export function dihedralGroup(n: number): Group {
  const elements: GroupElement[] = [];
  // Rotations: r^k, Reflections: s*r^k
  for (let k = 0; k < n; k++) {
    const rotPerm = new Array(n);
    for (let i = 0; i < n; i++) rotPerm[i] = (i + k) % n;
    elements.push({ id: k, permutation: rotPerm });
  }
  for (let k = 0; k < n; k++) {
    const refPerm = new Array(n);
    for (let i = 0; i < n; i++) refPerm[i] = (k - i + n) % n;
    elements.push({ id: n + k, permutation: refPerm });
  }
  
  return {
    order: 2 * n,
    elements,
    compose: (a: number, b: number): number => {
      const result = permCompose(elements[a].permutation, elements[b].permutation);
      return elements.findIndex(e => permEqual(e.permutation, result));
    },
    identity: 0,
    inverse: (a: number): number => {
      const inv = permInverse(elements[a].permutation);
      return elements.findIndex(e => permEqual(e.permutation, inv));
    },
  };
}

export function isAbelian(group: Group): boolean {
  for (let i = 0; i < group.order; i++) {
    for (let j = i + 1; j < group.order; j++) {
      if (group.compose(i, j) !== group.compose(j, i)) return false;
    }
  }
  return true;
}

// === 2D Transforms ===
export function rotation2D(angle: number): Transform2D {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { matrix: [c, -s, s, c], translation: [0, 0] };
}

export function reflection2D(axisAngle: number): Transform2D {
  const c = Math.cos(2 * axisAngle), s = Math.sin(2 * axisAngle);
  return { matrix: [c, s, s, -c], translation: [0, 0] };
}

export function composeTransforms(t1: Transform2D, t2: Transform2D): Transform2D {
  const [a1, b1, c1, d1] = t1.matrix;
  const [a2, b2, c2, d2] = t2.matrix;
  return {
    matrix: [a1*a2+b1*c2, a1*b2+b1*d2, c1*a2+d1*c2, c1*b2+d1*d2],
    translation: [a1*t2.translation[0]+b1*t2.translation[1]+t1.translation[0],
                  c1*t2.translation[0]+d1*t2.translation[1]+t1.translation[1]],
  };
}

export function transformPoint(t: Transform2D, p: [number, number]): [number, number] {
  const [a, b, c, d] = t.matrix;
  return [a*p[0]+b*p[1]+t.translation[0], c*p[0]+d*p[1]+t.translation[1]];
}

// === Orbit-Stabilizer ===
export function orbit(group: Group, element: number): OrbitResult {
  const seen = new Set<number>();
  for (let i = 0; i < group.order; i++) {
    seen.add(group.compose(i, element));
  }
  const els = Array.from(seen).sort((a, b) => a - b);
  return { elements: els, size: els.length };
}

export function stabilizer(group: Group, element: number): StabilizerResult {
  const stab: number[] = [];
  for (let i = 0; i < group.order; i++) {
    if (group.compose(i, element) === element) stab.push(i);
  }
  return { elements: stab, order: stab.length };
}

export function burnsideLemma(groupOrder: number, fixedPoints: number[]): number {
  const total = fixedPoints.reduce((a, b) => a + b, 0);
  return total / groupOrder;
}

// === Wallpaper detection (simplified) ===
export function classifyPattern(
  values: number[], width: number, height: number
): WallpaperResult {
  const orders: number[] = [];
  
  // Check rotational symmetries
  for (const order of [2, 3, 4, 6]) {
    let symmetric = true;
    const cx = Math.floor(width / 2), cy = Math.floor(height / 2);
    for (let y = 0; y < height && symmetric; y++) {
      for (let x = 0; x < width && symmetric; x++) {
        const angle = (2 * Math.PI * order) / order;
        const dx = x - cx, dy = y - cy;
        const rx = Math.round(cx + dx * Math.cos(angle) - dy * Math.sin(angle));
        const ry = Math.round(cy + dx * Math.sin(angle) + dy * Math.cos(angle));
        if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
          if (values[y * width + x] !== values[ry * width + rx]) symmetric = false;
        }
      }
    }
    if (symmetric) orders.push(order);
  }
  
  // Check reflection
  let hasReflection = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.floor(width / 2); x++) {
      if (values[y * width + x] !== values[y * width + (width - 1 - x)]) {
        // Not reflective on vertical axis - keep checking
      } else {
        hasReflection = true;
      }
    }
  }
  
  let groupType = 1; // p1 default
  if (orders.includes(4)) groupType = 11; // p4m simplified
  else if (orders.includes(3)) groupType = 16; // p3
  else if (orders.includes(6)) groupType = 17; // p6
  else if (orders.includes(2) && hasReflection) groupType = 6; // pmm
  
  return { groupType, rotationalOrders: orders, hasReflection, hasGlide: false };
}
