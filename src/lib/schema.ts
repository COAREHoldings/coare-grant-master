import { pgTable, serial, text, timestamp, integer, boolean, json, varchar, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('owner'),
  createdAt: timestamp('created_at').defaultNow()
});

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  mechanism: varchar('mechanism', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const sections = pgTable('sections', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull().references(() => applications.id),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').default(''),
  pageLimit: integer('page_limit').notNull(),
  pageCount: integer('page_count').default(0),
  requiredHeadings: json('required_headings').$type<string[]>(),
  isValid: boolean('is_valid').default(false),
  isComplete: boolean('is_complete').default(false),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull().references(() => applications.id),
  name: varchar('name', { length: 255 }).notNull(),
  fileUrl: text('file_url'),
  required: boolean('required').default(true),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow()
});

export const validationResults = pgTable('validation_results', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull().references(() => applications.id),
  errors: json('errors').$type<string[]>(),
  warnings: json('warnings').$type<string[]>(),
  isValid: boolean('is_valid').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Publications Module Tables
export const publications = pgTable('publications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  pmid: varchar('pmid', { length: 20 }),
  pmcid: varchar('pmcid', { length: 20 }),
  doi: varchar('doi', { length: 100 }),
  title: text('title').notNull(),
  authors: json('authors').$type<{ name: string; affiliation?: string; isCorresponding?: boolean }[]>().default([]),
  journal: varchar('journal', { length: 255 }),
  year: integer('year'),
  volume: varchar('volume', { length: 50 }),
  issue: varchar('issue', { length: 50 }),
  pages: varchar('pages', { length: 50 }),
  citationCount: integer('citation_count').default(0),
  abstract: text('abstract'),
  keywords: json('keywords').$type<string[]>().default([]),
  grantAcknowledgments: json('grant_acknowledgments').$type<string[]>().default([]),
  researchThemes: json('research_themes').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const manuscripts = pgTable('manuscripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  grantId: integer('grant_id'),
  title: text('title').notNull(),
  status: varchar('status', { length: 20 }).default('draft'),
  targetJournal: varchar('target_journal', { length: 255 }),
  coAuthors: json('co_authors').$type<{ name: string; affiliation?: string }[]>().default([]),
  content: json('content').$type<Record<string, string>>().default({}),
  submissionDate: timestamp('submission_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const researchProfiles = pgTable('research_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().unique(),
  totalPublications: integer('total_publications').default(0),
  hIndex: integer('h_index').default(0),
  totalCitations: integer('total_citations').default(0),
  topCitedWorks: json('top_cited_works').$type<unknown[]>().default([]),
  researchThemes: json('research_themes').$type<{ theme: string; count: number }[]>().default([]),
  collaborators: json('collaborators').$type<{ name: string; count: number }[]>().default([]),
  yearlyOutput: json('yearly_output').$type<{ year: number; count: number }[]>().default([]),
  biosketchSectionC: text('biosketch_section_c'),
  biosketchSectionD: text('biosketch_section_d'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type User = typeof users.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type ValidationResult = typeof validationResults.$inferSelect;
export type Publication = typeof publications.$inferSelect;
export type Manuscript = typeof manuscripts.$inferSelect;
export type ResearchProfile = typeof researchProfiles.$inferSelect;
