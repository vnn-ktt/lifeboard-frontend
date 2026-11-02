import { useAutoAnimate } from '@formkit/auto-animate/vue';
import type { AutoAnimateOptions } from '@formkit/auto-animate';

interface UseAutoAnimateListOptions {
  duration?: AutoAnimateOptions['duration'];
  easing?: AutoAnimateOptions['easing'];
}

export function useAutoAnimateList(options: UseAutoAnimateListOptions = {}) {
  const animateOptions: Partial<AutoAnimateOptions> = {};

  if (options.duration) {
    animateOptions.duration = options.duration;
  }

  if (options.easing) {
    animateOptions.easing = options.easing;
  }

  const [parent] = useAutoAnimate<HTMLElement>(animateOptions);

  return {
    parent,
  };
}
