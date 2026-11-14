'use client';
import { useHanjiConfig } from './config.tsx';
import type { HanjiConfig } from './config.tsx';
import { withDefaults } from './slot.ts';

/**
 * Config plus provider defaults merged under the call-site props, in one hook. Being a hook, its
 * result is treated as immutable by the React Compiler, so it can feed `useMemo` safely.
 *
 * @example const [config, { size = 'md', className, ...rest }] = useSlot('Chip', props);
 */
export function useSlot<P extends object>(slot: string, props: P): [HanjiConfig, P] {
  const config = useHanjiConfig();
  return [config, withDefaults(config, slot, props)];
}
