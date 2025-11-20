export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      inquiries: {
        Row: {
          client_ip: unknown;
          created_at: string | null;
          email: string | null;
          id: string;
          message: string | null;
          name: string | null;
          phone: string | null;
          puppy_id: string | null;
          source: string | null;
          utm: Json | null;
        };
        Insert: {
          client_ip?: unknown;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string | null;
          phone?: string | null;
          puppy_id?: string | null;
          source?: string | null;
          utm?: Json | null;
        };
        Update: {
          client_ip?: unknown;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string | null;
          phone?: string | null;
          puppy_id?: string | null;
          source?: string | null;
          utm?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inquiries_puppy_id_fkey';
            columns: ['puppy_id'];
            isOneToOne: false;
            referencedRelation: 'puppies';
            referencedColumns: ['id'];
          },
        ];
      };
      litters: {
        Row: {
          born_at: string | null;
          created_at: string | null;
          dam_id: string | null;
          due_date: string | null;
          id: string;
          mating_date: string | null;
          name: string | null;
          notes: string | null;
          sire_id: string | null;
          slug: string | null;
        };
        Insert: {
          born_at?: string | null;
          created_at?: string | null;
          dam_id?: string | null;
          due_date?: string | null;
          id?: string;
          mating_date?: string | null;
          name?: string | null;
          notes?: string | null;
          sire_id?: string | null;
          slug?: string | null;
        };
        Update: {
          born_at?: string | null;
          created_at?: string | null;
          dam_id?: string | null;
          due_date?: string | null;
          id?: string;
          mating_date?: string | null;
          name?: string | null;
          notes?: string | null;
          sire_id?: string | null;
          slug?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'litters_dam_id_fkey';
            columns: ['dam_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'litters_sire_id_fkey';
            columns: ['sire_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
        ];
      };
      parents: {
        Row: {
          birth_date: string | null;
          breed: string | null;
          color: string | null;
          created_at: string | null;
          description: string | null;
          health_clearances: string[] | null;
          id: string;
          name: string;
          photo_urls: string[] | null;
          sex: string | null;
          slug: string | null;
          video_urls: string[] | null;
          weight_lbs: number | null;
        };
        Insert: {
          birth_date?: string | null;
          breed?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          health_clearances?: string[] | null;
          id?: string;
          name: string;
          photo_urls?: string[] | null;
          sex?: string | null;
          slug?: string | null;
          video_urls?: string[] | null;
          weight_lbs?: number | null;
        };
        Update: {
          birth_date?: string | null;
          breed?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          health_clearances?: string[] | null;
          id?: string;
          name?: string;
          photo_urls?: string[] | null;
          sex?: string | null;
          slug?: string | null;
          video_urls?: string[] | null;
          weight_lbs?: number | null;
        };
        Relationships: [];
      };
      puppies: {
        Row: {
          birth_date: string | null;
          breed: string | null;
          color: string | null;
          created_at: string | null;
          dam_id: string | null;
          dam_name: string | null;
          dam_photo_urls: string[] | null;
          description: string | null;
          id: string;
          is_archived: boolean;
          litter_id: string | null;
          name: string | null;
          paypal_enabled: boolean | null;
          photo_urls: string[] | null;
          price_usd: number | null;
          sex: string | null;
          sire_id: string | null;
          sire_name: string | null;
          sire_photo_urls: string[] | null;
          slug: string | null;
          sold_at: string | null;
          status: string;
          stripe_payment_link: string | null;
          updated_at: string | null;
          video_urls: string[] | null;
          weight_oz: number | null;
        };
        Insert: {
          birth_date?: string | null;
          breed?: string | null;
          color?: string | null;
          created_at?: string | null;
          dam_id?: string | null;
          dam_name?: string | null;
          dam_photo_urls?: string[] | null;
          description?: string | null;
          id?: string;
          is_archived?: boolean;
          litter_id?: string | null;
          name?: string | null;
          paypal_enabled?: boolean | null;
          photo_urls?: string[] | null;
          price_usd?: number | null;
          sex?: string | null;
          sire_id?: string | null;
          sire_name?: string | null;
          sire_photo_urls?: string[] | null;
          slug?: string | null;
          sold_at?: string | null;
          status?: string;
          stripe_payment_link?: string | null;
          updated_at?: string | null;
          video_urls?: string[] | null;
          weight_oz?: number | null;
        };
        Update: {
          birth_date?: string | null;
          breed?: string | null;
          color?: string | null;
          created_at?: string | null;
          dam_id?: string | null;
          dam_name?: string | null;
          dam_photo_urls?: string[] | null;
          description?: string | null;
          id?: string;
          is_archived?: boolean;
          litter_id?: string | null;
          name?: string | null;
          paypal_enabled?: boolean | null;
          photo_urls?: string[] | null;
          price_usd?: number | null;
          sex?: string | null;
          sire_id?: string | null;
          sire_name?: string | null;
          sire_photo_urls?: string[] | null;
          slug?: string | null;
          sold_at?: string | null;
          status?: string;
          stripe_payment_link?: string | null;
          updated_at?: string | null;
          video_urls?: string[] | null;
          weight_oz?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'puppies_dam_id_fkey';
            columns: ['dam_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'puppies_litter_id_fkey';
            columns: ['litter_id'];
            isOneToOne: false;
            referencedRelation: 'litters';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'puppies_sire_id_fkey';
            columns: ['sire_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
        ];
      };
      reservations: {
        Row: {
          amount: number | null;
          channel: string | null;
          created_at: string | null;
          customer_email: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          deposit_amount: number | null;
          expires_at: string | null;
          external_payment_id: string | null;
          id: string;
          notes: string | null;
          payment_provider: string | null;
          paypal_order_id: string | null;
          puppy_id: string | null;
          status: string | null;
          stripe_payment_intent: string | null;
          updated_at: string | null;
          webhook_event_id: number | null;
        };
        Insert: {
          amount?: number | null;
          channel?: string | null;
          created_at?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          deposit_amount?: number | null;
          expires_at?: string | null;
          external_payment_id?: string | null;
          id?: string;
          notes?: string | null;
          payment_provider?: string | null;
          paypal_order_id?: string | null;
          puppy_id?: string | null;
          status?: string | null;
          stripe_payment_intent?: string | null;
          updated_at?: string | null;
          webhook_event_id?: number | null;
        };
        Update: {
          amount?: number | null;
          channel?: string | null;
          created_at?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          deposit_amount?: number | null;
          expires_at?: string | null;
          external_payment_id?: string | null;
          id?: string;
          notes?: string | null;
          payment_provider?: string | null;
          paypal_order_id?: string | null;
          puppy_id?: string | null;
          status?: string | null;
          stripe_payment_intent?: string | null;
          updated_at?: string | null;
          webhook_event_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_puppy_id_fkey';
            columns: ['puppy_id'];
            isOneToOne: false;
            referencedRelation: 'puppies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_webhook_event_id_fkey';
            columns: ['webhook_event_id'];
            isOneToOne: false;
            referencedRelation: 'webhook_events';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          author_name: string;
          client_ip: unknown;
          created_at: string;
          id: string;
          location: string;
          photo_urls: string[];
          rating: number;
          source: string;
          status: string;
          story: string;
          visit_date: string;
        };
        Insert: {
          author_name: string;
          client_ip?: unknown;
          created_at?: string;
          id?: string;
          location: string;
          photo_urls?: string[];
          rating: number;
          source?: string;
          status?: string;
          story: string;
          visit_date: string;
        };
        Update: {
          author_name?: string;
          client_ip?: unknown;
          created_at?: string;
          id?: string;
          location?: string;
          photo_urls?: string[];
          rating?: number;
          source?: string;
          status?: string;
          story?: string;
          visit_date?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          created_at: string;
          event_id: string;
          event_type: string;
          id: number;
          idempotency_key: string | null;
          payload: Json;
          processed: boolean;
          processed_at: string | null;
          processing_error: string | null;
          processing_started_at: string | null;
          provider: string;
          reservation_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          event_type: string;
          id?: number;
          idempotency_key?: string | null;
          payload: Json;
          processed?: boolean;
          processed_at?: string | null;
          processing_error?: string | null;
          processing_started_at?: string | null;
          provider: string;
          reservation_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          event_type?: string;
          id?: number;
          idempotency_key?: string | null;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          processing_error?: string | null;
          processing_started_at?: string | null;
          provider?: string;
          reservation_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'webhook_events_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_reservation_transaction: {
        Args: {
          p_amount: number;
          p_channel: string;
          p_customer_email: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_deposit_amount: number;
          p_expires_at: string;
          p_external_payment_id: string;
          p_notes: string;
          p_payment_provider: string;
          p_puppy_id: string;
        };
        Returns: {
          amount: number | null;
          channel: string | null;
          created_at: string | null;
          customer_email: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          deposit_amount: number | null;
          expires_at: string | null;
          external_payment_id: string | null;
          id: string;
          notes: string | null;
          payment_provider: string | null;
          paypal_order_id: string | null;
          puppy_id: string | null;
          status: string | null;
          stripe_payment_intent: string | null;
          updated_at: string | null;
          webhook_event_id: number | null;
        };
        SetofOptions: {
          from: '*';
          to: 'reservations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      dearmor: { Args: { '': string }; Returns: string };
      expire_pending_reservations: { Args: never; Returns: number };
      gen_random_uuid: { Args: never; Returns: string };
      gen_salt: { Args: { '': string }; Returns: string };
      get_reservation_summary: {
        Args: { puppy_id_param: string };
        Returns: {
          paid_reservations: number;
          pending_reservations: number;
          total_amount: number;
          total_reservations: number;
        }[];
      };
      pgp_armor_headers: {
        Args: { '': string };
        Returns: Record<string, unknown>[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
