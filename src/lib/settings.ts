// Site settings (content/settings.yaml). Not research content, so they carry no `audience`.
import { z } from 'astro/zod';

/** YAML turns `board:` (with everything under it commented out) into null; treat that as "not set". */
const section = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === null ? undefined : v), schema);

export const settingsSchema = z.strictObject({
  features: section(
    z
      .strictObject({
        /** The Feedback section on / and /supervisor/. Off by default: the Kanban covers day-to-day feedback. */
        feedback: z.boolean().default(false),
      })
      .default({ feedback: false }),
  ),
  board: section(
    z
      .strictObject({
        /** URL of the GitHub Project board. Unset until the board exists. */
        url: z.url().optional(),
      })
      .default({}),
  ),
});

export type Settings = z.infer<typeof settingsSchema>;

/** Settings as the pages see them; a missing file behaves like an empty one. */
export function resolveSettings(data: unknown): Settings {
  return settingsSchema.parse(data ?? {});
}
