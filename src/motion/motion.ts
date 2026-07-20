/**
 * Motion helpers (§9). Reanimated on web runs JS-only, so we animate transform/
 * opacity only and keep every entrance interruptible. Reduced motion is honored
 * by Reanimated's ReduceMotion.System default; withTiming/withSpring resolve
 * instantly under it, so count-ups and shimmer degrade to their final state.
 */
import { Easing, ReduceMotion } from 'react-native-reanimated';
import { duration, easing, stagger } from '../theme/tokens';

export const EASE = {
  standard: Easing.bezier(easing.standard[0], easing.standard[1], easing.standard[2], easing.standard[3]),
  emphasized: Easing.bezier(easing.emphasized[0], easing.emphasized[1], easing.emphasized[2], easing.emphasized[3]),
  accelerate: Easing.bezier(easing.accelerate[0], easing.accelerate[1], easing.accelerate[2], easing.accelerate[3]),
  inout: Easing.bezier(easing.inout[0], easing.inout[1], easing.inout[2], easing.inout[3]),
};

export const timingBase = { duration: duration.base, easing: EASE.standard, reduceMotion: ReduceMotion.System };
export const timingFast = { duration: duration.fast, easing: EASE.standard, reduceMotion: ReduceMotion.System };
export const timingHero = { duration: duration.hero, easing: EASE.emphasized, reduceMotion: ReduceMotion.System };

/** Staggered delay for list entrances, capped so long lists stay snappy (§9.2). */
export function staggerDelay(index: number) {
  return Math.min(index * stagger.step, stagger.cap);
}
