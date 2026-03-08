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
          id: string
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
          id?: string
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
          id?: string
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
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          data: string
          descriere: string
          id?: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          descriere?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
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
          profile_id: string | null
          qr_data: string | null
        }
        Insert: {
          absent_dates?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          nume: string
          profile_id?: string | null
          qr_data?: string | null
        }
        Update: {
          absent_dates?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          nume?: string
          profile_id?: string | null
          qr_data?: string | null
        }
        Relationships: [
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
          created_at: string | null
          data_nasterii: string | null
          group_id: string | null
          id: string
          nume_prenume: string
          parinte_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_nasterii?: string | null
          group_id?: string | null
          id?: string
          nume_prenume: string
          parinte_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_nasterii?: string | null
          group_id?: string | null
          id?: string
          nume_prenume?: string
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
            foreignKeyName: "children_parinte_id_fkey"
            columns: ["parinte_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          grupa: string | null
          id: string
          participant_1: string
          participant_2: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grupa?: string | null
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grupa?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string | null
        }
        Relationships: [
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
            foreignKeyName: "documents_uploadat_de_id_fkey"
            columns: ["uploadat_de_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          id: string
          nume: string
          school_id: string | null
          slug: string
          tip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nume: string
          school_id?: string | null
          slug: string
          tip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nume?: string
          school_id?: string | null
          slug?: string
          tip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
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
          saptamana: string
          zi: string
        }
        Insert: {
          continut: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          masa: string
          saptamana: string
          zi: string
        }
        Update: {
          continut?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          masa?: string
          saptamana?: string
          zi?: string
        }
        Relationships: []
      }
      menu_metadata: {
        Row: {
          alergeni: string[] | null
          created_at: string | null
          id: string
          saptamana: string
          semnatura_administrator: string | null
          semnatura_asistent: string | null
          semnatura_director: string | null
        }
        Insert: {
          alergeni?: string[] | null
          created_at?: string | null
          id?: string
          saptamana: string
          semnatura_administrator?: string | null
          semnatura_asistent?: string | null
          semnatura_director?: string | null
        }
        Update: {
          alergeni?: string[] | null
          created_at?: string | null
          id?: string
          saptamana?: string
          semnatura_administrator?: string | null
          semnatura_asistent?: string | null
          semnatura_director?: string | null
        }
        Relationships: []
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
      nutritional_data: {
        Row: {
          carbohidrati: number | null
          fibre: number | null
          grasimi: number | null
          id: string
          kcal: number | null
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
          proteine?: number | null
          saptamana?: string
          zi?: string
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
          status: string | null
          telefon: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nume_prenume?: string
          status?: string | null
          telefon?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nume_prenume?: string
          status?: string | null
          telefon?: string | null
        }
        Relationships: []
      }
      schedule: {
        Row: {
          created_at: string | null
          culoare: string | null
          group_id: string | null
          id: string
          materie: string
          ora: string
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
          sponsori_activi?: string[] | null
          tip?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          audio_url: string | null
          categorie: string | null
          continut: string
          created_at: string | null
          id: string
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
          thumbnail?: string | null
          titlu?: string
          varsta?: string | null
        }
        Relationships: []
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
          publicat?: boolean | null
          scoli_target?: string[] | null
          titlu?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
    },
  },
} as const
