import {redirect} from "next/navigation";

// The five-platform visual management experience is private to the authenticated BABTEK founder portal.
export default function PlatformPage(){
  redirect("/admin/platforms");
}
