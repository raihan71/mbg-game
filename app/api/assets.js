import { assetResponse } from "../lib/assets.server";
export function loader({ request, params }) {
  return assetResponse(request, params.kind, params.id);
}
