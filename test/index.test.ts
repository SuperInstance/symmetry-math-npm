import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cyclicGroup, symmetricGroup, dihedralGroup, isAbelian,
  rotation2D, reflection2D, composeTransforms, transformPoint,
  orbit, stabilizer, burnsideLemma, classifyPattern,
} from '../src/index.js';

describe('Groups', () => {
  it('cyclic group has correct order', () => {
    const c3 = cyclicGroup(3);
    assert.equal(c3.order, 3);
    assert.equal(c3.identity, 0);
  });

  it('cyclic group compose', () => {
    const c4 = cyclicGroup(4);
    assert.equal(c4.compose(1, 2), 3);
    assert.equal(c4.compose(3, 1), 0);
  });

  it('cyclic group inverse', () => {
    const c5 = cyclicGroup(5);
    assert.equal(c5.compose(2, c5.inverse(2)), c5.identity);
  });

  it('cyclic groups are abelian', () => {
    assert.ok(isAbelian(cyclicGroup(7)));
  });

  it('symmetric group S3 has order 6', () => {
    const s3 = symmetricGroup(3);
    assert.equal(s3.order, 6);
  });

  it('S3 is not abelian', () => {
    assert.ok(!isAbelian(symmetricGroup(3)));
  });

  it('S2 is abelian', () => {
    assert.ok(isAbelian(symmetricGroup(2)));
  });

  it('dihedral group D3 has order 6', () => {
    const d3 = dihedralGroup(3);
    assert.equal(d3.order, 6);
  });

  it('dihedral group identity', () => {
    const d4 = dihedralGroup(4);
    assert.equal(d4.compose(d4.identity, 2), 2);
  });

  it('D3 is not abelian', () => {
    assert.ok(!isAbelian(dihedralGroup(3)));
  });

  it('D2 has order 4', () => {
    const d2 = dihedralGroup(2);
    assert.equal(d2.order, 4);
    assert.ok(isAbelian(d2));
  });
});

describe('Transforms', () => {
  it('rotation 360 is identity', () => {
    const r = rotation2D(2 * Math.PI);
    const [a, , , d] = r.matrix;
    assert.ok(Math.abs(a - 1) < 1e-10);
    assert.ok(Math.abs(d - 1) < 1e-10);
  });

  it('rotation 90 degrees', () => {
    const r = rotation2D(Math.PI / 2);
    const [a, b] = r.matrix;
    assert.ok(Math.abs(a) < 1e-10);
    assert.ok(Math.abs(b - (-1)) < 1e-10);
  });

  it('reflection squared is identity', () => {
    const ref = reflection2D(Math.PI / 4);
    const r2 = composeTransforms(ref, ref);
    assert.ok(Math.abs(r2.matrix[0] - 1) < 1e-10);
  });

  it('transform point', () => {
    const r = rotation2D(0);
    const p = transformPoint(r, [3, 4]);
    assert.ok(Math.abs(p[0] - 3) < 1e-10);
    assert.ok(Math.abs(p[1] - 4) < 1e-10);
  });

  it('rotate point 90 degrees', () => {
    const r = rotation2D(Math.PI / 2);
    const p = transformPoint(r, [1, 0]);
    assert.ok(Math.abs(p[0]) < 1e-10);
    assert.ok(Math.abs(p[1] - 1) < 1e-10);
  });
});

describe('Orbit-Stabilizer', () => {
  it('orbit of identity is full group', () => {
    const c4 = cyclicGroup(4);
    const o = orbit(c4, 0);
    assert.equal(o.size, 4);
  });

  it('orbit of element in cyclic', () => {
    // Left action: compose(g, x) for all g gives full group for generator
    const c6 = cyclicGroup(6);
    const o = orbit(c6, 2);
    assert.equal(o.size, 6); // Acts transitively
  });

  it('stabilizer of identity element', () => {
    const c3 = cyclicGroup(3);
    const s = stabilizer(c3, 0);
    assert.equal(s.order, 1); // Only identity fixes 0 under left action
  });

  it('orbit-stabilizer theorem', () => {
    const c4 = cyclicGroup(4);
    const o = orbit(c4, 2);
    const s = stabilizer(c4, 2);
    assert.equal(o.size * s.order, c4.order);
  });
});

describe('Burnside', () => {
  it('2 colors on 3 points with S3', () => {
    // S3 has 6 elements. Fixed points: identity=8, 3 transpositions=2 each, 2 3-cycles=0 each
    const fixed = [8, 2, 2, 2, 0, 0];
    const result = burnsideLemma(6, fixed);
    assert.equal(result, 14/6);
  });
});

describe('Wallpaper', () => {
  it('uniform pattern', () => {
    const vals = Array(16).fill(1);
    const result = classifyPattern(vals, 4, 4);
    assert.ok(result.rotationalOrders.length >= 1);
  });

  it('non-symmetric pattern', () => {
    const vals = [0,1,2,3,4,5,6,7,8];
    const result = classifyPattern(vals, 3, 3);
    assert.equal(typeof result.groupType, 'number');
  });
});
