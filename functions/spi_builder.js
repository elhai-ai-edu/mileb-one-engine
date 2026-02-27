import { buildSPI } from "./spi_builder.js";
import fs from "fs";
import path from "path";

const kernelPath = path.resolve(process.cwd(), "kernel.txt");
const kernelText = fs.existsSync(kernelPath) ? fs.readFileSync(kernelPath, "utf8") : "";

export async function handler(event) {
  const { answers = {} } = JSON.parse(event.body || "{}");

  // כאן תטען config.json ותפתור policy לפי answers.function / channel
  // const engine = config.engine || {};
  // const policy = config.functionPolicies?.[answers.function] || {};

  const engine = {};  // זמני
  const policy = {};  // זמני

  const { spi, systemPrompt } = buildSPI({ answers, engine, policy, kernelText });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spi, systemPrompt }),
  };
}
