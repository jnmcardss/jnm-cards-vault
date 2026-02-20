import { CollectionTable } from "../../components/collection-table";
import { AuthGuard } from "@/components/auth-guard";

export default function CollectionPage() {
  return (
    <AuthGuard>
      <CollectionTable />
    </AuthGuard>
  );
}
