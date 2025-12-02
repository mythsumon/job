import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Mail, Timer, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';

interface EmailVerificationInputProps {
  value: string;
  onChange: (value: string) => void;
  onVerificationChange: (isVerified: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

type VerificationStatus = 'idle' | 'checking' | 'available' | 'taken' | 'code-sent' | 'verified' | 'error';

export default function EmailVerificationInput({
  value,
  onChange,
  onVerificationChange,
  disabled = false,
  required = true
}: EmailVerificationInputProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Check email availability
  const checkEmailAvailability = async (email?: string) => {
    const emailToCheck = email || value;
    
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setStatus('idle');
      onVerificationChange(false);
      return;
    }

    setStatus('checking');
    
    try {
      console.log('🔍 Checking email availability for:', emailToCheck);
      const response = await apiRequest('POST', '/api/auth/check-email', { email: emailToCheck });
      console.log('📡 API Response status:', response.status);
      
      const data = await response.json();
      console.log('📧 API Response data:', data);
      
      // API response is wrapped in { success, data, meta } structure
      const emailData = data.data;
      console.log('📧 Email data:', emailData);
      
      if (emailData.available) {
        console.log('✅ Email is available');
        setStatus('available');
        onVerificationChange(false); // Still need to verify
      } else {
        console.log('❌ Email is already taken');
        setStatus('taken');
        onVerificationChange(false);
      }
    } catch (error) {
      console.error('❌ Email check error:', error);
      setStatus('error');
      onVerificationChange(false);
    }
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (!value || status !== 'available') return;

    try {
      const response = await apiRequest('POST', '/api/auth/send-verification', { email: value });
      const responseData = await response.json();
      const data = responseData.data; // Extract from wrapped response
      
      setStatus('code-sent');
      setIsCodeInputVisible(true);
      setTimeLeft(300); // 5 minutes
      
      // In development, auto-fill the code
      if (process.env.NODE_ENV === 'development' && data.code) {
        console.log('📧 Auto-filling verification code in development:', data.code);
        setTimeout(() => setVerificationCode(data.code), 1000);
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setStatus('error');
    }
  };

  // Verify code
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) return;

    try {
      const response = await apiRequest('POST', '/api/auth/verify-email', { 
        email: value, 
        code: verificationCode 
      });
      const responseData = await response.json();
      const data = responseData.data; // Extract from wrapped response
      
      if (data.verified) {
        setStatus('verified');
        setIsCodeInputVisible(false);
        onVerificationChange(true);
      }
    } catch (error) {
      console.error('Verify email error:', error);
      // Keep showing the input for retry
      setVerificationCode('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    onChange(newEmail);
    
    // Reset verification state when email changes
    setStatus('idle');
    setIsCodeInputVisible(false);
    setVerificationCode('');
    setTimeLeft(0);
    onVerificationChange(false);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(code);
    
    // Auto-verify when 6 digits entered
    if (code.length === 6) {
      setTimeout(() => verifyCode(), 500);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return (
          <Badge variant="secondary" className="ml-2">
            <Timer className="w-3 h-3 mr-1 animate-spin" />
            {t('register.email.checking')}
          </Badge>
        );
      case 'available':
        return (
          <Badge variant="default" className="ml-2 bg-blue-500">
            <Mail className="w-3 h-3 mr-1" />
            {t('register.email.available')}
          </Badge>
        );
      case 'taken':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="w-3 h-3 mr-1" />
            {t('register.email.taken')}
          </Badge>
        );
      case 'code-sent':
        return (
          <Badge variant="outline" className="ml-2">
            <Send className="w-3 h-3 mr-1" />
            {t('register.email.codeSent')}
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="default" className="ml-2 bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('register.email.verified')}
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="w-3 h-3 mr-1" />
            {t('register.email.error')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">
          {t('register.form.email')} {required && '*'}
          {getStatusBadge()}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder={t('register.form.emailPlaceholder')}
              value={value}
              onChange={handleEmailChange}
              className="pl-10 h-10"
              disabled={disabled || status === 'verified'}
              required={required}
            />
          </div>
          
          {/* 이메일 중복 확인 버튼 */}
          {(status === 'idle' || status === 'error') && value && value.includes('@') && (
            <Button
              type="button"
              onClick={() => checkEmailAvailability()}
              disabled={disabled || status === 'checking'}
              variant="outline"
            >
              {status === 'checking' ? (
                <Timer className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              {t('register.email.checkEmail')}
            </Button>
          )}
          
          {/* 인증 코드 전송 버튼 */}
          {status === 'available' && (
            <Button
              type="button"
              onClick={sendVerificationCode}
              disabled={disabled}
              variant="outline"
            >
              <Send className="w-4 h-4 mr-2" />
              {t('register.email.sendCode')}
            </Button>
          )}
        </div>
      </div>

      {/* Verification Code Input */}
      {isCodeInputVisible && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t('register.email.enterCode')}
                </Label>
                {timeLeft > 0 && (
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Timer className="w-3 h-3 mr-1" />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  className="text-center text-lg font-mono h-10"
                  maxLength={6}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  onClick={verifyCode}
                  disabled={disabled || verificationCode.length !== 6}
                  size="sm"
                >
                  {t('register.email.verify')}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                {t('register.email.codeHint')}
              </div>

              {timeLeft === 0 && status === 'code-sent' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={sendVerificationCode}
                  disabled={disabled}
                >
                  {t('register.email.resendCode')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 