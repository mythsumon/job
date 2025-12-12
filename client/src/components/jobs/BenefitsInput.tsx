import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface BenefitsInputProps {
  value: string[];
  onChange: (benefits: string[]) => void;
  placeholder?: string;
  maxBenefits?: number;
}

// Common benefits options
const COMMON_BENEFITS = [
  "Health insurance",
  "Remote Work",
  "Flexible Hours",
  "Paid Time Off",
  "Sick Leave",
  "Maternity/Paternity Leave",
  "Retirement Plan",
  "Stock Options",
  "Training & Development",
  "Gym Membership",
  "Free Meals",
  "Transportation Allowance",
  "Phone Allowance",
  "Laptop/Equipment",
  "Team Building Activities",
  "Career Growth Opportunities",
  "Performance Bonus",
  "Annual Bonus",
  "13th Month Salary",
  "Education Support",
];

export function BenefitsInput({ 
  value = [], 
  onChange, 
  placeholder = "복리혜택을 입력하세요 (예: Health insurance, Remote Work)",
  maxBenefits = 20 
}: BenefitsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = COMMON_BENEFITS
        .filter(benefit => 
          benefit.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(benefit)
        )
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addBenefit(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last benefit on backspace when input is empty
      removeBenefit(value[value.length - 1]);
    }
  };

  const addBenefit = (benefit: string) => {
    if (benefit && !value.includes(benefit) && value.length < maxBenefits) {
      onChange([...value, benefit]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeBenefit = (benefit: string) => {
    onChange(value.filter(b => b !== benefit));
  };

  const handleSuggestionClick = (benefit: string) => {
    addBenefit(benefit);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border border-input rounded-md bg-background">
        {value.map((benefit) => (
          <Badge
            key={benefit}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            {benefit}
            <button
              type="button"
              onClick={() => removeBenefit(benefit)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((benefit) => (
            <button
              key={benefit}
              type="button"
              onClick={() => handleSuggestionClick(benefit)}
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {benefit}
            </button>
          ))}
        </div>
      )}
      
      {value.length >= maxBenefits && (
        <p className="text-xs text-muted-foreground mt-1">
          최대 {maxBenefits}개까지 추가할 수 있습니다.
        </p>
      )}
    </div>
  );
}


