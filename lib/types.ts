export type ReportStatus = 'processing' | 'needs_confirmation' | 'done' | 'failed';
export type ReportType =
  | 'Blood Test'
  | 'ECG'
  | 'MRI'
  | 'X-Ray'
  | 'CT Scan'
  | 'Prescription'
  | 'Other';

export interface Patient {
  id: string;
  owner_id: string;
  name: string;
  relation: string | null;
  date_of_birth: string | null;
  created_at: string;
}

export interface ExtractedValue {
  id: string;
  report_id: string;
  metric_name: string;
  value: number | null;
  unit: string | null;
  reference_range: string | null;
  flag: 'high' | 'low' | 'normal' | null;
}

export interface Report {
  id: string;
  patient_id: string;
  owner_id: string;
  storage_path: string;
  file_type: string | null;
  report_type: ReportType | null;
  report_type_confidence: number | null;
  status: ReportStatus;
  needs_patient_confirmation: boolean;
  ocr_text: string | null;
  ocr_confidence: number | null;
  summary: string | null;
  report_date: string | null;
  created_at: string;
  extracted_values?: ExtractedValue[];
}

export interface Trend {
  id: string;
  patient_id: string;
  metric_name: string;
  direction: 'up' | 'down' | 'stable' | null;
  note: string | null;
  data_points: { date: string; value: number }[] | null;
  updated_at: string;
}

export interface Reminder {
  id: string;
  patient_id: string;
  report_id: string | null;
  instruction_text: string | null;
  due_date: string | null;
  status: 'pending' | 'done' | 'dismissed';
  created_at: string;
}
