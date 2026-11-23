import { authorizedEditor } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/cms/http";
import { saveSchema } from "@/lib/cms/schema";
import { isProductId } from "@/content/products";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:"Invalid origin."},{status:403});
  const editor = await authorizedEditor();
  if (!editor) return Response.json({error:"Your editor session expired. Sign in again before saving."},{status:401});
  const body = await request.text();
  if (body.length > 300_000) return Response.json({error:"This article is too large."},{status:413});
  let input;
  try { input = saveSchema.parse(JSON.parse(body)); }
  catch { return Response.json({error:"Check the title, web address, date, and article fields."},{status:400}); }
  if (!input.document.products.every(isProductId)) return Response.json({error:"One of the selected products is unavailable."},{status:400});
  if (input.action === "publish" && !input.document.body.trim()) return Response.json({error:"Write your article before publishing."},{status:400});
  if (input.action === "publish" && input.document.cover && !input.document.coverAlt.trim()) return Response.json({error:"Add a cover photo description before publishing."},{status:400});
  const {data,error} = await editor.client.rpc("save_article",{
    p_id:input.id,p_document:input.document,p_revision:input.revision,p_action:input.action,
  });
  if (error) {
    const conflict = error.code === "40001";
    return Response.json({error:conflict ? "Another tab saved this article. Copy your changes, then reload before saving again." : error.code === "23505" ? "That web address belongs to another article. Choose a different one." : "The article could not be saved. Your changes are still in the editor. Please try again."},{status:conflict || error.code === "23505" ? 409 : 500});
  }
  return Response.json({draft:data});
}
