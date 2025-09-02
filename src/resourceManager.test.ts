import { test, expect } from "bun:test";
import {
  loadResources,
  saveResources,
  generateReadme,
  addResource,
  removeResource,
  updateResource,
  type Resource
} from "./resourceManager.ts";

const tempPath: string = "test_resources.json";

async function roundtrip(resources: readonly Resource[]): Promise<readonly Resource[]> {
  await saveResources(tempPath, resources);
  const loaded: readonly Resource[] = await loadResources(tempPath);
  return loaded;
}

test("save and load resources", async () => {
  const original: readonly Resource[] = [{ url: "https://example.com", description: null }];
  const loaded: readonly Resource[] = await roundtrip(original);
  expect(loaded).toEqual(original);
});

test("add and remove resource", () => {
  const initial: readonly Resource[] = [];
  const added: readonly Resource[] = addResource(initial, { url: "https://foo", description: null });
  expect(added.length).toBe(1);
  const removed: readonly Resource[] = removeResource(added, 0);
  expect(removed.length).toBe(0);
});

test("update resource", () => {
  const initial: readonly Resource[] = [{ url: "https://foo", description: null }];
  const updated: readonly Resource[] = updateResource(initial, 0, { url: "https://bar", description: null });
  expect(updated[0]!.url).toBe("https://bar");
});

test("generate readme", () => {
  const data: readonly Resource[] = [
    { url: "https://a", description: null },
    { url: "https://b", description: "b desc" }
  ];
  const readme: string = generateReadme(data);
  const expected: string = "Link list (Not ordered/No context)\n\nhttps://a\nhttps://b - b desc\n\n## Managing resources\n\nRun `bun run src/resourceTui.ts` to modify this list.\n";
  expect(readme).toBe(expected);
});
