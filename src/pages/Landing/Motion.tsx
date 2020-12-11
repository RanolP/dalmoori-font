import React, { ReactElement, useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { NavbarHeight } from 'system/Navbar';
import { range } from 'util/array';
import { useTheme } from '@emotion/react';
import { Localized } from '@fluent/react';

const Wrap = styled.div`
  width: 100%;
  height: calc(100vh - ${NavbarHeight});

  overflow-y: scroll;
  scrollbar-width: none;

  scroll-snap-type: y mandatory;

  user-select: none;
`;

const SectionWrap = styled.span`
  width: 100%;
  height: calc(100vh - ${NavbarHeight});
  
  scroll-snap-align: end;
`;

const Section = styled.div`
  width: 100%;
  height: 100%;

  position: sticky;
  top: 0;

  scroll-snap-type: y mandatory;

  &.scroll {
    display: flex;
    justify-content: center;
    align-items: flex-start;

    span {
      display: inline-block;
      margin-top: 4rem;
      padding: 0.5rem 4rem;
      background-color: ${({ theme }) => theme.foreground.normal};
      color: ${({ theme }) => theme.background.normal};
      text-align: center;
    }

    z-index: 1;
  }

  &.title {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    
    color: ${({ theme }) => theme.foreground.strong};
    font-size: 6rem;

    .hidden {
      visibility: hidden;
    }

    span.wrap {
      background: linear-gradient(115deg, ${({ theme }) => theme.isDark ? 'hsl(180 85% 75%), hsl(240 85% 65%)' : 'hsl(180 85% 45%), hsl(240 85% 55%)'});
      color: transparent;
      background-clip: text;
    }
  }
  

  div.left, div.right {
    flex: 1;
    height: 100%;

    display: grid;
    grid-template-rows: repeat(auto-fill, auto);
    grid-gap: auto;

    padding: 4rem;
    
    font-size: 2rem;
  }

  div.left {
    justify-items: start;
  }

  div.right {
    justify-items: end;
  }

  &.font-project {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    font-size: 2rem;

    span.text {
      font-size: 3rem;
      display: inline-block;
      margin-top: 13rem;
    }
  }

  &.description {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    span.text {
      font-size: 2rem;
      display: inline-block;
      margin-bottom: 10rem;
    }
  }
`;

const CharacterCount = 10;

interface RandomCharacterProps {
  index: number;
}

function RandomCharacter({ index }: RandomCharacterProps): ReactElement {
  function generateCharCode(): number {
    return Math.floor(0xAC00 + Math.random() * (11172 + 1));
  }

  const { isDark } = useTheme();
  const [charCode, setCharCode] = useState(generateCharCode);

  useEffect(() => {
    const id = setInterval(() => {
      setCharCode(generateCharCode());
    }, 1500);

    return () => clearInterval(id);
  }, []);

  return (
    <span style={{
      color: `hsla(${360 * index / CharacterCount}, ${isDark ? '75%, 85%, 70%' : '45%, 35%, 70%'})`,
    }}>
      {String.fromCharCode(charCode)}
    </span>
  );
}

export default function Motion(): ReactElement {
  return (
    <Wrap>
      <SectionWrap>
        <Section className="scroll">
          <Localized
            id="landing-try-scroll-down"
            elems={{
              br: <br />,
              skip: <a href="#download" />,
            }}
          >
            <span />
          </Localized>
        </Section>
      </SectionWrap>

      <SectionWrap>
        <Section className="title">
          <span className="wrap">
            <Localized id="landing-dal" />
            <span className="hidden">
              <Localized id="landing-moo" />
              <Localized id="landing-ri" />
            </span>
          </span>
        </Section>
      </SectionWrap>

      <SectionWrap>
        <Section className="title">
          <span className="wrap">
            <span className="hidden">
              <Localized id="landing-dal" />
            </span>
            <Localized id="landing-moo" />
            <span className="hidden">
              <Localized id="landing-ri" />
            </span>
          </span>
        </Section>
      </SectionWrap>

      <SectionWrap>
        <Section className="title">
          <div className="left">
            {range(0, CharacterCount).map(index => <RandomCharacter index={index} key={index} />)}
          </div>
          <span className="wrap">
            <span className="hidden">
              <Localized id="landing-dal" />
              <Localized id="landing-moo" />
            </span>
            <Localized id="landing-ri" />
          </span>
          <div className="right">
            {range(0, CharacterCount).map(index => <RandomCharacter index={CharacterCount - 1 - index} key={index} />)}
          </div>
        </Section>
      </SectionWrap>

      <SectionWrap>
        <Section className="font-project">
          <span className="text">
            <Localized id="landing-font-project" />
          </span>
        </Section>
      </SectionWrap>
    </Wrap>
  );
}
