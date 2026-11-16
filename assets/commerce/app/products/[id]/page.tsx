import { Shop } from "@/components/Shop";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <Shop productId={(await params).id} />; }
