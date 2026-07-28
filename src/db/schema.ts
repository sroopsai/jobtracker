import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const applicationStatuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

export const jobApplications = pgTable(
  'job_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    company: text('company').notNull(),
    jobTitle: text('job_title').notNull(),
    status: text('status', { enum: applicationStatuses }).notNull().default('Applied'),
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

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;
export type McpApiKey = typeof mcpApiKeys.$inferSelect;
