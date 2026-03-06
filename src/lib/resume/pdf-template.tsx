import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface ResumeData {
  name: string;
  contact?: { name?: string; email?: string; phone?: string; location?: string };
  summary?: string;
  experience?: {
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    bullets: string[];
  }[];
  education?: {
    institution: string;
    degree: string;
    field?: string;
    graduationDate?: string;
    gpa?: string;
  }[];
  skills?: string[];
  certifications?: string[];
  projects?: {
    name: string;
    description: string;
    tech?: string;
    url?: string;
  }[];
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    color: "#111827",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 3,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 10,
    gap: 4,
  },
  contactSep: {
    marginHorizontal: 4,
    color: "#9ca3af",
  },
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#2563eb",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#bfdbfe",
    paddingBottom: 2,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#374151",
  },
  expItem: {
    marginBottom: 8,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#111827",
  },
  expDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  expCompany: {
    fontSize: 9.5,
    color: "#374151",
    marginBottom: 3,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 9,
    marginRight: 4,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  bulletText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
    flex: 1,
  },
  eduItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  eduLeft: {
    flex: 1,
  },
  eduDegree: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#111827",
  },
  eduInstitution: {
    fontSize: 9.5,
    color: "#374151",
  },
  eduDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  skillsText: {
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.5,
  },
  projectItem: {
    marginBottom: 6,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  projectName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#111827",
  },
  projectTech: {
    fontSize: 9,
    color: "#6b7280",
    fontFamily: "Helvetica-Oblique",
  },
  projectDesc: {
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.4,
  },
  certText: {
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.6,
  },
});

export function ResumePDFDocument({ resume }: { resume: ResumeData }) {
  const contact = resume.contact ?? {};
  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{contact.name || resume.name}</Text>
        <View style={styles.contactRow}>
          {contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text style={styles.contactSep}>•</Text>}
              <Text>{part}</Text>
            </React.Fragment>
          ))}
        </View>
        <View style={styles.divider} />

        {/* Summary */}
        {resume.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{resume.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {resume.experience.map((exp, i) => (
              <View key={i} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDate}>
                    {exp.startDate}
                    {exp.endDate ? ` – ${exp.endDate}` : ""}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ""}
                </Text>
                {exp.bullets.filter(Boolean).map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {resume.education && resume.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, i) => (
              <View key={i} style={styles.eduItem}>
                <View style={styles.eduLeft}>
                  <Text style={styles.eduDegree}>
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                    {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                  </Text>
                  <Text style={styles.eduInstitution}>{edu.institution}</Text>
                </View>
                {edu.graduationDate ? (
                  <Text style={styles.eduDate}>{edu.graduationDate}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{resume.skills.join(" • ")}</Text>
          </View>
        ) : null}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, i) => (
              <View key={i} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.tech ? (
                    <Text style={styles.projectTech}>{project.tech}</Text>
                  ) : null}
                </View>
                <Text style={styles.projectDesc}>{project.description}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, i) => (
              <Text key={i} style={styles.certText}>• {cert}</Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
