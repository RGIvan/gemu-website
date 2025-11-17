"use client";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserProfile {
  nombre: string;
  correo_electronico: string;
  telefono?: string | null;
}

export default function EditProfile() {
  const { data: session, update } = useSession();
  const [user, setUser] = useState<UserProfile>({
    nombre: "",
    correo_electronico: "",
    telefono: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Llenar los campos del formulario con los datos de la sesión
  useEffect(() => {
    if (session?.user) {
      setUser({
        nombre: session.user.name || "",
        correo_electronico: session.user.email || "",
        telefono: session.user.phone || "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?._id) {
      toast.error("Usuario no encontrado en la sesión");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user._id,
          nombre: user.nombre,
          correo_electronico: user.correo_electronico,
          telefono: user.telefono || null,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar el perfil");

      const updatedUser = await res.json();

      // Actualiza la sesión localmente
      await update({
        ...session.user,
        name: updatedUser.nombre,
        email: updatedUser.correo_electronico,
        phone: updatedUser.telefono,
      });

      toast.success("Perfil actualizado con éxito!");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Editar perfil</DialogTitle>
        <DialogDescription>
          Cambios en la información de tu perfil.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="nombre" className="text-right">
            Nombre
          </Label>
          <Input
            id="nombre"
            value={user.nombre}
            onChange={(e) => setUser({ ...user, nombre: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="correo_electronico" className="text-right">
            Correo
          </Label>
          <Input
            id="correo_electronico"
            value={user.correo_electronico}
            disabled={!!session?.user?.image}
            onChange={(e) =>
              setUser({ ...user, correo_electronico: e.target.value })
            }
            className="col-span-3"
          />
        </div>

        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="telefono" className="text-right">
            Teléfono
          </Label>
          <Input
            id="telefono"
            value={user.telefono || ""}
            onChange={(e) => setUser({ ...user, telefono: e.target.value })}
            className="col-span-3"
          />
        </div>
      </div>

      <DialogFooter>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-sm min-w-[160px] max-w-[160px] h-[40px] px-[10px] rounded-md border border-solid border-[#2E2E2E] transition-all hover:bg-[#1F1F1F] hover:border-[#454545]"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}
