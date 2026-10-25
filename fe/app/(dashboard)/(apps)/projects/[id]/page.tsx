import { redirect } from "next/navigation";

export default async function ProjectIdPage(props: { params: Promise<{ id: string, lang: string }> }) {
    const { id, lang } = await props.params;
    redirect(`/${lang}/projects/${id}/overview`);
}
