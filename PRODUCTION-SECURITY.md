# 🛡️ Production Security Checklist

## 📋 운영 환경 배포 전 보안 체크리스트

### ✅ **코드 보안**
- [ ] 소스맵 비활성화 (`sourcemap: false`)
- [ ] 코드 난독화 활성화 (`minify: 'terser'`)
- [ ] Console.log 제거 (`drop_console: true`)
- [ ] Debugger 제거 (`drop_debugger: true`)
- [ ] 변수명 난독화 (`mangle: true`)

### ✅ **우클릭/개발자도구 보안**
- [ ] `useDisableRightClick.ts`에서 주석 제거
- [ ] F12 차단 활성화
- [ ] 우클릭 차단 활성화
- [ ] 개발자도구 감지 활성화

### ✅ **환경 변수**
- [ ] `.env` 파일들이 `.gitignore`에 포함되어 있는지 확인
- [ ] 운영 환경 환경변수 설정
- [ ] DB 비밀번호 암호화
- [ ] JWT 시크릿 키 변경

### ✅ **API 보안**
- [ ] API Rate Limiting 활성화
- [ ] CORS 정책 설정
- [ ] HTTPS 인증서 설정
- [ ] 에러 메시지에서 민감 정보 제거

### ✅ **빌드 명령어**

```bash
# 개발 환경
npm run dev

# 운영 환경 빌드
npm run build

# 운영 환경 미리보기
npm run preview
```

### ✅ **배포 후 확인사항**
- [ ] 개발자도구에서 소스 코드가 난독화되어 있는지 확인
- [ ] Network 탭에서 소스맵 파일(`.map`)이 로드되지 않는지 확인
- [ ] Console에 개발용 로그가 출력되지 않는지 확인
- [ ] 우클릭이 차단되는지 확인
- [ ] F12가 차단되는지 확인

## 🚨 **주의사항**

### **현재 개발 환경**
- 디버깅을 위해 보안 기능들이 **임시 비활성화**되어 있음
- `useDisableRightClick.ts` 파일이 주석처리됨
- 소스맵과 console.log가 활성화됨

### **운영 환경 활성화 방법**
1. `client/src/hooks/useDisableRightClick.ts`에서 주석 제거
2. `vite.config.ts`에서 `sourcemap: false` 확인
3. `npm run build`로 빌드
4. 빌드된 파일들을 운영 서버에 배포

## 📞 **문제 발생시**
- 개발자에게 연락: [개발자 연락처]
- 보안 이슈 신고: [보안팀 연락처] 