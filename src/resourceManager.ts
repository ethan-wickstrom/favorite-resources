import type { BunFile } from "bun";
import { z } from "zod";

export interface Resource {
  readonly url: string;
  readonly description: string | null;
}

const resourceSchema: z.ZodType<Resource> = z.object({
  url: z.string().url(),
  description: z.string().nullable()
});

export async function loadResources(path: string): Promise<readonly Resource[]> {
  const file: BunFile = Bun.file(path);
  const exists: boolean = await file.exists();
  if (!exists) {
    return [];
  }
  const text: string = await file.text();
  const parsed: unknown = JSON.parse(text);
  const arraySchema: z.ZodType<readonly Resource[]> = z.array(resourceSchema);
  const resources: readonly Resource[] = arraySchema.parse(parsed);
  return resources;
}

export async function saveResources(path: string, resources: readonly Resource[]): Promise<void> {
  const json: string = JSON.stringify(resources, null, 2);
  await Bun.write(path, json);
}

export function addResource(resources: readonly Resource[], resource: Resource): readonly Resource[] {
  const newResources: readonly Resource[] = [...resources, resource];
  return newResources;
}

export function removeResource(resources: readonly Resource[], index: number): readonly Resource[] {
  const before: readonly Resource[] = resources.slice(0, index);
  const after: readonly Resource[] = resources.slice(index + 1);
  const merged: readonly Resource[] = [...before, ...after];
  return merged;
}

export function updateResource(resources: readonly Resource[], index: number, resource: Resource): readonly Resource[] {
  const updated: Resource[] = resources.map((r: Resource, i: number): Resource => {
    if (i === index) {
      return resource;
    }
    return r;
  });
  return updated;
}

export function generateReadme(resources: readonly Resource[]): string {
  const lines: string[] = ["Link list (Not ordered/No context)", ""];
  for (let i: number = 0; i < resources.length; i++) {
    const r: Resource = resources[i]!;
    const line: string = r.description === null ? r.url : `${r.url} - ${r.description}`;
    lines.push(line);
  }
  lines.push("", "## Managing resources", "", "Run `bun run src/resourceTui.ts` to modify this list.", "");
  const content: string = lines.join("\n");
  return content;
}
