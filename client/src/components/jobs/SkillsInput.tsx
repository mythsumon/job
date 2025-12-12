import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/queryClient";

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
}

// Get all unique skills from all users
async function getAllUserSkills(): Promise<string[]> {
  try {
    const users = await apiGet<any[]>("/api/talents");
    const allSkills = new Set<string>();
    
    users.forEach((user: any) => {
      if (user.skills && Array.isArray(user.skills)) {
        user.skills.forEach((skill: string) => {
          if (skill && skill.trim()) {
            allSkills.add(skill.trim());
          }
        });
      }
    });
    
    return Array.from(allSkills).sort();
  } catch {
    // Fallback to common tech skills
    return [
      "React", "TypeScript", "JavaScript", "Node.js", "Next.js", "GraphQL",
      "Vue.js", "Angular", "Python", "Java", "C++", "C#", "Go", "Rust",
      "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Flutter", "React Native",
      "HTML", "CSS", "SASS", "LESS", "Tailwind CSS", "Bootstrap",
      "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch",
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git",
      "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator",
      "Agile", "Scrum", "DevOps", "Microservices", "REST API", "GraphQL",
      "Machine Learning", "AI", "Data Science", "TensorFlow", "PyTorch",
      "SEO", "Digital Marketing", "Content Strategy", "Social Media",
    ];
  }
}

export function SkillsInput({ 
  value = [], 
  onChange, 
  placeholder = "기술을 입력하세요 (예: React, TypeScript)",
  maxSkills = 20 
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all user skills for autocomplete
  const { data: allSkills = [] } = useQuery({
    queryKey: ["/api/skills/all"],
    queryFn: getAllUserSkills,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() && allSkills.length > 0) {
      const filtered = allSkills
        .filter(skill => 
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(skill)
        )
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, allSkills, value]);

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
      addSkill(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last skill on backspace when input is empty
      removeSkill(value[value.length - 1]);
    } else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      // Focus first suggestion (can be enhanced with arrow key navigation)
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !value.includes(skill) && value.length < maxSkills) {
      onChange([...value, skill]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter(s => s !== skill));
  };

  const handleSuggestionClick = (skill: string) => {
    addSkill(skill);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border border-input rounded-md bg-background">
        {value.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
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
          {suggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleSuggestionClick(skill)}
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {skill}
            </button>
          ))}
        </div>
      )}
      
      {value.length >= maxSkills && (
        <p className="text-xs text-muted-foreground mt-1">
          최대 {maxSkills}개까지 추가할 수 있습니다.
        </p>
      )}
    </div>
  );
}

