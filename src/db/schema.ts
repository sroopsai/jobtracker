import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const applicationStatuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

export const jobSources = [
  'LinkedIn',
  'LinkedIn Easy Apply',
  'Glassdoor',
  'Indeed',
  'Company Website',
  'Referral',
  'Other',
] as const;
export type JobSource = (typeof jobSources)[number];

export const documentTypes = ['Resume', 'Cover Letter', 'Portfolio', 'Other'] as const;
export type DocumentType = (typeof documentTypes)[number];

export const jobApplications = pgTable(
  'job_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    company: text('company').notNull(),
    jobTitle: text('job_title').notNull(),
    status: text('status', { enum: applicationStatuses }).notNull().default('Applied'),
    source: text('source', { enum: jobSources }).notNull().default('LinkedIn'),
    applicationDate: text('application_date').notNull(),
    jobUrl: text('job_url'),
    location: text('location'),
    salaryRange: text('salary_range'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('user_id_idx').on(table.userId),
  ]
);

export const mcpApiKeys = pgTable(
  'mcp_api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    key: text('key').notNull().unique(),
    name: text('name').notNull().default('Default MCP Token'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('mcp_user_id_idx').on(table.userId),
  ]
);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    type: text('type', { enum: documentTypes }).notNull().default('Resume'),
    fileUrl: text('file_url').notNull(),
    downloadUrl: text('download_url'),
    fileSize: text('file_size'),
    textContent: text('text_content'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('doc_user_id_idx').on(table.userId),
  ]
);

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;
export type McpApiKey = typeof mcpApiKeys.$inferSelect;
export type UserDocument = typeof documents.$inferSelect;
export type NewUserDocument = typeof documents.$inferInsert;
