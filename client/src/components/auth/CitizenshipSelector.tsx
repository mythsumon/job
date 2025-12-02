import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { COUNTRIES, getCountryName } from '@/data/countries';

interface CitizenshipSelectorProps {
  citizenshipType: 'mongolian' | 'foreign';
  onCitizenshipChange: (type: 'mongolian' | 'foreign') => void;
  nationality?: string;
  onNationalityChange: (nationality: string) => void;
  foreignId?: string;
  onForeignIdChange: (foreignId: string) => void;
  disabled?: boolean;
}

export default function CitizenshipSelector({
  citizenshipType,
  onCitizenshipChange,
  nationality,
  onNationalityChange,
  foreignId,
  onForeignIdChange,
  disabled
}: CitizenshipSelectorProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base font-medium">{t('register.citizenship.title')}</Label>
        {/* <p className="text-sm text-muted-foreground">{t('register.citizenship.subtitle')}</p> */}
        
        <div className="grid grid-cols-1 gap-3">
          {/* Mongolian Citizen */}
          <Card 
            className={`cursor-pointer transition-all border-2 ${
              citizenshipType === 'mongolian' 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => !disabled && onCitizenshipChange('mongolian')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🇲🇳</div>
                  <div>
                    <div className="font-medium">{t('register.citizenship.mongolian')}</div>
                  </div>
                </div>
                {citizenshipType === 'mongolian' && (
                  <div className="flex-shrink-0">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      <Check className="w-3 h-3 mr-1" />
                      {t('common.selected')}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Foreign Citizen */}
          <Card 
            className={`cursor-pointer transition-all border-2 ${
              citizenshipType === 'foreign' 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => !disabled && onCitizenshipChange('foreign')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🌍</div>
                  <div>
                    <div className="font-medium">{t('register.citizenship.foreign')}</div>
                  </div>
                </div>
                {citizenshipType === 'foreign' && (
                  <div className="flex-shrink-0">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      <Check className="w-3 h-3 mr-1" />
                      {t('common.selected')}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Foreign Citizen Additional Fields */}
      {citizenshipType === 'foreign' && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-2">
            <Label>{t('register.citizenship.nationality')} *</Label>
            <Select
              value={nationality}
              onValueChange={onNationalityChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('register.citizenship.nationalityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center space-x-2">
                      <span>{getCountryName(country.code, language)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('register.citizenship.foreignId')} *</Label>
            <Input
              placeholder={t('register.citizenship.foreignIdPlaceholder')}
              value={foreignId || ''}
              onChange={(e) => onForeignIdChange(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}