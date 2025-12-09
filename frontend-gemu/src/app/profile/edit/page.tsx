import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import EditProfileForm from "@/components/account/EditProfileForm";

const EditProfilePage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    redirect("/login");
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { id: BigInt(session.user._id) },
  });

  if (!usuario) {
    redirect("/login");
  }

  const userData = {
    id: usuario.id.toString(),
    nombre: usuario.nombre || "",
    apellidos: usuario.apellidos || "",
    correo_electronico: usuario.correo_electronico,
    telefono: usuario.telefono || "",
    direccion: usuario.direccion || "",
  };

  return (
    <section className="max-w-md px-4 pt-12 mx-auto">
      <h1 className="mb-8 text-2xl font-bold">Editar perfil</h1>
      <EditProfileForm initialData={userData} />
    </section>
  );
};

export default EditProfilePage;
