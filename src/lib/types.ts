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

export interface NegotiationSummary {
  consensus_reached: boolean;
  agreement_terms: string[];
  party_a_concessions: string[];
  party_b_concessions: string[];
  unresolved_disputes: string[];
  summary_text: string;
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
}
