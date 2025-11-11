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
  name: string;
  email: string;
  phone?: string | null;
}

export default function EditProfile() {
  const { data: session, update } = useSession();
  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?._id) {
      toast.error("User not found");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/usuario/actualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user._id, ...user }),
      });
      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = await res.json();
      // Actualiza la sesión localmente
      await update({ ...session.user, ...updatedUser });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            value={user.email}
            disabled={!!session?.user?.image}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="phone" className="text-right">
            Phone
          </Label>
          <Input
            id="phone"
            value={user.phone || ""}
            onChange={(e) => setUser({ ...user, phone: e.target.value })}
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
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}
