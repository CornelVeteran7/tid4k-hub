export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          ascuns_banda: boolean | null
          autor_id: string | null
          autor_nume: string | null
          continut: string
          created_at: string | null
          data_expirare: string | null
          id: string
          organization_id: string | null
          pozitie_banda: number | null
          prioritate: string | null
          target: string | null
          titlu: string
        }
        Insert: {
          ascuns_banda?: boolean | null
          autor_id?: string | null
          autor_nume?: string | null
          continut: string
          created_at?: string | null
          data_expirare?: string | null
          id?: string
          organization_id?: string | null
          pozitie_banda?: number | null
          prioritate?: string | null
          target?: string | null
          titlu: string
        }
        Update: {
          ascuns_banda?: boolean | null
          autor_id?: string | null
          autor_nume?: string | null
          continut?: string
          created_at?: string | null
          data_expirare?: string | null
          id?: string
          organization_id?: string | null
          pozitie_banda?: number | null
          prioritate?: string | null
          target?: string | null
          titlu?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          child_id: string
          created_at: string | null
          data: string
          id: string
          marked_by: string | null
          observatii: string | null
          prezent: boolean | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          data: string
          id?: string
          marked_by?: string | null
          observatii?: string | null
          prezent?: boolean | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          data?: string
          id?: string
          marked_by?: string | null
          observatii?: string | null
          prezent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cancelarie_activities: {
        Row: {
          created_at: string | null
          data: string
          descriere: string
          id: string
          organization_id: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          data: string
          descriere: string
          id?: string
          organization_id?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          descriere?: string
          id?: string
          organization_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancelarie_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancelarie_activities_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "cancelarie_teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      cancelarie_teachers: {
        Row: {
          absent_dates: string[] | null
          avatar_url: string | null
          created_at: string | null
          id: string
          nume: string
          organization_id: string | null
          profile_id: string | null
          qr_data: string | null
        }
        Insert: {
          absent_dates?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          nume: string
          organization_id?: string | null
          profile_id?: string | null
          qr_data?: string | null
        }
        Update: {
          absent_dates?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          nume?: string
          organization_id?: string | null
          profile_id?: string | null
          qr_data?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cancelarie_teachers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancelarie_teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          alergii: string[] | null
          created_at: string | null
          data_nasterii: string | null
          group_id: string | null
          id: string
          info_extra: Json | null
          note_medicale: string | null
          nume_prenume: string
          organization_id: string | null
          parinte_id: string | null
        }
        Insert: {
          alergii?: string[] | null
          created_at?: string | null
          data_nasterii?: string | null
          group_id?: string | null
          id?: string
          info_extra?: Json | null
          note_medicale?: string | null
          nume_prenume: string
          organization_id?: string | null
          parinte_id?: string | null
        }
        Update: {
          alergii?: string[] | null
          created_at?: string | null
          data_nasterii?: string | null
          group_id?: string | null
          id?: string
          info_extra?: Json | null
          note_medicale?: string | null
          nume_prenume?: string
          organization_id?: string | null
          parinte_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_parinte_id_fkey"
            columns: ["parinte_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_costs: {
        Row: {
          cantitate: number | null
          categorie: string
          created_at: string
          data_inregistrare: string | null
          descriere: string
          furnizor: string | null
          id: string
          organization_id: string | null
          pret_unitar: number | null
          site_id: string
          suma_platita: number | null
          total: number | null
        }
        Insert: {
          cantitate?: number | null
          categorie?: string
          created_at?: string
          data_inregistrare?: string | null
          descriere: string
          furnizor?: string | null
          id?: string
          organization_id?: string | null
          pret_unitar?: number | null
          site_id: string
          suma_platita?: number | null
          total?: number | null
        }
        Update: {
          cantitate?: number | null
          categorie?: string
          created_at?: string
          data_inregistrare?: string | null
          descriere?: string
          furnizor?: string | null
          id?: string
          organization_id?: string | null
          pret_unitar?: number | null
          site_id?: string
          suma_platita?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_costs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_sites: {
        Row: {
          adresa: string | null
          buget: number | null
          created_at: string
          data_estimare_finalizare: string | null
          data_start: string | null
          id: string
          nume: string
          organization_id: string | null
          progress_pct: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          adresa?: string | null
          buget?: number | null
          created_at?: string
          data_estimare_finalizare?: string | null
          data_start?: string | null
          id?: string
          nume: string
          organization_id?: string | null
          progress_pct?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          adresa?: string | null
          buget?: number | null
          created_at?: string
          data_estimare_finalizare?: string | null
          data_start?: string | null
          id?: string
          nume?: string
          organization_id?: string | null
          progress_pct?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_sites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_tasks: {
        Row: {
          assignee: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          data_limita: string | null
          descriere: string | null
          id: string
          locatie: string | null
          organization_id: string | null
          photo_url: string | null
          prioritate: string | null
          site_id: string | null
          status: string
          team_id: string | null
          titlu: string
          updated_at: string | null
        }
        Insert: {
          assignee?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          data_limita?: string | null
          descriere?: string | null
          id?: string
          locatie?: string | null
          organization_id?: string | null
          photo_url?: string | null
          prioritate?: string | null
          site_id?: string | null
          status?: string
          team_id?: string | null
          titlu: string
          updated_at?: string | null
        }
        Update: {
          assignee?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          data_limita?: string | null
          descriere?: string | null
          id?: string
          locatie?: string | null
          organization_id?: string | null
          photo_url?: string | null
          prioritate?: string | null
          site_id?: string | null
          status?: string
          team_id?: string | null
          titlu?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_tasks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "construction_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_team_assignments: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          saptamana_end: string
          saptamana_start: string
          site_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          saptamana_end: string
          saptamana_start: string
          site_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          saptamana_end?: string
          saptamana_start?: string
          site_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_team_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_team_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_team_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "construction_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_teams: {
        Row: {
          created_at: string
          id: string
          nr_membri: number | null
          nume: string
          organization_id: string | null
          specialitate: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nr_membri?: number | null
          nume: string
          organization_id?: string | null
          specialitate?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nr_membri?: number | null
          nume?: string
          organization_id?: string | null
          specialitate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions_config: {
        Row: {
          created_at: string
          daily_rate: number
          effective_from: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_rate?: number
          effective_from?: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_rate?: number
          effective_from?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions_monthly: {
        Row: {
          amount_calculated: number
          amount_paid: number
          child_id: string
          created_at: string
          daily_rate: number
          days_present: number
          id: string
          month: number
          notes: string | null
          organization_id: string
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          amount_calculated?: number
          amount_paid?: number
          child_id: string
          created_at?: string
          daily_rate?: number
          days_present?: number
          id?: string
          month: number
          notes?: string | null
          organization_id: string
          status?: string
          updated_at?: string
          year: number
        }
        Update: {
          amount_calculated?: number
          amount_paid?: number
          child_id?: string
          created_at?: string
          daily_rate?: number
          days_present?: number
          id?: string
          month?: number
          notes?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "contributions_monthly_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_monthly_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          grupa: string | null
          id: string
          organization_id: string | null
          participant_1: string
          participant_2: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grupa?: string | null
          id?: string
          organization_id?: string | null
          participant_1: string
          participant_2: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grupa?: string | null
          id?: string
          organization_id?: string | null
          participant_1?: string
          participant_2?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          categorie: string | null
          created_at: string | null
          group_id: string | null
          id: string
          marime: number | null
          nume_fisier: string
          organization_id: string | null
          thumbnail_url: string | null
          tip_fisier: string | null
          uploadat_de_id: string | null
          uploadat_de_nume: string | null
          url: string
        }
        Insert: {
          categorie?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          marime?: number | null
          nume_fisier: string
          organization_id?: string | null
          thumbnail_url?: string | null
          tip_fisier?: string | null
          uploadat_de_id?: string | null
          uploadat_de_nume?: string | null
          url: string
        }
        Update: {
          categorie?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          marime?: number | null
          nume_fisier?: string
          organization_id?: string | null
          thumbnail_url?: string | null
          tip_fisier?: string | null
          uploadat_de_id?: string | null
          uploadat_de_nume?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploadat_de_id_fkey"
            columns: ["uploadat_de_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          organization_id: string | null
          posted_at: string | null
          status: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          posted_at?: string | null
          status?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          posted_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_settings: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          page_id: string | null
          posting_format: string | null
          token_status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          page_id?: string | null
          posting_format?: string | null
          token_status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          page_id?: string | null
          posting_format?: string | null
          token_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          id: string
          nume: string
          organization_id: string | null
          school_id: string | null
          slug: string
          tip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nume: string
          organization_id?: string | null
          school_id?: string | null
          slug: string
          tip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nume?: string
          organization_id?: string | null
          school_id?: string | null
          slug?: string
          tip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      infodisplay_panels: {
        Row: {
          continut: string
          created_at: string | null
          durata: number | null
          id: string
          ordine: number | null
          organization_id: string | null
          tip: string
        }
        Insert: {
          continut: string
          created_at?: string | null
          durata?: number | null
          id?: string
          ordine?: number | null
          organization_id?: string | null
          tip: string
        }
        Update: {
          continut?: string
          created_at?: string | null
          durata?: number | null
          id?: string
          ordine?: number | null
          organization_id?: string | null
          tip?: string
        }
        Relationships: [
          {
            foreignKeyName: "infodisplay_panels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      infodisplay_qr: {
        Row: {
          created_at: string | null
          id: string
          label: string
          organization_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          organization_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          organization_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "infodisplay_qr_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      infodisplay_settings: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          transition: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          transition?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          transition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infodisplay_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      infodisplay_ticker: {
        Row: {
          created_at: string | null
          id: string
          mesaj: string
          ordine: number | null
          organization_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mesaj: string
          ordine?: number | null
          organization_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mesaj?: string
          ordine?: number | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infodisplay_ticker_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          cantitate: number
          categorie: string
          cod_qr: string | null
          created_at: string
          descriere: string | null
          id: string
          locatie: string | null
          nume: string
          organization_id: string | null
          pret_unitar: number | null
          unitate: string
          updated_at: string | null
        }
        Insert: {
          cantitate?: number
          categorie?: string
          cod_qr?: string | null
          created_at?: string
          descriere?: string | null
          id?: string
          locatie?: string | null
          nume: string
          organization_id?: string | null
          pret_unitar?: number | null
          unitate?: string
          updated_at?: string | null
        }
        Update: {
          cantitate?: number
          categorie?: string
          cod_qr?: string | null
          created_at?: string
          descriere?: string | null
          id?: string
          locatie?: string | null
          nume?: string
          organization_id?: string | null
          pret_unitar?: number | null
          unitate?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          cantitate: number
          created_at: string
          efectuat_de: string | null
          id: string
          item_id: string
          motiv: string | null
          organization_id: string | null
          tip: string
        }
        Insert: {
          cantitate?: number
          created_at?: string
          efectuat_de?: string | null
          id?: string
          item_id: string
          motiv?: string | null
          organization_id?: string | null
          tip?: string
        }
        Update: {
          cantitate?: number
          created_at?: string
          efectuat_de?: string | null
          id?: string
          item_id?: string
          motiv?: string | null
          organization_id?: string | null
          tip?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      magazine_articles: {
        Row: {
          autor_id: string | null
          autor_nume: string | null
          categorie: string
          continut: string
          created_at: string
          id: string
          organization_id: string | null
          photos: string[] | null
          published_at: string | null
          reviewer_comment: string | null
          reviewer_id: string | null
          status: string
          titlu: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          autor_nume?: string | null
          categorie?: string
          continut?: string
          created_at?: string
          id?: string
          organization_id?: string | null
          photos?: string[] | null
          published_at?: string | null
          reviewer_comment?: string | null
          reviewer_id?: string | null
          status?: string
          titlu: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          autor_nume?: string | null
          categorie?: string
          continut?: string
          created_at?: string
          id?: string
          organization_id?: string | null
          photos?: string[] | null
          published_at?: string | null
          reviewer_comment?: string | null
          reviewer_id?: string | null
          status?: string
          titlu?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magazine_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_dish_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_name: string
          ingredient_ref_id: string | null
          menu_dish_id: string
          quantity_grams: number
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_name: string
          ingredient_ref_id?: string | null
          menu_dish_id: string
          quantity_grams?: number
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_name?: string
          ingredient_ref_id?: string | null
          menu_dish_id?: string
          quantity_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_dish_ingredients_ingredient_ref_id_fkey"
            columns: ["ingredient_ref_id"]
            isOneToOne: false
            referencedRelation: "nutritional_reference"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_dish_ingredients_menu_dish_id_fkey"
            columns: ["menu_dish_id"]
            isOneToOne: false
            referencedRelation: "menu_dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_dishes: {
        Row: {
          created_at: string
          dish_name: string
          id: string
          menu_meal_id: string
          ordine: number
        }
        Insert: {
          created_at?: string
          dish_name: string
          id?: string
          menu_meal_id: string
          ordine?: number
        }
        Update: {
          created_at?: string
          dish_name?: string
          id?: string
          menu_meal_id?: string
          ordine?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_dishes_menu_meal_id_fkey"
            columns: ["menu_meal_id"]
            isOneToOne: false
            referencedRelation: "menu_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          continut: string
          created_at: string | null
          emoji: string | null
          id: string
          masa: string
          organization_id: string | null
          saptamana: string
          zi: string
        }
        Insert: {
          continut: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          masa: string
          organization_id?: string | null
          saptamana: string
          zi: string
        }
        Update: {
          continut?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          masa?: string
          organization_id?: string | null
          saptamana?: string
          zi?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_meals: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          meal_type: string
          menu_week_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          meal_type: string
          menu_week_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          meal_type?: string
          menu_week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_meals_menu_week_id_fkey"
            columns: ["menu_week_id"]
            isOneToOne: false
            referencedRelation: "menu_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_metadata: {
        Row: {
          alergeni: string[] | null
          created_at: string | null
          id: string
          organization_id: string | null
          saptamana: string
          semnatura_administrator: string | null
          semnatura_asistent: string | null
          semnatura_director: string | null
        }
        Insert: {
          alergeni?: string[] | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          saptamana: string
          semnatura_administrator?: string | null
          semnatura_asistent?: string | null
          semnatura_director?: string | null
        }
        Update: {
          alergeni?: string[] | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          saptamana?: string
          semnatura_administrator?: string | null
          semnatura_asistent?: string | null
          semnatura_director?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_weeks: {
        Row: {
          age_group: string
          created_at: string
          id: string
          notes: string | null
          organization_id: string | null
          status: string
          updated_at: string
          week_start_date: string
        }
        Insert: {
          age_group?: string
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          status?: string
          updated_at?: string
          week_start_date: string
        }
        Update: {
          age_group?: string
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          status?: string
          updated_at?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_weeks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          citit: boolean | null
          conversation_id: string
          created_at: string | null
          id: string
          mesaj: string
          sender_id: string
        }
        Insert: {
          citit?: boolean | null
          conversation_id: string
          created_at?: string | null
          id?: string
          mesaj: string
          sender_id: string
        }
        Update: {
          citit?: boolean | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          mesaj?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules_config: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          module_key: string
          organization_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          module_key: string
          organization_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          module_key?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nutritional_data: {
        Row: {
          carbohidrati: number | null
          fibre: number | null
          grasimi: number | null
          id: string
          kcal: number | null
          organization_id: string | null
          proteine: number | null
          saptamana: string
          zi: string
        }
        Insert: {
          carbohidrati?: number | null
          fibre?: number | null
          grasimi?: number | null
          id?: string
          kcal?: number | null
          organization_id?: string | null
          proteine?: number | null
          saptamana: string
          zi: string
        }
        Update: {
          carbohidrati?: number | null
          fibre?: number | null
          grasimi?: number | null
          id?: string
          kcal?: number | null
          organization_id?: string | null
          proteine?: number | null
          saptamana?: string
          zi?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutritional_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nutritional_reference: {
        Row: {
          ban_reason: string | null
          calories_per_100g: number
          carbs: number
          category: string
          created_at: string
          fat: number
          fiber: number
          id: string
          ingredient_name: string
          is_banned: boolean
          protein: number
        }
        Insert: {
          ban_reason?: string | null
          calories_per_100g?: number
          carbs?: number
          category?: string
          created_at?: string
          fat?: number
          fiber?: number
          id?: string
          ingredient_name: string
          is_banned?: boolean
          protein?: number
        }
        Update: {
          ban_reason?: string | null
          calories_per_100g?: number
          carbs?: number
          category?: string
          created_at?: string
          fat?: number
          fiber?: number
          id?: string
          ingredient_name?: string
          is_banned?: boolean
          protein?: number
        }
        Relationships: []
      }
      org_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          nfc_enabled: boolean | null
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          vertical_type: Database["public"]["Enums"]["vertical_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          nfc_enabled?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          vertical_type?: Database["public"]["Enums"]["vertical_type"]
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          nfc_enabled?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          vertical_type?: Database["public"]["Enums"]["vertical_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          nume_prenume: string
          organization_id: string | null
          status: string | null
          telefon: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nume_prenume?: string
          organization_id?: string | null
          status?: string | null
          telefon?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nume_prenume?: string
          organization_id?: string | null
          status?: string | null
          telefon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_config: {
        Row: {
          avg_service_minutes: number
          created_at: string
          daily_reset_time: string
          id: string
          organization_id: string
          prefix: string
          service_points: Json
          updated_at: string
        }
        Insert: {
          avg_service_minutes?: number
          created_at?: string
          daily_reset_time?: string
          id?: string
          organization_id: string
          prefix?: string
          service_points?: Json
          updated_at?: string
        }
        Update: {
          avg_service_minutes?: number
          created_at?: string
          daily_reset_time?: string
          id?: string
          organization_id?: string
          prefix?: string
          service_points?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_entries: {
        Row: {
          cabinet: string | null
          called_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          note: string | null
          numar_tichet: number
          organization_id: string | null
          status: string
        }
        Insert: {
          cabinet?: string | null
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          numar_tichet: number
          organization_id?: string | null
          status?: string
        }
        Update: {
          cabinet?: string | null
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          numar_tichet?: number
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule: {
        Row: {
          created_at: string | null
          culoare: string | null
          group_id: string | null
          id: string
          materie: string
          ora: string
          organization_id: string | null
          profesor: string | null
          zi: string
        }
        Insert: {
          created_at?: string | null
          culoare?: string | null
          group_id?: string | null
          id?: string
          materie: string
          ora: string
          organization_id?: string | null
          profesor?: string | null
          zi: string
        }
        Update: {
          created_at?: string | null
          culoare?: string | null
          group_id?: string | null
          id?: string
          materie?: string
          ora?: string
          organization_id?: string | null
          profesor?: string | null
          zi?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          activ: boolean | null
          adresa: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          nr_copii: number | null
          nr_profesori: number | null
          nume: string
          organization_id: string | null
          sponsori_activi: string[] | null
          tip: string | null
        }
        Insert: {
          activ?: boolean | null
          adresa?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nr_copii?: number | null
          nr_profesori?: number | null
          nume: string
          organization_id?: string | null
          sponsori_activi?: string[] | null
          tip?: string | null
        }
        Update: {
          activ?: boolean | null
          adresa?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nr_copii?: number | null
          nr_profesori?: number | null
          nume?: string
          organization_id?: string | null
          sponsori_activi?: string[] | null
          tip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_campaigns: {
        Row: {
          afisari: number | null
          clickuri: number | null
          created_at: string | null
          cta_text: string | null
          ctr: number | null
          data_end_campanie: string | null
          data_start_campanie: string | null
          descriere: string | null
          documente_atasate: string[] | null
          id: string
          link_url: string | null
          organization_id: string | null
          prioritate: number | null
          scoli_target: string[] | null
          sponsor_id: string
          status: string | null
          stil_card: Json | null
          stil_inky: Json | null
          stil_ticker: Json | null
          tip: string
          titlu: string
        }
        Insert: {
          afisari?: number | null
          clickuri?: number | null
          created_at?: string | null
          cta_text?: string | null
          ctr?: number | null
          data_end_campanie?: string | null
          data_start_campanie?: string | null
          descriere?: string | null
          documente_atasate?: string[] | null
          id?: string
          link_url?: string | null
          organization_id?: string | null
          prioritate?: number | null
          scoli_target?: string[] | null
          sponsor_id: string
          status?: string | null
          stil_card?: Json | null
          stil_inky?: Json | null
          stil_ticker?: Json | null
          tip: string
          titlu: string
        }
        Update: {
          afisari?: number | null
          clickuri?: number | null
          created_at?: string | null
          cta_text?: string | null
          ctr?: number | null
          data_end_campanie?: string | null
          data_start_campanie?: string | null
          descriere?: string | null
          documente_atasate?: string[] | null
          id?: string
          link_url?: string | null
          organization_id?: string | null
          prioritate?: number | null
          scoli_target?: string[] | null
          sponsor_id?: string
          status?: string | null
          stil_card?: Json | null
          stil_inky?: Json | null
          stil_ticker?: Json | null
          tip?: string
          titlu?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_campaigns_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_impressions: {
        Row: {
          created_at: string | null
          id: string
          is_click: boolean | null
          promo_id: string | null
          school_id: string | null
          tip: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_click?: boolean | null
          promo_id?: string | null
          school_id?: string | null
          tip: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_click?: boolean | null
          promo_id?: string | null
          school_id?: string | null
          tip?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_impressions_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "sponsor_promos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_impressions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_plans: {
        Row: {
          descriere: string | null
          id: string
          include_custom_inky: boolean | null
          include_dashboard: boolean | null
          include_infodisplay: boolean | null
          include_inky: boolean | null
          include_ticker: boolean | null
          numar_scoli: number | null
          nume_plan: string
          pret: number | null
        }
        Insert: {
          descriere?: string | null
          id?: string
          include_custom_inky?: boolean | null
          include_dashboard?: boolean | null
          include_infodisplay?: boolean | null
          include_inky?: boolean | null
          include_ticker?: boolean | null
          numar_scoli?: number | null
          nume_plan: string
          pret?: number | null
        }
        Update: {
          descriere?: string | null
          id?: string
          include_custom_inky?: boolean | null
          include_dashboard?: boolean | null
          include_infodisplay?: boolean | null
          include_inky?: boolean | null
          include_ticker?: boolean | null
          numar_scoli?: number | null
          nume_plan?: string
          pret?: number | null
        }
        Relationships: []
      }
      sponsor_promos: {
        Row: {
          activ: boolean | null
          created_at: string | null
          cta_text: string | null
          descriere: string | null
          id: string
          link_url: string | null
          organization_id: string | null
          prioritate: number | null
          scoli_target: string[] | null
          sponsor_id: string
          stil_card: Json | null
          stil_inky: Json | null
          stil_ticker: Json | null
          tip: string
          titlu: string
        }
        Insert: {
          activ?: boolean | null
          created_at?: string | null
          cta_text?: string | null
          descriere?: string | null
          id?: string
          link_url?: string | null
          organization_id?: string | null
          prioritate?: number | null
          scoli_target?: string[] | null
          sponsor_id: string
          stil_card?: Json | null
          stil_inky?: Json | null
          stil_ticker?: Json | null
          tip: string
          titlu: string
        }
        Update: {
          activ?: boolean | null
          created_at?: string | null
          cta_text?: string | null
          descriere?: string | null
          id?: string
          link_url?: string | null
          organization_id?: string | null
          prioritate?: number | null
          scoli_target?: string[] | null
          sponsor_id?: string
          stil_card?: Json | null
          stil_inky?: Json | null
          stil_ticker?: Json | null
          tip?: string
          titlu?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_promos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_promos_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          activ: boolean | null
          created_at: string | null
          culoare_brand: string | null
          data_expirare: string | null
          data_start: string | null
          descriere: string | null
          id: string
          logo_url: string | null
          nume: string
          organization_id: string | null
          plan: string | null
          website: string | null
        }
        Insert: {
          activ?: boolean | null
          created_at?: string | null
          culoare_brand?: string | null
          data_expirare?: string | null
          data_start?: string | null
          descriere?: string | null
          id?: string
          logo_url?: string | null
          nume: string
          organization_id?: string | null
          plan?: string | null
          website?: string | null
        }
        Update: {
          activ?: boolean | null
          created_at?: string | null
          culoare_brand?: string | null
          data_expirare?: string | null
          data_start?: string | null
          descriere?: string | null
          id?: string
          logo_url?: string | null
          nume?: string
          organization_id?: string | null
          plan?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ssm_checklists: {
        Row: {
          completat_de: string | null
          completat_de_id: string | null
          completed_at: string | null
          created_at: string
          data: string
          id: string
          items: Json
          organization_id: string | null
          semnatura_data: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          completat_de?: string | null
          completat_de_id?: string | null
          completed_at?: string | null
          created_at?: string
          data?: string
          id?: string
          items?: Json
          organization_id?: string | null
          semnatura_data?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          completat_de?: string | null
          completat_de_id?: string | null
          completed_at?: string | null
          created_at?: string
          data?: string
          id?: string
          items?: Json
          organization_id?: string | null
          semnatura_data?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ssm_checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ssm_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ssm_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ssm_reminders: {
        Row: {
          activ: boolean | null
          created_at: string
          id: string
          mesaj: string
          ordine: number | null
          organization_id: string | null
          tip: string | null
        }
        Insert: {
          activ?: boolean | null
          created_at?: string
          id?: string
          mesaj: string
          ordine?: number | null
          organization_id?: string | null
          tip?: string | null
        }
        Update: {
          activ?: boolean | null
          created_at?: string
          id?: string
          mesaj?: string
          ordine?: number | null
          organization_id?: string | null
          tip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ssm_reminders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ssm_templates: {
        Row: {
          created_at: string
          id: string
          items: Json
          nume: string
          organization_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          nume: string
          organization_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          nume?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ssm_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          audio_url: string | null
          categorie: string | null
          continut: string
          created_at: string | null
          id: string
          organization_id: string | null
          thumbnail: string | null
          titlu: string
          varsta: string | null
        }
        Insert: {
          audio_url?: string | null
          categorie?: string | null
          continut: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          thumbnail?: string | null
          titlu: string
          varsta?: string | null
        }
        Update: {
          audio_url?: string | null
          categorie?: string | null
          continut?: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          thumbnail?: string | null
          titlu?: string
          varsta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      story_favorites: {
        Row: {
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_favorites_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      surtitle_blocks: {
        Row: {
          created_at: string
          id: string
          nota_operator: string | null
          sequence_nr: number
          show_id: string
          text_en: string | null
          text_fr: string | null
          text_ro: string
        }
        Insert: {
          created_at?: string
          id?: string
          nota_operator?: string | null
          sequence_nr?: number
          show_id: string
          text_en?: string | null
          text_fr?: string | null
          text_ro?: string
        }
        Update: {
          created_at?: string
          id?: string
          nota_operator?: string | null
          sequence_nr?: number
          show_id?: string
          text_en?: string | null
          text_fr?: string | null
          text_ro?: string
        }
        Relationships: [
          {
            foreignKeyName: "surtitle_blocks_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "surtitle_shows"
            referencedColumns: ["id"]
          },
        ]
      }
      surtitle_shows: {
        Row: {
          created_at: string
          current_block: number | null
          data_spectacol: string
          id: string
          organization_id: string | null
          status: string
          titlu: string
        }
        Insert: {
          created_at?: string
          current_block?: number | null
          data_spectacol?: string
          id?: string
          organization_id?: string | null
          status?: string
          titlu: string
        }
        Update: {
          created_at?: string
          current_block?: number | null
          data_spectacol?: string
          id?: string
          organization_id?: string | null
          status?: string
          titlu?: string
        }
        Relationships: [
          {
            foreignKeyName: "surtitle_shows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_mappings: {
        Row: {
          consent: boolean | null
          created_at: string | null
          grupa: string
          id: string
          organization_id: string | null
          sync_type: string | null
          whatsapp_group: string
        }
        Insert: {
          consent?: boolean | null
          created_at?: string | null
          grupa: string
          id?: string
          organization_id?: string | null
          sync_type?: string | null
          whatsapp_group: string
        }
        Update: {
          consent?: boolean | null
          created_at?: string | null
          grupa?: string
          id?: string
          organization_id?: string | null
          sync_type?: string | null
          whatsapp_group?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          categorie: string | null
          created_at: string | null
          data_publicare: string | null
          descriere: string | null
          durata_minute: number | null
          id: string
          imagine_url: string | null
          instructor: string | null
          luna: string
          materiale: string[] | null
          organization_id: string | null
          publicat: boolean | null
          scoli_target: string[] | null
          titlu: string
        }
        Insert: {
          categorie?: string | null
          created_at?: string | null
          data_publicare?: string | null
          descriere?: string | null
          durata_minute?: number | null
          id?: string
          imagine_url?: string | null
          instructor?: string | null
          luna: string
          materiale?: string[] | null
          organization_id?: string | null
          publicat?: boolean | null
          scoli_target?: string[] | null
          titlu: string
        }
        Update: {
          categorie?: string | null
          created_at?: string | null
          data_publicare?: string | null
          descriere?: string | null
          durata_minute?: number | null
          id?: string
          imagine_url?: string | null
          instructor?: string | null
          luna?: string
          materiale?: string[] | null
          organization_id?: string | null
          publicat?: boolean | null
          scoli_target?: string[] | null
          titlu?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshops_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_org_match: { Args: { _org_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "parinte"
        | "profesor"
        | "director"
        | "administrator"
        | "secretara"
        | "sponsor"
        | "inky"
      vertical_type:
        | "kids"
        | "schools"
        | "medicine"
        | "living"
        | "culture"
        | "students"
        | "construction"
        | "workshops"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "parinte",
        "profesor",
        "director",
        "administrator",
        "secretara",
        "sponsor",
        "inky",
      ],
      vertical_type: [
        "kids",
        "schools",
        "medicine",
        "living",
        "culture",
        "students",
        "construction",
        "workshops",
      ],
    },
  },
} as const
