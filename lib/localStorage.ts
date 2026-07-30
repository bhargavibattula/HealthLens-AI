import { Patient, Report, Trend, Reminder } from './types';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p-mom',
    owner_id: 'local-user',
    name: 'Mother',
    relation: 'Mother (Vijayawada)',
    date_of_birth: '1958-04-12',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-dad',
    owner_id: 'local-user',
    name: 'Father',
    relation: 'Father (Vijayawada)',
    date_of_birth: '1955-08-20',
    created_at: new Date().toISOString()
  }
];

const INITIAL_REPORTS: Report[] = [
  {
    id: 'r-1',
    patient_id: 'p-mom',
    owner_id: 'local-user',
    storage_path: 'mock/blood_sugar.png',
    file_type: 'image/png',
    report_type: 'Blood Test',
    report_type_confidence: 0.96,
    status: 'done',
    needs_patient_confirmation: false,
    ocr_text: `LAL PATHLABS MEDICAL REPORT
Patient: Mother (Age: 68)
Date: 10-May-2026

Fasting Blood Sugar: 142 mg/dL [Ref Range: 70-99 mg/dL] -> HIGH
HbA1c: 6.8% [Ref Range: < 5.7%] -> HIGH
Serum Cholesterol: 215 mg/dL [Ref Range: < 200 mg/dL] -> HIGH
Hemoglobin: 13.5 g/dL [Ref Range: 12.0-15.5 g/dL] -> NORMAL

Doctor Note: Patient shows elevated glycemic levels over past 12 months. Recommend repeating evaluation in 3 months.`,
    ocr_confidence: 0.94,
    summary: `AI Summary of Mother's Blood Report (10-May-2026):\n• Fasting Blood Sugar is elevated at 142 mg/dL (Normal: 70-99 mg/dL).\n• HbA1c is 6.8%, indicating diabetic control requires attention.\n• Serum Cholesterol is slightly high at 215 mg/dL.\n• Doctor's instruction noted: Repeat blood sugar test in 3 months.`,
    report_date: '2026-05-10',
    created_at: new Date().toISOString(),
    extracted_values: [
      { id: 'v-1', report_id: 'r-1', metric_name: 'Fasting Blood Sugar', value: 142, unit: 'mg/dL', reference_range: '70-99', flag: 'high' },
      { id: 'v-2', report_id: 'r-1', metric_name: 'HbA1c', value: 6.8, unit: '%', reference_range: '< 5.7', flag: 'high' },
      { id: 'v-3', report_id: 'r-1', metric_name: 'Serum Cholesterol', value: 215, unit: 'mg/dL', reference_range: '< 200', flag: 'high' },
      { id: 'v-4', report_id: 'r-1', metric_name: 'Hemoglobin', value: 13.5, unit: 'g/dL', reference_range: '12.0-15.5', flag: 'normal' }
    ]
  },
  {
    id: 'r-2',
    patient_id: 'p-mom',
    owner_id: 'local-user',
    storage_path: 'mock/ecg.png',
    file_type: 'image/png',
    report_type: 'ECG',
    report_type_confidence: 0.92,
    status: 'done',
    needs_patient_confirmation: false,
    ocr_text: `APOLLO HOSPITALS CARDIOLOGY REPORT
Patient: Mother
Date: 15-Mar-2026

ECG Findings: Normal sinus rhythm with mild non-specific ST-T wave changes.
Heart Rate: 74 bpm.
Cardiologist Note: Stable ECG compared to previous visit. Continue current medications.`,
    ocr_confidence: 0.90,
    summary: `AI Summary of Mother's ECG (15-Mar-2026):\n• Heart Rate: 74 bpm (Normal Sinus Rhythm).\n• Mild non-specific ST-T wave changes noted.\n• Cardiologist confirms stable comparison with previous visits.`,
    report_date: '2026-03-15',
    created_at: new Date().toISOString(),
    extracted_values: [
      { id: 'v-5', report_id: 'r-2', metric_name: 'Heart Rate', value: 74, unit: 'bpm', reference_range: '60-100', flag: 'normal' }
    ]
  },
  {
    id: 'r-3',
    patient_id: 'p-dad',
    owner_id: 'local-user',
    storage_path: 'mock/mri.png',
    file_type: 'image/png',
    report_type: 'MRI',
    report_type_confidence: 0.98,
    status: 'done',
    needs_patient_confirmation: false,
    ocr_text: `KIMS DIAGNOSTICS - BRAIN MRI SCAN
Patient: Father
Date: 20-Jan-2026

Findings: Age-related mild cerebral atrophy. No acute ischemic infarct or intracranial hemorrhage.
Radiologist Note: Age-appropriate findings. No intervention required.`,
    ocr_confidence: 0.95,
    summary: `AI Summary of Father's Brain MRI (20-Jan-2026):\n• Mild age-related cerebral changes.\n• No acute strokes, hemorrhages, or mass lesions.\n• Confirmed age-appropriate findings by Radiologist.`,
    report_date: '2026-01-20',
    created_at: new Date().toISOString(),
    extracted_values: []
  }
];

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    patient_id: 'p-mom',
    report_id: 'r-1',
    instruction_text: 'Repeat blood sugar evaluation & HbA1c test after 3 months (Due: Aug 2026)',
    due_date: '2026-08-10',
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

const INITIAL_TRENDS: Trend[] = [
  {
    id: 't-1',
    patient_id: 'p-mom',
    metric_name: 'Fasting Blood Sugar',
    direction: 'up',
    note: 'Blood sugar has been steadily increasing over the last year (110 → 125 → 142 mg/dL).',
    data_points: [
      { date: '2025-06-01', value: 110 },
      { date: '2025-11-15', value: 125 },
      { date: '2026-05-10', value: 142 }
    ],
    updated_at: new Date().toISOString()
  }
];

export function getLocalData() {
  if (typeof window === 'undefined') {
    return { patients: INITIAL_PATIENTS, reports: INITIAL_REPORTS, reminders: INITIAL_REMINDERS, trends: INITIAL_TRENDS };
  }

  const p = localStorage.getItem('acc_patients');
  const r = localStorage.getItem('acc_reports');
  const rem = localStorage.getItem('acc_reminders');
  const t = localStorage.getItem('acc_trends');

  if (!p) localStorage.setItem('acc_patients', JSON.stringify(INITIAL_PATIENTS));
  if (!r) localStorage.setItem('acc_reports', JSON.stringify(INITIAL_REPORTS));
  if (!rem) localStorage.setItem('acc_reminders', JSON.stringify(INITIAL_REMINDERS));
  if (!t) localStorage.setItem('acc_trends', JSON.stringify(INITIAL_TRENDS));

  return {
    patients: p ? JSON.parse(p) : INITIAL_PATIENTS,
    reports: r ? JSON.parse(r) : INITIAL_REPORTS,
    reminders: rem ? JSON.parse(rem) : INITIAL_REMINDERS,
    trends: t ? JSON.parse(t) : INITIAL_TRENDS
  };
}

export function savePatients(patients: Patient[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('acc_patients', JSON.stringify(patients));
  }
}

export function saveReports(reports: Report[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('acc_reports', JSON.stringify(reports));
  }
}
