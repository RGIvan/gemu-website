"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteAccountButtonProps {
  userId: string;
}

export default function DeleteAccountButton({
  userId,
}: DeleteAccountButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la cuenta");
      }

      toast.success("Cuenta eliminada correctamente");
      await signOut({ callbackUrl: "/" });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al eliminar la cuenta");
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#A1A1A1]">¿Estás seguro?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 text-sm text-white transition-all bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-4 py-2 text-sm border border-[#2E2E2E] rounded-md hover:bg-[#1F1F1F] transition-all"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 text-sm text-red-500 transition-all border border-red-600 rounded-md hover:bg-red-600 hover:text-white"
    >
      Eliminar mi cuenta
    </button>
  );
}
