import { z } from "zod";
import {
  listUsers,
  getUserById,
  listAccounts,
  getAccountById,
  getAccountsByOwnerId,
} from "./data.js";

function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function errorResult(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}

export function registerTools(server) {
  server.registerTool(
    "get_users",
    {
      title: "Get Users",
      description:
        "Access the users dummy dataset. Omit id to list all users, or pass an id to get a single user.",
      inputSchema: {
        id: z
          .string()
          .optional()
          .describe("User id to look up, e.g. U001. Omit to list every user."),
      },
    },
    async ({ id }) => {
      if (!id) {
        return textResult(await listUsers());
      }
      const user = await getUserById(id);
      if (!user) {
        return errorResult(`No user found with id "${id}".`);
      }
      return textResult(user);
    }
  );

  server.registerTool(
    "get_bank_accounts",
    {
      title: "Get Bank Accounts",
      description:
        "Access the bank accounts dummy dataset. Omit both filters to list every account, pass accountId for a single account, or userId to list a user's accounts.",
      inputSchema: {
        accountId: z
          .string()
          .optional()
          .describe("Account id to look up, e.g. ACC-1001."),
        userId: z
          .string()
          .optional()
          .describe("Owner user id to list accounts for, e.g. U001."),
      },
    },
    async ({ accountId, userId }) => {
      if (accountId) {
        const account = await getAccountById(accountId);
        if (!account) {
          return errorResult(`No account found with id "${accountId}".`);
        }
        return textResult(account);
      }
      if (userId) {
        return textResult(await getAccountsByOwnerId(userId));
      }
      return textResult(await listAccounts());
    }
  );
}
