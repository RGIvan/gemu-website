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
  apellidos: string;
  correo_electronico: string;
  telefono: string;
}

export default function EditProfile() {
  const { data: session, update } = useSession();
  const [user, setUser] = useState<UserProfile>({
    nombre: "",
    apellidos: "",
    correo_electronico: "",
    telefono: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del usuario desde la BD
  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?._id) return;

      try {
        const res = await fetch(`/api/user/${session.user._id}`);
        if (res.ok) {
          const userData = await res.json();
          setUser({
            nombre: userData.nombre || "",
            apellidos: userData.apellidos || "",
            correo_electronico: userData.correo_electronico || "",
            telefono: userData.telefono || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
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
          apellidos: user.apellidos,
          correo_electronico: user.correo_electronico,
          telefono: user.telefono || null,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar el perfil");

      const updatedUser = await res.json();

      // Actualiza la sesión localmente
      await update({
        ...session,
        user: {
          ...session.user,
          name: `${updatedUser.nombre} ${updatedUser.apellidos}`,
          email: updatedUser.correo_electronico,
          phone: updatedUser.telefono,
        },
      });

      toast.success("Perfil actualizado con éxito!");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center justify-center py-8">
          <span>Cargando...</span>
        </div>
      </DialogContent>
    );
  }

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
          <Label htmlFor="apellidos" className="text-right">
            Apellidos
          </Label>
          <Input
            id="apellidos"
            value={user.apellidos}
            onChange={(e) => setUser({ ...user, apellidos: e.target.value })}
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
            value={user.telefono}
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
