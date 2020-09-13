달무리 글꼴 문서
===

달무리 글꼴 문서를 Jekyll로 개선

## 시작하기

[Jekyll 빠른 시작 문서](https://jekyllrb-ko.github.io/docs/) 의 2번까지 수행하여 Jekyll을 설치한 뒤 ``jekyll serve``로 서버 실행

또는 `/docs`를 Source로 설정한 후 Github Pages에 공개

## 레이아웃 종속성

`index.html`의 레이아웃:
```
index.md (코드페이지 목록) => home (달마루 소개) => base (공통 레이아웃)
```

`_pages/code-xx.html`의 레이아웃:
```
code-xx.md (코드페이지(svg only)) => codepage (코드페이지 레이아웃) => page (페이지 공통 레이아웃) => base (공통 레이아웃)
```

## 코드페이지 작성 방법

```html
<span class="character">a</span>
<div class="code tofu"></div>
```

## Jekyll 코드 문의
RanloP/dalmoori-font [Issue 생성](https://github.com/RanolP/dalmoori-font/issues/new) 후 [@ShapeLayer](https://github.com/ShapeLayer) Assign 또는  
ShapeLayer/dalmoori-font [Issue 생성](https://github.com/ShapeLayer/dalmoori-font/issues/new)