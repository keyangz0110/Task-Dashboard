export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					display_name: string;
					avatar_url: string | null;
					preferred_locale: string;
					role: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					display_name: string;
					avatar_url?: string | null;
					preferred_locale?: string;
					role?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					display_name?: string;
					avatar_url?: string | null;
					preferred_locale?: string;
					role?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			task_categories: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					created_at?: string;
				};
				Update: {
					name?: string;
				};
				Relationships: [];
			};
			tasks: {
				Row: {
					id: string;
					title: string;
					status: string;
					due_date: string | null;
					is_urgent: boolean;
					is_important: boolean;
					duration_type: string;
					is_routine: boolean;
					routine_frequency: string | null;
					category_id: string | null;
					assigned_by: string;
					assigned_to: string;
					notes: string;
					priority_score: number;
					created_at: string;
					updated_at: string;
					completed_at: string | null;
				};
				Insert: {
					id?: string;
					title: string;
					status?: string;
					due_date?: string | null;
					is_urgent?: boolean;
					is_important?: boolean;
					duration_type?: string;
					is_routine?: boolean;
					routine_frequency?: string | null;
					category_id?: string | null;
					assigned_by: string;
					assigned_to: string;
					notes?: string;
					priority_score?: number;
					created_at?: string;
					updated_at?: string;
					completed_at?: string | null;
				};
				Update: {
					title?: string;
					status?: string;
					due_date?: string | null;
					is_urgent?: boolean;
					is_important?: boolean;
					duration_type?: string;
					is_routine?: boolean;
					routine_frequency?: string | null;
					category_id?: string | null;
					assigned_by?: string;
					assigned_to?: string;
					notes?: string;
					completed_at?: string | null;
				};
				Relationships: [];
			};
			weekly_reports: {
				Row: {
					id: string;
					user_id: string;
					week_start: string;
					content: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					week_start: string;
					content: string;
					created_at?: string;
				};
				Update: {
					content?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}
