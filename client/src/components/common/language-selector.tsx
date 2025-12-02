import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages } from "@/i18n";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  
  const currentLanguage = languages.find(lang => lang.code === language);

  // Sort languages to show Mongolian first, then Korean, then English
  const sortedLanguages = [...languages].sort((a, b) => {
    if (a.code === 'mn') return -1;
    if (b.code === 'mn') return 1;
    if (a.code === 'ko') return -1;
    if (b.code === 'ko') return 1;
    if (a.code === 'en') return -1;
    if (b.code === 'en') return 1;
    return 0;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={t('common.language.selector.tooltip')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline font-medium">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {sortedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              console.log(`User clicked language: ${lang.code}`);
              setLanguage(lang.code);
            }}
            className={`cursor-pointer flex items-center gap-3 px-3 py-2 transition-colors ${
              language === lang.code 
                ? "bg-primary/10 text-primary font-medium" 
                : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}