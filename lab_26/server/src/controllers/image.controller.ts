import type { Request, Response, NextFunction } from "express";
import { runIndexingGraph, getIndexingGraphInfo } from "../graph/indexing-graph.js";
import { runSearchGraph, getSearchGraphInfo } from "../graph/search-graph.js";
import {
  getImageStorageService,
  type SavedImage,
} from "../services/image-storage.service.js";
import type { UploadImageResponse } from "../types/image-rag.types.js";

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let saved: SavedImage | null = null;

  try {
    if (!req.file) {
      res.status(400).json({ error: "Missing image file (field name: image)" });
      return;
    }

    const storage = getImageStorageService();
    saved = storage.saveUploadedFile(req.file);

    const result = await runIndexingGraph(saved);

    if (!result.ok) {
      storage.deleteFile(saved.storedFilename);
      saved = null;
      res.status(500).json({
        error: result.clientMessage,
        detail: result.error,
        errorCode: "INDEX_IMAGE_ERROR"
      });
      return;
    }

    const { index, storedRow } = result;

    const response: UploadImageResponse = {
      image: {
        id: storedRow.id,
        imageUrl: storedRow.image_url,
        title: storedRow.title ?? index.title,
        description: storedRow.description ?? index.description,
        tags: parseJsonArray(storedRow.tags),
        objects: parseJsonArray(storedRow.objects),
      },
    };

    res.status(201).json(response);
  } catch (err) {
    if (saved) {
      getImageStorageService().deleteFile(saved.storedFilename);
    }
    next(err);
  }
}

export async function searchImages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    if (!query.trim()) {
      res.status(400).json({ error: "Search query 'q' is required" });
      return;
    }

    const result = await runSearchGraph(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function healthCheck(_req: Request, res: Response): void {
  res.json({ ok: true });
}

export function graphInfo(_req: Request, res: Response): void {
  res.json({
    indexing: getIndexingGraphInfo(),
    search: getSearchGraphInfo(),
  });
}
