# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "MotionLab" [level=1] [ref=e5]
      - paragraph [ref=e6]: AI 스포츠 동작 분석
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: 이메일
        - textbox "이메일" [ref=e10]:
          - /placeholder: 이메일을 입력하세요
      - generic [ref=e11]:
        - generic [ref=e12]: 비밀번호
        - generic [ref=e13]:
          - textbox "비밀번호" [ref=e14]:
            - /placeholder: 비밀번호를 입력하세요
          - button [ref=e15]:
            - img [ref=e16]
      - button "로그인" [ref=e19]
    - paragraph [ref=e20]:
      - text: 계정이 없으신가요?
      - link "회원가입" [ref=e21] [cursor=pointer]:
        - /url: /register
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
```