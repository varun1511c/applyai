-- ============================================
-- ApplyAI - Initial Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  job_title       TEXT,
  location        TEXT,
  linkedin_url    TEXT,
  github_url      TEXT,
  portfolio_url   TEXT,
  weekly_goal     INT DEFAULT 5,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESUMES
-- ============================================
CREATE TABLE public.resumes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL DEFAULT 'My Resume',
  is_default        BOOLEAN DEFAULT FALSE,
  contact           JSONB DEFAULT '{}',
  summary           TEXT DEFAULT '',
  experience        JSONB DEFAULT '[]',
  education         JSONB DEFAULT '[]',
  skills            JSONB DEFAULT '[]',
  certifications    JSONB DEFAULT '[]',
  projects          JSONB DEFAULT '[]',
  custom_sections   JSONB DEFAULT '[]',
  original_pdf_url  TEXT,
  template_id       TEXT DEFAULT 'classic',
  last_ats_score    INT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESUME OPTIMIZATION HISTORY
-- ============================================
CREATE TABLE public.resume_optimizations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id           UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_title           TEXT,
  company             TEXT,
  job_description     TEXT NOT NULL,
  original_content    JSONB,
  optimized_content   JSONB,
  ats_score_before    INT,
  ats_score_after     INT,
  keywords_added      TEXT[],
  keywords_missing    TEXT[],
  suggestions         JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOB APPLICATIONS (tracker)
-- ============================================
CREATE TABLE public.applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_title       TEXT NOT NULL,
  company         TEXT NOT NULL,
  job_url         TEXT,
  job_description TEXT,
  location        TEXT,
  salary_range    TEXT,
  status          TEXT NOT NULL DEFAULT 'saved'
                  CHECK (status IN (
                    'saved','applied','phone_screen','interview',
                    'technical','offer','rejected','withdrawn','ghosted'
                  )),
  date_saved      TIMESTAMPTZ DEFAULT NOW(),
  date_applied    TIMESTAMPTZ,
  date_responded  TIMESTAMPTZ,
  resume_id       UUID REFERENCES public.resumes(id),
  resume_name     TEXT,
  platform        TEXT,
  external_job_id TEXT,
  notes           TEXT,
  cover_letter    TEXT,
  auto_applied    BOOLEAN DEFAULT FALSE,
  contact_name    TEXT,
  contact_email   TEXT,
  follow_up_date  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED JOBS (bookmarked from search)
-- ============================================
CREATE TABLE public.saved_jobs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  external_id   TEXT NOT NULL,
  platform      TEXT NOT NULL,
  job_title     TEXT NOT NULL,
  company       TEXT NOT NULL,
  location      TEXT,
  job_url       TEXT,
  description   TEXT,
  salary_min    INT,
  salary_max    INT,
  currency      TEXT DEFAULT 'USD',
  posted_at     TIMESTAMPTZ,
  raw_data      JSONB,
  match_score   INT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, external_id, platform)
);

-- ============================================
-- CHAT CONVERSATIONS
-- ============================================
CREATE TABLE public.chat_conversations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT 'New Conversation',
  context_type  TEXT DEFAULT 'general'
                CHECK (context_type IN ('general','resume','cover_letter','interview_prep')),
  context_ref_id UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content           TEXT NOT NULL,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER SETTINGS
-- ============================================
CREATE TABLE public.user_settings (
  user_id               UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  auto_apply_enabled    BOOLEAN DEFAULT FALSE,
  max_daily_applies     INT DEFAULT 10,
  preferred_platforms   TEXT[] DEFAULT ARRAY['linkedin','indeed'],
  autofill_answers      JSONB DEFAULT '{}',
  target_roles          TEXT[] DEFAULT '{}',
  target_locations      TEXT[] DEFAULT '{}',
  salary_min            INT,
  remote_only           BOOLEAN DEFAULT FALSE,
  email_notifications   BOOLEAN DEFAULT TRUE,
  ai_requests_today     INT DEFAULT 0,
  ai_requests_reset_at  DATE DEFAULT CURRENT_DATE,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUTOMATION LOGS
-- ============================================
CREATE TABLE public.automation_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES public.applications(id),
  platform        TEXT NOT NULL,
  job_url         TEXT,
  job_title       TEXT,
  company         TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','running','success','failed','skipped')),
  error_message   TEXT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_date_applied ON public.applications(date_applied DESC NULLS LAST);
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own resumes"
  ON public.resumes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own applications"
  ON public.applications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved jobs"
  ON public.saved_jobs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conversations"
  ON public.chat_conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages"
  ON public.chat_messages FOR ALL USING (
    auth.uid() = (SELECT user_id FROM public.chat_conversations WHERE id = conversation_id)
  );

CREATE POLICY "Users can manage own settings"
  ON public.user_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own optimizations"
  ON public.resume_optimizations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own automation logs"
  ON public.automation_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE + SETTINGS ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_resumes_updated_at
  BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
