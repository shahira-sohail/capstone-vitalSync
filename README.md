# VitalSync — Healthcare EHR Dashboard

> A full-stack Electronic Health Record (EHR) and hospital appointment management system designed for a single hospital or clinic.

## 1. Project Overview

**VitalSync** is a web-based healthcare management application that helps a hospital manage patient registration, appointments, consultation records, prescriptions, and follow-up visits through a centralized system.

The application provides role-specific dashboards for patients, doctors, receptionists, and administrators. It aims to reduce manual record management, simplify appointment scheduling, and make relevant patient history accessible to authorized healthcare professionals.

The project is planned as a full-stack capstone application. Features and architecture described in this document represent the intended scope and may change during implementation.

## 2. Project Details

- **Project Name:** VitalSync
- **Project Type:** Healthcare EHR Dashboard
- **Development Track:** Fullstack
- **Target Environment:** Single hospital or clinic
- **Primary Goal:** Build a modern, usable frontend with a functional backend and database.
- **Development Status:** Planning and requirements definition
- **Repository:** `prodesk-capstone-VitalSync`

## 3. Problem Statement

Hospitals and clinics may manage patient information, appointments, prescriptions, and consultation history across disconnected or manual processes. This can make it difficult to locate previous records, coordinate appointments, and maintain consistent information.

VitalSync aims to provide a centralized system where authorized staff can manage appointments and patient records, doctors can document consultations, and patients can access their own medical information.

## 4. Technology Stack

The following stack is proposed for implementation and has not yet been verified through a working application.

| Layer | Planned Technology |
|---|---|
| Frontend | React.js with Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Node.js |
| API Framework | Express.js |
| Database | MongoDB |
| Authentication | Email and password with email verification |
| Version Control | Git and GitHub |
| UI Design | Figma |
| Architecture Diagrams | Draw.io or dbdiagram.io |

External email verification and delivery services will be selected based on free-tier availability, usage limits, and implementation requirements.

## 5. User Roles and Permissions

### 5.1 Patient

- Register for an account and verify their email address.
- Access their own patient record after secure account linking.
- View appointments, consultation history, treatment details, and prescriptions.
- Book, cancel, or reschedule appointments according to the hospital's scheduling policy.
- Upload previous prescriptions and medical reports from external providers.
- Remove their own uploaded files, subject to applicable retention and audit requirements.
- View upcoming follow-up appointments.

Patients cannot modify or delete doctor-created clinical records.

### 5.2 Receptionist

- Register walk-in patients and manage patient details needed for registration.
- Search for patients using their Patient ID or a combination of name and phone number.
- Review possible duplicate records before creating a new patient record.
- Book appointments on behalf of patients.
- Check patients in and manage the waiting queue.
- Assist with account linking through an authorized verification process.

Receptionists will not have routine access to detailed clinical notes, diagnoses, or prescriptions.

### 5.3 Doctor

- View their appointments and waiting queue.
- Access relevant previous hospital history for patients they are authorized to treat.
- Review patient-uploaded external prescriptions and reports, clearly distinguished from verified hospital records.
- Record consultation notes, treatment details, and prescriptions.
- Schedule follow-up appointments.
- Complete a consultation and proceed to the next eligible patient without losing unsaved work.

Clinical access will be enforced by the backend, not only by hiding frontend components.

### 5.4 Admin

- Manage staff accounts and role assignments.
- Manage doctor profiles and hospital configuration.
- Configure doctor availability and appointment durations.
- Oversee operational workflows and appropriate audit records.

An administrator role will not automatically grant unrestricted access to all clinical information.

## 6. Functional Requirements

### 6.1 Authentication and Patient Registration

- Support email-and-password authentication.
- Require email verification for online account registration.
- Generate a unique Patient ID for each hospital patient record.
- Allow receptionists to register walk-in patients without requiring an online patient account.
- Allow patients to securely link an online account to an existing hospital record.
- Use staff-assisted identity verification and a one-time linking mechanism when linking existing records.
- Detect possible duplicate patients before creating a new record.
- Permit shared family phone numbers; phone numbers will not be treated as unique identifiers.

Email verification proves access to an email address, not ownership of a medical record. Patient ID or phone number alone must not authorize access to clinical information.

### 6.2 Patient Search and Duplicate Handling

- Search primarily by Patient ID.
- Support alternative searches using patient name and phone number.
- Display possible matches for authorized staff to review.
- Allow record creation when no suitable match is found, after a duplicate warning.
- Require authorized review before merging duplicate records.
- Link appointments to the patient record rather than only to the account that created the appointment.

### 6.3 Appointment Management

- Allow patients and receptionists to book appointments.
- Use doctor availability and configured appointment duration to determine suitable slots.
- Prevent overlapping confirmed appointments for the same doctor.
- Recheck slot availability when confirming a booking.
- Allow cancellation and rescheduling according to the hospital's configured policy.
- Record the appointment's status and relevant changes.

**Normal walk-in rule:** A walk-in appointment may be accommodated only when a sufficiently long free gap is available. Otherwise, the patient will be offered the next available slot and may accept or decline it. Existing confirmed appointments will not be silently displaced.

Emergency triage and emergency-priority scheduling are outside the initial scope.

### 6.4 Consultation and Clinical Records

- Maintain consultation history for the hospital.
- Allow authorized doctors to document consultation notes, treatments, and prescriptions.
- Support follow-up appointment scheduling.
- Keep doctor-created clinical records separate from patient-uploaded external documents.
- Restrict patients to viewing doctor-created clinical records.
- Use a traceable correction process for clinical records rather than silent overwrites or deletion.

### 6.5 Waiting Queue

- Display relevant appointment and check-in information to authorized staff.
- Allow doctors to complete the current consultation and move to the next eligible patient.
- Preserve consultation data until it is saved.
- Show an appropriate empty-queue state when no eligible patients are waiting.
- Avoid exposing diagnoses, prescriptions, or other private clinical details on public queue displays.

The initial queue will handle normal appointments and walk-ins. Emergency prioritization and advanced queue optimization are not included.

### 6.6 Medical Document Uploads

- Allow patients to upload previous prescriptions and reports.
- Label uploaded files as patient-provided external documents.
- Record upload date and source information where available.
- Restrict file access to authorized users.
- Validate supported file types and size limits.
- Support removal requests for patient-uploaded files while retaining appropriate audit information and complying with applicable retention requirements.

### 6.7 Audit and Accountability

Record important events such as patient-record creation, appointment changes, clinical-record corrections, document uploads and removals, and relevant permission changes.

Audit records should identify the responsible account and event time while avoiding unnecessary exposure of sensitive information.

## 7. Prioritized Feature Scope

### Must Have — Initial Version

- Role-based authentication and authorization.
- Patient registration and unique Patient IDs.
- Duplicate-patient warnings and patient search.
- Patient account linking with verification.
- Doctor availability and appointment booking.
- Receptionist-assisted booking and walk-in handling.
- Doctor consultation notes and prescriptions.
- Patient access to their own records.
- Patient-uploaded external medical documents.
- Basic follow-up scheduling and waiting queue.
- Server-side access controls and audit logging.

### Should Have — After Core Workflows

- Improved appointment and queue management.
- More detailed operational dashboards.
- Better search and filtering.
- Additional audit history views.
- Improved error handling and accessibility.
- Automated tests for critical workflows and permissions.

### Out of Scope for Initial Version

- Emergency triage and emergency-priority scheduling.
- Cross-hospital record sharing or multi-organization integration.
- Pharmacy, laboratory, insurance, and billing integrations.
- AI-generated diagnoses or treatment recommendations.
- Advanced analytics and clinical decision support.

These features may be reconsidered after the initial workflows are stable.

## 8. Security and Privacy Requirements

VitalSync will handle sensitive health-related information, so privacy and access control are core design requirements.

- Enforce authorization on every protected backend endpoint.
- Use secure password hashing and appropriate session or token handling.
- Protect account recovery and patient-record linking workflows.
- Keep medical files private and serve them only through authorized access.
- Store secrets in environment variables rather than source code.
- Avoid logging passwords, authentication secrets, or unnecessary clinical information.
- Maintain appropriate audit records for important operations.
- Use synthetic patient data during development, testing, and demonstrations.
- Define data retention, deletion, backup, and recovery requirements before production deployment.

This project will not be described as production-ready or legally compliant without appropriate security testing, deployment safeguards, and a review of applicable healthcare and privacy requirements.

## 9. Proposed Architecture

The intended application architecture is:

**React frontend → Express REST API → MongoDB database**

The frontend will provide role-specific interfaces. The Express backend will handle authentication, authorization, business rules, appointment scheduling, clinical-record operations, and document-access checks. MongoDB will store application records and their relationships.

Medical documents will require private storage and controlled access; they should not be exposed through unrestricted public file URLs.

An architecture diagram and database model will be added after the design is finalized.

## 10. Proposed Data Model

The following collections are preliminary and will be refined during database design.

| Collection | Purpose |
|---|---|
| `users` | Login identity, email verification status, and account role |
| `patients` | Patient demographics and unique hospital Patient ID |
| `doctors` | Doctor profiles and scheduling configuration |
| `appointments` | Booking details, status, timing, and patient/doctor references |
| `consultations` | Consultation notes, treatment details, and follow-up information |
| `prescriptions` | Doctor-created prescription records |
| `medical_documents` | Metadata and access information for uploaded medical files |
| `audit_logs` | Important system events and traceability |

The exact fields, references, validation rules, and indexes will be defined in the ERD/data-modeling stage. The `users` collection and `patients` collection will remain conceptually separate so that a walk-in patient can have a hospital record without an online account.

## 11. UI/UX Design

The interface will aim to provide a clean, accessible, and responsive healthcare dashboard.

Planned design principles:

- Role-specific dashboards and navigation.
- Clear appointment status and queue information.
- Readable clinical-record layouts.
- Consistent form validation and error messages.
- Responsive layouts for desktop, tablet, and mobile.
- Accessible colors, labels, and interaction states.

### Required Design Viewports

1. **Authentication:** Login, registration, and verification states.
2. **Main Dashboard:** A role-specific overview with relevant actions and information.
3. **Data Details:** Patient details and the appropriate appointment or clinical-record view.

**Figma link:** To be added after the designs are created and shared.

## 12. Capstone Deliverables

- **P0 — Repository and PRD:** Public GitHub repository with this README, project overview, track, planned technology stack, and prioritized features.
- **P1 — UI Design:** At least three Figma screens or equivalent high-fidelity sketches, with a shareable link added here.
- **P2 — Architecture and Data Model:** Architecture diagram and database/relationship diagram, exported and embedded in the README.

These deliverables will be completed during the planning phase before functional implementation begins.

## 13. Development Roadmap

1. Finalize requirements and business rules.
2. Create the three required UI designs.
3. Draft and review the architecture and data model.
4. Define API contracts and access-control rules.
5. Implement authentication and patient registration.
6. Implement appointment booking and scheduling rules.
7. Implement consultation, prescription, and document workflows.
8. Add audit logging, validation, and error handling.
9. Test role permissions, duplicate handling, scheduling conflicts, and account linking.
10. Prepare deployment and documentation.

The roadmap is proposed; completion will be tracked as implementation progresses.

## 14. Success Criteria

The initial version will be considered functionally successful when:

- Different roles can access only the operations permitted to them.
- A walk-in patient can be registered without an online account.
- An existing patient can securely link an account without exposing another patient's records.
- Appointment conflicts are prevented under concurrent booking attempts.
- Doctors can save consultations and prescriptions and proceed through the waiting queue.
- Patients can view their own records and manage their uploaded external documents within the defined rules.
- Important changes are traceable through audit records.
- The application passes tests using synthetic patient data.

## 15. Disclaimer

VitalSync is an educational capstone project intended to demonstrate full-stack application development and healthcare workflow planning. It is not a substitute for professional medical systems, clinical judgment, or a production-ready EHR platform.

No real patient data should be used in the development or demonstration environment.
