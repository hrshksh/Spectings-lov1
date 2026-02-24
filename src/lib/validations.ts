import { z } from 'zod';

// --- Shared field validators ---

const nameField = z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters');
const optionalText = (max = 500) => z.string().trim().max(max, `Must be under ${max} characters`).optional().or(z.literal(''));
const optionalEmail = z.string().trim().email('Invalid email').max(255).optional().or(z.literal(''));
const optionalPhone = z.string().trim().max(30, 'Phone too long').optional().or(z.literal(''));
const optionalUrl = z.string().trim().url('Invalid URL').max(2000).optional().or(z.literal(''));
const tagArray = z.array(z.string().trim().max(50)).max(20, 'Too many tags').optional();

// --- Profile ---

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  phone: optionalPhone,
});

// --- Person (prospect contact) ---

export const personSchema = z.object({
  name: nameField,
  email: optionalEmail,
  phone: optionalPhone,
  company: optionalText(100),
  role: optionalText(100),
  linkedin: optionalUrl,
  tags: tagArray,
});

// --- Lead ---

export const leadSchema = z.object({
  quality_score: z.number().int().min(0).max(100).optional(),
  notes: optionalText(2000),
  source: optionalText(200),
  prospect_type: z.enum(['sales', 'hiring', 'growth']).default('sales'),
});

// --- Ad Banner ---

export const adBannerSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  link_url: optionalUrl,
});

// --- Service ---

export const serviceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  description: optionalText(500),
  icon: z.string().trim().max(50).optional(),
  features: z.array(z.string().trim().max(200)).max(20, 'Too many features').optional(),
});

// --- Organization ---

export const organizationSchema = z.object({
  name: nameField,
  industry: optionalText(100),
});

// Helper to validate and return first error message
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.errors[0]?.message || 'Invalid input' };
}
