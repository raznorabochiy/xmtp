import { Presets, SingleBar } from "cli-progress";
import fs from "fs/promises";

export const delay = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));

export const delayProgress = (seconds: number) => {
  if (seconds === 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const bar = new SingleBar({
      format: "Delay [{bar}] {value}/{total}",
    }, Presets.shades_classic);

    bar.start(seconds, 0);
    let counter = 0;

    const timer = setInterval(() => {
      counter = counter + 1;
      bar.update(counter);
      if (counter === seconds) {
        clearInterval(timer);
        bar.stop();
        resolve();
      }
    }, 1000);
  });
};

export async function loadFromFile(fileName: string) {
  const file = await fs.readFile(fileName, { encoding: "utf-8" });

  return file.split("\n").map((item) => item.trim()).filter(Boolean);
}
