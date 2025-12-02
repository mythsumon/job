import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from 'lucide-react';
import { COUNTRY_CODES } from '@/data/countryCodes';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  label,
  placeholder,
  required = false,
  disabled = false
}: PhoneInputProps) {
  const { t } = useLanguage();
  const selectedCountry = COUNTRY_CODES.find(country => country.code === countryCode) || COUNTRY_CODES[0];
  const defaultPlaceholder = placeholder || t('register.phone.placeholder');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자, 하이픈, 공백만 허용
    const cleaned = e.target.value.replace(/[^\d\s\-]/g, '');
    onChange(cleaned);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">
        {label} {required && '*'}
      </Label>
      <div className="flex gap-2">
        {/* 국가 번호 선택 */}
        <Select
          value={countryCode}
          onValueChange={onCountryCodeChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-32 h-10">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedCountry.flag}</span>
                <span className="text-sm font-mono">{selectedCountry.code}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_CODES.map((country) => (
              <SelectItem key={country.countryCode} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span className="font-mono text-sm">{country.code}</span>
                  <span className="text-sm text-muted-foreground">
                    {t(`register.countries.${country.countryCode}`)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 전화번호 입력 */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="phone"
            type="tel"
            placeholder={defaultPlaceholder}
            value={value}
            onChange={handlePhoneChange}
            className="pl-10 h-10"
            disabled={disabled}
            required={required}
          />
        </div>
      </div>
      
      {/* 완성된 전화번호 미리보기 */}
      {(countryCode && value) && (
        <div className="text-xs text-muted-foreground">
          완성된 번호: <span className="font-mono">{countryCode} {value}</span>
        </div>
      )}
    </div>
  );
} 