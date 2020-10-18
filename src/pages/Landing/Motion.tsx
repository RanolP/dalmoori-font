import React, { ReactElement, useRef } from 'react';

import { styled } from 'lib/emotion';
import { NavbarHeight } from 'system/Navbar';

const Wrap = styled.div`
  width: 100%;
  height: calc(100vh - ${NavbarHeight});

  overflow-y: scroll;
  
  scroll-snap-type: y mandatory;
`;

const Section = styled.div`
  width: 100%;
  height: calc(100vh - ${NavbarHeight});
  
  scroll-snap-align: start start;

  position: sticky;
  top: 0;

  &.title {
    color: ${({ theme }) => theme.foreground.strong};
    font-size: 64px;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .hidden {
      visibility: hidden;
    }
  }
`;

export default function Motion(): ReactElement {
  const lastScrollRef = useRef(0);
  const lastTimeout = useRef<number>();

  function onScroll(e: React.UIEvent<HTMLDivElement, UIEvent>): void {
    e.persist();
    if (lastTimeout.current !== undefined) {
      clearTimeout(lastTimeout.current);
    }
    const lastScroll = lastScrollRef.current;
    const currentScroll = e.currentTarget.scrollTop;
    const target = e.currentTarget;

    lastTimeout.current = window.setTimeout(() => {
      if (currentScroll < lastScroll) {
        target.scrollTo({ top: lastScroll, behavior: 'smooth' });
      } else {
        lastScrollRef.current = currentScroll;
      }
      lastTimeout.current = undefined;
    }, 50);
  }

  return (
    <Wrap onScroll={onScroll}>
      <Section>
      </Section>
      <Section className="title">
        달<span className="hidden">무리</span>
      </Section>
      <Section className="title">
        <span className="hidden">달</span>무<span className="hidden">리</span>
      </Section>
      <Section className="title">
        <span className="hidden">달무</span>리
      </Section>
      <Section>
        빠빠밤
      </Section>
      <Section>
        빠바바밤
      </Section>
    </Wrap>
  );
}
