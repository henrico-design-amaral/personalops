import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const migration = await readFile(
  'supabase/migrations/20260801155742_personal_operating_system.sql',
  'utf8',
);

describe('contrato de segurança do banco', () => {
  it('ativa e força RLS nas tabelas expostas', () => {
    expect(migration).toContain('enable row level security');
    expect(migration).toContain('force row level security');
  });

  it.each(['select', 'insert', 'update', 'delete'])(
    'declara políticas de %s por auth.uid()',
    (operation) => {
      expect(migration).toContain(`for ${operation} to authenticated`);
      expect(migration).toContain('(select auth.uid()) = user_id');
    },
  );

  it('não incorpora credencial privilegiada na migration', () => {
    expect(migration).not.toMatch(/service[_ -]?role/i);
  });
});
