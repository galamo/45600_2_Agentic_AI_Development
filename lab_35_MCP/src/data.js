import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

async function loadJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function listUsers() {
  const { users } = await loadJson("users.json");
  return users;
}

export async function getUserById(id) {
  const users = await listUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function listAccounts() {
  const { accounts } = await loadJson("bank_accounts.json");
  return accounts;
}

export async function getAccountById(accountId) {
  const accounts = await listAccounts();
  return accounts.find((account) => account.account_id === accountId) ?? null;
}

export async function getAccountsByOwnerId(ownerId) {
  const accounts = await listAccounts();
  return accounts.filter((account) => account.owner_id === ownerId);
}
