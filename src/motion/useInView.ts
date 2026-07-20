import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Returns a ref + an incrementing `tick` that bumps every time the ref'd element
 * (re)enters the viewport — so an animation can replay on scroll-in, not just on
 * mount. Web-only via IntersectionObserver (react-native-web resolves View refs
 * to the DOM node); on native, or if the node can't be observed, it ticks once so
 * the animation still plays when the component appears.
 */
export function useInView<T = any>(threshold = 0.4) {
  const ref = useRef<T | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') {
      setTick((t) => t + 1);
      return;
    }
    const node: any = ref.current;
    if (!node || typeof Element === 'undefined' || !(node instanceof Element)) {
      setTick((t) => t + 1);
      return;
    }
    let inside = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !inside) {
            inside = true;
            setTick((t) => t + 1);
          } else if (!e.isIntersecting) {
            inside = false;
          }
        }
      },
      { threshold },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, tick };
}
