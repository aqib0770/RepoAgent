import { toNextJsHandler } from "corsair";
import { corsair } from "@/app/lib/corsair";

export const { GET, POST, OPTIONS } = toNextJsHandler(corsair, {
  basePath: "/api/corsair",
});
