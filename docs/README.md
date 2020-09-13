달무리 글꼴 문서
===

달무리 글꼴 문서를 Jekyll로 개선  

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
svg fill을 직접 수정하는건 좋은 생각이 아닌것 같아 흰배경 `div` 요소에 svg 마스크를 씌우는 방식으로 작성함. (예시 페이지 참조)

```html
<style>
#codeid {
    mask: url(/assets/img/tofu.svg) no-repeat center;
    -webkit-mask: url(/assets/img/tofu.svg) no-repeat center;
}
</style>
<div class="code" id="codeid">
```