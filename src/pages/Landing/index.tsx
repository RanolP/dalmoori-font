import React, { ReactElement } from 'react';
import Motion from './Motion';
import styled from '@emotion/styled';
import { NavbarHeight } from 'system/Navbar';
import { Localized } from '@fluent/react';
import Palette from 'styles/nord';
import endent from 'endent';
import unstableFonts from '../../lib/data/unstable-font';
import stableFonts from '../../lib/data/stable-font';

const Wrap = styled.div`
  height: calc(100vh - ${NavbarHeight});
  overflow-y: scroll;

  &::after {
    display: block;
    height: 1px;
    content: ' ';
    scroll-snap-align: end;
  }

  main {
    max-width: 52rem;
    margin: 4rem auto;
    font-size: 1.5rem;

    h2 {
      background: linear-gradient(115deg, ${({ theme }) => theme.isDark ? 'hsl(150 85% 75%), hsl(210 85% 65%)' : 'hsl(160 80% 45%), hsl(210 80% 55%)'});
      color: transparent;
      background-clip: text;
    }

    strong {
      background: linear-gradient(115deg, ${({ theme }) => theme.isDark ? 'hsl(150 45% 85%), hsl(210 45% 75%)' : 'hsl(160 40% 45%), hsl(210 40% 55%)'});
      color: transparent;
      background-clip: text;
    }

    ul {
      list-style-type: '- ';
    }

    [data-note]::after {
      content: attr(data-note);
      vertical-align: super;
      font-size: 1rem;
    }

    .brand {
      background: linear-gradient(115deg, ${({ theme }) => theme.isDark ? 'hsl(180 85% 75%), hsl(240 85% 65%)' : 'hsl(180 85% 45%), hsl(240 85% 55%)'});
      color: transparent;
      background-clip: text;
    }

    h2 {
      font-size: 3rem;
    }

    ul.labeled {
      line-height: 1.5;
    }

    .label {
      margin-right: 1rem;
      padding: 0.1rem 0.3rem;
    }

    .label.green {
      background-color: ${Palette[14]};
      color: ${Palette[1]};
    }

    .label.yellow {
      background-color: ${Palette[13]};
      color: ${Palette[1]};
    }

    .label.blue {
      background-color: ${Palette[8]};
      color: ${Palette[1]};
    }

    textarea {
      font-size: inherit;
      border: none;
      background-color: ${({ theme }) => theme.background.darker};
      color: ${({ theme }) => theme.foreground.normal};

      resize: none;

      width: 100%;
      height: 16rem;

      padding: 2rem;
    }

    summary {
      cursor: pointer;
    }

    small {
      font-size: 1rem;
    }
  }
`;

function LandingPage(): ReactElement {
  return (
    <Wrap>
      <Motion />

      <main>
        <section id="support-range">
          <h2>
            <Localized
              id="landing-section-support-range-title"
              elems={{
                br: <br />
              }}
            >
              <span />
            </Localized>
          </h2>
          <Localized
            id="landing-section-support-range-description"
            elems={{
              strong: <strong />,
              brand: <span className="brand" />,
            }}
          >
            <span />
          </Localized>

          <ul>
            <li>
              <span title="Basic Latin">
                <Localized id="support-range-basic-latin">
                  <span />
                </Localized>
                {' '}
                95/95
              </span>
            </li>
            <li>
              <span title="Hangul Compatibility Jamo">
                <Localized id="support-range-hangul-compatibility-jamo" attrs={{ 'data-note': true }}>
                  <span />
                </Localized>
                {' '}
                51/94
              </span>
            </li>
            <li>
              <span title="Hangul Syllable">
                <Localized id="support-range-hangul-syllable" />{' '}
                11172/11172
              </span>
            </li>
          </ul>
        </section>
        <section id="readability">
          <h2>
            <Localized
              id="landing-section-readability-title"
              elems={{
                br: <br />
              }}
            >
              <span />
            </Localized>
          </h2>
          <Localized
            id="landing-section-readability-description"
            elems={{
              strong: <strong />,
              brand: <span className="brand" />,
            }}
          >
            <span />
          </Localized>
        </section>
        <section id="beauty">
          <h2>
            <Localized
              id="landing-section-beauty-title"
              elems={{
                br: <br />
              }}
            >
              <span />
            </Localized>
          </h2>
          <Localized
            id="landing-section-beauty-description"
            elems={{
              strong: <strong />,
              brand: <span className="brand" />,
            }}
          >
            <span />
          </Localized>
        </section>
        <section id="free">
          <h2>
            <Localized
              id="landing-section-free-title"
              elems={{
                br: <br />
              }}
            >
              <span />
            </Localized>
          </h2>
          <Localized
            id="landing-section-free-description"
            elems={{
              strong: <strong />,
              brand: <span className="brand" />,
            }}
          >
            <span />
          </Localized>

          <ul className="labeled">
            <li>
              <span className="label green">
                <Localized id="landing-section-free-label-allow" />
              </span>
              <Localized id="landing-section-free-allow-use" />
            </li>
            <li>
              <span className="label yellow">
                <Localized id="landing-section-free-label-require" />
              </span>
              <Localized id="landing-section-free-require-license-mark" />
            </li>
            <li>
              <span className="label yellow">
                <Localized id="landing-section-free-label-require" />
              </span>
              <Localized id="landing-section-free-require-modification-mark" />
            </li>
            <li>
              <span className="label blue">
                <Localized id="landing-section-free-label-inform" />
              </span>
              <Localized id="landing-section-free-inform-no-guarantee" />
            </li>
          </ul>
        </section>
        <section id="try">
          <h2>
            <Localized
              id="landing-section-try-title"
              elems={{
                br: <br />
              }}
            >
              <span />
            </Localized>
          </h2>
          <textarea placeholder={endent`
            다람쥐 헌 쳇바퀴에 타고파.
            그 늙다리만 본선에 진출케 투표해.

            The quick brown fox jumps over the lazy dog.
          `} />
        </section>
        <section id="download">
          <h2>
            <Localized
              id="landing-section-download-title"
              elems={{
                br: <br />
              }}
            >
              <span />
            </Localized>
          </h2>
          <details>
            <summary>
              <Localized id="landing-section-download-stable-channel-title" />
            </summary>
            <ul>
              {stableFonts.map(stableFont => (
                <li key={stableFont.commitHash}>
                  {stableFont.tagName}
                  <ul>
                    {stableFont.assets.map(asset => (
                      <li key={asset.name}>
                        <a rel="download" href={asset.downloadUrl}>
                          {asset.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </details>
          <details>
            <summary>
              <Localized id="landing-section-download-unstable-channel-title" />
            </summary>
            <blockquote>
              <small>
                <Localized id="landing-section-download-unstable-channel-description" />
              </small>
            </blockquote>
            <ul>
              {unstableFonts.map(unstableFont => (
                <li key={unstableFont.headCommit.sha}>
                  <a rel="download" href={unstableFont.downloadUrl}>
                    {unstableFont.headCommit.sha.substring(0, 7)}: {unstableFont.headCommit.message}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </main>
    </Wrap >
  );
}

export default LandingPage;
