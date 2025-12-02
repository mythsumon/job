import { useRef } from "react";
import { Download, FileImage, MapPin, Phone, Mail, Globe, Linkedin, Github, Calendar, Building, GraduationCap, Briefcase, Award, Star, Languages, User, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ResumeData {
  id: number;
  title: string;
  summary?: string;
  basicInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    dateOfBirth?: string;
    nationality: string;
    maritalStatus?: string;
    drivingLicense: boolean;
    availability: string;
    expectedSalary?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    profilePicture?: string;
  };
  skillsAndLanguages?: {
    technicalSkills: Array<{
      category: string;
      skills: Array<{
        name: string;
        level: string;
      }>;
    }>;
    softSkills: string[];
    languages: Array<{
      name: string;
      proficiency: string;
      certification?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      expiryDate?: string;
      credentialId?: string;
    }>;
  };
  portfolio?: Array<{
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    tags: string[];
    url?: string;
    completionDate: string;
    client?: string;
    role: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
    description?: string;
    achievements?: string[];
  }>;
  workHistory?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  additionalInfo?: {
    hobbies: string[];
    volunteerWork: Array<{
      organization: string;
      role: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
    }>;
    awards: Array<{
      title: string;
      issuer: string;
      date: string;
      description?: string;
    }>;
    references: Array<{
      name: string;
      position: string;
      company: string;
      email: string;
      phone: string;
      relationship: string;
    }>;
    additionalSkills: string[];
    personalStatement?: string;
    careerObjective?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ResumeViewerProps {
  resume: ResumeData;
  onEdit?: () => void;
  onClose?: () => void;
}

export function ResumeViewer({ resume, onEdit, onClose }: ResumeViewerProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "전문가": return "bg-red-100 text-red-800";
      case "고급": return "bg-orange-100 text-orange-800";
      case "중급": return "bg-blue-100 text-blue-800";
      case "초급": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case "모국어": return "bg-green-100 text-green-800";
      case "유창함": return "bg-blue-100 text-blue-800";
      case "대화가능": return "bg-yellow-100 text-yellow-800";
      case "기초": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resume.basicInfo?.fullName || resume.title}_이력서.pdf`);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
    }
  };

  const handleDownloadImage = async () => {
    if (!resumeRef.current) return;

    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${resume.basicInfo?.fullName || resume.title}_이력서.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('이미지 생성 오류:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button variant="outline" onClick={handleDownloadImage}>
            <FileImage className="h-4 w-4 mr-2" />
            이미지 저장
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              편집
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              닫기
            </Button>
          )}
        </div>
      </div>

      {/* Resume Content */}
      <div ref={resumeRef} className="bg-white p-8 shadow-lg rounded-lg space-y-8">
        {/* Header Section */}
        <div className="text-center border-b pb-8">
          <div className="flex flex-col items-center space-y-4">
            {resume.basicInfo?.profilePicture && (
              <Avatar className="w-32 h-32">
                <AvatarImage src={resume.basicInfo.profilePicture} alt={resume.basicInfo.fullName} />
                <AvatarFallback>
                  <User className="w-16 h-16" />
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {resume.basicInfo?.fullName || "이름 없음"}
              </h1>
              <p className="text-xl text-gray-600 mb-4">{resume.summary}</p>
              
              {/* Contact Information */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                {resume.basicInfo?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{resume.basicInfo.email}</span>
                  </div>
                )}
                {resume.basicInfo?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{resume.basicInfo.phone}</span>
                  </div>
                )}
                {resume.basicInfo?.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{resume.basicInfo.address}, {resume.basicInfo.city}, {resume.basicInfo.country}</span>
                  </div>
                )}
              </div>

              {/* Online Profiles */}
              <div className="flex justify-center gap-4 mt-4">
                {resume.basicInfo?.website && (
                  <a href={resume.basicInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {resume.basicInfo?.linkedin && (
                  <a href={resume.basicInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {resume.basicInfo?.github && (
                  <a href={resume.basicInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information Details */}
        {resume.basicInfo && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-6 w-6" />
              기본 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resume.basicInfo.dateOfBirth && (
                <div>
                  <span className="font-semibold">생년월일:</span> {new Date(resume.basicInfo.dateOfBirth).toLocaleDateString('ko-KR')}
                </div>
              )}
              <div>
                <span className="font-semibold">국적:</span> {resume.basicInfo.nationality}
              </div>
              {resume.basicInfo.maritalStatus && (
                <div>
                  <span className="font-semibold">결혼 여부:</span> {resume.basicInfo.maritalStatus}
                </div>
              )}
              <div>
                <span className="font-semibold">근무 가능 시기:</span> {resume.basicInfo.availability}
              </div>
              {resume.basicInfo.expectedSalary && (
                <div>
                  <span className="font-semibold">희망 연봉:</span> {resume.basicInfo.expectedSalary}
                </div>
              )}
              <div>
                <span className="font-semibold">운전면허:</span> {resume.basicInfo.drivingLicense ? "보유" : "미보유"}
              </div>
            </div>
          </section>
        )}

        {/* Career Objective */}
        {resume.additionalInfo?.careerObjective && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">경력 목표</h2>
            <p className="text-gray-700 leading-relaxed">{resume.additionalInfo.careerObjective}</p>
          </section>
        )}

        {/* Work Experience */}
        {resume.workHistory && resume.workHistory.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              경력 사항
            </h2>
            <div className="space-y-6">
              {resume.workHistory.map((work, index) => (
                <div key={index} className="border-l-4 border-l-blue-500 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{work.position}</h3>
                      <p className="text-lg text-gray-700">{work.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(work.startDate)} - {work.current ? "현재" : formatDate(work.endDate || "")}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{work.description}</p>
                  {work.achievements && work.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">주요 성과:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {work.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              학력 사항
            </h2>
            <div className="space-y-6">
              {resume.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-l-green-500 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-lg text-gray-700">{edu.institution}</p>
                      <p className="text-gray-600">{edu.field}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(edu.startDate)} - {edu.current ? "재학 중" : formatDate(edu.endDate || "")}
                      </div>
                      {edu.gpa && <div>학점: {edu.gpa}</div>}
                    </div>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 mb-3">{edu.description}</p>
                  )}
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">주요 성과:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {edu.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills and Languages */}
        {resume.skillsAndLanguages && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-6 w-6" />
              기술 및 언어
            </h2>

            {/* Technical Skills */}
            {resume.skillsAndLanguages.technicalSkills && resume.skillsAndLanguages.technicalSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">전문 기술</h3>
                <div className="space-y-4">
                  {resume.skillsAndLanguages.technicalSkills.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-800 mb-2">{category.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} className={getSkillLevelColor(skill.level)}>
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {resume.skillsAndLanguages.languages && resume.skillsAndLanguages.languages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  언어 능력
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.skillsAndLanguages.languages.map((language, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{language.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getProficiencyColor(language.proficiency)}>
                          {language.proficiency}
                        </Badge>
                        {language.certification && (
                          <span className="text-sm text-gray-600">({language.certification})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {resume.skillsAndLanguages.softSkills && resume.skillsAndLanguages.softSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">소프트 스킬</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skillsAndLanguages.softSkills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Certifications */}
        {resume.skillsAndLanguages?.certifications && resume.skillsAndLanguages.certifications.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-6 w-6" />
              자격증 및 인증
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resume.skillsAndLanguages.certifications.map((cert, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600">{cert.issuer}</p>
                  <p className="text-sm text-gray-500">
                    취득일: {formatDate(cert.date)}
                    {cert.expiryDate && ` • 만료일: ${formatDate(cert.expiryDate)}`}
                  </p>
                  {cert.credentialId && (
                    <p className="text-sm text-gray-500">인증 ID: {cert.credentialId}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio */}
        {resume.portfolio && resume.portfolio.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">포트폴리오</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resume.portfolio.map((item, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  {item.images && item.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 h-48">
                      {item.images.slice(0, 4).map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`${item.title} ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ))}
                      {item.images.length > 4 && (
                        <div className="bg-gray-100 flex items-center justify-center text-gray-600">
                          +{item.images.length - 4}개 더
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{item.role}</p>
                    <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>완성일: {formatDate(item.completionDate)}</span>
                      {item.client && <span>클라이언트: {item.client}</span>}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        프로젝트 보기 →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Awards */}
        {resume.additionalInfo?.awards && resume.additionalInfo.awards.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-6 w-6" />
              수상 경력
            </h2>
            <div className="space-y-4">
              {resume.additionalInfo.awards.map((award, index) => (
                <div key={index} className="border-l-4 border-l-yellow-500 pl-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{award.title}</h3>
                      <p className="text-gray-600">{award.issuer}</p>
                      {award.description && (
                        <p className="text-gray-700 mt-1">{award.description}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(award.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Volunteer Work */}
        {resume.additionalInfo?.volunteerWork && resume.additionalInfo.volunteerWork.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6" />
              봉사활동
            </h2>
            <div className="space-y-4">
              {resume.additionalInfo.volunteerWork.map((volunteer, index) => (
                <div key={index} className="border-l-4 border-l-green-400 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{volunteer.role}</h3>
                      <p className="text-gray-600">{volunteer.organization}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(volunteer.startDate)} - {volunteer.current ? "진행 중" : formatDate(volunteer.endDate || "")}
                    </span>
                  </div>
                  <p className="text-gray-700">{volunteer.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies */}
        {resume.additionalInfo?.hobbies && resume.additionalInfo.hobbies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">취미 및 관심사</h2>
            <div className="flex flex-wrap gap-2">
              {resume.additionalInfo.hobbies.map((hobby, index) => (
                <Badge key={index} variant="outline">{hobby}</Badge>
              ))}
            </div>
          </section>
        )}

        {/* Personal Statement */}
        {resume.additionalInfo?.personalStatement && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">개인 성명서</h2>
            <p className="text-gray-700 leading-relaxed">{resume.additionalInfo.personalStatement}</p>
          </section>
        )}

        {/* References */}
        {resume.additionalInfo?.references && resume.additionalInfo.references.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              추천인
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resume.additionalInfo.references.map((reference, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{reference.name}</h3>
                  <p className="text-gray-600">{reference.position}</p>
                  <p className="text-gray-600">{reference.company}</p>
                  <p className="text-sm text-gray-500">관계: {reference.relationship}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      {reference.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {reference.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p>이력서 생성일: {new Date(resume.createdAt).toLocaleDateString('ko-KR')}</p>
          <p>마지막 수정일: {new Date(resume.updatedAt).toLocaleDateString('ko-KR')}</p>
        </div>
      </div>
    </div>
  );
}