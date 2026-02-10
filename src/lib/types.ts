export interface SecondMeInstance {
  upload_name: string;
  instance_id: string;
  description: string;
  status: string;
}

export interface NegotiationMessage {
  id: string;
  round: number;
  speaker: "A" | "B";
  content: string;
  timestamp: number;
}

export interface NegotiationStyleAnalysis {
  label: string;
  description: string;
  cooperativeness: number;
  flexibility: number;
}

export interface TurningPoint {
  round: number;
  speaker: "A" | "B";
  description: string;
  impact: "positive" | "negative";
}

export interface RedLineAnalysis {
  party_a_maintained: boolean;
  party_b_maintained: boolean;
  details: string;
}

export interface NegotiationSummary {
  consensus_reached: boolean;
  convergence_score: number;
  final_proposal: string;
  agreement_terms: string[];
  party_a_concessions: string[];
  party_b_concessions: string[];
  unresolved_disputes: string[];
  summary_text: string;
  party_a_style?: NegotiationStyleAnalysis;
  party_b_style?: NegotiationStyleAnalysis;
  turning_points?: TurningPoint[];
  satisfaction_a?: number;
  satisfaction_b?: number;
  red_line_analysis?: RedLineAnalysis;
}

export interface NegotiationSession {
  id: string;
  topic: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  instance_a_id: string;
  instance_a_name: string;
  position_a: string;
  instance_b_id: string;
  instance_b_name: string;
  position_b: string;
  messages: NegotiationMessage[];
  summary: NegotiationSummary | null;
  error: string | null;
  created_at: number;
  accessToken?: string;
  red_line_a?: string;
  red_line_b?: string;
}

// SSE event types sent from server to client
export type SSEEvent =
  | { event: "status"; data: { phase: "thinking" | "responding"; speaker: "A" | "B"; round: number } }
  | { event: "message"; data: NegotiationMessage }
  | { event: "summary"; data: NegotiationSummary }
  | { event: "done"; data: { session_id: string } }
  | { event: "error"; data: { error: string } };

// Request body for creating a negotiation
export interface CreateNegotiationRequest {
  topic: string;
  instance_a_id: string;
  instance_a_name: string;
  position_a: string;
  instance_b_id: string;
  instance_b_name: string;
  position_b: string;
  accessToken?: string;
  red_line_a?: string;
  red_line_b?: string;
}
