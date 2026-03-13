import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import Code from "../components/Code";
import collection from "lodash-es/collection";
import { AuthContext, withAuth } from "../lib/auth/AuthProvider";
import axios from "axios";
import getCoalitions from "../lib/getCoalitions";
import ProjectScore from "../components/badge/ProjectScore";
import { WORK_EXP_SLUGS, WorkExperience, getEmploymentLabel, formatDateRange } from "../lib/workExperiences";
import { useModal } from "../components/common/AppModal";
import { StarButton } from "../components/common/StarButton";
import { SelectField } from "../components/common/SelectField";
import { ToggleSwitch } from "../components/common/ToggleSwitch";
import { renderMd } from "../components/common/RenderMd";
import { StatsWrapper } from "../components/dashboard/StatsWrapper";
import { StatsOptions } from "../components/dashboard/StatsOptions";
import { FeedbackForm } from "../components/dashboard/FeedbackForm";
import { SkillTagsEditor, SkillTagItem } from "../components/dashboard/SkillTagsEditor";
import { ExpForm, ExpFormState } from "../components/dashboard/ExpForm";
import { parseCredlyBadgeId } from "../components/dashboard/Helpers";

const Home = () => {
  const { data } = useContext(AuthContext);

  const [cursusId, setCursusId] = useState(
    data.extended42Data.cursus_users[
      data.extended42Data.cursus_users.length - 1
    ].cursus_id.toString()
  );
  const cursus_users = collection.keyBy(
    data.extended42Data.cursus_users,
    "cursus_id"
  );

  const selectedCursus =
    cursus_users[cursusId] ?? data.extended42Data.cursus_users[0];

  const [coalitionId, setCoalitionId] = useState(
    data.extended42Data.coalitions.length
      ? data.extended42Data.coalitions[
          data.extended42Data.coalitions.length - 1
        ].id.toString()
      : "undefined"
  );

  const [isDisplayName, setIsDisplayName] = useState(data.isDisplayName);
  const [isDisplayEmail, setIsDisplayEmail] = useState(data.isDisplayEmail);
  const [isDisplayPhoto, setIsDisplayPhoto] = useState(data.isDisplayPhoto);
  const { show: showModal, node: modalNode } = useModal();

  const patchMe = useCallback(async (updates: Record<string, any>) => {
    try {
      await axios.patch("/api/me", {
        isDisplayEmail: isDisplayEmail ? "true" : "false",
        isDisplayName: isDisplayName ? "true" : "false",
        ...updates,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save changes.";
      showModal({ title: "Error", message: msg, icon: "alert" });
    }
  }, [isDisplayEmail, isDisplayName, showModal]);

  const [photoMode, setPhotoMode] = useState<"none" | "42campus" | "custom">((data as any).photoMode ?? "none");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>((data as any).customPhotoUrl ?? "");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("https://api.github.com/repos/lorenzoedoardofrancesco/42cv")
      .then((r) => r.json())
      .then((d) => { if (typeof d.stargazers_count === "number") setStarCount(d.stargazers_count); })
      .catch(() => {});
  }, []);

  const [isDisplayProjectCount, setIsDisplayProjectCount] = useState((data as any).isDisplayProjectCount ?? true);
  const [isPublicProfile, setIsPublicProfile] = useState((data as any).isPublicProfile ?? false);
  const [isDisplayOutstandingVotes, setIsDisplayOutstandingVotes] = useState((data as any).isDisplayOutstandingVotes ?? true);
  const [isDisplayJourney, setIsDisplayJourney] = useState<boolean>((data as any).isDisplayJourney ?? true);
  const [selectedAchievementIds, setSelectedAchievementIds] = useState<number[]>((data as any).selectedAchievementIds ?? []);
  const [githubUrl, setGithubUrl] = useState<string>((data as any).githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState<string>((data as any).linkedinUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState<string>((data as any).websiteUrl ?? "");
  const [address, setAddress] = useState<string>((data as any).address ?? "");
  const [phone, setPhone] = useState<string>((data as any).phone ?? "");
  const [defaultDarkMode, setDefaultDarkMode] = useState<boolean>((data as any).defaultDarkMode ?? false);
  const [isDisplayCampusCohortRank, setIsDisplayCampusCohortRank] = useState<boolean>((data as any).isDisplayCampusCohortRank ?? false);
  const [isDisplayCohortRank, setIsDisplayCohortRank] = useState<boolean>((data as any).isDisplayCohortRank ?? false);
  const [isDisplayAllTimeRank, setIsDisplayAllTimeRank] = useState<boolean>((data as any).isDisplayAllTimeRank ?? false);
  const [bio, setBio] = useState<string>((data as any).bio ?? "");
  const [skillTags, setSkillTags] = useState<SkillTagItem[]>(
    ((data as any).skillTags ?? []).map((t: any) => ({
      category: t.category,
      items: Array.isArray(t.items) ? t.items : typeof t.items === "string" ? t.items.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    }))
  );
  const [featuredProjectIds, setFeaturedProjectIds] = useState<number[]>((data as any).featuredProjectIds ?? []);
  const [projectDescriptionOverrides, setProjectDescriptionOverrides] = useState<Record<string, string>>((data as any).projectDescriptionOverrides ?? {});
  const [descOverridePreviews, setDescOverridePreviews] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"profile" | "experiences" | "projects" | "certifications" | "settings">("profile");
  const [credlyBadges, setCredlyBadges] = useState<{ id: string; name?: string; imageUrl?: string; issuer?: string; label?: string }[]>(((data as any).credlyBadges as any[]) ?? []);
  const [credlyInput, setCredlyInput] = useState("");
  const [credlyAdding, setCredlyAdding] = useState(false);
  const addCredlyBadge = useCallback(async (input: string, showErrors: boolean) => {
    const id = parseCredlyBadgeId(input);
    if (!id) { if (showErrors) showModal({ title: "Invalid badge", message: "Could not find a valid Credly badge ID.", icon: "alert" }); return; }
    if (credlyBadges.some((b) => b.id === id)) { if (showErrors) showModal({ title: "Already added", message: "This badge is already on your CV.", icon: "info" }); return; }
    setCredlyAdding(true);
    let meta: { name?: string; imageUrl?: string; issuer?: string } = {};
    try {
      const r = await axios.get(`/api/credly-badge?id=${id}`);
      meta = r.data;
    } catch (err: any) {
      setCredlyAdding(false);
      const msg = err?.response?.data?.message ?? "Failed to fetch badge.";
      if (showErrors) showModal({ title: err?.response?.status === 403 ? "Badge ownership mismatch" : "Failed to fetch badge", message: msg, icon: "alert" });
      return;
    }
    const next = [...credlyBadges, { id, ...meta }];
    setCredlyBadges(next);
    setCredlyInput("");
    await patchMe({ credlyBadges: next });
    setCredlyAdding(false);
  }, [credlyBadges, patchMe, showModal]);
  const [bioPreview, setBioPreview] = useState(false);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [expLoading, setExpLoading] = useState(true);
  const [showAddExp, setShowAddExp] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState<ExpFormState>({
    type: "EXTERNAL",
    projectSlug: "",
    jobTitle: "",
    employmentType: "internship",
    companyName: "",
    companyCity: "",
    companyCountry: "",
    startDate: null,
    endDate: null,
    description: "",
  });

  useEffect(() => {
    axios.get("/api/me/work-experiences").then((r) => {
      setWorkExperiences(sortExps(r.data));
      setExpLoading(false);
    }).catch(() => setExpLoading(false));
  }, []);

  const resetExpForm = () => {
    setExpForm({ type: "EXTERNAL", projectSlug: "", jobTitle: "", employmentType: "internship", companyName: "", companyCity: "", companyCountry: "", startDate: null, endDate: null, description: "" });
    setShowAddExp(false);
    setEditingExpId(null);
  };

  const saveExp = async () => {
    try {
      if (editingExpId) {
        const { data: updated } = await axios.patch(`/api/me/work-experiences/${editingExpId}`, expForm);
        setWorkExperiences((prev) => sortExps(prev.map((e) => e.id === editingExpId ? updated : e)));
      } else {
        const { data: created } = await axios.post("/api/me/work-experiences", expForm);
        setWorkExperiences((prev) => sortExps([...prev, created]));
      }
      resetExpForm();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to save experience.";
      showModal({ title: "Error", message: msg, icon: "alert" });
    }
  };

  const deleteExp = async (id: string) => {
    try {
      await axios.delete(`/api/me/work-experiences/${id}`);
      setWorkExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to delete experience.";
      showModal({ title: "Error", message: msg, icon: "alert" });
    }
  };

  const startEditExp = (exp: WorkExperience) => {
    setShowAddExp(false);
    setEditingExpId(exp.id);
    setExpForm({
      type: exp.type as "FORTY_TWO" | "EXTERNAL",
      projectSlug: exp.projectSlug ?? "",
      jobTitle: exp.jobTitle ?? "",
      employmentType: exp.employmentType,
      companyName: exp.companyName ?? "",
      companyCity: exp.companyCity ?? "",
      companyCountry: exp.companyCountry ?? "",
      startDate: exp.startDate ?? null,
      endDate: exp.endDate ?? null,
      description: exp.description ?? "",
    });
  };

  const sortExps = (exps: WorkExperience[]) =>
    [...exps].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));

  const validatedWork42 = useMemo(() => {
    const usedSlugs42 = new Set(workExperiences.filter((e) => e.type === "FORTY_TWO").map((e) => e.projectSlug));
    const editingSlug = editingExpId ? workExperiences.find((e) => e.id === editingExpId)?.projectSlug : null;
    return data.extended42Data.projects_users
      .filter((p: any) => p["validated?"] && WORK_EXP_SLUGS.has(p.project.slug) && (!usedSlugs42.has(p.project.slug) || p.project.slug === editingSlug));
  }, [workExperiences, editingExpId, data.extended42Data.projects_users]);
  const [projectGithubLinks, setProjectGithubLinks] = useState<Record<string, string>>(() => {
    const links: Record<string, string> = {};
    for (const link of ((data as any).projectGithubLinks ?? []) as { projectSlug: string; githubUrl: string }[]) {
      links[link.projectSlug] = link.githubUrl;
    }
    return links;
  });

  const coalition = useMemo(
    () => getCoalitions(coalitionId, data.extended42Data.coalitions),
    [coalitionId, data.extended42Data.coalitions]
  );

  useEffect(() => {
    if (
      data.extended42Data.coalitions.length &&
      selectedCursus.cursus.slug.includes("piscine")
    ) {
      setCoalitionId("piscine");
    }
  }, [selectedCursus, data.extended42Data.coalitions.length]);

  const statsUrl = `https://42cv.dev/api/badge/${data.id}/stats?cursusId=${cursusId}&coalitionId=${coalitionId}`;

  const cvCompleteness = useMemo(() => {
    const checks = [
      !!bio.trim(),
      !!githubUrl.trim(),
      !!linkedinUrl.trim(),
      !!address.trim(),
      !!phone.trim(),
      Object.values(projectGithubLinks).some((v) => !!v.trim()),
      workExperiences.length > 0,
      skillTags.length > 0,
      featuredProjectIds.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [bio, githubUrl, linkedinUrl, address, phone, projectGithubLinks, workExperiences, skillTags, featuredProjectIds]);
  const projectUrl = `https://42cv.dev/api/badge/${data.id}/project`;

  const projectList = useMemo(
    () =>
      collection
        .filter(
          data.extended42Data.projects_users,
          (o) =>
            !o.project.parent_id &&
            o.cursus_ids.includes(parseInt(cursusId))
        )
        .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)),
    [cursusId, data.extended42Data.projects_users]
  );

  const primaryCampus =
    collection.find(
      data.extended42Data.campus,
      (campus) =>
        campus.id ===
        (
          collection.find(
            data.extended42Data.campus_users,
            (campus_user) => campus_user.is_primary
          ) ?? data.extended42Data.campus_users[0]
        ).campus_id
    ) ?? data.extended42Data.campus[0];

  return (
    <Layout>
      <Head>
        <title>42cv.dev</title>
      </Head>
      <div className="flex sm:hidden justify-center pt-2 pb-1">
        <StarButton starCount={starCount} />
      </div>

      <div className="sm:hidden border-t border-neutral-800 mt-2 mb-0" />

      <section className="space-y-4">
        <div className="text-center pt-2 sm:pt-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-white">42cv</h1>
            <span className="px-2 py-0.5 text-xs font-bold tracking-widest uppercase rounded-full bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse">
              New
            </span>
          </div>
          <p className="mt-2 text-neutral-500">
            A recruiter-friendly CV page - shareable in one link.
          </p>
        </div>
        <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg space-y-4">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-200">Make profile public</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Anyone with the link can view your profile - no login required.
              </p>
            </div>
            <ToggleSwitch
              checked={isPublicProfile}
              onChange={async (next) => {
                setIsPublicProfile(next);
                await patchMe({ isPublicProfile: next ? "true" : "false" });
              }}
            />
          </label>
          {isPublicProfile && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2.5 bg-green-950/40 border border-green-800/50 rounded-lg">
                  <span className="text-xs text-green-400 shrink-0">Your CV is live at</span>
                  <a href={`https://42cv.dev/${data.extended42Data.login}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-green-300 hover:text-green-100 truncate flex-1">
                    https://42cv.dev/{data.extended42Data.login}
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(`https://42cv.dev/${data.extended42Data.login}`)} className="text-xs text-green-500 hover:text-green-300 shrink-0 transition-colors">Copy</button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">CV completeness</span>
                    <span className="text-xs text-neutral-400">{cvCompleteness}%</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cvCompleteness}%`, backgroundColor: cvCompleteness === 100 ? "#22c55e" : cvCompleteness >= 50 ? "#eab308" : "#ef4444" }} />
                  </div>
                </div>
              </div>

              <div className="flex border-b border-neutral-800 -mx-4 px-4 gap-1 overflow-x-auto scrollbar-none">
                {([
                  { id: "profile", label: "Profile" },
                  { id: "experiences", label: "Experiences" },
                  { id: "projects", label: "Projects" },
                  { id: "certifications", label: "Certifications" },
                  { id: "settings", label: "Settings" },
                ] as const).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px shrink-0 ${
                      activeTab === id
                        ? "border-green-500 text-green-400"
                        : "border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "profile" && (
                <div className="space-y-6 pt-1">
                  <div>
                    <p className="text-sm font-medium text-neutral-200 mb-1">Profile Photo</p>
                    <p className="text-xs text-neutral-500 mb-3">Choose what appears as your photo on the CV.</p>
                    <div className="flex rounded-lg border border-neutral-700 overflow-hidden w-fit mb-4">
                      {([
                        { value: "none", label: "None" },
                        { value: "42campus", label: "42 Campus" },
                        { value: "custom", label: "Custom" },
                      ] as const).map(({ value, label }) => (
                        <button key={value}
                          onClick={async () => {
                            setPhotoMode(value);
                            await patchMe({ photoMode: value });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${photoMode === value ? "bg-neutral-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {photoMode === "custom" && (
                      <div className="flex items-start gap-4">
                        {customPhotoUrl && (
                          <div className="relative shrink-0">
                            <img src={customPhotoUrl} alt="Custom photo" className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700" />
                            <button
                              onClick={async () => {
                                try {
                                  await axios.delete("/api/upload-photo");
                                  setCustomPhotoUrl("");
                                  setPhotoMode("none");
                                } catch (err: any) {
                                  const msg = err?.response?.data?.message ?? "Failed to delete photo.";
                                  showModal({ title: "Error", message: msg, icon: "alert" });
                                }
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-900 border border-neutral-600 flex items-center justify-center text-neutral-400 hover:text-red-400 hover:border-red-700 transition-colors"
                              title="Remove photo"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        )}
                        <div className="flex-1">
                          <label className={`flex items-center justify-center w-full h-16 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-500 transition-colors ${photoUploading ? "opacity-50 pointer-events-none" : ""}`}>
                            <span className="text-xs text-neutral-500 text-center">{photoUploading ? "Uploading…" : "Click to upload JPG/PNG · max 200 KB · square recommended"}</span>
                            <input type="file" accept="image/jpeg,image/png" className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 200 * 1024) { showModal({ title: "File too large", message: "Image must be under 200 KB.", icon: "alert" }); return; }
                                setPhotoUploading(true);
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  try {
                                    const { data: res } = await axios.post("/api/upload-photo", { dataUrl: reader.result });
                                    setCustomPhotoUrl(res.url);
                                    setPhotoMode("custom");
                                  } catch (err: any) {
                                    showModal({ title: "Upload failed", message: err?.response?.data?.message ?? "Something went wrong.", icon: "alert" });
                                  } finally {
                                    setPhotoUploading(false);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <hr className="border-neutral-800" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-neutral-200">Bio</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-600">Markdown available: **bold**, *italic*, `code`</span>
                        <button onClick={() => setBioPreview((v) => !v)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${bioPreview ? "border-green-700 text-green-400 bg-green-950/30" : "border-neutral-700 text-neutral-500 hover:text-neutral-300"}`}
                        >
                          {bioPreview ? "Edit" : "Preview"}
                        </button>
                      </div>
                    </div>
                    {bioPreview ? (
                      <div className="min-h-[120px] w-full text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 space-y-1.5">
                        {bio.split("\n").filter(Boolean).map((line, i) => (
                          <p key={i} className="text-sm leading-relaxed text-neutral-300">{renderMd(line, "px-1 py-0.5 rounded text-[11px] bg-neutral-700 text-neutral-200")}</p>
                        ))}
                        {!bio && <p className="text-neutral-600 text-sm">Nothing to preview yet.</p>}
                      </div>
                    ) : (
                      <textarea
                        value={bio}
                        placeholder="e.g. Systems engineer specialised in C/C++, looking for a backend role."
                        onChange={(e) => setBio(e.target.value)}
                        onBlur={async () => { await patchMe({ bio }); }}
                        rows={6}
                        maxLength={400}
                        className="w-full text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 resize-none"
                      />
                    )}
                    <p className="text-xs text-neutral-600 text-right mt-1">{bio.length}/400</p>
                  </div>

                  <hr className="border-neutral-800" />

                  <div>
                    <p className="text-sm font-medium text-neutral-200 mb-3">Contact & Links</p>
                    <div className="space-y-2">
                      {([
                        { label: "GitHub", value: githubUrl, set: setGithubUrl, key: "githubUrl", placeholder: "https://github.com/username", maxLength: 2000 },
                        { label: "LinkedIn", value: linkedinUrl, set: setLinkedinUrl, key: "linkedinUrl", placeholder: "https://linkedin.com/in/username", maxLength: 2000 },
                        { label: "Website", value: websiteUrl, set: setWebsiteUrl, key: "websiteUrl", placeholder: "https://yourwebsite.com", maxLength: 2000 },
                        { label: "Address", value: address, set: setAddress, key: "address", placeholder: "City, Country", maxLength: 200 },
                        { label: "Phone", value: phone, set: setPhone, key: "phone", placeholder: "+41 79 000 00 00", maxLength: 20 },
                      ] as const).map(({ label, value, set, key, placeholder, maxLength }) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs text-neutral-400 w-20 shrink-0">{label}</span>
                          <input type="text" value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => set(e.target.value)}
                            onBlur={async () => { await patchMe({ [key]: value }); }}
                            className="flex-1 text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-neutral-800" />

                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-sm font-medium text-neutral-200">Skill Tags</p>
                      <span className="text-[10px] text-neutral-600">e.g. Programming, Tools, Languages</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-3">Freeform skill categories shown in the Overview sidebar.</p>
                    <SkillTagsEditor
                      value={skillTags}
                      onChange={async (next) => {
                        setSkillTags(next);
                        await patchMe({ skillTags: next });
                      }}
                    />
                  </div>

                  <hr className="border-neutral-800" />

                  {(data.extended42Data.achievements ?? []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-neutral-200 mb-1">Achievements on CV</p>
                      <p className="text-xs text-neutral-500 mb-3">Select which achievements to show on your public profile.</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(data.extended42Data.achievements as any[]).filter((a) => a.visible !== false).map((a) => {
                          const checked = selectedAchievementIds.includes(a.id);
                          return (
                            <label key={a.id} className="flex items-start gap-3 cursor-pointer group">
                              <input type="checkbox" checked={checked} onChange={async () => {
                                const next = checked ? selectedAchievementIds.filter((id) => id !== a.id) : [...selectedAchievementIds, a.id];
                                setSelectedAchievementIds(next);
                                await patchMe({ selectedAchievementIds: next });
                              }} className="mt-0.5 accent-green-500 shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">{a.name}</p>
                                <p className="text-xs text-neutral-500">{a.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "experiences" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <p className="text-sm font-medium text-neutral-200 mb-1">Professional Experiences</p>
                    <p className="text-xs text-neutral-500 mb-3">
                      Any professional experience: full-time jobs, internships, apprenticeships, work-study or freelance.<br />
                      Entries with a company name, start date and description appear on your CV.
                    </p>
                    <div className="mb-3 px-3 py-2 rounded-md bg-amber-950/30 border border-amber-900/50 text-xs text-amber-400">
                      The 42 API doesn&apos;t expose contract details — fill in all fields manually, including for 42-validated entries.
                    </div>
                    {expLoading ? (
                      <p className="text-xs text-neutral-500">Loading…</p>
                    ) : (
                      <div className="space-y-2">
                        {workExperiences.map((exp) => (
                          <div key={exp.id} className="px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-md">
                            {editingExpId === exp.id ? (
                              <ExpForm form={expForm} setForm={setExpForm} validatedWork42={validatedWork42} onSave={saveExp} onCancel={resetExpForm} />
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-neutral-200 truncate">
                                    {exp.companyName || <span className="text-neutral-500 italic">No company</span>}
                                    {exp.companyCity ? ` · ${exp.companyCity}` : ""}
                                  </p>
                                  <p className="text-xs text-neutral-400">
                                    {exp.jobTitle ? `${exp.jobTitle} · ` : ""}{getEmploymentLabel(exp.employmentType)}
                                    {exp.finalScore !== null && (
                                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border" style={{ color: "#22c55e", backgroundColor: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.30)" }}>{exp.finalScore}</span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-neutral-500 mt-0.5">{formatDateRange(exp.startDate, exp.endDate)}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => startEditExp(exp)} className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors">Edit</button>
                                  <button onClick={() => showModal({ title: "Delete experience", message: "This action cannot be undone.", icon: "trash", confirmLabel: "Delete", confirmVariant: "red", cancelLabel: "Cancel", onConfirm: () => deleteExp(exp.id) })} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {showAddExp ? (
                          <div className="px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-md">
                            <ExpForm form={expForm} setForm={setExpForm} validatedWork42={validatedWork42} onSave={saveExp} onCancel={resetExpForm} />
                          </div>
                        ) : (
                          <button onClick={() => { resetExpForm(); setShowAddExp(true); }} className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-300 border border-dashed border-neutral-700 rounded-md transition-colors">
                            + Add experience
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="space-y-6 pt-1">
                  <div>
                    <p className="text-sm font-medium text-neutral-200 mb-1">Featured Projects</p>
                    <p className="text-xs text-neutral-500 mb-3">Up to 5 projects shown pre-expanded in the Overview tab. Check to select, order is preserved.</p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {projectList.filter((p: any) => p["validated?"]).map((project: any) => {
                        const idx = featuredProjectIds.indexOf(project.id);
                        const checked = idx !== -1;
                        return (
                          <label key={project.id} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={checked} disabled={!checked && featuredProjectIds.length >= 5}
                              onChange={async () => {
                                const next = checked ? featuredProjectIds.filter((id) => id !== project.id) : [...featuredProjectIds, project.id];
                                setFeaturedProjectIds(next);
                                await patchMe({ featuredProjectIds: next });
                              }}
                              className="accent-green-500 shrink-0"
                            />
                            {checked && <span className="text-[10px] text-neutral-500 w-4 shrink-0 text-center">{idx + 1}</span>}
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                              <span className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors truncate">{project.project.name}</span>
                              <span className="text-[10px] text-neutral-600 shrink-0">{project.final_mark ?? "-"}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {featuredProjectIds.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-neutral-200 mb-1">Featured Project Descriptions</p>
                      <p className="text-xs text-neutral-500 mb-3">Override the auto-fetched description for each featured project. Leave blank to keep the default.</p>
                      <div className="space-y-3">
                        {projectList.filter((p: any) => featuredProjectIds.includes(p.id)).map((project: any) => {
                          const slug = project.project.slug;
                          const preview = !!descOverridePreviews[slug];
                          const val = projectDescriptionOverrides[slug] ?? "";
                          return (
                            <div key={project.id}>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-neutral-400 truncate">{project.project.name}</p>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className="text-[10px] text-neutral-600">Markdown available: **bold**, *italic*, `code`</span>
                                  <button onClick={() => setDescOverridePreviews((p) => ({ ...p, [slug]: !p[slug] }))}
                                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${preview ? "border-green-700 text-green-400 bg-green-950/30" : "border-neutral-700 text-neutral-500 hover:text-neutral-300"}`}
                                  >
                                    {preview ? "Edit" : "Preview"}
                                  </button>
                                </div>
                              </div>
                              {preview ? (
                                <div className="min-h-[60px] w-full text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 space-y-1">
                                  {val.split("\n").filter(Boolean).map((line, i) => (
                                    <p key={i} className="text-sm leading-relaxed text-neutral-300">{renderMd(line, "px-1 py-0.5 rounded text-[11px] bg-neutral-700 text-neutral-200")}</p>
                                  ))}
                                  {!val && <p className="text-neutral-600 text-sm">Nothing to preview yet.</p>}
                                </div>
                              ) : (
                                <textarea
                                  value={val}
                                  placeholder="Leave blank to use the default description…"
                                  rows={2}
                                  onChange={(e) => setProjectDescriptionOverrides((prev) => ({ ...prev, [slug]: e.target.value }))}
                                  onBlur={async () => {
                                    await patchMe({ projectDescriptionOverrides });
                                  }}
                                  className="w-full text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 resize-none"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-neutral-200 mb-1">Project GitHub Links</p>
                    <p className="text-xs text-neutral-500 mb-3">Link each project to its GitHub repo — recruiters see a clickable icon on your CV.</p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {projectList.map((project) => {
                        const slug = project.project.slug;
                        const currentUrl = projectGithubLinks[slug] ?? "";
                        return (
                          <div key={project.id} className="flex items-center gap-3">
                            <span className="text-xs text-neutral-400 w-36 shrink-0 truncate" title={project.project.name}>{project.project.name}</span>
                            <input type="text" value={currentUrl} placeholder="https://github.com/user/repo"
                              onChange={(e) => setProjectGithubLinks((prev) => ({ ...prev, [slug]: e.target.value }))}
                              onBlur={async () => {
                                const val = currentUrl.trim();
                                try {
                                  if (val) {
                                    await axios.put("/api/project-github-links", { projectSlug: slug, githubUrl: val });
                                    setProjectGithubLinks((prev) => ({ ...prev, [slug]: val }));
                                  } else {
                                    await axios.delete("/api/project-github-links", { data: { projectSlug: slug } });
                                    setProjectGithubLinks((prev) => { const next = { ...prev }; delete next[slug]; return next; });
                                  }
                                } catch (err: any) {
                                  const msg = err?.response?.data?.error ?? "Failed to save link.";
                                  showModal({ title: "Invalid URL", message: msg, icon: "alert" });
                                  setProjectGithubLinks((prev) => ({ ...prev }));
                                }
                              }}
                              className="flex-1 text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "certifications" && (
                <div className="space-y-6 pt-1">
                  <div>
                    <p className="text-sm font-medium text-neutral-200 mb-1">Credly Badges</p>
                    <p className="text-xs text-neutral-500 mb-3">Paste your Credly embed code, badge URL, or badge ID. Appears on your CV between Work Experience and Projects.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={credlyInput}
                        onChange={(e) => setCredlyInput(e.target.value)}
                        placeholder='Paste embed HTML, URL, or badge ID…'
                        disabled={credlyAdding}
                        className="flex-1 text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 disabled:opacity-50"
                        onKeyDown={async (e) => { if (e.key === "Enter") (document.activeElement as HTMLElement)?.blur(); }}
                        onBlur={() => addCredlyBadge(credlyInput, false)}
                      />
                      <button
                        disabled={credlyAdding}
                        onClick={() => addCredlyBadge(credlyInput, true)}
                        className="px-3 py-2 text-sm bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors shrink-0 disabled:opacity-50"
                      >
                        {credlyAdding ? "…" : "Add"}
                      </button>
                    </div>
                  </div>

                  {credlyBadges.length > 0 && (
                    <div className="space-y-3">
                      {credlyBadges.map((badge, i) => (
                        <div key={badge.id} className="flex items-center gap-3 p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                          {badge.imageUrl && (
                            <img src={badge.imageUrl} alt={badge.name ?? badge.id} loading="lazy" className="w-10 h-10 rounded object-contain shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-neutral-300 truncate">{badge.name ?? badge.id}</p>
                            {badge.issuer && <p className="text-[10px] text-neutral-500 truncate">{badge.issuer}</p>}
                            <input
                              type="text"
                              value={badge.label ?? ""}
                              placeholder="Custom label (optional)"
                              onChange={(e) => {
                                const next = credlyBadges.map((b, j) => j === i ? { ...b, label: e.target.value } : b);
                                setCredlyBadges(next);
                              }}
                              onBlur={async () => {
                                await patchMe({ credlyBadges });
                              }}
                              className="mt-1 w-full text-xs bg-neutral-900 border border-neutral-700 text-neutral-300 rounded px-2 py-1 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                            />
                          </div>
                          <button
                            onClick={async () => {
                              const next = credlyBadges.filter((_, j) => j !== i);
                              setCredlyBadges(next);
                              await patchMe({ credlyBadges: next });
                            }}
                            className="shrink-0 text-neutral-500 hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-5 pt-1">
                  <label className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-200">Default CV theme</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Initial appearance for visitors.</p>
                    </div>
                    <div className="flex rounded-lg border border-neutral-700 overflow-hidden shrink-0">
                      {([{ value: false, icon: "☀️", label: "Light" }, { value: true, icon: "🌙", label: "Dark" }] as const).map(({ value, icon, label }) => (
                        <button key={label} onClick={async () => { setDefaultDarkMode(value); await patchMe({ defaultDarkMode: value ? "true" : "false" }); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${defaultDarkMode === value ? "bg-neutral-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"}`}
                        >
                          <span>{icon}</span><span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </label>

                  <hr className="border-neutral-800" />

                  <div>
                    <p className="text-sm font-medium text-neutral-200 mb-1">Rankings</p>
                    <p className="text-xs text-neutral-500 mb-3">Computed weekly from the full 42 network.</p>
                    <div className="space-y-3">
                      {([
                        { key: "isDisplayCampusCohortRank" as const, label: "Campus cohort rank", desc: `Rank among ${primaryCampus?.name ?? "your campus"} students from the same pool year.`, value: isDisplayCampusCohortRank, set: setIsDisplayCampusCohortRank },
                        { key: "isDisplayCohortRank" as const, label: "Cohort rank", desc: "Rank among all 42 students from the same pool year.", value: isDisplayCohortRank, set: setIsDisplayCohortRank },
                        { key: "isDisplayAllTimeRank" as const, label: "All-time rank", desc: "Rank among all 42 students.", value: isDisplayAllTimeRank, set: setIsDisplayAllTimeRank },
                      ] as const).map(({ key, label, desc, value, set }) => (
                        <label key={key} className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-neutral-200">{label}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                          </div>
                          <ToggleSwitch checked={value} onChange={async (next) => { set(next); await patchMe({ [key]: next ? "true" : "false" }); }} />
                        </label>
                      ))}
                    </div>
                  </div>

                  <hr className="border-neutral-800" />

                  <label className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-200">Show outstanding votes</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Display star ratings on validated projects.</p>
                    </div>
                    <ToggleSwitch checked={isDisplayOutstandingVotes} onChange={async (next) => { setIsDisplayOutstandingVotes(next); await patchMe({ isDisplayOutstandingVotes: next ? "true" : "false" }); }} />
                  </label>

                  <hr className="border-neutral-800" />

                  <label className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-200">Show 42 Journey tab</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Show the Journey tab on your CV. Only visible when Resume is active.</p>
                    </div>
                    <ToggleSwitch checked={isDisplayJourney} onChange={async (next) => { setIsDisplayJourney(next); await patchMe({ isDisplayJourney: next ? "true" : "false" }); }} />
                  </label>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="border-t-2 border-neutral-800 my-4" />

      <section className="space-y-4">
        <div className="text-center pt-4">
          <h2 className="text-4xl font-bold tracking-tight text-white">42cv Badge</h2>
          <p className="mt-2 text-neutral-500">
            Dynamically generated badges for your git readmes.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="overflow-x-auto max-w-full">
            <StatsWrapper
              data={{
                login: data.extended42Data.login,
                name: isDisplayName && data.extended42Data.displayname,
                campus: `42${primaryCampus.name}`,
                begin_at: selectedCursus.begin_at,
                end_at: selectedCursus.end_at,
                blackholed_at: selectedCursus.blackholed_at,
                cursus: selectedCursus.cursus.name,
                grade: selectedCursus.grade ?? "Pisciner",
                color: coalition.color,
                email: isDisplayEmail && data.extended42Data.email,
                level: selectedCursus.level,
                profileImage: isDisplayPhoto
                  ? (photoMode === "custom" && customPhotoUrl) || data.extended42Data.image?.versions?.medium || data.extended42Data.image?.link
                  : null,
                projectCount: isDisplayProjectCount
                  ? data.extended42Data.projects_users.filter(
                      (p) =>
                        p["validated?"] === true &&
                        !p.project.parent_id &&
                        p.cursus_ids.includes(parseInt(cursusId))
                    ).length
                  : null,
                credlyBadges: credlyBadges.length > 0
                  ? credlyBadges.filter((b) => b.imageUrl).map((b) => ({ imageUrl: b.imageUrl!, name: b.name }))
                  : undefined,
              }}
            />
          </div>
        </div>

        <div className="space-y-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
          <SelectField label="Cursus" value={cursusId} onChange={setCursusId}>
            {data.extended42Data.cursus_users.map((cursus_user) => (
              <option key={cursus_user.cursus_id} value={cursus_user.cursus_id}>
                {cursus_user.cursus.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Design" value={coalitionId} onChange={setCoalitionId}>
            <option value={"piscine"}>Piscine</option>
            {data.extended42Data.coalitions.map((colation) => (
              <option key={colation.id} value={colation.id}>
                {colation.name}
              </option>
            ))}
            <option value={"undefined"}>Neutral</option>
            <option value={"midnight"}>Midnight</option>
            <option value={"carbon"}>Carbon</option>
            <option value={"rose"}>Rose</option>
            <option value={"neon"}>Neon</option>
            {selectedCursus.level >= 21 && (
              <option value={"level21"}>Gold | Level 21</option>
            )}
          </SelectField>
        </div>

        <StatsOptions
          isDisplayEmail={isDisplayEmail}
          isDisplayName={isDisplayName}
          isDisplayPhoto={isDisplayPhoto}
          isDisplayProjectCount={isDisplayProjectCount}
          setIsDisplayEmail={setIsDisplayEmail}
          setIsDisplayName={setIsDisplayName}
          setIsDisplayPhoto={setIsDisplayPhoto}
          setIsDisplayProjectCount={setIsDisplayProjectCount}
          patchMe={patchMe}
          onError={(msg) => showModal({ title: "Error", message: msg, icon: "alert" })}
        />

        <div className="space-y-2">
          <label>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">URL</span>
            <Code code={statsUrl} />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Markdown</span>
            <Code
              code={`[![${data.extended42Data.login}'s 42 stats](${statsUrl})](${isPublicProfile ? `https://42cv.dev/${data.extended42Data.login}` : "https://42cv.dev"})`}
            />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">HTML</span>
            <Code
              code={`<a href="${isPublicProfile ? `https://42cv.dev/${data.extended42Data.login}` : "https://42cv.dev"}"><img src="${statsUrl}" alt="${data.extended42Data.login}'s 42 stats" /></a>`}
            />
          </label>
        </div>
      </section>

      <hr className="border-neutral-800" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Project Scores</h2>
        <p className="text-sm text-neutral-500">
          Badge for each project. Copy the markdown into your readme.
        </p>

        <div className="space-y-1">
          {projectList.map((project) => (
            <details key={project.id} className="group">
              <summary className="cursor-pointer flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-neutral-900 transition-colors">
                <span className="flex-1 text-sm font-medium text-neutral-300 group-open:text-white">
                  {project.project.name}
                </span>
                <ProjectScore data={project} />
              </summary>
              <div className="space-y-2 pl-3 pb-3">
                <label>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">URL</span>
                  <Code code={`${projectUrl}/${project.id}`} />
                </label>
                <label>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Markdown</span>
                  <Code
                    code={`[![${data.extended42Data.login}'s 42 ${project.project.name} Score](${projectUrl}/${project.id})](https://projects.intra.42.fr/projects/${project.project.slug}/projects_users/${project.id})`}
                  />
                </label>
                <label>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">HTML</span>
                  <Code
                    code={`<a href="https://projects.intra.42.fr/projects/${project.project.slug}/projects_users/${project.id}"><img src="${projectUrl}/${project.id}" alt="${data.extended42Data.login}'s 42 ${project.project.name} Score" /></a>`}
                  />
                </label>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="border-t-2 border-neutral-800 my-4" />

      <section className="space-y-4">
        <div className="text-center pt-4">
          <h2 className="text-4xl font-bold tracking-tight text-white">Feedback</h2>
          <p className="mt-2 text-neutral-500">
            Found a bug or have an idea? Submit it directly as a GitHub issue - takes 10 seconds.
          </p>
        </div>
        <FeedbackForm login={data.extended42Data.login} />
      </section>

      <div className="hidden sm:block fixed bottom-5 left-5 z-50">
        <StarButton starCount={starCount} />
      </div>

      {modalNode}
    </Layout>
  );
};

export default withAuth(Home, {
  required42account: true,
});
