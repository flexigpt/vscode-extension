import * as React from 'react';

export function useAtBottom(offset = 0) {
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // console.log("Got vals:", window.innerHeight, window.scrollY, document.body.offsetHeight, offset);
      // if (window.innerHeight + window.scrollY >=
      //   document.body.offsetHeight - offset) {
      //     console.log("reached bottom");
      //   }
      setIsAtBottom(
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - offset - 10
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset]);

  return isAtBottom;
}
