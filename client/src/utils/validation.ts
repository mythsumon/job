// 비밀번호 유효성 검사 - 중간 강도
export const validatePassword = (password: string, t?: (key: string) => string): { valid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' } => {
  const errors: string[] = [];
  let score = 0;

  // 기본 길이 체크 (필수)
  if (!password || password.length < 8) {
    errors.push(t ? t('register.password.errors.tooShort') : '8자 이상 입력해주세요');
  } else {
    score += 1;
  }

  // 최대 길이 체크
  if (password.length > 50) {
    errors.push(t ? t('register.password.errors.tooLong') : '50자 이하로 입력해주세요');
  }

  // 영문자 포함 (필수)
  if (!/[a-zA-Z]/.test(password)) {
    errors.push(t ? t('register.password.errors.needsLetters') : '영문자를 포함해주세요');
  } else {
    score += 1;
  }

  // 숫자 포함 (필수)  
  if (!/\d/.test(password)) {
    errors.push(t ? t('register.password.errors.needsNumbers') : '숫자를 포함해주세요');
  } else {
    score += 1;
  }

  // 특수문자 포함 (권장 - 중간 강도에서는 필수 아님)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  }

  // 대소문자 혼용 (권장 - 중간 강도에서는 필수 아님)
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }

  // 너무 약한 패스워드 방지
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', '12345678'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push(t ? t('register.password.errors.tooCommon') : '너무 흔한 비밀번호입니다');
  }

  // 연속된 문자 체크
  if (/(.)\1{2,}/.test(password)) {
    errors.push(t ? t('register.password.errors.repeatedChars') : '동일한 문자를 3번 이상 연속 사용할 수 없습니다');
  }

  // 강도 결정
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 3) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    valid: errors.length === 0 && score >= 3, // 최소 3점 이상이어야 유효
    errors,
    strength
  };
};

// 몽골 ID 유효성 검사 (단순화됨)
export const validateMongolianIdSimple = (mongolianId: string): { valid: boolean; error?: string } => {
  if (!mongolianId) {
    return { valid: false, error: 'Mongolian ID is required' };
  }

  if (mongolianId.length !== 10) {
    return { valid: false, error: 'Mongolian ID must be exactly 10 characters' };
  }

  // 첫 2글자는 키릴 문자, 나머지 8글자는 숫자인지만 확인
  const letters = mongolianId.substring(0, 2);
  const numbers = mongolianId.substring(2, 10);

  // 키릴 문자 확인 (A-Z, А-Я 범위)
  if (!/^[A-ZА-Я]{2}$/.test(letters)) {
    return { valid: false, error: 'First 2 characters must be Cyrillic letters' };
  }

  // 숫자 확인
  if (!/^\d{8}$/.test(numbers)) {
    return { valid: false, error: 'Last 8 characters must be digits' };
  }

  return { valid: true };
}; 