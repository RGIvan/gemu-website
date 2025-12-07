import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";

const ProfilePage = async () => {
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

  return (
    <section className="max-w-2xl pt-12 mx-auto">
      <h1 className="mb-8 text-2xl font-bold">Mi perfil</h1>

      <div className="bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-[#A1A1A1] mb-1">Nombre</label>
            <p className="text-[#EDEDED]">{usuario.nombre || "-"}</p>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1A1] mb-1">
              Apellidos
            </label>
            <p className="text-[#EDEDED]">{usuario.apellidos || "-"}</p>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1A1] mb-1">
              Username
            </label>
            <p className="text-[#EDEDED]">{usuario.username || "-"}</p>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1A1] mb-1">Email</label>
            <p className="text-[#EDEDED]">{usuario.correo_electronico}</p>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1A1] mb-1">
              Teléfono
            </label>
            <p className="text-[#EDEDED]">{usuario.telefono || "-"}</p>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1A1] mb-1">
              Dirección
            </label>
            <p className="text-[#EDEDED]">{usuario.direccion || "-"}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
