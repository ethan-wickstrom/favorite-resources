import { createInterface, Interface } from "node:readline";
import {
  loadResources,
  saveResources,
  generateReadme,
  addResource,
  removeResource,
  updateResource,
  type Resource
} from "./resourceManager.ts";

function ask(rl: Interface, query: string): Promise<string> {
  return new Promise((resolve: (value: string) => void): void => {
    rl.question(query, (answer: string): void => {
      resolve(answer);
    });
  });
}

async function main(): Promise<void> {
  const resourcesPath: string = "./resources.json";
  let resources: readonly Resource[] = await loadResources(resourcesPath);
  const rl: Interface = createInterface({ input: process.stdin, output: process.stdout });
  let running: boolean = true;
  while (running) {
    console.log("1) List resources");
    console.log("2) Add resource");
    console.log("3) Remove resource");
    console.log("4) Update resource");
    console.log("5) Exit");
    const choiceInput: string = await ask(rl, "Choose an option: ");
    const choice: number = Number.parseInt(choiceInput, 10);
    if (Number.isNaN(choice)) {
      console.log("Invalid selection");
      continue;
    }
    if (choice === 1) {
      for (let i: number = 0; i < resources.length; i++) {
        const r: Resource = resources[i]!;
        const desc: string = r.description === null ? "" : ` - ${r.description}`;
        console.log(`${i + 1}. ${r.url}${desc}`);
      }
    } else if (choice === 2) {
      const url: string = await ask(rl, "URL: ");
      const descriptionInput: string = await ask(rl, "Description (optional): ");
      const description: string | null = descriptionInput === "" ? null : descriptionInput;
      const newResource: Resource = { url, description };
      resources = addResource(resources, newResource);
      await saveResources(resourcesPath, resources);
      const readme: string = generateReadme(resources);
      await Bun.write("README.md", readme);
    } else if (choice === 3) {
      const indexInput: string = await ask(rl, "Index to remove: ");
      const index: number = Number.parseInt(indexInput, 10) - 1;
      if (Number.isNaN(index)) {
        console.log("Invalid index");
        continue;
      }
      if (index >= 0 && index < resources.length) {
        resources = removeResource(resources, index);
        await saveResources(resourcesPath, resources);
        const readme: string = generateReadme(resources);
        await Bun.write("README.md", readme);
      } else {
        console.log("Invalid index range");
      }
    } else if (choice === 4) {
      const indexInput: string = await ask(rl, "Index to update: ");
      const index: number = Number.parseInt(indexInput, 10) - 1;
      if (Number.isNaN(index)) {
        console.log("Invalid index");
        continue;
      }
      if (index >= 0 && index < resources.length) {
        const url: string = await ask(rl, "New URL: ");
        const descriptionInput: string = await ask(rl, "New Description (optional): ");
        const description: string | null = descriptionInput === "" ? null : descriptionInput;
        const updated: Resource = { url, description };
        resources = updateResource(resources, index, updated);
        await saveResources(resourcesPath, resources);
        const readme: string = generateReadme(resources);
        await Bun.write("README.md", readme);
      } else {
        console.log("Invalid index range");
      }
    } else if (choice === 5) {
      running = false;
    } else {
      console.log("Unknown option");
    }
  }
  rl.close();
}

void main();
