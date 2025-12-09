"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserData {
  id: string;
  nombre: string;
  apellidos: string;
  correo_electronico: string;
  telefono: string;
  direccion: string;
}

export default function EditProfileForm({
  initialData,
}: {
  initialData: UserData;
}) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          correo_electronico: user.correo_electronico,
          telefono: user.telefono || null,
          direccion: user.direccion || null,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar el perfil");

      const updatedUser = await res.json();

      await update({
        ...session,
        user: {
          ...session?.user,
          name: `${updatedUser.nombre} ${updatedUser.apellidos}`,
          email: updatedUser.correo_electronico,
          phone: updatedUser.telefono,
          address: user.direccion || null,
        },
      });

      toast.success("¡Perfil actualizado con éxito!");
      router.push("/profile");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm text-[#A1A1A1] mb-1">Nombre</label>
        <input
          type="text"
          value={user.nombre}
          onChange={(e) => setUser({ ...user, nombre: e.target.value })}
          className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md text-[#EDEDED]"
        />
      </div>

      <div>
        <label className="block text-sm text-[#A1A1A1] mb-1">Apellidos</label>
        <input
          type="text"
          value={user.apellidos}
          onChange={(e) => setUser({ ...user, apellidos: e.target.value })}
          className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md text-[#EDEDED]"
        />
      </div>

      <div>
        <label className="block text-sm text-[#A1A1A1] mb-1">Correo</label>
        <input
          type="email"
          value={user.correo_electronico}
          onChange={(e) =>
            setUser({ ...user, correo_electronico: e.target.value })
          }
          className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md text-[#EDEDED]"
        />
      </div>

      <div>
        <label className="block text-sm text-[#A1A1A1] mb-1">Dirección</label>
        <input
          type="text"
          value={user.direccion}
          onChange={(e) => setUser({ ...user, direccion: e.target.value })}
          className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md text-[#EDEDED]"
        />
      </div>

      <div>
        <label className="block text-sm text-[#A1A1A1] mb-1">Teléfono</label>
        <input
          type="tel"
          value={user.telefono}
          onChange={(e) => setUser({ ...user, telefono: e.target.value })}
          className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#2E2E2E] rounded-md text-[#EDEDED]"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 h-10 bg-[#0072F5] text-white rounded-md hover:bg-[#0060d3] transition-all disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="flex-1 h-10 border border-[#2E2E2E] rounded-md hover:bg-[#1F1F1F] transition-all"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
