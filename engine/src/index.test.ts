import { describe, it, expect } from 'vitest';
import { helloEngine, ENGINE_VERSION } from './index.js';

describe('engine smoke test', () => {
  it('exports a version', () => {
    expect(ENGINE_VERSION).toBe('0.1.0');
  });

  it('greets', () => {
    expect(helloEngine()).toContain('CyberSkill engine');
  });
});
