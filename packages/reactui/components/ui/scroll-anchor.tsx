import * as React from 'react';
import { useInView } from 'react-intersection-observer';

import { useAtBottom } from '@/lib/hooks/use-at-bottom';

interface ScrollAnchorProps {
  trackVisibility?: boolean;
}

export function ScrollAnchor({ trackVisibility }: ScrollAnchorProps) {
  const isAtBottom = useAtBottom();
  const { ref, entry, inView } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: '0px 0px -150px 0px'
  });

  React.useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: 'start'
      });
    }
  }, [inView, entry, isAtBottom, trackVisibility]);

  return <div ref={ref} className="h-px w-full" />;
}
